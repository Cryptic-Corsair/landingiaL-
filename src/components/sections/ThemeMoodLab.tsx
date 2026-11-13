import { useRef, useState, type MouseEvent } from 'react';
import { motion } from 'motion/react';
import { MOOD_SWATCHES, type MoodSwatchId } from '../../data/ialData';
import { EASE_EXPO, SPRING_PLAYFUL } from '../../lib/motion';
import { soundEngine } from '../../lib/sound';

interface ThemeMoodLabProps {
  reducedMotion: boolean;
}

type TypeScale = 'S' | 'M' | 'L' | 'XL';
type LayoutMode = 'gallery' | 'editorial';

const SCALE_STYLES: Record<TypeScale, { title: string; body: string; code: string }> = {
  S: { title: 'text-xl sm:text-2xl', body: 'text-xs', code: 'text-[10px]' },
  M: { title: 'text-2xl sm:text-3xl', body: 'text-sm', code: 'text-[11px]' },
  L: { title: 'text-3xl sm:text-4xl', body: 'text-sm sm:text-base', code: 'text-xs' },
  XL: { title: 'text-3xl sm:text-[2.6rem]', body: 'text-base', code: 'text-xs' },
};

const FAN_ROTATIONS = [-3.5, -1.2, 1.4, 3.6];

export function ThemeMoodLab({ reducedMotion }: ThemeMoodLabProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [activeId, setActiveId] = useState<MoodSwatchId>('cream');
  const [prevId, setPrevId] = useState<MoodSwatchId>('cream');
  const [wipeKey, setWipeKey] = useState(0);
  const [wipeOrigin, setWipeOrigin] = useState({ x: '50%', y: '40%' });

  const [scale, setScale] = useState<TypeScale>('M');
  const [mode, setMode] = useState<LayoutMode>('gallery');

  const activeSwatch = MOOD_SWATCHES.find((s) => s.id === activeId) ?? MOOD_SWATCHES[1];
  const prevSwatch = MOOD_SWATCHES.find((s) => s.id === prevId) ?? activeSwatch;
  const typography = SCALE_STYLES[scale];

  const handleSelectSwatch = (id: MoodSwatchId, e: MouseEvent<HTMLButtonElement>) => {
    if (id === activeId) {
      soundEngine.playClick(520);
      return;
    }
    const section = sectionRef.current;
    if (section) {
      const rect = section.getBoundingClientRect();
      const ox = (((e.clientX || rect.left + rect.width / 2) - rect.left) / rect.width) * 100;
      const oy = (((e.clientY || rect.top + rect.height / 2) - rect.top) / rect.height) * 100;
      setWipeOrigin({ x: `${ox.toFixed(1)}%`, y: `${oy.toFixed(1)}%` });
    }
    setPrevId(activeId);
    setActiveId(id);
    setWipeKey((k) => k + 1);
    soundEngine.playPop(id === 'midnight' ? 360 : 540);
  };

  return (
    <section
      ref={sectionRef}
      id="themes"
      data-testid="theme-mood-lab"
      data-active-swatch={activeId}
      data-scale={scale}
      data-mode={mode}
      className="relative overflow-hidden border-y py-24 sm:py-32"
      style={{
        backgroundColor: prevSwatch.bg,
        borderColor: 'var(--border)',
        color: activeSwatch.ink,
      }}
    >
      {/* Expanding Liquid-Circle Color Wipe Layer */}
      <motion.div
        key={`wipe-${wipeKey}-${activeId}`}
        aria-hidden="true"
        initial={
          reducedMotion || wipeKey === 0
            ? { clipPath: `circle(155% at ${wipeOrigin.x} ${wipeOrigin.y})` }
            : { clipPath: `circle(0% at ${wipeOrigin.x} ${wipeOrigin.y})` }
        }
        animate={{ clipPath: `circle(155% at ${wipeOrigin.x} ${wipeOrigin.y})` }}
        transition={{ duration: reducedMotion ? 0 : 0.72, ease: EASE_EXPO }}
        className="pointer-events-none absolute inset-0 z-0"
        style={{ backgroundColor: activeSwatch.bg }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Heading Row */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p
              className="font-mono text-[11px] tracking-[0.16em] uppercase"
              style={{ color: activeSwatch.inkMuted }}
            >
              MOOD &amp; THEME LAB · REACTION-CLUB-PREFS-V1
            </p>
            <h2
              className="mt-2.5 text-balance font-display font-semibold tracking-[-0.025em] leading-[1.06]"
              style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3rem)', color: activeSwatch.ink }}
            >
              Paper, cream, dune, or{' '}
              <span
                className="font-serif italic font-normal"
                style={{ color: activeSwatch.accent }}
              >
                midnight.
              </span>
            </h2>
          </div>

          <p
            className="max-w-xs text-xs leading-relaxed"
            style={{ color: activeSwatch.inkMuted }}
          >
            Click any oversized swatch to flood the studio surface and calibrate reading scale in real time.
          </p>
        </div>

        {/* 4 Fanned-Out 3D Swatch Cards */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
          {MOOD_SWATCHES.map((swatch, idx) => {
            const isActive = swatch.id === activeId;
            return (
              <motion.button
                key={swatch.id}
                type="button"
                data-testid={`mood-swatch-${swatch.id}`}
                data-cursor="CLICK"
                aria-pressed={isActive}
                onClick={(e) => handleSelectSwatch(swatch.id, e)}
                initial={false}
                animate={
                  reducedMotion
                    ? { rotate: 0, y: 0 }
                    : {
                        rotate: isActive ? 0 : FAN_ROTATIONS[idx] ?? 0,
                        y: isActive ? -8 : 0,
                      }
                }
                whileHover={
                  reducedMotion ? undefined : { y: -10, rotate: 0, scale: 1.02 }
                }
                whileTap={reducedMotion ? undefined : { scale: 0.97 }}
                transition={SPRING_PLAYFUL}
                className="group relative flex flex-col justify-between rounded-2xl border p-4 sm:p-5 text-left shadow-sm"
                style={{
                  backgroundColor: swatch.surface,
                  borderColor: isActive ? swatch.accent : swatch.border,
                  color: swatch.ink,
                  minHeight: '148px',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    aria-hidden="true"
                    className="h-7 w-7 rounded-full border shadow-inner"
                    style={{
                      backgroundColor: swatch.bg,
                      borderColor: swatch.accent,
                    }}
                  />
                  <span
                    className="font-mono text-[10px] tracking-[0.1em] uppercase tabular-nums"
                    style={{ color: isActive ? swatch.accent : swatch.inkMuted }}
                  >
                    {isActive ? 'Active' : swatch.tag}
                  </span>
                </div>

                <div className="mt-6">
                  <p
                    className={
                      swatch.useSerifHeading
                        ? 'font-serif italic text-lg leading-tight'
                        : 'font-display text-base sm:text-lg font-semibold leading-tight'
                    }
                  >
                    {swatch.name}
                  </p>
                  <p
                    className="mt-1 font-mono text-[11px] tabular-nums"
                    style={{ color: swatch.inkMuted }}
                  >
                    Accent {swatch.accent}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Live Reader Calibration Bar + Preview Stage */}
        <div
          className="mt-10 rounded-3xl border p-5 sm:p-8 shadow-sm transition-colors duration-300"
          style={{
            backgroundColor: activeSwatch.surface,
            borderColor: activeSwatch.border,
            color: activeSwatch.ink,
          }}
        >
          {/* Interactive Controls Header */}
          <div
            className="flex flex-wrap items-center justify-between gap-4 border-b pb-5"
            style={{ borderColor: activeSwatch.border }}
          >
            {/* Type Scale Segmented Pills */}
            <div className="flex items-center gap-2.5">
              <span
                className="font-mono text-[11px] uppercase tracking-[0.14em]"
                style={{ color: activeSwatch.inkMuted }}
              >
                Scale
              </span>
              <div
                role="group"
                aria-label="Reader type scale"
                className="inline-flex rounded-full border p-1"
                style={{
                  borderColor: activeSwatch.border,
                  backgroundColor: activeSwatch.bg,
                }}
              >
                {(['S', 'M', 'L', 'XL'] as const).map((size) => {
                  const selected = scale === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      data-testid={`scale-pill-${size}`}
                      data-cursor="CLICK"
                      aria-pressed={selected}
                      onClick={() => {
                        soundEngine.playClick(480 + ['S', 'M', 'L', 'XL'].indexOf(size) * 60);
                        setScale(size);
                      }}
                      className="relative rounded-full px-3 py-1 font-mono text-xs font-medium tabular-nums transition-colors whitespace-nowrap"
                      style={{
                        color: selected ? '#FFFDF9' : activeSwatch.inkMuted,
                      }}
                    >
                      {selected && (
                        <motion.span
                          layoutId="mood-scale-pill"
                          transition={SPRING_PLAYFUL}
                          className="absolute inset-0 rounded-full"
                          style={{ backgroundColor: activeSwatch.accent }}
                        />
                      )}
                      <span className="relative z-10">{size}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Layout Mode Segmented Pills */}
            <div className="flex items-center gap-2.5">
              <span
                className="font-mono text-[11px] uppercase tracking-[0.14em]"
                style={{ color: activeSwatch.inkMuted }}
              >
                Mode
              </span>
              <div
                role="group"
                aria-label="Reader layout mode"
                className="inline-flex rounded-full border p-1"
                style={{
                  borderColor: activeSwatch.border,
                  backgroundColor: activeSwatch.bg,
                }}
              >
                {(['gallery', 'editorial'] as const).map((item) => {
                  const selected = mode === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      data-testid={`mode-pill-${item}`}
                      data-cursor="CLICK"
                      aria-pressed={selected}
                      onClick={() => {
                        soundEngine.playClick(item === 'editorial' ? 620 : 520);
                        setMode(item);
                      }}
                      className="relative rounded-full px-3.5 py-1 font-mono text-xs capitalize transition-colors whitespace-nowrap"
                      style={{
                        color: selected ? '#FFFDF9' : activeSwatch.inkMuted,
                      }}
                    >
                      {selected && (
                        <motion.span
                          layoutId="mood-mode-pill"
                          transition={SPRING_PLAYFUL}
                          className="absolute inset-0 rounded-full"
                          style={{ backgroundColor: activeSwatch.ink }}
                        />
                      )}
                      <span
                        className="relative z-10"
                        style={{
                          color: selected ? activeSwatch.bg : activeSwatch.inkMuted,
                        }}
                      >
                        {item}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Live Reflowing Reader Sample Surface */}
          <motion.div
            layout
            transition={SPRING_PLAYFUL}
            className={`mt-6 ${
              mode === 'gallery'
                ? 'grid grid-cols-1 gap-4 md:grid-cols-12'
                : 'mx-auto max-w-2xl space-y-4'
            }`}
          >
            <div
              className={`rounded-2xl border p-5 sm:p-6 ${
                mode === 'gallery' ? 'md:col-span-7' : ''
              }`}
              style={{
                borderColor: activeSwatch.border,
                backgroundColor: activeSwatch.bg,
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`font-mono uppercase tracking-[0.12em] tabular-nums ${typography.code}`}
                  style={{ color: activeSwatch.accent }}
                >
                  WCH12 · UNIT 2 · SPEC 2.7a
                </span>
                <span
                  className={`font-mono tabular-nums ${typography.code}`}
                  style={{ color: activeSwatch.inkMuted }}
                >
                  {mode === 'gallery' ? '2-Col Gallery' : 'Single Editorial'} · {scale}
                </span>
              </div>

              <h3
                className={`mt-3 leading-[1.12] tracking-tight ${typography.title} ${
                  activeSwatch.useSerifHeading || mode === 'editorial'
                    ? 'font-serif italic font-normal'
                    : 'font-display font-semibold'
                }`}
              >
                Clean reading surfaces tuned for late-night and daylight study.
              </h3>

              <p
                className={`mt-3 leading-relaxed ${typography.body}`}
                style={{ color: activeSwatch.inkMuted }}
              >
                Switch between structured gallery cards for rapid topic scanning or focused editorial columns for uninterrupted specification reading.
              </p>
            </div>

            <div
              className={`grid gap-3 ${
                mode === 'gallery' ? 'md:col-span-5 grid-cols-1' : 'grid-cols-2'
              }`}
            >
              {[
                { k: 'Typography', v: `${scale} · Balanced measure`, tag: 'Ready' },
                { k: 'Surface', v: activeSwatch.name, tag: activeSwatch.tag },
              ].map((card) => (
                <div
                  key={card.k}
                  className="flex flex-col justify-between rounded-2xl border p-4"
                  style={{
                    borderColor: activeSwatch.border,
                    backgroundColor: activeSwatch.bg,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="font-mono text-[10px] uppercase tracking-[0.14em]"
                      style={{ color: activeSwatch.inkMuted }}
                    >
                      {card.k}
                    </span>
                    <span
                      className="font-mono text-[10px] tabular-nums"
                      style={{ color: activeSwatch.accent }}
                    >
                      {card.tag}
                    </span>
                  </div>
                  <p className={`mt-3 font-medium ${typography.body}`}>{card.v}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
