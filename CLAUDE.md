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

## Island zone
`zone_reading_room` → Pattern B (Bell Tower mesh) → `/japanese-articles/`
