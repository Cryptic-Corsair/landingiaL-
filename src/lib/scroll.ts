import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export interface SmoothScrollController {
  lenis: Lenis | null;
  scrollToTarget: (target: string | number | HTMLElement) => void;
  destroy: () => void;
}

/**
 * Initializes Lenis smooth scroll synchronized with GSAP ScrollTrigger.
 * Falls back cleanly to native scroll when prefers-reduced-motion is active.
 */
export function createSmoothScroll(
  prefersReducedMotion: boolean,
): SmoothScrollController {
  if (prefersReducedMotion) {
    return {
      lenis: null,
      scrollToTarget: (target) => {
        if (typeof target === 'string') {
          document.querySelector(target)?.scrollIntoView({ behavior: 'auto' });
        } else if (typeof target === 'number') {
          window.scrollTo({ top: target, behavior: 'auto' });
        } else {
          target.scrollIntoView({ behavior: 'auto' });
        }
      },
      destroy: () => {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      },
    };
  }

  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.4,
  });

  const onLenisScroll = () => {
    ScrollTrigger.update();
  };

  lenis.on('scroll', onLenisScroll);

  const tick = (time: number) => {
    lenis.raf(time * 1000);
  };

  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return {
    lenis,
    scrollToTarget: (target) => {
      lenis.scrollTo(target, {
        duration: 1.35,
        easing: (t) => 1 - Math.pow(1 - t, 4),
      });
    },
    destroy: () => {
      gsap.ticker.remove(tick);
      lenis.off('scroll', onLenisScroll);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    },
  };
}
