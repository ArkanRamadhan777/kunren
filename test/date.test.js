import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidISODate, parseISODate, toISODate } from '../src/utils/date.js';

test('date helpers preserve a valid local ISO date', () => {
  assert.equal(toISODate(parseISODate('2026-06-07')), '2026-06-07');
});

test('date validation rejects impossible and malformed dates', () => {
  assert.equal(isValidISODate('2026-02-29'), false);
  assert.equal(isValidISODate('2026-6-07'), false);
  assert.equal(isValidISODate('not-a-date'), false);
});

test('date validation accepts leap day', () => {
  assert.equal(isValidISODate('2028-02-29'), true);
});
