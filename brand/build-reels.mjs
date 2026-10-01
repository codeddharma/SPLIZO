/**
 * Splizo teaser reel generator.
 *
 * Renders each hook as a 1080x1920 MP4: the setup lines rise in one by one,
 * the punch line lands in gold, then an end card. Designed to read with the
 * sound off, which is how most reels are watched.
 *
 * Frames are rendered with sharp and encoded with the bundled ffmpeg binary.
 *
 *   node brand/build-reels.mjs          # all of them
 *   node brand/build-reels.mjs 01       # just the one whose slug matches
 */
import sharp from "sharp";
import { execFile } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import { promisify } from "node:util";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const ROOT = dirname(fileURLToPath(import.meta.url));

const OUT = join(ROOT, "campaign", "reels");
const TMP = join(ROOT, ".reel-frames");

/* ── Brand tokens — kept in sync with build-brand.mjs ──────────── */
const GOLD_LIGHT = "#FCD34D";
const GOLD_DARK = "#B45309";
const BG_INNER = "#302109";
const BG_OUTER = "#140D02";
const INK = "#F7F3EC";
const MUTED = "#B5A691";
const FONT = "Segoe UI, Nirmala UI, Helvetica Neue, Arial, sans-serif";

const W = 1080;
const H = 1920;
const FPS = 30;
const PAD = 104;

/** The end card's promise. Ties the date back to the question just asked. */
const END_LINE = "ISKA JAWAAB AA RAHA HAI";

/* ── The copy ─────────────────────────────────────────────────────
 * Hinglish, because that is how households actually talk about money.
 * Devanagari and Gujarati render in this font stack too, if you want
 * to swap a line.
 * ---------------------------------------------------------------- */
const REELS = [
  {
    slug: "01-app-sprawl",
    kicker: "SAWAAL EK",
    head: ["6 banking apps.", "4 cards.", "2 UPI IDs."],
    punch: ["Total kitna bacha?"],
  },
  {
    slug: "03-parents",
    kicker: "SAWAAL TEEN",
    head: ["Is mahine maa ki", "dawai aapne pay ki."],
    punch: ["Wo kis budget se", "gayi, bata sakte ho?"],
  },
  {
    slug: "04-family-loan",
    kicker: "SAWAAL CHAAR",
    head: ["₹40,000. March mein.", "Cousin ko diye the."],
    punch: ["“Next month” ab tak", "chhe baar aa chuka hai."],
  },
];

/* ── Timing ───────────────────────────────────────────────────────
 * Everything derives from the line count, so each reel runs only as
 * long as its copy needs. Short reels get finished; finished reels reach.
 * ---------------------------------------------------------------- */
function timeline(r) {
  const KICK = 0.25;
  const FIRST = 0.95;
  const STEP = 0.62;
  const headEnd = FIRST + (r.head.length - 1) * STEP;
  const punchAt = headEnd + 0.95;
  const punchEnd = punchAt + (r.punch.length - 1) * 0.5;
  const cardAt = punchEnd + 2.45;
  return { KICK, FIRST, STEP, punchAt, cardAt, total: cardAt + 2.3 };
}

/* ── Easing and reveal ────────────────────────────────────────── */
const clamp = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);
const easeOut = (p) => 1 - Math.pow(1 - p, 3);

/** Opacity plus a little upward drift, for an element revealed at `start`. */
function reveal(t, start, dur = 0.55) {
  const p = easeOut(clamp((t - start) / dur));
  return { o: p, dy: (1 - p) * 46 };
}

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const mark = ({ x, y, scale, opacity = 1 }) => `
  <g transform="translate(${x} ${y}) scale(${scale})" opacity="${opacity}">
    <circle cx="16" cy="20" r="13" fill="url(#g)" fill-opacity="0.95" />
    <circle cx="24" cy="20" r="13" fill="url(#g)" fill-opacity="0.65" />
    <path d="M10 24 L17 16 L22 21 L30 11" fill="none" stroke="white" stroke-width="2.4"
          stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="30" cy="11" r="2.4" fill="white" />
  </g>`;

/** One frame at time `t`, in seconds. */
function frame(r, t) {
  const T = timeline(r);
  const HEAD = 80;
  const LEAD = HEAD * 1.28;

  // The glows drift so the frame never sits completely still.
  const drift = Math.sin(t * 0.55) * 26;

  const k = reveal(t, T.KICK);
  let y = 700;

  const kicker = `<g opacity="${k.o}" transform="translate(0 ${k.dy})">
    <text x="${PAD}" y="${y}" font-family="${FONT}" font-size="27" font-weight="700"
      letter-spacing="6" fill="${GOLD_LIGHT}" opacity="0.85">${esc(r.kicker)}</text>
    <rect x="${PAD}" y="${y + 26}" width="92" height="3" rx="1.5" fill="${GOLD_DARK}" />
  </g>`;

  y += 112;

  const head = r.head
    .map((line, i) => {
      const a = reveal(t, T.FIRST + i * T.STEP);
      return `<text x="${PAD}" y="${y + i * LEAD + a.dy}" font-family="${FONT}"
        font-size="${HEAD}" font-weight="800" letter-spacing="${HEAD * -0.022}"
        fill="${INK}" opacity="${a.o}">${esc(line)}</text>`;
    })
    .join("");

  y += (r.head.length - 1) * LEAD + LEAD * 1.5;

  const punch = r.punch
    .map((line, i) => {
      const a = reveal(t, T.punchAt + i * 0.5);
      return `<text x="${PAD}" y="${y + i * LEAD + a.dy}" font-family="${FONT}"
        font-size="${HEAD}" font-weight="800" letter-spacing="${HEAD * -0.022}"
        fill="${GOLD_LIGHT}" opacity="${a.o}">${esc(line)}</text>`;
    })
    .join("");

  // The end card fades over the top rather than cutting, so the question is
  // still in the viewer's head when the date lands.
  const c = reveal(t, T.cardAt, 0.7);
  const endCard = `<g opacity="${c.o}">
    <rect width="${W}" height="${H}" fill="url(#bg)" />
    ${mark({ x: W / 2 - (34 * 6.2) / 2, y: H / 2 - 350, scale: 6.2 })}
    <text x="${W / 2}" y="${H / 2 - 80}" text-anchor="middle" font-family="${FONT}"
      font-size="30" font-weight="700" letter-spacing="5" fill="${GOLD_LIGHT}"
      opacity="0.9">${esc(END_LINE)}</text>
    <text x="${W / 2}" y="${H / 2 + 30}" text-anchor="middle" font-family="${FONT}"
      font-size="86" font-weight="800" letter-spacing="-2" fill="${INK}">15 September 2026</text>
    <text x="${W / 2}" y="${H / 2 + 104}" text-anchor="middle" font-family="${FONT}"
      font-size="28" font-weight="700" letter-spacing="8" fill="${MUTED}">@SPLIZO</text>
  </g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="32%" r="95%">
      <stop offset="0" stop-color="${BG_INNER}" />
      <stop offset="1" stop-color="${BG_OUTER}" />
    </radialGradient>
    <radialGradient id="glow">
      <stop offset="0" stop-color="${GOLD_LIGHT}" stop-opacity="0.16" />
      <stop offset="1" stop-color="${GOLD_LIGHT}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="g" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${GOLD_LIGHT}" />
      <stop offset="1" stop-color="${GOLD_DARK}" />
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)" />
  <circle cx="${W * 0.9}" cy="${240 + drift}" r="${W * 0.5}" fill="url(#glow)" />
  <circle cx="${W * 0.05}" cy="${H - 300 - drift}" r="${W * 0.45}" fill="url(#glow)" />
  ${kicker}${head}${punch}${endCard}
</svg>`;
}

/* ── Run ──────────────────────────────────────────────────────── */
/**
 * Find an ffmpeg binary. `@ffmpeg-installer` ships its binaries through the npm
 * registry; `ffmpeg-static` downloads from GitHub on install, which is blocked
 * on some networks. Fall back to whatever is on PATH.
 */
async function resolveFfmpeg() {
  for (const pkg of ["@ffmpeg-installer/ffmpeg", "ffmpeg-static"]) {
    try {
      const m = await import(pkg);
      const p = m.default?.path ?? m.default;
      if (typeof p === "string") return p;
    } catch {
      /* not installed — try the next one */
    }
  }
  return "ffmpeg";
}

async function build(r, ffmpeg) {
  const dir = join(TMP, r.slug);
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });

  const total = timeline(r).total;
  const count = Math.round(total * FPS);

  for (let i = 0; i < count; i++) {
    const name = String(i).padStart(4, "0");
    await sharp(Buffer.from(frame(r, i / FPS)))
      .png()
      .toFile(join(dir, `f-${name}.png`));
  }

  const out = join(OUT, `${r.slug}-reel.mp4`);
  await run(ffmpeg, [
    "-y",
    "-framerate", String(FPS),
    "-i", join(dir, "f-%04d.png"),
    "-vf", "noise=alls=4:allf=t",
    "-c:v", "libx264",
    "-preset", "slow",
    "-crf", "20",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    out,
  ]);

  await rm(dir, { recursive: true, force: true });
  console.log(`  ${r.slug}  ${total.toFixed(1)}s  ${count} frames`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  console.log("Rendering reels...");
  const only = process.argv[2];
  const list = only ? REELS.filter((r) => r.slug.includes(only)) : REELS;
  const ffmpeg = await resolveFfmpeg();
  for (const r of list) await build(r, ffmpeg);
  await rm(TMP, { recursive: true, force: true });
  console.log(`Wrote ${list.length} MP4s to brand/campaign/reels/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
