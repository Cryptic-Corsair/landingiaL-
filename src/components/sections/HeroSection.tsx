import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useScroll,
  useTransform,
} from 'motion/react';
import { ArrowRight, Search } from 'lucide-react';
import {
  GLOBAL_METRICS,
  HERO_PREVIEW_TABS,
  PREVIEW_THEMES,
  type PreviewThemeId,
  type SiteTheme,
} from '../../data/ialData';
import { EASE_EXPO, SPRING_SNAPPY } from '../../lib/motion';
import { HeroShaderCanvas } from '../motion/HeroShaderCanvas';

interface HeroSectionProps {
  theme: SiteTheme;
  reducedMotion: boolean;
  onStartRevising: () => void;
  onBuildPack: () => void;
}

const THEME_DOT_ORDER: PreviewThemeId[] = ['dark', 'cream', 'dune', 'classic'];

export function HeroSection({
  theme,
  reducedMotion,
  onStartRevising,
  onBuildPack,
}: HeroSectionProps) {
  const heroRef = useRef<HTMLElement | null>(null);
  const [previewThemeId, setPreviewThemeId] = useState<PreviewThemeId>('dark');
  const [activeTabId, setActiveTabId] = useState<
    'definitions' | 'equations' | 'worked' | 'examples'
  >('definitions');
  const [userInteracted, setUserInteracted] = useState(false);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const rotateX = useTransform(
    scrollYProgress,
    [0, 0.45],
    reducedMotion ? [0, 0] : [9, 0],
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 0.45],
    reducedMotion ? [1, 1] : [0.95, 1],
  );
  const stageY = useTransform(
    scrollYProgress,
    [0, 0.45],
    reducedMotion ? [0, 0] : [14, 0],
  );

  // Sync default preview window starting palette smoothly if user toggles global navbar theme before interacting
  useEffect(() => {
    if (!userInteracted) {
      setPreviewThemeId(theme === 'cream' ? 'cream' : 'dark');
    }
  }, [theme, userInteracted]);

  // Gentle auto-cycle across preview tabs until the visitor interacts directly
  useEffect(() => {
    if (reducedMotion || userInteracted) return;
    const ids: Array<'definitions' | 'equations' | 'worked' | 'examples'> = [
      'definitions',
      'equations',
      'worked',
      'examples',
    ];
    const id = window.setInterval(() => {
      setActiveTabId((prev) => {
        const nextIndex = (ids.indexOf(prev) + 1) % ids.length;
        return ids[nextIndex];
      });
    }, 3800);
    return () => window.clearInterval(id);
  }, [reducedMotion, userInteracted]);

  const previewTokens = PREVIEW_THEMES[previewThemeId];
  const activeTab =
    HERO_PREVIEW_TABS.find((tab) => tab.id === activeTabId) ?? HERO_PREVIEW_TABS[0];

  return (
    <section
      id="top"
      ref={heroRef}
      className="relative overflow-hidden pt-16 pb-16 sm:pt-24 sm:pb-24"
    >
      {/* Full-bleed GLSL Caustic Refraction & Architectural Grid Background */}
      <HeroShaderCanvas theme={theme} reducedMotion={reducedMotion} />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Upper Hero Typography */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 border-b pb-1.5" style={{ borderColor: 'var(--border-strong)' }}>
            <span
              className="font-mono text-[11px] tracking-[0.18em] uppercase tabular-nums"
              style={{ color: 'var(--ink-muted)' }}
            >
              EDEXCEL IAL · WCH11–WCH16
            </span>
          </div>

          <h1
            className="text-balance font-semibold tracking-[-0.035em] leading-[1.03]"
            style={{
              fontSize: 'clamp(2.5rem, 5.6vw, 4.75rem)',
              color: 'var(--ink)',
            }}
          >
            <span className="block overflow-hidden">
              <motion.span
                initial={reducedMotion ? false : { y: '100%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: 0.65, ease: EASE_EXPO }}
                className="block"
              >
                Revision notes, built
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span
                initial={reducedMotion ? false : { y: '100%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: 0.65, delay: 0.08, ease: EASE_EXPO }}
                className="block"
              >
                like{' '}
                <span className="font-serif italic font-normal tracking-[-0.02em]">
                  software.
                </span>
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease: EASE_EXPO }}
            className="mx-auto mt-5 max-w-2xl text-base leading-relaxed sm:text-lg"
            style={{ color: 'var(--ink-muted)' }}
          >
            Six units. Thirty-three topics. Custom revision packs—engineered for
            uninterrupted focus.
          </motion.p>

          {/* Dual Clean CTAs */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22, ease: EASE_EXPO }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <button
              type="button"
              onClick={onStartRevising}
              className="group inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold transition-transform duration-200 hover:-translate-y-px whitespace-nowrap shrink-0"
              style={{
                backgroundColor: 'var(--ink)',
                color: 'var(--bg)',
              }}
            >
              <span>Start Revising</span>
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </button>

            <button
              type="button"
              onClick={onBuildPack}
              className="inline-flex h-11 items-center rounded-full border px-6 text-sm font-medium transition-colors duration-200 whitespace-nowrap shrink-0"
              style={{
                borderColor: 'var(--border-strong)',
                color: 'var(--ink)',
                backgroundColor: 'var(--surface)',
              }}
            >
              Build a Pack
            </button>
          </motion.div>

          {/* Tabular-Nums Spec Summary Strip (Zero pills, clean typographic separators) */}
          <p
            className="mx-auto mt-7 max-w-xs sm:max-w-none text-balance font-mono text-xs tracking-[0.04em] tabular-nums"
            style={{ color: 'var(--ink-muted)' }}
          >
            0{GLOBAL_METRICS.units}&nbsp;Units · {GLOBAL_METRICS.topics}&nbsp;Topics ·{' '}
            ~13&nbsp;Hours · {GLOBAL_METRICS.workedExamples}&nbsp;Worked&nbsp;Examples
          </p>
        </div>

        {/* Lower Hero Visual Anchor: Scroll-Straightening 3D Workspace Stage */}
        <div
          className="mt-9 sm:mt-11"
          style={{ perspective: '1400px' }}
        >
          <motion.div
            data-testid="hero-workspace-stage"
            data-preview-theme={previewThemeId}
            style={{
              rotateX,
              scale,
              y: stageY,
              transformOrigin: 'center top',
              backgroundColor: previewTokens.surface,
              color: previewTokens.ink,
              borderColor: previewTokens.border,
            }}
            className="mx-auto max-w-5xl overflow-hidden rounded-2xl border transition-colors duration-300"
          >
            {/* Preview Window Chrome + Live Theme Dots */}
            <div
              className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6"
              style={{
                borderColor: previewTokens.border,
                backgroundColor: previewTokens.bg,
              }}
            >
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="font-semibold tracking-[0.12em] uppercase">
                  IAL CHEM WORKBENCH
                </span>
                <span
                  aria-hidden="true"
                  className="hidden sm:inline"
                  style={{ color: previewTokens.inkMuted }}
                >
                  /
                </span>
                <span style={{ color: previewTokens.inkMuted }} className="hidden sm:inline">
                  Live Preview
                </span>
              </div>

              {/* Animated ⌘K quick-switcher bar inside preview */}
              <div
                className="hidden md:flex items-center gap-2 rounded-lg border px-3 py-1 font-mono text-[11px]"
                style={{
                  backgroundColor: previewTokens.surface,
                  borderColor: previewTokens.border,
                  color: previewTokens.inkMuted,
                }}
              >
                <Search className="h-3 w-3" aria-hidden="true" />
                <motion.span
                  key={activeTab.commandQuery}
                  initial={reducedMotion ? false : { opacity: 0.35, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: EASE_EXPO }}
                >
                  {activeTab.commandQuery}
                </motion.span>
                <span className="ml-2 opacity-60">⌘K</span>
              </div>

              {/* Live Clickable 4 Theme Dots (Dark · Cream · Dune · Classic) */}
              <div
                role="group"
                aria-label="Workspace preview themes"
                className="flex items-center gap-1 rounded-full border p-1"
                style={{
                  borderColor: previewTokens.border,
                  backgroundColor: previewTokens.surface,
                }}
              >
                {THEME_DOT_ORDER.map((id) => {
                  const t = PREVIEW_THEMES[id];
                  const selected = previewThemeId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setUserInteracted(true);
                        setPreviewThemeId(id);
                      }}
                      aria-pressed={selected}
                      className="relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] transition-colors whitespace-nowrap shrink-0"
                      style={{
                        color: selected ? previewTokens.ink : previewTokens.inkMuted,
                      }}
                    >
                      {selected && (
                        <motion.span
                          layoutId="hero-preview-theme-dot"
                          transition={SPRING_SNAPPY}
                          className="absolute inset-0 rounded-full border"
                          style={{
                            backgroundColor: previewTokens.surfaceElevated,
                            borderColor: previewTokens.border,
                          }}
                        />
                      )}
                      <span
                        aria-hidden="true"
                        className="relative z-10 h-2 w-2 rounded-full border"
                        style={{
                          backgroundColor: t.accent,
                          borderColor: t.border,
                        }}
                      />
                      <span className="relative z-10">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Playable Workspace Interior: 3 Topic Tabs + Structured Reader Pane */}
            <div className="grid grid-cols-1 md:grid-cols-12">
              {/* Left Sidebar */}
              <div
                className="border-b p-4 md:col-span-4 md:border-r md:border-b-0 sm:p-5"
                style={{
                  borderColor: previewTokens.border,
                  backgroundColor: previewTokens.bg,
                }}
              >
                <p
                  className="mb-3 font-mono text-[10px] tracking-[0.14em] uppercase"
                  style={{ color: previewTokens.inkMuted }}
                >
                  ACTIVE MODULE
                </p>
                <div className="flex flex-row gap-2 overflow-x-auto md:flex-col no-scrollbar">
                  {HERO_PREVIEW_TABS.map((tab) => {
                    const isActive = tab.id === activeTabId;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setUserInteracted(true);
                          setActiveTabId(tab.id);
                        }}
                        className="relative flex w-auto md:w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors whitespace-nowrap shrink-0"
                        style={{
                          borderColor: isActive
                            ? previewTokens.accent
                            : previewTokens.border,
                          backgroundColor: isActive
                            ? previewTokens.surfaceElevated
                            : 'transparent',
                          color: isActive ? previewTokens.ink : previewTokens.inkMuted,
                        }}
                      >
                        <span className="font-mono text-xs font-medium tabular-nums">
                          {tab.label}
                        </span>
                        <span
                          aria-hidden="true"
                          className="ml-3 hidden md:inline font-mono text-[10px]"
                          style={{
                            color: isActive ? previewTokens.accent : previewTokens.inkMuted,
                          }}
                        >
                          {isActive ? 'Active' : 'View'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Reader Pane */}
              <div className="p-5 sm:p-7 md:col-span-8">
                <motion.div
                  key={`${activeTab.id}-${previewThemeId}`}
                  initial={reducedMotion ? false : { opacity: 0.35, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, ease: EASE_EXPO }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className="font-mono text-xs tabular-nums"
                      style={{ color: previewTokens.accent }}
                    >
                      {activeTab.unitLabel}
                    </span>
                    <span
                      className="font-mono text-[11px] tabular-nums"
                      style={{ color: previewTokens.inkMuted }}
                    >
                      {activeTab.meta}
                    </span>
                  </div>

                  <h2
                    className={`mt-2.5 text-xl sm:text-2xl tracking-tight ${
                      previewTokens.useSerifHeading
                        ? 'font-serif italic text-2xl sm:text-3xl font-normal'
                        : 'font-semibold'
                    }`}
                  >
                    {activeTab.title}
                  </h2>

                  <div className="mt-5 space-y-2.5">
                    {activeTab.blocks.map((block) => (
                      <div
                        key={block.key}
                        className="flex items-center justify-between gap-4 rounded-lg border px-3.5 py-2.5"
                        style={{
                          borderColor: previewTokens.border,
                          backgroundColor: previewTokens.bg,
                        }}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold">{block.key}</p>
                          <p
                            className="mt-0.5 truncate text-xs"
                            style={{ color: previewTokens.inkMuted }}
                          >
                            {block.detail}
                          </p>
                        </div>
                        <span
                          className="font-mono text-[11px] tabular-nums shrink-0"
                          style={{ color: previewTokens.accent }}
                        >
                          {block.metric}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
