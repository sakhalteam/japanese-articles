# japanese-articles — Japanese reading practice with curated essays

> Parent context: `../CLAUDE.md` has universal preferences and conventions. Keep it updated with anything universal you learn here.

## What this is
A blog/article reader for curated Japanese-language essays. Displays a list of posts with metadata (date, tags, subtitle). Click to read the full article rendered from Markdown with GFM support (tables, strikethrough).

## Stack
- Vite 8 + React 19 + TypeScript 6 + Tailwind v4 (via `@tailwindcss/vite` plugin, NOT PostCSS)
- react-markdown + remark-gfm + rehype-raw for Markdown rendering
- `base: '/japanese-articles/'` in vite.config.ts
- Deployed to sakhalteam.github.io/japanese-articles/

## Notable patterns
- Static post metadata in TypeScript, dynamic markdown loading via `import.meta.glob`
- Hash-based routing for shareable article links
- **Light/dark theme toggle** — pill button (top-right), sun/moon icons, persists in localStorage (`ja-theme`). Light theme uses warm paper tones. Inline script in index.html prevents flash-of-wrong-theme.
- **Tap-to-reveal furigana** — on touch devices (`pointer: coarse`), `<rt>` hidden by default. Tap a `<ruby>` to show tooltip above kanji. Only one revealed at a time. Scroll dismisses all. Desktop uses native `<ruby>` rendering.
- HomeBtn links back to sakhalteam.github.io
- **Kana practice sheet generator** (`#kana`, reached via the small あ pill left of the theme toggle) — code in `src/kana/`. Pages are SVG in PostScript points (612×792); printing uses the browser's print dialog ("Save as PDF"), with sheets portaled into `<body>` as `.print-root` and a dynamic `@page { size: letter <orientation>; margin: 0 }`. `computeLayout` picks how many side-by-side row blocks maximise cell size. Fonts are Google Fonts; each `FontDef.mid` is the measured ink-centre offset so glyphs sit dead-centre on the alphabetic baseline — **re-measure (canvas `measureText` actualBoundingBox) if you add a font**. Klee One is the default because it uses textbook (教科書体) stroke shapes. Settings persist in localStorage (`ja-kana-sheet`). **Presets** (named snapshots of every sheet setting incl. kana picks, minus UI-open state) live in `ja-kana-presets` — per browser; to move one between devices use 🔗 Copy link, which encodes the preset as base64url JSON in `#kana?p=…` (imported on open; a same-name preset with different data is kept and the import becomes "Name (shared)"). Yōon (きゃ) share one cell at reduced size.

## Pending
- ⭐ Stroke-order diagrams in the example square (KanjiVG data, CC BY-SA) — parked, see memory `ideas_backlog.md`

## Island zone
`zone_reading_room` → Pattern B (Bell Tower mesh) → `/japanese-articles/`


## How to end your messages — the "For Nic" block (org-wide rule)

Nic has severe ADHD and loses mid-run asides ("by the way...", "one thing to check
before you...") and anything buried in closing prose. **This is not a request to be
less detailed** — keep the full explanation, reasoning and tradeoffs. Just always end
the turn with a landing pad, as the LAST thing in the message:

```
---
**For Nic:**
1. <verb-first action> — <why, one short clause>
2. ❓ <decision only Nic can make> — <option A vs option B>
3. ⏸️ <parked / needs its own session>
```

- Every "by the way" you had this turn lands here, or assume he never read it.
- Numbered not bulleted; verb first; max 5, most important first.
- No recap of what you already did — that's the body's job. This is Nic's list.
- **Don't force it.** Only what Nic actually needs to notice or act on. It's a TL;DR + call to action, not a test of how many todos you can come up with — one real item (or "Nothing — all clear") beats five padded ones.
- Nothing for him? Still write it: `**For Nic:** Nothing — all clear.`

Full spec lives in the universal `~/.claude/CLAUDE.md` (and `Code/CLAUDE.md`).
