import { run } from "../utils.js";
import fs from "fs/promises";
import path from "path";
import { execFileSync } from "child_process";

// ─── Font resolution ───────────────────────────────────────────────────────
const GOOGLE_FONT_DIR = "/usr/share/fonts/google";
const DEJAVU_REGULAR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";
const DEJAVU_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";

const FONT_MAP = {
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
    console.warn(`[video-wrapper.js] Unknown font slug "${slug}", using DejaVu fallback`);
    return fallback;
  }

  try {
    await fs.access(candidate);
    return candidate;
  } catch {
    console.warn(`[video-wrapper.js] Font file not found: ${candidate}, using DejaVu fallback`);
    return fallback;
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

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

function withStaticOverlayOptions(positionExpr) {
  return `${positionExpr}:eof_action=pass:repeatlast=1:shortest=1`;
}

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
    console.warn("[video-wrapper.js] ffprobe failed, using defaults:", e.message);
    return { width: 1920, height: 1080, fps: 30, hasAudio: true };
  }
}

/**
 * Generate a temporary circular badge PNG using ImageMagick.
 * Returns the path to the generated file (caller must clean up).
 */
async function generateCircleBadgePng(jobDir, diameter, bgColorHex, textColorHex, text, fontPath, fontSize) {
  const badgePath = path.join(jobDir, `_badge_circle_${Date.now()}.png`);
  try {
    // Create a filled circle with centered text using ImageMagick convert
    const args = [
      "-size", `${diameter}x${diameter}`,
      "xc:none",
      "-fill", bgColorHex,
      "-draw", `circle ${diameter / 2},${diameter / 2} ${diameter / 2},0`,
      "-gravity", "center",
      "-fill", textColorHex,
      "-font", fontPath,
      "-pointsize", `${fontSize}`,
      "-annotate", "+0+0", text,
      badgePath,
    ];
    await run("convert", args);
    return badgePath;
  } catch (e) {
    console.warn("[video-wrapper.js] Failed to generate circle badge PNG:", e.message);
    return null;
  }
}

/**
 * Generate a temporary vertical text PNG using ImageMagick.
 * Creates text then rotates it 90° counter-clockwise.
 * Returns the path to the generated file (caller must clean up).
 */
async function generateVerticalTextPng(jobDir, text, fontSize, fontColor, bgColor, fontPath, maxHeight) {
  const textPath = path.join(jobDir, `_vertical_text_${Date.now()}.png`);
  try {
    const args = [
      "-background", bgColor,
      "-fill", fontColor,
      "-font", fontPath,
      "-pointsize", `${fontSize}`,
      "-gravity", "center",
      "label:" + text,
      "-rotate", "90",
      textPath,
    ];
    await run("convert", args);
    return textPath;
  } catch (e) {
    console.warn("[video-wrapper.js] Failed to generate vertical text PNG:", e.message);
    return null;
  }
}

// ─── Wrapper overlay filter builder ────────────────────────────────────────

function buildWrapperOverlayFilters({
  inputPath, wrapper, fontPath, boldFontPath, lastLabel, inputIndex, inputs, filters,
  logoPath, logoEnabled, logoTargetHeight, logoOpacity,
  jobDir, cleanupPaths,
}) {
  if (!wrapper || typeof wrapper !== "object") {
    return { lastLabel, inputIndex, cleanupPaths, preSteps: [] };
  }

  const els = wrapper.elements || {};
  const colors = wrapper.colors || {};
  const bgColor = hexToFFmpegColor(colors.primary || "#111111");
  const secColor = hexToFFmpegColor(colors.secondary || "#FFFFFF");
  const accentColor = hexToFFmpegColor(colors.accent || "#FFCC00");
  const borderColor = hexToFFmpegColor(colors.border || "#111111");
  const fontColor = secColor;
  const headline = wrapper.headline || "";
  const subheadline = wrapper.subheadline || "";
  const cta = wrapper.cta || "";
  const badgeText = wrapper.badge_text || "";
  const website = wrapper.website || "";
  const phone = wrapper.phone || "";
  const fontScaleRaw = Number(wrapper.font_size ?? 100);
  const fontScale = Number.isFinite(fontScaleRaw)
    ? Math.max(0.5, Math.min(2, fontScaleRaw / 100))
    : 1;
  const borderThicknessRaw = Number(wrapper.border_thickness ?? 100);
  const borderThicknessScale = Number.isFinite(borderThicknessRaw)
    ? Math.max(0.25, Math.min(2, borderThicknessRaw / 100))
    : 1;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const probe = probeVideoInfo(inputPath);
  const sourceWidth = probe.width;
  const sourceHeight = probe.height;

  const borderW = els.border ? Math.max(2, Math.round(sourceWidth * 0.015 * borderThicknessScale)) : 0;
  const topBarH = els.top_bar ? Math.max(36, Math.round(sourceHeight * 0.08)) : 0;
  const bottomBarH = els.bottom_bar ? Math.max(36, Math.round(sourceHeight * 0.08)) : 0;
  const footerCtaH = els.footer_cta ? Math.max(28, Math.round(sourceHeight * 0.06)) : 0;
  const sidePanelW = els.side_panel ? Math.round(sourceWidth * 0.22) : 0;

  const canvasW = sourceWidth + borderW * 2 + sidePanelW;
  const canvasH = sourceHeight + borderW * 2 + topBarH + bottomBarH + footerCtaH;
  // Ensure even dimensions for h264
  const finalCanvasW = canvasW % 2 === 0 ? canvasW : canvasW + 1;
  const finalCanvasH = canvasH % 2 === 0 ? canvasH : canvasH + 1;
  const imgX = borderW;
  const imgY = borderW + topBarH;
  const contentW = finalCanvasW - borderW * 2;
  const baseFillColor = els.border ? borderColor : bgColor;

  // Pre-steps: async operations to generate overlay PNGs before building the filter chain
  const preSteps = [];

  console.log(`[video-wrapper.js] Wrapper overlay: headline="${headline}", sub="${subheadline}", cta="${cta}", badge="${badgeText}"`);
  console.log(`[video-wrapper.js] Wrapper elements: ${JSON.stringify(els)}`);
  console.log(`[video-wrapper.js] Wrapper geometry: ${sourceWidth}x${sourceHeight} → ${finalCanvasW}x${finalCanvasH}, border=${borderW}, top=${topBarH}, bottom=${bottomBarH}, cta=${footerCtaH}, side=${sidePanelW}`);

  // Expand canvas with pad filter
  if (finalCanvasW !== sourceWidth || finalCanvasH !== sourceHeight) {
    filters.push(`${lastLabel}pad=${finalCanvasW}:${finalCanvasH}:${imgX}:${imgY}:color=${baseFillColor}[v_wrap_canvas]`);
    lastLabel = "[v_wrap_canvas]";
  }

  // Background overlay on video area
  if (els.background_overlay) {
    filters.push(`${lastLabel}drawbox=x=${imgX}:y=${imgY}:w=${sourceWidth}:h=${sourceHeight}:color=${bgColor}@0.35:t=fill[v_wrap_bgov]`);
    lastLabel = "[v_wrap_bgov]";
  }

  // Side panel background
  if (els.side_panel) {
    const panelX = finalCanvasW - borderW - sidePanelW;
    const panelY = imgY;
    filters.push(`${lastLabel}drawbox=x=${panelX}:y=${panelY}:w=${sidePanelW}:h=${sourceHeight}:color=${bgColor}:t=fill[v_wrap_sp]`);
    lastLabel = "[v_wrap_sp]";

    // Side panel text: generate rotated text PNG and overlay it
    if (subheadline) {
      const fontSize = clamp(Math.round(sidePanelW * 0.12 * fontScale), 8, 72);
      preSteps.push({
        type: "side_panel_text",
        generate: () => generateVerticalTextPng(
          jobDir, subheadline, fontSize,
          colors.secondary || "#FFFFFF",
          colors.primary || "#111111",
          boldFontPath, sourceHeight
        ),
        apply: (pngPath) => {
          inputs.push("-loop", "1", "-i", pngPath);
          // Scale the rotated text to fit the side panel, maintaining aspect ratio
          filters.push(`[${inputIndex}:v]scale=${sidePanelW}:${sourceHeight}:force_original_aspect_ratio=decrease,format=rgba[sp_txt]`);
          const txtX = `${panelX}+(${sidePanelW}-overlay_w)/2`;
          const txtY = `${panelY}+(${sourceHeight}-overlay_h)/2`;
          filters.push(`${lastLabel}[sp_txt]overlay=${withStaticOverlayOptions(`x=${txtX}:y=${txtY}`)}[v_wrap_sps]`);
          lastLabel = "[v_wrap_sps]";
          inputIndex++;
          cleanupPaths.push(pngPath);
        },
      });
    }
  }

  // Top bar
  if (els.top_bar) {
    const barY = borderW;
    filters.push(`${lastLabel}drawbox=x=${borderW}:y=${barY}:w=${contentW}:h=${topBarH}:color=${bgColor}:t=fill[v_wrap_tb]`);
    lastLabel = "[v_wrap_tb]";
    if (headline) {
      const escaped = escapeDrawText(headline);
      const fontSize = clamp(Math.round(topBarH * 0.55 * fontScale), 10, 144);
      const textX = `${borderW}+(${contentW}-tw)/2`;
      const textY = barY + Math.round((topBarH - fontSize) / 2);
      filters.push(`${lastLabel}drawtext=text='${escaped}':fontsize=${fontSize}:fontcolor=${fontColor}:x=${textX}:y=${textY}:fontfile=${boldFontPath}[v_wrap_tbh]`);
      lastLabel = "[v_wrap_tbh]";
    }
  }

  // Badge — generate circular PNG and overlay it
  if (els.badge && badgeText) {
    const badgeDiameter = Math.max(32, Math.round(Math.min(sourceWidth, sourceHeight) * 0.07));
    const badgeFontSize = clamp(Math.round(badgeDiameter * 0.3 * fontScale), 8, 56);
    const badgeX = finalCanvasW - borderW - sidePanelW - badgeDiameter - 8;
    const badgeY = imgY + 8;

    preSteps.push({
      type: "badge_circle",
      generate: () => generateCircleBadgePng(
        jobDir, badgeDiameter,
        colors.accent || "#FFCC00",
        colors.primary || "#111111",
        badgeText, boldFontPath, badgeFontSize
      ),
      apply: (pngPath) => {
        inputs.push("-loop", "1", "-i", pngPath);
        filters.push(`[${inputIndex}:v]format=rgba[badge_img]`);
        filters.push(`${lastLabel}[badge_img]overlay=${withStaticOverlayOptions(`x=${badgeX}:y=${badgeY}`)}[v_wrap_bdg]`);
        lastLabel = "[v_wrap_bdg]";
        inputIndex++;
        cleanupPaths.push(pngPath);
      },
    });
  }

  // Logo inside wrapper
  if (els.logo && logoEnabled && logoPath) {
    const lh = logoTargetHeight || 60;
    inputs.push("-loop", "1", "-i", logoPath);
    filters.push(`[${inputIndex}:v]scale=-1:${lh},format=rgba,colorchannelmixer=aa=${logoOpacity || 0.9}[wrap_logo]`);
    const logoX = imgX + 10;
    const logoY = imgY + 10;
    filters.push(`${lastLabel}[wrap_logo]overlay=${withStaticOverlayOptions(`x=${logoX}:y=${logoY}`)}[v_wrap_logo]`);
    lastLabel = "[v_wrap_logo]";
    inputIndex++;
  }

  // Bottom bar
  if (els.bottom_bar) {
    const barY = finalCanvasH - borderW - footerCtaH - bottomBarH;
    filters.push(`${lastLabel}drawbox=x=${borderW}:y=${barY}:w=${contentW}:h=${bottomBarH}:color=${bgColor}:t=fill[v_wrap_btm]`);
    lastLabel = "[v_wrap_btm]";
    if (subheadline) {
      const escaped = escapeDrawText(subheadline);
      const fontSize = clamp(Math.round(bottomBarH * 0.45 * fontScale), 8, 96);
      const textX = `${borderW}+(${contentW}-tw)/2`;
      const textY = barY + Math.round((bottomBarH - fontSize) / 2);
      filters.push(`${lastLabel}drawtext=text='${escaped}':fontsize=${fontSize}:fontcolor=${fontColor}:x=${textX}:y=${textY}:fontfile=${fontPath}[v_wrap_btm_txt]`);
      lastLabel = "[v_wrap_btm_txt]";
    }
  }

  // Footer CTA bar
  if (els.footer_cta) {
    const footerY = finalCanvasH - borderW - footerCtaH;
    filters.push(`${lastLabel}drawbox=x=${borderW}:y=${footerY}:w=${contentW}:h=${footerCtaH}:color=${accentColor}:t=fill[v_wrap_cta_bg]`);
    lastLabel = "[v_wrap_cta_bg]";

    const footerText = [cta, website, phone].filter(Boolean).join("  •  ");
    if (footerText) {
      const escaped = escapeDrawText(footerText);
      const fontSize = clamp(Math.round(footerCtaH * 0.5 * fontScale), 8, 72);
      const textX = `${borderW}+(${contentW}-tw)/2`;
      const textY = footerY + Math.round((footerCtaH - fontSize) / 2);
      filters.push(`${lastLabel}drawtext=text='${escaped}':fontsize=${fontSize}:fontcolor=${bgColor}:x=${textX}:y=${textY}:fontfile=${boldFontPath}[v_wrap_cta_txt]`);
      lastLabel = "[v_wrap_cta_txt]";
    }
  }

  // Border (rendered LAST so it's the outermost layer)
  if (els.border && borderW > 0) {
    filters.push(`${lastLabel}drawbox=x=0:y=0:w=${finalCanvasW}:h=${borderW}:color=${borderColor}:t=fill[v_wrap_bt]`);
    lastLabel = "[v_wrap_bt]";
    filters.push(`${lastLabel}drawbox=x=0:y=${finalCanvasH - borderW}:w=${finalCanvasW}:h=${borderW}:color=${borderColor}:t=fill[v_wrap_bb]`);
    lastLabel = "[v_wrap_bb]";
    filters.push(`${lastLabel}drawbox=x=0:y=0:w=${borderW}:h=${finalCanvasH}:color=${borderColor}:t=fill[v_wrap_bl]`);
    lastLabel = "[v_wrap_bl]";
    filters.push(`${lastLabel}drawbox=x=${finalCanvasW - borderW}:y=0:w=${borderW}:h=${finalCanvasH}:color=${borderColor}:t=fill[v_wrap_br]`);
    lastLabel = "[v_wrap_br]";
  }

  return { lastLabel, inputIndex, cleanupPaths, preSteps };
}

// ─── Main export ───────────────────────────────────────────────────────────

const LOGO_SIZE_MAP = {
  small: 50,
  medium: 100,
  large: 150,
  xlarge: 200,
};

export async function brandVideoWrapper({
  inputPath, logoPath, outputPath, jobDir,
  logoSize = "medium", logoPosition = "bottom-right",
  logoOpacity = 0.9, logoTargetHeightPx, logoEnabled = true,
  fontFamily,
  wrapper,
}) {
  console.log(`[video-wrapper.js] === VIDEO WRAPPER JOB ===`);
  console.log(`[video-wrapper.js] Input: ${inputPath}`);
  console.log(`[video-wrapper.js] Wrapper config: ${JSON.stringify(wrapper || {})}`);

  if (!wrapper || typeof wrapper !== "object" || !wrapper.elements) {
    throw new Error("video-wrapper.js called without valid wrapper config");
  }

  const hasLogo = logoEnabled && logoPath;
  const targetHeight = logoTargetHeightPx || LOGO_SIZE_MAP[logoSize] || LOGO_SIZE_MAP.medium;

  const fontPath = await resolveFont(fontFamily, false);
  const boldFontPath = await resolveFont(fontFamily, true);
  console.log(`[video-wrapper.js] Font: slug=${fontFamily || "default"}, regular=${fontPath}, bold=${boldFontPath}`);

  const filters = [];
  const inputs = ["-i", inputPath];
  let lastLabel = "[0:v]";
  let inputIndex = 1;
  const cleanupPaths = [];

  // Build wrapper overlay filters
  const wrapResult = buildWrapperOverlayFilters({
    inputPath, wrapper, fontPath, boldFontPath, lastLabel, inputIndex, inputs, filters,
    logoPath: hasLogo ? logoPath : null,
    logoEnabled, logoTargetHeight: targetHeight, logoOpacity,
    jobDir, cleanupPaths,
  });

  // Execute pre-steps (generate PNGs for badge circle, vertical text, etc.)
  if (wrapResult.preSteps && wrapResult.preSteps.length > 0) {
    for (const step of wrapResult.preSteps) {
      console.log(`[video-wrapper.js] Running pre-step: ${step.type}`);
      const pngPath = await step.generate();
      if (pngPath) {
        // Update lastLabel/inputIndex via the closure
        lastLabel = wrapResult.lastLabel;
        step.apply(pngPath);
        wrapResult.lastLabel = lastLabel;
        wrapResult.inputIndex = inputIndex;
      } else {
        console.warn(`[video-wrapper.js] Pre-step ${step.type} failed to generate PNG, skipping`);
      }
    }
  }

  lastLabel = wrapResult.lastLabel;
  inputIndex = wrapResult.inputIndex;

  if (filters.length > 0) {
    // Normalize timestamps
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
      "-crf", "18",
      "-c:a", "copy",
      "-shortest",
      outputPath,
    ];
    console.log(`[video-wrapper.js] FFmpeg filter_complex (${filters.length} filters, ${inputIndex} inputs)`);
    console.log(`[video-wrapper.js] Filter: ${filterComplex.slice(0, 500)}...`);
    await run("ffmpeg", args);
  } else {
    console.log("[video-wrapper.js] No wrapper filters generated, copying input to output");
    await fs.copyFile(inputPath, outputPath);
  }

  // Cleanup
  if (Array.isArray(wrapResult.cleanupPaths)) {
    for (const p of wrapResult.cleanupPaths) {
      await fs.unlink(p).catch(() => {});
    }
  }

  console.log(`[video-wrapper.js] === WRAPPER JOB COMPLETE ===`);
}
