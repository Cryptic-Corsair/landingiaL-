import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DESKTOP_PARTICLE_COUNT,
  MOBILE_PARTICLE_COUNT,
  clampMorph,
  dampValue,
  evaluateChladniField,
  generateParticleFormations,
  getParticleCount,
} from './formations';

test('getParticleCount returns 18000 for desktop and 9000 below 768px', () => {
  assert.equal(getParticleCount(1440), DESKTOP_PARTICLE_COUNT);
  assert.equal(getParticleCount(768), DESKTOP_PARTICLE_COUNT);
  assert.equal(getParticleCount(767), MOBILE_PARTICLE_COUNT);
  assert.equal(getParticleCount(390), MOBILE_PARTICLE_COUNT);
});

test('clampMorph keeps morph uniform strictly within [0, 2]', () => {
  assert.equal(clampMorph(-0.5), 0);
  assert.equal(clampMorph(0), 0);
  assert.equal(clampMorph(1.25), 1.25);
  assert.equal(clampMorph(2.8), 2);
  assert.equal(clampMorph(Number.NaN), 0);
});

test('dampValue approaches target smoothly and stays bounded', () => {
  const next = dampValue(0, 1, 6, 0.016);
  assert.ok(next > 0 && next < 1);
  // Large deltaTime is clamped to <= 0.05s for framerate stability
  const clampedStep = dampValue(0, 1, 6, 1.5);
  const maxStep = dampValue(0, 1, 6, 0.05);
  assert.equal(clampedStep, maxStep);
});

test('evaluateChladniField exhibits symmetric standing-wave nodes', () => {
  // Along the diagonal nx === ny, cos(n*x)cos(m*y) - cos(m*x)cos(n*y) === 0
  assert.ok(Math.abs(evaluateChladniField(0.42, 0.42)) < 1e-6);
  assert.ok(Math.abs(evaluateChladniField(-0.25, -0.25)) < 1e-6);
});

test('generateParticleFormations produces finite buffers with distinct formation geometry', () => {
  const count = 1200;
  const data = generateParticleFormations(count);

  assert.equal(data.count, count);
  assert.equal(data.posA.length, count * 3);
  assert.equal(data.posB.length, count * 3);
  assert.equal(data.posC.length, count * 3);
  assert.equal(data.random.length, count * 3);

  let maxSpanA = 0;
  let maxDepthC = 0;
  let minDepthC = Infinity;

  for (let i = 0; i < count * 3; i++) {
    assert.ok(Number.isFinite(data.posA[i]), `posA[${i}] must be finite`);
    assert.ok(Number.isFinite(data.posB[i]), `posB[${i}] must be finite`);
    assert.ok(Number.isFinite(data.posC[i]), `posC[${i}] must be finite`);
    assert.ok(
      data.random[i] >= 0 && data.random[i] <= 1,
      `random[${i}] must be normalized in [0, 1]`,
    );
  }

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    maxSpanA = Math.max(maxSpanA, Math.hypot(data.posA[i3], data.posA[i3 + 1]));
    maxDepthC = Math.max(maxDepthC, data.posC[i3 + 2]);
    minDepthC = Math.min(minDepthC, data.posC[i3 + 2]);
  }

  // Torus sits within bounded sculptural envelope
  assert.ok(maxSpanA > 2.0 && maxSpanA < 4.5);
  // Cosmic Horizon Wave recedes deep along negative Z
  assert.ok(minDepthC < -4.0 && maxDepthC > 1.5);
});
