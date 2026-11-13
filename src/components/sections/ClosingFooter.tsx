import { motion } from 'motion/react';
import { ArrowRight, Moon, Sun } from 'lucide-react';
import { IAL_UNITS, type IalUnit, type SiteTheme } from '../../data/ialData';
import { SPRING_PLAYFUL } from '../../lib/motion';
import { soundEngine } from '../../lib/sound';

interface ClosingFooterProps {
  theme: SiteTheme;
  reducedMotion: boolean;
  onLaunchBench: () => void;
  onBuildPack: () => void;
  onOpenUnit: (unitCode: IalUnit['code']) => void;
  onOpenSpecIndex: () => void;
  onNavigate: (anchor: string) => void;
  onToggleTheme: () => void;
}

export function ClosingFooter({
  theme,
  reducedMotion,
  onLaunchBench,
  onBuildPack,
  onOpenUnit,
  onOpenSpecIndex,
  onNavigate,
  onToggleTheme,
}: ClosingFooterProps) {
  return (
    <footer
      data-testid="closing-footer"
      className="relative border-t pb-28 pt-20 sm:pt-28"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--surface)',
      }}
    >
      {/* Closing Expressive Stage */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p
            className="font-mono text-[11px] tracking-[0.16em] uppercase"
            style={{ color: 'var(--ink-muted)' }}
          >
            OPEN YOUR WORKSPACE
          </p>
          <h2
            className="mt-3 text-balance font-display font-semibold tracking-[-0.028em] leading-[1.04]"
            style={{ fontSize: 'clamp(2.3rem, 5.2vw, 4.2rem)' }}
          >
            Ready to open your{' '}
            <span className="font-serif italic font-normal" style={{ color: 'var(--coral)' }}>
              bench?
            </span>
          </h2>

          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <motion.button
              type="button"
              data-cursor="OPEN"
              whileHover={reducedMotion ? undefined : { scale: 1.03, y: -2 }}
              whileTap={reducedMotion ? undefined : { scale: 0.96 }}
              transition={SPRING_PLAYFUL}
              onClick={() => {
                soundEngine.playChime();
                onLaunchBench();
              }}
              className="group inline-flex h-12 items-center gap-2 rounded-full px-7 text-sm font-semibold shadow-sm whitespace-nowrap shrink-0"
              style={{
                backgroundColor: 'var(--coral)',
                color: '#FFFDF9',
              }}
            >
              <span>Launch IAL CHEM</span>
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </motion.button>

            <button
              type="button"
              data-cursor="CLICK"
              onClick={() => {
                soundEngine.playClick(520);
                onBuildPack();
              }}
              className="inline-flex h-12 items-center rounded-full border px-6 text-sm font-medium transition-transform duration-150 hover:-translate-y-0.5 whitespace-nowrap shrink-0"
              style={{
                borderColor: 'var(--border-strong)',
                backgroundColor: 'var(--bg)',
                color: 'var(--ink)',
              }}
            >
              Build a Revision Pack
            </button>
          </div>
        </div>

        {/* Clean 4-Column Footer Grid */}
        <div
          className="mt-16 grid grid-cols-1 gap-10 border-t pt-12 sm:grid-cols-2 lg:grid-cols-4"
          style={{ borderColor: 'var(--border)' }}
        >
          {/* Col 1: Brand Mark + Summary + Theme Toggle */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="inline-flex h-6 w-6 items-center justify-center rounded-full"
                style={{ backgroundColor: 'var(--coral)', color: '#FFFDF9' }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="4.2" stroke="currentColor" strokeWidth="1.4" />
                  <circle cx="6" cy="6" r="1.5" fill="currentColor" />
                </svg>
              </span>
              <span className="font-display text-base font-semibold tracking-tight">
                IAL CHEM
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
              Tactile revision studio for Pearson Edexcel International A Level Chemistry across units WCH11–WCH16.
            </p>
            <button
              type="button"
              data-cursor="CLICK"
              onClick={() => {
                soundEngine.playPop(460);
                onToggleTheme();
              }}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border px-3 font-mono text-[11px]"
              style={{
                borderColor: 'var(--border-strong)',
                backgroundColor: 'var(--bg)',
                color: 'var(--ink)',
              }}
            >
              {theme === 'cream' ? (
                <>
                  <Sun className="h-3 w-3" aria-hidden="true" />
                  <span>Cream / Plum</span>
                </>
              ) : (
                <>
                  <Moon className="h-3 w-3" aria-hidden="true" />
                  <span>Plum / Cream</span>
                </>
              )}
            </button>
          </div>

          {/* Col 2: Units WCH11–WCH16 */}
          <div>
            <p
              className="font-mono text-[11px] uppercase tracking-[0.14em]"
              style={{ color: 'var(--ink-muted)' }}
            >
              Units
            </p>
            <ul className="mt-4 space-y-2.5">
              {IAL_UNITS.map((unit) => (
                <li key={unit.code}>
                  <button
                    type="button"
                    data-cursor="OPEN"
                    onClick={() => {
                      soundEngine.playClick(540);
                      onOpenUnit(unit.code);
                    }}
                    className="flex items-center gap-2 text-xs transition-opacity hover:opacity-75"
                  >
                    <span
                      className="font-mono font-medium tabular-nums"
                      style={{ color: unit.accentHex }}
                    >
                      {unit.code}
                    </span>
                    <span style={{ color: 'var(--ink-muted)' }}>{unit.shortLabel}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Workspace */}
          <div>
            <p
              className="font-mono text-[11px] uppercase tracking-[0.14em]"
              style={{ color: 'var(--ink-muted)' }}
            >
              Workspace
            </p>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <button
                  type="button"
                  data-cursor="CLICK"
                  onClick={() => onNavigate('#units')}
                  className="transition-opacity hover:opacity-75"
                  style={{ color: 'var(--ink)' }}
                >
                  Contents
                </button>
              </li>
              <li>
                <button
                  type="button"
                  data-cursor="OPEN"
                  onClick={() => {
                    soundEngine.playClick(560);
                    onOpenSpecIndex();
                  }}
                  className="transition-opacity hover:opacity-75"
                  style={{ color: 'var(--ink)' }}
                >
                  Spec Index
                </button>
              </li>
              <li>
                <button
                  type="button"
                  data-cursor="CLICK"
                  onClick={() => onNavigate('#sandbox')}
                  className="transition-opacity hover:opacity-75"
                  style={{ color: 'var(--ink)' }}
                >
                  Revision Pack
                </button>
              </li>
              <li>
                <button
                  type="button"
                  data-cursor="OPEN"
                  onClick={() => {
                    soundEngine.playClick(600);
                    onOpenSpecIndex();
                  }}
                  className="transition-opacity hover:opacity-75"
                  style={{ color: 'var(--ink)' }}
                >
                  Search ⌘K
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Specification Disclaimer */}
          <div>
            <p
              className="font-mono text-[11px] uppercase tracking-[0.14em]"
              style={{ color: 'var(--ink-muted)' }}
            >
              Specification
            </p>
            <p className="mt-4 text-xs leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
              Aligned with the Pearson Edexcel International A Level Chemistry (2018) specification. Independent revision resource, not affiliated with or endorsed by Pearson Education Ltd.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
