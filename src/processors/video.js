import { run } from "../utils.js";
import fs from "fs/promises";
import path from "path";

const LOGO_SIZE_MAP = {
  small: 50,
  medium: 100,
  large: 150,
  xlarge: 200,
};

// ─── Font resolution ───────────────────────────────────────────────────────────
// Maps font slugs to .ttf paths installed in the Docker image.
// The Dockerfile installs these into /usr/share/fonts/google/<family>/
// using GitHub raw URLs with predictable filenames.
// Falls back to DejaVu (always available on Debian/Ubuntu).

const GOOGLE_FONT_DIR = "/usr/share/fonts/google";
const DEJAVU_REGULAR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";
const DEJAVU_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";

const FONT_MAP = {
  default: DEJAVU_REGULAR,
  arial: DEJAVU_REGULAR,
  helvetica: DEJAVU_REGULAR,
  georgia: DEJAVU_REGULAR,
  "times-new-roman": DEJAVU_REGULAR,
  "courier-new": "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
  verdana: DEJAVU_REGULAR,
  "trebuchet-ms": DEJAVU_REGULAR,
  impact: DEJAVU_BOLD,
  "comic-sans-ms": DEJAVU_REGULAR,
  palatino: DEJAVU_REGULAR,
  garamond: DEJAVU_REGULAR,
  bookman: DEJAVU_REGULAR,
  "avant-garde": DEJAVU_REGULAR,

  roboto: `${GOOGLE_FONT_DIR}/roboto/Roboto-Regular.ttf`,
  "open-sans": `${GOOGLE_FONT_DIR}/opensans/OpenSans-Regular.ttf`,
  montserrat: `${GOOGLE_FONT_DIR}/montserrat/Montserrat-Regular.ttf`,
  lato: `${GOOGLE_FONT_DIR}/lato/Lato-Regular.ttf`,
  oswald: `${GOOGLE_FONT_DIR}/oswald/Oswald-Regular.ttf`,
  raleway: `${GOOGLE_FONT_DIR}/raleway/Raleway-Regular.ttf`,
  "playfair-display": `${GOOGLE_FONT_DIR}/playfairdisplay/PlayfairDisplay-Regular.ttf`,
};

const FONT_BOLD_MAP = {
  default: DEJAVU_BOLD,
  arial: DEJAVU_BOLD,
  helvetica: DEJAVU_BOLD,
  georgia: DEJAVU_BOLD,
  "times-new-roman": DEJAVU_BOLD,
  "courier-new": "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
  verdana: DEJAVU_BOLD,
  "trebuchet-ms": DEJAVU_BOLD,
  impact: DEJAVU_BOLD,
  "comic-sans-ms": DEJAVU_BOLD,
  palatino: DEJAVU_BOLD,
  garamond: DEJAVU_BOLD,
  bookman: DEJAVU_BOLD,
  "avant-garde": DEJAVU_BOLD,

  roboto: `${GOOGLE_FONT_DIR}/roboto/Roboto-Bold.ttf`,
  "open-sans": `${GOOGLE_FONT_DIR}/opensans/OpenSans-Bold.ttf`,
  montserrat: `${GOOGLE_FONT_DIR}/montserrat/Montserrat-Bold.ttf`,
  lato: `${GOOGLE_FONT_DIR}/lato/Lato-Bold.ttf`,
  oswald: `${GOOGLE_FONT_DIR}/oswald/Oswald-Bold.ttf`,
  raleway: `${GOOGLE_FONT_DIR}/raleway/Raleway-Bold.ttf`,
  "playfair-display": `${GOOGLE_FONT_DIR}/playfairdisplay/PlayfairDisplay-Bold.ttf`,
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
// rsvg-convert cannot render Unicode emoji glyphs natively.
// We download the emoji as a PNG from the Twemoji CDN and embed it
// as a base64 data URI <image> element inside the SVG.

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

  // Try to get emoji as embedded Twemoji PNG data URI
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

/**
 * Convert an SVG string to a PNG file using rsvg-convert, ImageMagick, or raw SVG fallback.
 */
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

/**
 * Prepare icon PNG files for all active contact + social entries.
 */
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

export async function brandVideo({
  inputPath, logoPath, outputPath, jobDir,
  logoSize = "medium", logoPosition = "bottom-right",
  logoOpacity = 0.9, logoTargetHeightPx, logoEnabled = true,
  brandName, primaryColor, tagline, contact, social, elements,
  fontFamily, stickers, stickerMeta,
}) {
  const hasLogo = logoEnabled && logoPath;
  const targetHeight = logoTargetHeightPx || LOGO_SIZE_MAP[logoSize] || LOGO_SIZE_MAP.medium;
  const overlayPos = getOverlayPosition(logoPosition);
  const bgColor = primaryColor ? hexToFFmpegColor(primaryColor) : "0x000000";
  const fontColor = "0xFFFFFF";
  const tempDir = jobDir || path.dirname(outputPath);

  const iconSize = 18;
  const iconGap = 4;

  // Resolve font paths (regular + bold)
  const fontPath = await resolveFont(fontFamily, false);
  const boldFontPath = await resolveFont(fontFamily, true);
  console.log(`[video.js] Font: slug=${fontFamily || "default"}, regular=${fontPath}, bold=${boldFontPath}`);

  // Prepare footer icon PNGs
  const footerIcons = await prepareFooterIcons({ social, contact, jobDir: tempDir, iconSize });

  // Render sticker badges as PNGs (with Twemoji emoji support)
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

  console.log(`[video.js] Branding: logo=${hasLogo} (${logoSize}/${targetHeight}px), header=${brandName || "none"}, footerIcons=${footerIcons.length}, tagline=${tagline || "none"}, stickers=${stickerPngs.length}`);

  const filters = [];
  const inputs = ["-i", inputPath];
  let lastLabel = "[0:v]";
  let inputIndex = 1;

  // --- Logo overlay ---
  if (hasLogo) {
    inputs.push("-i", logoPath);
    filters.push(`[${inputIndex}:v]scale=-1:${targetHeight},format=rgba,colorchannelmixer=aa=${logoOpacity}[logo]`);
    filters.push(`${lastLabel}[logo]overlay=${overlayPos}[v_logo]`);
    lastLabel = "[v_logo]";
    inputIndex++;
  }

  // --- Header: 40px bar with brand name (uses bold font) ---
  if (hasHeader) {
    const escapedName = escapeDrawText(brandName);
    filters.push(`${lastLabel}drawbox=x=0:y=0:w=iw:h=40:color=${bgColor}@0.7:t=fill[v_hdr_bg]`);
    lastLabel = "[v_hdr_bg]";
    filters.push(`${lastLabel}drawtext=text='${escapedName}':fontsize=18:fontcolor=${fontColor}:x=20:y=11:fontfile=${boldFontPath}[v_hdr]`);
    lastLabel = "[v_hdr]";
  }

  // --- Sticker overlays (top-right corner, stacked vertically) ---
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

  // --- Footer with inline icons (uses regular font) ---
  if (hasFooterContent) {
    const footerHeight = 32;

    // Draw background bar
    filters.push(`${lastLabel}drawbox=x=0:y=ih-${footerHeight}:w=iw:h=${footerHeight}:color=${bgColor}@0.7:t=fill[v_ftr_bg]`);
    lastLabel = "[v_ftr_bg]";

    // Calculate font size based on total content length
    const totalTextLen = (tagline || "").length +
      footerIcons.reduce((sum, e) => sum + e.label.length + 3, 0);
    const fontSize = totalTextLen > 100 ? 10 : totalTextLen > 60 ? 12 : 14;
    const charWidth = Math.round(fontSize * 0.6);
    const separatorWidth = Math.round(charWidth * 5);

    // Build segments
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

  // Build and run FFmpeg command
  if (filters.length > 0) {
    const finalLabel = lastLabel.replace("[", "").replace("]", "");
    const filterComplex = filters.join(";");
    const args = ["-y", ...inputs, "-filter_complex", filterComplex, "-map", `[${finalLabel}]`, "-map", "0:a?", "-c:a", "copy", "-shortest", outputPath];
    console.log(`[video.js] FFmpeg filter_complex (${filters.length} filters, ${inputIndex} inputs)`);
    console.log(`[video.js] Filter: ${filterComplex.slice(0, 500)}...`);
    await run("ffmpeg", args);
  } else {
    console.log("[video.js] No branding elements, copying input to output");
    await fs.copyFile(inputPath, outputPath);
  }

  // Clean up temporary files (icons + stickers)
  for (const icon of footerIcons) {
    await fs.unlink(icon.iconPath).catch(() => {});
  }
  for (const sticker of stickerPngs) {
    await fs.unlink(sticker.path).catch(() => {});
  }
}
