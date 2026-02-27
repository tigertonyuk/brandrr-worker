import express from "express";
import fetch from "node-fetch";
import path from "path";
import os from "os";
import fs from "fs/promises";
import mime from "mime-types";
import { requireWorkerAuth } from "./auth.js";
import { probeFile } from "./probe.js";
import { testS3 } from "./s3.js";
import { brandImage } from "./processors/image.js";
import { brandPdf } from "./processors/pdf.js";
import { brandVideo } from "./processors/video.js";
import { downloadToFile, ensureDir } from "./utils.js";
import { uploadOutput } from "./upload.js";

const app = express();
app.use(express.json({ limit: "50mb" }));

// Health check
app.get("/v1/health", (_req, res) => res.json({ ok: true, status: "UP" }));

// Storage test
app.post("/v1/storage/test", requireWorkerAuth, async (req, res) => {
  try {
    await testS3(req.body.destination);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ ok: false, message: e.message });
  }
});

// Media probe
app.post("/v1/media/probe", requireWorkerAuth, async (req, res) => {
  try {
    const result = await probeFile({
      tempUrl: req.body.temp_url || req.body.temp_path,
      mimeType: req.body.mime_type,
    });
    res.json({ ok: true, meta: result });
  } catch (e) {
    res.json({ ok: false, message: e.message });
  }
});

// Start job (async)
app.post("/v1/jobs/start", requireWorkerAuth, (req, res) => {
  res.json({ accepted: true });
  processJob(req.body).catch((err) =>
    console.error(`[Job ${req.body?.job_id}] Unhandled error:`, err.message)
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Job processor
// ─────────────────────────────────────────────────────────────────────────────

async function processJob(payload) {
  const { job_id, job_type, inputs, brand, output, callback } = payload;
  const tmpDir = path.join(os.tmpdir(), `brandrr-${job_id}`);
  const internalKey = process.env.BRANDRR_INTERNAL_KEY;

  // Helper to send status updates
  async function sendUpdate(status, progress, extra = {}) {
    const body = { job_id, status, progress, ...extra };
    console.log(`[Job ${job_id}] -> ${status} ${progress}%`);
    try {
      await fetch(callback.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${internalKey}`,
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      console.error(`[Job ${job_id}] Callback failed:`, err.message);
    }
  }

  try {
    await ensureDir(tmpDir);
    await sendUpdate("running", 5);

    // 1️⃣ Download input files
    const inputFiles = [];
    for (let i = 0; i < inputs.length; i++) {
      const inp = inputs[i];
      const ext = path.extname(inp.filename) || ".bin";
      const localInput = path.join(tmpDir, `input-${i}${ext}`);
      await downloadToFile(inp.temp_url, localInput);
      inputFiles.push({ ...inp, localPath: localInput });
      await sendUpdate("running", 10 + Math.round((i / inputs.length) * 10));
    }

    // 2️⃣ Download logo (only if enabled and URL provided)
    let logoPath = null;
    const logoEnabled = brand?.logo_enabled ?? true;
    const logoUrl = brand?.logo_url_temp;
    if (logoEnabled && logoUrl) {
      logoPath = path.join(tmpDir, "logo.png");
      await downloadToFile(logoUrl, logoPath);
    }

    await sendUpdate("running", 25);

    // 3️⃣ Process each input
    const outputFiles = [];
    for (let i = 0; i < inputFiles.length; i++) {
      const inp = inputFiles[i];
      const outName = `branded-${inp.filename}`;
      const outputPath = path.join(tmpDir, outName);

      if (job_type === "image_brand") {
        await brandImage({ inputPath: inp.localPath, logoPath, outputPath });
      } else if (job_type === "pdf_brand") {
        await brandPdf({ inputPath: inp.localPath, logoPath, outputPath });
      } else if (job_type === "video_brand") {
        await brandVideo({
          inputPath: inp.localPath,
          logoPath,
          outputPath,
          jobDir: tmpDir,
          logoSize: brand?.logo_size || "medium",
          logoPosition: brand?.logo_position || "bottom-right",
          logoTargetHeightPx: brand?.logo_target_height_px,
          logoEnabled,
          brandName: brand?.name,
          primaryColor: brand?.primary_color,
          tagline: brand?.tagline,
          contact: brand?.contact,
          social: brand?.social,
          elements: brand?.elements,
          fontFamily: brand?.fontFamily,
          stickers: brand?.stickers,
          stickerMeta: brand?.stickerMeta,
        });
      } else {
        throw new Error(`Unknown job_type: ${job_type}`);
      }

      outputFiles.push({ localPath: outputPath, filename: outName });
      await sendUpdate(
        "running",
        30 + Math.round(((i + 1) / inputFiles.length) * 40)
      );
    }

    await sendUpdate("running", 75);

    // 4️⃣ Upload to BYO storage (unified — supports S3, R2, GDrive, etc.)
    const dest = output.destination;
    const exports = [];

    for (let i = 0; i < outputFiles.length; i++) {
      const outFile = outputFiles[i];
      const fileStat = await fs.stat(outFile.localPath);
      const mimeType =
        mime.lookup(outFile.filename) || "application/octet-stream";

      // Build the filename with job_id prefix
      const uploadFilename = dest.base_path
        ? `${job_id}/${outFile.filename}`
        : `${job_id}/${outFile.filename}`;

      // Use unified upload (routes to S3 or Google Drive automatically)
      const { storagePath, signedUrl } = await uploadOutput(
        dest,
        outFile.localPath,
        uploadFilename,
        mimeType
      );

      exports.push({
        type: job_type.replace("_brand", ""),
        filename: outFile.filename,
        storage_path: storagePath,
        mime_type: mimeType,
        size_bytes: fileStat.size,
        signed_url: signedUrl,
      });

      await sendUpdate(
        "running",
        80 + Math.round(((i + 1) / outputFiles.length) * 15)
      );
    }

    // 5️⃣ Final success callback
    await sendUpdate("succeeded", 100, { exports });
  } catch (err) {
    console.error(`[Job ${job_id}] Processing failed:`, err);
    await sendUpdate("failed", 0, { error_message: err.message });
  } finally {
    // Cleanup tmp folder
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch (_) {}
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Brandrr worker listening on port ${PORT}`);
});
