import { useEffect, useRef } from 'react';
import type { SiteTheme } from '../../data/ialData';
import { clampDeltaTime, getCappedPixelRatio } from '../../lib/motion';
import { stepHeroBodies, type HeroTokenBody } from '../../lib/physics';

interface HeroPhysicsCanvasProps {
  theme: SiteTheme;
  reducedMotion: boolean;
}

function createInitialHeroBodies(w: number, h: number): HeroTokenBody[] {
  const isCompact = w < 640;
  const rScale = isCompact ? 0.72 : 1;

  return [
    {
      id: 'tok-wch11',
      kind: 'capsule',
      label: 'WCH11',
      color: '#FF5C35',
      x: w * 0.13,
      y: h * 0.24,
      vx: 34,
      vy: 26,
      radius: 24 * rScale,
      width: 92 * rScale,
      height: 36 * rScale,
      squashX: 1,
      squashY: 1,
    },
    {
      id: 'tok-topics',
      kind: 'capsule',
      label: '33 Topics',
      color: '#8B5CF6',
      x: w * 0.86,
      y: h * 0.22,
      vx: -38,
      vy: 28,
      radius: 24 * rScale,
      width: 110 * rScale,
      height: 36 * rScale,
      squashX: 1,
      squashY: 1,
    },
    {
      id: 'tok-cmdk',
      kind: 'sphere',
      label: '⌘K',
      color: '#14B8A6',
      x: w * 0.16,
      y: h * 0.76,
      vx: 28,
      vy: -32,
      radius: 26 * rScale,
      width: 52 * rScale,
      height: 52 * rScale,
      squashX: 1,
      squashY: 1,
    },
    {
      id: 'tok-examples',
      kind: 'capsule',
      label: '30 Examples',
      color: '#F59E0B',
      x: w * 0.84,
      y: h * 0.74,
      vx: -30,
      vy: -26,
      radius: 24 * rScale,
      width: 122 * rScale,
      height: 36 * rScale,
      squashX: 1,
      squashY: 1,
    },
    {
      id: 'tok-spec',
      kind: 'capsule',
      label: '2018 Spec',
      color: '#EC4899',
      x: w * 0.11,
      y: h * 0.5,
      vx: 24,
      vy: 30,
      radius: 22 * rScale,
      width: 108 * rScale,
      height: 34 * rScale,
      squashX: 1,
      squashY: 1,
    },
    {
      id: 'tok-glass-1',
      kind: 'sphere',
      label: '',
      color: '#3B82F6',
      x: w * 0.89,
      y: h * 0.48,
      vx: -26,
      vy: 22,
      radius: 22 * rScale,
      width: 44 * rScale,
      height: 44 * rScale,
      squashX: 1,
      squashY: 1,
    },
    {
      id: 'tok-glass-2',
      kind: 'sphere',
      label: '',
      color: '#FF5C35',
      x: w * 0.25,
      y: h * 0.14,
      vx: 22,
      vy: 24,
      radius: 14 * rScale,
      width: 28 * rScale,
      height: 28 * rScale,
      squashX: 1,
      squashY: 1,
    },
    {
      id: 'tok-glass-3',
      kind: 'sphere',
      label: '',
      color: '#14B8A6',
      x: w * 0.74,
      y: h * 0.85,
      vx: -24,
      vy: -22,
      radius: 16 * rScale,
      width: 32 * rScale,
      height: 32 * rScale,
      squashX: 1,
      squashY: 1,
    },
  ];
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}

export function HeroPhysicsCanvas({ theme, reducedMotion }: HeroPhysicsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const themeRef = useRef(theme);
  const reducedRef = useRef(reducedMotion);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    reducedRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.parentElement?.clientWidth || window.innerWidth;
    let height = canvas.parentElement?.clientHeight || window.innerHeight;
    let dpr = getCappedPixelRatio(window.innerWidth, window.devicePixelRatio || 1);
    let bodies = createInitialHeroBodies(width, height);
    let visible = true;
    let rafId = 0;
    let lastTs = performance.now();
    const pointer = { x: -1000, y: -1000, active: false };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = Math.max(parent.clientWidth, 320);
      height = Math.max(parent.clientHeight, 480);
      dpr = getCappedPixelRatio(window.innerWidth, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      bodies = createInitialHeroBodies(width, height);
      drawFrame();
    };

    const drawFrame = () => {
      const isPlum = themeRef.current === 'plum';
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Subtle hairline orbital guides centered behind typography
      const cx = width * 0.5;
      const cy = height * 0.48;
      ctx.strokeStyle = isPlum
        ? 'rgba(255, 246, 234, 0.065)'
        : 'rgba(30, 26, 38, 0.075)';
      ctx.lineWidth = 1;
      [Math.min(width, height) * 0.34, Math.min(width, height) * 0.48].forEach(
        (rx, i) => {
          ctx.beginPath();
          ctx.ellipse(
            cx,
            cy,
            rx * 1.18,
            rx * 0.72,
            i === 0 ? -0.18 : 0.14,
            0,
            Math.PI * 2,
          );
          ctx.stroke();
        },
      );

      const isCompact = width < 640;
      const bodyAlpha = isCompact ? 0.52 : 0.9;

      for (const b of bodies) {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.scale(b.squashX, b.squashY);
        ctx.globalAlpha = bodyAlpha;

        if (b.kind === 'sphere') {
          // Soft shaded glass/pigment sphere
          const grad = ctx.createRadialGradient(
            -b.radius * 0.32,
            -b.radius * 0.35,
            b.radius * 0.12,
            0,
            0,
            b.radius,
          );
          grad.addColorStop(0, '#FFFDF9');
          grad.addColorStop(0.28, b.color);
          grad.addColorStop(1, isPlum ? 'rgba(21,18,28,0.65)' : 'rgba(30,26,38,0.22)');

          ctx.beginPath();
          ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          ctx.lineWidth = 1;
          ctx.strokeStyle = isPlum
            ? 'rgba(255, 246, 234, 0.28)'
            : 'rgba(30, 26, 38, 0.18)';
          ctx.stroke();

          if (b.label) {
            ctx.fillStyle = '#FFFDF9';
            ctx.font = `600 ${Math.round(12 * (isCompact ? 0.85 : 1))}px "JetBrains Mono", monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(b.label, 0, 1);
          }
        } else {
          // Softly beveled studio pigment capsule token
          const x = -b.width / 2;
          const y = -b.height / 2;
          drawRoundedRectPath(ctx, x, y, b.width, b.height, b.height / 2);

          ctx.fillStyle = isPlum ? 'rgba(30, 26, 38, 0.92)' : 'rgba(255, 253, 249, 0.94)';
          ctx.fill();

          ctx.lineWidth = 1.25;
          ctx.strokeStyle = b.color;
          ctx.stroke();

          // Small pigment dot inside capsule left
          const dotR = isCompact ? 3.5 : 4.5;
          ctx.beginPath();
          ctx.arc(x + 15, 0, dotR, 0, Math.PI * 2);
          ctx.fillStyle = b.color;
          ctx.fill();

          ctx.fillStyle = isPlum ? '#FFF6EA' : '#1E1A26';
          ctx.font = `500 ${isCompact ? 10 : 12}px "JetBrains Mono", monospace`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(b.label, x + 25, 0.5);
        }
        ctx.restore();
      }

      ctx.restore();
    };

    const tick = (now: number) => {
      if (!visible) return;
      const dt = clampDeltaTime((now - lastTs) / 1000);
      lastTs = now;
      if (!reducedRef.current) {
        stepHeroBodies(bodies, width, height, dt, pointer);
      }
      drawFrame();
      if (!reducedRef.current) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active =
        pointer.x >= 0 && pointer.x <= rect.width && pointer.y >= 0 && pointer.y <= rect.height;
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    const resizeObserver = new ResizeObserver(resize);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        visible = entry.isIntersecting;
        window.cancelAnimationFrame(rafId);
        if (visible && !reducedRef.current) {
          lastTs = performance.now();
          rafId = window.requestAnimationFrame(tick);
        } else if (visible) {
          drawFrame();
        }
      },
      { threshold: 0.02 },
    );
    intersectionObserver.observe(canvas);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });

    resize();
    if (!reducedRef.current) {
      rafId = window.requestAnimationFrame(tick);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      data-testid="hero-physics-canvas"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
