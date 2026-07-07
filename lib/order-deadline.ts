import { todayIsoDateInTokyo } from "@/lib/date-tokyo"

/** お届け日の何日前まで受付するか */
export const ORDER_DEADLINE_DAYS_BEFORE = 2
/** 締切時刻（JST） */
export const ORDER_DEADLINE_HOUR = 12
export const ORDER_DEADLINE_MINUTE = 0

export const ORDER_DEADLINE_DESCRIPTION = "お届け日の2日前12:00まで"

function parseIsoDate(iso: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (!match) return null
  return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) }
}

function addCalendarDays(isoDate: string, days: number): string {
  const parts = parseIsoDate(isoDate)
  if (!parts) return isoDate
  const dt = new Date(Date.UTC(parts.y, parts.m - 1, parts.d))
  dt.setUTCDate(dt.getUTCDate() + days)
  return dt.toISOString().slice(0, 10)
}

/** 指定お届け日の注文締切（JST・ミリ秒） */
export function getOrderDeadlineMs(deliveryDateIso: string): number | null {
  const parts = parseIsoDate(deliveryDateIso)
  if (!parts) return null
  const deadlineDate = addCalendarDays(deliveryDateIso, -ORDER_DEADLINE_DAYS_BEFORE)
  const hour = String(ORDER_DEADLINE_HOUR).padStart(2, "0")
  const minute = String(ORDER_DEADLINE_MINUTE).padStart(2, "0")
  return Date.parse(`${deadlineDate}T${hour}:${minute}:00+09:00`)
}

/** お届け日が現在の締切ルールで注文可能か */
export function isDeliveryDateOrderable(deliveryDateIso: string, now = new Date()): boolean {
  const deadlineMs = getOrderDeadlineMs(deliveryDateIso)
  if (deadlineMs == null) return false
  return now.getTime() <= deadlineMs
}

/** 日付入力の min 属性用（締切を過ぎていない最短のお届け日） */
export function minDeliveryDateIsoInTokyo(now = new Date()): string {
  const today = todayIsoDateInTokyo(now)
  let candidate = addCalendarDays(today, ORDER_DEADLINE_DAYS_BEFORE)
  while (!isDeliveryDateOrderable(candidate, now)) {
    candidate = addCalendarDays(candidate, 1)
  }
  return candidate
}
