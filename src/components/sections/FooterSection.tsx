import { ArrowRight } from 'lucide-react';
import { IAL_UNITS, type IalUnit, type SiteTheme } from '../../data/ialData';

interface FooterSectionProps {
  theme: SiteTheme;
  onLaunchWorkspace: () => void;
  onOpenSpecIndex: () => void;
  onOpenUnit: (unitCode: IalUnit['code']) => void;
  onNavigate: (anchor: string) => void;
  onToggleTheme: () => void;
}

export function FooterSection({
  theme,
  onLaunchWorkspace,
  onOpenSpecIndex,
  onOpenUnit,
  onNavigate,
  onToggleTheme,
}: FooterSectionProps) {
  return (
    <footer
      className="relative overflow-hidden border-t"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--bg)',
      }}
    >
      {/* Closing Horizon Stage */}
      <div className="relative py-24 sm:py-32">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-72"
          style={{
            background:
              'radial-gradient(ellipse 68% 58% at 50% 100%, var(--spotlight) 0%, transparent 72%)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p
            className="font-mono text-[11px] tracking-[0.16em] uppercase"
            style={{ color: 'var(--ink-muted)' }}
          >
            READY TO REVISE
          </p>
          <h2
            className="mx-auto mt-3 max-w-2xl text-balance font-semibold tracking-[-0.035em] leading-[1.06]"
            style={{ fontSize: 'clamp(2rem, 4.4vw, 3.5rem)' }}
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
              className="inline-flex h-11 items-center rounded-full border px-5 text-sm font-medium transition-colors whitespace-nowrap shrink-0"
              style={{
                borderColor: 'var(--border-strong)',
                backgroundColor: 'var(--surface)',
                color: 'var(--ink)',
              }}
            >
              Open Spec Index
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Column Agency Footer */}
      <div
        className="border-t py-14 sm:py-16"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="10" cy="10" r="7.5" stroke="var(--border-strong)" strokeWidth="1.2" />
                <circle cx="10" cy="10" r="2.2" fill="var(--accent)" />
              </svg>
              <span className="text-sm font-semibold tracking-[0.16em] uppercase">
                IAL CHEM
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
              Quiet, structured revision notes and custom specification packs for
              Edexcel International A Level Chemistry.
            </p>
            <button
              type="button"
              onClick={onToggleTheme}
              className="inline-flex items-center font-mono text-xs transition-opacity hover:opacity-80"
              style={{ color: 'var(--ink-muted)' }}
            >
              Theme: {theme === 'obsidian' ? 'Obsidian Dark' : 'Daylight Cream'}
            </button>
          </div>

          {/* Column 2: Units */}
          <div>
            <h3
              className="font-mono text-[11px] tracking-[0.14em] uppercase"
              style={{ color: 'var(--ink-muted)' }}
            >
              Units
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
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
                      className="text-left transition-colors hover:opacity-80 tabular-nums"
                      style={{ color: 'var(--ink)' }}
                    >
                      {unit.code} ({suffix})
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 3: Workspace */}
          <div>
            <h3
              className="font-mono text-[11px] tracking-[0.14em] uppercase"
              style={{ color: 'var(--ink-muted)' }}
            >
              Workspace
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('#top')}
                  className="text-left transition-colors hover:opacity-80"
                >
                  Contents
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenSpecIndex}
                  className="text-left transition-colors hover:opacity-80"
                >
                  Spec Index
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('#workflow')}
                  className="text-left transition-colors hover:opacity-80"
                >
                  Revision Pack Builder
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenSpecIndex}
                  className="text-left font-mono text-xs transition-colors hover:opacity-80"
                >
                  Search (⌘K)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Specification */}
          <div>
            <h3
              className="font-mono text-[11px] tracking-[0.14em] uppercase"
              style={{ color: 'var(--ink-muted)' }}
            >
              Specification
            </h3>
            <p className="mt-4 text-xs leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
              Notes aligned with the Pearson Edexcel International A Level
              Chemistry (2018) specification. Independent revision resource; not
              affiliated with or endorsed by Pearson Education Ltd.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
