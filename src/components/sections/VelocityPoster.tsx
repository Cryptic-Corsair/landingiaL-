import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, useVelocity } from 'motion/react';

interface VelocityPosterProps {
  reducedMotion: boolean;
}

const MARQUEE_TOKENS = ['WCH11', 'WCH12', 'WCH13', 'WCH14', 'WCH15', 'WCH16'] as const;

export function VelocityPoster({ reducedMotion }: VelocityPosterProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress, scrollY } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    stiffness: 180,
    damping: 32,
  });

  const track1X = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? ['0%', '0%'] : ['4%', '-8%'],
  );
  const track2X = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? ['0%', '0%'] : ['-6%', '6%'],
  );
  const skewX = useTransform(
    smoothVelocity,
    [-2200, 0, 2200],
    reducedMotion ? [0, 0, 0] : [-4, 0, 4],
  );
  const orbitRotate = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? [0, 0] : [0, 45],
  );

  return (
    <section
      ref={sectionRef}
      aria-label="Specification Velocity Poster"
      className="relative flex min-h-[62vh] sm:min-h-[66vh] w-full flex-col justify-center overflow-hidden py-20"
      style={{
        backgroundColor: '#1E1A26',
        color: '#FFF6EA',
      }}
    >
      {/* Floating Parallax Geometric Rings */}
      <motion.svg
        aria-hidden="true"
        viewBox="0 0 180 180"
        style={{ rotate: orbitRotate }}
        className="pointer-events-none absolute -left-10 top-10 h-44 w-44 opacity-20"
      >
        <circle
          cx="90"
          cy="90"
          r="76"
          fill="none"
          stroke="#FF5C35"
          strokeWidth="1.2"
          strokeDasharray="6 8"
        />
        <circle cx="90" cy="14" r="4" fill="#14B8A6" />
      </motion.svg>

      <motion.svg
        aria-hidden="true"
        viewBox="0 0 160 160"
        style={{ rotate: orbitRotate }}
        className="pointer-events-none absolute -right-8 bottom-12 h-40 w-40 opacity-20"
      >
        <circle cx="80" cy="80" r="62" fill="none" stroke="#8B5CF6" strokeWidth="1.2" />
        <circle cx="80" cy="142" r="4.5" fill="#F59E0B" />
      </motion.svg>

      {/* Opposing Scroll-Scrubbed & Velocity-Skewed Display Tracks */}
      <div className="relative z-10 mx-auto w-full max-w-6xl space-y-3 px-4 sm:px-6 lg:px-8">
        <p
          className="font-mono text-[11px] tracking-[0.18em] uppercase"
          style={{ color: '#A89EC0' }}
        >
          PEARSON EDEXCEL IAL SPECIFICATION · 2018
        </p>

        <motion.div
          style={{ x: track1X, skewX }}
          className="py-2 will-change-transform"
        >
          <p
            className="font-display font-semibold tracking-[-0.03em] leading-[1.12] text-[#FFF6EA]"
            style={{ fontSize: 'clamp(2.15rem, 5.4vw, 4.4rem)' }}
          >
            Six units. Thirty-three topics.
          </p>
        </motion.div>

        <motion.div
          style={{ x: track2X, skewX }}
          className="py-2 will-change-transform"
        >
          <p
            className="font-serif italic font-normal tracking-[-0.02em] leading-[1.14]"
            style={{
              fontSize: 'clamp(2.25rem, 5.6vw, 4.65rem)',
              color: '#FF5C35',
            }}
          >
            Everything in specification order.
          </p>
        </motion.div>
      </div>

      {/* Continuous Tilted Marquee Ribbon (Slows Gracefully on Hover) */}
      <div
        className="group relative z-10 mt-14 w-[108%] -ml-[4%] -rotate-1 border-y py-3 overflow-hidden"
        style={{
          borderColor: 'rgba(255, 246, 234, 0.14)',
          backgroundColor: '#15121C',
        }}
      >
        <div className="animate-marquee-ribbon flex w-max items-center gap-8 font-mono text-xs sm:text-sm font-medium tracking-[0.16em] uppercase tabular-nums">
          {[...MARQUEE_TOKENS, ...MARQUEE_TOKENS, ...MARQUEE_TOKENS, ...MARQUEE_TOKENS].map(
            (token, idx) => (
              <span key={`${token}-${idx}`} className="inline-flex items-center gap-8">
                <span className="text-[#FFF6EA]">{token}</span>
                <span aria-hidden="true" style={{ color: '#14B8A6' }}>
                  ✦
                </span>
              </span>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
