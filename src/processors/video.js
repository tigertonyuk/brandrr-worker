import { run } from "../utils.js";

/**
 * Logo size to pixel scale factor mapping
 * These are approximate target heights for the logo
 */
const LOGO_SIZE_MAP = {
  small: 50,
  medium: 100,
  large: 150,
  xlarge: 200,
};

/**
 * Calculate FFmpeg overlay position string based on position name
 * @param {string} position - Position name (top-left, top-center, top-right, bottom-left, bottom-center, bottom-right, center)
 * @param {number} padding - Padding from edges in pixels
 * @returns {string} FFmpeg overlay position expression
 */
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
      return `W-w-${padding}:H-h-${padding}`; // Default to bottom-right
  }
}

/**
 * Brand a video with a logo overlay
 */
export async function brandVideo({
  inputPath,
  logoPath,
  outputPath,
  logoSize = "medium",
  logoPosition = "bottom-right",
  logoOpacity = 0.9,
}) {
  const targetHeight = LOGO_SIZE_MAP[logoSize] || LOGO_SIZE_MAP.medium;
  const overlayPos = getOverlayPosition(logoPosition);
  
  const filterComplex = [
    `[1:v]scale=-1:${targetHeight},format=rgba,colorchannelmixer=aa=${logoOpacity}[logo]`,
    `[0:v][logo]overlay=${overlayPos}`,
  ].join(";");

  console.log(`[video.js] Branding video with logo: size=${logoSize} (${targetHeight}px), position=${logoPosition}`);
  
  await run("ffmpeg", [
    "-y",
    "-i", inputPath,
    "-i", logoPath,
    "-filter_complex", filterComplex,
    "-c:a", "copy",
    outputPath,
  ]);
}
