import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { Grid, RotateCcw } from 'lucide-react';
import { SANDBOX_PILLS } from '../../data/ialData';
import {
  computeSandboxSnapTargets,
  createSandboxBodies,
  stepSandboxPhysics,
  type SandboxPillBody,
} from '../../lib/physics';
import { soundEngine } from '../../lib/sound';

interface GravitySandboxProps {
  reducedMotion: boolean;
}

export function GravitySandbox({ reducedMotion }: GravitySandboxProps) {
  const trayRef = useRef<HTMLDivElement | null>(null);
  const pillRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const bodiesRef = useRef<SandboxPillBody[]>([]);
  const modeRef = useRef<'chaos' | 'snap'>(reducedMotion ? 'snap' : 'chaos');
  const inViewRef = useRef(false);
  const initializedRef = useRef(false);
  const dimsRef = useRef({ width: 920, height: 440 });

  const dragRef = useRef<{
    id: string;
    pointerId: number;
    offsetX: number;
    offsetY: number;
    lastX: number;
    lastY: number;
    lastTime: number;
    vx: number;
    vy: number;
  } | null>(null);

  const [mode, setMode] = useState<'chaos' | 'snap'>(reducedMotion ? 'snap' : 'chaos');
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const syncDomPositions = useCallback(() => {
    for (const b of bodiesRef.current) {
      const el = pillRefs.current[b.id];
      if (!el) continue;
      el.style.width = `${b.width}px`;
      el.style.height = `${b.height}px`;
      el.style.transform = `translate3d(${(b.x - b.width / 2).toFixed(1)}px, ${(b.y - b.height / 2).toFixed(1)}px, 0) rotate(${b.angle.toFixed(4)}rad)`;
    }
  }, []);

  const initBodies = useCallback(
    (forceSnap: boolean) => {
      const tray = trayRef.current;
      const width = tray ? tray.clientWidth : 920;
      const height = tray ? tray.clientHeight : 440;
      dimsRef.current = { width, height };
      const bodies = createSandboxBodies(SANDBOX_PILLS, width, height);
      if (forceSnap) {
        for (const b of bodies) {
          b.x = b.targetX;
          b.y = b.targetY;
          b.vx = 0;
          b.vy = 0;
          b.angle = 0;
        }
      }
      bodiesRef.current = bodies;
      initializedRef.current = true;
      syncDomPositions();
    },
    [syncDomPositions],
  );

  // Measure tray & update snap targets on resize
  useEffect(() => {
    const tray = trayRef.current;
    if (!tray) return;

    const updateSize = () => {
      const width = tray.clientWidth || 920;
      const height = tray.clientHeight || 440;
      dimsRef.current = { width, height };

      if (!initializedRef.current) {
        initBodies(reducedMotion);
        return;
      }

      const targets = computeSandboxSnapTargets(
        width,
        height,
        bodiesRef.current.map((b) => ({ id: b.id, width: b.width, height: b.height })),
      );
      for (const b of bodiesRef.current) {
        const t = targets[b.id];
        if (t) {
          b.targetX = t.x;
          b.targetY = t.y;
          if (reducedMotion || modeRef.current === 'snap') {
            b.x = t.x;
            b.y = t.y;
          }
        }
      }
      syncDomPositions();
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(tray);
    return () => ro.disconnect();
  }, [initBodies, reducedMotion, syncDomPositions]);

  // IntersectionObserver + rAF loop (pauses offscreen)
  useEffect(() => {
    const tray = trayRef.current;
    if (!tray) return;

    if (reducedMotion) {
      modeRef.current = 'snap';
      setMode('snap');
      initBodies(true);
      return;
    }

    let rafId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.035);
      lastTime = now;

      if (inViewRef.current && bodiesRef.current.length > 0) {
        stepSandboxPhysics(
          bodiesRef.current,
          dimsRef.current.width,
          dimsRef.current.height,
          dt,
          modeRef.current,
        );
        syncDomPositions();
      }

      if (inViewRef.current) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        inViewRef.current = visible;
        if (visible) {
          if (!initializedRef.current) {
            initBodies(false);
          }
          lastTime = performance.now();
          window.cancelAnimationFrame(rafId);
          rafId = window.requestAnimationFrame(tick);
        } else {
          window.cancelAnimationFrame(rafId);
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(tray);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(rafId);
    };
  }, [initBodies, reducedMotion, syncDomPositions]);

  const handleSnap = () => {
    soundEngine.playChime();
    modeRef.current = 'snap';
    setMode('snap');
    if (reducedMotion) {
      for (const b of bodiesRef.current) {
        b.x = b.targetX;
        b.y = b.targetY;
        b.angle = 0;
      }
      syncDomPositions();
    }
  };

  const handleDropChaos = () => {
    soundEngine.playPop(380);
    modeRef.current = 'chaos';
    setMode('chaos');
    const { width } = dimsRef.current;
    bodiesRef.current.forEach((b, idx) => {
      b.x = Math.max(80, Math.min(width - 80, b.x));
      b.y = -30 - Math.floor(idx / 4) * 52;
      b.vx = ((idx % 5) - 2) * 55;
      b.vy = 60 + (idx % 3) * 30;
      b.vAngle = ((idx % 3) - 1) * 1.1;
    });
    if (reducedMotion) {
      for (const b of bodiesRef.current) {
        b.x = b.targetX;
        b.y = b.targetY;
        b.angle = 0;
      }
      syncDomPositions();
    }
  };

  const onPillPointerDown = (id: string, e: PointerEvent<HTMLButtonElement>) => {
    const tray = trayRef.current;
    if (!tray) return;
    const body = bodiesRef.current.find((b) => b.id === id);
    if (!body) return;

    if (modeRef.current === 'snap' && !reducedMotion) {
      modeRef.current = 'chaos';
      setMode('chaos');
    }

    const rect = tray.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    body.dragging = true;
    body.vx = 0;
    body.vy = 0;
    setDraggingId(id);
    soundEngine.playClick(620);

    dragRef.current = {
      id,
      pointerId: e.pointerId,
      offsetX: body.x - px,
      offsetY: body.y - py,
      lastX: px,
      lastY: py,
      lastTime: performance.now(),
      vx: 0,
      vy: 0,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPillPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    const tray = trayRef.current;
    if (!drag || !tray || drag.pointerId !== e.pointerId) return;

    const body = bodiesRef.current.find((b) => b.id === drag.id);
    if (!body) return;

    const rect = tray.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const now = performance.now();
    const dt = Math.max((now - drag.lastTime) / 1000, 0.008);

    const nextX = Math.max(
      body.width / 2 + 8,
      Math.min(rect.width - body.width / 2 - 8, px + drag.offsetX),
    );
    const nextY = Math.max(
      body.height / 2 + 8,
      Math.min(rect.height - body.height / 2 - 8, py + drag.offsetY),
    );

    drag.vx = Math.max(-1100, Math.min(1100, (px - drag.lastX) / dt));
    drag.vy = Math.max(-1100, Math.min(1100, (py - drag.lastY) / dt));
    drag.lastX = px;
    drag.lastY = py;
    drag.lastTime = now;

    body.x = nextX;
    body.y = nextY;
    body.angle = Math.max(-0.25, Math.min(0.25, drag.vx * 0.0003));
    syncDomPositions();
  };

  const onPillPointerUp = (e: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const body = bodiesRef.current.find((b) => b.id === drag.id);
    if (body) {
      body.dragging = false;
      body.vx = drag.vx;
      body.vy = drag.vy;
      body.vAngle = (drag.vx * 0.0012);
    }
    dragRef.current = null;
    setDraggingId(null);
    soundEngine.playPop(460);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <section
      id="sandbox"
      aria-label="Throw and Sort Gravity Sandbox"
      className="relative py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Heading + Snap / Drop Controls */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p
              className="font-mono text-[11px] tracking-[0.16em] uppercase"
              style={{ color: 'var(--ink-muted)' }}
            >
              THROW &amp; SORT SANDBOX
            </p>
            <h2
              className="mt-2.5 text-balance font-display font-semibold tracking-[-0.025em] leading-[1.06]"
              style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3rem)' }}
            >
              Fling the syllabus.{' '}
              <span className="font-serif italic font-normal" style={{ color: 'var(--coral)' }}>
                Snap it clean.
              </span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              data-testid="sandbox-snap-btn"
              data-cursor="CLICK"
              aria-pressed={mode === 'snap'}
              onClick={handleSnap}
              className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-semibold transition-transform duration-150 active:scale-95 whitespace-nowrap shrink-0"
              style={{
                backgroundColor: mode === 'snap' ? 'var(--teal)' : 'var(--ink)',
                color: mode === 'snap' ? '#0E1F1D' : 'var(--bg)',
              }}
            >
              <Grid className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Snap to Order</span>
            </button>

            <button
              type="button"
              data-testid="sandbox-drop-btn"
              data-cursor="CLICK"
              onClick={handleDropChaos}
              className="inline-flex h-10 items-center gap-2 rounded-full border px-4 text-xs font-medium transition-transform duration-150 active:scale-95 whitespace-nowrap shrink-0"
              style={{
                borderColor: 'var(--border-strong)',
                backgroundColor: 'var(--surface)',
                color: 'var(--ink)',
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Drop Chaos</span>
            </button>
          </div>
        </div>

        {/* Bounded Playground Tray */}
        <div
          ref={trayRef}
          data-testid="gravity-sandbox-tray"
          data-mode={mode}
          className="relative mt-8 h-[440px] w-full overflow-hidden rounded-[28px] border shadow-inner select-none"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border-strong)',
          }}
        >
          {/* Subtle calibration dot grid inside tray */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(circle, var(--border-strong) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* Quiet Tray Footer Hint */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-4 left-5 right-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em]"
            style={{ color: 'var(--ink-muted)' }}
          >
            <span>14 Syllabus Tokens · Grab &amp; Fling</span>
            <span className="tabular-nums">
              State: {mode === 'snap' ? 'Aligned' : 'Live Gravity'}
            </span>
          </div>

          {SANDBOX_PILLS.map((pill) => {
            const isDragging = draggingId === pill.id;
            return (
              <button
                key={pill.id}
                ref={(el) => {
                  pillRefs.current[pill.id] = el;
                }}
                type="button"
                data-testid={`sandbox-pill-${pill.id}`}
                data-cursor="DRAG"
                onPointerDown={(e) => onPillPointerDown(pill.id, e)}
                onPointerMove={onPillPointerMove}
                onPointerUp={onPillPointerUp}
                onPointerCancel={onPillPointerUp}
                onClick={() => {
                  if (modeRef.current === 'snap' && !reducedMotion) {
                    soundEngine.playPop(560);
                  }
                }}
                className="touch-none absolute left-0 top-0 inline-flex items-center justify-center rounded-full border border-b-[3px] px-4 font-display text-xs sm:text-sm font-medium tracking-tight shadow-sm will-change-transform whitespace-nowrap"
                style={{
                  backgroundColor: pill.color,
                  color: pill.textColor,
                  borderColor: 'rgba(21, 18, 28, 0.22)',
                  zIndex: isDragging ? 20 : 5,
                  cursor: isDragging ? 'grabbing' : 'grab',
                }}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
