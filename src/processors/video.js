import { run } from "../utils.js";
import fs from "fs/promises";
import path from "path";

/**
 * Logo size to pixel scale factor mapping
 */
const LOGO_SIZE_MAP = {
  small: 50,
  medium: 100,
  large: 150,
  xlarge: 200,
};

function getOverlayPosition(position, padding = 20) {
  switch (position) {
    case "top-left":
      return `${padding}:${padding}`;
    case "top-center":
      return `(W-w)/2:${padding}`;
    case "top-right":
      return `W-w-${padding}:${padding}`;
    case "bottom-left":
      return `${padding}:H-h-${padding}`;
    case "bottom-center":
      return `(W-w)/2:H-h-${padding}`;
    case "bottom-right":
      return `W-w-${padding}:H-h-${padding}`;
    case "center":
      return "(W-w)/2:(H-h)/2";
    default:
      return `W-w-${padding}:H-h-${padding}`;
  }
}

function hexToFFmpegColor(hex) {
  if (!hex) return "0x000000";
  const clean = hex.replace("#", "");
  return `0x${clean}`;
}

function escapeDrawText(text) {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "'\\''")
    .replace(/:/g, "\\:")
    .replace(/%/g, "%%")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/;/g, "\\;");
}

function extractHandle(url) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const p = parsed.pathname.replace(/^\//, "").replace(/\/$/, "");
    return p ? `@${p.split("/")[0]}` : url;
  } catch {
    return url.startsWith("@") ? url : `@${url}`;
  }
}

export async function brandVideo({
  inputPath,
  logoPath,
  outputPath,
  logoSize = "medium",
  logoPosition = "bottom-right",
  logoOpacity = 0.9,
  logoTargetHeightPx,
  logoEnabled = true,
  brandName,
  primaryColor,
  tagline,
  contact,
  social,
  elements,
}) {
  const hasLogo = logoEnabled && logoPath;
  const targetHeight = logoTargetHeightPx || LOGO_SIZE_MAP[logoSize] || LOGO_SIZE_MAP.medium;
  const overlayPos = getOverlayPosition(logoPosition);

  const bgColor = primaryColor ? hexToFFmpegColor(primaryColor) : "0x000000";
  const fontColor = "0xFFFFFF";

  const footerParts = [];
  if (tagline) footerParts.push(tagline);
  if (contact?.website) footerParts.push(contact.website);
  if (contact?.phone) footerParts.push(contact.phone);
  if (contact?.email) footerParts.push(contact.email);

  if (social) {
    if (social.facebook) footerParts.push(`FB: ${extractHandle(social.facebook)}`);
    if (social.instagram) footerParts.push(`IG: ${extractHandle(social.instagram)}`);
    if (social.twitter) footerParts.push(`X: ${extractHandle(social.twitter)}`);
    if (social.linkedin) footerParts.push(`LI: ${extractHandle(social.linkedin)}`);
    if (social.youtube) footerParts.push(`YT: ${extractHandle(social.youtube)}`);
    if (social.tiktok) footerParts.push(`TT: ${extractHandle(social.tiktok)}`);
  }

  const footerText = footerParts.join("  |  ");
  const hasFooter = footerText.length > 0;
  const hasHeader = !!brandName;

  console.log(`[video.js] Branding video: logo=${hasLogo} (size=${logoSize}/${targetHeight}px, pos=${logoPosition}), brandName=${brandName || "none"}, footer=${hasFooter ? footerText.slice(0, 60) + "..." : "none"}, color=${primaryColor || "default"}`);

  const filters = [];
  const inputs = ["-i", inputPath];
  let lastLabel = "[0:v]";
  let inputIndex = 1;

  if (hasLogo) {
    inputs.push("-i", logoPath);
    filters.push(
      `[${inputIndex}:v]scale=-1:${targetHeight},format=rgba,colorchannelmixer=aa=${logoOpacity}[logo]`
    );
    filters.push(`${lastLabel}[logo]overlay=${overlayPos}[v_logo]`);
    lastLabel = "[v_logo]";
    inputIndex++;
  }

  if (hasHeader) {
    const headerHeight = 40;
    const escapedName = escapeDrawText(brandName);
    filters.push(
      `${lastLabel}drawbox=x=0:y=0:w=iw:h=${headerHeight}:color=${bgColor}@0.7:t=fill[v_hdr_bg]`
    );
    lastLabel = "[v_hdr_bg]";
    filters.push(
      `${lastLabel}drawtext=text='${escapedName}':fontsize=18:fontcolor=${fontColor}:x=20:y=(${headerHeight}-text_h)/2:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf[v_hdr]`
    );
    lastLabel = "[v_hdr]";
  }

  if (hasFooter) {
    const footerHeight = 32;
    const escapedFooter = escapeDrawText(footerText);
    filters.push(
      `${lastLabel}drawbox=x=0:y=ih-${footerHeight}:w=iw:h=${footerHeight}:color=${bgColor}@0.7:t=fill[v_ftr_bg]`
    );
    lastLabel = "[v_ftr_bg]";
    const fontSize = footerText.length > 100 ? 10 : footerText.length > 60 ? 12 : 14;
    filters.push(
      `${lastLabel}drawtext=text='${escapedFooter}':fontsize=${fontSize}:fontcolor=${fontColor}:x=20:y=ih-${footerHeight}+(${footerHeight}-text_h)/2:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf[v_ftr]`
    );
    lastLabel = "[v_ftr]";
  }

  if (filters.length > 0) {
    const finalLabel = lastLabel.replace("[", "").replace("]", "");
    const filterComplex = filters.join(";");
    const args = [
      "-y",
      ...inputs,
      "-filter_complex", filterComplex,
      "-map", `[${finalLabel}]`,
      "-map", "0:a?",
      "-c:a", "copy",
      "-shortest",
      outputPath,
    ];
    console.log(`[video.js] FFmpeg filter_complex: ${filterComplex}`);
    await run("ffmpeg", args);
  } else {
    console.log("[video.js] No branding elements enabled, copying input to output");
    await fs.copyFile(inputPath, outputPath);
  }
}
