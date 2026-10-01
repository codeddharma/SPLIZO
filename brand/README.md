# Splizo brand kit

Everything here is generated from one script. To change the palette or the
tagline, edit the tokens at the top of `build-brand.mjs` and re-run:

```bash
node brand/build-brand.mjs
```

## Palette — Amber Vault

| Role | Hex | Used for |
| --- | --- | --- |
| Gold (light stop) | `#FCD34D` | Gradient start; primary in dark mode |
| Amber (dark stop) | `#B45309` | Gradient end; primary in light mode |
| Ground inner | `#302109` | Centre of the background gradient |
| Ground outer | `#140D02` | Edge of the background gradient |
| Wordmark on dark | `#F7F3EC` | "Splizo" on brand grounds |
| Wordmark on light | `#1C1917` | "Splizo" on white/light grounds |
| Tagline | `#B5A691` | Supporting line on brand grounds |

The mark's checkmark is always **white**, at `stroke-width` 2.4 in the 40-unit
box. It is never recoloured.

**Tagline:** Every rupee, tracked and understood.

## Files

### `logo/`

| File | Notes |
| --- | --- |
| `splizo-mark.svg` | Mark only, transparent, cropped tight. The master asset — scale this to anything. |
| `splizo-mark-512.png`, `splizo-mark-1024.png` | Transparent raster fallbacks |
| `splizo-lockup-on-dark.svg` / `-2048.png` | Mark + wordmark, light text — for dark backgrounds |
| `splizo-lockup-on-light.svg` / `-2048.png` | Mark + wordmark, dark text — for white/light backgrounds |
| `splizo-mark-on-brand.svg` | Mark on the brand ground, square |

### `icons/`

`icon-16` through `icon-1024` — transparent square PNGs of the mark.

| Size | Where it goes |
| --- | --- |
| 16, 32, 48 | Browser favicon |
| 180 | `apple-touch-icon` (iOS home screen) |
| 192, 512 | PWA manifest icons (Android home screen, install prompt) |
| 1024 | App store listings, source for any resize |

### `social/`

| File | Platform |
| --- | --- |
| `profile-1024.png`, `profile-512.png` | Profile picture — Facebook, Instagram, LinkedIn, X |
| `facebook-cover-1640x624.png` | Facebook Page cover |
| `linkedin-company-cover-2256x382.png` | LinkedIn **company page** banner |
| `linkedin-personal-banner-1584x396.png` | LinkedIn **personal profile** banner |
| `x-header-1500x500.png` | X / Twitter header |
| `instagram-post-1080x1080.png` | Instagram feed post |
| `instagram-story-1080x1920.png` | Instagram story / reel cover |
| `og-image-1200x630.png` | Open Graph preview — link previews on any platform |

Every cover keeps the lockup clear of the bottom-left corner, where all of these
platforms overlay the profile picture.

## Two things to know

**The `.svg` lockups reference a font, not outlines.** They use a
`Segoe UI → Helvetica Neue → Arial` stack, so on a machine without those the
wordmark shifts. For anything going to a printer or an external designer, send
the **PNG** lockup instead, or ask for a version with the text converted to
paths. `splizo-mark.svg` has no text and is safe everywhere.

**There is no `.ico` here.** The app serves `src/app/icon.svg`, which Next.js
turns into the favicon automatically, so a `.ico` is not needed for the site. If
some other tool demands one, build it from `icons/icon-32.png`.
