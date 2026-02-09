import { run } from "../utils.js";

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
