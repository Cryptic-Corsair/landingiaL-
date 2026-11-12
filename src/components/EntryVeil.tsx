import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export interface EntryVeilProps {
  onRevealComplete?: () => void;
}

/**
 * Non-blocking Entry Veil (<= 0.7s total):
 * Counts 00 -> 100 in tabular monospace and parts upward via clip-path.
 * Skipped immediately when prefers-reduced-motion or ?autostart=1 is active.
 */
export function EntryVeil({ onRevealComplete }: EntryVeilProps) {
  const veilRef = useRef<HTMLDivElement | null>(null);
  const counterRef = useRef<HTMLSpanElement | null>(null);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') return true;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (dismissed) {
      onRevealComplete?.();
      return;
    }

    const veil = veilRef.current;
    const counter = counterRef.current;
    if (!veil || !counter) return;

    const progress = { value: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        setDismissed(true);
        onRevealComplete?.();
      },
    });

    // Crisp 00 -> 100 count (~0.36s) followed by immediate upward clip-path part (~0.32s)
    tl.to(progress, {
      value: 100,
      duration: 0.36,
      ease: 'power2.out',
      onUpdate: () => {
        const rounded = Math.min(100, Math.round(progress.value));
        counter.textContent = rounded.toString().padStart(2, '0');
      },
    }).to(
      veil,
      {
        clipPath: 'inset(0% 0% 100% 0%)',
        duration: 0.32,
        ease: 'power3.inOut',
      },
      '+=0.02',
    );

    return () => {
      tl.kill();
    };
  }, [dismissed, onRevealComplete]);

  if (dismissed) return null;

  return (
    <div
      ref={veilRef}
      aria-hidden="true"
      data-testid="entry-veil"
      className="fixed inset-0 z-50 flex items-end justify-end p-6 sm:p-10 bg-[#110E17] pointer-events-none"
      style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
    >
      <span
        ref={counterRef}
        className="font-mono tabular-nums text-xs sm:text-sm tracking-[0.22em] text-[#FFF6EA]"
      >
        00
      </span>
    </div>
  );
}
