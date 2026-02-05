import express from "express";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { requireWorkerAuth } from "./auth.js";
import { ensureDir } from "./utils.js";
import { probeFile } from "./probe.js";
import { testS3, uploadToS3, downloadFromS3 } from "./storage/s3.js";
import { postJobUpdate } from "./callback.js";
import { brandVideo } from "./process/video.js";
import { brandPdf } from "./process/pdf.js";
import { brandImage } from "./process/image.js";

const app = express();
app.use(express.json({ limit: "2mb" }));

app.get("/v1/health", (_req, res) => res.json({ ok: true }));

app.post("/v1/storage/test", requireWorkerAuth, async (req, res) => {
  try {
    const { destination } = req.body;
    if (!destination?.provider) return res.status(400).json({ ok: false, message: "Missing provider" });

    if (destination.provider === "s3" || destination.provider === "r2") {
      await testS3(destination);
      return res.json({ ok: true });
    }

    return res.status(400).json({ ok: false, message: `Unsupported provider: ${destination.provider}` });
  } catch (e) {
    return res.status(400).json({ ok: false, message: e.message });
  }
});

app.post("/v1/media/probe", requireWorkerAuth, async (req, res) => {
  try {
    const { temp_path, mime_type } = req.body;
    if (!temp_path) return res.status(400).json({ ok: false, message: "Missing temp_path" });

    const meta = await probeFile(temp_path, mime_type);
    return res.json({ ok: true, meta });
  } catch (e) {
    return res.status(400).json({ ok: false, message: e.message });
  }
});

app.post("/v1/jobs/start", requireWorkerAuth, async (req, res) => {
  const payload = req.body;
  if (!payload?.job_id) return res.status(400).json({ accepted: false, message: "Missing job_id" });

  processJob(payload).catch(() => {});
  return res.json({ accepted: true });
});

async function processJob(payload) {
  const {
    job_id,
    job_type,
    inputs,
    brand,
    output,
    callback
  } = normalizePayload(payload);

  const callbackUrl = callback?.url;
  const internalKey = process.env.BRANDRR_INTERNAL_KEY;

  const tmpRoot = path.join(os.tmpdir(), `brandrr-${job_id}`);
  await ensureDir(tmpRoot);

  const safeCallback = async (body) => {
    if (!callbackUrl) return;
    await postJobUpdate({ callbackUrl, internalKey, body });
  };

  try {
    await safeCallback({ job_id, status: "running", progress: 5 });

    const logoPath = brand?.logo_url_temp;
    if (!logoPath) throw new Error("Missing brand.logo_url_temp");

    const dest = output.destination;
    if (!dest?.provider) throw new Error("Missing output.destination");

    const exports = [];
    let actual_pdf_pages = 0;
    let actual_video_minutes = 0;

    for (let i = 0; i < inputs.length; i++) {
      const inItem = inputs[i];
      const inPath = inItem.temp_path;
      const ext = inferExt(inItem.filename, inItem.mime_type, job_type);
      const outLocal = path.join(tmpRoot, `out-${i}.${ext}`);

      if (job_type === "video_brand") {
        await brandVideo({ inputPath: inPath, logoPath, outputPath: outLocal });
        actual_video_minutes += Number(inItem.meta?.duration_minutes || 0);
      } else if (job_type === "pdf_brand") {
        const contactText = formatContact(brand?.contact);
        await brandPdf({ inputPath: inPath, logoPath, outputPath: outLocal, contactText });
        actual_pdf_pages += Number(inItem.meta?.page_count || 0);
      } else {
        await brandImage({ inputPath: inPath, logoPath, outputPath: outLocal });
      }

      const key = makeOutputKey(dest.base_path, job_id, inItem.filename, ext);
      if (dest.provider === "s3" || dest.provider === "r2") {
        await uploadToS3(dest, outLocal, key, contentTypeFor(ext));
        exports.push({
          type: job_type === "pdf_brand" ? "pdf" : (job_type === "video_brand" ? "video" : "image"),
          filename: `branded-${inItem.filename}`,
          storage_path: key,
          mime_type: contentTypeFor(ext),
          size_bytes: (await fs.stat(outLocal)).size
        });
      } else {
        throw new Error(`Unsupported destination provider: ${dest.provider}`);
      }

      const prog = Math.round(((i + 1) / inputs.length) * 90) + 5;
      await safeCallback({ job_id, status: "running", progress: Math.min(prog, 95) });
    }

    await safeCallback({
      job_id,
      status: "succeeded",
      progress: 100,
      exports,
      actual_pdf_pages,
      actual_video_minutes
    });

  } catch (e) {
    await safeCallback({ job_id, status: "failed", progress: 100, error_message: e.message });
  }
}

function normalizePayload(payload) {
  return {
    ...payload,
    callback: payload.callback || { url: payload.callback_url || process.env.BRANDRR_CALLBACK_URL }
  };
}

function formatContact(contact = {}) {
  const parts = [];
  if (contact.phone) parts.push(contact.phone);
  if (contact.email) parts.push(contact.email);
  if (contact.website) parts.push(contact.website);
  return parts.join(" • ");
}

function inferExt(filename, mime, jobType) {
  if (jobType === "pdf_brand") return "pdf";
  if (jobType === "video_brand") return "mp4";
  if (mime === "image/png") return "png";
  return "jpg";
}

function contentTypeFor(ext) {
  if (ext === "pdf") return "application/pdf";
  if (ext === "mp4") return "video/mp4";
  if (ext === "png") return "image/png";
  return "image/jpeg";
}

function makeOutputKey(basePath, jobId, originalName, ext) {
  const safeBase = (basePath || "brandrr/").replace(/^\//, "").replace(/\/?$/, "/");
  const safeName = (originalName || `file.${ext}`).replace(/[^\w.\-]+/g, "_");
  return `${safeBase}jobs/${jobId}/${safeName.replace(/\.\w+$/, "")}-branded.${ext}`;
}

const port = Number(process.env.PORT || 10000);
app.listen(port, () => console.log(`Brandrr worker listening on ${port}`));
