/**
 * Splizo pre-launch campaign asset generator.
 *
 * Renders the teaser grid — one 1080x1080 feed post and one 1080x1920 story
 * per hook — using the same palette and mark as `build-brand.mjs`.
 *
 * Edit CARDS below to change the copy, then:
 *   node brand/build-campaign.mjs
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, "campaign");

/* ── Brand tokens — kept in sync with build-brand.mjs ──────────── */
const GOLD_LIGHT = "#FCD34D";
const GOLD_DARK = "#B45309";
const BG_INNER = "#302109";
const BG_OUTER = "#140D02";
const INK = "#F7F3EC";
const MUTED = "#B5A691";
const FONT = "Segoe UI, Helvetica Neue, Arial, sans-serif";

/* ── The copy ─────────────────────────────────────────────────────
 * Hinglish throughout, matching the reels — the teaser campaign is one
 * voice. The product and landing page stay English.
 *
 * `head` is the setup, in white. `punch` is the turn, in gold.
 * Lines are hand-broken so the ragged edge is deliberate.
 * Post them in array order.
 * ---------------------------------------------------------------- */
const CARDS = [
  {
    slug: "01-app-sprawl",
    kicker: "SAWAAL EK",
    head: ["6 banking apps.", "4 cards.", "2 UPI IDs."],
    punch: ["Total kitna bacha?"],
  },
  {
    slug: "02-two-homes",
    kicker: "SAWAAL DO",
    head: ["Ek ghar ka rent.", "Doosre ki EMI.", "Same mahina."],
    punch: ["Ab poocho grocery", "pe kitna gaya."],
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
  // The questions stop at four. What follows is the launch sequence:
  // the morning of the 15th, the 9pm reveal, then the beta date.
  {
    slug: "05-aaj-raat",
    kicker: "15 SEPTEMBER 2026",
    head: ["Chaar sawaal.", "Ek jawaab."],
    punch: ["Aaj raat 9 baje."],
    footer: "@SPLIZO",
  },
  {
    slug: "06-live",
    // Only the coming-soon page goes live on the 15th, not the app, so this
    // answers the four questions rather than claiming a launch.
    kicker: "YE RAHA JAWAAB",
    head: ["Splizo."],
    punch: ["Poore ghar ka hisaab,", "ek hi jagah."],
    headScale: 1.6,
    footer: "WAITLIST OPEN · LINK IN BIO",
  },
  {
    slug: "07-beta-date",
    kicker: "BETA 1",
    head: ["20 September 2026"],
    punch: ["Email chhodo,", "pehle aap andar."],
    headScale: 1.15,
    footer: "LINK IN BIO · @SPLIZO",
  },
  // Engagement posts: a question anyone can answer in one word, so the
  // comment costs nothing and the reach follows.
  {
    slug: "08-kaun-rakhta-hai",
    kicker: "AAPKE GHAR MEIN",
    head: ["Hisaab kaun", "rakhta hai?"],
    punch: ["Aap? Partner?", "Ya koi nahi?"],
    headScale: 1.3,
    footer: "COMMENT KARO · @SPLIZO",
  },
];

/* ── Drawing helpers ──────────────────────────────────────────── */
const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** The mark, drawn into a <g> at the given scale/offset. */
const mark = (gradId, { x = 0, y = 0, scale = 1, opacity = 1 } = {}) => `
  <g transform="translate(${x} ${y}) scale(${scale})" opacity="${opacity}">
    <circle cx="16" cy="20" r="13" fill="url(#${gradId})" fill-opacity="0.95" />
    <circle cx="24" cy="20" r="13" fill="url(#${gradId})" fill-opacity="0.65" />
    <path d="M10 24 L17 16 L22 21 L30 11" fill="none" stroke="white" stroke-width="2.4"
          stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="30" cy="11" r="2.4" fill="white" />
  </g>`;

/** Soft amber glow blobs that give the flat ground some depth. */
const blob = (x, y, r) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#glow)" />`;

const defs = () => `
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
  </defs>`;

/**
 * One card. `w`/`h` set the canvas; everything else scales off `s`, the
 * headline size, so the square and story versions stay visually identical.
 */
function card(c, { w, h, pad, top, s, kickSize, lead }) {
  const gap = s * lead;
  let y = top;

  const kicker = `<text x="${pad}" y="${y}" font-family="${FONT}" font-size="${kickSize}"
      font-weight="700" letter-spacing="${kickSize * 0.22}" fill="${GOLD_LIGHT}"
      opacity="0.85">${esc(c.kicker)}</text>`;

  y += kickSize * 2.4;

  const rule = `<rect x="${pad}" y="${y - kickSize * 1.25}" width="${s * 1.1}" height="3"
      rx="1.5" fill="${GOLD_DARK}" opacity="0.9" />`;

  const headSize = s * (c.headScale ?? 1);
  const headGap = c.headScale ? headSize * 1.15 : gap;
  y += headSize * 0.78;

  const head = c.head
    .map((line, i) => {
      const ly = y + i * headGap;
      return `<text x="${pad}" y="${ly}" font-family="${FONT}" font-size="${headSize}"
        font-weight="800" letter-spacing="${headSize * -0.022}"
        fill="${INK}">${esc(line)}</text>`;
    })
    .join("");

  y += (c.head.length - 1) * headGap + gap * 1.5;

  const punch = c.punch
    .map((line, i) => {
      const ly = y + i * gap;
      return `<text x="${pad}" y="${ly}" font-family="${FONT}" font-size="${s}"
        font-weight="800" letter-spacing="${s * -0.022}"
        fill="${GOLD_LIGHT}">${esc(line)}</text>`;
    })
    .join("");

  // A card seen alone in a feed has no other context, so each one carries a
  // footer: the date and handle by default, or whatever the card needs.
  const footerText = c.footer ?? "15 SEPTEMBER 2026 · @SPLIZO";
  const footer = `<text x="${pad}" y="${h - pad - kickSize * 0.2}" font-family="${FONT}"
        font-size="${kickSize * 0.92}" font-weight="700"
        letter-spacing="${kickSize * 0.2}" fill="${MUTED}"
        opacity="0.75">${esc(footerText)}</text>`;

  // Mark sits bottom-right, faint — reads as texture, not a logo reveal.
  const mScale = s / 9;
  const mw = 34 * mScale;
  const markNode = mark("g", {
    x: w - pad - mw - 3 * mScale,
    y: h - pad - 33 * mScale,
    scale: mScale,
    opacity: 0.32,
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${defs()}
  <rect width="${w}" height="${h}" fill="url(#bg)" />
  ${blob(w * 0.88, h * 0.1, w * 0.42)}
  ${blob(w * 0.06, h * 0.92, w * 0.38)}
  ${kicker}${rule}${head}${punch}${footer}${markNode}
</svg>`;
}

/* ── Run ──────────────────────────────────────────────────────── */

/**
 * Windows file locks (thumbnail indexer, antivirus, an open preview) make
 * rewriting a PNG fail intermittently. Retry rather than lose the whole run.
 */
async function writePng(svg, file) {
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  for (let attempt = 1; ; attempt++) {
    try {
      return await writeFile(file, buf);
    } catch (e) {
      if (attempt >= 6) throw e;
      await new Promise((r) => setTimeout(r, attempt * 400));
    }
  }
}
const POST = { w: 1080, h: 1080, pad: 96, top: 250, s: 74, kickSize: 25, lead: 1.26 };
const STORY = { w: 1080, h: 1920, pad: 104, top: 560, s: 80, kickSize: 27, lead: 1.28 };

async function run() {
  await mkdir(join(OUT, "posts"), { recursive: true });
  await mkdir(join(OUT, "stories"), { recursive: true });

  for (const c of CARDS) {
    for (const [dir, spec] of [["posts", POST], ["stories", STORY]]) {
      const file = join(OUT, dir, `${c.slug}-${spec.w}x${spec.h}.png`);
      await writePng(card(c, spec), file);
    }
  }

  console.log(`Wrote ${CARDS.length * 2} PNGs to brand/campaign/`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
