/**
 * Find where people actually speak in a Veo clip.
 *
 * Subtitle timings guessed by eye drift badly, and silence detection is fooled
 * by the music beds Veo adds. This filters to the voice band, measures RMS in
 * 0.2s windows and reports the loud stretches, which line up with dialogue.
 *
 *   node brand/speech-times.mjs part2
 *   node brand/speech-times.mjs part3 c1
 */
import { execFile } from "node:child_process";
import { readdir } from "node:fs/promises";
import { promisify } from "node:util";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const ROOT = dirname(fileURLToPath(import.meta.url));

const WINDOW = 0.2; // seconds per RMS sample
const SPEECH_DB = -28; // louder than this reads as voice rather than bed
const MIN_BURST = 0.3; // ignore single-window blips
const JOIN_GAP = 0.45; // bridge pauses inside one sentence

async function resolveFfmpeg() {
  for (const pkg of ["@ffmpeg-installer/ffmpeg", "ffmpeg-static"]) {
    try {
      const m = await import(pkg);
      const p = m.default?.path ?? m.default;
      if (typeof p === "string") return p;
    } catch {
      /* try the next */
    }
  }
  return "ffmpeg";
}

async function bursts(ffmpeg, file) {
  const samples = Math.round(48000 * WINDOW);
  const { stdout } = await run(ffmpeg, [
    "-v", "error", "-i", file,
    "-af",
    `highpass=f=280,lowpass=f=3000,asetnsamples=${samples},astats=metadata=1:reset=1,` +
      "ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-",
    "-f", "null", "-",
  ], { maxBuffer: 32 * 1024 * 1024 }).catch((e) => ({ stdout: e.stdout ?? "" }));

  const levels = [...(stdout || "").matchAll(/RMS_level=(-?[\d.]+|-inf)/g)].map((m) =>
    m[1] === "-inf" ? -99 : Number(m[1]),
  );

  const out = [];
  let open = null;
  levels.forEach((db, i) => {
    const t = i * WINDOW;
    if (db > SPEECH_DB) {
      if (open === null) open = t;
    } else if (open !== null) {
      out.push([open, t]);
      open = null;
    }
  });
  if (open !== null) out.push([open, levels.length * WINDOW]);

  const merged = [];
  for (const [a, b] of out) {
    if (merged.length && a - merged[merged.length - 1][1] <= JOIN_GAP) {
      merged[merged.length - 1][1] = b;
    } else merged.push([a, b]);
  }
  return merged.filter(([a, b]) => b - a >= MIN_BURST);
}

async function main() {
  const part = process.argv[2];
  const only = process.argv[3];
  if (!part) {
    console.error("Usage: node brand/speech-times.mjs <part> [clip]");
    process.exit(1);
  }

  const dir = join(ROOT, "cartoon", part);
  const ffmpeg = await resolveFfmpeg();
  const files = (await readdir(dir))
    .filter((f) => /^c\d+\.mp4$/.test(f) && (!only || f === `${only}.mp4`))
    .sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));

  for (const f of files) {
    const segs = await bursts(ffmpeg, join(dir, f));
    const pretty = segs.map(([a, b]) => `${a.toFixed(1)}-${b.toFixed(1)}`).join("  ");
    console.log(`${f.padEnd(8)} ${segs.length} burst(s)   ${pretty}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
