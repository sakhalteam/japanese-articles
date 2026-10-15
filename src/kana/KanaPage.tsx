import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ALL_KANA, GROUP_LABELS, KANA_ROWS, rowLabel, type Kana, type KanaGroup, type KanaRow } from "./kanaData";
import { cellSizeInches, computeLayout, SheetPage } from "./Sheet";
import {
  DEFAULTS,
  FONTS,
  LIMITS,
  ensureFontsLoaded,
  fontById,
  loadPresets,
  loadSettings,
  sameData,
  savePresets,
  saveSettings,
  toPresetData,
  type Preset,
  ORIENTATION_PRESETS,
  type Orientation,
  type SheetSettings,
} from "./settings";
import "./kana.css";

// Deterministic shuffle so the preview and the print match until you reshuffle
function shuffled<T>(arr: T[], seed: number): T[] {
  let a = seed >>> 0;
  const rand = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const clamp = (n: number, [lo, hi]: readonly [number, number]) => Math.max(lo, Math.min(hi, n));

export default function KanaPage() {
  const [s, setS] = useState<SheetSettings>(loadSettings);
  const set = (patch: Partial<SheetSettings>) => setS(prev => ({ ...prev, ...patch }));

  const [presets, setPresets] = useState<Preset[]>(loadPresets);

  useEffect(() => saveSettings(s), [s]);
  useEffect(() => savePresets(presets), [presets]);
  useEffect(() => {
    ensureFontsLoaded();
    window.scrollTo(0, 0);
  }, []);

  const selected = useMemo(() => new Set(s.selected), [s.selected]);
  const font = fontById(s.font);

  const pages = useMemo(() => {
    const picked = ALL_KANA.filter(k => selected.has(k.id));
    const ordered = s.order === "shuffle" ? shuffled(picked, s.seed) : picked;
    const items = ordered.flatMap(k => Array<Kana>(s.repeat).fill(k));
    const out: Kana[][] = [];
    for (let i = 0; i < items.length; i += s.rows) out.push(items.slice(i, i + s.rows));
    return out;
  }, [selected, s.order, s.seed, s.repeat, s.rows]);

  const layout = useMemo(() => computeLayout(s), [s]);

  // Landscape gets its own sensible grid, unless you've customised it
  const changeOrientation = (o: Orientation) => {
    const preset = ORIENTATION_PRESETS[o];
    const from = ORIENTATION_PRESETS[s.orientation];
    const untouched = s.rows === from.rows && s.cols === from.cols;
    set(untouched ? { orientation: o, ...preset, ghostCount: Math.min(s.ghostCount, preset.cols - 1) } : { orientation: o });
  };

  const toggleKana = (id: string) =>
    set({ selected: selected.has(id) ? s.selected.filter(x => x !== id) : [...s.selected, id] });

  const toggleIds = (ids: string[]) => {
    const allOn = ids.every(id => selected.has(id));
    set({ selected: allOn ? s.selected.filter(id => !ids.includes(id)) : [...new Set([...s.selected, ...ids])] });
  };

  const handlePrint = async () => {
    const chars = [...new Set(pages.flat().map(k => (s.script === "hiragana" ? k.h : k.k)))].join("") + "なまえ";
    try {
      await document.fonts.load(`${font.weight} 48px "${font.family}"`, chars);
      await document.fonts.ready;
    } catch {
      /* print with whatever loaded */
    }
    window.print();
  };

  const groups: KanaGroup[] = ["dakuten", "yoon", "small"];
  const extraCount = ALL_KANA.filter(k => selected.has(k.id) && !KANA_ROWS.some(r => r.group === "basic" && r.cells.includes(k))).length;

  return (
    <div className="dot-grid min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-5 pt-16 pb-16">
        <header className="mb-8">
          <div className="section-label mb-5">
            <a href="#" className="kp-back">← 記事</a>
            <span>かな れんしゅう</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
            かなれんしゅう
          </h1>
          <p className="mt-3" style={{ color: "var(--muted)", fontSize: "0.95rem" }}>
            Printable hiragana &amp; katakana practice sheets. Pick kana, tweak, print.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* ── Left: picker + options ── */}
          <div className="min-w-0 space-y-5">
            <PresetBar s={s} setS={setS} presets={presets} setPresets={setPresets} />
            <section className="kp-card">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <Segmented
                  value={s.script}
                  onChange={v => set({ script: v })}
                  options={[
                    ["hiragana", "ひらがな"],
                    ["katakana", "カタカナ"],
                  ]}
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono mr-1" style={{ color: "var(--muted)" }}>
                    {s.selected.length} picked
                  </span>
                  <button className="kp-chip" onClick={() => set({ selected: KANA_ROWS.filter(r => r.group === "basic").flatMap(ids) })}>
                    All 46
                  </button>
                  <button className="kp-chip" onClick={() => set({ selected: [] })}>
                    None
                  </button>
                </div>
              </div>

              <KanaChart rows={KANA_ROWS.filter(r => r.group === "basic")} s={s} selected={selected} fontFamily={font.family} onKana={toggleKana} onRow={toggleIds} />

              <details className="kp-details mt-4" open={s.moreKanaOpen} onToggle={e => set({ moreKanaOpen: e.currentTarget.open })}>
                <summary>
                  More kana <span className="kp-dim">— が・ぱ・きゃ・っ</span>
                  {extraCount > 0 && <span className="kp-badge">{extraCount}</span>}
                </summary>
                <div className="space-y-5 pt-4">
                  {groups.map(g => {
                    const rows = KANA_ROWS.filter(r => r.group === g);
                    return (
                      <div key={g}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="kp-group-label">{GROUP_LABELS[g]}</span>
                          <button className="kp-chip" onClick={() => toggleIds(rows.flatMap(ids))}>
                            toggle all
                          </button>
                        </div>
                        <KanaChart rows={rows} s={s} selected={selected} fontFamily={font.family} onKana={toggleKana} onRow={toggleIds} />
                      </div>
                    );
                  })}
                </div>
              </details>
            </section>

            <details className="kp-card kp-details" open={s.optionsOpen} onToggle={e => set({ optionsOpen: e.currentTarget.open })}>
              <summary>Sheet options</summary>
              <div className="pt-5 space-y-6">
                <OptGroup title="Layout">
                  <Field label="Orientation">
                    <Segmented value={s.orientation} onChange={changeOrientation} options={[["portrait", "Portrait"], ["landscape", "Landscape"]]} />
                  </Field>
                  <Field label="Kana rows per page">
                    <Stepper value={s.rows} limits={LIMITS.rows} onChange={v => set({ rows: v })} />
                  </Field>
                  <Field label="Squares per row" hint="1 example + the rest to write in">
                    <Stepper value={s.cols} limits={LIMITS.cols} onChange={v => set({ cols: v, ghostCount: Math.min(s.ghostCount, v - 1) })} />
                  </Field>
                  <Field label="Rows per kana" hint="Repeat each kana for extra practice">
                    <Stepper value={s.repeat} limits={LIMITS.repeat} onChange={v => set({ repeat: v })} />
                  </Field>
                </OptGroup>

                <OptGroup title="Tracing ghosts">
                  <Field label="Ghost characters">
                    <Segmented value={s.ghostMode} onChange={v => set({ ghostMode: v })} options={[["none", "None"], ["fade", "Fade out"], ["all", "Every square"]]} />
                  </Field>
                  {s.ghostMode === "fade" && (
                    <Field label="Squares that fade" hint="Lighter each square, then blank">
                      <Stepper value={s.ghostCount} limits={[1, s.cols - 1]} onChange={v => set({ ghostCount: v })} />
                    </Field>
                  )}
                  {s.ghostMode !== "none" && (
                    <Field label={`Darkest ghost · ${s.ghostDarkness}%`}>
                      <input
                        type="range"
                        className="kp-range"
                        min={LIMITS.ghostDarkness[0]}
                        max={LIMITS.ghostDarkness[1]}
                        step={5}
                        value={s.ghostDarkness}
                        onChange={e => set({ ghostDarkness: Number(e.target.value) })}
                      />
                    </Field>
                  )}
                </OptGroup>

                <OptGroup title="Guide lines">
                  <Field label="Four-quadrant guide">
                    <Toggle on={s.guide} onChange={v => set({ guide: v })} />
                  </Field>
                  {s.guide && (
                    <Field label="Line style">
                      <Segmented value={s.guideStyle} onChange={v => set({ guideStyle: v })} options={[["dotted", "Dotted"], ["dashed", "Dashed"]]} />
                    </Field>
                  )}
                  <Field label="Grid colour">
                    <div className="flex gap-2">
                      {(["grey", "red", "blue"] as const).map(p => (
                        <button
                          key={p}
                          className="kp-swatch"
                          data-on={s.palette === p}
                          data-p={p}
                          onClick={() => set({ palette: p })}
                          title={p}
                          aria-label={`${p} grid`}
                        />
                      ))}
                    </div>
                  </Field>
                </OptGroup>

                <OptGroup title="Font">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {FONTS.map(f => (
                      <button key={f.id} className="kp-font" data-on={s.font === f.id} onClick={() => set({ font: f.id })}>
                        <span className="kp-font-sample" style={{ fontFamily: `"${f.family}"`, fontWeight: f.weight }}>
                          きさ<span className="opacity-60">ア</span>
                        </span>
                        <span className="kp-font-name">
                          {f.label}
                          {f.textbook && <span className="kp-textbook"> ✓ textbook</span>}
                        </span>
                      </button>
                    ))}
                  </div>
                  {!font.textbook && (
                    <p className="kp-warn">
                      ⚠ Fun font — some strokes differ from what schools teach (look at き and さ). Klee One is the textbook-style pick.
                    </p>
                  )}
                </OptGroup>

                <OptGroup title="Extras">
                  <Field label="Order">
                    <div className="flex items-center gap-2">
                      <Segmented value={s.order} onChange={v => set({ order: v })} options={[["chart", "あいうえお"], ["shuffle", "Shuffled"]]} />
                      {s.order === "shuffle" && (
                        <button className="kp-chip" onClick={() => set({ seed: Math.floor(Math.random() * 1e9) })} title="Reshuffle">
                          🎲
                        </button>
                      )}
                    </div>
                  </Field>
                  <Field label="Name line + title">
                    <Toggle on={s.header} onChange={v => set({ header: v })} />
                  </Field>
                  {s.header && (
                    <Field label="Title">
                      <input className="kp-input" placeholder="e.g. ひらがな れんしゅう" value={s.title} onChange={e => set({ title: e.target.value })} maxLength={40} />
                    </Field>
                  )}
                  <Field label="Romaji in example square">
                    <Toggle on={s.romaji} onChange={v => set({ romaji: v })} />
                  </Field>
                </OptGroup>

                <button
                  className="kp-chip"
                  onClick={() => setS({ ...DEFAULTS, selected: s.selected, script: s.script, optionsOpen: true, moreKanaOpen: s.moreKanaOpen, activePreset: s.activePreset })}
                >
                  Reset options to defaults
                </button>
              </div>
            </details>
          </div>

          {/* ── Right: preview + print ── */}
          <aside className="lg:sticky lg:top-16 self-start space-y-3">
            <button className="kp-print" onClick={handlePrint} disabled={pages.length === 0}>
              Print / Save as PDF
            </button>
            <div className="text-xs font-mono flex justify-between" style={{ color: "var(--muted)" }}>
              <span>
                {pages.length} page{pages.length === 1 ? "" : "s"} · letter {s.orientation}
              </span>
              <span>{cellSizeInches(layout)}″ squares</span>
            </div>
            <div className="kp-preview">
              {pages.length === 0 ? (
                <div className="kp-empty">Tap some kana to start a sheet ✏️</div>
              ) : (
                pages.map((rows, i) => (
                  <SheetPage key={i} settings={s} layout={layout} rows={rows} pageNum={i + 1} pageCount={pages.length} className="kp-page" />
                ))
              )}
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
              Tip: in the print dialog, pick <b>Save as PDF</b> for a file, keep scale at 100%, and margins at Default/None.
            </p>
          </aside>
        </div>
      </div>

      {createPortal(
        <div className="print-root">
          <style>{`@page { size: letter ${s.orientation}; margin: 0; }`}</style>
          {pages.map((rows, i) => (
            <div key={i} className="print-page">
              <SheetPage settings={s} layout={layout} rows={rows} pageNum={i + 1} pageCount={pages.length} print />
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

function PresetBar({
  s,
  setS,
  presets,
  setPresets,
}: {
  s: SheetSettings;
  setS: (fn: (prev: SheetSettings) => SheetSettings) => void;
  presets: Preset[];
  setPresets: (fn: (prev: Preset[]) => Preset[]) => void;
}) {
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState("");

  const active = presets.find(p => p.id === s.activePreset) ?? null;
  const modified = active !== null && !sameData(active.data, toPresetData(s));

  const load = (p: Preset) => setS(prev => ({ ...prev, ...p.data, activePreset: p.id }));

  const saveNew = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    // Same name (any case) overwrites instead of making a twin
    const existing = presets.find(p => p.name.toLowerCase() === trimmed.toLowerCase());
    const id = existing?.id ?? `p${Date.now().toString(36)}`;
    const data = toPresetData(s);
    setPresets(prev => (existing ? prev.map(p => (p.id === id ? { ...p, name: trimmed, data } : p)) : [...prev, { id, name: trimmed, data }]));
    setS(prev => ({ ...prev, activePreset: id }));
    setNaming(false);
    setName("");
  };

  const update = () => {
    if (!active) return;
    const data = toPresetData(s);
    setPresets(prev => prev.map(p => (p.id === active.id ? { ...p, data } : p)));
  };

  const remove = (p: Preset) => {
    if (!window.confirm(`Delete preset “${p.name}”?`)) return;
    setPresets(prev => prev.filter(x => x.id !== p.id));
    if (s.activePreset === p.id) setS(prev => ({ ...prev, activePreset: null }));
  };

  return (
    <section className="kp-presets">
      <span className="kp-group-label mr-1">Presets</span>
      {presets.map(p => {
        const isActive = p.id === s.activePreset;
        return (
          <span key={p.id} className="kp-preset" data-on={isActive}>
            <button className="kp-preset-name" onClick={() => load(p)} title={`Load “${p.name}”`}>
              {p.name}
              {isActive && modified && <span className="kp-preset-dot" title="Changed since saved" />}
            </button>
            <button className="kp-preset-x" onClick={() => remove(p)} aria-label={`Delete preset ${p.name}`} title="Delete">
              ×
            </button>
          </span>
        );
      })}
      {modified && active && (
        <>
          <button className="kp-chip kp-chip-accent" onClick={update} title={`Save changes into “${active.name}”`}>
            Update “{active.name}”
          </button>
          <button className="kp-chip" onClick={() => load(active)} title="Undo changes since loading">
            Revert
          </button>
        </>
      )}
      {naming ? (
        <span className="inline-flex items-center gap-1.5">
          <input
            autoFocus
            className="kp-input kp-input-sm"
            placeholder="e.g. Jojo"
            value={name}
            maxLength={24}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") saveNew();
              if (e.key === "Escape") setNaming(false);
            }}
          />
          <button className="kp-chip kp-chip-accent" onClick={saveNew} disabled={!name.trim()}>
            Save
          </button>
          <button className="kp-chip" onClick={() => setNaming(false)}>
            Cancel
          </button>
        </span>
      ) : (
        <button className="kp-chip" onClick={() => setNaming(true)}>
          + {presets.length ? "Save as preset" : "Save these settings as a preset"}
        </button>
      )}
    </section>
  );
}

const ids = (r: KanaRow) => r.cells.filter((c): c is Kana => c !== null).map(c => c.id);

function KanaChart({
  rows,
  s,
  selected,
  fontFamily,
  onKana,
  onRow,
}: {
  rows: KanaRow[];
  s: SheetSettings;
  selected: Set<string>;
  fontFamily: string;
  onKana: (id: string) => void;
  onRow: (ids: string[]) => void;
}) {
  return (
    <div className="kp-chart">
      {rows.map(row => {
        const rowIds = ids(row);
        const allOn = rowIds.every(id => selected.has(id));
        return (
          <div key={row.id} className="kp-chart-row">
            <button className="kp-row-btn" data-on={allOn} onClick={() => onRow(rowIds)} title="Toggle whole row">
              {rowLabel(row, s.script)}
            </button>
            {row.cells.map((cell, i) =>
              cell ? (
                <button
                  key={cell.id}
                  className="kana-btn"
                  data-on={selected.has(cell.id)}
                  onClick={() => onKana(cell.id)}
                  style={{ fontFamily: `"${fontFamily}", "Klee One", sans-serif` }}
                  title={cell.romaji}
                >
                  {s.script === "hiragana" ? cell.h : cell.k}
                </button>
              ) : (
                <span key={i} />
              )
            )}
          </div>
        );
      })}
    </div>
  );
}

function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <div className="kp-seg" role="radiogroup">
      {options.map(([v, label]) => (
        <button key={v} role="radio" aria-checked={value === v} data-on={value === v} onClick={() => onChange(v)}>
          {label}
        </button>
      ))}
    </div>
  );
}

function Stepper({ value, limits, onChange }: { value: number; limits: readonly [number, number]; onChange: (v: number) => void }) {
  return (
    <div className="kp-stepper">
      <button onClick={() => onChange(clamp(value - 1, limits))} disabled={value <= limits[0]} aria-label="Decrease">
        −
      </button>
      <span>{value}</span>
      <button onClick={() => onChange(clamp(value + 1, limits))} disabled={value >= limits[1]} aria-label="Increase">
        +
      </button>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return <button className="kp-toggle" role="switch" aria-checked={on} data-on={on} onClick={() => onChange(!on)} />;
}

function OptGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="kp-group-label mb-3">{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div className="min-w-0">
        <div className="text-sm" style={{ color: "var(--text)" }}>
          {label}
        </div>
        {hint && <div className="text-xs" style={{ color: "var(--muted)" }}>{hint}</div>}
      </div>
      {children}
    </div>
  );
}
