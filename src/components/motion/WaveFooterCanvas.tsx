import { useEffect, useRef } from 'react';
import type { SiteTheme } from '../../data/ialData';
import {
  clampDeltaTime,
  getCappedPixelRatio,
  sampleHarmonicWaveY,
} from '../../lib/motion';

interface WaveFooterCanvasProps {
  theme: SiteTheme;
  reducedMotion: boolean;
}

const THEME_PALETTES: Record<
  SiteTheme,
  {
    surface: string;
    elevatedTint: string;
    backRibbon: string;
    primaryStroke: string;
    secondaryStroke: string;
    tertiaryStroke: string;
  }
> = {
  obsidian: {
    surface: '#131118',
    elevatedTint: 'rgba(26, 23, 34, 0.72)',
    backRibbon: 'rgba(196, 181, 253, 0.05)',
    primaryStroke: 'rgba(196, 181, 253, 0.42)',
    secondaryStroke: 'rgba(242, 198, 141, 0.24)',
    tertiaryStroke: 'rgba(255, 246, 234, 0.14)',
  },
  cream: {
    surface: '#FFFDF9',
    elevatedTint: 'rgba(243, 237, 226, 0.78)',
    backRibbon: 'rgba(79, 70, 229, 0.045)',
    primaryStroke: 'rgba(79, 70, 229, 0.34)',
    secondaryStroke: 'rgba(180, 83, 9, 0.22)',
    tertiaryStroke: 'rgba(30, 26, 38, 0.14)',
  },
};

export function WaveFooterCanvas({ theme, reducedMotion }: WaveFooterCanvasProps) {
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

    let width = Math.max(canvas.clientWidth, 1);
    let height = Math.max(canvas.clientHeight, 1);
    let dpr = getCappedPixelRatio(window.innerWidth, window.devicePixelRatio || 1);

    const resize = () => {
      const parent = canvas.parentElement;
      width = Math.max(parent?.clientWidth ?? window.innerWidth, 1);
      height = Math.max(parent?.clientHeight ?? 160, 1);
      dpr = getCappedPixelRatio(window.innerWidth, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    let phase = 0.75;
    let pointerXTarget = 0.5;
    let pointerXCurrent = 0.5;
    let pointerStrengthTarget = 0;
    let pointerStrengthCurrent = 0;
    let isVisible = false;
    let rafId = 0;
    let lastTs = performance.now();

    const drawRibbon = (options: {
      baseY: number;
      amplitude: number;
      layerPhase: number;
      fillStyle?: string;
      strokeStyle?: string;
      lineWidth?: number;
      fillToBottom: boolean;
    }) => {
      const steps = Math.max(48, Math.min(120, Math.round(width / 14)));
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const xNorm = i / steps;
        const x = xNorm * width;
        const y = sampleHarmonicWaveY({
          xNorm,
          baseY: options.baseY,
          amplitude: options.amplitude,
          phase: options.layerPhase,
          pointerXNorm: pointerXCurrent,
          pointerStrength: pointerStrengthCurrent,
        });
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      if (options.fillToBottom && options.fillStyle) {
        ctx.lineTo(width, height + 2);
        ctx.lineTo(0, height + 2);
        ctx.closePath();
        ctx.fillStyle = options.fillStyle;
        ctx.fill();
      }

      if (options.strokeStyle) {
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const xNorm = i / steps;
          const x = xNorm * width;
          const y = sampleHarmonicWaveY({
            xNorm,
            baseY: options.baseY,
            amplitude: options.amplitude,
            phase: options.layerPhase,
            pointerXNorm: pointerXCurrent,
            pointerStrength: pointerStrengthCurrent,
          });
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = options.strokeStyle;
        ctx.lineWidth = options.lineWidth ?? 1.25;
        ctx.stroke();
      }
    };

    const renderFrame = (advance: boolean) => {
      const now = performance.now();
      const dt = clampDeltaTime((now - lastTs) / 1000);
      lastTs = now;

      if (advance && !reducedMotionRef.current) {
        phase += dt * 0.85;
      }

      const damp = 1 - Math.exp(-6.5 * dt);
      pointerXCurrent += (pointerXTarget - pointerXCurrent) * damp;
      pointerStrengthCurrent += (pointerStrengthTarget - pointerStrengthCurrent) * damp;

      const p = THEME_PALETTES[themeRef.current];
      ctx.clearRect(0, 0, width, height);

      // Back harmonic echo fill
      drawRibbon({
        baseY: height * 0.36,
        amplitude: height * 0.16,
        layerPhase: phase * 0.7 + 1.4,
        fillStyle: p.backRibbon,
        strokeStyle: p.tertiaryStroke,
        lineWidth: 1,
        fillToBottom: true,
      });

      // Mid warm harmonic interference crest
      drawRibbon({
        baseY: height * 0.48,
        amplitude: height * 0.18,
        layerPhase: -phase * 0.85 + 2.7,
        fillStyle: p.elevatedTint,
        strokeStyle: p.secondaryStroke,
        lineWidth: 1.15,
        fillToBottom: true,
      });

      // Foreground crest merging seamlessly into footer --surface hex
      drawRibbon({
        baseY: height * 0.62,
        amplitude: height * 0.17,
        layerPhase: phase,
        fillStyle: p.surface,
        strokeStyle: p.primaryStroke,
        lineWidth: 1.5,
        fillToBottom: true,
      });
    };

    const tick = () => {
      if (!isVisible) return;
      renderFrame(true);
      if (reducedMotionRef.current) return;
      rafId = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      window.cancelAnimationFrame(rafId);
      lastTs = performance.now();
      renderFrame(false);
      if (!reducedMotionRef.current && isVisible) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0) return;
      if (e.clientY >= rect.top - 90 && e.clientY <= rect.bottom + 140) {
        pointerXTarget = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        pointerStrengthTarget = 1;
      } else {
        pointerStrengthTarget = 0;
      }
    };

    const onPointerLeave = () => {
      pointerStrengthTarget = 0;
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      renderFrame(false);
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          isVisible = true;
          startLoop();
        } else {
          isVisible = false;
          window.cancelAnimationFrame(rafId);
        }
      },
      { threshold: 0.01 },
    );
    intersectionObserver.observe(canvas);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });

    // Initial poised paint
    renderFrame(false);

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
      data-testid="wave-footer-canvas"
      aria-hidden="true"
      className="pointer-events-none block h-full w-full"
    />
  );
}
