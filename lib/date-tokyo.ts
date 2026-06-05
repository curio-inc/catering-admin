/** HTML input[type=date] 用 YYYY-MM-DD（Asia/Tokyo） */
export function todayIsoDateInTokyo(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}
