import path from "path"; import os from "os";
import { run, ensureDir, downloadToFile } from "./utils.js";
export async function probeFile({ tempUrl, mimeType }){
  const p = path.join(os.tmpdir(), `probe-${Date.now()}`);
  await ensureDir(p);
  const f = path.join(p, "input");
  await downloadToFile(tempUrl, f);
  if(mimeType==="application/pdf"){ const o=await run("pdfinfo",[f]); return {kind:"pdf"}; }
  if(mimeType?.startsWith("video/")){ await run("ffprobe",[f]); return {kind:"video"}; }
  return {kind:"image"};
}