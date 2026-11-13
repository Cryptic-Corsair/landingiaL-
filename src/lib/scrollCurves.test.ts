import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeMagneticOffset,
  scrollProgressToCamera,
  scrollProgressToMorph,
} from './scrollCurves';

test('scrollProgressToMorph maps 0..1 monotonically through Beat 01 to Beat 05', () => {
  assert.equal(scrollProgressToMorph(0), 0);
  assert.equal(scrollProgressToMorph(-0.4), 0);

  const beat2Start = scrollProgressToMorph(0.16);
  const beat2End = scrollProgressToMorph(0.42);
  const beat3End = scrollProgressToMorph(0.68);
  const beat4End = scrollProgressToMorph(0.88);
  const beat5End = scrollProgressToMorph(1);

  assert.ok(Math.abs(beat2Start - 0.05) < 1e-6);
  assert.ok(Math.abs(beat2End - 0.85) < 1e-6);
  assert.ok(Math.abs(beat3End - 1.35) < 1e-6);
  assert.ok(Math.abs(beat4End - 1.85) < 1e-6);
  assert.ok(Math.abs(beat5End - 2.0) < 1e-6);
  assert.equal(scrollProgressToMorph(1.5), 2.0);
});

test('scrollProgressToCamera settles horizon upward look offset at Beat 05', () => {
  const start = scrollProgressToCamera(0);
  const end = scrollProgressToCamera(1);

  assert.ok(start.lookY === 0);
  assert.ok(end.lookY > 0.4);
  assert.ok(end.posY > start.posY);
});

test('computeMagneticOffset clamps pointer displacement cleanly within maxShiftPx', () => {
  const rect = { left: 100, top: 200, width: 200, height: 50 };
  const center = computeMagneticOffset(200, 225, rect, 10);
  assert.equal(center.x, 0);
  assert.equal(center.y, 0);

  const far = computeMagneticOffset(900, 900, rect, 10);
  assert.equal(far.x, 10);
  assert.equal(far.y, 10);
});
