import { parseISODate, toISODate } from './date.js';

export function calculateHabitStreak(logs, referenceDate) {
  const completedDates = new Set(
    logs
      .filter((log) => log.status_today)
      .map((log) => log.log_date),
  );
  const cursor = parseISODate(referenceDate);
  let streak = 0;

  if (!completedDates.has(referenceDate)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (completedDates.has(toISODate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function logsForHabit(logs, habitId) {
  return logs.filter((log) => log.habit_id === habitId);
}
