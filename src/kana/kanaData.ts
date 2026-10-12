export interface Kana {
  id: string;
  h: string; // hiragana
  k: string; // katakana
  romaji: string;
}

export type KanaGroup = "basic" | "dakuten" | "yoon" | "small";

export interface KanaRow {
  id: string;
  group: KanaGroup;
  // Always 5 slots, laid out like the real 五十音 chart (null = gap)
  cells: (Kana | null)[];
}

const k = (id: string, h: string, kk: string, romaji = id): Kana => ({ id, h, k: kk, romaji });
const _ = null;

export const KANA_ROWS: KanaRow[] = [
  // ── 五十音 (the core 46) ──
  { id: "a", group: "basic", cells: [k("a", "あ", "ア"), k("i", "い", "イ"), k("u", "う", "ウ"), k("e", "え", "エ"), k("o", "お", "オ")] },
  { id: "k", group: "basic", cells: [k("ka", "か", "カ"), k("ki", "き", "キ"), k("ku", "く", "ク"), k("ke", "け", "ケ"), k("ko", "こ", "コ")] },
  { id: "s", group: "basic", cells: [k("sa", "さ", "サ"), k("shi", "し", "シ"), k("su", "す", "ス"), k("se", "せ", "セ"), k("so", "そ", "ソ")] },
  { id: "t", group: "basic", cells: [k("ta", "た", "タ"), k("chi", "ち", "チ"), k("tsu", "つ", "ツ"), k("te", "て", "テ"), k("to", "と", "ト")] },
  { id: "n", group: "basic", cells: [k("na", "な", "ナ"), k("ni", "に", "ニ"), k("nu", "ぬ", "ヌ"), k("ne", "ね", "ネ"), k("no", "の", "ノ")] },
  { id: "h", group: "basic", cells: [k("ha", "は", "ハ"), k("hi", "ひ", "ヒ"), k("fu", "ふ", "フ"), k("he", "へ", "ヘ"), k("ho", "ほ", "ホ")] },
  { id: "m", group: "basic", cells: [k("ma", "ま", "マ"), k("mi", "み", "ミ"), k("mu", "む", "ム"), k("me", "め", "メ"), k("mo", "も", "モ")] },
  { id: "y", group: "basic", cells: [k("ya", "や", "ヤ"), _, k("yu", "ゆ", "ユ"), _, k("yo", "よ", "ヨ")] },
  { id: "r", group: "basic", cells: [k("ra", "ら", "ラ"), k("ri", "り", "リ"), k("ru", "る", "ル"), k("re", "れ", "レ"), k("ro", "ろ", "ロ")] },
  { id: "w", group: "basic", cells: [k("wa", "わ", "ワ"), _, _, _, k("wo", "を", "ヲ")] },
  { id: "nn", group: "basic", cells: [k("n", "ん", "ン"), _, _, _, _] },

  // ── 濁音・半濁音 ──
  { id: "g", group: "dakuten", cells: [k("ga", "が", "ガ"), k("gi", "ぎ", "ギ"), k("gu", "ぐ", "グ"), k("ge", "げ", "ゲ"), k("go", "ご", "ゴ")] },
  { id: "z", group: "dakuten", cells: [k("za", "ざ", "ザ"), k("ji", "じ", "ジ"), k("zu", "ず", "ズ"), k("ze", "ぜ", "ゼ"), k("zo", "ぞ", "ゾ")] },
  { id: "d", group: "dakuten", cells: [k("da", "だ", "ダ"), k("di", "ぢ", "ヂ", "ji"), k("du", "づ", "ヅ", "zu"), k("de", "で", "デ"), k("do", "ど", "ド")] },
  { id: "b", group: "dakuten", cells: [k("ba", "ば", "バ"), k("bi", "び", "ビ"), k("bu", "ぶ", "ブ"), k("be", "べ", "ベ"), k("bo", "ぼ", "ボ")] },
  { id: "p", group: "dakuten", cells: [k("pa", "ぱ", "パ"), k("pi", "ぴ", "ピ"), k("pu", "ぷ", "プ"), k("pe", "ぺ", "ペ"), k("po", "ぽ", "ポ")] },

  // ── 拗音 (placed in the a/u/o columns, like the real chart) ──
  ...([
    ["ky", "き", "キ"], ["sh", "し", "シ"], ["ch", "ち", "チ"], ["ny", "に", "ニ"], ["hy", "ひ", "ヒ"],
    ["my", "み", "ミ"], ["ry", "り", "リ"], ["gy", "ぎ", "ギ"], ["j", "じ", "ジ"], ["by", "び", "ビ"], ["py", "ぴ", "ピ"],
  ] as const).map(([c, h, kk]): KanaRow => ({
    id: `yoon-${c}`,
    group: "yoon",
    cells: [k(`${c}a`, `${h}ゃ`, `${kk}ャ`), _, k(`${c}u`, `${h}ゅ`, `${kk}ュ`), _, k(`${c}o`, `${h}ょ`, `${kk}ョ`)],
  })),

  // ── 小さい かな ──
  { id: "small", group: "small", cells: [k("xtsu", "っ", "ッ", "small tsu"), k("xya", "ゃ", "ャ", "small ya"), k("xyu", "ゅ", "ュ", "small yu"), k("xyo", "ょ", "ョ", "small yo"), _] },
];

export const ALL_KANA: Kana[] = KANA_ROWS.flatMap(r => r.cells.filter((c): c is Kana => c !== null));

export const GROUP_LABELS: Record<KanaGroup, string> = {
  basic: "五十音",
  dakuten: "濁音 · 半濁音",
  yoon: "拗音",
  small: "小さいかな",
};

export function rowLabel(row: KanaRow, script: "hiragana" | "katakana"): string {
  if (row.group === "small") return "小";
  const first = row.cells.find((c): c is Kana => c !== null)!;
  const ch = script === "hiragana" ? first.h : first.k;
  return row.id === "nn" ? ch : `${ch}行`;
}
