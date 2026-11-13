import type { Transition } from 'motion/react';
import type { SearchEntry, SpecChip } from '../data/ialData';

export const EASE_EXPO: readonly [number, number, number, number] = [0.22, 1, 0.36, 1];

export const SPRING_SNAPPY: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 32,
  mass: 0.85,
};

export const SPRING_SOFT: Transition = {
  type: 'spring',
  stiffness: 220,
  damping: 28,
  mass: 1,
};

export const SPRING_PLAYFUL: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 24,
  mass: 0.9,
};

export const VIEWPORT_ONCE = {
  once: true,
  amount: 0.15,
} as const;

export function clampDeltaTime(deltaSeconds: number): number {
  if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) return 0.016;
  return Math.min(deltaSeconds, 0.05);
}

export function getCappedPixelRatio(viewportWidth: number, devicePixelRatio: number): number {
  const safeDpr = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1;
  const maxDpr = viewportWidth < 768 ? 1.5 : 2;
  return Math.min(safeDpr, maxDpr);
}

/**
 * Pure helper computing hero stage 3D perspective flattening across scroll progress [0..1].
 */
export function computeHeroStageTransform(scrollProgress: number, reducedMotion: boolean): {
  rotateX: number;
  scale: number;
  translateY: number;
} {
  if (reducedMotion) {
    return { rotateX: 0, scale: 1, translateY: 0 };
  }
  const t = Math.max(0, Math.min(1, scrollProgress));
  // Smooth ease-out curve so the window straightens comfortably before leaving the fold
  const normalized = Math.min(1, t / 0.55);
  const eased = 1 - Math.pow(1 - normalized, 2.2);
  return {
    rotateX: 9 * (1 - eased),
    scale: 0.95 + 0.05 * eased,
    translateY: 16 * (1 - eased),
  };
}

/**
 * Computes pack compilation totals for selected specification chips.
 */
export function computeSelectedPackMetrics(
  chips: readonly SpecChip[],
  selectedIds: readonly string[],
): {
  count: number;
  totalMinutes: number;
  estimatedPages: number;
  unitCodes: string[];
} {
  const idSet = new Set(selectedIds);
  const active = chips.filter((chip) => idSet.has(chip.id));
  const totalMinutes = active.reduce((sum, chip) => sum + chip.minutes, 0);
  const estimatedPages = active.reduce((sum, chip) => sum + chip.pages, 0);
  const unitCodes = Array.from(new Set(active.map((chip) => chip.unitCode)));
  return {
    count: active.length,
    totalMinutes,
    estimatedPages,
    unitCodes,
  };
}

/**
 * Filters and scores command palette entries against a user search string.
 */
export function filterSearchEntries(entries: readonly SearchEntry[], query: string): SearchEntry[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [...entries];

  const terms = normalized.split(/\s+/).filter(Boolean);
  const scored: Array<{ entry: SearchEntry; score: number }> = [];

  for (const entry of entries) {
    const haystack = `${entry.code} ${entry.title} ${entry.unitTitle} ${entry.category} ${entry.keywords.join(' ')}`.toLowerCase();
    const matchesAll = terms.every((term) => haystack.includes(term));
    if (!matchesAll) continue;

    let score = entry.kind === 'unit' ? 10 : 5;
    if (entry.code.toLowerCase().startsWith(normalized)) score += 30;
    if (entry.title.toLowerCase().includes(normalized)) score += 20;
    scored.push({ entry, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map((item) => item.entry);
}

/**
 * Pure deterministic wave sampler combining two harmonic frequencies plus a smooth
 * Gaussian pointer lift, returning finite pixel Y offsets for fluid footer ribbons.
 */
export function sampleHarmonicWaveY(options: {
  xNorm: number;
  baseY: number;
  amplitude: number;
  phase: number;
  pointerXNorm: number;
  pointerStrength: number;
}): number {
  const { xNorm, baseY, amplitude, phase, pointerXNorm, pointerStrength } = options;
  const x = Math.max(0, Math.min(1, Number.isFinite(xNorm) ? xNorm : 0));
  const primary = Math.sin(x * Math.PI * 2.4 + phase) * amplitude;
  const harmonic = Math.cos(x * Math.PI * 5.2 - phase * 0.65) * (amplitude * 0.36);
  const dx = x - pointerXNorm;
  const ripple = Math.exp(-(dx * dx) * 32) * amplitude * 0.65 * pointerStrength;
  return baseY + primary + harmonic - ripple;
}

export function computeGoalDialState(minutes: number): {
  angle: number;
  label: string;
  progress: number;
  ratio: number;
  atPeak: boolean;
  clampedMinutes: number;
  pct: number;
} {
  const clampedMinutes = Math.max(0, Math.min(180, minutes));
  const progress = clampedMinutes / 180;
  const ratio = progress;
  const pct = Math.round(progress * 100);
  const angle = progress * 270 - 135;
  const hours = (clampedMinutes / 60).toFixed(1);
  const atPeak = clampedMinutes >= 120;
  return {
    angle,
    label: `${hours} hrs weekly focus`,
    progress,
    ratio,
    atPeak,
    clampedMinutes,
    pct,
  };
}

