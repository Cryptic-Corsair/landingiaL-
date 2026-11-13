import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GLOBAL_METRICS,
  IAL_UNITS,
  PREVIEW_THEMES,
  SEARCH_ITEMS,
  SPEC_CHIPS,
} from './ialData';

test('IAL_UNITS matches verified counts across WCH11-WCH16', () => {
  assert.equal(IAL_UNITS.length, GLOBAL_METRICS.units);
  const totalTopics = IAL_UNITS.reduce((acc, u) => acc + u.topicsCount, 0);
  const totalMinutes = IAL_UNITS.reduce((acc, u) => acc + u.minutes, 0);

  assert.equal(totalTopics, GLOBAL_METRICS.topics);
  assert.equal(totalMinutes, GLOBAL_METRICS.totalMinutes);
  assert.equal(GLOBAL_METRICS.workedExamples, 30);
});

test('SPEC_CHIPS and SEARCH_ITEMS include all required units and 12 topic entries', () => {
  assert.equal(SPEC_CHIPS.length, 4);
  const unitEntries = SEARCH_ITEMS.filter((item) => item.kind === 'unit');
  const topicEntries = SEARCH_ITEMS.filter((item) => item.kind === 'topic');
  assert.equal(unitEntries.length, 6);
  assert.equal(topicEntries.length, 12);
});

test('PREVIEW_THEMES defines all 4 workspace palettes cleanly', () => {
  assert.deepEqual(Object.keys(PREVIEW_THEMES), ['dark', 'cream', 'dune', 'classic']);
  assert.equal(PREVIEW_THEMES.classic.useSerifHeading, true);
  assert.equal(PREVIEW_THEMES.dune.accent, '#C26D3D');
});
