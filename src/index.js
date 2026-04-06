import express from "express";
import os from "os";
import path from "path";
import fs from "fs/promises";
import fetch from "node-fetch";
import mime from "mime-types";

import { verifyWorkerKey } from './auth.js';
import { brandVideo } from './processors/video.js';
import { brandImage } from './processors/image.js';
import { brandPdf } from './processors/pdf.js';
import { probeFile } from './probe.js';
import { uploadToS3 } from './s3.js';
import { uploadToGDrive } from './gdrive.js';

const app = express();
const PORT = Number(process.env.PORT || 3000);
const HOST = "0.0.0.0";
const INTERNAL_KEY = process.env.BRANDRR_INTERNAL_KEY || "";

app.use(express.json({ limit: "50mb" }));

function normalizeJobType(jobType) {
  const value = String(jobType || "").toLowerCase();
  if (value.includes("video")) return "video";
  if (value.includes("pdf")) return "pdf";
  return "image";
}

function sanitizeFilename(name, fallback = "file") {
  const base = String(name || fallback)
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || fallback;
}

function getExtensionFromInput(input, fallbackExt) {
  const fromName = path.extname(input?.filename || "");
  if (fromName) return fromName.toLowerCase();
  const fromMime = mime.extension(input?.mime_type || "");
  return fromMime ? `.${fromMime}` : fallbackExt;
}

function getOutputMime(jobType, input) {
  if (jobType === "video") return "video/mp4";
  if (jobType === "pdf") return "application/pdf";

  const inputMime = String(input?.mime_type || "").toLowerCase();
  if (inputMime === "image/png" || inputMime === "image/webp") return "image/png";
  return "image/jpeg";
}

function getOutputExtension(jobType, input) {
  if (jobType === "video") return ".mp4";
  if (jobType === "pdf") return ".pdf";
  return getOutputMime(jobType, input) === "image/png" ? ".png" : ".jpg";
}

function buildOutputFilename(jobId, input, index, jobType) {
  const safeBase = sanitizeFilename(input?.filename || `input-${index + 1}`, `input-${index + 1}`);
  const ext = getOutputExtension(jobType, input);
  return `${safeBase}-branded-${jobId}-${index + 1}${ext}`;
}

async function postCallback(callbackUrl, payload) {
  if (!callbackUrl) return;

  const headers = {
    "Content-Type": "application/json",
  };

  if (INTERNAL_KEY) {
    headers.Authorization = `Bearer ${INTERNAL_KEY}`;
    headers["x-brandrr-internal-key"] = INTERNAL_KEY;
  }

  const res = await fetch(callbackUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Callback failed (${res.status}): ${text}`);
  }
}

async function reportProgress(callbackUrl, jobId, status, progress, extra = {}) {
  const payload = {
    job_id: jobId,
    status,
    progress,
    ...extra,
  };

  console.log("[worker] callback:", payload);
  await postCallback(callbackUrl, payload);
}

async function createJobDir(jobId) {
  const jobDir = path.join(os.tmpdir(), "brandrr-worker", `${jobId}-${Date.now()}`);
  await ensureDir(jobDir);
  return jobDir;
}

async function cleanupJobDir(jobDir) {
  if (!jobDir) return;
  await fs.rm(jobDir, { recursive: true, force: true }).catch(() => {});
}

async function downloadJobInputs(inputs, jobDir) {
  const downloaded = [];

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const sourceUrl = input.temp_url || input.tempPath || input.temp_path;

    if (!sourceUrl) {
      throw new Error(`Input ${i + 1} is missing temp_url/temp_path`);
    }

    const ext = getExtensionFromInput(input, ".bin");
    const localPath = path.join(jobDir, `input-${i + 1}${ext}`);

    await downloadToFile(sourceUrl, localPath);

    downloaded.push({
      ...input,
      localPath,
    });
  }

  return downloaded;
}

async function downloadLogoIfNeeded(payload, jobDir) {
  const brand = payload.brand || {};
  const logoEnabled = brand.logo_enabled ?? payload.logoEnabled ?? true;
  const logoUrl = brand.logo_url_temp || payload.logo_url_temp || payload.logoUrlTemp;

  if (!logoEnabled || !logoUrl) return null;

  const logoPath = path.join(jobDir, "logo.png");
  await downloadToFile(logoUrl, logoPath);
  return logoPath;
}

async function processOneInput({ payload, input, index, total, jobDir, logoPath, callbackUrl }) {
  const jobType = normalizeJobType(payload.job_type);
  const brand = payload.brand || {};
  const template = payload.template || {};
  const wrapper = payload.wrapper_config || payload.wrapper || undefined;
  const templateCustomFields =
    payload.templateCustomFields ||
    payload.template_custom_fields ||
    {};

  const outputExt = getOutputExtension(jobType, input);
  const outputMime = getOutputMime(jobType, input);
  const outputPath = path.join(jobDir, `output-${index + 1}${outputExt}`);

  const beforeRenderProgress = total === 1 ? 25 : Math.round(25 + (index / total) * 30);
  const afterRenderProgress = total === 1 ? 70 : Math.round(55 + ((index + 1) / total) * 20);
  const afterUploadProgress = total === 1 ? 95 : Math.round(80 + ((index + 1) / total) * 15);

  await reportProgress(callbackUrl, payload.job_id, "running", beforeRenderProgress);

  if (jobType === "video") {
    await brandVideo({
      inputPath: input.localPath,
      logoPath,
      outputPath,
      jobDir,
      logoSize: brand.logo_size || payload.logoSize || "medium",
      logoPosition: brand.logo_position || payload.logoPosition || "bottom-right",
      logoOpacity: brand.logo_opacity ?? payload.logoOpacity ?? 0.9,
      logoTargetHeightPx: brand.logo_target_height_px || payload.logoTargetHeightPx,
      logoEnabled: brand.logo_enabled ?? payload.logoEnabled ?? true,

      brandName: brand.name || payload.brandName,
      primaryColor: brand.primary_color || payload.primaryColor,
      tagline: brand.tagline || payload.tagline,
      contact: brand.contact || payload.contact,
      social: brand.social || payload.social,
      elements: brand.elements || payload.elements,
      fontFamily: brand.fontFamily || payload.fontFamily,
      stickers: brand.stickers || payload.stickers,
      stickerMeta: brand.stickerMeta || payload.stickerMeta,
      templateFamilyId: template.family_id || payload.template_family_id || payload.templateFamilyId,
      templateCustomFields,
      wrapper,

      reviewerName: payload.reviewerName,
      reviewerTitle: payload.reviewerTitle,
      starRating: payload.starRating,
      speakerName: payload.speakerName,
      speakerTitle: payload.speakerTitle,
      productName: payload.productName,
      productPrice: payload.productPrice,
      eventName: payload.eventName,
      eventDate: payload.eventDate,
      eventLocation: payload.eventLocation,
      announcementText: payload.announcementText,
      chapterTitle: payload.chapterTitle,
      chapterNumber: payload.chapterNumber,
      quoteText: payload.quoteText,
      quoteName: payload.quoteName,
      quoteCompany: payload.quoteCompany,
      beforeLabel: payload.beforeLabel,
      afterLabel: payload.afterLabel,
      introText: payload.introText,
      copyrightText: brand.copyright_text || payload.copyrightText,
    });
  } else if (jobType === "pdf") {
    if (logoPath) {
      await brandPdf({
        inputPath: input.localPath,
        logoPath,
        outputPath,
      });
    } else {
      await fs.copyFile(input.localPath, outputPath);
    }
  } else {
    if (logoPath) {
      await brandImage({
        inputPath: input.localPath,
        logoPath,
        outputPath,
        logoSize: brand.logo_size || payload.logoSize || "medium",
        logoPosition: brand.logo_position || payload.logoPosition || "bottom-right",
        logoOpacity: brand.logo_opacity ?? payload.logoOpacity ?? 0.9,
      });
    } else {
      await fs.copyFile(input.localPath, outputPath);
    }
  }

  await reportProgress(callbackUrl, payload.job_id, "running", afterRenderProgress);

  const filename = buildOutputFilename(payload.job_id, input, index, jobType);
  const destination = payload.output?.destination;

  if (!destination) {
    throw new Error("Missing output.destination");
  }

  const { storagePath, signedUrl } = await uploadOutput(
    destination,
    outputPath,
    filename,
    outputMime
  );

  const stat = await fs.stat(outputPath);

  await reportProgress(callbackUrl, payload.job_id, "running", afterUploadProgress);

  return {
    type: jobType,
    filename,
    storage_path: storagePath,
    mime_type: outputMime,
    size_bytes: stat.size,
    signed_url: signedUrl,
  };
}

async function processJob(payload) {
  const jobId = payload?.job_id;
  const callbackUrl = payload?.callback?.url;

  if (!jobId) throw new Error("Missing job_id");
  if (!callbackUrl) throw new Error("Missing callback.url");
  if (!Array.isArray(payload.inputs) || payload.inputs.length === 0) {
    throw new Error("At least one input is required");
  }

  let jobDir = "";

  try {
    jobDir = await createJobDir(jobId);

    await reportProgress(callbackUrl, jobId, "running", 5);

    const inputs = await downloadJobInputs(payload.inputs, jobDir);
    const logoPath = await downloadLogoIfNeeded(payload, jobDir);

    await reportProgress(callbackUrl, jobId, "running", 10);

    const exports = [];
    for (let i = 0; i < inputs.length; i++) {
      const exp = await processOneInput({
        payload,
        input: inputs[i],
        index: i,
        total: inputs.length,
        jobDir,
        logoPath,
        callbackUrl,
      });
      exports.push(exp);
    }

    const actualVideoMinutes = inputs.reduce(
      (sum, item) => sum + Number(item?.meta?.duration_minutes || 0),
      0
    );

    const actualPdfPages = inputs.reduce(
      (sum, item) => sum + Number(item?.meta?.page_count || 0),
      0
    );

    await reportProgress(callbackUrl, jobId, "succeeded", 100, {
      exports,
      actual_video_minutes: actualVideoMinutes || undefined,
      actual_pdf_pages: actualPdfPages || undefined,
    });
  } catch (error) {
    console.error("[worker] job failed:", error);
    try {
      await reportProgress(callbackUrl, jobId, "failed", 100, {
        error_message: error?.message || String(error),
      });
    } catch (callbackError) {
      console.error("[worker] failed to report error:", callbackError);
    }
  } finally {
    await cleanupJobDir(jobDir);
  }
}

app.get("/v1/health", (_req, res) => {
  res.json({ ok: true, status: "UP" });
});

app.post("/v1/media/probe", requireWorkerAuth, async (req, res) => {
  try {
    const tempUrl = req.body?.temp_url || req.body?.tempPath || req.body?.temp_path;
    const mimeType = req.body?.mime_type || req.body?.mimeType;

    if (!tempUrl) {
      return res.status(400).json({ ok: false, message: "Missing temp_url/temp_path" });
    }

    const meta = await probeFile({ tempUrl, mimeType });
    return res.json({ ok: true, meta });
  } catch (error) {
    console.error("[worker] probe failed:", error);
    return res.status(500).json({
      ok: false,
      message: error?.message || "Probe failed",
    });
  }
});

app.post("/v1/storage/test", requireWorkerAuth, async (req, res) => {
  let tempDir = "";
  try {
    const destination = req.body?.destination;
    if (!destination) {
      return res.status(400).json({ ok: false, message: "Missing destination" });
    }

    tempDir = path.join(os.tmpdir(), "brandrr-storage-test", String(Date.now()));
    await ensureDir(tempDir);

    const filePath = path.join(tempDir, "brandrr-storage-test.txt");
    await fs.writeFile(filePath, `Brandrr storage test ${new Date().toISOString()}\n`);

    const filename = `brandrr-storage-test-${Date.now()}.txt`;
    await uploadOutput(destination, filePath, filename, "text/plain");

    return res.json({
      ok: true,
      message: "Storage test succeeded",
    });
  } catch (error) {
    console.error("[worker] storage test failed:", error);
    return res.status(500).json({
      ok: false,
      message: error?.message || "Storage test failed",
    });
  } finally {
    await cleanupJobDir(tempDir);
  }
});

app.post("/v1/jobs/start", requireWorkerAuth, async (req, res) => {
  try {
    const payload = req.body || {};

    if (!payload.job_id) {
      return res.status(400).json({ accepted: false, message: "Missing job_id" });
    }

    if (!Array.isArray(payload.inputs) || payload.inputs.length === 0) {
      return res.status(400).json({ accepted: false, message: "Missing inputs" });
    }

    if (!payload.output?.destination) {
      return res.status(400).json({ accepted: false, message: "Missing output.destination" });
    }

    if (!payload.callback?.url) {
      return res.status(400).json({ accepted: false, message: "Missing callback.url" });
    }

    setImmediate(() => {
      processJob(payload).catch((error) => {
        console.error("[worker] unhandled job error:", error);
      });
    });

    return res.json({ accepted: true });
  } catch (error) {
    console.error("[worker] start-job failed:", error);
    return res.status(500).json({
      accepted: false,
      message: error?.message || "Failed to start job",
    });
  }
});

app.use((error, _req, res, _next) => {
  console.error("[worker] unhandled express error:", error);
  res.status(500).json({
    ok: false,
    message: error?.message || "Internal server error",
  });
});

app.listen(PORT, HOST, () => {
  console.log(`Listening on http://localhost:${PORT}/`);
});
