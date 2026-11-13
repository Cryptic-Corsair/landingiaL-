import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Shuffle, Sparkles } from 'lucide-react';
import {
  HERO_PREVIEW_TABS,
  PREVIEW_THEMES,
  type PreviewThemeId,
} from '../../data/ialData';
import { EASE_EXPO, SPRING_PLAYFUL } from '../../lib/motion';
import { soundEngine } from '../../lib/sound';

interface TactileTabletProps {
  reducedMotion: boolean;
}

const SWATCH_ORDER: PreviewThemeId[] = ['cream', 'plum', 'dune', 'classic'];

const SCATTER_OFFSETS = [
  { x: -10, y: -6, rotate: -3.2 },
  { x: 12, y: 4, rotate: 2.8 },
  { x: -6, y: 10, rotate: 3.6 },
];

export function TactileTablet({ reducedMotion }: TactileTabletProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [tabletThemeId, setTabletThemeId] = useState<PreviewThemeId>('cream');
  const [activeTabId, setActiveTabId] = useState<'definitions' | 'equations' | 'examples'>(
    'definitions',
  );
  const [scattered, setScattered] = useState(false);

  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ['start end', 'center center'],
  });

  const rotateX = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? [0, 0] : [8, 0],
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? [1, 1] : [0.96, 1],
  );

  const tokens = PREVIEW_THEMES[tabletThemeId];
  const activeTab =
    HERO_PREVIEW_TABS.find((tab) => tab.id === activeTabId) ?? HERO_PREVIEW_TABS[0];

  return (
    <section
      aria-label="Interactive Tactile Tablet Preview"
      className="relative -mt-8 pb-20 sm:pb-28"
    >
      <div
        ref={stageRef}
        className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8"
        style={{ perspective: '1300px' }}
      >
        <motion.div
          data-testid="tactile-tablet"
          data-tablet-theme={tabletThemeId}
          data-scattered={String(scattered)}
          style={{
            rotateX,
            scale,
            transformOrigin: 'center top',
            backgroundColor: tokens.surface,
            color: tokens.ink,
            borderColor: tokens.border,
          }}
          className="rounded-[26px] border-2 p-2.5 sm:p-3.5 shadow-[0_24px_60px_rgba(21,18,28,0.12)] transition-colors duration-300"
        >
          <div
            className="overflow-hidden rounded-[18px] border"
            style={{
              borderColor: tokens.border,
              backgroundColor: tokens.bg,
            }}
          >
            {/* Chunky Top Hardware Bezel */}
            <div
              className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6"
              style={{
                borderColor: tokens.border,
                backgroundColor: tokens.surfaceElevated,
              }}
            >
              {/* Left Swatch Dots */}
              <div
                role="group"
                aria-label="Tablet preview theme swatches"
                className="flex items-center gap-1.5"
              >
                {SWATCH_ORDER.map((id) => {
                  const t = PREVIEW_THEMES[id];
                  const active = tabletThemeId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      data-cursor="CLICK"
                      aria-label={`Tablet ${t.label} swatch`}
                      aria-pressed={active}
                      onClick={() => {
                        soundEngine.playPop(520);
                        setTabletThemeId(id);
                      }}
                      className="inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 font-mono text-[11px] transition-transform duration-150 hover:-translate-y-0.5 whitespace-nowrap shrink-0"
                      style={{
                        backgroundColor: active ? tokens.surface : 'transparent',
                        borderColor: active ? tokens.accent : tokens.border,
                        color: active ? tokens.ink : tokens.inkMuted,
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 rounded-full border"
                        style={{
                          backgroundColor: t.bg,
                          borderColor: t.accent,
                        }}
                      />
                      <span className="hidden sm:inline">{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Center Mono Readout */}
              <div className="hidden md:flex items-center gap-2 font-mono text-[11px]" style={{ color: tokens.inkMuted }}>
                <span>{activeTab.commandQuery}</span>
              </div>

              {/* Right Scatter / Tidy Toy Switch */}
              <button
                type="button"
                data-testid="tablet-scatter-btn"
                data-cursor="CLICK"
                aria-pressed={scattered}
                onClick={() => {
                  soundEngine.playPop(scattered ? 640 : 380);
                  setScattered((prev) => !prev);
                }}
                className="inline-flex h-8 items-center gap-1.5 rounded-full border px-3.5 font-mono text-xs font-medium transition-transform duration-150 active:scale-95 whitespace-nowrap shrink-0"
                style={{
                  backgroundColor: scattered ? tokens.accent : tokens.surface,
                  borderColor: scattered ? tokens.accent : tokens.border,
                  color: scattered ? '#FFFDF9' : tokens.ink,
                }}
              >
                {scattered ? (
                  <>
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Tidy</span>
                  </>
                ) : (
                  <>
                    <Shuffle className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Scatter</span>
                  </>
                )}
              </button>
            </div>

            {/* Tablet Interior Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12">
              {/* Left Tabs Rail */}
              <div
                className="border-b p-4 md:col-span-4 md:border-r md:border-b-0 sm:p-5"
                style={{
                  borderColor: tokens.border,
                  backgroundColor: tokens.bg,
                }}
              >
                <p
                  className="mb-3 font-mono text-[10px] tracking-[0.14em] uppercase"
                  style={{ color: tokens.inkMuted }}
                >
                  Study Module
                </p>
                <div className="flex flex-row gap-2 overflow-x-auto md:flex-col no-scrollbar">
                  {HERO_PREVIEW_TABS.map((tab, idx) => {
                    const isActive = tab.id === activeTabId;
                    return (
                      <motion.button
                        key={tab.id}
                        type="button"
                        data-cursor="CLICK"
                        animate={
                          scattered && !reducedMotion
                            ? {
                                rotate: idx % 2 === 0 ? -2.4 : 2.2,
                                x: idx % 2 === 0 ? -4 : 4,
                              }
                            : { rotate: 0, x: 0 }
                        }
                        transition={SPRING_PLAYFUL}
                        onClick={() => {
                          soundEngine.playClick(520 + idx * 60);
                          setActiveTabId(tab.id);
                        }}
                        className="flex w-auto md:w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition-colors whitespace-nowrap shrink-0"
                        style={{
                          borderColor: isActive ? tokens.accent : tokens.border,
                          backgroundColor: isActive
                            ? tokens.surfaceElevated
                            : tokens.surface,
                          color: isActive ? tokens.ink : tokens.inkMuted,
                        }}
                      >
                        <span className="font-mono text-xs font-medium tabular-nums">
                          {tab.label}
                        </span>
                        <span
                          aria-hidden="true"
                          className="ml-3 hidden md:inline font-mono text-[10px]"
                          style={{ color: isActive ? tokens.accent : tokens.inkMuted }}
                        >
                          {isActive ? 'Active' : 'View'}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Right Content Canvas with Magnetic Scatter/Tidy Panels */}
              <div
                className="p-5 sm:p-7 md:col-span-8"
                style={{ backgroundColor: tokens.surface }}
              >
                <motion.div
                  key={`${activeTab.id}-${tabletThemeId}`}
                  initial={reducedMotion ? false : { opacity: 0.4, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, ease: EASE_EXPO }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className="font-mono text-xs font-medium tabular-nums"
                      style={{ color: tokens.accent }}
                    >
                      {activeTab.unitLabel}
                    </span>
                    <span
                      className="font-mono text-[11px] tabular-nums"
                      style={{ color: tokens.inkMuted }}
                    >
                      {activeTab.meta}
                    </span>
                  </div>

                  <h2
                    className={`mt-2.5 text-2xl sm:text-3xl tracking-tight ${
                      tokens.useSerifHeading
                        ? 'font-serif italic font-normal'
                        : 'font-display font-semibold'
                    }`}
                  >
                    {activeTab.title}
                  </h2>

                  <div className="mt-5 space-y-3">
                    {activeTab.blocks.map((block, idx) => {
                      const offset = SCATTER_OFFSETS[idx % SCATTER_OFFSETS.length];
                      return (
                        <motion.div
                          key={block.key}
                          animate={
                            scattered && !reducedMotion
                              ? {
                                  x: offset.x,
                                  y: offset.y,
                                  rotate: offset.rotate,
                                }
                              : { x: 0, y: 0, rotate: 0 }
                          }
                          transition={SPRING_PLAYFUL}
                          className="flex items-center justify-between gap-4 rounded-xl border px-4 py-3"
                          style={{
                            borderColor: tokens.border,
                            backgroundColor: tokens.bg,
                          }}
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-semibold">{block.key}</p>
                            <p
                              className="mt-0.5 truncate text-xs"
                              style={{ color: tokens.inkMuted }}
                            >
                              {block.detail}
                            </p>
                          </div>
                          <span
                            className="font-mono text-[11px] font-medium tabular-nums shrink-0"
                            style={{ color: tokens.accent }}
                          >
                            {block.metric}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
