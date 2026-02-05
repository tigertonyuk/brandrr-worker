import { run } from "./utils.js";

export async function probeFile(localPath, mimeType) {
  if (mimeType === "application/pdf" || localPath.toLowerCase().endsWith(".pdf")) {
    const { out } = await run("pdfinfo", [localPath]);
    const match = out.match(/Pages:\s+(\d+)/);
    const page_count = match ? Number(match[1]) : null;
    return { kind: "pdf", page_count };
  }

  if (mimeType?.startsWith("video/") || /\.(mp4|mov|mkv|webm)$/i.test(localPath)) {
    const { out } = await run("ffprobe", [
      "-v", "error",
      "-select_streams", "v:0",
      "-show_entries", "stream=width,height,codec_name",
      "-show_entries", "format=duration,format_name",
      "-of", "json",
      localPath
    ]);

    const json = JSON.parse(out);
    const stream = json.streams?.[0] || {};
    const format = json.format || {};
    const duration_seconds = format.duration ? Number(format.duration) : null;

    return {
      kind: "video",
      width_px: stream.width ?? null,
      height_px: stream.height ?? null,
      codec: stream.codec_name ?? null,
      container: format.format_name ?? null,
      duration_minutes: duration_seconds != null ? Math.round((duration_seconds / 60) * 1000) / 1000 : null
    };
  }

  if (mimeType?.startsWith("image/") || /\.(png|jpg|jpeg|webp)$/i.test(localPath)) {
    const { out } = await run("ffprobe", [
      "-v", "error",
      "-select_streams", "v:0",
      "-show_entries", "stream=width,height",
      "-of", "json",
      localPath
    ]);
    const json = JSON.parse(out);
    const stream = json.streams?.[0] || {};
    return { kind: "image", width_px: stream.width ?? null, height_px: stream.height ?? null };
  }

  return { kind: "unknown" };
}
