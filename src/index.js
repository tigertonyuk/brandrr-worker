import express from "express";
import path from "path";
import os from "os";
import fs from "fs/promises";
import fetch from "node-fetch";
import { requireWorkerAuth } from "./auth.js";
import { probeFile } from "./probe.js";
import { testS3 } from "./s3.js";
import { downloadToFile, ensureDir } from "./utils.js";
import { brandImage } from "./processors/image.js";
import { brandPdf } from "./processors/pdf.js";
import { brandVideo } from "./processors/video.js";
import { Upload } from "@aws-sdk/lib-storage";
import { S3Client } from "@aws-sdk/client-s3";
import mime from "mime-types";

const app = express();
app.use(express.json({ limit: "50mb" }));

// Health check (public)
app.get("/v1/health", (_req, res) => {
  res.json({ ok: true, status: "UP" });
});

// Protected routes
app.post("/v1/storage/test", requireWorkerAuth, async (req, res) => {
  try {
    const { destination } = req.body;
    await testS3(destination);
    res.json({ ok: true });
  } catch (err) {
    console.error("Storage test failed:", err);
    res.status(400).json({ ok: false, message: err.message });
  }
});

app.post("/v1/media/probe", requireWorkerAuth, async (req, res) => {
  try {
    const { temp_url, mime_type } = req.body;
    const result = await probeFile({ tempUrl: temp_url, mimeType: mime_type });
    res.json({ ok: true, meta: result });
  } catch (err) {
    console.error("Probe failed:", err);
    res.status(400).json({ ok: false, message: err.message });
  }
});

app.post("/v1/jobs/start", requireWorkerAuth, async (req, res) => {
  const payload = req.body;
  const { job_id, job_type, inputs, brand, output, callback } = payload;

  console.log(`Job ${job_id} received: ${job_type}`);

  // Respond immediately - processing happens in background
  res.json({ accepted: true });

  // Background processing
  processJob({ job_id, job_type, inputs, brand, output, callback }).catch((err) => {
    console.error(`Job ${job_id} failed:`, err);
  });
});

async function processJob({ job_id, job_type, inputs, brand, output, callback }) {
  const workDir = path.join(os.tmpdir(), `brandrr-${job_id}`);
  const internalKey = process.env.BRANDRR_INTERNAL_KEY;

  const sendUpdate = async (status, progress, extra = {}) => {
    try {
      await fetch(callback.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${internalKey}`,
        },
        body: JSON.stringify({ job_id, status, progress, ...extra }),
      });
    } catch (err) {
      console.error(`Callback failed for ${job_id}:`, err.message);
    }
  };

  try {
    await ensureDir(workDir);
    await sendUpdate("running", 10);

    // Download logo
    const logoPath = path.join(workDir, "logo.png");
    await downloadToFile(brand.logo_url_temp, logoPath);
    await sendUpdate("running", 20);

    const exports = [];
    const totalInputs = inputs.length;

    for (let i = 0; i < totalInputs; i++) {
      const input = inputs[i];
      const inputPath = path.join(workDir, `input-${i}${path.extname(input.filename)}`);
      const outputExt = job_type === "video_brand" ? ".mp4" : job_type === "pdf_brand" ? ".pdf" : ".png";
      const outputFilename = input.filename.replace(/\.[^.]+$/, `-branded${outputExt}`);
      const outputPath = path.join(workDir, outputFilename);

      await downloadToFile(input.temp_url, inputPath);

      // Process based on job type
      if (job_type === "image_brand") {
        await brandImage({ inputPath, logoPath, outputPath });
      } else if (job_type === "pdf_brand") {
        await brandPdf({ inputPath, logoPath, outputPath });
      } else if (job_type === "video_brand") {
        await brandVideo({ inputPath, logoPath, outputPath });
      }

      // Upload to user's storage
      const storagePath = await uploadToStorage(outputPath, outputFilename, output.destination);

      const stats = await fs.stat(outputPath);
      exports.push({
        type: job_type.replace("_brand", ""),
        filename: outputFilename,
        storage_path: storagePath,
        mime_type: mime.lookup(outputPath) || "application/octet-stream",
        size_bytes: stats.size,
      });

      const progress = 30 + Math.floor(((i + 1) / totalInputs) * 60);
      await sendUpdate("running", progress);
    }

    await sendUpdate("succeeded", 100, { exports });
    console.log(`Job ${job_id} completed successfully`);
  } catch (err) {
    console.error(`Job ${job_id} error:`, err);
    await sendUpdate("failed", 0, { error_message: err.message });
  } finally {
    // Cleanup
    try {
      await fs.rm(workDir, { recursive: true, force: true });
    } catch {}
  }
}

async function uploadToStorage(localPath, filename, destination) {
  const { bucket, region, endpoint_url, access_key_id, secret_access_key, base_path } = destination;

  const client = new S3Client({
    endpoint: endpoint_url,
    region: region || "auto",
    credentials: { accessKeyId: access_key_id, secretAccessKey: secret_access_key },
    forcePathStyle: true,
  });

  const key = base_path ? `${base_path.replace(/\/$/, "")}/${filename}` : filename;
  const fileStream = await fs.readFile(localPath);

  const upload = new Upload({
    client,
    params: {
      Bucket: bucket,
      Key: key,
      Body: fileStream,
      ContentType: mime.lookup(localPath) || "application/octet-stream",
    },
  });

  await upload.done();
  return key;
}

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Brandrr worker listening on port ${PORT}`);
});
