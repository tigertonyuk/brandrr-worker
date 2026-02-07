import { postJobUpdate } from "./callback.js";

async function processJob(job_id, job_type, inputs, brand, output, callback) {
  const callbackUrl = callback.url;
  const internalKey = process.env.BRANDRR_INTERNAL_KEY;

  // Helper to send progress updates
  const sendUpdate = async (status, progress, error_message = null, exports = null) => {
    try {
      await postJobUpdate({
        callbackUrl,
        internalKey,
        body: { job_id, status, progress, error_message, exports },
      });
    } catch (e) {
      console.error("Failed to send callback:", e.message);
    }
  };

  try {
    await sendUpdate("running", 10); // Started

    // Download inputs
    await sendUpdate("running", 20);
    for (const input of inputs) {
      await downloadToFile(input.temp_url, `/tmp/${job_id}/${input.filename}`);
    }
    await sendUpdate("running", 30); // Inputs downloaded

    // Download logo
    if (brand.logo_url_temp) {
      await downloadToFile(brand.logo_url_temp, `/tmp/${job_id}/logo.png`);
    }
    await sendUpdate("running", 40); // Logo ready

    // FFmpeg processing
    await sendUpdate("running", 50);
    const outputPath = await runFfmpeg(job_id, inputs, brand, output);
    await sendUpdate("running", 80); // FFmpeg done

    // Upload to user's storage
    const exportInfo = await uploadToStorage(outputPath, output.destination);
    await sendUpdate("running", 95);

    // Success!
    await sendUpdate("succeeded", 100, null, [exportInfo]);

  } catch (error) {
    console.error(`Job ${job_id} failed:`, error);
    // CRITICAL: Always send failure callback
    await sendUpdate("failed", 0, error.message || String(error));
  } finally {
    // Cleanup temp files
    await cleanup(`/tmp/${job_id}`);
  }
}
