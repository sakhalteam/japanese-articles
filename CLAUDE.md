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
