import { useEffect, useRef } from 'react';
import type { MotionValue } from 'motion/react';
import type { SiteTheme } from '../../data/ialData';
import { clampDeltaTime, getCappedPixelRatio } from '../../lib/motion';

interface KineticInterludeCanvasProps {
  theme: SiteTheme;
  velocitySmooth: MotionValue<number>;
  reducedMotion: boolean;
}

export function KineticInterludeCanvas({
  theme,
  velocitySmooth,
  reducedMotion,
}: KineticInterludeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const themeRef = useRef<SiteTheme>(theme);
  const reducedMotionRef = useRef<boolean>(reducedMotion);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let time = 0;
    let isVisible = true;
    let rafId = 0;
    let lastTs = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(rect.width, 1);
      height = Math.max(rect.height, 1);
      dpr = getCappedPixelRatio(window.innerWidth, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };

    const drawFrame = (elapsed: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const isCream = themeRef.current === 'cream';
      const inkRgb = isCream ? '30, 26, 38' : '255, 246, 234';
      const accentRgb = isCream ? '79, 70, 229' : '196, 181, 253';
      const warmRgb = isCream ? '180, 83, 9' : '242, 198, 141';

      const vel = reducedMotionRef.current ? 0 : velocitySmooth.get();
      const velocityBoost = Math.min(1.6, Math.abs(vel) / 1400);

      const cx = width * 0.5;
      const cy = height * 0.5;
      const baseRadius = Math.min(width, height) * 0.34;

      // Subtle architectural calibration lattice crosshairs
      ctx.strokeStyle = `rgba(${inkRgb}, ${isCream ? 0.055 : 0.045})`;
      ctx.lineWidth = 1;
      const cols = width < 640 ? 6 : 12;
      const colStep = width / cols;
      for (let i = 1; i < cols; i++) {
        const x = Math.round(i * colStep) + 0.5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Concentric calibrated orbital arcs reacting gently to scroll velocity
      const ringCount = 5;
      for (let r = 0; r < ringCount; r++) {
        const radius = baseRadius * (0.42 + r * 0.24);
        const speed = (r % 2 === 0 ? 1 : -1) * (0.14 + r * 0.03);
        const startAngle = elapsed * speed + r * 0.9 + velocityBoost * 0.45 * (r % 2 === 0 ? 1 : -1);
        const arcSpan = Math.PI * (0.85 + (r % 3) * 0.28);

        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, startAngle + arcSpan);
        ctx.strokeStyle =
          r === 2
            ? `rgba(${accentRgb}, ${isCream ? 0.26 : 0.30})`
            : `rgba(${inkRgb}, ${0.09 + (r === 4 ? 0.05 : 0)})`;
        ctx.lineWidth = r === 2 ? 1.25 : 1;
        ctx.stroke();

        // Subtle opposing calibration arc
        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle + Math.PI + 0.25, startAngle + Math.PI + 0.25 + arcSpan * 0.52);
        ctx.strokeStyle = `rgba(${inkRgb}, 0.06)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Phase-shifted harmonic interference waves across full width
      const waveCount = 4;
      const samples = width < 640 ? 64 : 110;
      for (let w = 0; w < waveCount; w++) {
        const freq = 1.6 + w * 0.55;
        const amp = (height * 0.08 + velocityBoost * 24) * (1 - w * 0.14);
        const phase = elapsed * (0.55 + w * 0.14) + w * 1.15;

        ctx.beginPath();
        for (let i = 0; i <= samples; i++) {
          const u = i / samples;
          const x = u * width;
          const envelope = Math.sin(u * Math.PI);
          const y =
            cy +
            Math.sin(u * Math.PI * freq + phase) * amp * envelope +
            Math.cos(u * Math.PI * (freq * 1.75) - phase * 0.8) * (amp * 0.35) * envelope;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        if (w === 0) {
          ctx.strokeStyle = `rgba(${accentRgb}, ${isCream ? 0.32 : 0.36})`;
        } else if (w === 1) {
          ctx.strokeStyle = `rgba(${warmRgb}, ${isCream ? 0.22 : 0.26})`;
        } else {
          ctx.strokeStyle = `rgba(${inkRgb}, ${0.12 - w * 0.02})`;
        }
        ctx.lineWidth = w < 2 ? 1.25 : 1;
        ctx.stroke();
      }
    };

    const tick = () => {
      if (!isVisible) return;
      const now = performance.now();
      const dt = clampDeltaTime((now - lastTs) / 1000);
      lastTs = now;

      if (!reducedMotionRef.current) {
        const vel = Math.min(1.8, Math.abs(velocitySmooth.get()) / 1200);
        time += dt * (1 + vel * 0.9);
      }

      drawFrame(time);
      if (!reducedMotionRef.current) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      drawFrame(time);
    });
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          isVisible = true;
          lastTs = performance.now();
          drawFrame(time);
          if (!reducedMotionRef.current) {
            window.cancelAnimationFrame(rafId);
            rafId = window.requestAnimationFrame(tick);
          }
        } else {
          isVisible = false;
          window.cancelAnimationFrame(rafId);
        }
      },
      { threshold: 0.02 },
    );
    intersectionObserver.observe(canvas);

    resize();
    drawFrame(0.8);
    if (!reducedMotionRef.current) {
      rafId = window.requestAnimationFrame(tick);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [velocitySmooth]);

  return (
    <canvas
      ref={canvasRef}
      data-testid="kinetic-interlude-canvas"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
