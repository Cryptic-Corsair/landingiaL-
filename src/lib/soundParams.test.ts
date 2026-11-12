import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BASE_FILTER_HZ,
  HOLD_DURATION_SEC,
  MAX_AMBIENT_GAIN,
  advanceHoldProgress,
  computeDroneFilterCutoff,
  computeDroneGain,
  computeRingDashOffset,
} from './soundParams';

test('computeDroneGain stays strictly <= 0.04 across full excite range', () => {
  assert.ok(computeDroneGain(0) <= MAX_AMBIENT_GAIN);
  assert.ok(computeDroneGain(0.5) <= MAX_AMBIENT_GAIN);
  assert.ok(computeDroneGain(1) <= MAX_AMBIENT_GAIN);
  assert.ok(computeDroneGain(5) <= MAX_AMBIENT_GAIN);
});

test('computeDroneFilterCutoff opens smoothly with exciteLevel', () => {
  const idle = computeDroneFilterCutoff(0);
  const mid = computeDroneFilterCutoff(0.5);
  const full = computeDroneFilterCutoff(1);
  assert.equal(idle, BASE_FILTER_HZ);
  assert.ok(mid > idle && full > mid);
});

test('advanceHoldProgress ramps 0->1 over ~1.1s and decays on release', () => {
  let p = 0;
  const steps = Math.ceil(HOLD_DURATION_SEC / 0.02);
  for (let i = 0; i < steps; i++) {
    p = advanceHoldProgress(p, true, 0.02);
  }
  assert.equal(p, 1);

  const released = advanceHoldProgress(p, false, 0.05);
  assert.ok(released < 1 && released > 0);
});

test('computeRingDashOffset maps 0..1 progress to circumference..0', () => {
  const c = 2 * Math.PI * 90;
  assert.equal(computeRingDashOffset(0, c), c);
  assert.equal(computeRingDashOffset(1, c), 0);
  assert.ok(Math.abs(computeRingDashOffset(0.5, c) - c * 0.5) < 1e-6);
});
