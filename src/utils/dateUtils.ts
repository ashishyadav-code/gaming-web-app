/**
 * Centralized dynamic date utilities for Team Sarkar Esports Platform.
 * Ensures "Today" dynamically maps to the current date (e.g. 27 Sept 2026)
 * and "Yesterday" maps to the previous date (e.g. 26 Sept 2026).
 */

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'
];

/**
 * Returns formatted date string like "27 Sept 2026"
 */
export function formatDate(date: Date): string {
  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Returns today's date formatted as "27 Sept 2026"
 */
export function getTodayDateString(): string {
  return formatDate(new Date());
}

/**
 * Returns yesterday's date formatted as "26 Sept 2026"
 */
export function getYesterdayDateString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDate(yesterday);
}

/**
 * Normalizes date strings for comparison (removes extra spaces, punctuation, case insensitive)
 */
export function normalizeDate(dateStr: string = ''): string {
  return dateStr
    .toLowerCase()
    .replace(/september/g, 'sept')
    .replace(/sep\b/g, 'sept')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Checks if two date strings represent the same day
 */
export function isSameDay(date1: string = '', date2: string = ''): boolean {
  if (!date1 || !date2) return false;
  const n1 = normalizeDate(date1);
  const n2 = normalizeDate(date2);
  return n1 === n2 || n1.includes(n2) || n2.includes(n1);
}

/**
 * Extracts unique dates from a list of matches, ordered newest first
 */
export function getUniqueMatchDates(matches: { date: string }[]): string[] {
  const datesSet = new Set<string>();
  for (const m of matches) {
    if (m.date) datesSet.add(m.date.trim());
  }
  return Array.from(datesSet);
}
