import { useCallback, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { MotionConfig, useReducedMotion } from 'motion/react';
import type { IalUnit, SiteTheme } from './data/ialData';
import { FilmGrainOverlay } from './components/FilmGrainOverlay';
import { CommandPaletteModal } from './components/sections/CommandPaletteModal';
import { HeroSection } from './components/sections/HeroSection';
import { ShowcaseCarousel } from './components/sections/ShowcaseCarousel';
import { WorkflowSplit } from './components/sections/WorkflowSplit';
import { KineticInterlude } from './components/sections/KineticInterlude';
import { UnitMatrix } from './components/sections/UnitMatrix';
import { FooterSection } from './components/sections/FooterSection';

export default function App() {
  const prefersReduced = useReducedMotion();
  const reducedMotion = Boolean(prefersReduced);

  const [theme, setTheme] = useState<SiteTheme>('obsidian');
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const lenisRef = useRef<Lenis | null>(null);

  // Sync active theme attribute on root <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Root Lenis smooth scroll with wheel inertia, paused/disabled for reduced motion
  useEffect(() => {
    if (reducedMotion) {
      lenisRef.current = null;
      return;
    }

    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    let disposed = false;
    document.fonts?.ready.then(() => {
      if (!disposed) {
        lenis.resize();
      }
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = window.requestAnimationFrame(raf);
    };
    rafId = window.requestAnimationFrame(raf);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  // Global Cmd+K / Ctrl+K shortcut to toggle Command Palette
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandQuery('');
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'obsidian' ? 'cream' : 'obsidian'));
  }, []);

  const openSearch = useCallback((initialQuery = '') => {
    setCommandQuery(initialQuery);
    setCommandOpen(true);
  }, []);

  const openUnitInspector = useCallback((unitCode: IalUnit['code']) => {
    setCommandQuery(unitCode);
    setCommandOpen(true);
  }, []);

  const navigateTo = useCallback(
    (anchor: string) => {
      if (anchor === '#top') {
        if (lenisRef.current && !reducedMotion) {
          lenisRef.current.scrollTo(0);
        } else {
          window.scrollTo({ top: 0, behavior: 'auto' });
        }
        return;
      }
      const target = document.querySelector(anchor);
      if (!(target instanceof HTMLElement)) return;
      if (lenisRef.current && !reducedMotion) {
        lenisRef.current.scrollTo(target, { offset: -64 });
      } else {
        target.scrollIntoView({ behavior: 'auto' });
      }
    },
    [reducedMotion],
  );

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="relative min-h-screen w-full overflow-x-clip"
        style={{ backgroundColor: 'var(--bg)', color: 'var(--ink)' }}
      >
        <FilmGrainOverlay />

        <main>
          <HeroSection
            theme={theme}
            reducedMotion={reducedMotion}
            onStartRevising={() => openSearch('WCH11')}
            onBuildPack={() => navigateTo('#workflow')}
          />

          <ShowcaseCarousel reducedMotion={reducedMotion} />

          <WorkflowSplit
            reducedMotion={reducedMotion}
            onOpenSearch={(q = '') => openSearch(q)}
          />

          <KineticInterlude theme={theme} reducedMotion={reducedMotion} />

          <UnitMatrix
            reducedMotion={reducedMotion}
            onSelectUnit={openUnitInspector}
          />
        </main>

        <FooterSection
          theme={theme}
          reducedMotion={reducedMotion}
          onLaunchWorkspace={() => openSearch('WCH11')}
          onOpenSpecIndex={() => openSearch('')}
          onOpenUnit={openUnitInspector}
          onNavigate={navigateTo}
          onToggleTheme={toggleTheme}
        />

        <CommandPaletteModal
          open={commandOpen}
          initialQuery={commandQuery}
          onClose={() => setCommandOpen(false)}
          onJumpToAnchor={navigateTo}
        />
      </div>
    </MotionConfig>
  );
}
