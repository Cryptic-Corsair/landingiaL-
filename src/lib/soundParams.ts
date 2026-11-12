export const MAX_AMBIENT_GAIN = 0.04;
export const BASE_DRONE_GAIN = 0.03;
export const BASE_FILTER_HZ = 320;
export const MAX_FILTER_BOOST_HZ = 680;
export const HOLD_DURATION_SEC = 1.1;

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/**
 * Computes Web Audio low-pass filter cutoff frequency based on excite level [0, 1].
 */
export function computeDroneFilterCutoff(exciteLevel: number): number {
  const t = clamp01(exciteLevel);
  return BASE_FILTER_HZ + t * t * MAX_FILTER_BOOST_HZ;
}

/**
 * Computes master ambient drone gain clamped strictly <= MAX_AMBIENT_GAIN (0.04).
 */
export function computeDroneGain(exciteLevel: number): number {
  const t = clamp01(exciteLevel);
  return Math.min(MAX_AMBIENT_GAIN, BASE_DRONE_GAIN + t * 0.008);
}

/**
 * Advances hold progress over ~1.1s using clamped deltaTime.
 */
export function advanceHoldProgress(
  current: number,
  holding: boolean,
  deltaTime: number,
): number {
  const safeDt = Math.min(Math.max(deltaTime, 0), 0.05);
  if (holding) {
    return clamp01(current + safeDt / HOLD_DURATION_SEC);
  }
  return clamp01(current - safeDt / 0.35);
}

/**
 * Computes SVG strokeDashoffset for circular hold progress ring.
 */
export function computeRingDashOffset(
  progress: number,
  circumference: number,
): number {
  const t = clamp01(progress);
  return circumference * (1 - t);
}
