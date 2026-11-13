import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampDeltaTime,
  getCappedPixelRatio,
  computeHeroStageTransform,
  computeSelectedPackMetrics,
  filterSearchEntries,
  sampleHarmonicWaveY,
} from './motion';
import { SEARCH_ITEMS, SPEC_CHIPS } from '../data/ialData';

test('clampDeltaTime caps high-refresh and invalid deltas cleanly at 0.05s', () => {
  assert.equal(clampDeltaTime(0.008), 0.008);
  assert.equal(clampDeltaTime(0.12), 0.05);
  assert.equal(clampDeltaTime(-1), 0.016);
});

test('getCappedPixelRatio caps DPR at <= 1.5 on mobile and <= 2 on desktop', () => {
  assert.equal(getCappedPixelRatio(390, 3), 1.5);
  assert.equal(getCappedPixelRatio(1440, 3), 2);
  assert.equal(getCappedPixelRatio(1440, 1), 1);
});

test('computeHeroStageTransform flattens tilt as scroll progresses and locks flat for reduced motion', () => {
  const initial = computeHeroStageTransform(0, false);
  const settled = computeHeroStageTransform(0.6, false);
  const reduced = computeHeroStageTransform(0, true);

  assert.equal(initial.rotateX, 9);
  assert.equal(initial.scale, 0.95);
  assert.equal(settled.rotateX, 0);
  assert.equal(settled.scale, 1);
  assert.deepEqual(reduced, { rotateX: 0, scale: 1, translateY: 0 });
});

test('computeSelectedPackMetrics aggregates minutes, pages, and unique unit codes accurately', () => {
  const result = computeSelectedPackMetrics(SPEC_CHIPS, ['spec-1.4c', 'spec-4.3b', 'spec-5.2e']);
  assert.equal(result.count, 3);
  assert.equal(result.totalMinutes, 14 + 16 + 14);
  assert.equal(result.estimatedPages, 4 + 6 + 5);
  assert.deepEqual(result.unitCodes, ['WCH11', 'WCH14', 'WCH15']);
});

test('filterSearchEntries filters units and specification topics accurately', () => {
  const hessResults = filterSearchEntries(SEARCH_ITEMS, 'Hess');
  assert.ok(hessResults.length >= 1);
  assert.ok(hessResults.some((item) => item.code === '2.7a'));

  const wch14Results = filterSearchEntries(SEARCH_ITEMS, 'WCH14');
  assert.ok(wch14Results.length >= 2);
  assert.equal(wch14Results[0].code, 'WCH14');
});

test('sampleHarmonicWaveY stays finite and lifts smoothly under pointer influence', () => {
  const neutral = sampleHarmonicWaveY({
    xNorm: 0.5,
    baseY: 80,
    amplitude: 20,
    phase: 0,
    pointerXNorm: 0.5,
    pointerStrength: 0,
  });
  const lifted = sampleHarmonicWaveY({
    xNorm: 0.5,
    baseY: 80,
    amplitude: 20,
    phase: 0,
    pointerXNorm: 0.5,
    pointerStrength: 1,
  });

  assert.equal(Number.isFinite(neutral), true);
  assert.equal(Number.isFinite(lifted), true);
  assert.ok(lifted < neutral, 'pointer proximity lifts the wave crest upward');
});
