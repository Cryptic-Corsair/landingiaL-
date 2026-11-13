import { motion } from 'motion/react';
import type { IalUnit } from '../../data/ialData';

interface UnitEmblemProps {
  code: IalUnit['code'];
  color: string;
  hovered: boolean;
  reducedMotion: boolean;
}

export function UnitEmblem({ code, color, hovered, reducedMotion }: UnitEmblemProps) {
  const spinDuration = hovered ? 4.5 : 14;

  switch (code) {
    case 'WCH11':
      return (
        <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
          <circle cx="18" cy="18" r="14" fill="none" stroke={color} strokeOpacity="0.25" strokeWidth="1.5" />
          <motion.g
            animate={reducedMotion ? undefined : { rotate: 360 }}
            transition={{ repeat: Infinity, ease: 'linear', duration: spinDuration }}
            style={{ transformOrigin: '18px 18px' }}
          >
            <ellipse cx="18" cy="18" rx="14" ry="6" fill="none" stroke={color} strokeWidth="1.5" />
            <circle cx="32" cy="18" r="2.2" fill={color} />
          </motion.g>
          <circle cx="18" cy="18" r="2.6" fill={color} />
        </svg>
      );

    case 'WCH12':
      return (
        <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
          <rect x="4" y="4" width="28" height="28" rx="8" fill="none" stroke={color} strokeOpacity="0.25" strokeWidth="1.4" />
          <motion.path
            d="M 7 18 Q 12 9, 18 18 T 29 18"
            fill="none"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
            animate={
              reducedMotion
                ? undefined
                : {
                    d: hovered
                      ? ['M 7 18 Q 12 7, 18 18 T 29 18', 'M 7 18 Q 12 29, 18 18 T 29 18', 'M 7 18 Q 12 7, 18 18 T 29 18']
                      : ['M 7 18 Q 12 12, 18 18 T 29 18', 'M 7 18 Q 12 24, 18 18 T 29 18', 'M 7 18 Q 12 12, 18 18 T 29 18'],
                  }
            }
            transition={{ repeat: Infinity, duration: hovered ? 1.1 : 2.8, ease: 'easeInOut' }}
          />
        </svg>
      );

    case 'WCH13':
      return (
        <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
          <circle cx="18" cy="18" r="14" fill="none" stroke={color} strokeOpacity="0.25" strokeWidth="1.4" />
          {[
            { cx: 12, delay: 0 },
            { cx: 18, delay: 0.35 },
            { cx: 24, delay: 0.7 },
          ].map((dot, idx) => (
            <motion.circle
              key={idx}
              cx={dot.cx}
              cy="24"
              r="2.2"
              fill={color}
              animate={
                reducedMotion
                  ? undefined
                  : {
                      cy: [25, 11, 25],
                      opacity: [0.4, 1, 0.4],
                    }
              }
              transition={{
                repeat: Infinity,
                duration: hovered ? 1.2 : 2.6,
                delay: dot.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
        </svg>
      );

    case 'WCH14':
      return (
        <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
          <motion.circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            stroke={color}
            strokeWidth="1.6"
            strokeDasharray="16 8"
            animate={reducedMotion ? undefined : { rotate: 360 }}
            transition={{ repeat: Infinity, ease: 'linear', duration: hovered ? 4 : 12 }}
            style={{ transformOrigin: '18px 18px' }}
          />
          <motion.circle
            cx="18"
            cy="18"
            r="8.5"
            fill="none"
            stroke={color}
            strokeOpacity="0.65"
            strokeWidth="1.5"
            strokeDasharray="10 6"
            animate={reducedMotion ? undefined : { rotate: -360 }}
            transition={{ repeat: Infinity, ease: 'linear', duration: hovered ? 3.2 : 9 }}
            style={{ transformOrigin: '18px 18px' }}
          />
          <circle cx="18" cy="18" r="2" fill={color} />
        </svg>
      );

    case 'WCH15':
      return (
        <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
          <motion.polygon
            points="18,4 30,18 18,32 6,18"
            fill="none"
            stroke={color}
            strokeWidth="1.6"
            animate={reducedMotion ? undefined : { rotate: hovered ? 90 : 0 }}
            transition={{ duration: 0.45 }}
            style={{ transformOrigin: '18px 18px' }}
          />
          <polygon points="18,10 24,18 18,26 12,18" fill={color} fillOpacity="0.22" stroke={color} strokeWidth="1.2" />
        </svg>
      );

    case 'WCH16':
      return (
        <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
          <rect x="5" y="6" width="26" height="24" rx="5" fill="none" stroke={color} strokeOpacity="0.28" strokeWidth="1.4" />
          {[12, 18, 24].map((y, idx) => (
            <motion.line
              key={y}
              x1="10"
              y1={y}
              x2="26"
              y2={y}
              stroke={color}
              strokeWidth="1.7"
              strokeLinecap="round"
              animate={
                reducedMotion
                  ? undefined
                  : {
                      x2: hovered ? [18, 27, 18] : [22, 26, 22],
                    }
              }
              transition={{
                repeat: Infinity,
                duration: hovered ? 0.9 : 2.2,
                delay: idx * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </svg>
      );
  }
}
