import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Play, SlidersHorizontal } from 'lucide-react';
import { SPEC_CHIPS } from '../../data/ialData';
import { computeSelectedPackMetrics, EASE_EXPO, SPRING_PLAYFUL } from '../../lib/motion';
import { soundEngine } from '../../lib/sound';

interface ConveyorShowcaseProps {
  reducedMotion: boolean;
}

export function ConveyorShowcase({ reducedMotion }: ConveyorShowcaseProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([
    'spec-1.4c',
    'spec-2.7a',
    'spec-4.3b',
    'spec-5.2e',
  ]);
  const [cycleId, setCycleId] = useState(0);
  const [scanDone, setScanDone] = useState(true);
  const [displayMinutes, setDisplayMinutes] = useState(38);

  const metrics = computeSelectedPackMetrics(SPEC_CHIPS, selectedIds);

  useEffect(() => {
    if (reducedMotion) {
      setScanDone(true);
      setDisplayMinutes(metrics.totalMinutes);
      return;
    }
    setScanDone(false);
    setDisplayMinutes(Math.max(4, Math.round(metrics.totalMinutes * 0.3)));

    const step1 = window.setTimeout(() => {
      setDisplayMinutes(Math.max(8, Math.round(metrics.totalMinutes * 0.65)));
    }, 320);

    const step2 = window.setTimeout(() => {
      setDisplayMinutes(metrics.totalMinutes);
      setScanDone(true);
      soundEngine.playPop(680);
    }, 680);

    return () => {
      window.clearTimeout(step1);
      window.clearTimeout(step2);
    };
  }, [cycleId, metrics.totalMinutes, reducedMotion]);

  const toggleChip = (id: string) => {
    soundEngine.playClick(560);
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least 1 active for live conveyor
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
    setCycleId((c) => c + 1);
  };

  return (
    <section
      aria-label="Revision Pack Conveyor Showcase"
      className="relative py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          className="relative overflow-hidden rounded-[28px] border p-6 sm:p-10"
          style={{
            backgroundColor: '#1E1A26',
            borderColor: 'rgba(255, 246, 234, 0.14)',
            color: '#FFF6EA',
          }}
        >
          {/* Header & Interactive Controls */}
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p
                className="font-mono text-[11px] tracking-[0.16em] uppercase"
                style={{ color: '#A89EC0' }}
              >
                PACK ASSEMBLY LINE
              </p>
              <h2
                className="mt-2.5 text-balance font-display font-semibold tracking-[-0.025em] leading-[1.08]"
                style={{ fontSize: 'clamp(1.75rem, 3.4vw, 2.75rem)' }}
              >
                Pick statements.{' '}
                <span className="font-serif italic font-normal" style={{ color: '#FF5C35' }}>
                  Compile one clean booklet.
                </span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                data-testid="conveyor-run-btn"
                data-cursor="CLICK"
                onClick={() => {
                  soundEngine.playClick(640);
                  setCycleId((c) => c + 1);
                }}
                className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-semibold transition-transform duration-150 active:scale-95 whitespace-nowrap shrink-0"
                style={{
                  backgroundColor: '#FF5C35',
                  color: '#FFFDF9',
                }}
              >
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Run Cycle</span>
              </button>

              <button
                type="button"
                data-testid="conveyor-toggle-all-btn"
                data-cursor="CLICK"
                onClick={() => {
                  soundEngine.playPop(500);
                  setSelectedIds((prev) =>
                    prev.length === SPEC_CHIPS.length
                      ? ['spec-1.4c', 'spec-4.3b']
                      : SPEC_CHIPS.map((c) => c.id),
                  );
                  setCycleId((c) => c + 1);
                }}
                className="inline-flex h-10 items-center gap-2 rounded-full border px-4 text-xs font-medium whitespace-nowrap shrink-0"
                style={{
                  borderColor: 'rgba(255, 246, 234, 0.22)',
                  color: '#FFF6EA',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                }}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Toggle Chips</span>
              </button>
            </div>
          </div>

          {/* Interactive Conveyor Track Grid */}
          <div className="mt-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            {/* Left: Interactive Spec Chip Queue */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:col-span-5">
              {SPEC_CHIPS.map((chip, idx) => {
                const active = selectedIds.includes(chip.id);
                return (
                  <motion.button
                    key={chip.id}
                    type="button"
                    data-cursor="CLICK"
                    aria-pressed={active}
                    onClick={() => toggleChip(chip.id)}
                    animate={
                      !reducedMotion && active
                        ? { x: [0, 6, 0] }
                        : { x: 0 }
                    }
                    transition={{
                      duration: 0.45,
                      delay: idx * 0.07,
                      ease: EASE_EXPO,
                    }}
                    className="flex items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition-colors"
                    style={{
                      backgroundColor: active ? '#282334' : 'rgba(255,255,255,0.02)',
                      borderColor: active
                        ? chip.accentHex
                        : 'rgba(255, 246, 234, 0.12)',
                      opacity: active ? 1 : 0.55,
                    }}
                  >
                    <div className="min-w-0">
                      <span
                        className="font-mono text-xs font-medium tabular-nums"
                        style={{ color: chip.accentHex }}
                      >
                        {chip.code} · {chip.unitCode}
                      </span>
                      <p className="mt-1 truncate text-xs font-medium text-[#FFF6EA]">
                        {chip.label}
                      </p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
                      style={{
                        borderColor: active ? chip.accentHex : 'rgba(255,246,234,0.2)',
                        backgroundColor: active ? chip.accentHex : 'transparent',
                        color: '#FFFDF9',
                      }}
                    >
                      {active && <Check className="h-3 w-3" />}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Center: SVG Bezier Track + Glowing Optical Scanner Beam */}
            <div className="relative hidden h-40 items-center justify-center lg:flex lg:col-span-3">
              <svg
                viewBox="0 0 220 150"
                className="h-full w-full overflow-visible"
                aria-hidden="true"
              >
                {[28, 60, 92, 124].map((y, idx) => {
                  const chip = SPEC_CHIPS[idx];
                  const active = chip ? selectedIds.includes(chip.id) : false;
                  return (
                    <g key={y}>
                      <path
                        d={`M 0 ${y} C 85 ${y}, 135 75, 220 75`}
                        fill="none"
                        stroke="rgba(255, 246, 234, 0.14)"
                        strokeWidth="1.5"
                      />
                      {active && (
                        <motion.path
                          key={`pulse-${cycleId}-${idx}`}
                          d={`M 0 ${y} C 85 ${y}, 135 75, 220 75`}
                          fill="none"
                          stroke={chip.accentHex}
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          initial={reducedMotion ? false : { pathLength: 0, opacity: 0.2 }}
                          animate={{ pathLength: 1, opacity: 0.95 }}
                          transition={{
                            duration: 0.58,
                            delay: idx * 0.06,
                            ease: EASE_EXPO,
                          }}
                        />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Vertical Optical Scanner Beam */}
              <motion.div
                key={`beam-${cycleId}`}
                aria-hidden="true"
                initial={reducedMotion ? false : { scaleY: 0.3, opacity: 0.4 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ duration: 0.45, ease: EASE_EXPO }}
                className="pointer-events-none absolute inset-y-2 left-1/2 w-[2px] -translate-x-1/2 rounded-full"
                style={{
                  backgroundColor: '#14B8A6',
                  boxShadow: '0 0 18px rgba(20, 184, 166, 0.65)',
                }}
              />
            </div>

            {/* Right: Compiled Pack Card + Ticking Timer + Stamp */}
            <div className="relative lg:col-span-4">
              <div
                data-testid="conveyor-compiled-card"
                className="relative rounded-2xl border p-5"
                style={{
                  backgroundColor: '#15121C',
                  borderColor: 'rgba(255, 246, 234, 0.16)',
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className="font-mono text-[10px] tracking-[0.16em] uppercase"
                      style={{ color: '#A89EC0' }}
                    >
                      COMPILED PACK
                    </p>
                    <h3 className="mt-1 font-display text-xl font-semibold">
                      {metrics.count} Spec Notes Ready
                    </h3>
                  </div>

                  {/* Spring Overshoot COMPILED ✓ Stamp */}
                  <motion.div
                    key={`stamp-${cycleId}-${scanDone}`}
                    initial={
                      reducedMotion
                        ? false
                        : { scale: 1.5, rotate: -14, opacity: 0 }
                    }
                    animate={
                      scanDone
                        ? { scale: 1, rotate: -6, opacity: 1 }
                        : { scale: 0.85, rotate: -6, opacity: 0.25 }
                    }
                    transition={SPRING_PLAYFUL}
                    className="rounded-md border px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.12em] uppercase whitespace-nowrap shrink-0"
                    style={{
                      borderColor: '#14B8A6',
                      color: '#14B8A6',
                      backgroundColor: 'rgba(20, 184, 166, 0.10)',
                    }}
                  >
                    COMPILED ✓
                  </motion.div>
                </div>

                {/* Stacked Miniature Spec Bars */}
                <div className="mt-4 space-y-2">
                  {SPEC_CHIPS.filter((c) => selectedIds.includes(c.id)).map((chip) => (
                    <div
                      key={chip.id}
                      className="flex items-center justify-between rounded-lg border px-3 py-2 text-xs"
                      style={{
                        borderColor: 'rgba(255, 246, 234, 0.08)',
                        backgroundColor: '#1E1A26',
                      }}
                    >
                      <span className="truncate font-medium">
                        {chip.code} · {chip.label}
                      </span>
                      <span
                        className="font-mono text-[11px] tabular-nums shrink-0"
                        style={{ color: chip.accentHex }}
                      >
                        {chip.minutes}m
                      </span>
                    </div>
                  ))}
                </div>

                {/* Ticking Duration + Page Metrics */}
                <div
                  className="mt-5 flex items-center justify-between border-t pt-3.5 font-mono text-xs tabular-nums"
                  style={{ borderColor: 'rgba(255, 246, 234, 0.1)' }}
                >
                  <span style={{ color: '#A89EC0' }}>
                    {metrics.estimatedPages} printable pages
                  </span>
                  <span className="text-sm font-semibold" style={{ color: '#F59E0B' }}>
                    {displayMinutes}m total
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
