import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { EASE_EXPO, SPRING_SNAPPY } from '../../lib/motion';

interface KeystrokeMachineProps {
  reducedMotion: boolean;
}

const MINI_COMMANDS = [
  { code: 'WCH11', label: 'Atomic Structure & Orbitals' },
  { code: '2.7a', label: "Enthalpy Cycles & Hess's Law" },
  { code: 'WCH14', label: 'Buffer Calculations' },
];

export function KeystrokeMachine({ reducedMotion }: KeystrokeMachineProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(true);
  const [pulseId, setPulseId] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'cmd' | 'key' | 'open'>(
    reducedMotion ? 'open' : 'idle',
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry) setInView(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const triggerSequence = () => {
    setPulseId((n) => n + 1);
  };

  useEffect(() => {
    if (reducedMotion || !inView) {
      setPhase('open');
      return;
    }

    let t1 = 0;
    let t2 = 0;
    let t3 = 0;
    let t4 = 0;

    setPhase('cmd');
    t1 = window.setTimeout(() => setPhase('key'), 180);
    t2 = window.setTimeout(() => setPhase('open'), 380);
    t3 = window.setTimeout(() => setPhase('idle'), 2600);
    t4 = window.setTimeout(() => setPulseId((n) => n + 1), 3600);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
  }, [pulseId, reducedMotion, inView]);

  const cmdPressed = phase === 'cmd' || phase === 'key';
  const kPressed = phase === 'key';
  const paletteOpen = phase === 'open';

  return (
    <div
      ref={containerRef}
      onMouseEnter={triggerSequence}
      className="relative flex h-64 w-full flex-col items-center justify-between overflow-hidden rounded-xl border p-4 select-none"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Subtle vector dot-matrix field + concentric shockwave ripple */}
      <svg
        aria-hidden="true"
        viewBox="0 0 320 200"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-55"
      >
        <defs>
          <pattern
            id="key-dot-grid"
            width="16"
            height="16"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="8" cy="8" r="0.85" fill="var(--ink-muted)" opacity="0.35" />
          </pattern>
        </defs>
        <rect width="320" height="200" fill="url(#key-dot-grid)" />
        {!reducedMotion && (
          <motion.circle
            key={pulseId}
            cx="160"
            cy="72"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.2"
            initial={{ r: 10, opacity: 0.55 }}
            animate={{ r: 135, opacity: 0 }}
            transition={{ duration: 1.4, delay: 0.28, ease: EASE_EXPO }}
          />
        )}
      </svg>

      {/* Top interactive trigger hint */}
      <div className="relative z-10 flex w-full items-center justify-between">
        <span
          className="font-mono text-[10px] tracking-[0.14em] uppercase"
          style={{ color: 'var(--ink-muted)' }}
        >
          KEYSTROKE ENGINE
        </span>
        <button
          type="button"
          onClick={triggerSequence}
          className="rounded border px-2 py-0.5 font-mono text-[10px] transition-colors hover:opacity-80 whitespace-nowrap shrink-0"
          style={{
            borderColor: 'var(--border-strong)',
            color: 'var(--ink-muted)',
            backgroundColor: 'var(--surface-elevated)',
          }}
        >
          Replay
        </button>
      </div>

      {/* Isometric Keycap Cluster */}
      <div
        className="relative z-10 flex items-center gap-3 py-1"
        style={{ perspective: '600px' }}
      >
        <div
          className="flex items-center gap-3"
          style={{ transform: 'rotateX(22deg) rotateZ(-4deg)' }}
        >
          {/* Command Keycap */}
          <motion.div
            animate={{
              y: cmdPressed ? 4 : 0,
              boxShadow: cmdPressed
                ? '0 2px 0 0 var(--border-strong)'
                : '0 6px 0 0 var(--border-strong)',
            }}
            transition={SPRING_SNAPPY}
            className="relative flex h-12 w-12 items-center justify-center rounded-lg border font-mono text-base font-medium"
            style={{
              backgroundColor: 'var(--surface-elevated)',
              borderColor: cmdPressed ? 'var(--accent)' : 'var(--border-strong)',
              color: cmdPressed ? 'var(--accent)' : 'var(--ink)',
            }}
          >
            ⌘
          </motion.div>

          {/* K Keycap */}
          <motion.div
            animate={{
              y: kPressed ? 4 : 0,
              boxShadow: kPressed
                ? '0 2px 0 0 var(--border-strong)'
                : '0 6px 0 0 var(--border-strong)',
            }}
            transition={SPRING_SNAPPY}
            className="relative flex h-12 w-12 items-center justify-center rounded-lg border font-mono text-base font-medium"
            style={{
              backgroundColor: 'var(--surface-elevated)',
              borderColor: kPressed ? 'var(--accent)' : 'var(--border-strong)',
              color: kPressed ? 'var(--accent)' : 'var(--ink)',
            }}
          >
            K
          </motion.div>
        </div>
      </div>

      {/* Mini Cascading Command Palette Rows */}
      <div
        className="relative z-10 w-full rounded-lg border p-2"
        style={{
          backgroundColor: 'var(--bg)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="space-y-1">
          {MINI_COMMANDS.map((row, idx) => (
            <motion.div
              key={row.code}
              initial={false}
              animate={{
                opacity: paletteOpen ? 1 : 0.42,
                y: paletteOpen ? 0 : 3,
              }}
              transition={{
                duration: 0.35,
                delay: paletteOpen ? idx * 0.06 : 0,
                ease: EASE_EXPO,
              }}
              className="flex items-center justify-between rounded px-2 py-1 text-[11px]"
              style={{
                backgroundColor: idx === 0 && paletteOpen ? 'var(--surface-elevated)' : 'transparent',
              }}
            >
              <span className="truncate font-medium" style={{ color: 'var(--ink)' }}>
                {row.label}
              </span>
              <span
                className="ml-2 shrink-0 font-mono text-[10px] tabular-nums"
                style={{ color: idx === 0 ? 'var(--accent)' : 'var(--ink-muted)' }}
              >
                {row.code}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
