import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GLOBAL_METRICS,
  IAL_UNITS,
  MOOD_SWATCHES,
  PREVIEW_THEMES,
  SANDBOX_PILLS,
  SEARCH_ITEMS,
} from './ialData';

test('IAL_UNITS defines all 6 Edexcel IAL units with exact topic & minute totals', () => {
  assert.equal(IAL_UNITS.length, 6);
  const topicsSum = IAL_UNITS.reduce((acc, u) => acc + u.topicsCount, 0);
  const minutesSum = IAL_UNITS.reduce((acc, u) => acc + u.minutes, 0);
  assert.equal(topicsSum, GLOBAL_METRICS.topics);
  assert.equal(minutesSum, GLOBAL_METRICS.totalMinutes);
  assert.deepEqual(
    IAL_UNITS.map((u) => u.code),
    ['WCH11', 'WCH12', 'WCH13', 'WCH14', 'WCH15', 'WCH16'],
  );
});

test('SANDBOX_PILLS, MOOD_SWATCHES, PREVIEW_THEMES, and SEARCH_ITEMS match spec', () => {
  assert.equal(SANDBOX_PILLS.length, 14);
  assert.equal(MOOD_SWATCHES.length, 4);
  assert.deepEqual(Object.keys(PREVIEW_THEMES), ['cream', 'plum', 'dune', 'classic']);
  assert.ok(SEARCH_ITEMS.length >= 12);
});
