import { ArrowRight, ArrowUp, Moon, Sun } from 'lucide-react';
import { GLOBAL_METRICS, IAL_UNITS, type IalUnit, type SiteTheme } from '../../data/ialData';
import { WaveFooterCanvas } from '../motion/WaveFooterCanvas';

interface FooterSectionProps {
  theme: SiteTheme;
  reducedMotion: boolean;
  onLaunchWorkspace: () => void;
  onOpenSpecIndex: () => void;
  onOpenUnit: (unitCode: IalUnit['code']) => void;
  onNavigate: (anchor: string) => void;
  onToggleTheme: () => void;
}

export function FooterSection({
  theme,
  reducedMotion,
  onLaunchWorkspace,
  onOpenSpecIndex,
  onOpenUnit,
  onNavigate,
  onToggleTheme,
}: FooterSectionProps) {
  return (
    <footer
      data-testid="wavy-footer"
      className="relative overflow-hidden"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      {/* Full-bleed Living Harmonic Wave Crest transitioning --bg -> --surface */}
      <div className="relative h-36 w-full sm:h-48" aria-hidden="true">
        <WaveFooterCanvas theme={theme} reducedMotion={reducedMotion} />
      </div>

      {/* Main Wave-Borne Footer Surface (-mt-px overlaps subpixel rounding cleanly) */}
      <div
        className="relative -mt-px pb-12 pt-8 sm:pb-16 sm:pt-12"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        {/* Soft centered ambient horizon glow with smooth top falloff */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-72"
          style={{
            background:
              'radial-gradient(ellipse 62% 58% at 50% 46%, var(--spotlight) 0%, transparent 72%)',
          }}
        />

        {/* Closing Horizon Call to Action */}
        <div className="relative z-10 mx-auto max-w-4xl px-4 pb-16 text-center sm:px-6 sm:pb-20 lg:px-8">
          <p
            className="font-mono text-[11px] tracking-[0.16em] uppercase"
            style={{ color: 'var(--ink-muted)' }}
          >
            EDEXCEL IAL CHEMISTRY · 2018 SPEC
          </p>
          <h2
            className="mx-auto mt-3 max-w-2xl text-balance font-semibold tracking-[-0.035em] leading-[1.06]"
            style={{
              fontSize: 'clamp(2rem, 4.4vw, 3.5rem)',
              color: 'var(--ink)',
            }}
          >
            Open the bench. Start your{' '}
            <span className="font-serif italic font-normal">first topic.</span>
          </h2>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onLaunchWorkspace}
              className="group inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold transition-transform duration-200 hover:-translate-y-px whitespace-nowrap shrink-0"
              style={{
                backgroundColor: 'var(--ink)',
                color: 'var(--bg)',
              }}
            >
              <span>Launch IAL CHEM</span>
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </button>

            <button
              type="button"
              onClick={onOpenSpecIndex}
              className="inline-flex h-11 items-center gap-2 rounded-full border px-5 text-sm font-medium transition-colors whitespace-nowrap shrink-0"
              style={{
                borderColor: 'var(--border-strong)',
                backgroundColor: 'var(--bg)',
                color: 'var(--ink)',
              }}
            >
              <span>Open Spec Index</span>
              <kbd
                className="font-mono text-[11px] opacity-70"
                aria-hidden="true"
              >
                ⌘K
              </kbd>
            </button>
          </div>
        </div>

        {/* Harmonic Sine-Wave Divider */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8" aria-hidden="true">
          <svg
            viewBox="0 0 1200 20"
            preserveAspectRatio="none"
            className="h-5 w-full"
          >
            <path
              d="M0,10 Q150,2 300,10 T600,10 T900,10 T1200,10"
              fill="none"
              stroke="var(--border-strong)"
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Asymmetric Footer Navigation & Utility Columns */}
        <div className="relative z-10 mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-10 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
          {/* Brand + Live Theme Toggle */}
          <div className="space-y-4 lg:col-span-4">
            <div className="flex items-center gap-2.5">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
                className="shrink-0"
              >
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  stroke="var(--border-strong)"
                  strokeWidth="1.2"
                />
                <path
                  d="M3.5 10.5 C6 7, 8.5 13, 10.5 9.5 C12.5 6.5, 14.5 12, 16.5 9.5"
                  stroke="var(--accent)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
              <span
                className="text-sm font-semibold tracking-[0.16em] uppercase"
                style={{ color: 'var(--ink)' }}
              >
                IAL CHEM
              </span>
            </div>

            <p
              className="max-w-xs text-sm leading-relaxed"
              style={{ color: 'var(--ink-muted)' }}
            >
              Quiet, structured revision notes and custom specification packs for
              Edexcel International A Level Chemistry.
            </p>

            <button
              type="button"
              data-testid="footer-theme-toggle"
              onClick={onToggleTheme}
              aria-label={
                theme === 'obsidian'
                  ? 'Switch to Daylight Cream theme'
                  : 'Switch to Obsidian Dark theme'
              }
              className="inline-flex h-9 items-center gap-2 rounded-full border px-3.5 font-mono text-xs transition-colors hover:opacity-85 whitespace-nowrap shrink-0"
              style={{
                borderColor: 'var(--border-strong)',
                backgroundColor: 'var(--bg)',
                color: 'var(--ink)',
              }}
            >
              {theme === 'obsidian' ? (
                <Sun className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Moon className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>
                Theme: {theme === 'obsidian' ? 'Obsidian Dark' : 'Daylight Cream'}
              </span>
            </button>
          </div>

          {/* Interactive 2-Column Unit Index (WCH11 - WCH16) */}
          <div className="lg:col-span-4">
            <h3
              className="font-mono text-[11px] tracking-[0.14em] uppercase"
              style={{ color: 'var(--ink-muted)' }}
            >
              Units
            </h3>
            <ul className="mt-4 grid grid-cols-1 gap-x-4 gap-y-2.5 text-sm sm:grid-cols-2">
              {IAL_UNITS.map((unit) => {
                const suffix =
                  unit.code === 'WCH13'
                    ? 'Practical I'
                    : unit.code === 'WCH16'
                      ? 'Practical II'
                      : unit.shortLabel.split(' · ')[0];
                return (
                  <li key={unit.code}>
                    <button
                      type="button"
                      onClick={() => onOpenUnit(unit.code)}
                      className="group inline-flex items-center gap-2 text-left transition-opacity hover:opacity-75 tabular-nums whitespace-nowrap"
                      style={{ color: 'var(--ink)' }}
                    >
                      <span
                        className="font-mono text-xs"
                        style={{ color: 'var(--accent)' }}
                      >
                        {unit.code}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                        {suffix}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Section Navigation & Quick Shortcuts */}
          <div className="lg:col-span-2">
            <h3
              className="font-mono text-[11px] tracking-[0.14em] uppercase"
              style={{ color: 'var(--ink-muted)' }}
            >
              Navigate
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('#top')}
                  className="text-left transition-opacity hover:opacity-75"
                  style={{ color: 'var(--ink)' }}
                >
                  Overview
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('#showcase')}
                  className="text-left transition-opacity hover:opacity-75"
                  style={{ color: 'var(--ink)' }}
                >
                  Showcase
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('#workflow')}
                  className="text-left transition-opacity hover:opacity-75"
                  style={{ color: 'var(--ink)' }}
                >
                  Pack Builder
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('#units')}
                  className="text-left transition-opacity hover:opacity-75"
                  style={{ color: 'var(--ink)' }}
                >
                  Unit Matrix
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenSpecIndex}
                  className="text-left font-mono text-xs transition-opacity hover:opacity-75"
                  style={{ color: 'var(--ink-muted)' }}
                >
                  Search (⌘K)
                </button>
              </li>
            </ul>
          </div>

          {/* Specification Notice + Smooth Back to Top */}
          <div className="flex flex-col justify-between gap-6 lg:col-span-2">
            <div>
              <h3
                className="font-mono text-[11px] tracking-[0.14em] uppercase"
                style={{ color: 'var(--ink-muted)' }}
              >
                Specification
              </h3>
              <p
                className="mt-4 text-xs leading-relaxed"
                style={{ color: 'var(--ink-muted)' }}
              >
                Aligned with the Pearson Edexcel International A Level Chemistry
                (2018) specification. Independent revision resource; not affiliated
                with Pearson Education Ltd.
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={() => onNavigate('#top')}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 font-mono text-xs transition-transform duration-200 hover:-translate-y-0.5 whitespace-nowrap shrink-0"
                style={{
                  borderColor: 'var(--border-strong)',
                  backgroundColor: 'var(--bg)',
                  color: 'var(--ink)',
                }}
              >
                <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Back to top</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quiet Wave Colophon Base */}
        <div
          className="mx-auto mt-12 flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t px-4 pt-6 font-mono text-[11px] tabular-nums sm:px-6 lg:px-8"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--ink-muted)',
          }}
        >
          <span>IAL CHEM · WCH11–WCH16</span>
          <span>
            0{GLOBAL_METRICS.units} Units · {GLOBAL_METRICS.topics} Topics · ~13 Hours ·{' '}
            {GLOBAL_METRICS.workedExamples} Worked Examples
          </span>
        </div>
      </div>
    </footer>
  );
}
