import express from "express";
import path from "path";
import os from "os";
import fs from "fs/promises";
import { requireWorkerAuth } from "./auth.js";
import { ensureDir, downloadToFile } from "./utils.js";
import { brandVideo } from "./process/video.js";
import { brandPdf } from "./process/pdf.js";
import { brandImage } from "./process/image.js";
import { postJobUpdate } from "./callback.js";

const app = express();
app.use(express.json({ limit: "2mb" }));

app.get("/v1/health", (_, r) => r.json({ ok: true }));

app.post("/v1/jobs/start", requireWorkerAuth, async (req, res) => {
  const { job_id, job_type, inputs, brand, output, callback } = req.body;
  // Fire and forget - respond immediately
  processJob(job_id, job_type, inputs, brand, output, callback);
  res.json({ accepted: true });
});

async function processJob(job_id, job_type, inputs, brand, output, callback) {
  const callbackUrl = callback?.url;
  const internalKey = process.env.BRANDRR_INTERNAL_KEY;

  // Helper to send updates
  const sendUpdate = async (status, progress, error_message) => {
    try {
      await postJobUpdate({
        callbackUrl,
        internalKey,
        body: { job_id, status, progress, error_message },
      });
    } catch (e) {
      console.error("Failed to send callback:", e.message);
    }
  };

  try {
    await sendUpdate("running", 10);

    const tmp = path.join(os.tmpdir(), `brandrr-${job_id}`);
    await ensureDir(tmp);

    await sendUpdate("running", 20);

    // Download logo
    const logo = path.join(tmp, "logo.png");
    if (brand?.logo_url_temp) {
      console.log("Downloading logo from:", brand.logo_url_temp);
      await downloadToFile(brand.logo_url_temp, logo);
    }

    await sendUpdate("running", 30);

    for (let idx = 0; idx < inputs.length; idx++) {
      const i = inputs[idx];
      const inp = path.join(tmp, i.filename);

      console.log("Downloading input from:", i.temp_url);
      await downloadToFile(i.temp_url, inp);

      await sendUpdate("running", 40 + idx * 10);

      const out = path.join(tmp, `out-${i.filename}`);

      if (job_type === "video_brand") {
        await brandVideo({ inputPath: inp, logoPath: logo, outputPath: out });
      } else if (job_type === "pdf_brand") {
        await brandPdf({ inputPath: inp, logoPath: logo, outputPath: out });
      } else if (job_type === "image_brand") {
        await brandImage({ inputPath: inp, logoPath: logo, outputPath: out });
      }

      await sendUpdate("running", 80);
    }

    // TODO: Upload to user's storage destination here

    await sendUpdate("succeeded", 100);
    console.log(`Job ${job_id} completed successfully`);

    // Cleanup
    await fs.rm(tmp, { recursive: true, force: true }).catch(() => {});

  } catch (error) {
    console.error(`Job ${job_id} failed:`, error);
    await sendUpdate("failed", 0, error.message || String(error));
  }
}

app.listen(process.env.PORT || 10000, () => {
  console.log("Worker listening on port", process.env.PORT || 10000);
});
