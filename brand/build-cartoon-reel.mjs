/**
 * Splizo cartoon reel assembler.
 *
 * Takes four Gemini-generated panels from brand/cartoon/<reel>/p1..p4.png and
 * turns them into a 1080x1920 MP4: a slow zoom on each panel, dialogue that
 * pops in as chat-style cards (left or right, matching where the speaker sits
 * in the panel), a caption chip, and a branded end card.
 *
 *   node brand/build-cartoon-reel.mjs reel1
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

/* ── Brand tokens — kept in sync with build-brand.mjs ──────────── */
const GOLD_LIGHT = "#FCD34D";
const GOLD_DARK = "#B45309";
const BG_INNER = "#302109";
const BG_OUTER = "#140D02";
const INK = "#F7F3EC";
const INK_DARK = "#1C1917";
const MUTED = "#B5A691";
const FONT = "Segoe UI, Nirmala UI, Helvetica Neue, Arial, sans-serif";

const W = 1080;
const H = 1920;
const FPS = 30;
const M = 64; // side margin for cards

/* ── The scripts ──────────────────────────────────────────────────
 * `side` puts a speaker's card on the side of the frame they sit on,
 * so the conversation reads like a chat. `big` is a centred line for
 * panels with nobody in them.
 * ---------------------------------------------------------------- */
const PRIYA = { who: "PRIYA", side: "left" };
const ROHAN = { who: "ROHAN", side: "right" };

const REELS = {
  reel1: {
    out: "cartoon-1-diary",
    panels: [
      { caption: "MONTH END", lines: [{ ...PRIYA, text: "Is mahine ₹12,000 kahan gaye?" }] },
      {
        lines: [
          { ...ROHAN, text: "Grocery... aur Swiggy bhi." },
          { ...PRIYA, text: "Kitne ka?" },
          { ...ROHAN, text: "Yaad nahi." },
        ],
      },
      { caption: "DIARY, PAGE 14", lines: [{ big: true, text: "Total: ???" }] },
      {
        lines: [
          { ...ROHAN, text: "Tumne likha kyun nahi?" },
          { ...PRIYA, text: "Tumne bataya kyun nahi?" },
        ],
      },
    ],
    end: { kicker: "PART 1", head: ["Aapke ghar mein", "bhi aisa hota hai?"], foot: "PART 2 KAL · @SPLIZO" },
  },
  reel2: {
    out: "cartoon-2-phone",
    panels: [
      { lines: [{ ...ROHAN, text: "Diary purani ho gayi. Ab sab phone mein!" }] },
      { caption: "1 MAHINE BAAD", lines: [{ big: true, text: "847 screenshots.\n6 apps. 0 idea." }] },
      {
        lines: [
          { ...PRIYA, text: "Mere hisaab se ₹8,000." },
          { ...ROHAN, text: "Mere mein ₹14,000!" },
        ],
      },
      {
        lines: [
          { ...ROHAN, text: "Diary bhi fail. Phone bhi fail." },
          { ...PRIYA, text: "Ab?" },
        ],
      },
    ],
    end: { kicker: "PART 2", head: ["Diary fail.", "Phone fail."], foot: "PART 3 KAL · JAWAAB" },
  },
  reel3: {
    out: "cartoon-3-splizo",
    panels: [
      { caption: "RAAT 2 BAJE", lines: [{ ...ROHAN, text: "Main hi bana deta hoon." }] },
      { caption: "KUCH HAFTE BAAD", lines: [] },
      {
        lines: [
          { ...ROHAN, text: "Saare accounts. Dono ghar. Ek jagah." },
          { ...PRIYA, text: "Aur Bunty ka udhaar bhi?" },
          { ...ROHAN, text: "Wo bhi." },
        ],
      },
      {
        lines: [
          { ...PRIYA, text: "Iska naam?" },
          { ...ROHAN, text: "Splizo." },
        ],
      },
    ],
    end: { kicker: "BETA · 2 OCTOBER 2026", head: ["Splizo."], sub: ["Poore ghar ka hisaab,", "ek hi jagah."], foot: "LINK IN BIO · @SPLIZO" },
  },
};

/* ── Timing ───────────────────────────────────────────────────────
 * A line stays up long enough to be read at a relaxed pace, so every
 * panel runs exactly as long as its dialogue needs.
 * ---------------------------------------------------------------- */
const LEAD_IN = 0.5;
const HOLD = 0.9;
const readTime = (text) => 0.8 + text.length * 0.055;
const DIP = 0.16; // dip-to-dark at each cut
const END_DURATION = 3.2;

function plan(reel) {
  let t = 0;
  const panels = reel.panels.map((p, i) => {
    let at = LEAD_IN;
    const lines = p.lines.map((l) => {
      const shown = { ...l, at };
      at += readTime(l.text);
      return shown;
    });
    const duration = Math.max(at + HOLD, 2.6);
    const entry = { ...p, index: i, start: t, duration, lines };
    t += duration;
    return entry;
  });
  return { panels, endStart: t, total: t + END_DURATION };
}

/* ── Helpers ──────────────────────────────────────────────────── */
const clamp = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);
const easeOut = (p) => 1 - Math.pow(1 - p, 3);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Rough width of bold text in this font stack. */
const textWidth = (s, size) => [...s].length * size * 0.53;

/** Word-wrap to a pixel width. Honours explicit newlines. */
function wrap(text, size, max) {
  const out = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const word of para.split(" ")) {
      const next = line ? `${line} ${word}` : word;
      if (textWidth(next, size) > max && line) {
        out.push(line);
        line = word;
      } else line = next;
    }
    out.push(line);
  }
  return out;
}

/** One speech card, positioned by the speaker's side. Returns [svg, height]. */
function speechCard(l, y, progress) {
  const size = 46;
  const lines = wrap(l.text, size, 700);
  const labelH = 38;
  const lineH = size * 1.22;
  const padX = 34;
  const padY = 26;
  const w = Math.min(
    880,
    Math.max(...lines.map((s) => textWidth(s, size)), textWidth(l.who, 24)) + padX * 2,
  );
  const h = padY * 2 + labelH + lines.length * lineH - 10;
  const x = l.side === "right" ? W - M - w : M;

  const p = easeOut(progress);
  const dy = (1 - p) * 26;
  const tx = l.side === "right" ? W - M - padX : x + padX;
  const anchor = l.side === "right" ? "end" : "start";

  const svg = `<g opacity="${p}" transform="translate(0 ${dy})">
    <rect x="${x + 4}" y="${y + 8}" width="${w}" height="${h}" rx="30" fill="#000" opacity="0.22" />
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="30" fill="#FFFDF8" opacity="0.97" />
    <text x="${tx}" y="${y + padY + 24}" text-anchor="${anchor}" font-family="${FONT}"
      font-size="24" font-weight="800" letter-spacing="3" fill="${GOLD_DARK}">${l.who}</text>
    ${lines
      .map(
        (s, i) => `<text x="${tx}" y="${y + padY + labelH + size * 0.92 + i * lineH}"
      text-anchor="${anchor}" font-family="${FONT}" font-size="${size}" font-weight="800"
      fill="${INK_DARK}">${esc(s)}</text>`,
      )
      .join("")}
  </g>`;
  return [svg, h];
}

/** A centred, larger card for panels without a speaker. */
function bigCard(l, y, progress) {
  const size = 72;
  const lines = wrap(l.text, size, 820);
  const lineH = size * 1.2;
  const padX = 48;
  const padY = 40;
  const w = Math.max(...lines.map((s) => textWidth(s, size))) + padX * 2;
  const h = padY * 2 + lines.length * lineH - 14;
  const x = (W - w) / 2;
  const p = easeOut(progress);
  const s = 0.92 + 0.08 * p;

  const svg = `<g opacity="${p}" transform="translate(${W / 2} ${y + h / 2}) scale(${s}) translate(${-W / 2} ${-(y + h / 2)})">
    <rect x="${x + 5}" y="${y + 10}" width="${w}" height="${h}" rx="34" fill="#000" opacity="0.25" />
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="34" fill="${BG_OUTER}" opacity="0.92" />
    ${lines
      .map(
        (t, i) => `<text x="${W / 2}" y="${y + padY + size * 0.9 + i * lineH}" text-anchor="middle"
      font-family="${FONT}" font-size="${size}" font-weight="800" fill="${GOLD_LIGHT}">${esc(t)}</text>`,
      )
      .join("")}
  </g>`;
  return [svg, h];
}

const mark = ({ x, y, scale }) => `
  <g transform="translate(${x} ${y}) scale(${scale})">
    <circle cx="16" cy="20" r="13" fill="url(#g)" fill-opacity="0.95" />
    <circle cx="24" cy="20" r="13" fill="url(#g)" fill-opacity="0.65" />
    <path d="M10 24 L17 16 L22 21 L30 11" fill="none" stroke="white" stroke-width="2.4"
          stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="30" cy="11" r="2.4" fill="white" />
  </g>`;

const defs = `<defs>
    <radialGradient id="bg" cx="50%" cy="32%" r="95%">
      <stop offset="0" stop-color="${BG_INNER}" />
      <stop offset="1" stop-color="${BG_OUTER}" />
    </radialGradient>
    <linearGradient id="g" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${GOLD_LIGHT}" />
      <stop offset="1" stop-color="${GOLD_DARK}" />
    </linearGradient>
    <linearGradient id="topShade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0.45" />
      <stop offset="1" stop-color="#000" stop-opacity="0" />
    </linearGradient>
  </defs>`;

/** Overlay for a panel at local time `lt`. */
function panelOverlay(panel, lt) {
  const parts = [];

  // A soft shade at the top keeps white cards and the caption legible
  // whatever the panel's background is.
  parts.push(`<rect width="${W}" height="760" fill="url(#topShade)" />`);

  let y = 170;
  if (panel.caption) {
    const c = easeOut(clamp((lt - 0.15) / 0.35));
    const cw = [...panel.caption].length * (26 * 0.66 + 4) + 56;
    parts.push(`<g opacity="${c}">
      <rect x="${M}" y="${y}" width="${cw}" height="56" rx="28" fill="${GOLD_LIGHT}" />
      <text x="${M + 28}" y="${y + 37}" font-family="${FONT}" font-size="26" font-weight="800"
        letter-spacing="4" fill="${INK_DARK}">${esc(panel.caption)}</text>
    </g>`);
    y += 84;
  }

  for (const l of panel.lines) {
    const prog = clamp((lt - l.at) / 0.32);
    if (prog <= 0) continue;
    const [svg, h] = l.big ? bigCard(l, y + 120, prog) : speechCard(l, y, prog);
    parts.push(svg);
    y += h + 22;
  }

  // Dip to dark at the cuts.
  const inDip = panel.index === 0 ? 0.4 : DIP;
  const fadeIn = 1 - clamp(lt / inDip);
  const fadeOut = clamp((lt - (panel.duration - DIP)) / DIP);
  const dark = Math.max(fadeIn, fadeOut);
  if (dark > 0) parts.push(`<rect width="${W}" height="${H}" fill="#000" opacity="${dark}" />`);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${defs}${parts.join("")}</svg>`;
}

/** The branded end card at local time `lt`. */
function endCard(end, lt) {
  const r = (start) => {
    const p = easeOut(clamp((lt - start) / 0.5));
    return { o: p, dy: (1 - p) * 30 };
  };
  const k = r(0.2);
  const hd = r(0.45);
  const sb = r(0.8);
  const ft = r(1.1);
  const fadeIn = 1 - clamp(lt / 0.3);

  const headSize = end.head.length === 1 ? 150 : 84;
  const headLead = headSize * 1.18;
  let y = 800;

  const head = end.head
    .map((s, i) => `<text x="${W / 2}" y="${y + i * headLead}" text-anchor="middle" font-family="${FONT}"
      font-size="${headSize}" font-weight="800" letter-spacing="${headSize * -0.02}" fill="${INK}">${esc(s)}</text>`)
    .join("");
  y += (end.head.length - 1) * headLead + 110;

  const sub = (end.sub ?? [])
    .map((s, i) => `<text x="${W / 2}" y="${y + i * 78}" text-anchor="middle" font-family="${FONT}"
      font-size="62" font-weight="800" fill="${GOLD_LIGHT}">${esc(s)}</text>`)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${defs}
    <rect width="${W}" height="${H}" fill="url(#bg)" />
    ${mark({ x: W / 2 - (34 * 5) / 2, y: 380, scale: 5 })}
    <g opacity="${k.o}" transform="translate(0 ${k.dy})">
      <text x="${W / 2}" y="660" text-anchor="middle" font-family="${FONT}" font-size="30"
        font-weight="800" letter-spacing="6" fill="${GOLD_LIGHT}">${esc(end.kicker)}</text>
    </g>
    <g opacity="${hd.o}" transform="translate(0 ${hd.dy})">${head}</g>
    <g opacity="${sb.o}" transform="translate(0 ${sb.dy})">${sub}</g>
    <g opacity="${ft.o}" transform="translate(0 ${ft.dy})">
      <text x="${W / 2}" y="1560" text-anchor="middle" font-family="${FONT}" font-size="30"
        font-weight="800" letter-spacing="6" fill="${MUTED}">${esc(end.foot)}</text>
    </g>
    <rect width="${W}" height="${H}" fill="#000" opacity="${fadeIn}" />
  </svg>`;
}

/* ── Frames ───────────────────────────────────────────────────── */

/** Panels are scaled once to 120% of the frame so the zoom has room. */
const BASE_W = Math.round(W * 1.2);
const BASE_H = Math.round(H * 1.2);

async function loadPanels(dir, count) {
  const out = [];
  for (let i = 1; i <= count; i++) {
    out.push(
      await sharp(join(dir, `p${i}.png`))
        .resize(BASE_W, BASE_H, { fit: "cover", position: "centre" })
        .toBuffer(),
    );
  }
  return out;
}

/** Slow Ken Burns: alternate panels zoom in and out. */
async function panelFrame(base, panel, lt) {
  const p = clamp(lt / panel.duration);
  const zoom = panel.index % 2 === 0 ? 1 + 0.18 * p : 1.18 - 0.18 * p; // relative to BASE
  const cw = Math.round(BASE_W / zoom);
  const ch = Math.round(BASE_H / zoom);
  const left = Math.round((BASE_W - cw) / 2);
  const top = Math.round((BASE_H - ch) * 0.42);
  return sharp(base)
    .extract({ left, top, width: cw, height: ch })
    .resize(W, H)
    .toBuffer();
}

/**
 * Find an ffmpeg binary. `@ffmpeg-installer` ships through the npm registry;
 * `ffmpeg-static` downloads from GitHub, which is blocked on some networks.
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

async function main() {
  const name = process.argv[2];
  const reel = REELS[name];
  if (!reel) {
    console.error(`Usage: node brand/build-cartoon-reel.mjs <${Object.keys(REELS).join("|")}>`);
    process.exit(1);
  }

  const dir = join(ROOT, "cartoon", name);
  const tmp = join(ROOT, ".reel-frames", name);
  await rm(tmp, { recursive: true, force: true });
  await mkdir(tmp, { recursive: true });
  await mkdir(OUT, { recursive: true });

  const bases = await loadPanels(dir, reel.panels.length);
  const { panels, endStart, total } = plan(reel);
  const count = Math.round(total * FPS);

  console.log(`Rendering ${name}: ${total.toFixed(1)}s, ${count} frames`);
  for (let f = 0; f < count; f++) {
    const t = f / FPS;
    let frame;
    if (t >= endStart) {
      frame = await sharp(Buffer.from(endCard(reel.end, t - endStart))).png().toBuffer();
    } else {
      const panel = panels.findLast((p) => t >= p.start);
      const lt = t - panel.start;
      const img = await panelFrame(bases[panel.index], panel, lt);
      frame = await sharp(img)
        .composite([{ input: Buffer.from(panelOverlay(panel, lt)) }])
        .png({ compressionLevel: 1 })
        .toBuffer();
    }
    await sharp(frame).toFile(join(tmp, `f-${String(f).padStart(4, "0")}.png`));
  }

  const out = join(OUT, `${reel.out}.mp4`);
  await run(await resolveFfmpeg(), [
    "-y",
    "-framerate", String(FPS),
    "-i", join(tmp, "f-%04d.png"),
    "-c:v", "libx264",
    "-preset", "slow",
    "-crf", "19",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    out,
  ]);
  await rm(tmp, { recursive: true, force: true });
  console.log(`Wrote brand/campaign/reels/${reel.out}.mp4`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
