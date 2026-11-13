import { useEffect, useRef, useState } from 'react';

type CursorVariant = 'default' | 'hold' | 'enter';

/**
 * Custom hairline crosshair cursor for desktop (pointer: fine) devices.
 * Uses lerp-smoothed GPU translate3d coordinates and automatically disables
 * on coarse/touch pointers and under prefers-reduced-motion.
 */
export function CustomCursor() {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);
  const [enabled, setEnabled] = useState<boolean>(false);

  useEffect(() => {
    const pointerFine = window.matchMedia('(pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const evaluateEnabled = () => {
      setEnabled(pointerFine.matches && !reducedMotion.matches);
    };
    evaluateEnabled();

    pointerFine.addEventListener('change', evaluateEnabled);
    reducedMotion.addEventListener('change', evaluateEnabled);

    return () => {
      pointerFine.removeEventListener('change', evaluateEnabled);
      reducedMotion.removeEventListener('change', evaluateEnabled);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    document.documentElement.classList.add('has-custom-cursor');

    let targetX = -100;
    let targetY = -100;
    let outerX = -100;
    let outerY = -100;
    let dotX = -100;
    let dotY = -100;
    let visible = false;
    let variant: CursorVariant = 'default';
    let frameId = 0;

    const applyVariantStyles = (next: CursorVariant) => {
      const outer = outerRef.current;
      const dot = dotRef.current;
      const label = labelRef.current;
      if (!outer || !dot || !label) return;

      if (next === 'default') {
        outer.style.width = '14px';
        outer.style.height = '14px';
        outer.style.borderColor = 'rgba(255, 246, 234, 0.45)';
        dot.style.opacity = visible ? '1' : '0';
        label.textContent = '';
        label.style.opacity = '0';
      } else {
        outer.style.width = '28px';
        outer.style.height = '28px';
        outer.style.borderColor = 'rgba(196, 190, 255, 0.75)';
        dot.style.opacity = visible ? '1' : '0';
        label.textContent = next === 'hold' ? 'HOLD' : 'ENTER';
        label.style.opacity = '1';
      }
    };

    const resolveVariant = (target: EventTarget | null): CursorVariant => {
      if (!(target instanceof Element)) return 'default';
      const match = target.closest('[data-cursor]');
      const attr = match?.getAttribute('data-cursor');
      if (attr === 'hold') return 'hold';
      if (attr === 'enter') return 'enter';
      return 'default';
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible) {
        visible = true;
        outerX = targetX;
        outerY = targetY;
        dotX = targetX;
        dotY = targetY;
        if (outerRef.current) outerRef.current.style.opacity = '1';
        if (dotRef.current) dotRef.current.style.opacity = '1';
      }
      const nextVariant = resolveVariant(e.target);
      if (nextVariant !== variant) {
        variant = nextVariant;
        applyVariantStyles(variant);
      }
    };

    const handlePointerLeave = () => {
      visible = false;
      if (outerRef.current) outerRef.current.style.opacity = '0';
      if (dotRef.current) dotRef.current.style.opacity = '0';
    };

    const tick = () => {
      outerX += (targetX - outerX) * 0.2;
      outerY += (targetY - outerY) * 0.2;
      dotX += (targetX - dotX) * 0.55;
      dotY += (targetY - dotY) * 0.55;

      if (outerRef.current) {
        outerRef.current.style.transform = `translate3d(${outerX}px, ${outerY}px, 0) translate3d(-50%, -50%, 0)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate3d(-50%, -50%, 0)`;
      }

      frameId = requestAnimationFrame(tick);
    };

    applyVariantStyles('default');
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerleave', handlePointerLeave);
    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
    >
      <div
        ref={outerRef}
        className="fixed top-0 left-0 rounded-full border bg-transparent transition-[width,height,border-color,opacity] duration-200 ease-out"
        style={{
          width: '14px',
          height: '14px',
          borderColor: 'rgba(255, 246, 234, 0.45)',
          opacity: 0,
        }}
      >
        <span
          ref={labelRef}
          className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+6px)] px-2 py-0.5 rounded-full bg-[#110E17]/90 border border-[#C4BEFF]/35 font-mono text-[9px] tracking-[0.18em] text-[#FFF6EA] whitespace-nowrap transition-opacity duration-150"
          style={{ opacity: 0 }}
        />
      </div>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-[2px] h-[2px] rounded-full bg-[#FFF6EA]"
        style={{ opacity: 0 }}
      />
    </div>
  );
}
