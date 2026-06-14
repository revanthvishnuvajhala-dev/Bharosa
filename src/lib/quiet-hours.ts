const QUIET_TZ = "Asia/Kolkata";
const QUIET_START_HOUR = 10;
const QUIET_END_HOUR = 19;

export function isWithinQuietHours(date: Date = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: QUIET_TZ,
    hour: "numeric",
    hour12: false,
  }).formatToParts(date);

  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  return hour >= QUIET_START_HOUR && hour < QUIET_END_HOUR;
}

export function getNextQuietWindowOpen(date: Date = new Date()): Date {
  if (isWithinQuietHours(date)) return date;

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: QUIET_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);

  const year = get("year");
  const month = get("month");
  const day = get("day");
  const hour = get("hour");

  const targetDay = hour >= QUIET_END_HOUR ? day + 1 : day;
  const targetHour = QUIET_START_HOUR;

  const istAsUtc = new Date(
    `${year}-${String(month).padStart(2, "0")}-${String(targetDay).padStart(2, "0")}T${String(targetHour).padStart(2, "0")}:00:00+05:30`,
  );

  return istAsUtc;
}
