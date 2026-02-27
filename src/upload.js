/**
 * Unified upload module — routes to S3 or Google Drive based on provider.
 *
 * Usage in the worker's job handler:
 *   import { uploadOutput } from "./upload.js";
 *   const { storagePath, signedUrl } = await uploadOutput(destination, localFilePath, filename, mimeType);
 */
import fs from "fs/promises";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { uploadToGoogleDrive } from "./gdrive.js";

/**
 * Upload a file to the user's configured storage destination.
 * Supports all Brandrr storage providers: s3, r2, minio, wasabi, backblaze, do_spaces, google_drive.
 */
export async function uploadOutput(destination, localFilePath, filename, mimeType) {
  const provider = destination.provider;

  if (provider === "google_drive") {
    return uploadToGoogleDrive(destination, localFilePath, filename, mimeType);
  }

  // All other providers use S3-compatible API
  return uploadToS3(destination, localFilePath, filename, mimeType);
}

async function uploadToS3(destination, localFilePath, filename, mimeType) {
  const { bucket, region, endpoint_url, access_key_id, secret_access_key, base_path } = destination;

  if (!access_key_id || !secret_access_key) {
    throw new Error("Missing S3 credentials (access_key_id / secret_access_key). Please reconnect your storage.");
  }
  if (!bucket) {
    throw new Error("Missing bucket name. Please check your storage configuration.");
  }

  const client = new S3Client({
    endpoint: endpoint_url || undefined,
    region: region || "auto",
    credentials: {
      accessKeyId: access_key_id,
      secretAccessKey: secret_access_key,
    },
    forcePathStyle: true,
  });

  // Build the object key
  const basePath = (base_path || "").replace(/\/+$/, "");
  const key = basePath ? `${basePath}/${filename}` : filename;

  const fileBuffer = await fs.readFile(localFilePath);

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
    })
  );

  // Generate a signed download URL (24h)
  const signedUrl = await getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: 86400 }
  );

  console.log(`[upload/s3] Uploaded ${filename} -> ${key} (${bucket})`);

  return { storagePath: key, signedUrl };
}
