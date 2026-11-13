import { motion } from 'motion/react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import type { SiteTheme } from '../../data/ialData';
import { EASE_EXPO, SPRING_PLAYFUL } from '../../lib/motion';
import { soundEngine } from '../../lib/sound';
import { HeroPhysicsCanvas } from './HeroPhysicsCanvas';

interface HeroPlaygroundProps {
  theme: SiteTheme;
  reducedMotion: boolean;
  onOpenBench: () => void;
  onPlayBelow: () => void;
}

export function HeroPlayground({
  theme,
  reducedMotion,
  onOpenBench,
  onPlayBelow,
}: HeroPlaygroundProps) {
  return (
    <section
      id="top"
      className="relative flex min-h-[94vh] w-full flex-col items-center justify-center overflow-hidden pt-14 pb-20"
    >
      <div className="pointer-events-none absolute inset-0 opacity-60 sm:opacity-100">
        <HeroPhysicsCanvas theme={theme} reducedMotion={reducedMotion} />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-5 sm:px-8 text-center">
        {/* Tilted Physical Sticker Pill */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 10, rotate: -4 }}
          animate={{ opacity: 1, y: 0, rotate: -2 }}
          transition={SPRING_PLAYFUL}
          className="mb-7 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[11px] font-medium tracking-[0.14em] uppercase shadow-sm"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border-strong)',
            color: 'var(--ink)',
          }}
        >
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: 'var(--coral)' }}
          />
          <span>EDEXCEL IAL · WCH11–WCH16</span>
        </motion.div>

        {/* Expressive Fredoka + Instrument Serif Italic Contrast Headline */}
        <motion.h1
          initial={reducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: EASE_EXPO }}
          className="text-balance font-display font-semibold tracking-[-0.028em] leading-[1.02]"
          style={{
            fontSize: 'clamp(2.65rem, 6.4vw, 5.25rem)',
            color: 'var(--ink)',
          }}
        >
          Revision notes, made{' '}
          <span
            className="font-serif italic font-normal tracking-[-0.02em]"
            style={{ color: 'var(--coral)' }}
          >
            delightfully
          </span>{' '}
          clear.
        </motion.h1>

        {/* Crisp 1-line Subtitle */}
        <motion.p
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE_EXPO }}
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed sm:text-lg"
          style={{ color: 'var(--ink-muted)' }}
        >
          Six units, thirty-three topics, and custom revision packs—crafted to feel effortless.
        </motion.p>

        {/* Tactile Dual CTAs */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18, ease: EASE_EXPO }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3.5"
        >
          <motion.button
            type="button"
            data-cursor="OPEN"
            whileHover={reducedMotion ? undefined : { scale: 1.03, y: -2 }}
            whileTap={reducedMotion ? undefined : { scale: 0.96, y: 1 }}
            transition={SPRING_PLAYFUL}
            onClick={() => {
              soundEngine.playChime();
              onOpenBench();
            }}
            className="group inline-flex h-12 items-center gap-2 rounded-full px-7 text-sm font-semibold shadow-sm whitespace-nowrap shrink-0"
            style={{
              backgroundColor: 'var(--coral)',
              color: '#FFFDF9',
            }}
          >
            <span>Open the Bench</span>
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </motion.button>

          <motion.button
            type="button"
            data-cursor="PLAY"
            whileHover={reducedMotion ? undefined : { scale: 1.02, y: -1 }}
            whileTap={reducedMotion ? undefined : { scale: 0.97 }}
            transition={SPRING_PLAYFUL}
            onClick={() => {
              soundEngine.playClick(500);
              onPlayBelow();
            }}
            className="inline-flex h-12 items-center gap-2 rounded-full border px-6 text-sm font-medium whitespace-nowrap shrink-0"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border-strong)',
              color: 'var(--ink)',
            }}
          >
            <span>Play Below</span>
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </motion.button>
        </motion.div>

        {/* Clean Unboxed Typographic Spec Strip */}
        <p
          className="mt-8 font-mono text-xs tracking-[0.04em] tabular-nums"
          style={{ color: 'var(--ink-muted)' }}
        >
          06 Units · 33 Topics · ~13 Hours · 30 Worked Examples
        </p>
      </div>
    </section>
  );
}
