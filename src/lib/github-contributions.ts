type Contribution = { date: string; count: number; level: number };
type CalendarDay = Contribution & { week: number; weekday: number };

export function prepareContributions(data: unknown): { days: CalendarDay[]; months: { month: number; week: number }[]; weeks: number } {
  if (!data || typeof data !== "object" || !("contributions" in data) || !Array.isArray(data.contributions) || data.contributions.length === 0 || data.contributions.length > 371) {
    throw new Error("Invalid contribution data");
  }
  let previous = 0;
  let first = 0;
  const months: { month: number; week: number }[] = [];
  const days = data.contributions.map((item: unknown, index: number): CalendarDay => {
    if (!item || typeof item !== "object" || !("date" in item) || !("count" in item) || !("level" in item) || typeof item.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(item.date) || typeof item.count !== "number" || !Number.isInteger(item.count) || item.count < 0 || typeof item.level !== "number" || !Number.isInteger(item.level) || item.level < 0 || item.level > 4) throw new Error("Invalid contribution day");
    const timestamp = Date.parse(`${item.date}T00:00:00Z`);
    if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== item.date || (index > 0 && timestamp - previous !== 86400000)) throw new Error("Invalid contribution date");
    previous = timestamp;
    const date = new Date(timestamp);
    const weekday = date.getUTCDay();
    if (index === 0) first = weekday;
    const week = Math.floor((index + first) / 7);
    if (index === 0 || date.getUTCDate() === 1) months.push({ month: date.getUTCMonth(), week });
    return { date: item.date, count: item.count, level: item.level, week, weekday };
  });
  return { days, months, weeks: days[days.length - 1].week + 1 };
}
