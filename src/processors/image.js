import { run } from "./utils.js";

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
 * @param {string} position - Position name
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
 * Brand an image with a logo overlay
 * @param {Object} options - Branding options
 * @param {string} options.inputPath - Path to input image
 * @param {string} options.logoPath - Path to logo image
 * @param {string} options.outputPath - Path for output image
 * @param {string} [options.logoSize="medium"] - Logo size: small, medium, large, xlarge
 * @param {string} [options.logoPosition="bottom-right"] - Logo position
 * @param {number} [options.logoOpacity=0.9] - Logo opacity (0-1)
 */
export async function brandImage({
  inputPath,
  logoPath,
  outputPath,
  logoSize = "medium",
  logoPosition = "bottom-right",
  logoOpacity = 0.9,
}) {
  const targetHeight = LOGO_SIZE_MAP[logoSize] || LOGO_SIZE_MAP.medium;
  const overlayPos = getOverlayPosition(logoPosition);

  // Build FFmpeg filter complex:
  // 1. Scale logo to target height while preserving aspect ratio
  // 2. Apply opacity using colorchannelmixer
  // 3. Overlay on image at specified position
  const filterComplex = [
    `[1:v]scale=-1:${targetHeight},format=rgba,colorchannelmixer=aa=${logoOpacity}[logo]`,
    `[0:v][logo]overlay=${overlayPos}`,
  ].join(";");

  console.log(`[image.js] Branding image with logo: size=${logoSize} (${targetHeight}px), position=${logoPosition}`);

  await run("ffmpeg", [
    "-y",
    "-i", inputPath,
    "-i", logoPath,
    "-filter_complex", filterComplex,
    outputPath,
  ]);
}
