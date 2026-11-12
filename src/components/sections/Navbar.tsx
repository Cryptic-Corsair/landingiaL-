import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Menu, Moon, Search, Sun, X } from 'lucide-react';
import type { SiteTheme } from '../../data/ialData';
import { EASE_EXPO } from '../../lib/motion';

interface NavbarProps {
  theme: SiteTheme;
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  onOpenNotes: () => void;
  onNavigate: (anchor: string) => void;
}

const NAV_LINKS = [
  { label: 'Showcase', href: '#showcase' },
  { label: 'Workflow', href: '#workflow' },
  { label: 'Units', href: '#units' },
] as const;

export function Navbar({
  theme,
  onToggleTheme,
  onOpenSearch,
  onOpenNotes,
  onNavigate,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLinkClick = (href: string) => {
    setMobileOpen(false);
    onNavigate(href);
  };

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-300"
      style={{
        height: '64px',
        backgroundColor: scrolled || mobileOpen ? 'var(--nav-backdrop)' : 'transparent',
        borderColor: scrolled || mobileOpen ? 'var(--border)' : 'transparent',
      }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: Brand mark + subtle orbital dot emblem + 2018 SPEC mono */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('#top');
          }}
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4"
          style={{ color: 'var(--ink)' }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className="shrink-0"
          >
            <circle cx="10" cy="10" r="7.5" stroke="var(--border-strong)" strokeWidth="1.2" />
            <ellipse
              cx="10"
              cy="10"
              rx="8.2"
              ry="3.4"
              transform="rotate(-28 10 10)"
              stroke="var(--ink-muted)"
              strokeWidth="1"
            />
            <circle cx="10" cy="10" r="2.2" fill="var(--accent)" />
          </svg>
          <span className="text-sm font-semibold tracking-[0.16em] uppercase">
            IAL CHEM
          </span>
          <span
            aria-hidden="true"
            className="hidden sm:inline-block h-3 w-px"
            style={{ backgroundColor: 'var(--border-strong)' }}
          />
          <span
            className="hidden sm:inline-block font-mono text-[10px] tracking-[0.14em] uppercase"
            style={{ color: 'var(--ink-muted)' }}
          >
            2018 SPEC
          </span>
        </a>

        {/* Center Navigation Links (Desktop) */}
        <nav aria-label="Primary" className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(item.href);
              }}
              className="text-sm font-medium transition-colors duration-200 hover:opacity-100 whitespace-nowrap shrink-0"
              style={{ color: 'var(--ink-muted)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--ink)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--ink-muted)';
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right Controls: Search ⌘K + Obsidian/Cream Theme Toggle + Open Notes */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            type="button"
            data-testid="navbar-search-btn"
            onClick={onOpenSearch}
            aria-label="Search units and specification topics"
            className="inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-colors hover:opacity-90 whitespace-nowrap shrink-0"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border-strong)',
              color: 'var(--ink-muted)',
            }}
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline" style={{ color: 'var(--ink)' }}>
              Search
            </span>
            <kbd
              className="rounded px-1.5 py-0.5 font-mono text-[10px] tabular-nums"
              style={{
                backgroundColor: 'var(--surface-elevated)',
                color: 'var(--ink-muted)',
              }}
            >
              ⌘K
            </kbd>
          </button>

          <button
            type="button"
            data-testid="theme-toggle-btn"
            onClick={onToggleTheme}
            aria-label={
              theme === 'obsidian'
                ? 'Switch to Daylight Cream theme'
                : 'Switch to Obsidian Dark theme'
            }
            className="inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors hover:opacity-90 whitespace-nowrap shrink-0"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border-strong)',
              color: 'var(--ink)',
            }}
          >
            {theme === 'obsidian' ? (
              <>
                <Sun className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden lg:inline">Cream</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden lg:inline">Obsidian</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenNotes}
            className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-semibold transition-transform duration-200 hover:-translate-y-px whitespace-nowrap shrink-0"
            style={{
              backgroundColor: 'var(--ink)',
              color: 'var(--bg)',
            }}
          >
            <span>Open Notes</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border md:hidden shrink-0"
            style={{
              borderColor: 'var(--border-strong)',
              backgroundColor: 'var(--surface)',
              color: 'var(--ink)',
            }}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Clean Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: EASE_EXPO }}
            className="border-b px-4 py-4 md:hidden"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <nav aria-label="Mobile Navigation" className="flex flex-col gap-3">
              {NAV_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(item.href);
                  }}
                  className="py-1.5 text-sm font-medium"
                  style={{ color: 'var(--ink)' }}
                >
                  {item.label}
                </a>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenNotes();
                }}
                className="mt-1 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--ink)',
                  color: 'var(--bg)',
                }}
              >
                <span>Open Notes</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
