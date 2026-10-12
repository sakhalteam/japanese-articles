export type Script = "hiragana" | "katakana";
export type Orientation = "portrait" | "landscape";
export type GuideStyle = "dotted" | "dashed";
export type Palette = "grey" | "red" | "blue";
export type GhostMode = "none" | "all" | "fade";
export type Order = "chart" | "shuffle";

export interface SheetSettings {
  script: Script;
  selected: string[];
  orientation: Orientation;
  rows: number; // kana rows per page
  cols: number; // cells per row, including the example cell
  repeat: number; // rows per kana
  guide: boolean;
  guideStyle: GuideStyle;
  palette: Palette;
  ghostMode: GhostMode;
  ghostCount: number; // practice cells that get a ghost (fade mode)
  ghostDarkness: number; // 0–100, darkest ghost
  font: string;
  order: Order;
  seed: number;
  header: boolean;
  title: string;
  romaji: boolean;
  optionsOpen: boolean;
  moreKanaOpen: boolean;
}

export const DEFAULTS: SheetSettings = {
  script: "hiragana",
  selected: ["a", "i", "u", "e", "o"],
  orientation: "portrait",
  rows: 5,
  cols: 5,
  repeat: 1,
  guide: true,
  guideStyle: "dotted",
  palette: "grey",
  ghostMode: "fade",
  ghostCount: 2,
  ghostDarkness: 40,
  font: "klee",
  order: "chart",
  seed: 1,
  header: true,
  title: "",
  romaji: false,
  optionsOpen: false,
  moreKanaOpen: false,
};

export const ORIENTATION_PRESETS: Record<Orientation, { rows: number; cols: number }> = {
  portrait: { rows: 5, cols: 5 },
  landscape: { rows: 4, cols: 8 },
};

export const LIMITS = {
  rows: [1, 12],
  cols: [2, 12],
  repeat: [1, 5],
  ghostDarkness: [10, 80],
} as const;

const STORAGE_KEY = "ja-kana-sheet";

export function loadSettings(): SheetSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const saved = JSON.parse(raw) as Partial<SheetSettings>;
    const merged = { ...DEFAULTS, ...saved };
    if (!Array.isArray(merged.selected)) merged.selected = DEFAULTS.selected;
    if (!FONTS.some(f => f.id === merged.font)) merged.font = DEFAULTS.font;
    return merged;
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(s: SheetSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* private mode etc. — settings just won't stick */
  }
}

// ── Fonts ──────────────────────────────────────────────────────
// `textbook` = strokes drawn the way Japanese schools teach them
// (e.g. き/さ with the lower stroke separated). Others are for fun.
export interface FontDef {
  id: string;
  family: string;
  weight: number;
  label: string;
  textbook: boolean;
  // Ink centre of kana above the alphabetic baseline, as a fraction of
  // font size (measured in-browser). Lets every font sit dead-centre.
  mid: number;
}

export const FONTS: FontDef[] = [
  { id: "klee", family: "Klee One", weight: 600, label: "Klee One", textbook: true, mid: 0.343 },
  { id: "kurenaido", family: "Zen Kurenaido", weight: 400, label: "Zen Kurenaido", textbook: false, mid: 0.371 },
  { id: "zenmaru", family: "Zen Maru Gothic", weight: 500, label: "Zen Maru Gothic", textbook: false, mid: 0.367 },
  { id: "kiwi", family: "Kiwi Maru", weight: 400, label: "Kiwi Maru", textbook: false, mid: 0.372 },
  { id: "yomogi", family: "Yomogi", weight: 400, label: "Yomogi", textbook: false, mid: 0.342 },
  { id: "hachimaru", family: "Hachi Maru Pop", weight: 400, label: "Hachi Maru Pop", textbook: false, mid: 0.282 },
  { id: "notosans", family: "Noto Sans JP", weight: 400, label: "Noto Sans JP", textbook: false, mid: 0.363 },
  { id: "notoserif", family: "Noto Serif JP", weight: 500, label: "Noto Serif JP", textbook: false, mid: 0.359 },
];

export function fontById(id: string): FontDef {
  return FONTS.find(f => f.id === id) ?? FONTS[0];
}

// One stylesheet for all fonts. Google serves CJK fonts in unicode-range
// slices, so only the slices holding kana actually download.
export function ensureFontsLoaded() {
  const id = "kana-google-fonts";
  if (document.getElementById(id)) return;
  const families = FONTS.map(f => `family=${f.family.replace(/ /g, "+")}:wght@${f.weight}`).join("&");
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
  document.head.appendChild(link);
}
