import { useState, type MouseEvent } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { IAL_UNITS, type IalUnit } from '../../data/ialData';
import { EASE_EXPO, VIEWPORT_ONCE } from '../../lib/motion';
import { UnitEmblem } from '../motion/UnitEmblems';

interface UnitMatrixProps {
  reducedMotion: boolean;
  onSelectUnit: (unitCode: IalUnit['code']) => void;
}

export function UnitMatrix({ reducedMotion, onSelectUnit }: UnitMatrixProps) {
  const [hoveredCode, setHoveredCode] = useState<IalUnit['code'] | null>(null);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, active: false });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    setSpotlight({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      active: true,
    });
  };

  const handleMouseLeave = () => {
    setSpotlight((prev) => ({ ...prev, active: false }));
  };

  return (
    <section
      id="units"
      className="relative py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <p
            className="font-mono text-[11px] tracking-[0.16em] uppercase"
            style={{ color: 'var(--ink-muted)' }}
          >
            SYLLABUS COVERAGE
          </p>
          <h2
            className="mt-2.5 text-balance font-semibold tracking-[-0.03em] leading-[1.08]"
            style={{ fontSize: 'clamp(1.75rem, 3.4vw, 2.75rem)' }}
          >
            Every unit, structured in{' '}
            <span className="font-serif italic font-normal">
              specification order.
            </span>
          </h2>
        </div>

        {/* 2x3 Hairline Studio Matrix with Cursor-Tracking Metallic Spotlight */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: 0.55, ease: EASE_EXPO }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative mt-10 overflow-hidden rounded-2xl border"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--border)',
          }}
        >
          {/* Subtle Metallic Cursor Spotlight Overlay */}
          {spotlight.active && !reducedMotion && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
              style={{
                background: `radial-gradient(520px circle at ${spotlight.x}% ${spotlight.y}%, var(--spotlight), transparent 60%)`,
              }}
            />
          )}

          <div className="grid grid-cols-1 gap-px md:grid-cols-2 lg:grid-cols-3">
            {IAL_UNITS.map((unit) => {
              const active = hoveredCode === unit.code;
              return (
                <button
                  key={unit.code}
                  type="button"
                  onClick={() => onSelectUnit(unit.code)}
                  onMouseEnter={() => setHoveredCode(unit.code)}
                  onMouseLeave={() => setHoveredCode(null)}
                  onFocus={() => setHoveredCode(unit.code)}
                  onBlur={() => setHoveredCode(null)}
                  className="group relative flex flex-col justify-between p-6 text-left transition-colors duration-200 sm:p-7"
                  style={{
                    backgroundColor: active
                      ? 'var(--surface-elevated)'
                      : 'var(--surface)',
                    color: 'var(--ink)',
                  }}
                >
                  <div>
                    {/* Top Row: Code + Level Metadata on Left, Procedural SVG Emblem on Right */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span
                          className="block font-mono text-xs font-semibold tracking-[0.12em] tabular-nums"
                          style={{ color: active ? 'var(--accent)' : 'var(--ink)' }}
                        >
                          {unit.code}
                        </span>
                        <span
                          className="block font-mono text-[11px]"
                          style={{ color: 'var(--ink-muted)' }}
                        >
                          {unit.shortLabel}
                        </span>
                      </div>

                      <UnitEmblem
                        code={unit.code}
                        active={active}
                        reducedMotion={reducedMotion}
                      />
                    </div>

                    {/* Middle: Concise Unit Title + Scope */}
                    <h3 className="mt-6 text-base font-semibold leading-snug tracking-tight sm:text-lg">
                      {unit.title}
                    </h3>
                    <p
                      className="mt-2 text-sm leading-relaxed"
                      style={{ color: 'var(--ink-muted)' }}
                    >
                      {unit.scope}
                    </p>
                  </div>

                  {/* Bottom Row: Tabular-Nums Metadata + Animated Arrow */}
                  <div
                    className="mt-7 flex items-center justify-between border-t pt-4 font-mono text-xs tabular-nums"
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--ink-muted)',
                    }}
                  >
                    <span>
                      {unit.topicsCount} topics · {unit.minutes} min
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
                      style={{ color: active ? 'var(--accent)' : 'var(--ink)' }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
