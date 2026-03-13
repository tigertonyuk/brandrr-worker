import { run } from "../utils.js";
import fs from "fs/promises";
import path from "path";
import { execFileSync } from "child_process";

const LOGO_SIZE_MAP = {
  small: 50,
  medium: 100,
  large: 150,
  xlarge: 200,
};

// ─── Font resolution ───────────────────────────────────────────────────────────
const GOOGLE_FONT_DIR = "/usr/share/fonts/google";
const DEJAVU_REGULAR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";
const DEJAVU_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";

const FONT_MAP = {
  // System fonts → visually similar Google Fonts installed on the worker
  default: DEJAVU_REGULAR,
  arial: DEJAVU_REGULAR,
  helvetica: DEJAVU_REGULAR,
  georgia: `${GOOGLE_FONT_DIR}/librebaskerville/LibreBaskerville-Regular.ttf`,
  "times-new-roman": `${GOOGLE_FONT_DIR}/librebaskerville/LibreBaskerville-Regular.ttf`,
  "courier-new": "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
  verdana: `${GOOGLE_FONT_DIR}/nunito/Nunito-Regular.ttf`,
  "trebuchet-ms": `${GOOGLE_FONT_DIR}/firasans/FiraSans-Regular.ttf`,
  impact: `${GOOGLE_FONT_DIR}/anton/Anton-Regular.ttf`,
  "comic-sans-ms": `${GOOGLE_FONT_DIR}/architectsdaughter/ArchitectsDaughter-Regular.ttf`,
  palatino: `${GOOGLE_FONT_DIR}/cormorantgaramond/CormorantGaramond-Regular.ttf`,
  garamond: `${GOOGLE_FONT_DIR}/cormorantgaramond/CormorantGaramond-Regular.ttf`,
  bookman: `${GOOGLE_FONT_DIR}/librebaskerville/LibreBaskerville-Regular.ttf`,
  "avant-garde": `${GOOGLE_FONT_DIR}/josefinsans/JosefinSans-Regular.ttf`,

  // Google Fonts — direct paths
  roboto: `${GOOGLE_FONT_DIR}/roboto/Roboto-Regular.ttf`,
  "open-sans": `${GOOGLE_FONT_DIR}/opensans/OpenSans-Regular.ttf`,
  montserrat: `${GOOGLE_FONT_DIR}/montserrat/Montserrat-Regular.ttf`,
  lato: `${GOOGLE_FONT_DIR}/lato/Lato-Regular.ttf`,
  oswald: `${GOOGLE_FONT_DIR}/oswald/Oswald-Regular.ttf`,
  raleway: `${GOOGLE_FONT_DIR}/raleway/Raleway-Regular.ttf`,
  "playfair-display": `${GOOGLE_FONT_DIR}/playfairdisplay/PlayfairDisplay-Regular.ttf`,
  "roboto-slab": `${GOOGLE_FONT_DIR}/robotoslab/RobotoSlab-Regular.ttf`,
  poppins: `${GOOGLE_FONT_DIR}/poppins/Poppins-Regular.ttf`,
  nunito: `${GOOGLE_FONT_DIR}/nunito/Nunito-Regular.ttf`,
  "crimson-text": `${GOOGLE_FONT_DIR}/crimsontext/CrimsonText-Regular.ttf`,
  bitter: `${GOOGLE_FONT_DIR}/bitter/Bitter-Regular.ttf`,
  "dancing-script": `${GOOGLE_FONT_DIR}/dancingscript/DancingScript-Regular.ttf`,
  "great-vibes": `${GOOGLE_FONT_DIR}/greatvibes/GreatVibes-Regular.ttf`,
  pacifico: `${GOOGLE_FONT_DIR}/pacifico/Pacifico-Regular.ttf`,
  caveat: `${GOOGLE_FONT_DIR}/caveat/Caveat-Regular.ttf`,
  "bebas-neue": `${GOOGLE_FONT_DIR}/bebasneue/BebasNeue-Regular.ttf`,
  anton: `${GOOGLE_FONT_DIR}/anton/Anton-Regular.ttf`,
  righteous: `${GOOGLE_FONT_DIR}/righteous/Righteous-Regular.ttf`,
  "permanent-marker": `${GOOGLE_FONT_DIR}/permanentmarker/PermanentMarker-Regular.ttf`,
  bangers: `${GOOGLE_FONT_DIR}/bangers/Bangers-Regular.ttf`,
  "space-mono": `${GOOGLE_FONT_DIR}/spacemono/SpaceMono-Regular.ttf`,
  "source-code-pro": `${GOOGLE_FONT_DIR}/sourcecodepro/SourceCodePro-Regular.ttf`,
  inconsolata: `${GOOGLE_FONT_DIR}/inconsolata/Inconsolata-Regular.ttf`,
  "fira-sans": `${GOOGLE_FONT_DIR}/firasans/FiraSans-Regular.ttf`,
  "josefin-sans": `${GOOGLE_FONT_DIR}/josefinsans/JosefinSans-Regular.ttf`,
  "cormorant-garamond": `${GOOGLE_FONT_DIR}/cormorantgaramond/CormorantGaramond-Regular.ttf`,
  "libre-baskerville": `${GOOGLE_FONT_DIR}/librebaskerville/LibreBaskerville-Regular.ttf`,
  quicksand: `${GOOGLE_FONT_DIR}/quicksand/Quicksand-Regular.ttf`,
  comfortaa: `${GOOGLE_FONT_DIR}/comfortaa/Comfortaa-Regular.ttf`,
  "architects-daughter": `${GOOGLE_FONT_DIR}/architectsdaughter/ArchitectsDaughter-Regular.ttf`,
};

const FONT_BOLD_MAP = {
  // System fonts → visually similar Google Font bold variants
  default: DEJAVU_BOLD,
  arial: DEJAVU_BOLD,
  helvetica: DEJAVU_BOLD,
  georgia: `${GOOGLE_FONT_DIR}/librebaskerville/LibreBaskerville-Regular.ttf`,
  "times-new-roman": `${GOOGLE_FONT_DIR}/librebaskerville/LibreBaskerville-Regular.ttf`,
  "courier-new": "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
  verdana: `${GOOGLE_FONT_DIR}/nunito/Nunito-Regular.ttf`,
  "trebuchet-ms": `${GOOGLE_FONT_DIR}/firasans/FiraSans-Regular.ttf`,
  impact: `${GOOGLE_FONT_DIR}/anton/Anton-Regular.ttf`,
  "comic-sans-ms": `${GOOGLE_FONT_DIR}/architectsdaughter/ArchitectsDaughter-Regular.ttf`,
  palatino: `${GOOGLE_FONT_DIR}/cormorantgaramond/CormorantGaramond-Regular.ttf`,
  garamond: `${GOOGLE_FONT_DIR}/cormorantgaramond/CormorantGaramond-Regular.ttf`,
  bookman: `${GOOGLE_FONT_DIR}/librebaskerville/LibreBaskerville-Regular.ttf`,
  "avant-garde": `${GOOGLE_FONT_DIR}/josefinsans/JosefinSans-Regular.ttf`,

  // Google Fonts — bold variants
  roboto: `${GOOGLE_FONT_DIR}/roboto/Roboto-Bold.ttf`,
  "open-sans": `${GOOGLE_FONT_DIR}/opensans/OpenSans-Bold.ttf`,
  montserrat: `${GOOGLE_FONT_DIR}/montserrat/Montserrat-Bold.ttf`,
  lato: `${GOOGLE_FONT_DIR}/lato/Lato-Bold.ttf`,
  oswald: `${GOOGLE_FONT_DIR}/oswald/Oswald-Bold.ttf`,
  raleway: `${GOOGLE_FONT_DIR}/raleway/Raleway-Bold.ttf`,
  "playfair-display": `${GOOGLE_FONT_DIR}/playfairdisplay/PlayfairDisplay-Bold.ttf`,
  "roboto-slab": `${GOOGLE_FONT_DIR}/robotoslab/RobotoSlab-Regular.ttf`,
  poppins: `${GOOGLE_FONT_DIR}/poppins/Poppins-Regular.ttf`,
  nunito: `${GOOGLE_FONT_DIR}/nunito/Nunito-Regular.ttf`,
  "crimson-text": `${GOOGLE_FONT_DIR}/crimsontext/CrimsonText-Regular.ttf`,
  bitter: `${GOOGLE_FONT_DIR}/bitter/Bitter-Regular.ttf`,
  "dancing-script": `${GOOGLE_FONT_DIR}/dancingscript/DancingScript-Regular.ttf`,
  "great-vibes": `${GOOGLE_FONT_DIR}/greatvibes/GreatVibes-Regular.ttf`,
  pacifico: `${GOOGLE_FONT_DIR}/pacifico/Pacifico-Regular.ttf`,
  caveat: `${GOOGLE_FONT_DIR}/caveat/Caveat-Regular.ttf`,
  "bebas-neue": `${GOOGLE_FONT_DIR}/bebasneue/BebasNeue-Regular.ttf`,
  anton: `${GOOGLE_FONT_DIR}/anton/Anton-Regular.ttf`,
  righteous: `${GOOGLE_FONT_DIR}/righteous/Righteous-Regular.ttf`,
  "permanent-marker": `${GOOGLE_FONT_DIR}/permanentmarker/PermanentMarker-Regular.ttf`,
  bangers: `${GOOGLE_FONT_DIR}/bangers/Bangers-Regular.ttf`,
  "space-mono": `${GOOGLE_FONT_DIR}/spacemono/SpaceMono-Regular.ttf`,
  "source-code-pro": `${GOOGLE_FONT_DIR}/sourcecodepro/SourceCodePro-Regular.ttf`,
  inconsolata: `${GOOGLE_FONT_DIR}/inconsolata/Inconsolata-Regular.ttf`,
  "fira-sans": `${GOOGLE_FONT_DIR}/firasans/FiraSans-Regular.ttf`,
  "josefin-sans": `${GOOGLE_FONT_DIR}/josefinsans/JosefinSans-Regular.ttf`,
  "cormorant-garamond": `${GOOGLE_FONT_DIR}/cormorantgaramond/CormorantGaramond-Regular.ttf`,
  "libre-baskerville": `${GOOGLE_FONT_DIR}/librebaskerville/LibreBaskerville-Regular.ttf`,
  quicksand: `${GOOGLE_FONT_DIR}/quicksand/Quicksand-Regular.ttf`,
  comfortaa: `${GOOGLE_FONT_DIR}/comfortaa/Comfortaa-Regular.ttf`,
  "architects-daughter": `${GOOGLE_FONT_DIR}/architectsdaughter/ArchitectsDaughter-Regular.ttf`,
};

async function resolveFont(slug, bold = false) {
  const map = bold ? FONT_BOLD_MAP : FONT_MAP;
  const fallback = bold ? DEJAVU_BOLD : DEJAVU_REGULAR;
  if (!slug || slug === "default") return fallback;

  const candidate = map[slug];
  if (!candidate) {
    console.warn(`[video.js] Unknown font slug "${slug}", using DejaVu fallback`);
    return fallback;
  }

  try {
    await fs.access(candidate);
    return candidate;
  } catch {
    console.warn(`[video.js] Font file not found: ${candidate}, using DejaVu fallback`);
    return fallback;
  }
}

// ─── Emoji support via Twemoji ─────────────────────────────────────────────────
const TWEMOJI_BASE = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72";

async function getEmojiDataUri(emoji) {
  if (!emoji) return null;
  try {
    const rawCodepoints = [...emoji]
      .map(c => c.codePointAt(0).toString(16))
      .join("-");

    const noFe0fCodepoints = [...emoji]
      .map(c => c.codePointAt(0).toString(16))
      .filter(cp => cp !== "fe0f")
      .join("-");

    for (const cp of [noFe0fCodepoints, rawCodepoints]) {
      const url = `${TWEMOJI_BASE}/${cp}.png`;
      try {
        const res = await fetch(url);
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          console.log(`[video.js] Fetched Twemoji for "${emoji}" → ${cp}.png`);
          return `data:image/png;base64,${buf.toString("base64")}`;
        }
      } catch { /* try next variant */ }
    }

    console.warn(`[video.js] Twemoji not found for "${emoji}"`);
    return null;
  } catch (e) {
    console.warn(`[video.js] Failed to fetch Twemoji for "${emoji}":`, e.message);
    return null;
  }
}

// ─── Sticker rendering ─────────────────────────────────────────────────────────

const TW_COLOR_HEX = {
  "pink-500": "#ec4899", "pink-600": "#db2777",
  "purple-500": "#a855f7", "purple-700": "#7e22ce",
  "blue-500": "#3b82f6", "blue-600": "#2563eb", "blue-800": "#1e40af",
  "cyan-500": "#06b6d4", "cyan-600": "#0891b2",
  "green-500": "#22c55e", "green-600": "#16a34a",
  "emerald-500": "#10b981", "emerald-600": "#059669",
  "violet-500": "#8b5cf6",
  "fuchsia-500": "#d946ef",
  "orange-500": "#f97316", "orange-600": "#ea580c",
  "red-500": "#ef4444", "red-600": "#dc2626",
  "indigo-500": "#6366f1",
  "amber-400": "#fbbf24", "amber-500": "#f59e0b", "amber-600": "#d97706",
  "yellow-400": "#facc15", "yellow-500": "#eab308", "yellow-600": "#ca8a04",
  "teal-500": "#14b8a6",
  "sky-500": "#0ea5e9",
  "slate-500": "#64748b", "slate-600": "#475569",
  "rose-400": "#fb7185", "rose-500": "#f43f5e", "rose-600": "#e11d48",
  "gray-600": "#4b5563", "gray-700": "#374151",
  "lime-500": "#84cc16",
};

function parseTwGradient(bgColor) {
  if (!bgColor) return ["#6366f1", "#8b5cf6"];
  const fromMatch = bgColor.match(/from-([a-z]+-\d+)/);
  const toMatch = bgColor.match(/to-([a-z]+-\d+)/);
  const from = fromMatch ? (TW_COLOR_HEX[fromMatch[1]] || "#6366f1") : "#6366f1";
  const to = toMatch ? (TW_COLOR_HEX[toMatch[1]] || from) : from;
  return [from, to];
}

async function renderStickerPng({ label, bgColor, textColor, emoji, outPath, width = 200, height = 44 }) {
  const [gradFrom, gradTo] = parseTwGradient(bgColor);
  const isWhite = !textColor || textColor.includes("white");
  const fill = isWhite ? "#ffffff" : "#000000";

  const fontSize = label.length > 20 ? 11 : label.length > 14 ? 13 : 14;
  const textWidth = label.length * fontSize * 0.6;
  const padding = 24;

  const emojiDataUri = await getEmojiDataUri(emoji);
  const emojiSize = Math.round(height * 0.55);
  const emojiWidth = emojiDataUri ? emojiSize + 6 : 0;
  const actualWidth = Math.max(width, Math.round(textWidth + emojiWidth + padding * 2));

  const emojiElement = emojiDataUri
    ? `<image xlink:href="${emojiDataUri}" x="${padding - 2}" y="${(height - emojiSize) / 2}" width="${emojiSize}" height="${emojiSize}"/>`
    : "";
  const textX = padding + emojiWidth - (emojiDataUri ? 2 : 0);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${actualWidth}" height="${height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${gradFrom}"/>
      <stop offset="100%" stop-color="${gradTo}"/>
    </linearGradient>
  </defs>
  <rect width="${actualWidth}" height="${height}" rx="${height / 2}" fill="url(#g)"/>
  ${emojiElement}
  <text x="${textX}" y="${height / 2 + 1}" dominant-baseline="central" font-family="DejaVu Sans, sans-serif" font-size="${fontSize}" font-weight="600" fill="${fill}">${label.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</text>
</svg>`;

  const svgPath = outPath.replace(/\.png$/, ".svg");
  await fs.writeFile(svgPath, svg, "utf-8");

  try {
    await run("rsvg-convert", ["-w", String(actualWidth), "-h", String(height), "-o", outPath, svgPath]);
    await fs.unlink(svgPath).catch(() => {});
    return { path: outPath, width: actualWidth, height };
  } catch {
    try {
      await run("convert", ["-background", "none", "-resize", `${actualWidth}x${height}`, svgPath, outPath]);
      await fs.unlink(svgPath).catch(() => {});
      return { path: outPath, width: actualWidth, height };
    } catch {
      console.warn("[video.js] Cannot render sticker PNG (no rsvg-convert or convert)");
      await fs.unlink(svgPath).catch(() => {});
      return null;
    }
  }
}

// --- Inline SVG icon definitions ---

const SOCIAL_ICON_SVGS = {
  facebook: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#1877F2"/><path d="M16 12.5h-2v6h-3v-6H9V10h2V8.5c0-2 1-3 3-3h2v2.5h-1.5c-.5 0-.5.3-.5.7V10h2.5l-.5 2.5z" fill="#fff"/></svg>`,
  instagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#E4405F"/><rect x="6.5" y="6.5" width="11" height="11" rx="3" fill="none" stroke="#fff" stroke-width="1.3"/><circle cx="12" cy="12" r="2.2" fill="none" stroke="#fff" stroke-width="1.3"/><circle cx="15.5" cy="8.5" r="1" fill="#fff"/></svg>`,
  twitter: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#000"/><path d="M14.7 7h1.8l-3.9 4.5 4.6 6h-3.3l-2.7-3.5-3.1 3.5H6.3l4.2-4.8L5.8 7h3.4l2.4 3.2L14.7 7zm-.6 9.4h1l-6.5-9.5h-1.1l6.6 9.5z" fill="#fff"/></svg>`,
  linkedin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#0A66C2"/><path d="M8.5 10v6H7v-6h1.5zm-.75-3a1 1 0 110 2 1 1 0 010-2zm2.75 3h1.4v.8c.3-.5 1-.9 1.9-.9 1.7 0 2.2.9 2.2 2.5v3.6h-1.5v-3.2c0-.9-.3-1.4-1.1-1.4-.8 0-1.2.5-1.2 1.3v3.3H10.5v-6z" fill="#fff"/></svg>`,
  youtube: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#FF0000"/><path d="M10 8.5l6 3.5-6 3.5V8.5z" fill="#fff"/></svg>`,
  tiktok: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#010101"/><path d="M14 7v5.5a3.5 3.5 0 01-3.5 3.5A3.5 3.5 0 017 12.5 3.5 3.5 0 0110.5 9c.3 0 .5 0 .8.1v1.6c-.3-.1-.5-.2-.8-.2a1.8 1.8 0 100 3.6c1 0 1.8-.8 1.8-1.8V7H14zm0 0c.5 1 1.4 1.6 2.5 1.7v1.6c-1-.1-1.9-.6-2.5-1.3" fill="#fff"/></svg>`,
};

const CONTACT_ICON_SVGS = {
  email: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#666"/><rect x="5" y="8" width="14" height="8" rx="1" fill="none" stroke="#fff" stroke-width="1.2"/><path d="M5 8l7 5 7-5" fill="none" stroke="#fff" stroke-width="1.2"/></svg>`,
  phone: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#666"/><path d="M8.5 6h2.5l1 3-1.5 1c.7 1.5 2 2.8 3.5 3.5l1-1.5 3 1v2.5c0 .5-.5 1-1 1C11 17 7 13 6.5 7.5c0-.5.5-1 1-1z" fill="#fff"/></svg>`,
  website: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#666"/><circle cx="12" cy="12" r="5.5" fill="none" stroke="#fff" stroke-width="1.2"/><ellipse cx="12" cy="12" rx="2.5" ry="5.5" fill="none" stroke="#fff" stroke-width="1"/><line x1="6.5" y1="12" x2="17.5" y2="12" stroke="#fff" stroke-width="1"/></svg>`,
  address: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#666"/><path d="M12 5.5c-2.5 0-4.5 2-4.5 4.5 0 3.5 4.5 8.5 4.5 8.5s4.5-5 4.5-8.5c0-2.5-2-4.5-4.5-4.5z" fill="none" stroke="#fff" stroke-width="1.2"/><circle cx="12" cy="10" r="1.5" fill="#fff"/></svg>`,
};

async function svgToPng(svgContent, outPath, size = 20) {
  const svgPath = outPath.replace(/\.png$/, ".svg");
  await fs.writeFile(svgPath, svgContent, "utf-8");

  try {
    await run("rsvg-convert", ["-w", String(size), "-h", String(size), "-o", outPath, svgPath]);
    await fs.unlink(svgPath).catch(() => {});
    return outPath;
  } catch {
    try {
      await run("convert", ["-background", "none", "-resize", `${size}x${size}`, svgPath, outPath]);
      await fs.unlink(svgPath).catch(() => {});
      return outPath;
    } catch {
      console.warn("[video.js] No rsvg-convert or convert available, using SVG directly");
      const svgFinal = outPath.replace(/\.png$/, ".svg");
      if (svgPath !== svgFinal) await fs.rename(svgPath, svgFinal).catch(() => {});
      return svgFinal;
    }
  }
}

async function prepareFooterIcons({ social, contact, jobDir, iconSize = 18 }) {
  const entries = [];

  if (contact?.website) entries.push({ key: "website", svg: CONTACT_ICON_SVGS.website, label: contact.website });
  if (contact?.phone)   entries.push({ key: "phone",   svg: CONTACT_ICON_SVGS.phone,   label: contact.phone });
  if (contact?.email)   entries.push({ key: "email",   svg: CONTACT_ICON_SVGS.email,   label: contact.email });
  if (contact?.address) entries.push({ key: "address", svg: CONTACT_ICON_SVGS.address,  label: contact.address });

  if (social) {
    const platforms = ["facebook", "instagram", "twitter", "linkedin", "youtube", "tiktok"];
    for (const p of platforms) {
      if (social[p]) {
        entries.push({ key: p, svg: SOCIAL_ICON_SVGS[p], label: extractHandle(social[p]) });
      }
    }
  }

  return Promise.all(
    entries.map(async (entry) => {
      const iconPath = path.join(jobDir, `icon_${entry.key}.png`);
      const finalPath = await svgToPng(entry.svg, iconPath, iconSize);
      return { key: entry.key, iconPath: finalPath, label: entry.label };
    })
  );
}

function getOverlayPosition(position, padding = 20) {
  switch (position) {
    case "top-left":      return `${padding}:${padding}`;
    case "top-center":    return `(W-w)/2:${padding}`;
    case "top-right":     return `W-w-${padding}:${padding}`;
    case "bottom-left":   return `${padding}:H-h-${padding}`;
    case "bottom-center": return `(W-w)/2:H-h-${padding}`;
    case "bottom-right":  return `W-w-${padding}:H-h-${padding}`;
    case "center":        return "(W-w)/2:(H-h)/2";
    default:              return `W-w-${padding}:H-h-${padding}`;
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

// ─── Video probe helper ────────────────────────────────────────────────────────
// Returns { width, height, fps } of the input video for segment generation.

function probeVideoInfo(inputPath) {
  try {
    const out = execFileSync("ffprobe", [
      "-v", "error",
      "-select_streams", "v:0",
      "-show_entries", "stream=width,height,r_frame_rate",
      "-of", "csv=p=0",
      inputPath,
    ], { encoding: "utf-8" }).trim();
    const parts = out.split(",");
    const width = parseInt(parts[0], 10) || 1920;
    const height = parseInt(parts[1], 10) || 1080;
    const fpsRaw = parts[2] || "30/1";
    const fpsParts = fpsRaw.split("/");
    const fps = fpsParts.length === 2
      ? Math.round(parseInt(fpsParts[0], 10) / parseInt(fpsParts[1], 10))
      : parseInt(fpsRaw, 10) || 30;
    console.log(`[video.js] Probed video: ${width}x${height} @ ${fps}fps`);
    return { width, height, fps };
  } catch (e) {
    console.warn(`[video.js] ffprobe failed, using defaults: ${e.message}`);
    return { width: 1920, height: 1080, fps: 30 };
  }
}

// ─── Star rating SVG renderer ──────────────────────────────────────────────────
// Renders N filled-yellow / empty-grey stars as a PNG via SVG + rsvg-convert.

async function renderStarRatingPng({ rating, max = 5, outPath, starSize = 18 }) {
  const gap = 3;
  const totalWidth = max * starSize + (max - 1) * gap;
  const filledColor = "#facc15"; // yellow-400
  const emptyColor = "#9ca3af";  // gray-400

  let stars = "";
  for (let i = 0; i < max; i++) {
    const x = i * (starSize + gap);
    const color = i < rating ? filledColor : emptyColor;
    const scale = starSize / 24;
    stars += `<g transform="translate(${x}, 0) scale(${scale})">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="${color}"/>
    </g>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${starSize}">${stars}</svg>`;
  const svgPath = outPath.replace(/\.png$/, ".svg");
  await fs.writeFile(svgPath, svg, "utf-8");

  try {
    await run("rsvg-convert", ["-w", String(totalWidth), "-h", String(starSize), "-o", outPath, svgPath]);
    await fs.unlink(svgPath).catch(() => {});
    return { path: outPath, width: totalWidth, height: starSize };
  } catch {
    try {
      await run("convert", ["-background", "none", "-resize", `${totalWidth}x${starSize}`, svgPath, outPath]);
      await fs.unlink(svgPath).catch(() => {});
      return { path: outPath, width: totalWidth, height: starSize };
    } catch {
      console.warn("[video.js] Cannot render star rating PNG");
      await fs.unlink(svgPath).catch(() => {});
      return null;
    }
  }
}

// ─── Template custom fields overlay renderer ───────────────────────────────────
// Appends FFmpeg drawtext / overlay filters for template-specific fields:
//   • Testimonial Overlay  → reviewerName, reviewerTitle, starRating
//   • Lower Third / Speaker → speakerName, speakerTitle
//   • Product Demo Banner  → productName, productPrice
//   • Event Countdown      → eventName, eventDate, eventLocation (CENTERED)
//   • Hiring / Announcement → announcementText (ABOVE footer)
//   • Chapter Marker       → chapterTitle, chapterNumber
//   • Customer Quote Card  → quoteText, quoteName, quoteCompany
//   • Split-Screen Compare → beforeLabel, afterLabel
//
// IMPORTANT: drawbox uses "ih" for input height; drawtext uses "H" for video height.

async function buildTemplateOverlayFilters({
  templateCustomFields, bgColor, fontColor, fontPath, boldFontPath,
  tempDir, lastLabel, inputIndex, inputs, filters,
  hasFooterContent,
}) {
  if (!templateCustomFields || typeof templateCustomFields !== "object") {
    return { lastLabel, inputIndex, cleanupPaths: [], skipFooter: false };
  }

  const cf = templateCustomFields;
  const cleanupPaths = [];
  let skipFooter = false;

  // ── Testimonial Overlay (reviewerName, reviewerTitle, starRating) ──────────
  const hasTestimonial = cf.reviewerName || cf.reviewerTitle || cf.starRating;
  if (hasTestimonial) {
    const barHeight = 70;
    const barY = `ih-${barHeight}-30`;

    filters.push(
      `${lastLabel}drawbox=x=0:y=${barY}:w=iw:h=${barHeight}:color=${bgColor}@0.75:t=fill[v_testi_bg]`
    );
    lastLabel = "[v_testi_bg]";

    let textY = 0;

    if (cf.reviewerName) {
      const escaped = escapeDrawText(String(cf.reviewerName));
      const nameY = `H-${barHeight}-30+12`;
      filters.push(
        `${lastLabel}drawtext=text='${escaped}':fontsize=20:fontcolor=${fontColor}:x=20:y=${nameY}:fontfile=${boldFontPath}[v_testi_name]`
      );
      lastLabel = "[v_testi_name]";
      textY = 36;
    }

    if (cf.reviewerTitle) {
      const escaped = escapeDrawText(String(cf.reviewerTitle));
      const titleY = `H-${barHeight}-30+${textY > 0 ? textY : 14}`;
      filters.push(
        `${lastLabel}drawtext=text='${escaped}':fontsize=14:fontcolor=${fontColor}@0.8:x=20:y=${titleY}:fontfile=${fontPath}[v_testi_title]`
      );
      lastLabel = "[v_testi_title]";
      textY = textY > 0 ? textY + 20 : 38;
    }

    if (cf.starRating && Number(cf.starRating) > 0) {
      const rating = Math.min(5, Math.max(0, Math.round(Number(cf.starRating))));
      const starPngPath = path.join(tempDir, "stars_rating.png");
      const starResult = await renderStarRatingPng({
        rating,
        max: 5,
        outPath: starPngPath,
        starSize: 16,
      });
      if (starResult) {
        inputs.push("-i", starResult.path);
        const starLabel = "star_rating";
        filters.push(`[${inputIndex}:v]format=rgba[${starLabel}]`);
        const starY = `H-${barHeight}-30+${textY > 0 ? textY : 14}`;
        filters.push(
          `${lastLabel}[${starLabel}]overlay=x=20:y=${starY}[v_testi_stars]`
        );
        lastLabel = "[v_testi_stars]";
        inputIndex++;
        cleanupPaths.push(starResult.path);
      }
    }

    console.log(`[video.js] Testimonial overlay: name=${cf.reviewerName || "—"}, title=${cf.reviewerTitle || "—"}, stars=${cf.starRating || "—"}`);
  }

  // ── Lower Third / Speaker Bar (speakerName, speakerTitle) ─────────────────
  const hasSpeaker = cf.speakerName || cf.speakerTitle;
  if (hasSpeaker && !hasTestimonial) {
    const barHeight = 56;
    const barY = `ih-${barHeight}-25`;

    filters.push(
      `${lastLabel}drawbox=x=0:y=${barY}:w=iw:h=${barHeight}:color=${bgColor}@0.75:t=fill[v_spk_bg]`
    );
    lastLabel = "[v_spk_bg]";

    if (cf.speakerName) {
      const escaped = escapeDrawText(String(cf.speakerName));
      const nameY = `H-${barHeight}-25+10`;
      filters.push(
        `${lastLabel}drawtext=text='${escaped}':fontsize=18:fontcolor=${fontColor}:x=20:y=${nameY}:fontfile=${boldFontPath}[v_spk_name]`
      );
      lastLabel = "[v_spk_name]";
    }

    if (cf.speakerTitle) {
      const escaped = escapeDrawText(String(cf.speakerTitle));
      const titleY = `H-${barHeight}-25+32`;
      filters.push(
        `${lastLabel}drawtext=text='${escaped}':fontsize=13:fontcolor=${fontColor}@0.8:x=20:y=${titleY}:fontfile=${fontPath}[v_spk_title]`
      );
      lastLabel = "[v_spk_title]";
    }

    console.log(`[video.js] Speaker overlay: name=${cf.speakerName || "—"}, title=${cf.speakerTitle || "—"}`);
  }

  // ── Product Demo Banner (productName, productPrice) ───────────────────────
  const hasProduct = cf.productName || cf.productPrice;
  if (hasProduct) {
    const barHeight = 48;
    filters.push(
      `${lastLabel}drawbox=x=0:y=0:w=iw:h=${barHeight}:color=${bgColor}@0.8:t=fill[v_prod_bg]`
    );
    lastLabel = "[v_prod_bg]";

    if (cf.productName) {
      const escaped = escapeDrawText(String(cf.productName));
      filters.push(
        `${lastLabel}drawtext=text='${escaped}':fontsize=18:fontcolor=${fontColor}:x=20:y=14:fontfile=${boldFontPath}[v_prod_name]`
      );
      lastLabel = "[v_prod_name]";
    }

    if (cf.productPrice) {
      const escaped = escapeDrawText(String(cf.productPrice));
      filters.push(
        `${lastLabel}drawtext=text='${escaped}':fontsize=18:fontcolor=${fontColor}:x=W-tw-20:y=14:fontfile=${boldFontPath}[v_prod_price]`
      );
      lastLabel = "[v_prod_price]";
    }

    console.log(`[video.js] Product overlay: name=${cf.productName || "—"}, price=${cf.productPrice || "—"}`);
  }

  // ── Event Countdown — CENTERED display (eventName, eventDate, eventLocation) ──
  const hasEvent = cf.eventName || cf.eventDate || cf.eventLocation;
  if (hasEvent) {
    // Centered semi-transparent box instead of a footer strip
    const boxW = 500;
    const boxH = 140;
    const boxX = `(iw-${boxW})/2`;
    const boxY = `(ih-${boxH})/2`;

    filters.push(
      `${lastLabel}drawbox=x=${boxX}:y=${boxY}:w=${boxW}:h=${boxH}:color=${bgColor}@0.8:t=fill[v_evt_bg]`
    );
    lastLabel = "[v_evt_bg]";

    let yOff = 25; // offset inside the box, relative to box top

    if (cf.eventName) {
      const escaped = escapeDrawText(String(cf.eventName));
      const nameY = `(H-${boxH})/2+${yOff}`;
      filters.push(
        `${lastLabel}drawtext=text='${escaped}':fontsize=24:fontcolor=${fontColor}:x=(W-tw)/2:y=${nameY}:fontfile=${boldFontPath}[v_evt_name]`
      );
      lastLabel = "[v_evt_name]";
      yOff += 36;
    }

    if (cf.eventDate) {
      const escaped = escapeDrawText(String(cf.eventDate));
      const dateY = `(H-${boxH})/2+${yOff}`;
      filters.push(
        `${lastLabel}drawtext=text='${escaped}':fontsize=16:fontcolor=${fontColor}@0.9:x=(W-tw)/2:y=${dateY}:fontfile=${fontPath}[v_evt_date]`
      );
      lastLabel = "[v_evt_date]";
      yOff += 26;
    }

    if (cf.eventLocation) {
      const escaped = escapeDrawText(String(cf.eventLocation));
      const locY = `(H-${boxH})/2+${yOff}`;
      filters.push(
        `${lastLabel}drawtext=text='${escaped}':fontsize=14:fontcolor=${fontColor}@0.8:x=(W-tw)/2:y=${locY}:fontfile=${fontPath}[v_evt_loc]`
      );
      lastLabel = "[v_evt_loc]";
    }

    // Skip the standard footer — event countdown uses the centered display only
    skipFooter = true;

    console.log(`[video.js] Event countdown (centered): name=${cf.eventName || "—"}, date=${cf.eventDate || "—"}, location=${cf.eventLocation || "—"}`);
  }

  // ── Hiring / Announcement Bar (announcementText) — ABOVE footer ───────────
  if (cf.announcementText) {
    const barHeight = 40;
    // Position above the footer bar (footer is 32px). If no footer, sit at bottom.
    const footerOffset = hasFooterContent ? 32 : 0;
    const barY = `ih-${barHeight}-${footerOffset}`;

    filters.push(
      `${lastLabel}drawbox=x=0:y=${barY}:w=iw:h=${barHeight}:color=${bgColor}@0.85:t=fill[v_ann_bg]`
    );
    lastLabel = "[v_ann_bg]";

    const escaped = escapeDrawText(String(cf.announcementText));
    const textY = `H-${barHeight}-${footerOffset}+12`;
    filters.push(
      `${lastLabel}drawtext=text='${escaped}':fontsize=16:fontcolor=${fontColor}:x=(W-tw)/2:y=${textY}:fontfile=${boldFontPath}[v_ann_text]`
    );
    lastLabel = "[v_ann_text]";

    console.log(`[video.js] Announcement overlay (above footer): text=${cf.announcementText}`);
  }

  // ── Chapter Marker (chapterTitle, chapterNumber) ──────────────────────────
  const hasChapter = cf.chapterTitle || cf.chapterNumber;
  if (hasChapter) {
    const barHeight = 60;
    const barY = `(ih-${barHeight})/2`;

    filters.push(
      `${lastLabel}drawbox=x=0:y=${barY}:w=iw:h=${barHeight}:color=${bgColor}@0.8:t=fill[v_chap_bg]`
    );
    lastLabel = "[v_chap_bg]";

    if (cf.chapterNumber) {
      const escaped = escapeDrawText(String(cf.chapterNumber));
      const numY = `(H-${barHeight})/2+8`;
      filters.push(
        `${lastLabel}drawtext=text='${escaped}':fontsize=12:fontcolor=${fontColor}@0.7:x=(W-tw)/2:y=${numY}:fontfile=${fontPath}[v_chap_num]`
      );
      lastLabel = "[v_chap_num]";
    }

    if (cf.chapterTitle) {
      const escaped = escapeDrawText(String(cf.chapterTitle));
      const titleY = cf.chapterNumber ? `(H-${barHeight})/2+26` : `(H-${barHeight})/2+18`;
      filters.push(
        `${lastLabel}drawtext=text='${escaped}':fontsize=22:fontcolor=${fontColor}:x=(W-tw)/2:y=${titleY}:fontfile=${boldFontPath}[v_chap_title]`
      );
      lastLabel = "[v_chap_title]";
    }

    console.log(`[video.js] Chapter marker overlay: number=${cf.chapterNumber || "—"}, title=${cf.chapterTitle || "—"}`);
  }

  // ── Customer Quote Card (quoteText, quoteName, quoteCompany) ──────────────
  const hasQuote = cf.quoteText || cf.quoteName || cf.quoteCompany;
  if (hasQuote) {
    const barHeight = 95;
    const barY = `ih-${barHeight}`;

    filters.push(
      `${lastLabel}drawbox=x=0:y=${barY}:w=iw:h=${barHeight}:color=${bgColor}@0.8:t=fill[v_quote_bg]`
    );
    lastLabel = "[v_quote_bg]";

    if (cf.quoteText) {
      const escaped = escapeDrawText(`"${String(cf.quoteText)}"`);
      const quoteY = `H-${barHeight}+12`;
      filters.push(
        `${lastLabel}drawtext=text='${escaped}':fontsize=16:fontcolor=${fontColor}:x=20:y=${quoteY}:fontfile=${fontPath}[v_quote_txt]`
      );
      lastLabel = "[v_quote_txt]";
    }

    const attrParts = [];
    if (cf.quoteName) attrParts.push(String(cf.quoteName));
    if (cf.quoteCompany) attrParts.push(String(cf.quoteCompany));
    if (attrParts.length > 0) {
      const escaped = escapeDrawText("— " + attrParts.join(", "));
      const attrY = cf.quoteText ? `H-${barHeight}+50` : `H-${barHeight}+20`;
      filters.push(
        `${lastLabel}drawtext=text='${escaped}':fontsize=13:fontcolor=${fontColor}@0.8:x=20:y=${attrY}:fontfile=${boldFontPath}[v_quote_attr]`
      );
      lastLabel = "[v_quote_attr]";
    }

    console.log(`[video.js] Quote card overlay: text=${cf.quoteText ? cf.quoteText.slice(0, 40) + "…" : "—"}, name=${cf.quoteName || "—"}, company=${cf.quoteCompany || "—"}`);
  }

  // ── Split-Screen Compare (beforeLabel, afterLabel) ────────────────────────
  const hasSplit = cf.beforeLabel || cf.afterLabel;
  if (hasSplit) {
    filters.push(
      `${lastLabel}drawbox=x=(iw-2)/2:y=0:w=2:h=ih:color=${bgColor}@0.6:t=fill[v_split_div]`
    );
    lastLabel = "[v_split_div]";

    if (cf.beforeLabel) {
      const escaped = escapeDrawText(String(cf.beforeLabel));
      const pillY = `ih-50`;
      filters.push(
        `${lastLabel}drawbox=x=10:y=${pillY}:w=120:h=30:color=${bgColor}@0.7:t=fill[v_split_lbg]`
      );
      lastLabel = "[v_split_lbg]";
      filters.push(
        `${lastLabel}drawtext=text='${escaped}':fontsize=14:fontcolor=${fontColor}:x=20:y=H-50+8:fontfile=${boldFontPath}[v_split_ltxt]`
      );
      lastLabel = "[v_split_ltxt]";
    }

    if (cf.afterLabel) {
      const escaped = escapeDrawText(String(cf.afterLabel));
      const pillY = `ih-50`;
      filters.push(
        `${lastLabel}drawbox=x=iw-130:y=${pillY}:w=120:h=30:color=${bgColor}@0.7:t=fill[v_split_rbg]`
      );
      lastLabel = "[v_split_rbg]";
      filters.push(
        `${lastLabel}drawtext=text='${escaped}':fontsize=14:fontcolor=${fontColor}:x=W-120:y=H-50+8:fontfile=${boldFontPath}[v_split_rtxt]`
      );
      lastLabel = "[v_split_rtxt]";
    }

    console.log(`[video.js] Split-screen overlay: before=${cf.beforeLabel || "—"}, after=${cf.afterLabel || "—"}`);
  }

  return { lastLabel, inputIndex, cleanupPaths, skipFooter };
}

// ─── Branded text segment generator ────────────────────────────────────────────
// Creates a solid-color video segment with centered text overlays via drawtext.
// Used by Intro/Outro Bumper and End Card CTA templates.

async function createTextSegment({
  outPath, duration, width, height, fps, bgHex,
  fontColor, fontPath, boldFontPath, logoPath, logoHeight,
  lines, // Array of { text, fontSize, bold, yOffset, opacity }
}) {
  const filters = [];
  const inputs = [];
  let inputIndex = 0;
  let lastLabel = "[0:v]";

  // Generate solid color background
  const bgClean = bgHex.replace("0x", "#");
  filters.push(
    `color=c=${bgClean}:s=${width}x${height}:d=${duration}:r=${fps},format=yuv420p[bg]`
  );
  lastLabel = "[bg]";

  // Logo overlay centered
  if (logoPath) {
    inputs.push("-i", logoPath);
    const lh = logoHeight || 80;
    filters.push(`[${inputIndex}:v]scale=-1:${lh},format=rgba[seg_logo]`);
    // Place logo above text block center
    const logoY = Math.round(height * 0.25);
    filters.push(`${lastLabel}[seg_logo]overlay=(W-w)/2:${logoY}[v_seg_logo]`);
    lastLabel = "[v_seg_logo]";
    inputIndex++;
  }

  // Draw text lines
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.text) continue;
    const escaped = escapeDrawText(String(line.text));
    const fSize = line.fontSize || 20;
    const font = line.bold ? boldFontPath : fontPath;
    const opacity = line.opacity ? `@${line.opacity}` : "";
    const yPos = line.yOffset || Math.round(height / 2 + i * 30);
    const outLabel = `v_seg_t${i}`;
    filters.push(
      `${lastLabel}drawtext=text='${escaped}':fontsize=${fSize}:fontcolor=${fontColor}${opacity}:x=(W-tw)/2:y=${yPos}:fontfile=${font}[${outLabel}]`
    );
    lastLabel = `[${outLabel}]`;
  }

  const filterComplex = filters.join(";");
  const args = [
    "-y",
    ...inputs,
    "-filter_complex", filterComplex,
    "-map", lastLabel,
    "-t", String(duration),
    "-c:v", "libx264",
    "-preset", "fast",
    "-crf", "23",
    "-an",
    outPath,
  ];

  console.log(`[video.js] Creating text segment: ${duration}s ${width}x${height}`);
  await run("ffmpeg", args);
  return outPath;
}

// ─── End Card CTA segment with 2-column grid ───────────────────────────────────

async function createEndCardSegment({
  outPath, duration, width, height, fps, bgHex,
  fontColor, fontPath, boldFontPath, logoPath, logoHeight,
  brandName, tagline, social, contact,
  tempDir,
}) {
  const filters = [];
  const inputs = [];
  let inputIndex = 0;
  let lastLabel;

  const bgClean = bgHex.replace("0x", "#");
  filters.push(
    `color=c=${bgClean}:s=${width}x${height}:d=${duration}:r=${fps},format=yuv420p[bg]`
  );
  lastLabel = "[bg]";

  // Logo centered near top
  if (logoPath) {
    inputs.push("-i", logoPath);
    const lh = logoHeight || 80;
    filters.push(`[${inputIndex}:v]scale=-1:${lh},format=rgba[ec_logo]`);
    const logoY = Math.round(height * 0.12);
    filters.push(`${lastLabel}[ec_logo]overlay=(W-w)/2:${logoY}[v_ec_logo]`);
    lastLabel = "[v_ec_logo]";
    inputIndex++;
  }

  // Brand name
  let textY = Math.round(height * 0.35);
  if (brandName) {
    const escaped = escapeDrawText(String(brandName));
    filters.push(
      `${lastLabel}drawtext=text='${escaped}':fontsize=28:fontcolor=${fontColor}:x=(W-tw)/2:y=${textY}:fontfile=${boldFontPath}[v_ec_brand]`
    );
    lastLabel = "[v_ec_brand]";
    textY += 40;
  }

  // Tagline
  if (tagline) {
    const escaped = escapeDrawText(String(tagline));
    filters.push(
      `${lastLabel}drawtext=text='${escaped}':fontsize=16:fontcolor=${fontColor}@0.8:x=(W-tw)/2:y=${textY}:fontfile=${fontPath}[v_ec_tag]`
    );
    lastLabel = "[v_ec_tag]";
    textY += 35;
  }

  // Build grid entries (contact + social)
  const gridEntries = [];
  if (contact?.website) gridEntries.push({ key: "website", svg: CONTACT_ICON_SVGS.website, label: contact.website });
  if (contact?.phone)   gridEntries.push({ key: "phone",   svg: CONTACT_ICON_SVGS.phone,   label: contact.phone });
  if (contact?.email)   gridEntries.push({ key: "email",   svg: CONTACT_ICON_SVGS.email,   label: contact.email });
  if (contact?.address) gridEntries.push({ key: "address", svg: CONTACT_ICON_SVGS.address,  label: contact.address });
  if (social) {
    const platforms = ["facebook", "instagram", "twitter", "linkedin", "youtube", "tiktok"];
    for (const p of platforms) {
      if (social[p]) {
        gridEntries.push({ key: p, svg: SOCIAL_ICON_SVGS[p], label: extractHandle(social[p]) });
      }
    }
  }

  // Render grid in 2 columns
  if (gridEntries.length > 0) {
    const iconSize = 22;
    const rowHeight = 32;
    const colWidth = Math.round(width * 0.4);
    const gridStartY = textY + 10;
    const gridStartX = Math.round((width - colWidth * 2) / 2);

    for (let i = 0; i < gridEntries.length; i++) {
      const entry = gridEntries[i];
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = gridStartX + col * colWidth;
      const y = gridStartY + row * rowHeight;

      // Render icon PNG
      const iconOutPath = path.join(tempDir, `ec_icon_${entry.key}.png`);
      const iconPngPath = await svgToPng(entry.svg, iconOutPath, iconSize);
      inputs.push("-i", iconPngPath);
      const iconLabel = `ec_i_${i}`;
      filters.push(`[${inputIndex}:v]scale=${iconSize}:${iconSize},format=rgba[${iconLabel}]`);
      const overlayLabel = `v_ec_gi_${i}`;
      filters.push(`${lastLabel}[${iconLabel}]overlay=x=${x}:y=${y}[${overlayLabel}]`);
      lastLabel = `[${overlayLabel}]`;
      inputIndex++;

      // Draw label text next to icon
      const escaped = escapeDrawText(String(entry.label));
      const labelX = x + iconSize + 8;
      const labelY = y + 4;
      const labelOut = `v_ec_gt_${i}`;
      filters.push(
        `${lastLabel}drawtext=text='${escaped}':fontsize=13:fontcolor=${fontColor}@0.9:x=${labelX}:y=${labelY}:fontfile=${fontPath}[${labelOut}]`
      );
      lastLabel = `[${labelOut}]`;
    }
  }

  const filterComplex = filters.join(";");
  const args = [
    "-y",
    ...inputs,
    "-filter_complex", filterComplex,
    "-map", lastLabel,
    "-t", String(duration),
    "-c:v", "libx264",
    "-preset", "fast",
    "-crf", "23",
    "-an",
    outPath,
  ];

  console.log(`[video.js] Creating end card CTA segment: ${duration}s ${width}x${height}, ${gridEntries.length} grid items`);
  await run("ffmpeg", args);
  return outPath;
}

// ─── Concatenation helper ──────────────────────────────────────────────────────
// Concatenates segments via FFmpeg concat demuxer. All segments must have the same
// resolution, fps, and codec. Silent audio is added to segments that lack it.

async function concatSegments({ segments, outputPath, tempDir, hasAudio }) {
  // Add silent audio to segments that need it
  const prepared = [];
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (seg.needsAudio && hasAudio) {
      const withAudio = path.join(tempDir, `seg_audio_${i}.mp4`);
      await run("ffmpeg", [
        "-y",
        "-i", seg.path,
        "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
        "-c:v", "copy",
        "-c:a", "aac",
        "-shortest",
        withAudio,
      ]);
      prepared.push(withAudio);
    } else {
      prepared.push(seg.path);
    }
  }

  // Write concat list
  const listPath = path.join(tempDir, "concat_list.txt");
  const listContent = prepared.map(p => `file '${p}'`).join("\n");
  await fs.writeFile(listPath, listContent, "utf-8");

  await run("ffmpeg", [
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", listPath,
    "-c", "copy",
    outputPath,
  ]);

  // Cleanup
  await fs.unlink(listPath).catch(() => {});
  for (const p of prepared) {
    if (p !== segments.find(s => s.isMain)?.path) {
      // Don't delete the main branded video yet — caller handles that
    }
  }

  console.log(`[video.js] Concatenated ${segments.length} segments → ${outputPath}`);
}

// ─── Detect if input video has audio ───────────────────────────────────────────

function videoHasAudio(inputPath) {
  try {
    const out = execFileSync("ffprobe", [
      "-v", "error",
      "-select_streams", "a:0",
      "-show_entries", "stream=codec_type",
      "-of", "csv=p=0",
      inputPath,
    ], { encoding: "utf-8" }).trim();
    return out === "audio";
  } catch {
    return false;
  }
}

export async function brandVideo({
  inputPath, logoPath, outputPath, jobDir,
  logoSize = "medium", logoPosition = "bottom-right",
  logoOpacity = 0.9, logoTargetHeightPx, logoEnabled = true,
  brandName, primaryColor, tagline, contact, social, elements,
  fontFamily, stickers, stickerMeta,
  // Template identity
  templateFamilyId, template_family_id,
  // Template custom fields — nested objects
  templateCustomFields, template_custom_fields,
  // Root-level aliases the payload may carry
  reviewerName, reviewerTitle, starRating,
  speakerName, speakerTitle,
  productName, productPrice,
  eventName, eventDate, eventLocation,
  announcementText,
  chapterTitle, chapterNumber,
  quoteText, quoteName, quoteCompany,
  beforeLabel, afterLabel,
  introText, intro_text,
}) {
  const familyId = templateFamilyId || template_family_id || null;
  const mergedIntroText = introText || intro_text || null;

  // Merge template custom fields from all possible sources
  const mergedCustomFields = {
    ...(template_custom_fields || {}),
    ...(templateCustomFields || {}),
    // Root-level aliases override nested objects
    ...(reviewerName     ? { reviewerName } : {}),
    ...(reviewerTitle    ? { reviewerTitle } : {}),
    ...(starRating       ? { starRating } : {}),
    ...(speakerName      ? { speakerName } : {}),
    ...(speakerTitle     ? { speakerTitle } : {}),
    ...(productName      ? { productName } : {}),
    ...(productPrice     ? { productPrice } : {}),
    ...(eventName        ? { eventName } : {}),
    ...(eventDate        ? { eventDate } : {}),
    ...(eventLocation    ? { eventLocation } : {}),
    ...(announcementText ? { announcementText } : {}),
    ...(chapterTitle     ? { chapterTitle } : {}),
    ...(chapterNumber    ? { chapterNumber } : {}),
    ...(quoteText        ? { quoteText } : {}),
    ...(quoteName        ? { quoteName } : {}),
    ...(quoteCompany     ? { quoteCompany } : {}),
    ...(beforeLabel      ? { beforeLabel } : {}),
    ...(afterLabel       ? { afterLabel } : {}),
  };
  const hasCustomFields = Object.keys(mergedCustomFields).length > 0;

  const hasLogo = logoEnabled && logoPath;
  const targetHeight = logoTargetHeightPx || LOGO_SIZE_MAP[logoSize] || LOGO_SIZE_MAP.medium;
  const overlayPos = getOverlayPosition(logoPosition);
  const bgColor = primaryColor ? hexToFFmpegColor(primaryColor) : "0x000000";
  const fontColor = "0xFFFFFF";
  const tempDir = jobDir || path.dirname(outputPath);

  const iconSize = 18;
  const iconGap = 4;

  const fontPath = await resolveFont(fontFamily, false);
  const boldFontPath = await resolveFont(fontFamily, true);
  console.log(`[video.js] Font: slug=${fontFamily || "default"}, regular=${fontPath}, bold=${boldFontPath}`);

  const footerIcons = await prepareFooterIcons({ social, contact, jobDir: tempDir, iconSize });

  const stickerPngs = [];
  if (stickerMeta && Array.isArray(stickerMeta) && stickerMeta.length > 0) {
    console.log(`[video.js] Rendering ${stickerMeta.length} sticker(s)`);
    for (let i = 0; i < stickerMeta.length; i++) {
      const meta = stickerMeta[i];
      const outPath = path.join(tempDir, `sticker_${i}.png`);
      const result = await renderStickerPng({
        label: meta.label || "Sticker",
        bgColor: meta.bgColor || "",
        textColor: meta.textColor || "text-white",
        emoji: meta.emoji || null,
        outPath,
      });
      if (result) {
        stickerPngs.push(result);
      }
    }
    console.log(`[video.js] Rendered ${stickerPngs.length} sticker PNG(s)`);
  }

  const taglinePart = tagline ? escapeDrawText(tagline) : null;
  const hasFooterContent = taglinePart || footerIcons.length > 0;
  const hasHeader = !!brandName;

  // Detect concat templates
  const isEndCard = familyId === "vid-end-card";
  const isIntroBumper = familyId === "vid-intro-outro";
  const needsConcat = isEndCard || isIntroBumper;

  console.log(`[video.js] Branding: logo=${hasLogo} (${logoSize}/${targetHeight}px), header=${brandName || "none"}, footerIcons=${footerIcons.length}, tagline=${tagline || "none"}, stickers=${stickerPngs.length}, customFields=${hasCustomFields}, template=${familyId || "none"}, concat=${needsConcat}`);

  const filters = [];
  const inputs = ["-i", inputPath];
  let lastLabel = "[0:v]";
  let inputIndex = 1;

  if (hasLogo) {
    inputs.push("-i", logoPath);
    filters.push(`[${inputIndex}:v]scale=-1:${targetHeight},format=rgba,colorchannelmixer=aa=${logoOpacity}[logo]`);
    filters.push(`${lastLabel}[logo]overlay=${overlayPos}[v_logo]`);
    lastLabel = "[v_logo]";
    inputIndex++;
  }

  if (hasHeader) {
    const escapedName = escapeDrawText(brandName);
    filters.push(`${lastLabel}drawbox=x=0:y=0:w=iw:h=40:color=${bgColor}@0.7:t=fill[v_hdr_bg]`);
    lastLabel = "[v_hdr_bg]";
    filters.push(`${lastLabel}drawtext=text='${escapedName}':fontsize=18:fontcolor=${fontColor}:x=20:y=11:fontfile=${boldFontPath}[v_hdr]`);
    lastLabel = "[v_hdr]";
  }

  if (stickerPngs.length > 0) {
    const stickerPadding = 15;
    const stickerGap = 8;
    let stickerYOffset = hasHeader ? 50 : stickerPadding;

    for (let i = 0; i < stickerPngs.length; i++) {
      const sticker = stickerPngs[i];
      inputs.push("-i", sticker.path);
      const sLabel = `stk_${i}`;
      filters.push(`[${inputIndex}:v]format=rgba[${sLabel}]`);
      const outLabel = `v_stk_${i}`;
      filters.push(`${lastLabel}[${sLabel}]overlay=x=W-w-${stickerPadding}:y=${stickerYOffset}[${outLabel}]`);
      lastLabel = `[${outLabel}]`;
      inputIndex++;
      stickerYOffset += sticker.height + stickerGap;
    }
  }

  // ── Template custom field overlays ────────────────────────────────────────
  let extraCleanupPaths = [];
  let skipFooter = false;
  if (hasCustomFields) {
    const result = await buildTemplateOverlayFilters({
      templateCustomFields: mergedCustomFields,
      bgColor,
      fontColor,
      fontPath,
      boldFontPath,
      tempDir,
      lastLabel,
      inputIndex,
      inputs,
      filters,
      hasFooterContent,
    });
    lastLabel = result.lastLabel;
    inputIndex = result.inputIndex;
    if (result.cleanupPaths) extraCleanupPaths = result.cleanupPaths;
    if (result.skipFooter) skipFooter = true;
  }

  if (hasFooterContent && !skipFooter) {
    const footerHeight = 32;

    filters.push(`${lastLabel}drawbox=x=0:y=ih-${footerHeight}:w=iw:h=${footerHeight}:color=${bgColor}@0.7:t=fill[v_ftr_bg]`);
    lastLabel = "[v_ftr_bg]";

    const totalTextLen = (tagline || "").length +
      footerIcons.reduce((sum, e) => sum + e.label.length + 3, 0);
    const fontSize = totalTextLen > 100 ? 10 : totalTextLen > 60 ? 12 : 14;
    const charWidth = Math.round(fontSize * 0.6);
    const separatorWidth = Math.round(charWidth * 5);

    const segments = [];
    let totalWidth = 0;

    if (taglinePart) {
      const w = tagline.length * charWidth;
      segments.push({ type: "text", text: taglinePart, width: w });
      totalWidth += w;
    }

    for (const icon of footerIcons) {
      if (segments.length > 0) {
        segments.push({ type: "separator", width: separatorWidth });
        totalWidth += separatorWidth;
      }
      segments.push({ type: "icon", iconPath: icon.iconPath, key: icon.key, width: iconSize });
      totalWidth += iconSize + iconGap;
      const labelText = escapeDrawText(icon.label);
      const labelWidth = icon.label.length * charWidth;
      segments.push({ type: "text", text: labelText, width: labelWidth });
      totalWidth += labelWidth;
    }

    const startXExpr = `(W-${totalWidth})/2`;
    const iconYCenter = Math.round((footerHeight - iconSize) / 2);
    const textYOffset = Math.round((footerHeight - fontSize) / 2);

    let xOffset = 0;
    let segIdx = 0;

    for (const seg of segments) {
      if (seg.type === "icon") {
        inputs.push("-i", seg.iconPath);
        const iconLabel = `icon_${seg.key}`;
        filters.push(`[${inputIndex}:v]scale=${iconSize}:${iconSize},format=rgba[${iconLabel}]`);
        const outLabel = `v_fi_${segIdx}`;
        filters.push(`${lastLabel}[${iconLabel}]overlay=x='${startXExpr}+${xOffset}':y=H-${footerHeight}+${iconYCenter}[${outLabel}]`);
        lastLabel = `[${outLabel}]`;
        inputIndex++;
        xOffset += iconSize + iconGap;
      } else if (seg.type === "text") {
        const outLabel = `v_ft_${segIdx}`;
        filters.push(`${lastLabel}drawtext=text='${seg.text}':fontsize=${fontSize}:fontcolor=${fontColor}:x='${startXExpr}+${xOffset}':y=H-${footerHeight}+${textYOffset}:fontfile=${fontPath}[${outLabel}]`);
        lastLabel = `[${outLabel}]`;
        xOffset += seg.width;
      } else if (seg.type === "separator") {
        const outLabel = `v_fs_${segIdx}`;
        const sepText = escapeDrawText("  |  ");
        filters.push(`${lastLabel}drawtext=text='${sepText}':fontsize=${fontSize}:fontcolor=${fontColor}@0.5:x='${startXExpr}+${xOffset}':y=H-${footerHeight}+${textYOffset}:fontfile=${fontPath}[${outLabel}]`);
        lastLabel = `[${outLabel}]`;
        xOffset += seg.width;
      }
      segIdx++;
    }
  }

  // Determine output path — if concat needed, brand to a temp file first
  const brandedOutput = needsConcat
    ? path.join(tempDir, "branded_main.mp4")
    : outputPath;

  if (filters.length > 0) {
    // Normalize timestamps to prevent PTS drift with multiple overlays
    const finalLabel = lastLabel.replace("[", "").replace("]", "");
    filters.push(`[${finalLabel}]setpts=PTS-STARTPTS[v_out]`);

    const filterComplex = filters.join(";");
    const args = [
      "-y",
      ...inputs,
      "-filter_complex", filterComplex,
      "-map", "[v_out]",
      "-map", "0:a?",
      "-c:v", "libx264",
      "-preset", "fast",
      "-crf", "23",
      "-c:a", "copy",
      "-shortest",
      brandedOutput,
    ];
    console.log(`[video.js] FFmpeg filter_complex (${filters.length} filters, ${inputIndex} inputs)`);
    console.log(`[video.js] Filter: ${filterComplex.slice(0, 500)}...`);
    await run("ffmpeg", args);
  } else {
    console.log("[video.js] No branding elements, copying input to output");
    await fs.copyFile(inputPath, brandedOutput);
  }

  // ── Concat templates: End Card CTA / Intro-Outro Bumper ───────────────────
  if (needsConcat) {
    const videoInfo = probeVideoInfo(brandedOutput);
    const hasAudio = videoHasAudio(brandedOutput);
    const concatCleanup = [brandedOutput];

    try {
      if (isEndCard) {
        // Append a 10-second branded end card with 2-column grid
        const endCardPath = path.join(tempDir, "end_card.mp4");
        await createEndCardSegment({
          outPath: endCardPath,
          duration: 10,
          width: videoInfo.width,
          height: videoInfo.height,
          fps: videoInfo.fps,
          bgHex: bgColor,
          fontColor,
          fontPath,
          boldFontPath,
          logoPath: hasLogo ? logoPath : null,
          logoHeight: targetHeight,
          brandName,
          tagline,
          social,
          contact,
          tempDir,
        });
        concatCleanup.push(endCardPath);

        await concatSegments({
          segments: [
            { path: brandedOutput, isMain: true, needsAudio: false },
            { path: endCardPath, needsAudio: hasAudio },
          ],
          outputPath,
          tempDir,
          hasAudio,
        });

        console.log("[video.js] End Card CTA: appended 10s branded grid segment");

      } else if (isIntroBumper) {
        // Prepend 3s intro, append 5s outro
        const introPath = path.join(tempDir, "intro_seg.mp4");
        const outroPath = path.join(tempDir, "outro_seg.mp4");

        // Build intro text lines
        const introLines = [];
        const centerY = Math.round(videoInfo.height * 0.45);
        if (brandName) {
          introLines.push({ text: brandName, fontSize: 32, bold: true, yOffset: centerY });
        }
        if (mergedIntroText) {
          introLines.push({
            text: mergedIntroText,
            fontSize: 18,
            bold: false,
            yOffset: centerY + (brandName ? 44 : 0),
            opacity: 0.85,
          });
        }
        if (tagline && !mergedIntroText) {
          introLines.push({
            text: tagline,
            fontSize: 18,
            bold: false,
            yOffset: centerY + (brandName ? 44 : 0),
            opacity: 0.8,
          });
        }

        await createTextSegment({
          outPath: introPath,
          duration: 3,
          width: videoInfo.width,
          height: videoInfo.height,
          fps: videoInfo.fps,
          bgHex: bgColor,
          fontColor,
          fontPath,
          boldFontPath,
          logoPath: hasLogo ? logoPath : null,
          logoHeight: targetHeight,
          lines: introLines,
        });
        concatCleanup.push(introPath);

        // Build outro text lines
        const outroLines = [];
        const outroCenterY = Math.round(videoInfo.height * 0.45);
        if (brandName) {
          outroLines.push({ text: brandName, fontSize: 32, bold: true, yOffset: outroCenterY });
        }
        if (tagline) {
          outroLines.push({
            text: tagline,
            fontSize: 18,
            bold: false,
            yOffset: outroCenterY + (brandName ? 44 : 0),
            opacity: 0.8,
          });
        }

        await createTextSegment({
          outPath: outroPath,
          duration: 5,
          width: videoInfo.width,
          height: videoInfo.height,
          fps: videoInfo.fps,
          bgHex: bgColor,
          fontColor,
          fontPath,
          boldFontPath,
          logoPath: hasLogo ? logoPath : null,
          logoHeight: targetHeight,
          lines: outroLines,
        });
        concatCleanup.push(outroPath);

        await concatSegments({
          segments: [
            { path: introPath, needsAudio: hasAudio },
            { path: brandedOutput, isMain: true, needsAudio: false },
            { path: outroPath, needsAudio: hasAudio },
          ],
          outputPath,
          tempDir,
          hasAudio,
        });

        console.log("[video.js] Intro/Outro Bumper: prepended 3s intro + appended 5s outro");
      }
    } finally {
      // Clean up temp concat files
      for (const p of concatCleanup) {
        await fs.unlink(p).catch(() => {});
      }
    }
  }

  for (const icon of footerIcons) {
    await fs.unlink(icon.iconPath).catch(() => {});
  }
  for (const sticker of stickerPngs) {
    await fs.unlink(sticker.path).catch(() => {});
  }
  for (const p of extraCleanupPaths) {
    await fs.unlink(p).catch(() => {});
  }
}
