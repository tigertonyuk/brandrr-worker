import { spawn, execSync } from "child_process";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import fetch from "node-fetch";
import { pipeline } from "stream/promises";

export function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio:["ignore","pipe","pipe"] });
    let err="";
    p.stderr.on("data", d => err+=d);
    p.on("close", c => c===0?resolve():reject(new Error(err)));
  });
}

export async function ensureDir(d){ await fs.mkdir(d,{recursive:true}); }

export async function downloadToFile(url, localPath){
  const res = await fetch(url);
  if(!res.ok) throw new Error("Download failed");
  await ensureDir(path.dirname(localPath));
  await pipeline(res.body, fsSync.createWriteStream(localPath));
  return localPath;
}

/* ── Font mapping ─────────────────────────────────────────────── */

const FONT_DIR = "/usr/share/fonts/google";

const FONT_MAP = {
  "playfair-display":    "PlayfairDisplay[wght].ttf",
  "merriweather":        "Merriweather-Regular.ttf",
  "lora":                "Lora[wght].ttf",
  "raleway":             "Raleway[wght].ttf",
  "oswald":              "Oswald[wght].ttf",
  "montserrat":          "Montserrat[wght].ttf",
  "roboto-slab":         "RobotoSlab[wght].ttf",
  "poppins":             "Poppins-Regular.ttf",
  "nunito":              "Nunito[wght].ttf",
  "crimson-text":        "CrimsonText-Regular.ttf",
  "bitter":              "Bitter[wght].ttf",
  "dancing-script":      "DancingScript[wght].ttf",
  "great-vibes":         "GreatVibes-Regular.ttf",
  "pacifico":            "Pacifico-Regular.ttf",
  "caveat":              "Caveat[wght].ttf",
  "bebas-neue":          "BebasNeue-Regular.ttf",
  "anton":               "Anton-Regular.ttf",
  "righteous":           "Righteous-Regular.ttf",
  "permanent-marker":    "PermanentMarker-Regular.ttf",
  "bangers":             "Bangers-Regular.ttf",
  "space-mono":          "SpaceMono-Regular.ttf",
  "source-code-pro":     "SourceCodePro[wght].ttf",
  "inconsolata":         "Inconsolata[wght].ttf",
  "fira-sans":           "FiraSans-Regular.ttf",
  "josefin-sans":        "JosefinSans[wght].ttf",
  "cormorant-garamond":  "CormorantGaramond-Regular.ttf",
  "libre-baskerville":   "LibreBaskerville-Regular.ttf",
  "quicksand":           "Quicksand[wght].ttf",
  "comfortaa":           "Comfortaa[wght].ttf",
  "architects-daughter":  "ArchitectsDaughter-Regular.ttf",
};

/**
 * Resolve a fontFamily slug to an absolute .ttf path.
 * Returns the DejaVu fallback if slug is missing or file not found.
 */
export function resolveFontPath(slug) {
  if (!slug || slug === "default") return "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";
  const file = FONT_MAP[slug];
  if (!file) return "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";
  const full = path.join(FONT_DIR, file);
  if (fsSync.existsSync(full)) return full;
  console.warn(`[utils] Font file not found: ${full}, using fallback`);
  return "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";
}

/* ── Sticker renderer ─────────────────────────────────────────── */

const GRADIENT_MAP = {
  "bg-gradient-to-r from-pink-500 to-purple-500":       ["#ec4899","#a855f7"],
  "bg-gradient-to-r from-blue-500 to-cyan-500":         ["#3b82f6","#06b6d4"],
  "bg-gradient-to-r from-green-500 to-emerald-500":     ["#22c55e","#10b981"],
  "bg-gradient-to-r from-violet-500 to-fuchsia-500":    ["#8b5cf6","#d946ef"],
  "bg-gradient-to-r from-orange-500 to-red-500":        ["#f97316","#ef4444"],
  "bg-gradient-to-r from-indigo-500 to-blue-500":       ["#6366f1","#3b82f6"],
  "bg-gradient-to-r from-amber-400 to-yellow-500":      ["#fbbf24","#eab308"],
  "bg-gradient-to-r from-red-600 to-red-500":           ["#dc2626","#ef4444"],
  "bg-gradient-to-r from-teal-500 to-green-500":        ["#14b8a6","#22c55e"],
  "bg-gradient-to-r from-sky-500 to-blue-500":          ["#0ea5e9","#3b82f6"],
  "bg-gradient-to-r from-orange-500 to-amber-500":      ["#f97316","#f59e0b"],
  "bg-gradient-to-r from-slate-600 to-slate-500":       ["#475569","#64748b"],
  "bg-gradient-to-r from-emerald-600 to-green-500":     ["#059669","#22c55e"],
  "bg-gradient-to-r from-yellow-500 to-amber-400":      ["#eab308","#fbbf24"],
  "bg-gradient-to-r from-blue-600 to-indigo-500":       ["#2563eb","#6366f1"],
  "bg-gradient-to-r from-green-600 to-emerald-500":     ["#16a34a","#10b981"],
  "bg-gradient-to-r from-rose-500 to-pink-500":         ["#f43f5e","#ec4899"],
  "bg-gradient-to-r from-blue-800 to-red-600":          ["#1e40af","#dc2626"],
  "bg-gradient-to-r from-fuchsia-500 to-pink-500":      ["#d946ef","#ec4899"],
  "bg-gradient-to-r from-cyan-500 to-blue-500":         ["#06b6d4","#3b82f6"],
  "bg-gradient-to-r from-amber-500 to-yellow-400":      ["#f59e0b","#facc15"],
  "bg-gradient-to-r from-violet-500 to-purple-500":     ["#8b5cf6","#a855f7"],
  "bg-gradient-to-r from-yellow-400 to-red-500":        ["#facc15","#ef4444"],
  "bg-gradient-to-r from-gray-700 to-gray-600":         ["#374151","#4b5563"],
  "bg-gradient-to-r from-green-500 to-teal-500":        ["#22c55e","#14b8a6"],
  "bg-gradient-to-r from-blue-500 to-purple-500":       ["#3b82f6","#a855f7"],
  "bg-gradient-to-r from-rose-600 to-red-500":          ["#e11d48","#ef4444"],
  "bg-gradient-to-r from-amber-600 to-orange-500":      ["#d97706","#f97316"],
  "bg-gradient-to-r from-purple-700 to-violet-500":     ["#7e22ce","#8b5cf6"],
  "bg-gradient-to-r from-yellow-600 to-amber-500":      ["#ca8a04","#f59e0b"],
  "bg-gradient-to-r from-lime-500 to-teal-500":         ["#84cc16","#14b8a6"],
  "bg-gradient-to-r from-pink-600 to-rose-400":         ["#db2777","#fb7185"],
  "bg-gradient-to-r from-cyan-600 to-teal-500":         ["#0891b2","#14b8a6"],
};

// Inline sticker catalog (fallback if stickerMeta not provided)
const STICKER_CATALOG = [
  { id:"best-seller",        label:"Best Seller",        emoji:"🏆", bgColor:"bg-gradient-to-r from-pink-500 to-purple-500",    textColor:"text-white" },
  { id:"new-arrival",        label:"New Arrival",        emoji:"✨", bgColor:"bg-gradient-to-r from-blue-500 to-cyan-500",      textColor:"text-white" },
  { id:"limited-edition",    label:"Limited Edition",    emoji:"💎", bgColor:"bg-gradient-to-r from-violet-500 to-fuchsia-500", textColor:"text-white" },
  { id:"sale",               label:"Sale",               emoji:"🔥", bgColor:"bg-gradient-to-r from-orange-500 to-red-500",     textColor:"text-white" },
  { id:"free-shipping",      label:"Free Shipping",      emoji:"🚚", bgColor:"bg-gradient-to-r from-green-500 to-emerald-500",  textColor:"text-white" },
  { id:"top-rated",          label:"Top Rated",          emoji:"⭐", bgColor:"bg-gradient-to-r from-amber-400 to-yellow-500",   textColor:"text-white" },
  { id:"eco-friendly",       label:"Eco-Friendly",       emoji:"🌿", bgColor:"bg-gradient-to-r from-teal-500 to-green-500",     textColor:"text-white" },
  { id:"handmade",           label:"Handmade",           emoji:"🤲", bgColor:"bg-gradient-to-r from-orange-500 to-amber-500",   textColor:"text-white" },
  { id:"premium",            label:"Premium",            emoji:"👑", bgColor:"bg-gradient-to-r from-indigo-500 to-blue-500",    textColor:"text-white" },
  { id:"trending",           label:"Trending",           emoji:"📈", bgColor:"bg-gradient-to-r from-rose-500 to-pink-500",      textColor:"text-white" },
  { id:"exclusive",          label:"Exclusive",          emoji:"🔒", bgColor:"bg-gradient-to-r from-slate-600 to-slate-500",    textColor:"text-white" },
  { id:"organic",            label:"Organic",            emoji:"🌱", bgColor:"bg-gradient-to-r from-emerald-600 to-green-500",  textColor:"text-white" },
  { id:"award-winning",      label:"Award Winning",      emoji:"🏅", bgColor:"bg-gradient-to-r from-yellow-500 to-amber-400",   textColor:"text-white" },
  { id:"staff-pick",         label:"Staff Pick",         emoji:"💡", bgColor:"bg-gradient-to-r from-blue-600 to-indigo-500",    textColor:"text-white" },
  { id:"vegan",              label:"Vegan",              emoji:"🥬", bgColor:"bg-gradient-to-r from-green-600 to-emerald-500",  textColor:"text-white" },
  { id:"back-in-stock",      label:"Back in Stock",      emoji:"📦", bgColor:"bg-gradient-to-r from-sky-500 to-blue-500",       textColor:"text-white" },
  { id:"clearance",          label:"Clearance",          emoji:"🏷️", bgColor:"bg-gradient-to-r from-red-600 to-red-500",        textColor:"text-white" },
  { id:"made-in-usa",        label:"Made in USA",        emoji:"🇺🇸", bgColor:"bg-gradient-to-r from-blue-800 to-red-600",      textColor:"text-white" },
  { id:"gift-idea",          label:"Gift Idea",          emoji:"🎁", bgColor:"bg-gradient-to-r from-fuchsia-500 to-pink-500",  textColor:"text-white" },
  { id:"flash-deal",         label:"Flash Deal",         emoji:"⚡", bgColor:"bg-gradient-to-r from-cyan-500 to-blue-500",      textColor:"text-white" },
  { id:"customer-favorite",  label:"Customer Favorite",  emoji:"❤️", bgColor:"bg-gradient-to-r from-rose-600 to-red-500",      textColor:"text-white" },
  { id:"bundle-save",        label:"Bundle & Save",      emoji:"📦", bgColor:"bg-gradient-to-r from-amber-600 to-orange-500",  textColor:"text-white" },
  { id:"luxury",             label:"Luxury",             emoji:"💫", bgColor:"bg-gradient-to-r from-purple-700 to-violet-500",  textColor:"text-white" },
  { id:"value-pack",         label:"Value Pack",         emoji:"💰", bgColor:"bg-gradient-to-r from-yellow-600 to-amber-500",  textColor:"text-white" },
  { id:"cruelty-free",       label:"Cruelty Free",       emoji:"🐰", bgColor:"bg-gradient-to-r from-pink-500 to-purple-500",   textColor:"text-white" },
  { id:"sustainable",        label:"Sustainable",        emoji:"♻️", bgColor:"bg-gradient-to-r from-lime-500 to-teal-500",     textColor:"text-white" },
  { id:"new-formula",        label:"New Formula",        emoji:"🧪", bgColor:"bg-gradient-to-r from-cyan-600 to-teal-500",     textColor:"text-white" },
  { id:"editors-choice",     label:"Editor's Choice",    emoji:"✍️", bgColor:"bg-gradient-to-r from-violet-500 to-purple-500", textColor:"text-white" },
  { id:"hot-item",           label:"Hot Item",           emoji:"🔥", bgColor:"bg-gradient-to-r from-yellow-400 to-red-500",    textColor:"text-white" },
  { id:"member-exclusive",   label:"Member Exclusive",   emoji:"🎖️", bgColor:"bg-gradient-to-r from-gray-700 to-gray-600",    textColor:"text-white" },
  { id:"just-launched",      label:"Just Launched",      emoji:"🚀", bgColor:"bg-gradient-to-r from-blue-500 to-purple-500",   textColor:"text-white" },
  { id:"season-special",     label:"Season Special",     emoji:"🌸", bgColor:"bg-gradient-to-r from-pink-600 to-rose-400",     textColor:"text-white" },
  { id:"buy-1-get-1",        label:"Buy 1 Get 1",        emoji:"🎉", bgColor:"bg-gradient-to-r from-amber-500 to-yellow-400",  textColor:"text-white" },
  { id:"low-stock",          label:"Low Stock",          emoji:"⏳", bgColor:"bg-gradient-to-r from-green-500 to-teal-500",     textColor:"text-white" },
  { id:"as-seen-on-tv",      label:"As Seen on TV",      emoji:"📺", bgColor:"bg-gradient-to-r from-blue-500 to-cyan-500",     textColor:"text-white" },
];

function resolveGradientColors(bgColor) {
  return GRADIENT_MAP[bgColor] || ["#6366f1","#3b82f6"];
}

/**
 * Render sticker badges as PNG files using SVG → rsvg-convert.
 * @param {string[]} stickerIds - Array of sticker IDs to render
 * @param {string} tmpDir - Temporary directory for output files
 * @param {number} scale - Scale multiplier (default 1)
 * @param {Array} stickerMeta - Optional metadata from frontend payload
 *   Each entry: { id, label, bgColor, textColor, emoji }
 *   If provided, used instead of local STICKER_CATALOG for matching IDs.
 * Returns array of { id, filePath, width, height }.
 */
export async function renderStickers(stickerIds, tmpDir, scale = 1, stickerMeta = null) {
  if (!stickerIds || stickerIds.length === 0) return [];

  const results = [];

  for (const id of stickerIds) {
    // Prefer stickerMeta from payload, fall back to local catalog
    let sticker = null;
    if (stickerMeta && Array.isArray(stickerMeta)) {
      sticker = stickerMeta.find(s => s.id === id);
    }
    if (!sticker) {
      sticker = STICKER_CATALOG.find(s => s.id === id);
    }
    if (!sticker) { console.warn(`[utils] Sticker not found: ${id}`); continue; }

    const padding = Math.round(12 * scale);
    const fontSize = Math.round(14 * scale);
    const emojiSize = Math.round(16 * scale);
    const borderRadius = Math.round(8 * scale);

    // Approximate text width (0.6em per char is a rough heuristic)
    const textWidth = Math.round(sticker.label.length * fontSize * 0.6);
    const emojiWidth = sticker.emoji ? emojiSize + Math.round(4 * scale) : 0;
    const width = textWidth + emojiWidth + padding * 2;
    const height = fontSize + padding * 2;

    const [c1, c2] = resolveGradientColors(sticker.bgColor);
    const textColor = sticker.textColor === "text-white" ? "#ffffff" : "#000000";

    const textY = height / 2 + fontSize * 0.35;
    let textContent = "";
    let textX = padding;

    if (sticker.emoji) {
      textContent += `<text x="${textX}" y="${textY}" font-size="${emojiSize}" fill="${textColor}" font-family="sans-serif">${sticker.emoji}</text>`;
      textX += emojiWidth;
    }

    textContent += `<text x="${textX}" y="${textY}" font-size="${fontSize}" font-weight="bold" fill="${textColor}" font-family="DejaVu Sans, sans-serif">${escapeXml(sticker.label)}</text>`;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
  </linearGradient></defs>
  <rect width="${width}" height="${height}" rx="${borderRadius}" fill="url(#g)"/>
  ${textContent}
</svg>`;

    const svgPath = path.join(tmpDir, `sticker-${id}.svg`);
    const pngPath = path.join(tmpDir, `sticker-${id}.png`);

    await fs.writeFile(svgPath, svg);

    try {
      execSync(`rsvg-convert -o "${pngPath}" "${svgPath}"`, { stdio: "pipe" });
      results.push({ id, filePath: pngPath, width, height });
    } catch (e) {
      console.warn(`[utils] Failed to render sticker ${id}:`, e.message);
    }
  }

  return results;
}

function escapeXml(str) {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");
}
