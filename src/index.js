// index.js - Render Worker for Brandrr Video Processing
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const execAsync = promisify(exec);
const app = express();
app.use(express.json());

const INTERNAL_KEY = process.env.BRANDRR_INTERNAL_KEY;
const CALLBACK_BASE_URL = process.env.CALLBACK_BASE_URL;

// Health check
app.get('/v1/health', (req, res) => {
  res.json({ ok: true });
});

// Start job
app.post('/v1/jobs/start', async (req, res) => {
  const job = req.body;
  
  // Acknowledge immediately
  res.json({ accepted: true });
  
  // Process in background
  processJob(job).catch(err => {
    console.error('Job failed:', err);
    sendCallback(job.job_id, 'failed', 0, err.message);
  });
});

async function processJob(job) {
  const { job_id, inputs, brand, output } = job;
  const input = inputs[0];
  
  const workDir = `/tmp/brandrr-${job_id}`;
  fs.mkdirSync(workDir, { recursive: true });
  
  try {
    // 1. Download video from temp_url
    await sendCallback(job_id, 'processing', 10);
    const videoPath = path.join(workDir, 'input.mp4');
    await downloadFile(input.temp_url, videoPath);
    
    // 2. Download logo
    await sendCallback(job_id, 'processing', 20);
    const logoPath = path.join(workDir, 'logo.png');
    await downloadFile(brand.logo_url_temp, logoPath);
    
    // 3. Run FFmpeg
    await sendCallback(job_id, 'processing', 40);
    const outputPath = path.join(workDir, 'output.mp4');
    await runFFmpeg(videoPath, logoPath, outputPath);
    
    // 4. Upload to user's storage
    await sendCallback(job_id, 'processing', 80);
    const { storage_path, signed_url } = await uploadToDestination(
      outputPath,
      output.destination,
      input.filename,
      job_id
    );
    
    // 5. Complete
    await sendCallback(job_id, 'completed', 100, null, {
      storage_path,
      signed_url,
      filename: input.filename.replace(/\.[^.]+$/, '_branded.mp4'),
      mime_type: 'video/mp4',
      size_bytes: fs.statSync(outputPath).size
    });
    
  } finally {
    // Cleanup
    fs.rmSync(workDir, { recursive: true, force: true });
  }
}

async function downloadFile(url, destPath) {
  const response = await axios.get(url, { responseType: 'stream' });
  const writer = fs.createWriteStream(destPath);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function runFFmpeg(videoPath, logoPath, outputPath) {
  const cmd = `ffmpeg -y -i "${videoPath}" -i "${logoPath}" -filter_complex "overlay=10:10" -c:a copy "${outputPath}"`;
  await execAsync(cmd);
}

async function uploadToDestination(filePath, destination, filename, jobId) {
  const { provider, bucket, region, endpoint_url, access_key_id, secret_access_key, base_path } = destination;
  
  const s3 = new S3Client({
    region: region || 'auto',
    endpoint: endpoint_url,
    credentials: {
      accessKeyId: access_key_id,
      secretAccessKey: secret_access_key,
    },
    forcePathStyle: true,
  });
  
  const key = `${base_path || ''}${jobId}/${filename.replace(/\.[^.]+$/, '_branded.mp4')}`;
  
  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fs.createReadStream(filePath),
    ContentType: 'video/mp4',
  }));
  
  return {
    storage_path: key,
    signed_url: `${endpoint_url}/${bucket}/${key}`,
  };
}

async function sendCallback(jobId, status, progress, errorMessage = null, exportData = null) {
  try {
    await axios.post(`${CALLBACK_BASE_URL}/functions/v1/internal-job-update`, {
      job_id: jobId,
      status,
      progress,
      error_message: errorMessage,
      export: exportData,
    }, {
      headers: { 'x-internal-key': INTERNAL_KEY }
    });
  } catch (err) {
    console.error('Callback failed:', err.message);
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Worker running on port ${PORT}`));
