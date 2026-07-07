/** 受け取り・お届け時間枠（30分単位・4:30～17:00） */

export const PICKUP_SLOT_MINUTES = 30
/** 選択可能な最初の枠（4:30） */
const PICKUP_RANGE_START_MINUTES = 4 * 60 + 30
/** 選択可能な最後の枠の開始時刻（16:30～17:00） */
const PICKUP_RANGE_END_START_MINUTES = 16 * 60 + 30

export type PickupTimeSlot = {
  /** 保存用 HH:MM（24時間・0埋め） */
  start: string
  end: string
  /** 表示用 例: 0:00～0:30 */
  label: string
}

function pad2(n: number): string {
  return n.toString().padStart(2, "0")
}

export function parseTimeToMinutes(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
  if (!m) return null
  const hours = Number(m[1])
  const minutes = Number(m[2])
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null
  return hours * 60 + minutes
}

/** 表示用（先頭0なし） 例: 5:00, 24:00 */
export function formatClockShort(minutes: number): string {
  if (minutes >= 24 * 60) return "24:00"
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}:${pad2(m)}`
}

/** 保存用 HH:MM */
export function formatClockStorage(minutes: number): string {
  const capped = Math.min(minutes, 24 * 60 - 1)
  const h = Math.floor(capped / 60)
  const m = capped % 60
  return `${pad2(h)}:${pad2(m)}`
}

export function normalizePickupTimeStart(value: string | null | undefined): string | null {
  if (!value?.trim()) return null
  const head = /^(\d{1,2}:\d{2})/.exec(value.trim())?.[1] ?? value.trim()
  const mins = parseTimeToMinutes(head)
  if (mins == null) return null
  const slotStart = Math.floor(mins / PICKUP_SLOT_MINUTES) * PICKUP_SLOT_MINUTES
  if (slotStart >= 24 * 60) return null
  return formatClockStorage(slotStart)
}

export function formatPickupTimeRange(start: string | null | undefined): string | null {
  const normalized = normalizePickupTimeStart(start)
  if (!normalized) return null
  const startMin = parseTimeToMinutes(normalized)
  if (startMin == null) return null
  const endMin = startMin + PICKUP_SLOT_MINUTES
  const endStr = endMin >= 24 * 60 ? "24:00" : formatClockShort(endMin)
  return `${formatClockShort(startMin)}～${endStr}`
}

function buildSlot(startMin: number): PickupTimeSlot {
  const endMin = startMin + PICKUP_SLOT_MINUTES
  const start = formatClockStorage(startMin)
  const end = endMin >= 24 * 60 ? "24:00" : formatClockStorage(endMin)
  const label = `${formatClockShort(startMin)}～${endMin >= 24 * 60 ? "24:00" : formatClockShort(endMin)}`
  return { start, end, label }
}

export const PICKUP_TIME_SLOTS: PickupTimeSlot[] = (() => {
  const slots: PickupTimeSlot[] = []
  for (let m = PICKUP_RANGE_START_MINUTES; m <= PICKUP_RANGE_END_START_MINUTES; m += PICKUP_SLOT_MINUTES) {
    slots.push(buildSlot(m))
  }
  return slots
})()

export function formatDeliveryDateTime(
  date: string | null | undefined,
  timeStart: string | null | undefined,
): string {
  if (!date?.trim()) return "—"
  const d = date.trim()
  const range = formatPickupTimeRange(timeStart)
  return range ? `${d} ${range}` : d
}

/** 受付停止帯 [stopStart, stopEnd] と時間枠が重なるか */
export function doesPickupSlotOverlapStopBand(
  slotStart: string,
  timeStart: string,
  timeEnd: string,
): boolean {
  const startMin = parseTimeToMinutes(slotStart)
  if (startMin == null) return false
  const endMin = startMin + PICKUP_SLOT_MINUTES

  const stopStart = timeStart ? parseTimeToMinutes(timeStart) : null
  const stopEnd = timeEnd ? parseTimeToMinutes(timeEnd) : null

  if (stopStart != null && stopEnd != null) {
    if (stopStart <= stopEnd) return startMin < stopEnd && endMin > stopStart
    return startMin < stopEnd || endMin > stopStart
  }
  if (stopStart != null) return endMin > stopStart
  if (stopEnd != null) return startMin < stopEnd
  return false
}
