import { motion } from 'motion/react';
import type { IalUnit } from '../../data/ialData';
import { EASE_EXPO, SPRING_SNAPPY } from '../../lib/motion';

interface UnitEmblemProps {
  code: IalUnit['code'];
  active: boolean;
  reducedMotion: boolean;
}

export function UnitEmblem({ code, active, reducedMotion }: UnitEmblemProps) {
  switch (code) {
    case 'WCH11':
      // Tilted concentric gyro-rings aligning smoothly
      return (
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          aria-hidden="true"
          className="shrink-0 overflow-visible"
        >
          <motion.ellipse
            cx="18"
            cy="18"
            rx="14"
            ry="6.5"
            stroke="currentColor"
            strokeWidth="1.2"
            animate={
              reducedMotion
                ? { rotate: -26 }
                : { rotate: active ? 0 : -28 }
            }
            transition={SPRING_SNAPPY}
            style={{ originX: '18px', originY: '18px', color: 'var(--ink-muted)' }}
          />
          <motion.ellipse
            cx="18"
            cy="18"
            rx="14"
            ry="6.5"
            stroke="currentColor"
            strokeWidth="1.2"
            animate={
              reducedMotion
                ? { rotate: 28 }
                : { rotate: active ? 90 : 32 }
            }
            transition={SPRING_SNAPPY}
            style={{ originX: '18px', originY: '18px', color: active ? 'var(--accent)' : 'var(--ink)' }}
          />
          <circle cx="18" cy="18" r="2.2" fill="var(--accent)" />
        </svg>
      );

    case 'WCH12':
      // Phase-shifted dual harmonic sine curves undulating smoothly
      return (
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          aria-hidden="true"
          className="shrink-0"
        >
          <motion.path
            d="M3 18 C 8 9, 13 9, 18 18 C 23 27, 28 27, 33 18"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            style={{ color: active ? 'var(--accent)' : 'var(--ink)' }}
            animate={
              reducedMotion
                ? undefined
                : active
                  ? { y: [0, -2, 0] }
                  : { y: 0 }
            }
            transition={{ duration: 1.6, repeat: active && !reducedMotion ? Infinity : 0, ease: 'easeInOut' }}
          />
          <motion.path
            d="M3 18 C 8 27, 13 27, 18 18 C 23 9, 28 9, 33 18"
            stroke="currentColor"
            strokeWidth="1.15"
            strokeLinecap="round"
            style={{ color: 'var(--ink-muted)' }}
            animate={
              reducedMotion
                ? undefined
                : active
                  ? { y: [0, 2, 0] }
                  : { y: 0 }
            }
            transition={{ duration: 1.6, repeat: active && !reducedMotion ? Infinity : 0, ease: 'easeInOut' }}
          />
        </svg>
      );

    case 'WCH13':
      // Calibrated rising micro-spheres inside an open minimalist frame
      return (
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          aria-hidden="true"
          className="shrink-0"
        >
          <path
            d="M9 8 V26 C9 27.6569 10.3431 29 12 29 H24 C25.6569 29 27 27.6569 27 26 V8"
            stroke="var(--ink-muted)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <line x1="12" y1="22" x2="24" y2="22" stroke="var(--border-strong)" strokeWidth="1" />
          <motion.circle
            cx="15"
            cy="24"
            r="2"
            fill="var(--accent)"
            animate={
              reducedMotion
                ? undefined
                : { y: active ? [0, -10, 0] : 0 }
            }
            transition={{ duration: 1.8, repeat: active && !reducedMotion ? Infinity : 0, ease: EASE_EXPO }}
          />
          <motion.circle
            cx="21"
            cy="25"
            r="1.6"
            fill="var(--ink)"
            animate={
              reducedMotion
                ? undefined
                : { y: active ? [0, -13, 0] : 0 }
            }
            transition={{ duration: 1.5, delay: 0.25, repeat: active && !reducedMotion ? Infinity : 0, ease: EASE_EXPO }}
          />
          <motion.circle
            cx="18"
            cy="19"
            r="1.3"
            fill="var(--accent-warm)"
            animate={
              reducedMotion
                ? undefined
                : { y: active ? [0, -9, 0] : 0 }
            }
            transition={{ duration: 1.4, delay: 0.12, repeat: active && !reducedMotion ? Infinity : 0, ease: EASE_EXPO }}
          />
        </svg>
      );

    case 'WCH14':
      // Twin counter-rotating vernier arcs locking into equilibrium
      return (
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          aria-hidden="true"
          className="shrink-0 overflow-visible"
        >
          <motion.g
            style={{
              transformOrigin: '18px 18px',
              transformBox: 'view-box',
            }}
            animate={reducedMotion ? undefined : { rotate: active ? 45 : 0 }}
            transition={SPRING_SNAPPY}
          >
            <path
              d="M18 4 A 14 14 0 0 1 32 18"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              style={{ color: active ? 'var(--accent)' : 'var(--ink)' }}
            />
            <path
              d="M18 32 A 14 14 0 0 1 4 18"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              style={{ color: active ? 'var(--accent)' : 'var(--ink)' }}
            />
          </motion.g>
          <motion.g
            style={{
              transformOrigin: '18px 18px',
              transformBox: 'view-box',
            }}
            animate={reducedMotion ? undefined : { rotate: active ? -45 : 0 }}
            transition={SPRING_SNAPPY}
          >
            <path
              d="M18 9 A 9 9 0 0 0 9 18"
              stroke="var(--ink-muted)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M18 27 A 9 9 0 0 0 27 18"
              stroke="var(--ink-muted)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </motion.g>
          <circle cx="18" cy="18" r="1.8" fill="var(--accent-warm)" />
        </svg>
      );

    case 'WCH15':
      // Layered isometric prism facets catching a subtle light sweep
      return (
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          aria-hidden="true"
          className="shrink-0"
        >
          <motion.polygon
            points="18,4 30,11 30,25 18,32 6,25 6,11"
            stroke="var(--ink-muted)"
            strokeWidth="1.15"
            animate={reducedMotion ? undefined : { scale: active ? 1.04 : 1 }}
            transition={SPRING_SNAPPY}
            style={{ originX: '18px', originY: '18px' }}
          />
          <motion.polygon
            points="18,8.5 26,13 26,23 18,27.5 10,23 10,13"
            stroke={active ? 'var(--accent)' : 'var(--ink)'}
            strokeWidth="1.2"
            animate={reducedMotion ? undefined : { rotate: active ? 30 : 0 }}
            transition={SPRING_SNAPPY}
            style={{ originX: '18px', originY: '18px' }}
          />
          <line x1="18" y1="8.5" x2="18" y2="27.5" stroke="var(--border-strong)" strokeWidth="1" />
        </svg>
      );

    case 'WCH16':
    default:
      // Crisp rhythmic horizontal chromatography light bands gliding smoothly
      return (
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          aria-hidden="true"
          className="shrink-0"
        >
          <rect x="6" y="7" width="24" height="22" rx="3" stroke="var(--ink-muted)" strokeWidth="1.1" />
          <motion.line
            x1="10"
            y1="13"
            x2="26"
            y2="13"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            animate={reducedMotion ? undefined : { x: active ? [0, 2, 0] : 0 }}
            transition={{ duration: 1.4, repeat: active && !reducedMotion ? Infinity : 0, ease: 'easeInOut' }}
          />
          <motion.line
            x1="10"
            y1="18"
            x2="22"
            y2="18"
            stroke="var(--ink)"
            strokeWidth="1.6"
            strokeLinecap="round"
            animate={reducedMotion ? undefined : { x: active ? [0, 3, 0] : 0 }}
            transition={{ duration: 1.4, delay: 0.15, repeat: active && !reducedMotion ? Infinity : 0, ease: 'easeInOut' }}
          />
          <motion.line
            x1="10"
            y1="23"
            x2="26"
            y2="23"
            stroke="var(--accent-warm)"
            strokeWidth="1.4"
            strokeLinecap="round"
            animate={reducedMotion ? undefined : { x: active ? [0, -2, 0] : 0 }}
            transition={{ duration: 1.4, delay: 0.25, repeat: active && !reducedMotion ? Infinity : 0, ease: 'easeInOut' }}
          />
        </svg>
      );
  }
}
