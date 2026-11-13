export interface CameraScrollState {
  tiltX: number;
  tiltY: number;
  lookY: number;
  posY: number;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function smoothSegment(t: number, start: number, end: number): number {
  if (end <= start) return t >= end ? 1 : 0;
  const u = clamp01((t - start) / (end - start));
  return u * u * (3 - 2 * u);
}

/**
 * Maps normalized page scroll progress [0.0, 1.0] across the 5 beats (~480vh)
 * to WebGL morph target [0.0, 2.0]:
 * - Beat 01 (Arrival): uMorph ~ 0.0 -> 0.05 (Orbital Torus)
 * - Beat 02 (The Unmasking): uMorph 0.05 -> 0.85 (Swirling into Chladni)
 * - Beat 03 (Kinetic Scale): uMorph 0.85 -> 1.35 (Chladni resonance)
 * - Beat 04 (Quiet Tension): uMorph 1.35 -> 1.85 (Flowing toward horizon)
 * - Beat 05 (The Portal): uMorph 1.85 -> 2.00 (Cosmic Horizon Wave)
 */
export function scrollProgressToMorph(progress: number): number {
  const p = clamp01(progress);

  if (p <= 0.16) {
    return 0.05 * smoothSegment(p, 0.0, 0.16);
  }
  if (p <= 0.42) {
    return 0.05 + 0.8 * smoothSegment(p, 0.16, 0.42);
  }
  if (p <= 0.68) {
    return 0.85 + 0.5 * smoothSegment(p, 0.42, 0.68);
  }
  if (p <= 0.88) {
    return 1.35 + 0.5 * smoothSegment(p, 0.68, 0.88);
  }
  return 1.85 + 0.15 * smoothSegment(p, 0.88, 1.0);
}

/**
 * Gently shifts camera pitch/framing across scroll beats so Beat 05
 * settles the Cosmic Horizon Wave cleanly into the lower half of the viewport.
 */
export function scrollProgressToCamera(progress: number): CameraScrollState {
  const p = clamp01(progress);
  const horizonSettle = smoothSegment(p, 0.62, 1.0);
  const midWave = Math.sin(p * Math.PI);

  return {
    tiltX: -0.06 * midWave - 0.14 * horizonSettle,
    tiltY: 0.22 * midWave - 0.08 * horizonSettle,
    posY: 0.28 + 0.52 * horizonSettle,
    lookY: 0.48 * horizonSettle,
  };
}

/**
 * Computes bounded magnetic translation offset for tactile hover affordances.
 */
export function computeMagneticOffset(
  pointerX: number,
  pointerY: number,
  rect: { left: number; top: number; width: number; height: number },
  maxShiftPx = 10,
): { x: number; y: number } {
  if (rect.width <= 0 || rect.height <= 0) return { x: 0, y: 0 };
  const cx = rect.left + rect.width * 0.5;
  const cy = rect.top + rect.height * 0.5;
  const nx = Math.max(-1, Math.min(1, (pointerX - cx) / (rect.width * 0.5)));
  const ny = Math.max(-1, Math.min(1, (pointerY - cy) / (rect.height * 0.5)));
  return {
    x: nx * maxShiftPx,
    y: ny * maxShiftPx,
  };
}
