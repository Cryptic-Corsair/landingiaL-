import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { PREVIEW_THEMES, type PreviewThemeId } from '../../data/ialData';
import { EASE_EXPO } from '../../lib/motion';

interface PrismSweepMachineProps {
  reducedMotion: boolean;
}

const ORDER: PreviewThemeId[] = ['dark', 'cream', 'dune', 'classic'];

export function PrismSweepMachine({ reducedMotion }: PrismSweepMachineProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry) setInView(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion || !inView) return;
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % ORDER.length);
    }, 2400);
    return () => window.clearInterval(id);
  }, [reducedMotion, inView]);

  const activeTheme = PREVIEW_THEMES[ORDER[activeIndex]];

  return (
    <div
      ref={containerRef}
      className="relative flex h-64 w-full flex-col justify-between overflow-hidden rounded-xl border p-4 select-none"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="relative z-20 flex items-center justify-between">
        <span
          className="font-mono text-[10px] tracking-[0.14em] uppercase"
          style={{ color: 'var(--ink-muted)' }}
        >
          CHROMATIC APERTURE
        </span>
        <div className="flex items-center gap-1">
          {ORDER.map((id, idx) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`Preview ${PREVIEW_THEMES[id].label} palette`}
              className="rounded px-1.5 py-0.5 font-mono text-[10px] transition-colors whitespace-nowrap shrink-0"
              style={{
                backgroundColor:
                  idx === activeIndex ? 'var(--surface-elevated)' : 'transparent',
                color: idx === activeIndex ? 'var(--ink)' : 'var(--ink-muted)',
              }}
            >
              {PREVIEW_THEMES[id].label}
            </button>
          ))}
        </div>
      </div>

      {/* Four Tonal Planes Stage with Diagonal Optical Aperture Sweep */}
      <div
        className="relative my-2 flex-1 overflow-hidden rounded-lg border transition-colors duration-500"
        style={{
          backgroundColor: activeTheme.surface,
          borderColor: activeTheme.border,
        }}
      >
        {/* Layered 4-strip chromatic aperture ribbons underneath */}
        <div className="absolute inset-0 grid grid-cols-4 opacity-90">
          {ORDER.map((id, idx) => {
            const t = PREVIEW_THEMES[id];
            const isSelected = idx === activeIndex;
            return (
              <div
                key={id}
                className="relative flex flex-col justify-end border-r p-2 transition-opacity duration-500 last:border-r-0"
                style={{
                  backgroundColor: t.surface,
                  borderColor: t.border,
                  opacity: isSelected ? 1 : 0.72,
                }}
              >
                <span
                  className="font-mono text-[9px] uppercase"
                  style={{ color: t.inkMuted }}
                >
                  {t.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Diagonal Optical Glass Shutter Beam */}
        {!reducedMotion && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-y-6 w-20"
            animate={{
              x: [`${activeIndex * 66 - 10}px`, `${activeIndex * 66 + 24}px`],
            }}
            transition={{ duration: 1.8, ease: EASE_EXPO }}
            style={{
              transform: 'skewX(-18deg)',
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%)',
            }}
          />
        )}

        {/* Active Live Typography Sample Floating Centered */}
        <div className="relative z-10 flex h-full items-center justify-center p-3">
          <div
            className="w-full max-w-[230px] rounded-md border px-3 py-2.5 transition-all duration-500"
            style={{
              backgroundColor: activeTheme.bg,
              borderColor: activeTheme.border,
              color: activeTheme.ink,
            }}
          >
            <div className="flex items-center justify-between font-mono text-[9px]">
              <span style={{ color: activeTheme.accent }}>WCH14</span>
              <span style={{ color: activeTheme.inkMuted }}>{activeTheme.label}</span>
            </div>
            <p
              className={`mt-1 text-base leading-snug ${
                activeTheme.useSerifHeading ? 'font-serif italic text-lg' : 'font-semibold tracking-tight'
              }`}
            >
              Rates &amp; Equilibria
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
