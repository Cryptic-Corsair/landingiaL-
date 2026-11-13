import { ArrowRight, Moon, Search, Sun, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'motion/react';
import type { SiteTheme } from '../data/ialData';
import { SPRING_PLAYFUL } from '../lib/motion';
import { soundEngine } from '../lib/sound';

interface DockProps {
  theme: SiteTheme;
  soundOn: boolean;
  onToggleTheme: () => void;
  onToggleSound: () => void;
  onOpenSearch: () => void;
  onOpenNotes: () => void;
  onNavigate: (anchor: string) => void;
}

const JUMP_LINKS = [
  { label: 'Play', href: '#play' },
  { label: 'Themes', href: '#themes' },
  { label: 'Sandbox', href: '#sandbox' },
  { label: 'Units', href: '#units' },
] as const;

export function Dock({
  theme,
  soundOn,
  onToggleTheme,
  onToggleSound,
  onOpenSearch,
  onOpenNotes,
  onNavigate,
}: DockProps) {
  return (
    <nav
      aria-label="Floating workspace dock"
      className="fixed inset-x-0 bottom-5 z-40 flex justify-center px-3 pointer-events-none"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={SPRING_PLAYFUL}
        className="pointer-events-auto flex max-w-full items-center gap-1 sm:gap-1.5 rounded-full border p-1.5 shadow-[0_12px_36px_rgba(21,18,28,0.16)]"
        style={{
          backgroundColor: 'var(--dock-bg)',
          borderColor: 'var(--border-strong)',
          color: 'var(--ink)',
        }}
      >
        {/* Mini Brand Mark -> Top */}
        <button
          type="button"
          data-cursor="CLICK"
          onClick={() => {
            soundEngine.playClick(540);
            onNavigate('#top');
          }}
          aria-label="Scroll to top of IAL CHEM"
          className="inline-flex h-9 items-center gap-2 rounded-full px-3 transition-transform duration-150 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap shrink-0"
          style={{ color: 'var(--ink)' }}
        >
          <span
            aria-hidden="true"
            className="inline-flex h-5 w-5 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--coral)', color: '#FFFDF9' }}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="4.2" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="6" cy="6" r="1.5" fill="currentColor" />
            </svg>
          </span>
          <span className="font-display text-xs sm:text-sm font-semibold tracking-tight">
            IAL CHEM
          </span>
        </button>

        <span
          aria-hidden="true"
          className="hidden md:inline-block h-4 w-px mx-0.5"
          style={{ backgroundColor: 'var(--border-strong)' }}
        />

        {/* Quick Jump Pills (Desktop / Tablet) */}
        <div className="hidden md:flex items-center gap-0.5">
          {JUMP_LINKS.map((link) => (
            <button
              key={link.href}
              type="button"
              data-cursor="CLICK"
              onClick={() => {
                soundEngine.playClick(480);
                onNavigate(link.href);
              }}
              className="inline-flex h-8 items-center rounded-full px-3 text-xs font-medium transition-colors duration-150 hover:bg-black/5 dark:hover:bg-white/10 whitespace-nowrap shrink-0"
              style={{ color: 'var(--ink-muted)' }}
            >
              {link.label}
            </button>
          ))}
        </div>

        <span
          aria-hidden="true"
          className="hidden md:inline-block h-4 w-px mx-0.5"
          style={{ backgroundColor: 'var(--border-strong)' }}
        />

        {/* ⌘K Search Trigger */}
        <button
          type="button"
          data-testid="dock-search-btn"
          data-cursor="OPEN"
          onClick={() => {
            soundEngine.playClick(600);
            onOpenSearch();
          }}
          aria-label="Open command search (⌘K)"
          className="inline-flex h-9 items-center gap-1.5 rounded-full border px-2.5 sm:px-3 text-xs font-medium transition-transform duration-150 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap shrink-0"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--surface-2)',
            color: 'var(--ink)',
          }}
        >
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
          <kbd className="font-mono text-[11px] tabular-nums">⌘K</kbd>
        </button>

        {/* Cream / Plum Theme Toggle */}
        <button
          type="button"
          data-testid="dock-theme-btn"
          data-cursor="CLICK"
          onClick={() => {
            soundEngine.playPop(440);
            onToggleTheme();
          }}
          aria-label={
            theme === 'cream'
              ? 'Switch to Midnight Plum theme'
              : 'Switch to Daylight Cream theme'
          }
          className="inline-flex h-9 items-center gap-1.5 rounded-full border px-2.5 sm:px-3 text-xs font-medium transition-transform duration-150 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap shrink-0"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--surface)',
            color: 'var(--ink)',
          }}
        >
          {theme === 'cream' ? (
            <>
              <Moon className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Plum</span>
            </>
          ) : (
            <>
              <Sun className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Cream</span>
            </>
          )}
        </button>

        {/* Pure Web Audio Sound Toggle (Muted by Default) */}
        <button
          type="button"
          data-testid="dock-sound-btn"
          data-cursor="CLICK"
          onClick={onToggleSound}
          aria-pressed={soundOn}
          aria-label={soundOn ? 'Mute sound effects' : 'Enable playful sound effects'}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border px-2.5 sm:px-3 text-xs font-medium transition-transform duration-150 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap shrink-0"
          style={{
            borderColor: soundOn ? 'var(--teal)' : 'var(--border)',
            backgroundColor: 'var(--surface)',
            color: soundOn ? 'var(--teal)' : 'var(--ink-muted)',
          }}
        >
          {soundOn ? (
            <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <VolumeX className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span className="hidden lg:inline font-mono text-[11px]">
            Sound: {soundOn ? 'On' : 'Off'}
          </span>
        </button>

        {/* Primary CTA: Open Notes → */}
        <button
          type="button"
          data-testid="dock-open-notes-btn"
          data-cursor="OPEN"
          onClick={() => {
            soundEngine.playChime();
            onOpenNotes();
          }}
          className="inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 sm:px-4 text-xs font-semibold transition-transform duration-150 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap shrink-0"
          style={{
            backgroundColor: 'var(--coral)',
            color: '#FFFDF9',
          }}
        >
          <span>Open Notes</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </motion.div>
    </nav>
  );
}
