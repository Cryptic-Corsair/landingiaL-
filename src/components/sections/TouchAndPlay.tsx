import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { computeGoalDialState, SPRING_PLAYFUL } from '../../lib/motion';
import { soundEngine } from '../../lib/sound';

interface TouchAndPlayProps {
  reducedMotion: boolean;
}

const KEYCAPS = [
  { id: 'cmd', label: '⌘', keyMatch: 'meta', freq: 523.25 },
  { id: 'k', label: 'K', keyMatch: 'k', freq: 587.33 },
  { id: '1', label: '1', keyMatch: '1', freq: 659.25 },
  { id: '2', label: '2', keyMatch: '2', freq: 783.99 },
  { id: '3', label: '3', keyMatch: '3', freq: 880.0 },
] as const;

interface KeyRipple {
  id: number;
  label: string;
}

export function TouchAndPlay({ reducedMotion }: TouchAndPlayProps) {
  // Toy A: Optical Glass Magnifier Lens coordinates
  const lensRef = useRef<HTMLDivElement | null>(null);
  const [lensPos, setLensPos] = useState({ x: 165, y: 112, active: false });

  // Toy B: 3D Mechanical Keycaps
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [ripples, setRipples] = useState<KeyRipple[]>([]);
  const [synthHovered, setSynthHovered] = useState(false);

  // Toy C: Draggable Goal Dial (0m -> 120m)
  const [goalMinutes, setGoalMinutes] = useState(84);
  const dialState = computeGoalDialState(goalMinutes);

  const handleLensMove = (clientX: number, clientY: number) => {
    const el = lensRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setLensPos({
      x: clientX - rect.left,
      y: clientY - rect.top,
      active: true,
    });
  };

  const triggerKeycap = (key: (typeof KEYCAPS)[number]) => {
    setPressedKey(key.id);
    soundEngine.playMarimba(key.freq);
    const id = Date.now() + Math.random();
    setRipples((prev) => [...prev.slice(-3), { id, label: key.label }]);
    window.setTimeout(() => {
      setPressedKey((curr) => (curr === key.id ? null : curr));
    }, 150);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 650);
  };

  // Smooth live SVG sine path driven by goal dial ratio
  const waveAmplitude = 5 + dialState.ratio * 15;
  const waveFreq = 1.6 + dialState.ratio * 2.2;
  const wavePoints: string[] = [];
  for (let x = 0; x <= 220; x += 8) {
    const t = (x / 220) * Math.PI * 2 * waveFreq;
    const y = 26 + Math.sin(t) * waveAmplitude;
    wavePoints.push(`${x === 0 ? 'M' : 'L'} ${x} ${y.toFixed(1)}`);
  }
  const wavePath = wavePoints.join(' ');

  return (
    <section
      id="play"
      className="relative border-t py-20 sm:py-28"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <p
            className="font-mono text-[11px] tracking-[0.16em] uppercase"
            style={{ color: 'var(--ink-muted)' }}
          >
            TOUCH &amp; PLAY
          </p>
          <h2
            className="mt-2.5 text-balance font-display font-semibold tracking-[-0.025em] leading-[1.06]"
            style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3rem)' }}
          >
            Built to feel{' '}
            <span className="font-serif italic font-normal" style={{ color: 'var(--coral)' }}>
              alive.
            </span>
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* TOY A: Optical Glass Magnifier Lens */}
          <div
            data-testid="toy-magnifier"
            data-cursor="PLAY"
            onPointerMove={(e) => handleLensMove(e.clientX, e.clientY)}
            onPointerEnter={(e) => handleLensMove(e.clientX, e.clientY)}
            onPointerLeave={() => setLensPos((prev) => ({ ...prev, active: false }))}
            className="relative flex min-h-[290px] flex-col justify-between overflow-hidden rounded-2xl border p-6 select-none touch-none"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="relative z-10 flex items-center justify-between font-mono text-[11px]" style={{ color: 'var(--ink-muted)' }}>
              <span>01 · OPTICAL LENS</span>
              <span>Move pointer</span>
            </div>

            {/* Base Bold Typography Layer (lensRef measures this exact coordinate frame) */}
            <div
              ref={lensRef}
              className="relative my-4 flex-1 flex flex-col items-center justify-center text-center"
            >
              <p
                className="font-display font-semibold tracking-[-0.03em] leading-[0.95] select-none"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3rem)', color: 'var(--ink)' }}
              >
                IAL CHEM
                <br />
                33 TOPICS
              </p>

              {/* Clip-Path Optical Lens Overlay Layer */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
                style={{
                  clipPath: reducedMotion
                    ? 'circle(76px at 50% 50%)'
                    : `circle(76px at ${lensPos.x}px ${lensPos.y}px)`,
                  backgroundColor: 'var(--surface-2)',
                }}
              >
                <p
                  className="font-serif italic font-normal tracking-[-0.02em] leading-[0.94] scale-[1.18]"
                  style={{
                    fontSize: 'clamp(2.35rem, 4.1vw, 3.1rem)',
                    color: '#FF5C35',
                  }}
                >
                  IAL CHEM
                  <br />
                  33 TOPICS
                </p>
              </div>

              {/* Optical Ring Frame */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-0 rounded-full border-2 shadow-inner"
                style={{
                  width: 152,
                  height: 152,
                  transform: reducedMotion
                    ? 'translate3d(calc(50% - 76px), calc(50% - 76px), 0)'
                    : `translate3d(${lensPos.x - 76}px, ${lensPos.y - 76}px, 0)`,
                  borderColor: lensPos.active ? '#FF5C35' : 'var(--border-strong)',
                }}
              />
            </div>

            <p className="relative z-10 text-xs leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
              Glide across to inspect optical refraction and serif contrast.
            </p>
          </div>

          {/* TOY B: Tactile 3D Keycap Synth */}
          <div
            data-testid="toy-keycaps"
            data-cursor="CLICK"
            tabIndex={0}
            onMouseEnter={() => setSynthHovered(true)}
            onMouseLeave={() => setSynthHovered(false)}
            onKeyDown={(e) => {
              if (!synthHovered) return;
              const matched = KEYCAPS.find(
                (k) => k.keyMatch === e.key.toLowerCase(),
              );
              if (matched) triggerKeycap(matched);
            }}
            className="relative flex min-h-[290px] flex-col justify-between overflow-hidden rounded-2xl border p-6 select-none outline-none focus-visible:ring-2"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center justify-between font-mono text-[11px]" style={{ color: 'var(--ink-muted)' }}>
              <span>02 · KEYCAP SYNTH</span>
              <span>Click keys</span>
            </div>

            <div className="relative my-4 flex flex-1 flex-col items-center justify-center">
              {/* Concentric Expanding SVG Ripple Rings */}
              <svg
                aria-hidden="true"
                viewBox="0 0 240 140"
                className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              >
                <AnimatePresence>
                  {!reducedMotion &&
                    ripples.map((r) => (
                      <motion.circle
                        key={r.id}
                        cx="120"
                        cy="70"
                        r="26"
                        fill="none"
                        stroke="#8B5CF6"
                        strokeWidth="1.6"
                        initial={{ scale: 0.7, opacity: 0.65 }}
                        animate={{ scale: 2.35, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        style={{ transformOrigin: '120px 70px' }}
                      />
                    ))}
                </AnimatePresence>
              </svg>

              {/* 5 Tactile 3D-Beveled Keys */}
              <div className="relative z-10 flex flex-wrap items-center justify-center gap-2.5">
                {KEYCAPS.map((key) => {
                  const isDown = pressedKey === key.id;
                  return (
                    <motion.button
                      key={key.id}
                      type="button"
                      aria-label={`Press key ${key.label}`}
                      onClick={() => triggerKeycap(key)}
                      animate={
                        isDown && !reducedMotion
                          ? { y: 4, scale: 0.95 }
                          : { y: 0, scale: 1 }
                      }
                      whileHover={reducedMotion ? undefined : { y: -2 }}
                      transition={SPRING_PLAYFUL}
                      className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-b-4 font-mono text-sm font-semibold shadow-sm"
                      style={{
                        backgroundColor: isDown ? 'var(--lavender)' : 'var(--bg)',
                        borderColor: isDown ? 'var(--lavender)' : 'var(--border-strong)',
                        color: isDown ? '#FFFDF9' : 'var(--ink)',
                      }}
                    >
                      {key.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
              {ripples.length > 0
                ? `Triggered chime: ${ripples[ripples.length - 1]?.label}`
                : 'Beveled mechanical switches with marimba chime.'}
            </p>
          </div>

          {/* TOY C: Draggable Goal Dial (0m -> 120m) */}
          <div
            data-testid="toy-goal-dial"
            data-cursor="DRAG"
            className="relative flex min-h-[290px] flex-col justify-between overflow-hidden rounded-2xl border p-6"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center justify-between font-mono text-[11px] tabular-nums" style={{ color: 'var(--ink-muted)' }}>
              <span>03 · GOAL DIAL</span>
              <span style={{ color: dialState.atPeak ? 'var(--teal)' : 'var(--ink-muted)' }}>
                {dialState.clampedMinutes}m / 120m
              </span>
            </div>

            <div className="my-3 flex flex-1 flex-col items-center justify-center gap-3">
              {/* Concentric Calibrated Chrono Ring + Peak Sparks */}
              <div className="relative flex items-center justify-center">
                <svg width="112" height="112" viewBox="0 0 112 112" aria-hidden="true">
                  <circle
                    cx="56"
                    cy="56"
                    r="44"
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="34"
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth="1"
                    strokeDasharray="3 4"
                  />
                  <motion.circle
                    cx="56"
                    cy="56"
                    r="44"
                    fill="none"
                    stroke={dialState.atPeak ? '#14B8A6' : '#F59E0B'}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 44}
                    animate={{
                      strokeDashoffset: 2 * Math.PI * 44 * (1 - dialState.ratio),
                    }}
                    transition={SPRING_PLAYFUL}
                    transform="rotate(-90 56 56)"
                  />
                  {dialState.atPeak &&
                    !reducedMotion &&
                    [0, 60, 120, 180, 240, 300].map((deg) => {
                      const rad = (deg * Math.PI) / 180;
                      const x2 = 56 + Math.cos(rad) * 53;
                      const y2 = 56 + Math.sin(rad) * 53;
                      const x1 = 56 + Math.cos(rad) * 48;
                      const y1 = 56 + Math.sin(rad) * 48;
                      return (
                        <motion.line
                          key={deg}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="#14B8A6"
                          strokeWidth="2"
                          strokeLinecap="round"
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                        />
                      );
                    })}
                </svg>

                <div className="absolute text-center">
                  <span className="block font-display text-2xl font-semibold tabular-nums">
                    {dialState.pct}%
                  </span>
                </div>
              </div>

              {/* Bending Live Sine Wave */}
              <svg
                width="220"
                height="48"
                viewBox="0 0 220 52"
                aria-hidden="true"
                className="w-full max-w-[220px]"
              >
                <path
                  d={wavePath}
                  fill="none"
                  stroke={dialState.atPeak ? '#14B8A6' : '#F59E0B'}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

              {/* Tactile Range Control */}
              <label htmlFor="goal-dial-slider" className="sr-only">
                Weekly study minutes target
              </label>
              <input
                id="goal-dial-slider"
                data-testid="goal-dial-input"
                type="range"
                min={0}
                max={120}
                value={goalMinutes}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setGoalMinutes(val);
                  if (val === 120) soundEngine.playChime();
                }}
                className="w-full accent-[#FF5C35] cursor-pointer"
              />
            </div>

            <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
              {dialState.atPeak
                ? '120m weekly rhythm reached.'
                : 'Drag dial to calibrate weekly study tempo.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
