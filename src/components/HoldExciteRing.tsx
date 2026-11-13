import {
  type KeyboardEvent as ReactKeyboardEvent,
  type MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  advanceHoldProgress,
  computeRingDashOffset,
} from '../lib/soundParams';
import { soundEngine } from '../lib/sound';

export interface HoldExciteRingProps {
  exciteValueRef: MutableRefObject<number>;
  onExciteStateChange: (active: boolean) => void;
  onShockwaveFire: () => void;
}

const SVG_RADIUS = 98;
const SVG_CIRCUMFERENCE = 2 * Math.PI * SVG_RADIUS;

export function HoldExciteRing({
  exciteValueRef,
  onExciteStateChange,
  onShockwaveFire,
}: HoldExciteRingProps) {
  const progressCircleRef = useRef<SVGCircleElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const echoRef = useRef<HTMLSpanElement | null>(null);

  const holdingRef = useRef<boolean>(false);
  const progressRef = useRef<number>(0);
  const completedInCurrentHoldRef = useRef<boolean>(false);
  const frameIdRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const [isHolding, setIsHolding] = useState<boolean>(false);

  const triggerEchoFlash = useCallback(() => {
    const echo = echoRef.current;
    if (!echo) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    echo.animate(
      [
        { transform: 'scale(1)', opacity: 0.42 },
        { transform: 'scale(1.85)', opacity: 0 },
      ],
      {
        duration: 620,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'none',
      },
    );
  }, []);

  const fireShockwave = useCallback(() => {
    triggerEchoFlash();
    onShockwaveFire();
    soundEngine.playReleaseChime();
  }, [onShockwaveFire, triggerEchoFlash]);

  const syncVisuals = useCallback(
    (progress: number) => {
      exciteValueRef.current = progress;
      soundEngine.setExciteLevel(progress);

      if (progressCircleRef.current) {
        progressCircleRef.current.style.strokeDashoffset = String(
          computeRingDashOffset(progress, SVG_CIRCUMFERENCE),
        );
      }
      if (buttonRef.current) {
        const scale = 1 - progress * 0.04; // 1.0 -> 0.96 tension
        buttonRef.current.style.transform = `scale(${scale.toFixed(4)})`;
      }
    },
    [exciteValueRef],
  );

  const startLoop = useCallback(() => {
    if (frameIdRef.current !== 0) return;
    lastTimeRef.current = performance.now();

    const step = (now: number) => {
      const dt = Math.min(Math.max((now - lastTimeRef.current) / 1000, 0), 0.05);
      lastTimeRef.current = now;

      const next = advanceHoldProgress(
        progressRef.current,
        holdingRef.current,
        dt,
      );
      progressRef.current = next;
      syncVisuals(next);

      if (
        holdingRef.current &&
        next >= 1 &&
        !completedInCurrentHoldRef.current
      ) {
        completedInCurrentHoldRef.current = true;
        holdingRef.current = false;
        setIsHolding(false);
        onExciteStateChange(false);
        fireShockwave();
      }

      if (holdingRef.current || next > 0.001) {
        frameIdRef.current = requestAnimationFrame(step);
      } else {
        progressRef.current = 0;
        syncVisuals(0);
        frameIdRef.current = 0;
      }
    };

    frameIdRef.current = requestAnimationFrame(step);
  }, [fireShockwave, onExciteStateChange, syncVisuals]);

  const beginHold = useCallback(() => {
    if (holdingRef.current) return;
    holdingRef.current = true;
    completedInCurrentHoldRef.current = false;
    setIsHolding(true);
    onExciteStateChange(true);
    startLoop();
  }, [onExciteStateChange, startLoop]);

  const endHold = useCallback(() => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    setIsHolding(false);
    onExciteStateChange(false);

    if (
      progressRef.current > 0.05 &&
      !completedInCurrentHoldRef.current
    ) {
      fireShockwave();
    }
    startLoop();
  }, [fireShockwave, onExciteStateChange, startLoop]);

  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLButtonElement>) => {
      if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
        e.preventDefault();
        beginHold();
      }
    },
    [beginHold],
  );

  const handleKeyUp = useCallback(
    (e: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        endHold();
      }
    },
    [endHold],
  );

  useEffect(() => {
    return () => {
      if (frameIdRef.current !== 0) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = 0;
      }
      exciteValueRef.current = 0;
      soundEngine.setExciteLevel(0);
    };
  }, [exciteValueRef]);

  return (
    <div className="relative flex items-center justify-center">
      {/* Radial shockwave ring echo on release */}
      <span
        ref={echoRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full border border-[#C4BEFF]/70 opacity-0"
      />

      <button
        ref={buttonRef}
        type="button"
        data-cursor="hold"
        aria-label="Hold to excite"
        aria-pressed={isHolding}
        onPointerDown={beginHold}
        onPointerUp={endHold}
        onPointerLeave={endHold}
        onPointerCancel={endHold}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        className={`relative flex items-center justify-center w-44 h-44 sm:w-52 sm:h-52 rounded-full pointer-events-auto transition-[border-color,background-color] duration-200 hover:border-[#C4BEFF]/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C4BEFF] touch-none select-none cursor-pointer ${
          isHolding ? 'bg-[#1A1526]/85' : 'bg-[#110E17]/75'
        }`}
        style={{
          border: isHolding
            ? '1px solid rgba(196, 190, 255, 0.55)'
            : '1px solid rgba(255, 246, 234, 0.24)',
        }}
      >
        {/* SVG circular progress arc */}
        <svg
          aria-hidden="true"
          viewBox="0 0 208 208"
          className="pointer-events-none absolute inset-0 w-full h-full -rotate-90"
        >
          <circle
            ref={progressCircleRef}
            cx="104"
            cy="104"
            r={SVG_RADIUS}
            fill="none"
            stroke="#C4BEFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={SVG_CIRCUMFERENCE}
            strokeDashoffset={SVG_CIRCUMFERENCE}
          />
        </svg>

        <span className="relative z-10 font-mono text-[11px] tracking-[0.2em] text-[#FFF6EA] whitespace-nowrap">
          {isHolding ? 'Exciting field' : 'Hold to excite'}
        </span>
      </button>
    </div>
  );
}
