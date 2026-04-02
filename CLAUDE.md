# japanese-articles — Japanese reading practice with curated essays

> Parent context: `../CLAUDE.md` has universal preferences and conventions. Keep it updated with anything universal you learn here.

## What this is
A blog/article reader for curated Japanese-language essays. Displays a list of posts with metadata (date, tags, subtitle). Click to read the full article rendered from Markdown with GFM support (tables, strikethrough).

## Stack
- Vite + React 19 + TypeScript + Tailwind v4 (via `@tailwindcss/vite` plugin, NOT PostCSS)
- react-markdown + remark-gfm + rehype-raw for Markdown rendering
- `base: '/japanese-articles/'` in vite.config.ts
- Deployed to sakhalteam.github.io/japanese-articles/

## Notable patterns
- Static post metadata in TypeScript, dynamic markdown loading
- Simple two-view layout (index + article detail)
- HomeBtn links back to sakhalteam.github.io
