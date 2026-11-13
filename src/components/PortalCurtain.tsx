import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export interface PortalCurtainProps {
  open: boolean;
  onReplay: () => void;
}

/**
 * Full-screen cinematic curtain wipe transition when entering IAL CHEM.
 * Includes a subtle Replay Experience action to preview the loop in AI Studio.
 */
export function PortalCurtain({ open, onReplay }: PortalCurtainProps) {
  const curtainRef = useRef<HTMLDivElement | null>(null);
  const flashRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const curtain = curtainRef.current;
    const flash = flashRef.current;
    const content = contentRef.current;
    if (!curtain || !flash || !content) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (!open) {
      if (prefersReducedMotion) {
        gsap.set(curtain, {
          clipPath: 'inset(100% 0% 0% 0%)',
          pointerEvents: 'none',
        });
        gsap.set(content, { opacity: 0 });
        return;
      }

      const closeTl = gsap.timeline();
      closeTl
        .to(content, { opacity: 0, duration: 0.18, ease: 'power2.in' })
        .to(curtain, {
          clipPath: 'inset(0% 0% 100% 0%)',
          duration: 0.55,
          ease: 'power3.inOut',
          onComplete: () => {
            gsap.set(curtain, {
              clipPath: 'inset(100% 0% 0% 0%)',
              pointerEvents: 'none',
            });
          },
        });

      return () => {
        closeTl.kill();
      };
    }

    // Open curtain wipe
    gsap.set(curtain, { pointerEvents: 'auto' });

    if (prefersReducedMotion) {
      gsap.set(curtain, { clipPath: 'inset(0% 0% 0% 0%)' });
      gsap.set(flash, { opacity: 0 });
      gsap.set(content, { opacity: 1, y: 0 });
      return;
    }

    const tl = gsap.timeline();
    tl.fromTo(
      flash,
      { clipPath: 'inset(100% 0% 0% 0%)', opacity: 0.9 },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.42,
        ease: 'power3.inOut',
      },
    )
      .fromTo(
        curtain,
        { clipPath: 'inset(100% 0% 0% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 0.58,
          ease: 'power3.inOut',
        },
        '-=0.28',
      )
      .to(flash, { opacity: 0, duration: 0.2 }, '-=0.15')
      .fromTo(
        content,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
        '-=0.2',
      );

    return () => {
      tl.kill();
    };
  }, [open]);

  return (
    <div
      ref={curtainRef}
      role="dialog"
      aria-modal={open}
      aria-hidden={!open}
      aria-label="Portal transition"
      data-testid="portal-curtain"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#110E17] px-6"
      style={{
        clipPath: 'inset(100% 0% 0% 0%)',
        pointerEvents: open ? 'auto' : 'none',
      }}
    >
      {/* Brief warm bone leading wipe accent */}
      <div
        ref={flashRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[#FFF6EA]/12"
        style={{ clipPath: 'inset(100% 0% 0% 0%)' }}
      />

      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center text-center max-w-md"
        style={{ opacity: 0 }}
      >
        <p className="font-mono text-[11px] tracking-[0.22em] text-[#9D94B8] mb-4">
          IAL CHEM · PORTAL
        </p>
        <h2 className="text-[clamp(1.85rem,4vw,3rem)] leading-[1.08] tracking-[-0.02em] text-[#FFF6EA] mb-8">
          <span className="font-sans font-medium">Entering </span>
          <span className="font-serif italic font-normal text-[#C4BEFF]">
            workspace...
          </span>
        </h2>

        <button
          type="button"
          onClick={onReplay}
          className="font-mono text-xs tracking-[0.12em] text-[#9D94B8] hover:text-[#FFF6EA] px-5 py-2.5 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C4BEFF] cursor-pointer"
          style={{ border: '1px solid rgba(157, 148, 184, 0.25)' }}
        >
          Replay Experience
        </button>
      </div>
    </div>
  );
}
