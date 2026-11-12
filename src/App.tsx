import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EntryVeil } from './components/EntryVeil';
import { FilmGrainOverlay } from './components/FilmGrainOverlay';
import { ResonanceCanvas } from './components/ResonanceCanvas';
import { TopBar } from './components/TopBar';
import { createSmoothScroll, type SmoothScrollController } from './lib/scroll';
import { computeMagneticOffset } from './lib/scrollCurves';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const pageRef = useRef<HTMLDivElement | null>(null);
  const scrollProgressRef = useRef<number>(0);
  const staticRenderCallbackRef = useRef<(() => void) | null>(null);
  const scrollControllerRef = useRef<SmoothScrollController | null>(null);

  // Beat refs for GPU-only ScrollTrigger choreography
  const scrollCueRef = useRef<HTMLDivElement | null>(null);
  const beat2LineRef = useRef<HTMLHeadingElement | null>(null);
  const beat3Line1Ref = useRef<HTMLSpanElement | null>(null);
  const beat3Line2Ref = useRef<HTMLSpanElement | null>(null);
  const beat4RingRef = useRef<HTMLDivElement | null>(null);
  const beat5ContentRef = useRef<HTMLDivElement | null>(null);
  const enterCtaRef = useRef<HTMLAnchorElement | null>(null);

  const [portalStatus, setPortalStatus] = useState<'idle' | 'entering'>('idle');
  const [magneticOffset, setMagneticOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const controller = createSmoothScroll(prefersReducedMotion);
    scrollControllerRef.current = controller;

    const ctx = gsap.context(() => {
      // Master scroll scrub driving WebGL uMorph (0.0 -> 2.0) & camera tilt
      ScrollTrigger.create({
        trigger: pageRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          scrollProgressRef.current = self.progress;
          staticRenderCallbackRef.current?.();
        },
      });

      if (prefersReducedMotion) return;

      // Beat 01: Fade out Scroll ↓ cue cleanly as user begins scrolling
      if (scrollCueRef.current) {
        gsap.to(scrollCueRef.current, {
          opacity: 0,
          y: 10,
          ease: 'none',
          scrollTrigger: {
            trigger: '#beat-01',
            start: 'top top',
            end: '25% top',
            scrub: true,
          },
        });
      }

      // Beat 02: Monumental clip-path unmask sweep
      if (beat2LineRef.current) {
        gsap.fromTo(
          beat2LineRef.current,
          { clipPath: 'inset(0% 100% 0% 0%)', opacity: 0.35 },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: '#beat-02',
              start: 'top 78%',
              end: 'center 42%',
              scrub: true,
            },
          },
        );
      }

      // Beat 03: Opposing horizontal kinetic tracks
      if (beat3Line1Ref.current && beat3Line2Ref.current) {
        gsap.fromTo(
          beat3Line1Ref.current,
          { xPercent: -10 },
          {
            xPercent: 8,
            ease: 'none',
            scrollTrigger: {
              trigger: '#beat-03',
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        );

        gsap.fromTo(
          beat3Line2Ref.current,
          { xPercent: 10 },
          {
            xPercent: -8,
            ease: 'none',
            scrollTrigger: {
              trigger: '#beat-03',
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        );
      }

      // Beat 04: Quiet tension ring subtle entrance scale
      if (beat4RingRef.current) {
        gsap.fromTo(
          beat4RingRef.current,
          { scale: 0.92, opacity: 0.35 },
          {
            scale: 1,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: '#beat-04',
              start: 'top 75%',
              end: 'center center',
              scrub: true,
            },
          },
        );
      }

      // Beat 05: Portal reveal rising gently above Cosmic Horizon Wave
      if (beat5ContentRef.current) {
        gsap.fromTo(
          beat5ContentRef.current,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: '#beat-05',
              start: 'top 72%',
              end: 'center 52%',
              scrub: true,
            },
          },
        );
      }
    }, pageRef);

    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
      controller.destroy();
      scrollControllerRef.current = null;
    };
  }, []);

  const handleScrollToEnter = useCallback(() => {
    const target = document.getElementById('beat-05');
    if (target && scrollControllerRef.current) {
      scrollControllerRef.current.scrollToTarget(target);
    } else if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleMagneticMove = useCallback(
    (e: ReactPointerEvent<HTMLAnchorElement>) => {
      const el = enterCtaRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setMagneticOffset(computeMagneticOffset(e.clientX, e.clientY, rect, 9));
    },
    [],
  );

  const handleMagneticLeave = useCallback(() => {
    setMagneticOffset({ x: 0, y: 0 });
  }, []);

  return (
    <div
      ref={pageRef}
      data-testid="scroll-stage"
      className="relative w-full min-h-screen bg-[#110E17] text-[#FFF6EA]"
    >
      {/* Non-blocking 00 -> 100 Entry Veil */}
      <EntryVeil />

      {/* Fixed full-viewport 3D WebGL Resonance Sculpture */}
      <ResonanceCanvas
        scrollProgressRef={scrollProgressRef}
        staticRenderCallbackRef={staticRenderCallbackRef}
      />

      {/* Subtle 0.035 opacity film grain */}
      <FilmGrainOverlay />

      {/* Ultra-Minimal Fixed Top Bar */}
      <TopBar onEnterClick={handleScrollToEnter} />

      {/* 5 Silent Cinematic Scroll Beats (~480vh total) */}
      <main className="relative z-10 w-full overflow-x-clip">
        {/* Beat 01 · Arrival (100vh) */}
        <section
          id="beat-01"
          aria-label="Beat 01 Arrival"
          className="relative w-full h-screen flex flex-col justify-end px-6 sm:px-12 pb-12 sm:pb-16"
        >
          <div className="flex items-end justify-between gap-6 w-full max-w-[1440px] mx-auto">
            <div className="max-w-xl">
              <p className="font-mono text-[11px] tracking-[0.22em] text-[#9D94B8] mb-3 sm:mb-4">
                EDEXCEL IAL CHEMISTRY
              </p>
              <h1 className="text-[clamp(2.6rem,6vw,5.25rem)] leading-[0.98] tracking-[-0.025em] text-[#FFF6EA] [text-wrap:balance]">
                <span className="font-sans font-medium">Clarity, </span>
                <span className="font-serif italic font-normal text-[#FFF6EA]">
                  distilled.
                </span>
              </h1>
            </div>

            <div
              ref={scrollCueRef}
              className="font-mono text-[11px] tracking-[0.16em] text-[#9D94B8] pb-2 whitespace-nowrap shrink-0"
              style={{
                borderBottom: '1px solid rgba(157, 148, 184, 0.25)',
              }}
            >
              Scroll ↓
            </div>
          </div>
        </section>

        {/* Beat 02 · The Unmasking (100vh) */}
        <section
          id="beat-02"
          aria-label="Beat 02 The Unmasking"
          className="relative w-full h-screen flex items-center px-6 sm:px-12"
        >
          <div className="relative w-full max-w-[1440px] mx-auto h-full flex items-center">
            <span className="absolute bottom-12 sm:bottom-16 right-0 font-mono tabular-nums text-[11px] tracking-[0.2em] text-[#9D94B8]">
              02 / 05
            </span>

            <h2
              ref={beat2LineRef}
              className="text-[clamp(2.1rem,5.2vw,4.5rem)] leading-[1.06] tracking-[-0.02em] font-sans font-medium text-[#FFF6EA] max-w-4xl [text-wrap:balance]"
            >
              Every principle in pure order.
            </h2>
          </div>
        </section>

        {/* Beat 03 · Kinetic Scale (100vh) */}
        <section
          id="beat-03"
          aria-label="Beat 03 Kinetic Scale"
          className="relative w-full h-screen flex flex-col justify-center px-6 sm:px-12 overflow-x-clip"
        >
          <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-2 sm:gap-4 select-none">
            <div className="overflow-hidden">
              <span
                ref={beat3Line1Ref}
                className="block font-sans font-medium text-[clamp(2.8rem,9vw,7.5rem)] leading-[0.95] tracking-[-0.03em] text-[#FFF6EA] whitespace-nowrap"
              >
                Strip away
              </span>
            </div>
            <div className="overflow-hidden self-end text-right">
              <span
                ref={beat3Line2Ref}
                className="block font-serif italic font-normal text-[clamp(3rem,9.5vw,8rem)] leading-[0.95] tracking-[-0.015em] text-[#C4BEFF] whitespace-nowrap"
              >
                the noise.
              </span>
            </div>
          </div>
        </section>

        {/* Beat 04 · Quiet Tension (80vh) */}
        <section
          id="beat-04"
          aria-label="Beat 04 Quiet Tension"
          className="relative w-full h-[80vh] flex items-center justify-center px-6"
        >
          <div
            ref={beat4RingRef}
            className="flex flex-col items-center justify-center w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-[#110E17]/75 pointer-events-auto transition-colors duration-300 hover:border-[#C4BEFF]/55"
            style={{
              border: '1px solid rgba(255, 246, 234, 0.24)',
            }}
          >
            <span className="font-mono text-[11px] tracking-[0.2em] text-[#FFF6EA] whitespace-nowrap">
              Hold to excite
            </span>
          </div>
        </section>

        {/* Beat 05 · The Portal (100vh) */}
        <section
          id="beat-05"
          aria-label="Beat 05 The Portal"
          className="relative w-full h-screen flex flex-col justify-between items-center px-6 sm:px-12 pt-28 sm:pt-36 pb-8"
        >
          <div
            id="enter"
            ref={beat5ContentRef}
            className="flex flex-col items-center text-center mt-4 sm:mt-8"
          >
            <h2 className="text-[clamp(2.4rem,5.5vw,4.75rem)] leading-[1.04] tracking-[-0.02em] text-[#FFF6EA] mb-8 sm:mb-10 [text-wrap:balance]">
              <span className="font-sans font-medium">Begin when </span>
              <span className="font-serif italic font-normal">ready.</span>
            </h2>

            <a
              ref={enterCtaRef}
              href="#enter"
              onPointerMove={handleMagneticMove}
              onPointerLeave={handleMagneticLeave}
              onClick={(e) => {
                e.preventDefault();
                setPortalStatus((prev) =>
                  prev === 'idle' ? 'entering' : 'idle',
                );
              }}
              className="inline-flex items-center justify-center font-mono text-xs tracking-[0.12em] text-[#FFF6EA] px-7 py-3.5 rounded-full whitespace-nowrap transition-[border-color,background-color,transform] duration-200 hover:bg-[#FFF6EA]/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C4BEFF]"
              style={{
                border: '1px solid rgba(255, 246, 234, 0.24)',
                transform: `translate3d(${magneticOffset.x}px, ${magneticOffset.y}px, 0)`,
              }}
            >
              {portalStatus === 'entering'
                ? 'Portal armed · Standby'
                : 'Enter IAL CHEM →'}
            </a>
          </div>

          <footer className="w-full text-center">
            <p className="font-mono text-[11px] tracking-[0.16em] text-[#FFF6EA]/45">
              WCH11 — WCH16 · 2018 SPECIFICATION · INDEPENDENT REVISION RESOURCE
            </p>
          </footer>
        </section>
      </main>
    </div>
  );
}
