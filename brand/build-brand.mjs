/**
 * Splizo brand asset generator.
 *
 * Renders every logo, icon, and social image from a single source of truth
 * so the palette only ever has to change in one place.
 *
 *   node brand/build-brand.mjs
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));

/* ── Brand tokens ─────────────────────────────────────────────── */
const GOLD_LIGHT = "#FCD34D";
const GOLD_DARK = "#B45309";
const BG_INNER = "#302109";
const BG_OUTER = "#140D02";
const INK = "#F7F3EC"; // wordmark on dark grounds
const INK_DARK = "#1C1917"; // wordmark on light grounds
const MUTED = "#B5A691"; // tagline on dark grounds
const MUTED_DARK = "#6B6255"; // tagline on light grounds

const TAGLINE = "Every rupee, tracked and understood.";
const FONT = "Segoe UI, Helvetica Neue, Arial, sans-serif";

/* The mark lives in a 40x40 box. Visible content spans x 3..37, y 7..33. */
const MARK_BOX = 40;
const MARK_VIS = 34; // visible width within the box
const MARK_VIS_H = 26; // visible height within the box
const MARK_INSET = 3; // left offset of visible content
const MARK_TOP = 7; // top offset of visible content

/* Rough metrics for a bold humanist sans, used to centre the wordmark. */
const CAP_RATIO = 0.72;
const DESC_RATIO = 0.21;

const defs = (id) => `
    <linearGradient id="${id}" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${GOLD_LIGHT}" />
      <stop offset="1" stop-color="${GOLD_DARK}" />
    </linearGradient>`;

const faintDefs = (id) => `
    <linearGradient id="${id}" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${GOLD_LIGHT}" stop-opacity="0.13" />
      <stop offset="1" stop-color="${GOLD_DARK}" stop-opacity="0.13" />
    </linearGradient>`;

/** The mark itself, drawn into a <g> at the given scale/offset. */
const mark = (gradId, { x = 0, y = 0, scale = 1 } = {}) => `
  <g transform="translate(${x} ${y}) scale(${scale})">
    <circle cx="16" cy="20" r="13" fill="url(#${gradId})" fill-opacity="0.95" />
    <circle cx="24" cy="20" r="13" fill="url(#${gradId})" fill-opacity="0.65" />
    <path d="M10 24 L17 16 L22 21 L30 11" fill="none" stroke="white" stroke-width="2.4"
          stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="30" cy="11" r="2.4" fill="white" />
  </g>`;

const bgRect = (w, h, cx = "50%", cy = "35%") => `
  <defs>
    <radialGradient id="bg" cx="${cx}" cy="${cy}" r="95%">
      <stop offset="0" stop-color="${BG_INNER}" />
      <stop offset="1" stop-color="${BG_OUTER}" />
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)" />`;

/** "Splizo" is ~2.85x the font size wide in a bold humanist sans. */
const wordWidth = (fontSize) => fontSize * 2.85;

/* ── Canvas builders ──────────────────────────────────────────── */

/** Mark + wordmark side by side, optionally with the tagline beneath. */
function horizontalLockup({ w, h, markScale, fontSize, tagSize, tagGap, blobs = [], yShift = 0 }) {
  const markVis = MARK_VIS * markScale;
  const gap = fontSize * 0.42;
  const textW = wordWidth(fontSize);
  const total = markVis + gap + textW;
  const startX = (w - total) / 2;

  const cy = h / 2 + yShift;
  const markY = cy - (MARK_BOX * markScale) / 2;
  const markX = startX - MARK_INSET * markScale;
  const textX = startX + markVis + gap;
  // Optical centre of a cap-height word sits ~0.35em below the baseline midpoint.
  const textY = cy + fontSize * 0.35;

  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  ${bgRect(w, h)}
  <defs>${defs("g")}${faintDefs("gf")}</defs>
  ${blobs.map((b) => `<circle cx="${b.x}" cy="${b.y}" r="${b.r}" fill="url(#gf)" />`).join("\n  ")}
  ${mark("g", { x: markX, y: markY, scale: markScale })}
  <text x="${textX}" y="${textY}" font-family="${FONT}" font-size="${fontSize}"
        font-weight="700" letter-spacing="${-fontSize * 0.015}" fill="${INK}">Splizo</text>
  ${
    tagSize
      ? `<text x="${w / 2}" y="${cy + (MARK_BOX * markScale) / 2 + tagGap}" text-anchor="middle"
        font-family="${FONT}" font-size="${tagSize}" fill="${MUTED}">${TAGLINE}</text>`
      : ""
  }
</svg>`;
}

/** Mark above the wordmark — for square and portrait canvases. */
function stackedLockup({ w, h, markScale, fontSize, tagSize, blobs = [] }) {
  const markPx = MARK_BOX * markScale;
  const blockH = markPx + fontSize * 1.5 + (tagSize ? tagSize * 2.4 : 0);
  const top = (h - blockH) / 2;

  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  ${bgRect(w, h)}
  <defs>${defs("g")}${faintDefs("gf")}</defs>
  ${blobs.map((b) => `<circle cx="${b.x}" cy="${b.y}" r="${b.r}" fill="url(#gf)" />`).join("\n  ")}
  ${mark("g", { x: (w - markPx) / 2, y: top, scale: markScale })}
  <text x="${w / 2}" y="${top + markPx + fontSize * 1.05}" text-anchor="middle" font-family="${FONT}"
        font-size="${fontSize}" font-weight="700" letter-spacing="${-fontSize * 0.015}" fill="${INK}">Splizo</text>
  ${
    tagSize
      ? `<text x="${w / 2}" y="${top + markPx + fontSize * 1.05 + tagSize * 2.1}" text-anchor="middle"
        font-family="${FONT}" font-size="${tagSize}" fill="${MUTED}">${TAGLINE}</text>`
      : ""
  }
</svg>`;
}

/** The mark alone on the brand ground — profile pictures and app icons. */
function markOnGround(size, pad = 0.07) {
  const inner = size * (1 - pad * 2);
  const scale = inner / MARK_BOX;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  ${bgRect(size, size, "35%", "30%")}
  <defs>${defs("g")}</defs>
  ${mark("g", { x: size * pad, y: size * pad, scale })}
</svg>`;
}

/**
 * The mark alone with no ground — for placing on arbitrary backgrounds.
 * The viewBox is cropped to the mark's visible bounds (x 3..37, y 7..33) so
 * icons carry no dead padding; a square box centred on that content keeps the
 * circles from touching the edge.
 */
function markTransparent(size) {
  return `<svg width="${size}" height="${size}" viewBox="2 2 36 36" xmlns="http://www.w3.org/2000/svg">
  <defs>${defs("g")}</defs>
  ${mark("g")}
</svg>`;
}

/** Transparent lockup for embedding in docs and decks. */
function lockupTransparent({ onDark }) {
  const fontSize = 76;
  const markScale = 3.2;
  const markVis = MARK_VIS * markScale;
  const gap = fontSize * 0.42;
  const textW = wordWidth(fontSize);
  const w = Math.round(markVis + gap + textW);

  // Height is driven by whichever is taller: the mark's visible band (26 units)
  // or the wordmark's cap height plus its descender.
  const markVisH = MARK_VIS_H * markScale;
  const textH = fontSize * (CAP_RATIO + DESC_RATIO);
  const h = Math.round(Math.max(markVisH, textH));

  const markY = (h - markVisH) / 2 - MARK_TOP * markScale;
  const baseline = h / 2 + (fontSize * CAP_RATIO) / 2;

  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>${defs("g")}</defs>
  ${mark("g", { x: -MARK_INSET * markScale, y: markY, scale: markScale })}
  <text x="${markVis + gap}" y="${baseline}" font-family="${FONT}" font-size="${fontSize}"
        font-weight="700" letter-spacing="${-fontSize * 0.015}" fill="${onDark ? INK : INK_DARK}">Splizo</text>
</svg>`;
}

/* ── Output manifest ──────────────────────────────────────────── */
const svgSources = {
  "logo/splizo-mark.svg": markTransparent(512),
  "logo/splizo-lockup-on-dark.svg": lockupTransparent({ onDark: true }),
  "logo/splizo-lockup-on-light.svg": lockupTransparent({ onDark: false }),
  "logo/splizo-mark-on-brand.svg": markOnGround(1024),
};

// Wide canvases keep the lockup clear of the bottom-left, where every
// platform overlays the profile picture.
const fbBlobs = [
  { x: 150, y: 560, r: 230 },
  { x: 330, y: 560, r: 230 },
  { x: 1560, y: 70, r: 160 },
];

const renders = [
  // ── Icons (transparent mark, for favicons and app icons) ──
  ...[16, 32, 48, 64, 128, 180, 192, 256, 512, 1024].map((s) => ({
    file: `icons/icon-${s}.png`,
    svg: markTransparent(s),
    w: s,
    h: s,
  })),

  // ── Logo PNGs ──
  { file: "logo/splizo-mark-512.png", svg: markTransparent(512), w: 512, h: 512 },
  { file: "logo/splizo-mark-1024.png", svg: markTransparent(1024), w: 1024, h: 1024 },
  {
    file: "logo/splizo-lockup-on-dark-2048.png",
    svg: lockupTransparent({ onDark: true }),
    w: 2048,
    h: null,
  },
  {
    file: "logo/splizo-lockup-on-light-2048.png",
    svg: lockupTransparent({ onDark: false }),
    w: 2048,
    h: null,
  },

  // ── Profile pictures (square, safe under a circular crop) ──
  { file: "social/profile-512.png", svg: markOnGround(512), w: 512, h: 512 },
  { file: "social/profile-1024.png", svg: markOnGround(1024), w: 1024, h: 1024 },

  // ── Covers and banners ──
  {
    file: "social/facebook-cover-1640x624.png",
    svg: horizontalLockup({
      w: 1640, h: 624, markScale: 3.6, fontSize: 76, tagSize: 32, tagGap: 66,
      blobs: fbBlobs, yShift: -40,
    }),
    w: 1640, h: 624,
  },
  {
    file: "social/linkedin-company-cover-2256x382.png",
    svg: horizontalLockup({
      w: 1128, h: 191, markScale: 3.0, fontSize: 63, tagSize: 22, tagGap: 44,
      blobs: [{ x: 70, y: 230, r: 150 }, { x: 200, y: 230, r: 150 }, { x: 1080, y: -20, r: 110 }],
      yShift: -26,
    }),
    w: 2256, h: 382,
  },
  {
    file: "social/linkedin-personal-banner-1584x396.png",
    svg: horizontalLockup({
      w: 1584, h: 396, markScale: 2.9, fontSize: 62, tagSize: 26, tagGap: 52,
      blobs: [{ x: 150, y: 380, r: 170 }, { x: 300, y: 380, r: 170 }, { x: 1500, y: 40, r: 130 }],
      yShift: -30,
    }),
    w: 1584, h: 396,
  },
  {
    file: "social/x-header-1500x500.png",
    svg: horizontalLockup({
      w: 1500, h: 500, markScale: 3.2, fontSize: 68, tagSize: 28, tagGap: 58,
      blobs: [{ x: 140, y: 470, r: 190 }, { x: 300, y: 470, r: 190 }, { x: 1420, y: 50, r: 140 }],
      yShift: -34,
    }),
    w: 1500, h: 500,
  },
  {
    file: "social/og-image-1200x630.png",
    svg: horizontalLockup({
      w: 1200, h: 630, markScale: 3.0, fontSize: 64, tagSize: 28, tagGap: 56,
      blobs: [{ x: 120, y: 590, r: 190 }, { x: 280, y: 590, r: 190 }, { x: 1130, y: 60, r: 150 }],
      yShift: -30,
    }),
    w: 1200, h: 630,
  },

  // ── Instagram ──
  {
    file: "social/instagram-post-1080x1080.png",
    svg: stackedLockup({
      w: 1080, h: 1080, markScale: 7.2, fontSize: 104, tagSize: 34,
      blobs: [{ x: 90, y: 1020, r: 260 }, { x: 300, y: 1050, r: 260 }, { x: 1010, y: 70, r: 200 }],
    }),
    w: 1080, h: 1080,
  },
  {
    file: "social/instagram-story-1080x1920.png",
    svg: stackedLockup({
      w: 1080, h: 1920, markScale: 7.6, fontSize: 108, tagSize: 36,
      blobs: [{ x: 90, y: 1800, r: 300 }, { x: 330, y: 1860, r: 300 }, { x: 1000, y: 140, r: 240 }],
    }),
    w: 1080, h: 1920,
  },
];

/* ── Run ──────────────────────────────────────────────────────── */
async function run() {
  for (const [rel, svg] of Object.entries(svgSources)) {
    const out = join(ROOT, rel);
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, svg, "utf8");
  }

  for (const r of renders) {
    const out = join(ROOT, r.file);
    await mkdir(dirname(out), { recursive: true });
    const pipeline = sharp(Buffer.from(r.svg));
    if (r.h) pipeline.resize(r.w, r.h);
    else pipeline.resize({ width: r.w });
    await pipeline.png().toFile(out);
  }

  console.log(
    `Wrote ${Object.keys(svgSources).length} SVG sources and ${renders.length} PNGs to brand/`
  );
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
