/**
 * Splizo story-reel assembler.
 *
 * Joins the Veo clips for one part into a finished 1080x1920 reel: a title
 * card, each clip trimmed as needed with burned-in Hinglish subtitles, and a
 * branded end card. Audio is levelled across clips so no one shot is louder
 * than the rest.
 *
 *   node brand/build-part.mjs part1
 *
 * Subtitles are rendered as PNG overlays rather than with ffmpeg's drawtext,
 * so the text shaping is handled by the same renderer as the rest of the brand
 * assets and stays correct.
 */
import sharp from "sharp";
import { execFile } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
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

/* ── The parts ────────────────────────────────────────────────────
 * `trim` cuts a clip short — used where a shot drifts or a prop glitches
 * late on. `subs` are [text, start, end] in seconds, relative to the
 * trimmed clip. Subtitles are romanised Hinglish to match the feed posts
 * and because most of the audience reads it faster than Devanagari.
 * ---------------------------------------------------------------- */
const PARTS = {
  teaser: {
    out: "splizo-story-teaser",
    clips: [
      {
        file: "c1.mp4",
        subs: [
          ["Namaste! Ye hain Priya, meri wife.", 0.6, 3.4],
          ["Aur main Rohan.", 3.7, 5.6],
          ["Hi!", 6.0, 7.6],
        ],
      },
      {
        // Veo stamped a small "Priya" name label low-left for the first second.
        file: "c2.mp4",
        blur: [465, 1650, 195, 85, 0, 1.4],
        subs: [
          ["Bahut intezaar karvaya na?", 0.6, 2.6],
          ["Haan, thoda zyada hi ho gaya.", 2.9, 5.2],
          ["Par achhi cheez mein waqt lagta hai.", 5.5, 7.9],
        ],
      },
      {
        file: "c3.mp4",
        subs: [
          ["Sabr ka fal meetha hota hai.", 0.8, 3.6],
          ["Aur ye fal — 6 November ko.", 4.0, 7.4],
        ],
      },
      {
        file: "c4.mp4",
        subs: [
          ["Tab tak humari journey dekhiye.", 0.6, 3.0],
          ["Chaar parts mein, kal se.", 3.4, 5.8],
          ["Milte hain!", 6.2, 7.8],
        ],
      },
    ],
    end: {
      kicker: "SPLIZO",
      head: ["Chaar parts.", "Kal se."],
      foot: "BETA LIVE · 6 NOVEMBER",
    },
  },

  part1: {
    out: "splizo-story-part-1",
    // A chip over the opening shot rather than a card of its own: a dark slide
    // as frame one is where viewers scroll away.
    chip: { label: "PART 1", title: "Shaadi ke baad", until: 3.2 },
    clips: [
      {
        file: "c1.mp4",
        subs: [
          ["Sab set hai na?", 2.6, 4.6],
          ["Bilkul.", 5.0, 6.6],
        ],
      },
      {
        file: "c2.mp4",
        subs: [
          ["Ghar gaon mein. Hum yahan.", 0.9, 3.3],
          ["Dono sambhalne honge.", 4.4, 6.9],
        ],
      },
      {
        file: "c3.mp4",
        subs: [
          ["Mera, tera, aur joint.", 1.0, 3.4],
          ["Aur chaar card.", 5.1, 7.2],
        ],
      },
      {
        // The phone turns into a TV remote at ~2s, so this one stops early.
        file: "c4.mp4",
        trim: 4.4,
        subs: [["Mummy-papa ko bhej diya.", 0.5, 3.6]],
      },
      {
        file: "c5.mp4",
        subs: [["Ghar ka saaman ho gaya.", 1.8, 4.5]],
      },
      {
        file: "c6.mp4",
        subs: [
          ["Tumne paise bheje?", 0.9, 2.6],
          ["Haan.", 3.0, 4.2],
          ["Likha kisne?", 5.4, 7.6],
        ],
      },
    ],
    end: {
      kicker: "PART 1",
      head: ["Hisaab kaun", "rakhega?"],
      foot: "PART 2 KAL · @SPLIZO",
    },
  },

  part2: {
    out: "splizo-story-part-2",
    chip: { label: "PART 2", title: "Notebook se phone tak", until: 3.2 },
    // Part 2 opens on a decision rather than a scene, so it carries a one-line
    // recap for anyone who missed part 1.
    recap: { text: "Pichle part mein: kisi ne kuch likha hi nahi.", until: 3.0 },
    clips: [
      {
        // Veo adds gibberish caption text from 7.8s. She speaks late here, so
        // the trim sits as close to that as it can.
        file: "c1.mp4",
        trim: 7.7,
        subs: [["Ab se sab likhenge.", 5.7, 7.7]],
      },
      {
        // Silent montage. Centre-channel removal drops Veo's improvised speech
        // and leaves the music bed.
        file: "c2.mp4",
        removeVoice: true,
        subs: [],
      },
      {
        file: "c3.mp4",
        subs: [
          ["Grocery... aur Swiggy bhi.", 1.1, 2.7],
          ["Kitne ka?", 2.9, 4.3],
          ["Yaad nahi.", 4.5, 6.0],
        ],
      },
      {
        file: "c4.mp4",
        subs: [
          ["Likh to diya.", 0.1, 1.4],
          ["Par pata kaise chale?", 1.7, 3.2],
          ["Kis pe kitna gaya...", 3.5, 5.4],
        ],
      },
      {
        file: "c5.mp4",
        subs: [["Cash wale toh bhool hi gaye.", 2.5, 4.6]],
      },
      {
        file: "c6.mp4",
        subs: [
          ["Ab sab phone mein.", 0.1, 2.2],
          ["Dekhte hain.", 4.6, 6.4],
        ],
      },
      {
        file: "c7.mp4",
        subs: [
          ["Phone mein bhi kuch pata nahi chalta.", 0.1, 2.4],
          ["Kis cheez pe zyada gaya?", 2.9, 4.4],
          ["Pata nahi.", 4.5, 6.2],
        ],
      },
    ],
    end: {
      kicker: "PART 2",
      head: ["Notebook fail.", "Phone fail."],
      foot: "PART 3 KAL · @SPLIZO",
    },
  },

  part3: {
    out: "splizo-story-part-3",
    chip: { label: "PART 3", title: "Rohan ka idea", until: 3.2 },
    recap: { text: "Pichle part mein: notebook bhi fail, phone bhi fail.", until: 3.0 },
    clips: [
      {
        // An aunty rather than a second young man: Veo reliably tells genders
        // apart, and reliably cannot tell two similar men apart.
        file: "c1.mp4",
        subs: [
          ["Beta, thode paise chahiye the. Jaldi wapas de dungi.", 1.1, 3.4],
          ["Haan aunty, ye lijiye.", 3.5, 5.6],
        ],
      },
      {
        // Silent. The message she is reading is a caption, because Veo cannot
        // render a readable chat without inventing script.
        file: "c2.mp4",
        removeVoice: true,
        subs: [["“Bhai 10,000 chahiye the, bas do din”", 0.8, 3.8]],
      },
      {
        file: "c3.mp4",
        subs: [
          ["Kisko kitna diya tha?", 0.1, 1.8],
          ["Yaad nahi. Kab diya wo bhi nahi.", 2.0, 4.8],
          ["Wapas kitna aaya?", 5.3, 7.0],
        ],
      },
      {
        file: "c4.mp4",
        subs: [
          ["Ek idea hai — ek app banate hain.", 0.1, 2.7],
          ["Har transaction, udhaar, kis pe kitna gaya — sab ek jagah.", 2.9, 7.6],
        ],
      },
      {
        file: "c5.mp4",
        subs: [
          ["Thik hai. Main banati hoon.", 1.1, 3.6],
          ["Sach mein?", 3.7, 5.4],
          ["Haan.", 5.5, 7.4],
        ],
      },
      {
        file: "c6.mp4",
        subs: [["Job chhod di. Ab yahi karna hai.", 3.1, 6.2]],
      },
    ],
    end: {
      kicker: "PART 3",
      head: ["Ek hi jagah", "sab kuch."],
      foot: "PART 4 KAL · @SPLIZO",
    },
  },

  part4: {
    out: "splizo-story-part-4",
    chip: { label: "PART 4", title: "Ban gaya", until: 3.2 },
    recap: { text: "Pichle part mein: Priya ne job chhod ke app banana shuru kiya.", until: 3.0 },
    clips: [
      {
        // No entrance: walking cost two seconds and made Veo swap the speakers.
        file: "c1.mp4",
        subs: [
          ["3 mahine baad", 0.2, 1.8],
          ["Ban gaya.", 1.4, 3.0],
          ["Sach mein? Dikhao!", 3.2, 5.2],
          ["Abhi nahi.", 5.3, 7.2],
        ],
      },
      {
        file: "c2.mp4",
        subs: [
          ["Dono ghar alag.", 0.1, 2.0],
          ["Har transaction apne aap categorise.", 2.2, 4.6],
          ["Aur jo udhaar diya, wo bhi.", 4.8, 7.4],
        ],
      },
      {
        // 4.3 was cut: the laptop tug-of-war broke lip sync twice, and 4.1
        // already carries the same ask-and-refuse beat.
        file: "c4.mp4",
        subs: [
          ["Kal. Dhanteras ke shubh muhurat pe.", 2.3, 4.2],
          ["Thik hai... kal.", 4.3, 6.2],
        ],
      },
    ],
    end: {
      kicker: "KAL · DHANTERAS",
      head: ["Splizo."],
      sub: ["6 November,", "shubh muhurat pe."],
      foot: "BETA LIVE KAL · @SPLIZO",
    },
  },
};

/* ── Helpers ──────────────────────────────────────────────────── */
const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Rough width of bold text in this font stack. */
const textWidth = (s, size) => [...s].length * size * 0.52;

function wrap(text, size, max) {
  const out = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (textWidth(next, size) > max && line) {
      out.push(line);
      line = word;
    } else line = next;
  }
  out.push(line);
  return out;
}

const mark = ({ x, y, scale }) => `
  <g transform="translate(${x} ${y}) scale(${scale})">
    <circle cx="16" cy="20" r="13" fill="url(#g)" fill-opacity="0.95" />
    <circle cx="24" cy="20" r="13" fill="url(#g)" fill-opacity="0.65" />
    <path d="M10 24 L17 16 L22 21 L30 11" fill="none" stroke="white" stroke-width="2.4"
          stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="30" cy="11" r="2.4" fill="white" />
  </g>`;

const DEFS = `<defs>
    <radialGradient id="bg" cx="50%" cy="34%" r="95%">
      <stop offset="0" stop-color="${BG_INNER}" />
      <stop offset="1" stop-color="${BG_OUTER}" />
    </radialGradient>
    <linearGradient id="g" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${GOLD_LIGHT}" />
      <stop offset="1" stop-color="${GOLD_DARK}" />
    </linearGradient>
  </defs>`;

/**
 * One subtitle, as a transparent PNG the size of the frame. Sits in the lower
 * third, clear of Instagram's own caption and button overlays.
 */
function subtitleSvg(text, speaker) {
  const size = 50;
  const lines = wrap(text, size, 820);
  const lineH = size * 1.26;
  const padX = 40;
  const padY = 26;
  // A speaker label makes attribution explicit, which matters where Veo cannot
  // reliably say a line in the right character's voice.
  const labelH = speaker ? 36 : 0;
  const boxW =
    Math.max(...lines.map((l) => textWidth(l, size)), speaker ? textWidth(speaker, 26) : 0) +
    padX * 2;
  const boxH = lines.length * lineH + labelH + padY * 2 - 10;
  const x = (W - boxW) / 2;
  const y = 1420 - boxH / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="26"
      fill="${BG_OUTER}" fill-opacity="0.82" />
    ${
      speaker
        ? `<text x="${W / 2}" y="${y + padY + 24}" text-anchor="middle" font-family="${FONT}"
      font-size="26" font-weight="800" letter-spacing="4" fill="${GOLD_LIGHT}">${esc(speaker)}</text>`
        : ""
    }
    ${lines
      .map(
        (l, i) => `<text x="${W / 2}" y="${y + padY + labelH + size * 0.92 + i * lineH}"
      text-anchor="middle" font-family="${FONT}" font-size="${size}"
      font-weight="800" fill="${INK}">${esc(l)}</text>`,
      )
      .join("")}
  </svg>`;
}

/** The part label, shown over the opening clip for a few seconds. */
function chipSvg({ label, title }) {
  const labelSize = 25;
  const titleSize = 52;
  const w = Math.max(
    [...label].length * (labelSize * 0.62 + 5),
    textWidth(title, titleSize),
  ) + 64;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect x="56" y="150" width="${w}" height="152" rx="28"
      fill="${BG_OUTER}" fill-opacity="0.72" />
    <text x="88" y="210" font-family="${FONT}" font-size="${labelSize}"
      font-weight="800" letter-spacing="5" fill="${GOLD_LIGHT}">${esc(label)}</text>
    <text x="88" y="276" font-family="${FONT}" font-size="${titleSize}"
      font-weight="800" letter-spacing="-1" fill="${INK}">${esc(title)}</text>
  </svg>`;
}

/** A one-line "previously" strip, for parts that follow another. */
function recapSvg(text) {
  const size = 34;
  const lines = wrap(text, size, 780);
  const lineH = size * 1.3;
  const h = lines.length * lineH + 36;
  const y = 330;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect x="56" y="${y}" width="${W - 112}" height="${h}" rx="20"
      fill="${BG_OUTER}" fill-opacity="0.62" />
    ${lines
      .map(
        (l, i) => `<text x="88" y="${y + 24 + size * 0.9 + i * lineH}"
      font-family="${FONT}" font-size="${size}" font-weight="700"
      fill="${MUTED}">${esc(l)}</text>`,
      )
      .join("")}
  </svg>`;
}

/** The end card. Drawn over a blurred still from the video so it feels continuous. */
function cardSvg({ kicker, head, foot }) {
  const headSize = head.length === 1 ? 104 : 92;
  const lead = headSize * 1.2;
  const top = H / 2 - ((head.length - 1) * lead) / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${DEFS}
    ${mark({ x: W / 2 - (34 * 4.4) / 2, y: 520, scale: 4.4 })}
    <text x="${W / 2}" y="${top - 150}" text-anchor="middle" font-family="${FONT}"
      font-size="30" font-weight="800" letter-spacing="7" fill="${GOLD_LIGHT}">${esc(kicker)}</text>
    ${head
      .map(
        (l, i) => `<text x="${W / 2}" y="${top + i * lead}" text-anchor="middle"
      font-family="${FONT}" font-size="${headSize}" font-weight="800"
      letter-spacing="-2" fill="${INK}">${esc(l)}</text>`,
      )
      .join("")}
    <text x="${W / 2}" y="1560" text-anchor="middle" font-family="${FONT}"
      font-size="29" font-weight="800" letter-spacing="6" fill="${MUTED}">${esc(foot)}</text>
  </svg>`;
}

async function resolveFfmpeg() {
  for (const pkg of ["@ffmpeg-installer/ffmpeg", "ffmpeg-static"]) {
    try {
      const m = await import(pkg);
      const p = m.default?.path ?? m.default;
      if (typeof p === "string") return p;
    } catch {
      /* not installed — try the next */
    }
  }
  return "ffmpeg";
}

/* ── Build ────────────────────────────────────────────────────── */
const CARD_SECONDS = 2.6;

async function main() {
  const name = process.argv[2];
  const part = PARTS[name];
  if (!part) {
    console.error(`Usage: node brand/build-part.mjs <${Object.keys(PARTS).join("|")}>`);
    process.exit(1);
  }

  const ffmpeg = await resolveFfmpeg();
  const src = join(ROOT, "cartoon", name);
  const tmp = join(ROOT, ".part-build", name);
  await rm(tmp, { recursive: true, force: true });
  await mkdir(tmp, { recursive: true });
  await mkdir(OUT, { recursive: true });

  const segments = [];

  // The end card is drawn over the final frame of the last clip, blurred and
  // dimmed, so it grows out of the video instead of cutting to a flat slide.
  const lastClip = part.clips[part.clips.length - 1];
  const lastFrame = join(tmp, "last.png");
  await run(ffmpeg, [
    "-y", "-loglevel", "error",
    "-sseof", "-0.4", "-i", join(src, lastClip.file),
    "-frames:v", "1", lastFrame,
  ]);

  const endPng = join(tmp, "end.png");
  await sharp(lastFrame)
    .resize(W, H, { fit: "cover" })
    .blur(42)
    .modulate({ brightness: 0.42, saturation: 0.75 })
    .composite([{ input: Buffer.from(cardSvg(part.end)) }])
    .png()
    .toFile(endPng);

  await run(ffmpeg, [
    "-y", "-loglevel", "error",
    "-loop", "1", "-t", String(CARD_SECONDS), "-i", endPng,
    "-f", "lavfi", "-t", String(CARD_SECONDS), "-i", "anullsrc=r=48000:cl=stereo",
    "-c:v", "libx264", "-r", String(FPS), "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-shortest", join(tmp, "end.mp4"),
  ]);

  // Each clip: trim, burn its subtitles, normalise loudness.
  for (const [i, clip] of part.clips.entries()) {
    const overlays = [];
    const filters = [];
    let chain = "[0:v]";

    // Veo sometimes burns a small caption or name label into a corner. Blurring
    // that patch for the seconds it appears is free; regenerating the clip is not.
    if (clip.blur) {
      const [bx, by, bw, bh, bs, be] = clip.blur;
      // delogo interpolates from the surrounding pixels, so it leaves no hard
      // rectangle the way a cropped blur overlay does.
      filters.push(
        `[0:v]delogo=x=${bx}:y=${by}:w=${bw}:h=${bh}:enable='between(t,${bs},${be})'[vb]`,
      );
      chain = "[vb]";
    }

    const timed = clip.subs.map(([text, start, end, who]) => [subtitleSvg(text, who), start, end]);
    if (i === 0 && part.recap) {
      timed.unshift([recapSvg(part.recap.text), 0.5, part.recap.until]);
    }
    if (i === 0 && part.chip) {
      timed.unshift([chipSvg(part.chip), 0.25, part.chip.until]);
    }

    for (const [j, [svg, start, end]] of timed.entries()) {
      const png = join(tmp, `ov-${i}-${j}.png`);
      await sharp(Buffer.from(svg)).png().toFile(png);
      overlays.push("-i", png);
      const next = `[v${j}]`;
      filters.push(
        `${chain}[${j + 1}:v]overlay=0:0:enable='between(t,${start},${end})'${next}`,
      );
      chain = next;
    }

    const out = join(tmp, `seg-${String(i).padStart(2, "0")}.mp4`);
    const args = ["-y", "-loglevel", "error"];
    if (clip.trim) args.push("-t", String(clip.trim));
    args.push("-i", join(src, clip.file), ...overlays);
    // Video must be mapped explicitly either way: once any -map is present,
    // ffmpeg stops including unmapped streams, and a clip with no subtitles
    // would otherwise come out audio-only.
    if (filters.length) {
      args.push("-filter_complex", filters.join(";"), "-map", chain);
    } else {
      args.push("-map", "0:v");
    }
    if (clip.mute) {
      args.push("-f", "lavfi", "-t", "8", "-i", "anullsrc=r=48000:cl=stereo");
      args.push("-map", `${overlays.length / 2 + 1}:a`);
    } else {
      // Centre-channel subtraction pulls out dialogue, which Veo mixes centred,
      // and leaves the wider music and ambience. Duck windows are a fallback
      // for speech the subtraction misses.
      const af = [];
      if (clip.removeVoice) af.push("pan=stereo|c0=c0-0.9*c1|c1=c1-0.9*c0");
      for (const [a, b] of clip.duck ?? []) {
        af.push(`volume=enable='between(t,${a},${b})':volume=0.12`);
      }
      af.push("loudnorm=I=-16:LRA=11:TP=-1.5");
      args.push("-map", "0:a?", "-af", af.join(","));
    }
    args.push(
      "-c:v", "libx264", "-preset", "medium", "-crf", "20",
      "-r", String(FPS), "-vsync", "cfr", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-ar", "48000", "-ac", "2",
      out,
    );
    await run(ffmpeg, args);
    segments.push(out);
    console.log(`  ${clip.file}${clip.trim ? ` (trimmed to ${clip.trim}s)` : ""}`);
  }

  // Concat: title, clips, end.
  const list = [...segments, join(tmp, "end.mp4")];
  const listFile = join(tmp, "list.txt");
  await writeFile(
    listFile,
    list.map((f) => `file '${f.replace(/\\/g, "/")}'`).join("\n"),
    "utf8",
  );

  const final = join(OUT, `${part.out}.mp4`);
  await run(ffmpeg, [
    "-y", "-loglevel", "error",
    "-fflags", "+genpts",
    "-f", "concat", "-safe", "0", "-i", listFile,
    "-c:v", "libx264", "-preset", "slow", "-crf", "19",
    "-r", String(FPS), "-vsync", "cfr",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    "-c:a", "aac", "-b:a", "192k",
    final,
  ]);

  await rm(tmp, { recursive: true, force: true });
  console.log(`Wrote brand/campaign/reels/${part.out}.mp4`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
