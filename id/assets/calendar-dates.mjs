export function calendarDateKey(date) {
  return String(date.getFullYear()).padStart(4, "0") + "-" +
    String(date.getMonth() + 1).padStart(2, "0") + "-" +
    String(date.getDate()).padStart(2, "0");
}
function fromKey(key) {
  const p = String(key).split("-").map(Number);
  return new Date(p[0], p[1] - 1, p[2]);
}
function toKey(date) { return calendarDateKey(date); }
function shift(date, days) {
  const out = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  out.setDate(out.getDate() + days);
  return out;
}
function inMonth(date, month) { return date.getMonth() + 1 === month; }

export function getOccurrence(event, year) {
  const rule = event && event.recurrence;
  if (!rule || !Number.isInteger(year)) return null;
  let start;
  if (rule.type === "specificYear") {
    if (year !== rule.year) return null;
    start = fromKey(event.date2026.start);
  } else if (rule.type === "fixedDate") {
    start = new Date(year, rule.month - 1, rule.day);
  } else if (rule.type === "nthWeekday") {
    const first = new Date(year, rule.month - 1, 1);
    const day = 1 + ((rule.weekday - first.getDay() + 7) % 7) + (rule.occurrence - 1) * 7;
    start = new Date(year, rule.month - 1, day);
    if (!inMonth(start, rule.month)) return null;
  } else if (rule.type === "lastWeekday") {
    const last = new Date(year, rule.month, 0);
    const day = last.getDate() - ((last.getDay() - rule.weekday + 7) % 7);
    start = new Date(year, rule.month - 1, day);
  } else if (rule.type === "lastFullWeekend") {
    const last = new Date(year, rule.month, 0);
    const lastSunday = last.getDate() - last.getDay();
    start = new Date(year, rule.month - 1, lastSunday - 1);
  } else {
    return null;
  }
  if (Number.isNaN(start.getTime())) return null;
  const duration = Number.isInteger(event.durationDays) ? event.durationDays : 0;
  const end = shift(start, duration);
  return { start: toKey(start), end: toKey(end) };
}
export function eventOccursOn(event, date) {
  const occurrence = getOccurrence(event, date.getFullYear());
  if (!occurrence) return false;
  const key = calendarDateKey(date);
  return key >= occurrence.start && key <= occurrence.end;
}
