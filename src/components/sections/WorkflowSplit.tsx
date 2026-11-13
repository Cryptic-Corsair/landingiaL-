import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Check, Search } from 'lucide-react';
import {
  IAL_UNITS,
  SPEC_CHIPS,
  WORKFLOW_CHAPTERS,
  type WorkflowChapter,
} from '../../data/ialData';
import {
  EASE_EXPO,
  SPRING_SNAPPY,
  VIEWPORT_ONCE,
  computeSelectedPackMetrics,
} from '../../lib/motion';

interface WorkflowSplitProps {
  reducedMotion: boolean;
  onOpenSearch: (initialQuery?: string) => void;
}

const PROGRESS_ROWS = [
  { code: 'WCH11', title: 'Structure & Bonding', pct: 100, minutes: 120 },
  { code: 'WCH12', title: 'Energetics & Equilibria', pct: 80, minutes: 104 },
  { code: 'WCH14', title: 'Rates & Further Organic', pct: 67, minutes: 95 },
];

export function WorkflowSplit({ reducedMotion, onOpenSearch }: WorkflowSplitProps) {
  const [activeId, setActiveId] = useState<WorkflowChapter['id']>('pinpoint');
  const [selectedChipIds, setSelectedChipIds] = useState<string[]>([
    'spec-1.4c',
    'spec-2.7a',
    'spec-4.3b',
  ]);
  const [completedUnits, setCompletedUnits] = useState<Record<string, boolean>>({
    WCH11: true,
    WCH12: false,
    WCH14: false,
  });

  const toggleChip = (id: string) => {
    setSelectedChipIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleUnitLogged = (code: string) => {
    setCompletedUnits((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const packMetrics = computeSelectedPackMetrics(SPEC_CHIPS, selectedChipIds);

  return (
    <section
      id="workflow"
      className="relative border-t py-20 sm:py-28"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <p
            className="font-mono text-[11px] tracking-[0.16em] uppercase"
            style={{ color: 'var(--ink-muted)' }}
          >
            REVISION ARCHITECTURE
          </p>
          <h2
            className="mt-2.5 text-balance font-semibold tracking-[-0.03em] leading-[1.08]"
            style={{ fontSize: 'clamp(1.75rem, 3.4vw, 2.75rem)' }}
          >
            Focused flow from{' '}
            <span className="font-serif italic font-normal">index to recall.</span>
          </h2>
        </div>

        {/* 50 / 50 Architectural Split */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: 0.55, ease: EASE_EXPO }}
          className="mt-10 grid grid-cols-1 overflow-hidden rounded-2xl border lg:grid-cols-12"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--surface)',
          }}
        >
          {/* Left Column: 3 Interactive Chapters with Sliding layoutId Indicator */}
          <div
            className="flex flex-col divide-y border-b lg:col-span-5 lg:border-r lg:border-b-0"
            style={{ borderColor: 'var(--border)' }}
          >
            {WORKFLOW_CHAPTERS.map((chapter) => {
              const selected = activeId === chapter.id;
              return (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => setActiveId(chapter.id)}
                  aria-pressed={selected}
                  className="relative flex flex-1 flex-col justify-center gap-2 px-6 py-6 text-left transition-colors sm:px-8 sm:py-8"
                  style={{
                    backgroundColor: selected
                      ? 'var(--surface-elevated)'
                      : 'transparent',
                    borderColor: 'var(--border)',
                  }}
                >
                  {selected && (
                    <motion.span
                      layoutId="workflow-active-indicator"
                      transition={SPRING_SNAPPY}
                      aria-hidden="true"
                      className="absolute inset-y-4 left-0 w-[2px]"
                      style={{ backgroundColor: 'var(--accent)' }}
                    />
                  )}
                  <div className="flex items-center gap-2.5 font-mono text-xs tabular-nums">
                    <span
                      style={{
                        color: selected ? 'var(--accent)' : 'var(--ink-muted)',
                      }}
                    >
                      {chapter.index}
                    </span>
                    <span style={{ color: 'var(--ink-muted)' }}>·</span>
                    <span
                      className="font-semibold tracking-tight uppercase"
                      style={{
                        color: selected ? 'var(--ink)' : 'var(--ink-muted)',
                      }}
                    >
                      {chapter.label}
                    </span>
                  </div>
                  <p
                    className="text-base font-semibold tracking-tight sm:text-lg"
                    style={{ color: 'var(--ink)' }}
                  >
                    {chapter.summary}
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--ink-muted)' }}
                  >
                    {chapter.detail}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right Column: Interactive Animated Visual Stage */}
          <div
            className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-7"
            style={{ backgroundColor: 'var(--bg)' }}
          >
            <AnimatePresence mode="wait">
              {activeId === 'pinpoint' && (
                <motion.div
                  key="stage-pinpoint"
                  initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: EASE_EXPO }}
                  className="flex h-full flex-col justify-between gap-6"
                >
                  <div>
                    <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-muted)' }}>
                      <span>01 · SPECIFICATION INDEX</span>
                      <span className="tabular-nums">WCH11–WCH16</span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold tracking-tight">
                      Direct jump by specification statement
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {IAL_UNITS.slice(0, 4).map((unit) => (
                      <button
                        key={unit.code}
                        type="button"
                        onClick={() => onOpenSearch(unit.code)}
                        className="group flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors"
                        style={{
                          borderColor: 'var(--border)',
                          backgroundColor: 'var(--surface)',
                        }}
                      >
                        <div className="min-w-0 pr-4">
                          <div className="flex items-center gap-2 font-mono text-xs tabular-nums">
                            <span style={{ color: 'var(--accent)' }}>{unit.code}</span>
                            <span style={{ color: 'var(--ink-muted)' }}>·</span>
                            <span style={{ color: 'var(--ink-muted)' }}>{unit.levelTag}</span>
                          </div>
                          <p className="mt-0.5 truncate text-sm font-medium">
                            {unit.title}
                          </p>
                        </div>
                        <span
                          className="inline-flex items-center gap-1.5 font-mono text-xs tabular-nums shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                          style={{ color: 'var(--ink-muted)' }}
                        >
                          {unit.topicsCount} topics
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                    <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                      Filter all 33 topics with keyboard navigation
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenSearch('')}
                      className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-xs whitespace-nowrap shrink-0"
                      style={{
                        borderColor: 'var(--border-strong)',
                        backgroundColor: 'var(--surface)',
                        color: 'var(--ink)',
                      }}
                    >
                      <Search className="h-3 w-3" aria-hidden="true" />
                      <span>Open Index ⌘K</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {activeId === 'assemble' && (
                <motion.div
                  key="stage-assemble"
                  data-testid="workflow-assemble-stage"
                  initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: EASE_EXPO }}
                  className="flex h-full flex-col justify-between gap-6"
                >
                  <div>
                    <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-muted)' }}>
                      <span>02 · INTERACTIVE PACK BUILDER</span>
                      <span className="tabular-nums">{packMetrics.count} / 4 SELECTED</span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold tracking-tight">
                      Toggle specification statements to compile
                    </h3>
                  </div>

                  {/* Interactive Spec Statement Toggle Chips */}
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {SPEC_CHIPS.map((chip) => {
                      const active = selectedChipIds.includes(chip.id);
                      return (
                        <button
                          key={chip.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleChip(chip.id)}
                          className="flex items-start justify-between gap-3 rounded-xl border p-3.5 text-left transition-colors"
                          style={{
                            borderColor: active
                              ? 'var(--accent)'
                              : 'var(--border)',
                            backgroundColor: active
                              ? 'var(--surface-elevated)'
                              : 'var(--surface)',
                          }}
                        >
                          <div className="min-w-0">
                            <span
                              className="block font-mono text-[11px] tabular-nums"
                              style={{
                                color: active ? 'var(--accent)' : 'var(--ink-muted)',
                              }}
                            >
                              {chip.unitCode} · {chip.minutes} min
                            </span>
                            <span className="mt-1 block text-xs font-medium leading-snug">
                              {chip.label}
                            </span>
                          </div>
                          <span
                            aria-hidden="true"
                            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border"
                            style={{
                              borderColor: active
                                ? 'var(--accent)'
                                : 'var(--border-strong)',
                              backgroundColor: active ? 'var(--accent)' : 'transparent',
                              color: active ? 'var(--accent-ink)' : 'transparent',
                            }}
                          >
                            <Check className="h-3 w-3" />
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Live Compiled Pack Summary */}
                  <div
                    data-testid="compiled-pack-summary"
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4"
                    style={{
                      borderColor: 'var(--border-strong)',
                      backgroundColor: 'var(--surface)',
                    }}
                  >
                    <div>
                      <p
                        className="font-mono text-[10px] tracking-[0.14em] uppercase"
                        style={{ color: 'var(--accent)' }}
                      >
                        COMPILED REVISION PACK
                      </p>
                      <p className="mt-1 text-sm font-semibold tabular-nums">
                        {packMetrics.count}{' '}
                        {packMetrics.count === 1 ? 'statement' : 'statements'} ·{' '}
                        {packMetrics.totalMinutes} min · {packMetrics.estimatedPages} pages
                      </p>
                      <p className="mt-0.5 font-mono text-[11px]" style={{ color: 'var(--ink-muted)' }}>
                        {packMetrics.unitCodes.length > 0
                          ? `Units: ${packMetrics.unitCodes.join(', ')}`
                          : 'Select at least one statement above'}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={packMetrics.count === 0}
                      onClick={() => onOpenSearch(packMetrics.unitCodes[0] ?? 'WCH11')}
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-opacity disabled:opacity-40 whitespace-nowrap shrink-0"
                      style={{
                        backgroundColor: 'var(--ink)',
                        color: 'var(--bg)',
                      }}
                    >
                      <span>Preview Pack</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </motion.div>
              )}

              {activeId === 'retain' && (
                <motion.div
                  key="stage-retain"
                  initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: EASE_EXPO }}
                  className="flex h-full flex-col justify-between gap-6"
                >
                  <div>
                    <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-muted)' }}>
                      <span>03 · PRIVATE LOCAL PROGRESS</span>
                      <span className="tabular-nums">ZERO ACCOUNT WALL</span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold tracking-tight">
                      Keep reading momentum visible per unit
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {PROGRESS_ROWS.map((row) => {
                      const done = completedUnits[row.code];
                      const effectivePct = done ? 100 : row.pct;
                      return (
                        <div
                          key={row.code}
                          className="rounded-xl border p-3.5"
                          style={{
                            borderColor: 'var(--border)',
                            backgroundColor: 'var(--surface)',
                          }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <span className="font-mono text-xs font-medium" style={{ color: 'var(--accent)' }}>
                                {row.code}
                              </span>
                              <span className="ml-2 text-sm font-medium">{row.title}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleUnitLogged(row.code)}
                              className="rounded-full border px-2.5 py-0.5 font-mono text-[10px] tabular-nums whitespace-nowrap shrink-0"
                              style={{
                                borderColor: done ? 'var(--accent)' : 'var(--border-strong)',
                                color: done ? 'var(--accent)' : 'var(--ink-muted)',
                              }}
                            >
                              {done ? 'Completed' : `${effectivePct}%`}
                            </button>
                          </div>

                          <div
                            className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full"
                            style={{ backgroundColor: 'var(--surface-elevated)' }}
                          >
                            <motion.div
                              initial={false}
                              animate={{ scaleX: effectivePct / 100 }}
                              transition={{ duration: 0.4, ease: EASE_EXPO }}
                              className="h-full origin-left rounded-full"
                              style={{ backgroundColor: 'var(--accent)' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between border-t pt-4 font-mono text-xs tabular-nums" style={{ borderColor: 'var(--border)', color: 'var(--ink-muted)' }}>
                    <span>Stored strictly in browser storage</span>
                    <span>319 / 756 min logged</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
