import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { SPEC_CHIPS } from '../../data/ialData';
import { EASE_EXPO } from '../../lib/motion';

interface PackFlowMachineProps {
  reducedMotion: boolean;
}

const NODE_COORDS = [
  { x: 112, y: 34, label: '1.4c' },
  { x: 112, y: 74, label: '2.7a' },
  { x: 112, y: 114, label: '4.3b' },
  { x: 112, y: 154, label: '5.2e' },
];

export function PackFlowMachine({ reducedMotion }: PackFlowMachineProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(true);
  const [compileCycle, setCompileCycle] = useState(0);
  const [compiledMinutes, setCompiledMinutes] = useState(reducedMotion ? 38 : 14);

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

  const replayCompile = () => {
    setCompileCycle((c) => c + 1);
  };

  useEffect(() => {
    if (reducedMotion || !inView) {
      setCompiledMinutes(38);
      return;
    }

    setCompiledMinutes(14);
    const t1 = window.setTimeout(() => setCompiledMinutes(26), 420);
    const t2 = window.setTimeout(() => setCompiledMinutes(38), 860);
    const tLoop = window.setTimeout(() => setCompileCycle((c) => c + 1), 4200);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(tLoop);
    };
  }, [compileCycle, reducedMotion, inView]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={replayCompile}
      className="relative flex h-64 w-full flex-col justify-between overflow-hidden rounded-xl border p-4 select-none"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="relative z-10 flex items-center justify-between">
        <span
          className="font-mono text-[10px] tracking-[0.14em] uppercase"
          style={{ color: 'var(--ink-muted)' }}
        >
          PACK COMPILER
        </span>
        <button
          type="button"
          onClick={replayCompile}
          className="rounded border px-2 py-0.5 font-mono text-[10px] transition-colors hover:opacity-80 whitespace-nowrap shrink-0"
          style={{
            borderColor: 'var(--border-strong)',
            color: 'var(--ink-muted)',
            backgroundColor: 'var(--surface-elevated)',
          }}
        >
          Simulate Compile
        </button>
      </div>

      {/* Main SVG Bezier Magnetic Assembly Stage */}
      <div className="relative flex flex-1 items-center justify-between gap-2 pt-2">
        {/* Left Node Cluster */}
        <div className="relative z-10 flex flex-col justify-between gap-2">
          {SPEC_CHIPS.map((chip, idx) => (
            <motion.div
              key={`${chip.id}-${compileCycle}`}
              initial={reducedMotion ? false : { x: -6, opacity: 0.7 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.45, delay: idx * 0.08, ease: EASE_EXPO }}
              className="flex items-center gap-2 rounded border px-2 py-1 font-mono text-[10px] tabular-nums"
              style={{
                backgroundColor: 'var(--bg)',
                borderColor: idx < 3 ? 'var(--accent)' : 'var(--border)',
                color: idx < 3 ? 'var(--ink)' : 'var(--ink-muted)',
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: idx < 3 ? 'var(--accent)' : 'var(--ink-muted)',
                }}
              />
              <span>{chip.code}</span>
            </motion.div>
          ))}
        </div>

        {/* SVG Magnetic Bezier Paths */}
        <svg
          aria-hidden="true"
          viewBox="0 0 110 180"
          className="pointer-events-none h-44 w-24 shrink-0 overflow-visible"
        >
          {NODE_COORDS.slice(0, 3).map((_, idx) => {
            const startY = 24 + idx * 44;
            const pathD = `M 0 ${startY} C 48 ${startY}, 56 88, 108 88`;
            return (
              <g key={`${idx}-${compileCycle}`}>
                <path
                  d={pathD}
                  fill="none"
                  stroke="var(--border-strong)"
                  strokeWidth="1"
                />
                <motion.path
                  d={pathD}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  initial={reducedMotion ? { pathLength: 1 } : { pathLength: 0, opacity: 0.3 }}
                  animate={{ pathLength: 1, opacity: 0.9 }}
                  transition={{
                    duration: 0.8,
                    delay: idx * 0.14,
                    ease: EASE_EXPO,
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Right Compiled Pack Card */}
        <motion.div
          key={compileCycle}
          initial={reducedMotion ? false : { scale: 0.96, opacity: 0.85 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25, ease: EASE_EXPO }}
          className="relative z-10 flex w-28 shrink-0 flex-col justify-between rounded-lg border p-2.5"
          style={{
            backgroundColor: 'var(--bg)',
            borderColor: 'var(--border-strong)',
          }}
        >
          <div className="space-y-1.5">
            <span
              className="block font-mono text-[9px] tracking-[0.12em] uppercase"
              style={{ color: 'var(--accent)' }}
            >
              COMPILED
            </span>
            <p className="text-[11px] font-semibold leading-tight" style={{ color: 'var(--ink)' }}>
              3 Spec Notes
            </p>
            <div className="space-y-1 pt-1">
              <div className="h-1 w-full rounded-full" style={{ backgroundColor: 'var(--border-strong)' }} />
              <div className="h-1 w-4/5 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
              <div className="h-1 w-3/5 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
            </div>
          </div>

          <div
            className="mt-3 flex items-baseline justify-between border-t pt-2 font-mono text-[11px] tabular-nums"
            style={{ borderColor: 'var(--border)' }}
          >
            <span style={{ color: 'var(--ink-muted)' }}>Read</span>
            <span className="font-medium" style={{ color: 'var(--ink)' }}>
              {compiledMinutes} min
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
