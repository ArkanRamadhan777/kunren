import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateHabitStreak, logsForHabit } from '../src/utils/habits.js';

const logs = [
  { habit_id: 'a', log_date: '2026-06-07', status_today: true },
  { habit_id: 'a', log_date: '2026-06-06', status_today: true },
  { habit_id: 'a', log_date: '2026-06-05', status_today: true },
  { habit_id: 'a', log_date: '2026-06-04', status_today: false },
  { habit_id: 'b', log_date: '2026-06-07', status_today: true },
];

test('habit streak counts consecutive completed dates', () => {
  assert.equal(calculateHabitStreak(logsForHabit(logs, 'a'), '2026-06-07'), 3);
});

test('habit streak keeps the run through yesterday before today is completed', () => {
  assert.equal(calculateHabitStreak(logsForHabit(logs, 'a'), '2026-06-08'), 3);
});

test('habit logs are isolated by habit', () => {
  assert.equal(logsForHabit(logs, 'b').length, 1);
});
