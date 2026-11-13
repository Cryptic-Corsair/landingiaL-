import { useState, type MouseEvent } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { IAL_UNITS, type IalUnit } from '../../data/ialData';
import { EASE_EXPO, SPRING_PLAYFUL, VIEWPORT_ONCE } from '../../lib/motion';
import { soundEngine } from '../../lib/sound';
import { UnitEmblem } from './UnitEmblems';

interface UnitCollectorDeckProps {
  reducedMotion: boolean;
  onSelectUnit: (unitCode: IalUnit['code']) => void;
}

interface UnitCardProps {
  unit: IalUnit;
  index: number;
  reducedMotion: boolean;
  onSelect: () => void;
}

function UnitCard({ unit, index, reducedMotion, onSelect }: UnitCardProps) {
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50 });

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      rx: (0.5 - py) * 10,
      ry: (px - 0.5) * 12,
      gx: px * 100,
      gy: py * 100,
    });
  };

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT_ONCE}
      transition={{ duration: 0.45, delay: index * 0.06, ease: EASE_EXPO }}
      style={{ perspective: '900px' }}
    >
      <motion.button
        type="button"
        data-testid={`unit-card-${unit.code}`}
        data-cursor="OPEN"
        onClick={() => {
          soundEngine.playClick(560);
          onSelect();
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          setHovered(false);
          setTilt({ rx: 0, ry: 0, gx: 50, gy: 50 });
        }}
        animate={
          reducedMotion
            ? undefined
            : {
                rotateX: hovered ? tilt.rx : 0,
                rotateY: hovered ? tilt.ry : 0,
                y: hovered ? -4 : 0,
              }
        }
        transition={SPRING_PLAYFUL}
        className="group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border p-6 text-left shadow-sm"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: hovered ? unit.accentHex : 'var(--border)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Top Pigment Corner Bar */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1"
          style={{ backgroundColor: unit.accentHex }}
        />

        {/* Soft Radial Specular Gloss Tracking Pointer */}
        {!reducedMotion && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 transition-opacity duration-200"
            style={{
              opacity: hovered ? 1 : 0,
              background: `radial-gradient(240px circle at ${tilt.gx}% ${tilt.gy}%, rgba(255, 255, 255, 0.14), transparent 70%)`,
            }}
          />
        )}

        {/* Top Emblem + Hover Stamp Row */}
        <div className="relative z-10 flex items-start justify-between gap-4 pt-1">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl border"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--border)',
            }}
          >
            <UnitEmblem
              code={unit.code}
              color={unit.accentHex}
              hovered={hovered}
              reducedMotion={reducedMotion}
            />
          </div>

          <span
            className="rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.12em] uppercase transition-all duration-200"
            style={{
              borderColor: hovered ? unit.accentHex : 'var(--border)',
              color: hovered ? unit.accentHex : 'var(--ink-muted)',
              backgroundColor: 'var(--bg)',
              transform: hovered && !reducedMotion ? 'rotate(-4deg)' : 'rotate(0deg)',
            }}
          >
            {hovered ? 'OPEN →' : unit.levelTag}
          </span>
        </div>

        {/* Unit Code & Title */}
        <div className="relative z-10 mt-6">
          <p
            className="font-mono text-xs font-medium tracking-[0.06em]"
            style={{ color: unit.accentHex }}
          >
            {unit.shortLabel} · {unit.code}
          </p>
          <h3 className="mt-2 font-display text-lg sm:text-xl font-semibold leading-[1.2] tracking-tight">
            {unit.title}
          </h3>
          <p
            className="mt-2.5 text-xs leading-relaxed"
            style={{ color: 'var(--ink-muted)' }}
          >
            {unit.scope}
          </p>
        </div>

        {/* Crisp Tabular Metadata Footer */}
        <div
          className="relative z-10 mt-6 flex items-center justify-between border-t pt-4 font-mono text-xs tabular-nums"
          style={{ borderColor: 'var(--border)', color: 'var(--ink-muted)' }}
        >
          <span>
            {unit.topicsCount} topics · {unit.minutes} min
          </span>
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            style={{ color: hovered ? unit.accentHex : 'var(--ink-muted)' }}
            aria-hidden="true"
          />
        </div>
      </motion.button>
    </motion.div>
  );
}

export function UnitCollectorDeck({
  reducedMotion,
  onSelectUnit,
}: UnitCollectorDeckProps) {
  return (
    <section
      id="units"
      aria-label="WCH11 to WCH16 Unit Collector Deck"
      className="relative border-t py-20 sm:py-28"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p
              className="font-mono text-[11px] tracking-[0.16em] uppercase"
              style={{ color: 'var(--ink-muted)' }}
            >
              COMPLETE COLLECTOR DECK · WCH11–WCH16
            </p>
            <h2
              className="mt-2.5 text-balance font-display font-semibold tracking-[-0.025em] leading-[1.06]"
              style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3rem)' }}
            >
              Six units, keyed in{' '}
              <span className="font-serif italic font-normal" style={{ color: 'var(--coral)' }}>
                tactile pigment.
              </span>
            </h2>
          </div>

          <p className="font-mono text-xs tabular-nums" style={{ color: 'var(--ink-muted)' }}>
            33 Topics · 756 Total Minutes
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {IAL_UNITS.map((unit, index) => (
            <UnitCard
              key={unit.code}
              unit={unit}
              index={index}
              reducedMotion={reducedMotion}
              onSelect={() => onSelectUnit(unit.code)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
