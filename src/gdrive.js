/**
 * Google Drive upload module for the worker.
 * Mirrors the logic in save-export edge function but adapted for Node.js.
 */
import fs from "fs/promises";
import fetch from "node-fetch";

/**
 * Refresh an expired Google OAuth access token.
 */
async function refreshAccessToken(refreshToken, clientId, clientSecret) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (data.error) {
    console.error("[gdrive] Token refresh failed:", data.error, data.error_description);
    throw new Error("Failed to refresh Google Drive access token. Please reconnect your Google Drive.");
  }

  return data.access_token;
}

/**
 * Find or create a folder by name under a parent folder.
 */
async function findOrCreateFolder(accessToken, folderName, parentId) {
  const query = `name='${folderName.replace(/'/g, "\\'")}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)&spaces=drive`;

  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!searchRes.ok) {
    const errText = await searchRes.text();
    throw new Error(`Google Drive folder search failed (${searchRes.status}): ${errText}`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create the folder
  const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create folder '${folderName}' (${createRes.status}): ${errText}`);
  }

  const createData = await createRes.json();
  return createData.id;
}

/**
 * Ensure the full folder path exists and return the final folder ID.
 */
async function ensureFolderPath(accessToken, basePath, rootFolderId) {
  const segments = (basePath || "").split("/").filter(s => s.trim().length > 0);
  let currentParentId = rootFolderId || "root";

  for (const segment of segments) {
    currentParentId = await findOrCreateFolder(accessToken, segment, currentParentId);
  }

  return currentParentId;
}

/**
 * Upload a file to Google Drive using resumable upload (supports large files).
 * Falls back to multipart for small files (<5MB).
 */
async function uploadFile(accessToken, folderId, filename, mimeType, filePath) {
  const fileBuffer = await fs.readFile(filePath);
  const fileSize = fileBuffer.length;

  // For files > 5MB, use resumable upload
  if (fileSize > 5 * 1024 * 1024) {
    return resumableUpload(accessToken, folderId, filename, mimeType, fileBuffer, fileSize);
  }

  // Small files: use multipart upload
  const metadata = JSON.stringify({
    name: filename,
    parents: [folderId],
  });

  const boundary = "brandrr_worker_upload_boundary";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${metadata}`;
  const filePart = `${delimiter}Content-Type: ${mimeType}\r\nContent-Transfer-Encoding: base64\r\n\r\n`;
  const base64Data = fileBuffer.toString("base64");

  const requestBody = metadataPart + filePart + base64Data + closeDelimiter;

  const uploadRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: requestBody,
    }
  );

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Google Drive upload failed (${uploadRes.status}): ${errText}`);
  }

  const uploadData = await uploadRes.json();
  return {
    fileId: uploadData.id,
    webViewLink: uploadData.webViewLink || `https://drive.google.com/file/d/${uploadData.id}/view`,
  };
}

/**
 * Resumable upload for large files (video).
 */
async function resumableUpload(accessToken, folderId, filename, mimeType, fileBuffer, fileSize) {
  // Step 1: Initiate resumable upload session
  const initRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,webViewLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": mimeType,
        "X-Upload-Content-Length": String(fileSize),
      },
      body: JSON.stringify({
        name: filename,
        parents: [folderId],
      }),
    }
  );

  if (!initRes.ok) {
    const errText = await initRes.text();
    throw new Error(`Google Drive resumable init failed (${initRes.status}): ${errText}`);
  }

  const resumableUri = initRes.headers.get("location");
  if (!resumableUri) {
    throw new Error("Google Drive did not return a resumable upload URI");
  }

  // Step 2: Upload the file content
  const uploadRes = await fetch(resumableUri, {
    method: "PUT",
    headers: {
      "Content-Type": mimeType,
      "Content-Length": String(fileSize),
    },
    body: fileBuffer,
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Google Drive resumable upload failed (${uploadRes.status}): ${errText}`);
  }

  const uploadData = await uploadRes.json();
  return {
    fileId: uploadData.id,
    webViewLink: uploadData.webViewLink || `https://drive.google.com/file/d/${uploadData.id}/view`,
  };
}

/**
 * Main export: Upload a local file to Google Drive.
 *
 * @param {Object} destination - The destination config from the job payload
 * @param {string} destination.oauth_access_token - Decrypted OAuth access token
 * @param {string} destination.oauth_refresh_token - Decrypted OAuth refresh token
 * @param {string} destination.google_client_id - Google OAuth client ID
 * @param {string} destination.google_client_secret - Google OAuth client secret
 * @param {string} destination.drive_root_folder_id - Root folder ID (or "root")
 * @param {string} destination.base_path - Subfolder path (e.g. "Brandrr/Exports/")
 * @param {string} localFilePath - Path to the local file to upload
 * @param {string} filename - Desired filename in Google Drive
 * @param {string} mimeType - MIME type of the file
 * @returns {{ storagePath: string, signedUrl: string }}
 */
export async function uploadToGoogleDrive(destination, localFilePath, filename, mimeType) {
  let accessToken = destination.oauth_access_token;

  // Try the upload; if 401, refresh the token and retry once
  async function attemptUpload() {
    const folderId = await ensureFolderPath(accessToken, destination.base_path, destination.drive_root_folder_id || "root");
    return await uploadFile(accessToken, folderId, filename, mimeType, localFilePath);
  }

  try {
    const result = await attemptUpload();
    console.log(`[gdrive] Uploaded ${filename} -> ${result.webViewLink}`);
    return {
      storagePath: `gdrive://${result.fileId}`,
      signedUrl: result.webViewLink,
    };
  } catch (err) {
    // If unauthorized, try refreshing the token
    if (err.message.includes("401") && destination.oauth_refresh_token && destination.google_client_id && destination.google_client_secret) {
      console.log("[gdrive] Access token expired, refreshing...");
      accessToken = await refreshAccessToken(
        destination.oauth_refresh_token,
        destination.google_client_id,
        destination.google_client_secret
      );
      const result = await attemptUpload();
      console.log(`[gdrive] Uploaded (after refresh) ${filename} -> ${result.webViewLink}`);
      return {
        storagePath: `gdrive://${result.fileId}`,
        signedUrl: result.webViewLink,
      };
    }
    throw err;
  }
}
