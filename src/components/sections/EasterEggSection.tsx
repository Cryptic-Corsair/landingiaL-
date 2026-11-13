import { useState } from 'react';
import { motion } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import { SPRING_PLAYFUL } from '../../lib/motion';
import { soundEngine } from '../../lib/sound';

interface EasterEggSectionProps {
  reducedMotion: boolean;
}

const BUTTON_COPY = [
  'Do not press',
  'Careful...',
  'Getting warmer...',
  'Critical mass!',
  'Reaction complete.',
] as const;

const SPARK_VECTORS = [
  { angle: 0, dist: 92, color: '#FF5C35', size: 7 },
  { angle: 36, dist: 108, color: '#8B5CF6', size: 6 },
  { angle: 72, dist: 96, color: '#14B8A6', size: 8 },
  { angle: 108, dist: 104, color: '#F59E0B', size: 6 },
  { angle: 144, dist: 90, color: '#EC4899', size: 7 },
  { angle: 180, dist: 106, color: '#3B82F6', size: 6 },
  { angle: 216, dist: 94, color: '#FF5C35', size: 8 },
  { angle: 252, dist: 102, color: '#14B8A6', size: 6 },
  { angle: 288, dist: 96, color: '#8B5CF6', size: 7 },
  { angle: 324, dist: 108, color: '#F59E0B', size: 6 },
] as const;

export function EasterEggSection({ reducedMotion }: EasterEggSectionProps) {
  const [pressCount, setPressCount] = useState(0);
  const completed = pressCount >= 4;

  const handlePress = () => {
    if (completed) return;
    const next = pressCount + 1;
    setPressCount(next);

    if (next === 1) soundEngine.playPop(460);
    if (next === 2) soundEngine.playPop(600);
    if (next === 3) soundEngine.playPop(780);
    if (next >= 4) soundEngine.playBurst();
  };

  const handleReset = () => {
    soundEngine.playClick(420);
    setPressCount(0);
  };

  return (
    <section
      aria-label="Playful Easter Egg Micro-Moment"
      className="relative border-t py-20 sm:py-24"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center">
        <motion.div
          animate={
            reducedMotion
              ? undefined
              : pressCount === 1
                ? { rotate: [-1.5, 1.5, 0] }
                : pressCount === 2
                  ? { rotate: [-2.5, 2.5, -1.5, 0] }
                  : pressCount === 3
                    ? { x: [-5, 5, -4, 4, 0] }
                    : { x: 0, rotate: 0 }
          }
          transition={{ duration: 0.36 }}
          className="relative inline-flex flex-col items-center justify-center rounded-3xl border px-8 py-12 sm:px-14 w-full"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: completed ? 'var(--teal)' : 'var(--border)',
          }}
        >
          <p
            className="font-mono text-[11px] tracking-[0.16em] uppercase tabular-nums"
            style={{ color: 'var(--ink-muted)' }}
          >
            STUDIO CALIBRATION SWITCH · {pressCount} / 4
          </p>

          <div className="relative mt-7 flex items-center justify-center">
            {/* Expanding SVG Burst Ring + Geometric Sparks on Click 4 */}
            {completed && !reducedMotion && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
              >
                <motion.svg
                  width="240"
                  height="240"
                  viewBox="0 0 240 240"
                  className="overflow-visible"
                >
                  <motion.circle
                    cx="120"
                    cy="120"
                    r="38"
                    fill="none"
                    stroke="#14B8A6"
                    strokeWidth="2.4"
                    initial={{ scale: 0.7, opacity: 0.9 }}
                    animate={{ scale: 2.3, opacity: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    style={{ transformOrigin: '120px 120px' }}
                  />
                  {SPARK_VECTORS.map((spark, idx) => {
                    const rad = (spark.angle * Math.PI) / 180;
                    const tx = Math.cos(rad) * spark.dist;
                    const ty = Math.sin(rad) * spark.dist;
                    return (
                      <motion.circle
                        key={idx}
                        cx="120"
                        cy="120"
                        r={spark.size / 2}
                        fill={spark.color}
                        initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                        animate={{ x: tx, y: ty, scale: 0.2, opacity: 0 }}
                        transition={{ duration: 0.65, ease: 'easeOut' }}
                      />
                    );
                  })}
                </motion.svg>
              </div>
            )}

            {/* Pulsing Aura Ring on Critical States */}
            {pressCount >= 2 && !completed && !reducedMotion && (
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute -inset-2 rounded-full border-2"
                style={{ borderColor: 'var(--coral)' }}
                animate={{ scale: [1, 1.12, 1], opacity: [0.55, 0.15, 0.55] }}
                transition={{
                  repeat: Infinity,
                  duration: pressCount === 3 ? 0.55 : 1.1,
                }}
              />
            )}

            <motion.button
              type="button"
              data-testid="easter-egg-btn"
              data-press-count={pressCount}
              data-cursor="CLICK"
              onClick={handlePress}
              whileHover={reducedMotion || completed ? undefined : { scale: 1.04, y: -2 }}
              whileTap={reducedMotion || completed ? undefined : { scale: 0.94, y: 2 }}
              transition={SPRING_PLAYFUL}
              className="relative z-10 inline-flex h-14 min-w-[210px] items-center justify-center rounded-full border-b-4 px-8 font-display text-base font-semibold tracking-tight shadow-sm transition-colors"
              style={{
                backgroundColor: completed ? 'var(--teal)' : 'var(--coral)',
                borderColor: completed ? '#0F766E' : '#C93A18',
                color: completed ? '#0E1F1D' : '#FFFDF9',
              }}
            >
              {BUTTON_COPY[Math.min(pressCount, 4)]}
            </motion.button>
          </div>

          <div className="mt-6 flex h-8 items-center justify-center">
            {completed ? (
              <button
                type="button"
                data-testid="easter-egg-reset-btn"
                data-cursor="CLICK"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors hover:opacity-80"
                style={{
                  borderColor: 'var(--border-strong)',
                  color: 'var(--ink-muted)',
                }}
              >
                <RotateCcw className="h-3 w-3" aria-hidden="true" />
                <span>Reset</span>
              </button>
            ) : (
              <p className="font-mono text-xs" style={{ color: 'var(--ink-muted)' }}>
                {pressCount === 0
                  ? 'Zero chemistry equations harmed if clicked.'
                  : `Escalation level ${pressCount} of 4`}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
