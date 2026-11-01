import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareContributions } from '../src/lib/github-contributions.ts';

test('places real contribution days in calendar weeks and labels months', () => {
  const result = prepareContributions({ contributions: [
    { date: '2026-01-30', count: 2, level: 1 },
    { date: '2026-01-31', count: 5, level: 2 },
    { date: '2026-02-01', count: 0, level: 0 },
  ] });
  assert.deepEqual(result.days.map(({ week, weekday }) => [week, weekday]), [[0, 5], [0, 6], [1, 0]]);
  assert.deepEqual(result.months.map(({ month, week }) => [month, week]), [[0, 0], [1, 1]]);
  assert.equal(result.weeks, 2);
});

test('rejects incomplete, malformed, or non-consecutive data', () => {
  assert.throws(() => prepareContributions({ contributions: [] }));
  assert.throws(() => prepareContributions({ contributions: [{ date: '2026-02-30', count: 1, level: 1 }] }));
  assert.throws(() => prepareContributions({ contributions: [{ date: '2026-01-01', count: 0, level: 9 }] }));
  assert.throws(() => prepareContributions({ contributions: [{ date: '2026-01-01', count: 0, level: 0 }, { date: '2026-01-03', count: 1, level: 1 }] }));
});
