import { useRef } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react';
import type { SiteTheme } from '../../data/ialData';
import { KineticInterludeCanvas } from '../motion/KineticInterludeCanvas';

interface KineticInterludeProps {
  theme: SiteTheme;
  reducedMotion: boolean;
}

export function KineticInterlude({ theme, reducedMotion }: KineticInterludeProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollY, scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    stiffness: 140,
    damping: 26,
    mass: 0.6,
  });

  const topTrackX = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? ['0%', '0%'] : ['-6%', '4%'],
  );
  const bottomTrackX = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? ['0%', '0%'] : ['6%', '-4%'],
  );

  return (
    <section
      ref={sectionRef}
      aria-label="Specification scope interlude"
      className="relative flex min-h-[68vh] sm:min-h-[72vh] w-full flex-col items-center justify-center overflow-hidden border-y py-16"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--bg)',
      }}
    >
      <KineticInterludeCanvas
        theme={theme}
        velocitySmooth={smoothVelocity}
        reducedMotion={reducedMotion}
      />

      {/* Top & Bottom Opposite-Sliding Editorial Tracks */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center gap-5 px-6 text-center sm:gap-7">
        <div className="w-full overflow-hidden py-1">
          <motion.p
            style={{
              x: topTrackX,
              fontSize: 'clamp(1.85rem, 5.1vw, 4.65rem)',
              color: 'var(--ink)',
            }}
            className="text-balance font-semibold tracking-[-0.04em] leading-[1.08] sm:whitespace-nowrap"
          >
            Six units. Thirty-three topics.
          </motion.p>
        </div>

        {/* Floating Center Coordinate Label */}
        <div
          className="inline-flex items-center rounded-full border px-4 py-1.5 font-mono text-[11px] tracking-[0.18em] uppercase tabular-nums"
          style={{
            borderColor: 'var(--border-strong)',
            backgroundColor: 'var(--surface)',
            color: 'var(--ink-muted)',
          }}
        >
          WCH11 — WCH16
        </div>

        <div className="w-full overflow-hidden py-2">
          <motion.p
            style={{
              x: bottomTrackX,
              fontSize: 'clamp(1.6rem, 4.15vw, 3.85rem)',
              color: 'var(--ink)',
            }}
            className="text-balance font-serif italic font-normal tracking-[-0.02em] leading-[1.12] sm:whitespace-nowrap"
          >
            Zero clutter between you and the mark scheme.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
