import express from "express";
import path from "path";
import os from "os";
import fs from "fs/promises";
import fetch from "node-fetch";

import { requireWorkerAuth } from "./auth.js";
import { run, ensureDir, downloadToFile } from "./utils.js";
import { testS3 } from "./s3.js";
import { probeFile } from "./probe.js";
import { brandImage } from "./processors/image.js";
import { brandPdf } from "./processors/pdf.js";
import { brandVideo } from "./processors/video.js";
import { brandVideoWrapper } from "./processors/video-wrapper.js";
import { uploadOutput } from "./upload.js";

const app = express();
app.use(express.json({ limit: "50mb" }));

// ─── Health ────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/v1/health", (_req, res) => res.json({ ok: true }));

// ─── Test Storage ──────────────────────────────────────────────────
async function handleTestStorage(req, res) {
  try {
    const dest = req.body?.destination;
    if (!dest) return res.status(400).json({ ok: false, message: "Missing destination" });

    if (dest.provider === "google_drive") {
      return res.json({ ok: true, message: "Google Drive credentials accepted" });
    }

    await testS3(dest);
    res.json({ ok: true, message: "Storage connection successful" });
  } catch (err) {
    console.error("[test-storage]", err);
    res.status(400).json({ ok: false, message: err.message });
  }
}
app.post("/test-storage", requireWorkerAuth, handleTestStorage);
app.post("/v1/test-storage", requireWorkerAuth, handleTestStorage);
app.post("/storage/test", requireWorkerAuth, handleTestStorage);
app.post("/v1/storage/test", requireWorkerAuth, handleTestStorage);

// ─── Probe ─────────────────────────────────────────────────────────
async function handleProbe(req, res) {
  try {
    const { temp_path, temp_url, mime_type } = req.body || {};
    const url = temp_url || temp_path;
    if (!url) return res.status(400).json({ ok: false, message: "Missing temp_url" });

    const result = await probeFile({ tempUrl: url, mimeType: mime_type });
    res.json({ ok: true, meta: result });
  } catch (err) {
    console.error("[probe]", err);
    res.status(500).json({ ok: false, message: err.message });
  }
}
app.post("/probe", requireWorkerAuth, handleProbe);
app.post("/v1/probe", requireWorkerAuth, handleProbe);
app.post("/media/probe", requireWorkerAuth, handleProbe);
app.post("/v1/media/probe", requireWorkerAuth, handleProbe);

// ─── Start Job ─────────────────────────────────────────────────────
async function handleStartJob(req, res) {
  const payload = req.body;

  if (!payload?.job_id) {
    return res.status(400).json({ accepted: false, message: "Missing job_id" });
  }

  // Acknowledge immediately — processing happens asynchronously
  res.json({ accepted: true, message: "Job accepted" });

  // Process in background
  processJob(payload).catch((err) => {
    console.error(`[job ${payload.job_id}] Fatal error:`, err);
  });
}
app.post("/start-job", requireWorkerAuth, handleStartJob);
app.post("/v1/start-job", requireWorkerAuth, handleStartJob);
app.post("/jobs/start", requireWorkerAuth, handleStartJob);
app.post("/v1/jobs/start", requireWorkerAuth, handleStartJob);

// ─── Job Processor ─────────────────────────────────────────────────
async function processJob(payload) {
  const jobId = payload.job_id;
  const jobType = payload.job_type;
  const callbackUrl = payload.callback?.url;
  const callbackKey = process.env.BRANDRR_INTERNAL_KEY || "";
  const jobDir = path.join(os.tmpdir(), `brandrr-job-${jobId}`);

  // Detect wrapper config from payload
  const wrapperConfig = payload.wrapper_config || payload.wrapper || undefined;
  const isWrapperJob = jobType === "video_brand" && wrapperConfig && typeof wrapperConfig === "object" && wrapperConfig.elements;

  console.log(`[job ${jobId}] Starting ${jobType} job${isWrapperJob ? " (WRAPPER)" : ""}`);

  try {
    await ensureDir(jobDir);

    // Report "processing" status
    await reportProgress(callbackUrl, callbackKey, jobId, "processing", 10);

    const inputs = payload.inputs || [];
    if (inputs.length === 0) {
      throw new Error("No input files provided");
    }

    const brand = payload.brand || {};
    const destination = payload.output?.destination;

    if (!destination) {
      throw new Error("No output destination configured");
    }

    const results = [];

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const inputUrl = input.temp_url || input.temp_path;
      const inputFilename = input.filename || `input-${i}`;
      const mimeType = input.mime_type || "application/octet-stream";

      console.log(`[job ${jobId}] Processing input ${i + 1}/${inputs.length}: ${inputFilename}`);

      // Download input file
      const ext = path.extname(inputFilename) || getExtForMime(mimeType);
      const inputPath = path.join(jobDir, `input-${i}${ext}`);
      await downloadToFile(inputUrl, inputPath);

      await reportProgress(callbackUrl, callbackKey, jobId, "processing", 20 + Math.round((i / inputs.length) * 50));

      // Download logo if needed
      const logoUrl = brand.logo_url_temp;
      let logoPath = null;
      if ((brand.logo_enabled ?? true) && logoUrl) {
        logoPath = path.join(jobDir, "logo.png");
        try {
          await downloadToFile(logoUrl, logoPath);
        } catch (logoErr) {
          console.warn(`[job ${jobId}] Failed to download logo, continuing without:`, logoErr.message);
          logoPath = null;
        }
      }

      // Determine output filename and path
      const outputExt = jobType === "video_brand" ? ".mp4" : ext;
      const outputFilename = `branded-${jobId}-${i}${outputExt}`;
      const outputPath = path.join(jobDir, outputFilename);

      // Process based on job type
      switch (jobType) {
        case "image_brand":
          if (!logoPath) throw new Error("Logo is required for image branding");
          await brandImage({
            inputPath,
            logoPath,
            outputPath,
            logoSize: brand.logo_size || "medium",
            logoPosition: brand.logo_position || "bottom-right",
          });
          break;

        case "pdf_brand":
          if (!logoPath) throw new Error("Logo is required for PDF branding");
          await brandPdf({
            inputPath,
            logoPath,
            outputPath,
          });
          break;

        case "video_brand":
          if (isWrapperJob) {
            // ── WRAPPER JOB → dedicated video-wrapper.js processor ──
            console.log(`[job ${jobId}] Routing to video-wrapper.js (isolated wrapper pipeline)`);
            await brandVideoWrapper({
              inputPath,
              logoPath,
              outputPath,
              jobDir,
              logoSize: brand.logo_size || "medium",
              logoPosition: brand.logo_position || "bottom-right",
              logoTargetHeightPx: brand.logo_target_height_px,
              logoEnabled: brand.logo_enabled ?? true,
              fontFamily: brand.fontFamily,
              wrapper: wrapperConfig,
            });
          } else {
            // ── STANDARD VIDEO JOB → video.js processor ──
            console.log(`[job ${jobId}] Routing to video.js (standard branding pipeline)`);
            await brandVideo({
              inputPath,
              logoPath,
              outputPath,
              jobDir,
              logoSize: brand.logo_size || "medium",
              logoPosition: brand.logo_position || "bottom-right",
              logoTargetHeightPx: brand.logo_target_height_px,
              logoEnabled: brand.logo_enabled ?? true,
              brandName: brand.name,
              primaryColor: brand.primary_color,
              tagline: brand.tagline,
              contact: brand.contact,
              social: brand.social,
              elements: brand.elements,
              fontFamily: brand.fontFamily,
              stickers: brand.stickers,
              stickerMeta: brand.stickerMeta,
              templateFamilyId: payload.template_family_id || payload.templateFamilyId,
              templateCustomFields: payload.templateCustomFields || payload.template_custom_fields || {},
              copyrightText: brand.copyright_text || brand.copyrightText || payload.copyright_text || payload.copyrightText || undefined,
            });
          }
          break;

        default:
          throw new Error(`Unsupported job type: ${jobType}`);
      }

      await reportProgress(callbackUrl, callbackKey, jobId, "processing", 70 + Math.round((i / inputs.length) * 20));

      // Upload output
      const uploadMime = jobType === "video_brand" ? "video/mp4" : mimeType;
      const { storagePath, signedUrl } = await uploadOutput(
        destination,
        outputPath,
        outputFilename,
        uploadMime
      );

      results.push({
        upload_id: input.upload_id,
        filename: outputFilename,
        storage_path: storagePath,
        signed_url: signedUrl,
        mime_type: uploadMime,
      });

      console.log(`[job ${jobId}] Uploaded ${outputFilename} -> ${storagePath}`);
    }

    // Report completion
    await reportProgress(callbackUrl, callbackKey, jobId, "completed", 100, {
      exports: results,
    });

    console.log(`[job ${jobId}] Completed successfully (${results.length} outputs)`);
  } catch (err) {
    console.error(`[job ${jobId}] Failed:`, err);
    await reportProgress(callbackUrl, callbackKey, jobId, "failed", 0, {
      error_message: err.message || String(err),
    });
  } finally {
    // Clean up temp directory
    try {
      await fs.rm(jobDir, { recursive: true, force: true });
      console.log(`[job ${jobId}] Cleaned up ${jobDir}`);
    } catch (cleanupErr) {
      console.warn(`[job ${jobId}] Cleanup warning:`, cleanupErr.message);
    }
  }
}

// ─── Helpers ───────────────────────────────────────────────────────

/**
 * Report job progress via callback URL.
 */
async function reportProgress(callbackUrl, callbackKey, jobId, status, progress, extra = {}) {
  if (!callbackUrl) return;

  try {
    const body = {
      job_id: jobId,
      status,
      progress,
      ...extra,
    };

    await fetch(callbackUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${callbackKey}`,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.warn(`[job ${jobId}] Callback failed (${status}):`, err.message);
  }
}

/**
 * Get a file extension for a MIME type.
 */
function getExtForMime(mime) {
  const map = {
    "video/mp4": ".mp4",
    "video/quicktime": ".mov",
    "video/webm": ".webm",
    "video/x-msvideo": ".avi",
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  };
  return map[mime] || ".bin";
}

// ─── Start Server ──────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Brandrr worker listening on port ${PORT}`);
});
