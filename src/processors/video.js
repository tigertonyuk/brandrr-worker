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

// â”€â”€â”€ Font resolution â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const GOOGLE_FONT_DIR = "/usr/share/fonts/google";
const DEJAVU_REGULAR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";
const DEJAVU_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";

const FONT_MAP = {
  // System fonts â†’ visually similar Google Fonts installed on the worker
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

  // Google Fonts â€” direct paths
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
  // System fonts â†’ visually similar Google Font bold variants
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

  // Google Fonts â€” bold variants
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

// â”€â”€â”€ Emoji support via Twemoji â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
          console.log(`[video.js] Fetched Twemoji for "${emoji}" â†’ ${cp}.png`);
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

// â”€â”€â”€ Sticker rendering â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

function hexToRgb(hex) {
  const normalized = String(hex || "").replace("#", "");
  if (normalized.length !== 6) return null;
  const parsed = Number.parseInt(normalized, 16);
  if (Number.isNaN(parsed)) return null;
  return [(parsed >> 16) & 255, (parsed >> 8) & 255, parsed & 255];
}

function relativeLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map((channel) => {
    const s = channel / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function rgbToHue([r, g, b]) {
  const nr = r / 255;
  const ng = g / 255;
  const nb = b / 255;
  const max = Math.max(nr, ng, nb);
  const min = Math.min(nr, ng, nb);
  const delta = max - min;

  if (delta === 0) return 0;

  let hue;
  if (max === nr) {
    hue = ((ng - nb) / delta) % 6;
  } else if (max === ng) {
    hue = (nb - nr) / delta + 2;
  } else {
    hue = (nr - ng) / delta + 4;
  }

  const degrees = hue * 60;
  return degrees < 0 ? degrees + 360 : degrees;
}

function isWarmYellowTone(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;

  const [r, g, b] = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;
  const value = max / 255;
  const hue = rgbToHue(rgb);

  return hue >= 28 && hue <= 68 && saturation >= 0.25 && value >= 0.4;
}

const LOW_CONTRAST_EMOJI = new Set([
  "â­",
  "ðŸŒŸ",
  "âœ¨",
  "ðŸ’¡",
  "âš¡",
  "ðŸ”¥",
  "â˜€",
  "ðŸŒž",
  "ðŸŸ¡",
  "ðŸ’›",
]);

function shouldAddEmojiBackdrop(gradientStops, emoji) {
  const luminances = (gradientStops || []).map(relativeLuminance).filter((v) => Number.isFinite(v));
  if (!luminances.length) return false;

  const maxLum = Math.max(...luminances);
  const avgLum = luminances.reduce((sum, lum) => sum + lum, 0) / luminances.length;
  const hasWarmGradient = (gradientStops || []).some(isWarmYellowTone);
  const normalizedEmoji = String(emoji || "").replace(/\uFE0F/g, "");
  const emojiIsWarm = LOW_CONTRAST_EMOJI.has(normalizedEmoji);

  if (avgLum >= 0.56 || maxLum >= 0.66) return true;
  if (hasWarmGradient && emojiIsWarm) return true;
  return false;
}

async function renderStickerPng({ label, bgColor, textColor, emoji, outPath, width = 200, height = 44 }) {
  const [gradFrom, gradTo] = parseTwGradient(bgColor);
  const isWhite = !textColor || textColor.includes("white");
  const fill = isWhite ? "#ffffff" : "#000000";

  const fontSize = label.length > 20 ? 11 : label.length > 14 ? 13 : 14;
  const textWidth = label.length * fontSize * 0.6;
  const padding = 24;
  const emojiGap = 8; // explicit gap between emoji and text

  const emojiDataUri = await getEmojiDataUri(emoji);
  const emojiSize = Math.round(height * 0.55);
  const emojiWidth = emojiDataUri ? emojiSize : 0;
  const contentWidth = emojiWidth + (emojiDataUri ? emojiGap : 0) + textWidth;
  const actualWidth = Math.max(width, Math.round(contentWidth + padding * 2));

  const emojiX = padding;
  const emojiY = (height - emojiSize) / 2;
  const emojiCenterX = emojiX + emojiSize / 2;
  const emojiCenterY = height / 2;
  const useEmojiBackdrop = shouldAddEmojiBackdrop([gradFrom, gradTo], emoji);
  const textX = padding + emojiWidth + (emojiDataUri ? emojiGap : 0);

  const emojiBackdropElement = emojiDataUri && useEmojiBackdrop
    ? `<circle cx="${emojiCenterX}" cy="${emojiCenterY}" r="${emojiSize * 0.58}" fill="rgba(0,0,0,0.48)"/><circle cx="${emojiCenterX}" cy="${emojiCenterY}" r="${emojiSize * 0.4}" fill="rgba(255,255,255,0.16)"/>`
    : "";

  const emojiElement = emojiDataUri
    ? `<g>${emojiBackdropElement}<image xlink:href="${emojiDataUri}" x="${emojiX}" y="${emojiY}" width="${emojiSize}" height="${emojiSize}" filter="url(#emojiShadow)"/></g>`
    : "";

  // Manual vertical centering: y = center + ~35% of fontSize (replaces
  // dominant-baseline="central" which rsvg-convert does not support)
  const textY = height / 2 + fontSize * 0.35;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${actualWidth}" height="${height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${gradFrom}"/>
      <stop offset="100%" stop-color="${gradTo}"/>
    </linearGradient>
    <filter id="emojiShadow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="0" stdDeviation="2.2" flood-color="rgba(0,0,0,0.65)"/>
      <feDropShadow dx="0" dy="0" stdDeviation="1.2" flood-color="rgba(0,0,0,0.45)"/>
      <feDropShadow dx="0" dy="0" stdDeviation="0.6" flood-color="rgba(255,255,255,0.18)"/>
    </filter>
  </defs>
  <rect width="${actualWidth}" height="${height}" rx="${height / 2}" fill="url(#g)"/>
  ${emojiElement}
  <text x="${textX}" y="${textY}" font-family="DejaVu Sans, sans-serif" font-size="${fontSize}" font-weight="600" fill="${fill}">${label.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</text>
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

// â”€â”€â”€ Star rating SVG renderer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function renderStarRatingPng({ rating, max = 5, outPath, starSize = 18 }) {
  const gap = 3;
  const totalWidth = max * starSize + (max - 1) * gap;
  const filledColor = "#facc15";
  const emptyColor = "#9ca3af";

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

// â”€â”€â”€ Video probe â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Probes input video for dimensions, fps, and audio presence.
// Falls back to 1920Ã—1080@30fps if ffprobe fails.

function probeVideoInfo(inputPath) {
  try {
    const raw = execFileSync("ffprobe", [
      "-v", "quiet", "-print_format", "json", "-show_streams", inputPath
    ], { encoding: "utf-8", timeout: 15000 }).trim();
    const data = JSON.parse(raw);
    const vs = data.streams?.find(s => s.codec_type === "video");
    const as = data.streams?.find(s => s.codec_type === "audio");
    let fps = 30;
    if (vs?.r_frame_rate) {
      const parts = vs.r_frame_rate.split("/").map(Number);
      if (parts.length === 2 && parts[1] > 0) fps = Math.round(parts[0] / parts[1]);
      else if (parts[0]) fps = parts[0];
    }
    const w = vs ? parseInt(vs.width) : 1920;
    const h = vs ? parseInt(vs.height) : 1080;
    return {
      width: w % 2 === 0 ? w : w + 1,
      height: h % 2 === 0 ? h : h + 1,
      fps: fps || 30,
      hasAudio: !!as,
    };
  } catch (e) {
    console.warn("[video.js] ffprobe failed, using defaults:", e.message);
    return { width: 1920, height: 1080, fps: 30, hasAudio: true };
  }
}

// â”€â”€â”€ Template custom fields overlay renderer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Appends FFmpeg drawtext / overlay filters for template-specific fields.
//
// IMPORTANT: drawbox uses "ih" for input height; drawtext uses "H" for video height.

async function buildTemplateOverlayFilters({
  templateCustomFields, bgColor, fontColor, fontPath, boldFontPath,
  tempDir, lastLabel, inputIndex, inputs, filters,
  // Additional context for centered / grid templates
  hasFooterContent, templateFamilyId, contact, social, tagline,
  // Logo context â€” needed for event countdown center-logo integration
  logoPath, logoPosition, logoTargetHeight, logoOpacity, logoEnabled,
}) {
  if (!templateCustomFields || typeof templateCustomFields !== "object") {
    return { lastLabel, inputIndex, cleanupPaths: [], skipFooter: false, skipLogo: false };
  }

  const cf = templateCustomFields;
  const cleanupPaths = [];
  let skipFooter = false;
  let skipLogo = false;

  // â”€â”€ Testimonial Overlay (reviewerName, reviewerTitle, starRating) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const hasTestimonial = cf.reviewerName || cf.reviewerTitle || cf.starRating;
  if (hasTestimonial) {
    const barHeight = 70;
    const barY = `ih-${barHeight}-30`;
    const barX = 20;
    const barW = `iw*0.45`;
    const textX = barX + 12;

    filters.push(
      `${lastLabel}drawbox=x=${barX}:y=${barY}:w=${barW}:h=${barHeight}:color=${bgColor}@0.75:t=fill[v_testi_bg]`
    );
    lastLabel = "[v_testi_bg]";

    let textY = 0;

    if (cf.reviewerName) {
      const escaped = escapeDrawText(String(cf.reviewerName));
      const nameY = `H-${barHeight}-30+12`;
      filters.push(
        `${lastLabel}drawtext=text='${escaped}':fontsize=20:fontcolor=${fontColor}:x=${textX}:y=${nameY}:fontfile=${boldFontPath}[v_testi_name]`
      );
      lastLabel = "[v_testi_name]";
      textY = 36;
    }

    if (cf.reviewerTitle) {
      const escaped = escapeDrawText(String(cf.reviewerTitle));
      const titleY = `H-${barHeight}-30+${textY > 0 ? textY : 14}`;
      filters.push(
        `${lastLabel}drawtext=text='${escaped}':fontsize=14:fontcolor=${fontColor}@0.8:x=${textX}:y=${titleY}:fontfile=${fontPath}[v_testi_title]`
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
          `${lastLabel}[${starLabel}]overlay=x=${textX}:y=${starY}[v_testi_stars]`
        );
        lastLabel = "[v_testi_stars]";
        inputIndex++;
        cleanupPaths.push(starResult.path);
      }
    }

    console.log(`[video.js] Testimonial overlay: name=${cf.reviewerName || "â€”"}, title=${cf.reviewerTitle || "â€”"}, stars=${cf.starRating || "â€”"}`);
  }

  // â”€â”€ Lower Third / Speaker Bar (speakerName, speakerTitle) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const hasSpeaker = cf.speakerName || cf.speakerTitle;
  if (hasSpeaker && !hasTestimonial) {
    const barHeight = 56;
    const barY = `ih-${barHeight}-25`;
    const barX = 20;
    // Contact Lower Third uses 55% width; standard Lower Third uses 45%
    const isContactLT = templateFamilyId === "vid-contact-lower-third";
    const barW = isContactLT ? `iw*0.55` : `iw*0.45`;
    const textX = barX + 12;

    filters.push(
      `${lastLabel}drawbox=x=${barX}:y=${barY}:w=${barW}:h=${barHeight}:color=${bgColor}@0.75:t=fill[v_spk_bg]`
    );
    lastLabel = "[v_spk_bg]";

    if (cf.speakerName) {
      const escaped = escapeDrawText(String(cf.speakerName));
      const nameY = `H-${barHeight}-25+10`;
      filters.push(
        `${lastLabel}drawtext=text='${escaped}':fontsize=18:fontcolor=${fontColor}:x=${textX}:y=${nameY}:fontfile=${boldFontPath}[v_spk_name]`
      );
      lastLabel = "[v_spk_name]";
    }

    if (cf.speakerTitle) {
      const escaped = escapeDrawText(String(cf.speakerTitle));
      const titleY = `H-${barHeight}-25+32`;
      filters.push(
        `${lastLabel}drawtext=text='${escaped}':fontsize=13:fontcolor=${fontColor}@0.8:x=${textX}:y=${titleY}:fontfile=${fontPath}[v_spk_title]`
      );
      lastLabel = "[v_spk_title]";
    }

    console.log(`[video.js] Speaker overlay: name=${cf.speakerName || "â€”"}, title=${cf.speakerTitle || "â€”"}`);
  }

  // â”€â”€ Product Demo Banner (productName, productPrice, website) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Persistent bottom banner showing product name (left), price (centre),
  // and website URL (right).
  const hasProduct = cf.productName || cf.productPrice;
  if (hasProduct) {
    const barHeight = 48;
    const barY = `ih-${barHeight}`;
    filters.push(
      `${lastLabel}drawbox=x=0:y=${barY}:w=iw:h=${barHeight}:color=${bgColor}@0.8:t=fill[v_prod_bg]`
    );
    lastLabel = "[v_prod_bg]";

    if (cf.productName) {
      const escaped = escapeDrawText(String(cf.productName));
      const textY = `H-${barHeight}+14`;
      filters.push(
        `${lastLabel}drawtext=text='${escaped}':fontsize=18:fontcolor=${fontColor}:x=20:y=${textY}:fontfile=${boldFontPath}[v_prod_name]`
      );
      lastLabel = "[v_prod_name]";
    }

    if (cf.productPrice) {
      const escaped = escapeDrawText(String(cf.productPrice));
      const textY = `H-${barHeight}+14`;
      filters.push(
        `${lastLabel}drawtext=text='${escaped}':fontsize=18:fontcolor=${fontColor}:x=(W-tw)/2:y=${textY}:fontfile=${boldFontPath}[v_prod_price]`
      );
      lastLabel = "[v_prod_price]";
    }

    // Include website URL from contact info on the right side
    const productWebsite = contact?.website;
    if (productWebsite) {
      const escaped = escapeDrawText(String(productWebsite));
      const textY = `H-${barHeight}+16`;
      filters.push(
        `${lastLabel}drawtext=text='${escaped}':fontsize=14:fontcolor=${fontColor}@0.9:x=W-tw-20:y=${textY}:fontfile=${fontPath}[v_prod_url]`
      );
      lastLabel = "[v_prod_url]";
    }

    console.log(`[video.js] Product overlay: name=${cf.productName || "â€”"}, price=${cf.productPrice || "â€”"}, website=${productWebsite || "â€”"}`);
  }

  // â”€â”€ Event Countdown â€” Centered Display â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Renders event details (name, date, location) inside a centered semi-
  // transparent box.  Brand kit info (contact, social, tagline) is shown in
  // the normal footer bar below â€” NOT duplicated inside the box.
  // If the logo is positioned at "center", it is rendered inside the box
  // (above the text) and the normal logo overlay is skipped to prevent it
  // from being hidden behind the drawbox fill.
  const hasEvent = cf.eventName || cf.eventDate || cf.eventLocation;
  if (hasEvent) {
    const isCenterLogo = logoEnabled && logoPath && logoPosition === "center";

    const contentLines = [];
    if (cf.eventName) contentLines.push({ text: String(cf.eventName), fontSize: 24, bold: true, opacity: 1 });

    const dateParts = [];
    if (cf.eventDate) dateParts.push(String(cf.eventDate));
    if (cf.eventLocation) dateParts.push(String(cf.eventLocation));
    if (dateParts.length > 0) contentLines.push({ text: dateParts.join("  \u2022  "), fontSize: 16, bold: false, opacity: 0.9 });

    const lineSpacing = 32;
    const boxPadding = 25;
    const logoAreaHeight = isCenterLogo ? (logoTargetHeight || 100) + 20 : 0;
    const boxH = contentLines.length * lineSpacing + boxPadding * 2 + logoAreaHeight;
    const boxW = 580;

    filters.push(
      `${lastLabel}drawbox=x=(iw-${boxW})/2:y=(ih-${boxH})/2:w=${boxW}:h=${boxH}:color=${bgColor}@0.85:t=fill[v_ec_bg]`
    );
    lastLabel = "[v_ec_bg]";

    // If logo is center, overlay it inside the box at the top
    if (isCenterLogo) {
      const th = logoTargetHeight || 100;
      inputs.push("-i", logoPath);
      filters.push(`[${inputIndex}:v]scale=-1:${th},format=rgba,colorchannelmixer=aa=${logoOpacity || 0.9}[ec_clogo]`);
      const logoY = `(H-${boxH})/2+${boxPadding}`;
      filters.push(`${lastLabel}[ec_clogo]overlay=x=(W-w)/2:y=${logoY}[v_ec_clogo]`);
      lastLabel = "[v_ec_clogo]";
      inputIndex++;
      skipLogo = true; // Tell brandVideo to skip the normal center logo overlay
    }

    let yOffset = boxPadding + logoAreaHeight;
    for (let i = 0; i < contentLines.length; i++) {
      const line = contentLines[i];
      const escaped = escapeDrawText(line.text);
      const font = line.bold ? boldFontPath : fontPath;
      const color = line.opacity < 1 ? `${fontColor}@${line.opacity}` : fontColor;
      const y = `(H-${boxH})/2+${yOffset}`;
      const label = `v_ec_l${i}`;
      filters.push(
        `${lastLabel}drawtext=text='${escaped}':fontsize=${line.fontSize}:fontcolor=${color}:x=(W-tw)/2:y=${y}:fontfile=${font}[${label}]`
      );
      lastLabel = `[${label}]`;
      yOffset += lineSpacing;
    }

    // Footer still renders normally â€” brand kit info appears there
    console.log(`[video.js] Event countdown centered: ${contentLines.length} lines, centerLogo=${isCenterLogo}`);
  }

  // â”€â”€ Hiring / Announcement Bar (announcementText) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // FIXED: Positioned above the footer bar when footer content exists.
  if (cf.announcementText) {
    const barHeight = 40;
    const footerOffset = hasFooterContent ? 36 : 0;
    filters.push(
      `${lastLabel}drawbox=x=0:y=ih-${barHeight}-${footerOffset}:w=iw:h=${barHeight}:color=${bgColor}@0.85:t=fill[v_ann_bg]`
    );
    lastLabel = "[v_ann_bg]";

    const escaped = escapeDrawText(String(cf.announcementText));
    filters.push(
      `${lastLabel}drawtext=text='${escaped}':fontsize=16:fontcolor=${fontColor}:x=(W-tw)/2:y=H-${barHeight}-${footerOffset}+12:fontfile=${boldFontPath}[v_ann_text]`
    );
    lastLabel = "[v_ann_text]";

    console.log(`[video.js] Announcement overlay: text=${cf.announcementText}, footerOffset=${footerOffset}`);
  }

  // â”€â”€ Chapter Marker (chapterTitle, chapterNumber) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    console.log(`[video.js] Chapter marker overlay: number=${cf.chapterNumber || "â€”"}, title=${cf.chapterTitle || "â€”"}`);
  }

  // â”€â”€ Customer Quote Card (quoteText, quoteName, quoteCompany) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const hasQuote = cf.quoteText || cf.quoteName || cf.quoteCompany;
  if (hasQuote) {
    const barHeight = 95;
    const barY = `ih-${barHeight}-10`;
    const barX = 20;
    const barW = `iw*0.7`;
    const textX = barX + 12;

    filters.push(
      `${lastLabel}drawbox=x=${barX}:y=${barY}:w=${barW}:h=${barHeight}:color=${bgColor}@0.8:t=fill[v_quote_bg]`
    );
    lastLabel = "[v_quote_bg]";

    if (cf.quoteText) {
      const escaped = escapeDrawText(`"${String(cf.quoteText)}"`);
      const quoteY = `H-${barHeight}-10+12`;
      filters.push(
        `${lastLabel}drawtext=text='${escaped}':fontsize=16:fontcolor=${fontColor}:x=${textX}:y=${quoteY}:fontfile=${fontPath}[v_quote_txt]`
      );
      lastLabel = "[v_quote_txt]";
    }

    const attrParts = [];
    if (cf.quoteName) attrParts.push(String(cf.quoteName));
    if (cf.quoteCompany) attrParts.push(String(cf.quoteCompany));
    if (attrParts.length > 0) {
      const escaped = escapeDrawText("â€” " + attrParts.join(", "));
      const attrY = cf.quoteText ? `H-${barHeight}-10+50` : `H-${barHeight}-10+20`;
      filters.push(
        `${lastLabel}drawtext=text='${escaped}':fontsize=13:fontcolor=${fontColor}@0.8:x=${textX}:y=${attrY}:fontfile=${boldFontPath}[v_quote_attr]`
      );
      lastLabel = "[v_quote_attr]";
    }

    console.log(`[video.js] Quote card overlay: text=${cf.quoteText ? cf.quoteText.slice(0, 40) + "â€¦" : "â€”"}, name=${cf.quoteName || "â€”"}, company=${cf.quoteCompany || "â€”"}`);
  }

  // â”€â”€ Split-Screen Compare (beforeLabel, afterLabel) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const hasSplit = cf.beforeLabel || cf.afterLabel;
  if (hasSplit) {
    filters.push(
      `${lastLabel}drawbox=x=(iw-2)/2:y=0:w=2:h=ih:color=${bgColor}@0.6:t=fill[v_split_div]`
    );
    lastLabel = "[v_split_div]";

    if (cf.beforeLabel) {
      const escaped = escapeDrawText(String(cf.beforeLabel));
      const pillY = 15;
      filters.push(
        `${lastLabel}drawbox=x=10:y=${pillY}:w=120:h=30:color=${bgColor}@0.7:t=fill[v_split_lbg]`
      );
      lastLabel = "[v_split_lbg]";
      filters.push(
        `${lastLabel}drawtext=text='${escaped}':fontsize=14:fontcolor=${fontColor}:x=20:y=${pillY + 8}:fontfile=${boldFontPath}[v_split_ltxt]`
      );
      lastLabel = "[v_split_ltxt]";
    }

    if (cf.afterLabel) {
      const escaped = escapeDrawText(String(cf.afterLabel));
      const pillY = 15;
      filters.push(
        `${lastLabel}drawbox=x=iw-130:y=${pillY}:w=120:h=30:color=${bgColor}@0.7:t=fill[v_split_rbg]`
      );
      lastLabel = "[v_split_rbg]";
      filters.push(
        `${lastLabel}drawtext=text='${escaped}':fontsize=14:fontcolor=${fontColor}:x=W-120:y=${pillY + 8}:fontfile=${boldFontPath}[v_split_rtxt]`
      );
      lastLabel = "[v_split_rtxt]";
    }

    console.log(`[video.js] Split-screen overlay: before=${cf.beforeLabel || "â€”"}, after=${cf.afterLabel || "â€”"}`);
  }

  return { lastLabel, inputIndex, cleanupPaths, skipFooter, skipLogo };
}

// â”€â”€â”€ Concat-based template helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Used by End Card CTA and Intro/Outro Bumper which generate separate video
// segments (solid-color backgrounds with branding) and concatenate them with
// the main branded video.

/**
 * Create a simple video segment with centered logo and text lines on a
 * solid-color background. Used for intro and outro bumper segments.
 */
async function createTextSegment({
  outputPath, width, height, fps, duration,
  bgColor, fontColor, regularFont, boldFont,
  logoPath, logoTargetHeight, logoOpacity,
  lines,
}) {
  const filters = [];
  const inputs = [
    "-f", "lavfi", "-i", `color=c=${bgColor}:s=${width}x${height}:d=${duration}:r=${fps},format=yuv420p`,
    "-f", "lavfi", "-i", `anullsrc=r=44100:cl=stereo`,
  ];
  let lastLabel = "[0:v]";
  let inputIndex = 2;

  if (logoPath) {
    const logoY = Math.round(height * 0.25 - logoTargetHeight / 2);
    inputs.push("-i", logoPath);
    filters.push(`[${inputIndex}:v]scale=-1:${logoTargetHeight},format=rgba,colorchannelmixer=aa=${logoOpacity}[seg_logo]`);
    filters.push(`${lastLabel}[seg_logo]overlay=(W-w)/2:${logoY}[v_seg_logo]`);
    lastLabel = "[v_seg_logo]";
    inputIndex++;
  }

  let yPos = logoPath
    ? Math.round(height * 0.25 + logoTargetHeight / 2 + 30)
    : Math.round(height * 0.35);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const escaped = escapeDrawText(String(line.text));
    const font = line.bold ? boldFont : regularFont;
    const color = line.opacity ? `${fontColor}@${line.opacity}` : fontColor;
    const label = `v_seg_t${i}`;
    filters.push(`${lastLabel}drawtext=text='${escaped}':fontsize=${line.fontSize}:fontcolor=${color}:x=(W-tw)/2:y=${yPos}:fontfile=${font}[${label}]`);
    lastLabel = `[${label}]`;
    yPos += Math.round(line.fontSize * 2);
  }

  if (filters.length > 0) {
    const finalLabel = lastLabel.replace("[", "").replace("]", "");
    filters.push(`[${finalLabel}]setpts=PTS-STARTPTS[v_out]`);

    const args = [
      "-y", ...inputs,
      "-filter_complex", filters.join(";"),
      "-map", "[v_out]", "-map", "1:a",
      "-c:v", "libx264", "-preset", "fast", "-crf", "23",
      "-c:a", "aac", "-t", String(duration), "-shortest",
      outputPath,
    ];
    console.log(`[video.js] Creating text segment: ${width}x${height}@${fps}fps, ${duration}s, ${lines.length} lines`);
    await run("ffmpeg", args);
  } else {
    // No overlays â€” just create a silent color segment
    const args = [
      "-y",
      "-f", "lavfi", "-i", `color=c=${bgColor}:s=${width}x${height}:d=${duration}:r=${fps},format=yuv420p`,
      "-f", "lavfi", "-i", `anullsrc=r=44100:cl=stereo`,
      "-c:v", "libx264", "-preset", "fast", "-crf", "23",
      "-c:a", "aac", "-t", String(duration), "-shortest",
      outputPath,
    ];
    await run("ffmpeg", args);
  }
}

/**
 * Create an end card segment with logo, brand name, tagline, and a
 * 2-column grid of contact info + social handles (with icons).
 */
async function createEndCardSegment({
  outputPath, width, height, fps, duration,
  bgColor, fontColor, regularFont, boldFont,
  logoPath, logoTargetHeight, logoOpacity,
  tagline, brandName, contact, social, tempDir,
}) {
  const iconSize = 24;
  const filters = [];
  const inputs = [
    "-f", "lavfi", "-i", `color=c=${bgColor}:s=${width}x${height}:d=${duration}:r=${fps},format=yuv420p`,
    "-f", "lavfi", "-i", `anullsrc=r=44100:cl=stereo`,
  ];
  let lastLabel = "[0:v]";
  let inputIndex = 2;
  let labelIdx = 0;
  const cleanupPaths = [];

  // Logo centered in upper area
  const logoY = Math.round(height * 0.08);
  if (logoPath) {
    inputs.push("-i", logoPath);
    filters.push(`[${inputIndex}:v]scale=-1:${logoTargetHeight},format=rgba,colorchannelmixer=aa=${logoOpacity}[ec_logo]`);
    filters.push(`${lastLabel}[ec_logo]overlay=(W-w)/2:${logoY}[v_ec_logo]`);
    lastLabel = "[v_ec_logo]";
    inputIndex++;
  }

  let yPos = logoPath ? logoY + logoTargetHeight + 20 : Math.round(height * 0.15);

  // Brand name
  if (brandName) {
    const escaped = escapeDrawText(brandName);
    const label = `v_ec_t${labelIdx++}`;
    filters.push(`${lastLabel}drawtext=text='${escaped}':fontsize=28:fontcolor=${fontColor}:x=(W-tw)/2:y=${yPos}:fontfile=${boldFont}[${label}]`);
    lastLabel = `[${label}]`;
    yPos += 40;
  }

  // Tagline
  if (tagline) {
    const escaped = escapeDrawText(tagline);
    const label = `v_ec_t${labelIdx++}`;
    filters.push(`${lastLabel}drawtext=text='${escaped}':fontsize=20:fontcolor=${fontColor}@0.9:x=(W-tw)/2:y=${yPos}:fontfile=${regularFont}[${label}]`);
    lastLabel = `[${label}]`;
    yPos += 35;
  }

  // Build grid entries: [{key, svg, label}]
  const gridEntries = [];
  if (contact?.website) gridEntries.push({ key: "ec_website", svg: CONTACT_ICON_SVGS.website, label: contact.website });
  if (contact?.phone)   gridEntries.push({ key: "ec_phone",   svg: CONTACT_ICON_SVGS.phone,   label: contact.phone });
  if (contact?.email)   gridEntries.push({ key: "ec_email",   svg: CONTACT_ICON_SVGS.email,   label: contact.email });
  if (contact?.address) gridEntries.push({ key: "ec_address", svg: CONTACT_ICON_SVGS.address,  label: contact.address });

  if (social) {
    const platforms = ["facebook", "instagram", "twitter", "linkedin", "youtube", "tiktok"];
    for (const p of platforms) {
      if (social[p]) {
        gridEntries.push({ key: `ec_${p}`, svg: SOCIAL_ICON_SVGS[p], label: extractHandle(social[p]) });
      }
    }
  }

  // Divider line before grid
  if (gridEntries.length > 0) {
    yPos += 10;
    const divW = Math.round(width * 0.5);
    const divX = Math.round((width - divW) / 2);
    filters.push(`${lastLabel}drawbox=x=${divX}:y=${yPos}:w=${divW}:h=1:color=${fontColor}@0.3:t=fill[v_ec_div]`);
    lastLabel = "[v_ec_div]";
    yPos += 25;
  }

  // Render grid: 2-column layout with icons
  const leftX = Math.round(width * 0.12);
  const rightX = Math.round(width * 0.55);
  const rowHeight = 36;
  const iconTextGap = 8;

  for (let i = 0; i < gridEntries.length; i++) {
    const entry = gridEntries[i];
    const col = i % 2;
    const x = col === 0 ? leftX : rightX;

    // Render icon PNG
    const iconPath = path.join(tempDir, `${entry.key}_icon.png`);
    await svgToPng(entry.svg, iconPath, iconSize);
    cleanupPaths.push(iconPath);

    // Overlay icon
    inputs.push("-i", iconPath);
    const iconLabel = `ec_ic_${i}`;
    filters.push(`[${inputIndex}:v]scale=${iconSize}:${iconSize},format=rgba[${iconLabel}]`);
    const iconOut = `v_ec_io_${i}`;
    const iconY = yPos + Math.round((rowHeight - iconSize) / 2);
    filters.push(`${lastLabel}[${iconLabel}]overlay=x=${x}:y=${iconY}[${iconOut}]`);
    lastLabel = `[${iconOut}]`;
    inputIndex++;

    // Draw text label next to icon
    const escaped = escapeDrawText(entry.label);
    const textLabel = `v_ec_gt${labelIdx++}`;
    const textX = x + iconSize + iconTextGap;
    const textY = yPos + Math.round((rowHeight - 15) / 2);
    filters.push(`${lastLabel}drawtext=text='${escaped}':fontsize=15:fontcolor=${fontColor}@0.85:x=${textX}:y=${textY}:fontfile=${regularFont}[${textLabel}]`);
    lastLabel = `[${textLabel}]`;

    // Advance row after right column or last entry
    if (col === 1 || i === gridEntries.length - 1) {
      yPos += rowHeight;
    }
  }

  // Build and run FFmpeg
  if (filters.length > 0) {
    const finalLabel = lastLabel.replace("[", "").replace("]", "");
    filters.push(`[${finalLabel}]setpts=PTS-STARTPTS[v_out]`);

    const args = [
      "-y", ...inputs,
      "-filter_complex", filters.join(";"),
      "-map", "[v_out]", "-map", "1:a",
      "-c:v", "libx264", "-preset", "fast", "-crf", "23",
      "-c:a", "aac", "-t", String(duration), "-shortest",
      outputPath,
    ];
    console.log(`[video.js] Creating end card: ${width}x${height}@${fps}fps, ${duration}s, ${gridEntries.length} grid items`);
    await run("ffmpeg", args);
  } else {
    const args = [
      "-y",
      "-f", "lavfi", "-i", `color=c=${bgColor}:s=${width}x${height}:d=${duration}:r=${fps},format=yuv420p`,
      "-f", "lavfi", "-i", `anullsrc=r=44100:cl=stereo`,
      "-c:v", "libx264", "-preset", "fast", "-crf", "23",
      "-c:a", "aac", "-t", String(duration), "-shortest",
      outputPath,
    ];
    await run("ffmpeg", args);
  }

  // Cleanup temp icon PNGs
  for (const p of cleanupPaths) {
    await fs.unlink(p).catch(() => {});
  }
}

/**
 * Concatenate video segments using the FFmpeg concat demuxer.
 * Re-encodes to ensure codec compatibility across all segments.
 */
async function concatSegments(segmentPaths, outputPath, tempDir) {
  const listPath = path.join(tempDir, "concat_list.txt");
  const listContent = segmentPaths.map(p => `file '${p}'`).join("\n");
  await fs.writeFile(listPath, listContent, "utf-8");

  console.log(`[video.js] Concatenating ${segmentPaths.length} segments â†’ ${outputPath}`);
  await run("ffmpeg", [
    "-y", "-f", "concat", "-safe", "0", "-i", listPath,
    "-c:v", "libx264", "-preset", "fast", "-crf", "23",
    "-c:a", "aac",
    outputPath,
  ]);

  await fs.unlink(listPath).catch(() => {});
}

/**
 * Handle concat-based templates (End Card CTA, Intro/Outro Bumper).
 * 1. Brands the main video with standard overlays (logo, header, footer, stickers).
 * 2. Creates branded segment(s) on solid-color backgrounds.
 * 3. Concatenates everything into the final output.
 */
async function handleConcatTemplate({
  inputPath, logoPath, outputPath, jobDir,
  templateFamilyId, mergedCustomFields,
  logoSize, logoPosition, logoOpacity, logoTargetHeightPx, logoEnabled,
  brandName, primaryColor, tagline, contact, social, elements,
  fontFamily, stickers, stickerMeta,
  copyrightText, wrapper,
}) {
  const tempDir = jobDir || path.dirname(outputPath);
  const info = probeVideoInfo(inputPath);
  const { width, height, fps } = info;
  const bgFFmpeg = hexToFFmpegColor(primaryColor || "#000000");
  const fontColorHex = "0xFFFFFF";
  const targetHeight = logoTargetHeightPx || LOGO_SIZE_MAP[logoSize] || LOGO_SIZE_MAP.medium;

  const regularFont = await resolveFont(fontFamily, false);
  const boldFont = await resolveFont(fontFamily, true);

  console.log(`[video.js] Concat template: ${templateFamilyId}, video=${width}x${height}@${fps}fps`);

  // 1. Brand the main video (standard overlays only â€” no concat recursion)
  const brandedMainPath = path.join(tempDir, "branded_main.mp4");
  await brandVideo({
    inputPath, logoPath, outputPath: brandedMainPath, jobDir,
    logoSize, logoPosition, logoOpacity, logoTargetHeightPx, logoEnabled,
    brandName, primaryColor, tagline, contact, social, elements,
    fontFamily, stickers, stickerMeta,
    copyrightText,
    templateFamilyId: null, // Prevent concat recursion
  });

  const segmentPaths = [];
  const cleanupPaths = [brandedMainPath];

  // 2. Create segments based on template type
  if (templateFamilyId === "vid-intro-outro") {
    // â”€â”€ Intro segment (3s) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Shows: brand name, tagline, and any custom intro text
    const introLines = [];
    if (brandName) introLines.push({ text: brandName, fontSize: 28, bold: true });
    if (tagline) introLines.push({ text: tagline, fontSize: 20, bold: false, opacity: 0.9 });
    if (mergedCustomFields.introText) introLines.push({ text: String(mergedCustomFields.introText), fontSize: 18, bold: false, opacity: 0.8 });

    const introPath = path.join(tempDir, "segment_intro.mp4");
    await createTextSegment({
      outputPath: introPath, width, height, fps, duration: 3,
      bgColor: bgFFmpeg, fontColor: fontColorHex, regularFont, boldFont,
      logoPath: logoEnabled && logoPath ? logoPath : null,
      logoTargetHeight: Math.round(targetHeight * 1.3),
      logoOpacity: 1.0,
      lines: introLines,
    });
    segmentPaths.push(introPath);
    cleanupPaths.push(introPath);

    // â”€â”€ Main video â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    segmentPaths.push(brandedMainPath);

    // â”€â”€ Outro segment (5s) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Shows: logo, brand name, tagline, contact info, and social handles
    // Uses the full end-card layout for a professional closing screen.
    const outroPath = path.join(tempDir, "segment_outro.mp4");
    await createEndCardSegment({
      outputPath: outroPath, width, height, fps, duration: 5,
      bgColor: bgFFmpeg, fontColor: fontColorHex, regularFont, boldFont,
      logoPath: logoEnabled && logoPath ? logoPath : null,
      logoTargetHeight: Math.round(targetHeight * 1.3),
      logoOpacity: 1.0,
      tagline, brandName, contact, social, tempDir,
    });
    segmentPaths.push(outroPath);
    cleanupPaths.push(outroPath);

    console.log(`[video.js] Intro/Outro bumper: intro=3s (${introLines.length} lines), outro=5s (end-card layout)`);
  }

  else if (templateFamilyId === "vid-end-card") {
    // â”€â”€ Main video first â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    segmentPaths.push(brandedMainPath);

    // â”€â”€ End card segment (10s) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const endCardPath = path.join(tempDir, "segment_endcard.mp4");
    await createEndCardSegment({
      outputPath: endCardPath, width, height, fps, duration: 10,
      bgColor: bgFFmpeg, fontColor: fontColorHex, regularFont, boldFont,
      logoPath: logoEnabled && logoPath ? logoPath : null,
      logoTargetHeight: Math.round(targetHeight * 1.5),
      logoOpacity: 1.0,
      tagline, brandName, contact, social, tempDir,
    });
    segmentPaths.push(endCardPath);
    cleanupPaths.push(endCardPath);

    console.log(`[video.js] End Card CTA: 10s card with grid layout`);
  }

  // 3. Concat all segments
  await concatSegments(segmentPaths, outputPath, tempDir);

  // 4. Cleanup temp files
  for (const p of cleanupPaths) {
    await fs.unlink(p).catch(() => {});
  }
}


// --- Wrapper overlay builder -------------------------------------------------
async function buildWrapperOverlayFilters({
  wrapper, fontPath, boldFontPath, lastLabel, inputIndex, inputs, filters,
  logoPath, logoEnabled, logoTargetHeight, logoOpacity,
}) {
  if (!wrapper || typeof wrapper !== "object") {
    return { lastLabel, inputIndex, cleanupPaths: [] };
  }

  const els = wrapper.elements || {};
  const colors = wrapper.colors || {};
  const bgColor = hexToFFmpegColor(colors.primary || "#111111");
  const secColor = hexToFFmpegColor(colors.secondary || "#FFFFFF");
  const accentColor = hexToFFmpegColor(colors.accent || "#FFCC00");
  const borderColor = hexToFFmpegColor(colors.border || "#111111");
  const fontColor = secColor;
  const cleanupPaths = [];
  const headline = wrapper.headline || "";
  const subheadline = wrapper.subheadline || "";
  const cta = wrapper.cta || "";
  const badgeText = wrapper.badge_text || "";
  const website = wrapper.website || "";

  // Override font if wrapper specifies its own font selection
  if (wrapper.font && wrapper.font !== "default") {
    fontPath = await resolveFont(wrapper.font, false);
    boldFontPath = await resolveFont(wrapper.font, true);
    console.log(`[video.js] Wrapper font override: slug=${wrapper.font}, regular=${fontPath}, bold=${boldFontPath}`);
  }

  console.log(`[video.js] Wrapper overlay: headline="${headline}", sub="${subheadline}", cta="${cta}", badge="${badgeText}"`);
  console.log(`[video.js] Wrapper elements: ${JSON.stringify(els)}`);

  if (els.background_overlay) {
    filters.push(`${lastLabel}drawbox=x=0:y=0:w=iw:h=ih:color=${bgColor}@0.35:t=fill[v_wrap_bgov]`);
    lastLabel = "[v_wrap_bgov]";
  }

  if (els.border) {
    const bw = 4;
    filters.push(`${lastLabel}drawbox=x=0:y=0:w=iw:h=${bw}:color=${borderColor}:t=fill[v_wrap_bt]`);
    lastLabel = "[v_wrap_bt]";
    filters.push(`${lastLabel}drawbox=x=0:y=ih-${bw}:w=iw:h=${bw}:color=${borderColor}:t=fill[v_wrap_bb]`);
    lastLabel = "[v_wrap_bb]";
    filters.push(`${lastLabel}drawbox=x=0:y=0:w=${bw}:h=ih:color=${borderColor}:t=fill[v_wrap_bl]`);
    lastLabel = "[v_wrap_bl]";
    filters.push(`${lastLabel}drawbox=x=iw-${bw}:y=0:w=${bw}:h=ih:color=${borderColor}:t=fill[v_wrap_br]`);
    lastLabel = "[v_wrap_br]";
  }

  if (els.side_panel) {
    const panelW = 180;
    filters.push(`${lastLabel}drawbox=x=iw-${panelW}:y=0:w=${panelW}:h=ih:color=${bgColor}@0.85:t=fill[v_wrap_sp]`);
    lastLabel = "[v_wrap_sp]";
    if (headline) {
      const escaped = escapeDrawText(headline);
      filters.push(`${lastLabel}drawtext=text='${escaped}':fontsize=16:fontcolor=${fontColor}:x=W-${panelW}+15:y=60:fontfile=${boldFontPath}[v_wrap_sph]`);
      lastLabel = "[v_wrap_sph]";
    }
    if (subheadline) {
      const escaped = escapeDrawText(subheadline);
      filters.push(`${lastLabel}drawtext=text='${escaped}':fontsize=12:fontcolor=${fontColor}@0.85:x=W-${panelW}+15:y=90:fontfile=${fontPath}[v_wrap_sps]`);
      lastLabel = "[v_wrap_sps]";
    }
  }

  if (els.top_bar) {
    const barH = 52;
    filters.push(`${lastLabel}drawbox=x=0:y=0:w=iw:h=${barH}:color=${bgColor}@0.9:t=fill[v_wrap_tb]`);
    lastLabel = "[v_wrap_tb]";
    if (headline) {
      const escaped = escapeDrawText(headline);
      filters.push(`${lastLabel}drawtext=text='${escaped}':fontsize=20:fontcolor=${fontColor}:x=(W-tw)/2:y=8:fontfile=${boldFontPath}[v_wrap_tbh]`);
      lastLabel = "[v_wrap_tbh]";
    }
    if (subheadline && !els.side_panel) {
      const escaped = escapeDrawText(subheadline);
      filters.push(`${lastLabel}drawtext=text='${escaped}':fontsize=13:fontcolor=${fontColor}@0.85:x=(W-tw)/2:y=32:fontfile=${fontPath}[v_wrap_tbs]`);
      lastLabel = "[v_wrap_tbs]";
    }
  }

  if (els.badge && badgeText) {
    const bPadX = 12;
    const bPadY = 4;
    const bFontSize = 14;
    const estimatedW = badgeText.length * bFontSize * 0.7 + bPadX * 2;
    const bH = bFontSize + bPadY * 2 + 6;
    const bX = 15;
    const bY = els.top_bar ? 60 : 15;
    filters.push(`${lastLabel}drawbox=x=${bX}:y=${bY}:w=${Math.round(estimatedW)}:h=${bH}:color=${accentColor}:t=fill[v_wrap_bdg_bg]`);
    lastLabel = "[v_wrap_bdg_bg]";
    const escaped = escapeDrawText(badgeText);
    filters.push(`${lastLabel}drawtext=text='${escaped}':fontsize=${bFontSize}:fontcolor=0x000000:x=${bX + bPadX}:y=${bY + bPadY + 2}:fontfile=${boldFontPath}[v_wrap_bdg_txt]`);
    lastLabel = "[v_wrap_bdg_txt]";
  }

  if (els.logo && logoEnabled && logoPath) {
    const lh = logoTargetHeight || 60;
    inputs.push("-i", logoPath);
    filters.push(`[${inputIndex}:v]scale=-1:${lh},format=rgba,colorchannelmixer=aa=${logoOpacity || 0.9}[wrap_logo]`);
    const logoX = 15;
    const logoY = els.top_bar ? `${52 + 8}` : "15";
    filters.push(`${lastLabel}[wrap_logo]overlay=x=${logoX}:y=${logoY}[v_wrap_logo]`);
    lastLabel = "[v_wrap_logo]";
    inputIndex++;
  }

  if (els.bottom_bar) {
    const barH = 48;
    filters.push(`${lastLabel}drawbox=x=0:y=ih-${barH}:w=iw:h=${barH}:color=${bgColor}@0.9:t=fill[v_wrap_btm]`);
    lastLabel = "[v_wrap_btm]";
    if (website) {
      const escaped = escapeDrawText(website);
      filters.push(`${lastLabel}drawtext=text='${escaped}':fontsize=14:fontcolor=${fontColor}@0.8:x=W-tw-20:y=H-${barH}+16:fontfile=${fontPath}[v_wrap_btm_web]`);
      lastLabel = "[v_wrap_btm_web]";
    }
  }

  if (els.footer_cta && cta) {
    const ctaH = 36;
    const ctaFontSize = 16;
    const ctaPadX = 20;
    const estimatedCtaW = cta.length * ctaFontSize * 0.65 + ctaPadX * 2;
    const ctaX = els.bottom_bar ? 20 : `(iw-${Math.round(estimatedCtaW)})/2`;
    const ctaY = els.bottom_bar ? `ih-${48}-${ctaH}-10` : `ih-${ctaH}-20`;
    filters.push(`${lastLabel}drawbox=x=${ctaX}:y=${ctaY}:w=${Math.round(estimatedCtaW)}:h=${ctaH}:color=${accentColor}:t=fill[v_wrap_cta_bg]`);
    lastLabel = "[v_wrap_cta_bg]";
    const escaped = escapeDrawText(cta);
    const textX = els.bottom_bar ? `20+${ctaPadX}` : `(W-${Math.round(estimatedCtaW)})/2+${ctaPadX}`;
    const textY = els.bottom_bar ? `H-${48}-${ctaH}-10+9` : `H-${ctaH}-20+9`;
    filters.push(`${lastLabel}drawtext=text='${escaped}':fontsize=${ctaFontSize}:fontcolor=0x000000:x=${textX}:y=${textY}:fontfile=${boldFontPath}[v_wrap_cta_txt]`);
    lastLabel = "[v_wrap_cta_txt]";
  }

  return { lastLabel, inputIndex, cleanupPaths };
}

// â”€â”€â”€ Main export â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function brandVideo({
  inputPath, logoPath, outputPath, jobDir,
  logoSize = "medium", logoPosition = "bottom-right",
  logoOpacity = 0.9, logoTargetHeightPx, logoEnabled = true,
  brandName, primaryColor, tagline, contact, social, elements,
  fontFamily, stickers, stickerMeta,
  // Template identifier (for concat-based templates)
  templateFamilyId,
  // Template custom fields â€” nested objects
  templateCustomFields, template_custom_fields,
  // Root-level aliases the payload may carry
  wrapper,
  reviewerName, reviewerTitle, starRating,
  speakerName, speakerTitle,
  productName, productPrice,
  eventName, eventDate, eventLocation,
  announcementText,
  chapterTitle, chapterNumber,
  quoteText, quoteName, quoteCompany,
  beforeLabel, afterLabel,
  introText,
  copyrightText,
}) {
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
    ...(introText        ? { introText } : {}),
    ...(copyrightText    ? { copyrightText } : {}),
  };
  const hasCustomFields = Object.keys(mergedCustomFields).length > 0;

  // â”€â”€ Check for concat-based templates (End Card CTA, Intro/Outro Bumper) â”€â”€
  // These generate separate branded segments and concatenate with the main video.
  const isConcatTemplate = templateFamilyId && ["vid-end-card", "vid-intro-outro"].includes(templateFamilyId);
  if (isConcatTemplate) {
    return await handleConcatTemplate({
      inputPath, logoPath, outputPath, jobDir,
      templateFamilyId, mergedCustomFields,
      logoSize, logoPosition, logoOpacity, logoTargetHeightPx, logoEnabled,
      brandName, primaryColor, tagline, contact, social, elements,
      fontFamily, stickers, stickerMeta,
      copyrightText, wrapper,
    });
  }

  // â”€â”€ Standard overlay pipeline â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
  const copyrightPart = copyrightText ? escapeDrawText(copyrightText) : null;
  const hasFooterContent = taglinePart || copyrightPart || footerIcons.length > 0;
  const hasHeader = !!brandName;

  console.log(`[video.js] Branding: logo=${hasLogo} (${logoSize}/${targetHeight}px), header=${brandName || "none"}, footerIcons=${footerIcons.length}, tagline=${tagline || "none"}, copyright=${copyrightText || "none"}, stickers=${stickerPngs.length}, customFields=${hasCustomFields}, template=${templateFamilyId || "none"}`);

  const filters = [];
  const inputs = ["-i", inputPath];
  let lastLabel = "[0:v]";
  let inputIndex = 1;

  // â”€â”€ Social Clip â€” Branded Frame with Captions Area â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Wraps the video in a branded frame (padded border in brand color) with a
  // dedicated captions strip at the bottom showing brand name and tagline.
  if (templateFamilyId === "vid-social-clip") {
    const probe = probeVideoInfo(inputPath);
    const padSide = 30;
    const padTop = 30;
    const captionH = 90; // Height of the captions area at the bottom
    const paddedW = probe.width + padSide * 2;
    const paddedH = probe.height + padTop + captionH;
    // Round to even numbers for codec compatibility
    const finalW = paddedW % 2 === 0 ? paddedW : paddedW + 1;
    const finalH = paddedH % 2 === 0 ? paddedH : paddedH + 1;

    filters.push(
      `${lastLabel}scale=${probe.width}:${probe.height},pad=${finalW}:${finalH}:${padSide}:${padTop}:color=${bgColor}[v_frame]`
    );
    lastLabel = "[v_frame]";

    // Brand name in the captions area
    if (brandName) {
      const escaped = escapeDrawText(brandName);
      const textY = probe.height + padTop + 18;
      filters.push(
        `${lastLabel}drawtext=text='${escaped}':fontsize=22:fontcolor=${fontColor}:x=(W-tw)/2:y=${textY}:fontfile=${boldFontPath}[v_sc_name]`
      );
      lastLabel = "[v_sc_name]";
    }

    // Tagline below brand name in captions area
    if (tagline) {
      const escaped = escapeDrawText(tagline);
      const textY = probe.height + padTop + (brandName ? 50 : 25);
      filters.push(
        `${lastLabel}drawtext=text='${escaped}':fontsize=15:fontcolor=${fontColor}@0.85:x=(W-tw)/2:y=${textY}:fontfile=${fontPath}[v_sc_tag]`
      );
      lastLabel = "[v_sc_tag]";
    }

    console.log(`[video.js] Social Clip frame: ${probe.width}x${probe.height} â†’ ${finalW}x${finalH}, captions=${captionH}px`);
  }

  // Pre-check: will the event countdown template handle the center logo itself?
  const eventCountdownWillHandleLogo = hasCustomFields &&
    (mergedCustomFields.eventName || mergedCustomFields.eventDate || mergedCustomFields.eventLocation) &&
    logoPosition === "center" && hasLogo;

  // Templates with bottom banners that would paint over the logo â€”
  // defer logo overlay until AFTER the template drawbox filters so the
  // logo sits on top of the banner instead of hiding behind it.
  const bottomBannerTemplates = [
    "vid-testimonial-overlay", "vid-lower-third",
    "vid-contact-lower-third", "vid-customer-quote-card",
    "vid-product-demo",
  ];
  const hasBottomBanner = hasCustomFields && bottomBannerTemplates.includes(templateFamilyId);
  const deferLogo = hasLogo && !eventCountdownWillHandleLogo && hasBottomBanner;

  // Add logo overlay now â€” unless deferred or handled by event countdown
  if (hasLogo && !eventCountdownWillHandleLogo && !deferLogo) {
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

  // â”€â”€ Template custom field overlays â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  let extraCleanupPaths = [];

  // -- Wrapper overlays (Video Wrapper Builder) --------------------------------
  if (wrapper && typeof wrapper === "object" && wrapper.elements) {
    const wrapResult = await buildWrapperOverlayFilters({
      wrapper, fontPath, boldFontPath, lastLabel, inputIndex, inputs, filters,
      logoPath: hasLogo ? logoPath : null,
      logoEnabled, logoTargetHeight: targetHeight, logoOpacity,
    });
    lastLabel = wrapResult.lastLabel;
    inputIndex = wrapResult.inputIndex;
    if (wrapResult.cleanupPaths) extraCleanupPaths.push(...wrapResult.cleanupPaths);
    console.log(`[video.js] Wrapper overlays applied`);
  }

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
      // Additional context for centered / grid templates
      hasFooterContent,
      templateFamilyId,
      contact,
      social,
      tagline,
      // Logo context for event countdown center-logo integration
      logoPath: hasLogo ? logoPath : null,
      logoPosition,
      logoTargetHeight: targetHeight,
      logoOpacity,
      logoEnabled,
    });
    lastLabel = result.lastLabel;
    inputIndex = result.inputIndex;
    if (result.cleanupPaths) extraCleanupPaths = result.cleanupPaths;
    if (result.skipFooter) skipFooter = true;
  }

  // â”€â”€ Deferred logo overlay (for bottom-banner templates) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Renders the logo ON TOP of the template banner so it's visible.
  if (deferLogo) {
    inputs.push("-i", logoPath);
    filters.push(`[${inputIndex}:v]scale=-1:${targetHeight},format=rgba,colorchannelmixer=aa=${logoOpacity}[logo_def]`);
    filters.push(`${lastLabel}[logo_def]overlay=${overlayPos}[v_logo_def]`);
    lastLabel = "[v_logo_def]";
    inputIndex++;
  }

  // â”€â”€ Footer with inline icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Skipped when a template (e.g. Event Countdown) renders everything in
  // a centered display instead.
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

    if (copyrightPart) {
      if (segments.length > 0) {
        segments.push({ type: "separator", width: separatorWidth });
        totalWidth += separatorWidth;
      }
      const w = copyrightText.length * charWidth;
      segments.push({ type: "text", text: copyrightPart, width: w });
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
      outputPath,
    ];
    console.log(`[video.js] FFmpeg filter_complex (${filters.length} filters, ${inputIndex} inputs)`);
    console.log(`[video.js] Filter: ${filterComplex.slice(0, 500)}...`);
    await run("ffmpeg", args);
  } else {
    console.log("[video.js] No branding elements, copying input to output");
    await fs.copyFile(inputPath, outputPath);
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
