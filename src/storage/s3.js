import { S3Client, HeadBucketCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import fs from "fs";
import { pipeline } from "stream/promises";

export function makeS3Client(dest) {
  return new S3Client({
    region: dest.region || "auto",
    endpoint: dest.endpoint_url || undefined,
    credentials: dest.access_key_id && dest.secret_access_key ? {
      accessKeyId: dest.access_key_id,
      secretAccessKey: dest.secret_access_key
    } : undefined,
    forcePathStyle: true
  });
}

export async function testS3(dest) {
  const s3 = makeS3Client(dest);
  await s3.send(new HeadBucketCommand({ Bucket: dest.bucket }));
  return { ok: true };
}

export async function downloadFromS3(dest, key, localPath) {
  const s3 = makeS3Client(dest);
  const obj = await s3.send(new GetObjectCommand({ Bucket: dest.bucket, Key: key }));
  await pipeline(obj.Body, fs.createWriteStream(localPath));
}

export async function uploadToS3(dest, localPath, key, contentType) {
  const s3 = makeS3Client(dest);
  const up = new Upload({
    client: s3,
    params: {
      Bucket: dest.bucket,
      Key: key,
      Body: fs.createReadStream(localPath),
      ContentType: contentType || "application/octet-stream"
    }
  });
  await up.done();
  return { ok: true, key };
}
