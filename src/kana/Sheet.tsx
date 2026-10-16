import type { Kana } from "./kanaData";
import { fontById, type Palette, type SheetSettings } from "./settings";
import { STROKES, type StrokeData } from "./strokes";

// All units are PostScript points (72 per inch). Letter = 612 × 792.
const PT = 72;
const MARGIN = 0.5 * PT;
const HEADER_H = 0.7 * PT;
const MAX_CELL = 2.5 * PT;
const ROW_GAP = 0.18; // × cell size
const BLOCK_GAP = 0.5; // × cell size
const STEP_LEAD = 0.38; // × cell: room above each row for the stroke-steps strip
const KVG = 109; // KanjiVG viewBox size
const NUM_RED = "#d0453a";

const PALETTES: Record<Palette, { border: string; guide: string; tint: string }> = {
  grey: { border: "#8a8a8a", guide: "#b8b8b8", tint: "#f4f4f4" },
  red: { border: "#d98080", guide: "#eeb0b0", tint: "#fdf3f3" },
  blue: { border: "#7d9fcf", guide: "#b3c8e6", tint: "#f2f6fc" },
};

export interface SheetLayout {
  pageW: number;
  pageH: number;
  cell: number;
  blocks: number; // side-by-side columns of rows
  rowsPerBlock: number;
  lead: number; // × cell, strip space above each row
  x0: number;
  y0: number;
}

// Picks how many side-by-side blocks to split the rows into so the cells
// come out as big as possible — e.g. 10 short rows in portrait become 2×5.
export function computeLayout(s: SheetSettings): SheetLayout {
  const portrait = s.orientation === "portrait";
  const pageW = portrait ? 8.5 * PT : 11 * PT;
  const pageH = portrait ? 11 * PT : 8.5 * PT;
  const top = MARGIN + (s.header ? HEADER_H : 0);
  const availW = pageW - 2 * MARGIN;
  const availH = pageH - top - MARGIN;
  const lead = s.strokes === "steps" ? STEP_LEAD : 0;

  let best = { cell: 0, blocks: 1, rowsPerBlock: s.rows };
  for (let b = 1; b <= s.rows; b++) {
    const rpb = Math.ceil(s.rows / b);
    const cellW = availW / (b * s.cols + (b - 1) * BLOCK_GAP);
    const cellH = availH / (rpb * (1 + lead) + (rpb - 1) * ROW_GAP);
    const cell = Math.min(cellW, cellH, MAX_CELL);
    if (cell > best.cell + 0.01) best = { cell, blocks: b, rowsPerBlock: rpb };
  }

  const { cell, blocks, rowsPerBlock } = best;
  const gridW = cell * (blocks * s.cols + (blocks - 1) * BLOCK_GAP);
  const gridH = cell * (rowsPerBlock * (1 + lead) + (rowsPerBlock - 1) * ROW_GAP);
  return {
    pageW,
    pageH,
    cell,
    blocks,
    rowsPerBlock,
    lead,
    x0: MARGIN + (availW - gridW) / 2,
    y0: top + (availH - gridH) / 2,
  };
}

// Ghost shade (0–1, fraction of black) for practice cell i, or 0 for blank.
function ghostShade(s: SheetSettings, i: number): number {
  const dark = s.ghostDarkness / 100;
  if (s.ghostMode === "all") return dark;
  if (s.ghostMode === "fade") {
    const n = Math.min(s.ghostCount, s.cols - 1);
    return i < n ? dark * (1 - i / n) : 0;
  }
  return 0;
}

function grey(shade: number): string {
  const v = Math.round(255 * (1 - shade));
  return `rgb(${v},${v},${v})`;
}

interface PageProps {
  settings: SheetSettings;
  layout: SheetLayout;
  rows: Kana[];
  pageNum: number;
  pageCount: number;
  className?: string;
  print?: boolean;
}

export function SheetPage({ settings: s, layout: L, rows, pageNum, pageCount, className, print }: PageProps) {
  const font = fontById(s.font);
  const pal = PALETTES[s.palette];
  const c = L.cell;
  const fontFamily = `"${font.family}", "Klee One", serif`;

  const guideDash =
    s.guideStyle === "dotted"
      ? { strokeDasharray: `0 ${c * 0.045}`, strokeLinecap: "round" as const, strokeWidth: 1.1 }
      : { strokeDasharray: `${c * 0.05} ${c * 0.04}`, strokeWidth: 0.8 };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${L.pageW} ${L.pageH}`}
      width={print ? `${L.pageW / PT}in` : undefined}
      height={print ? `${L.pageH / PT}in` : undefined}
      className={className}
      role="img"
      aria-label={`Practice sheet page ${pageNum}`}
    >
      <rect width={L.pageW} height={L.pageH} fill="#fff" />

      {s.header && (
        <g fontFamily={fontFamily} fill="#333">
          {s.title && (
            <text x={MARGIN} y={MARGIN + 22} fontSize={18} fontWeight={font.weight}>
              {s.title}
            </text>
          )}
          <text x={L.pageW - MARGIN - 2.6 * PT} y={MARGIN + 22} fontSize={13} textAnchor="end">
            なまえ
          </text>
          <line
            x1={L.pageW - MARGIN - 2.5 * PT}
            x2={L.pageW - MARGIN}
            y1={MARGIN + 25}
            y2={MARGIN + 25}
            stroke="#999"
            strokeWidth={0.8}
          />
        </g>
      )}

      {rows.map((kana, i) => {
        const block = Math.floor(i / L.rowsPerBlock);
        const r = i % L.rowsPerBlock;
        const bx = L.x0 + block * (s.cols + BLOCK_GAP) * c;
        const y = L.y0 + r * (1 + L.lead + ROW_GAP) * c + L.lead * c;
        const ch = s.script === "hiragana" ? kana.h : kana.k;
        const strokes = s.strokes !== "off" ? strokeData(ch) : null;
        // Yōon (きゃ) share one cell, so shrink to fit both glyphs
        const fs = ch.length > 1 ? c * 0.46 : c * 0.74;

        return (
          <g key={i}>
            {s.strokes === "steps" && strokes && (
              <StepStrip data={strokes} x={bx} y={y - L.lead * c} rowW={s.cols * c} cell={c} guide={pal.guide} />
            )}
            {Array.from({ length: s.cols }, (_, col) => {
              const x = bx + col * c;
              const isExample = col === 0;
              const shade = isExample ? 1 : ghostShade(s, col - 1);
              return (
                <g key={col}>
                  <rect
                    x={x}
                    y={y}
                    width={c}
                    height={c}
                    fill={isExample ? pal.tint : "#fff"}
                    stroke={pal.border}
                    strokeWidth={1}
                  />
                  {s.guide && (
                    <g stroke={pal.guide} {...guideDash}>
                      <line x1={x + c / 2} x2={x + c / 2} y1={y + 2} y2={y + c - 2} />
                      <line x1={x + 2} x2={x + c - 2} y1={y + c / 2} y2={y + c / 2} />
                    </g>
                  )}
                  {isExample && strokes ? (
                    <KvgCell data={strokes} x={x} y={y} size={c} />
                  ) : shade > 0 && (
                    <text
                      x={x + c / 2}
                      y={y + c / 2 + font.mid * fs}
                      textAnchor="middle"
                      fontFamily={fontFamily}
                      fontWeight={font.weight}
                      fontSize={fs}
                      fill={isExample ? "#111" : grey(shade)}
                    >
                      {ch}
                    </text>
                  )}
                  {isExample && s.romaji && (
                    <text
                      x={x + c * 0.07}
                      y={y + c * 0.16}
                      fontFamily="ui-sans-serif, system-ui, sans-serif"
                      fontSize={Math.max(6, c * 0.11)}
                      fill="#999"
                    >
                      {kana.romaji}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        );
      })}

      {s.strokes !== "off" && (
        <text x={MARGIN} y={L.pageH - MARGIN / 2} fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize={6} fill="#bbb">
          Stroke order: KanjiVG (CC BY-SA 3.0)
        </text>
      )}

      {pageCount > 1 && (
        <text
          x={L.pageW - MARGIN}
          y={L.pageH - MARGIN / 2}
          textAnchor="end"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontSize={8}
          fill="#aaa"
        >
          {pageNum} / {pageCount}
        </text>
      )}
    </svg>
  );
}

export function cellSizeInches(layout: SheetLayout): string {
  return (layout.cell / PT).toFixed(2);
}

// KanjiVG data for every char in the string (yōon = 2), or null if any is missing
function strokeData(ch: string): StrokeData[] | null {
  const out = [...ch].map(c => STROKES[c]);
  return out.every(Boolean) ? out : null;
}

// Draws KanjiVG glyphs side by side in a box. `upto` = how many strokes of the
// LAST glyph to draw (earlier glyphs drawn whole); `newest` highlights that stroke.
function KvgGlyphs({
  data,
  x,
  y,
  size,
  strokeW,
  numbers,
  color = "#111",
}: {
  data: StrokeData[];
  x: number;
  y: number;
  size: number;
  strokeW: number;
  numbers?: boolean;
  color?: string;
}) {
  const box = data.length > 1 ? size * 0.5 : size * 0.92;
  const ox = x + (size - box * data.length) / 2;
  const oy = y + (size - box) / 2;
  const k = box / KVG;
  // ~11pt on a normal example square; never below 5.5pt in half-size yōon boxes
  const numFs = Math.max(13, (5.5 * KVG) / box);
  return (
    <>
      {data.map((d, gi) => (
        <g key={gi} transform={`translate(${ox + gi * box} ${oy}) scale(${k})`}>
          <g fill="none" stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
            {d.p.map((p, si) => (
              <path key={si} d={p} />
            ))}
          </g>
          {numbers &&
            d.n.map(([nx, ny], si) => (
              <text
                key={si}
                x={nx}
                y={ny}
                fontSize={numFs}
                fontWeight={700}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                fill={NUM_RED}
                stroke="#fff"
                strokeWidth={numFs * 0.28}
                paintOrder="stroke"
              >
                {si + 1}
              </text>
            ))}
        </g>
      ))}
    </>
  );
}

function KvgCell({ data, x, y, size }: { data: StrokeData[]; x: number; y: number; size: number }) {
  return <KvgGlyphs data={data} x={x} y={y} size={size} strokeW={5.5} numbers />;
}

// Little boxes above the row building the kana up one stroke at a time:
// the new stroke in black, earlier ones grey.
function StepStrip({
  data,
  x,
  y,
  rowW,
  cell,
  guide,
}: {
  data: StrokeData[];
  x: number;
  y: number;
  rowW: number;
  cell: number;
  guide: string;
}) {
  const steps = data.flatMap((d, gi) => d.p.map((_, si) => ({ gi, si })));
  const gap = cell * 0.05;
  const sb = Math.min(cell * 0.28, (rowW - gap * (steps.length - 1)) / steps.length);
  return (
    <g>
      {steps.map(({ gi, si }, i) => {
        const bx = x + i * (sb + gap);
        const d = data[gi];
        const k = sb / KVG;
        return (
          <g key={i}>
            <rect x={bx} y={y} width={sb} height={sb} fill="#fff" stroke={guide} strokeWidth={0.6} rx={1.5} />
            <g transform={`translate(${bx} ${y}) scale(${k})`} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={7}>
              {d.p.slice(0, si).map((p, j) => (
                <path key={j} d={p} stroke="#d2d2d2" />
              ))}
              <path d={d.p[si]} stroke="#111" />
            </g>
          </g>
        );
      })}
    </g>
  );
}
