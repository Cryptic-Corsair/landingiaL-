import { useEffect, useRef, useState } from 'react';

interface CustomCursorProps {
  reducedMotion: boolean;
}

export function CustomCursor({ reducedMotion }: CustomCursorProps) {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState<string>('');
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const posRef = useRef({ tx: -100, ty: -100, x: -100, y: -100 });

  useEffect(() => {
    if (reducedMotion || typeof window === 'undefined') {
      setEnabled(false);
      return;
    }
    const fineMq = window.matchMedia('(pointer: fine)');
    const sync = () => setEnabled(fineMq.matches && !reducedMotion);
    sync();
    fineMq.addEventListener('change', sync);
    return () => fineMq.removeEventListener('change', sync);
  }, [reducedMotion]);

  useEffect(() => {
    if (!enabled) return;

    let rafId = 0;

    const syncCursorLabel = () => {
      const p = posRef.current;
      const el = document.elementFromPoint(p.tx, p.ty);
      const target = el ? el.closest('[data-cursor]') : null;
      const nextLabel = target?.getAttribute('data-cursor') ?? '';
      setLabel((prev) => (prev === nextLabel ? prev : nextLabel));
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      posRef.current.tx = e.clientX;
      posRef.current.ty = e.clientY;
      setVisible(true);

      const target = e.target instanceof Element ? e.target.closest('[data-cursor]') : null;
      const nextLabel = target?.getAttribute('data-cursor') ?? '';
      setLabel((prev) => (prev === nextLabel ? prev : nextLabel));
    };

    const onPointerLeave = () => {
      setVisible(false);
      setLabel('');
    };

    const tick = () => {
      const p = posRef.current;
      p.x += (p.tx - p.x) * 0.24;
      p.y += (p.ty - p.y) * 0.24;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
      }
      rafId = window.requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', syncCursorLabel, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave);
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', syncCursorLabel);
      document.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [enabled]);

  if (!enabled || !visible) return null;

  const hasLabel = label.length > 0;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[90]"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {/* Precision Ring + Dot Centered at Exact Pointer Position */}
      <div className="relative -translate-x-1/2 -translate-y-1/2 flex h-3.5 w-3.5 items-center justify-center">
        <span
          className="absolute inset-0 rounded-full border transition-transform duration-150"
          style={{
            borderColor: 'var(--ink)',
            transform: hasLabel ? 'scale(1.25)' : 'scale(1)',
          }}
        />
        <span
          className="h-[3px] w-[3px] rounded-full"
          style={{ backgroundColor: 'var(--coral)' }}
        />
      </div>

      {/* Offset Contextual Badge So Button Labels Stay 100% Legible */}
      {hasLabel && (
        <div
          className="absolute left-3.5 top-3.5 flex h-6 items-center justify-center rounded-full border px-2 font-mono text-[9px] font-medium tracking-[0.14em] uppercase shadow-sm whitespace-nowrap"
          style={{
            backgroundColor: 'var(--ink)',
            color: 'var(--bg)',
            borderColor: 'var(--border-strong)',
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
