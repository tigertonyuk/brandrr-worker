import express from "express";
import path from "path";
import os from "os";
import fetch from "node-fetch";

// --- local modules (same directory: src/) ---
import { requireWorkerAuth } from "./auth.js";
import { run, ensureDir, downloadToFile } from "./utils.js";
import { testS3 } from "./s3.js";
import { uploadOutput } from "./upload.js";
import { probeFile } from "./probe.js";

// --- processors (src/processors/) ---
import { brandVideo } from "./processors/video.js";
import { brandImage } from "./processors/image.js";
import { brandPdf } from "./processors/pdf.js";

const app = express();
app.use(express.json({ limit: "10mb" }));

// ──── Health ────────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ ok: true }));

// ──── Test Storage ──────────────────────────────────────────────────────────────
app.post("/test-storage", requireWorkerAuth, async (req, res) => {
  try {
    const dest = req.body.destination;
    if (!dest) return res.status(400).json({ ok: false, message: "Missing destination" });

    if (dest.provider === "google_drive") {
      // For Google Drive we just validate that the tokens exist
      if (!dest.oauth_access_token && !dest.oauth_refresh_token) {
        return res.json({ ok: false, message: "Missing Google Drive OAuth tokens" });
      }
      return res.json({ ok: true, message: "Google Drive credentials present" });
    }

    await testS3(dest);
    res.json({ ok: true, message: "Connection successful" });
  } catch (err) {
    console.error("[test-storage]", err.message);
    res.json({ ok: false, message: err.message });
  }
});

// ──── Probe ─────────────────────────────────────────────────────────────────────
app.post("/probe", requireWorkerAuth, async (req, res) => {
  try {
    const result = await probeFile({
      tempUrl: req.body.temp_url || req.body.tempUrl,
      mimeType: req.body.mime_type || req.body.mimeType,
    });
    res.json({ ok: true, meta: result });
  } catch (err) {
    console.error("[probe]", err.message);
    res.json({ ok: false, message: err.message });
  }
});

// ──── Start Job ─────────────────────────────────────────────────────────────────
app.post("/start-job", requireWorkerAuth, async (req, res) => {
  const payload = req.body;
  const jobId = payload.job_id;

  // Respond immediately so the caller doesn't time out
  res.json({ accepted: true });

  // Process asynchronously
  processJob(payload).catch((err) => {
    console.error(`[job:${jobId}] FATAL:`, err.message);
    reportCallback(payload, "failed", 0, err.message);
  });
});

// ──── Job processor ─────────────────────────────────────────────────────────────
async function processJob(payload) {
  const jobId = payload.job_id;
  const jobType = payload.job_type;
  const brand = payload.brand || {};
  const inputs = payload.inputs || [];
  const destination = payload.output?.destination;
  const callbackUrl = payload.callback?.url;

  if (!destination) throw new Error("No output destination configured");
  if (!inputs.length) throw new Error("No input files");

  const jobDir = path.join(os.tmpdir(), `brandrr-job-${jobId}-${Date.now()}`);
  await ensureDir(jobDir);

  try {
    // Report progress: started
    await reportCallback(payload, "processing", 5);

    // Download logo if enabled
    const logoUrl = brand.logo_url_temp;
    let logoPath = null;
    if ((brand.logo_enabled ?? true) && logoUrl) {
      logoPath = path.join(jobDir, "logo.png");
      await downloadToFile(logoUrl, logoPath);
    }

    const results = [];
    const totalInputs = inputs.length;

    for (let i = 0; i < totalInputs; i++) {
      const input = inputs[i];
      const inputPath = path.join(jobDir, `input-${i}-${input.filename}`);
      await downloadToFile(input.temp_url, inputPath);

      const ext = getOutputExtension(jobType, input.mime_type);
      const outputFilename = `branded-${jobId}-${i}${ext}`;
      const outputPath = path.join(jobDir, outputFilename);

      // Route to the correct processor
      if (jobType === "video_brand") {
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
          secondaryColor: brand.secondary_color,
          tagline: brand.tagline,
          contact: brand.contact,
          social: brand.social,
          elements: brand.elements,
          fontFamily: brand.fontFamily,
          stickers: brand.stickers,
          stickerMeta: brand.stickerMeta,
          templateFamilyId: payload.template?.family_id || payload.template_family_id,
          templateCustomFields: payload.templateCustomFields || payload.template_custom_fields || {},
          wrapper: payload.wrapper_config || payload.wrapper || undefined,
        });
      } else if (jobType === "image_brand") {
        await brandImage({
          inputPath,
          logoPath,
          outputPath,
          logoSize: brand.logo_size || "medium",
          logoPosition: brand.logo_position || "bottom-right",
          logoEnabled: brand.logo_enabled ?? true,
        });
      } else if (jobType === "pdf_brand") {
        await brandPdf({
          inputPath,
          logoPath,
          outputPath,
        });
      } else {
        throw new Error(`Unknown job type: ${jobType}`);
      }

      // Upload the output using unified router (handles S3 + Google Drive)
      const mimeType = getOutputMimeType(jobType, input.mime_type);
      const { storagePath, signedUrl } = await uploadOutput(
        destination,
        outputPath,
        outputFilename,
        mimeType
      );

      results.push({
        upload_id: input.upload_id,
        filename: outputFilename,
        storage_path: storagePath,
        signed_url: signedUrl,
        mime_type: mimeType,
      });

      // Report progress
      const progress = Math.round(10 + ((i + 1) / totalInputs) * 85);
      await reportCallback(payload, "processing", progress);
    }

    // Report completion
    await reportCallback(payload, "completed", 100, null, results);
    console.log(`[job:${jobId}] Completed successfully (${results.length} outputs)`);
  } finally {
    // Cleanup temp directory
    try {
      const { rm } = await import("fs/promises");
      await rm(jobDir, { recursive: true, force: true });
    } catch (cleanupErr) {
      console.warn(`[job:${jobId}] Cleanup warning:`, cleanupErr.message);
    }
  }
}

// ──── Callback helper ───────────────────────────────────────────────────────────
async function reportCallback(payload, status, progress, errorMessage, results) {
  const callbackUrl = payload.callback?.url;
  if (!callbackUrl) return;

  const internalKey = process.env.BRANDRR_INTERNAL_KEY;
  const body = {
    job_id: payload.job_id,
    status,
    progress: progress || 0,
  };

  if (errorMessage) body.error_message = errorMessage;
  if (results) body.results = results;

  try {
    const resp = await fetch(callbackUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(internalKey ? { Authorization: `Bearer ${internalKey}` } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      console.warn(`[callback] ${status} response: ${resp.status}`);
    }
  } catch (err) {
    console.warn(`[callback] Failed to report ${status}:`, err.message);
  }
}

// ──── Helpers ───────────────────────────────────────────────────────────────────
function getOutputExtension(jobType, inputMime) {
  if (jobType === "video_brand") return ".mp4";
  if (jobType === "pdf_brand") return ".pdf";
  // image
  if (inputMime?.includes("png")) return ".png";
  return ".jpg";
}

function getOutputMimeType(jobType, inputMime) {
  if (jobType === "video_brand") return "video/mp4";
  if (jobType === "pdf_brand") return "application/pdf";
  if (inputMime?.includes("png")) return "image/png";
  return "image/jpeg";
}

// ──── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Brandrr worker listening on port ${PORT}`);
});
