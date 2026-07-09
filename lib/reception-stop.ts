import {
  doesPickupSlotOverlapStopBand,
  formatClockShort,
  formatClockStorage,
  normalizePickupTimeStart,
  PICKUP_SLOT_MINUTES,
} from "@/lib/pickup-time-slots"

export type ReceptionStopEntry = {
  id: string
  stopDate: string
  timeStart: string
  timeEnd: string
  memo?: string
}

export type ReceptionStopDateStatus = "none" | "all-day" | "partial"

export const RECEPTION_STOPS_STORAGE_KEY = "catering-admin-reception-stops"

export function createReceptionStopEntry(): ReceptionStopEntry {
  return {
    id: crypto.randomUUID(),
    stopDate: "",
    timeStart: "",
    timeEnd: "",
    memo: "",
  }
}

export function parseReceptionStopsJson(raw: string | null): ReceptionStopEntry[] {
  if (!raw) return []
  try {
    const data = JSON.parse(raw) as unknown
    if (!Array.isArray(data)) return []
    return data
      .map((row): ReceptionStopEntry | null => {
        if (!row || typeof row !== "object") return null
        const r = row as Record<string, unknown>
        const id = typeof r.id === "string" ? r.id : crypto.randomUUID()
        const stopDate =
          typeof r.stopDate === "string"
            ? r.stopDate
            : typeof r.dateStart === "string"
              ? r.dateStart
              : ""
        const timeStart = typeof r.timeStart === "string" ? r.timeStart : ""
        const timeEnd = typeof r.timeEnd === "string" ? r.timeEnd : ""
        const memo = typeof r.memo === "string" ? r.memo : ""
        return { id, stopDate, timeStart, timeEnd, memo }
      })
      .filter((x): x is ReceptionStopEntry => x !== null)
  } catch {
    return []
  }
}

export function saveReceptionStops(entries: ReceptionStopEntry[]): void {
  const toSave = entries.filter((e) => e.stopDate.trim() !== "")
  localStorage.setItem(RECEPTION_STOPS_STORAGE_KEY, JSON.stringify(toSave))
}

export function isAllDayReceptionStop(entry: ReceptionStopEntry): boolean {
  return !entry.timeStart?.trim() && !entry.timeEnd?.trim()
}

export function isTimeSlotReceptionStop(entry: ReceptionStopEntry): boolean {
  return !!(entry.timeStart?.trim() || entry.timeEnd?.trim())
}

export function getReceptionStopDateStatus(
  dateKey: string,
  stops: ReceptionStopEntry[],
): ReceptionStopDateStatus {
  const dayStops = stops.filter((e) => e.stopDate.trim() === dateKey)
  if (dayStops.length === 0) return "none"
  if (dayStops.some(isAllDayReceptionStop)) return "all-day"
  if (dayStops.some(isTimeSlotReceptionStop)) return "partial"
  return "none"
}

export function filterReceptionStopsByMonth(
  stops: ReceptionStopEntry[],
  year: number,
  month: number,
): ReceptionStopEntry[] {
  const prefix = `${year}-${String(month).padStart(2, "0")}-`
  return stops
    .filter((e) => e.stopDate.startsWith(prefix))
    .sort((a, b) => {
      if (a.stopDate !== b.stopDate) return a.stopDate.localeCompare(b.stopDate)
      const aAll = isAllDayReceptionStop(a)
      const bAll = isAllDayReceptionStop(b)
      if (aAll !== bAll) return aAll ? -1 : 1
      return (a.timeStart || "").localeCompare(b.timeStart || "")
    })
}

export function toggleAllDayReceptionStop(
  stops: ReceptionStopEntry[],
  dateKey: string,
): ReceptionStopEntry[] {
  const existing = stops.find((e) => e.stopDate === dateKey && isAllDayReceptionStop(e))
  if (existing) {
    return stops.filter((e) => e.id !== existing.id)
  }
  return [
    ...stops,
    {
      id: crypto.randomUUID(),
      stopDate: dateKey,
      timeStart: "",
      timeEnd: "",
      memo: "",
    },
  ]
}

export function addTimeSlotReceptionStop(
  stops: ReceptionStopEntry[],
  input: { stopDate: string; timeStart: string; timeEnd: string; memo?: string },
): { entries: ReceptionStopEntry[]; error?: string } {
  const stopDate = input.stopDate.trim()
  const timeStart = input.timeStart.trim()
  const timeEnd = input.timeEnd.trim()
  const memo = input.memo?.trim() ?? ""

  if (!stopDate) return { entries: stops, error: "日付を入力してください。" }
  if (!timeStart || !timeEnd) return { entries: stops, error: "開始・終了時間を選択してください。" }

  const startMin = parseStopTimeToMinutes(timeStart)
  const endMin = parseStopTimeToMinutes(timeEnd)
  if (startMin == null || endMin == null) return { entries: stops, error: "時間の形式が不正です。" }
  if (endMin <= startMin) return { entries: stops, error: "終了時間は開始時間より後にしてください。" }

  return {
    entries: [
      ...stops,
      {
        id: crypto.randomUUID(),
        stopDate,
        timeStart,
        timeEnd,
        memo,
      },
    ],
  }
}

export function removeReceptionStop(stops: ReceptionStopEntry[], id: string): ReceptionStopEntry[] {
  return stops.filter((e) => e.id !== id)
}

/** 管理画面の時間帯停止用（0:00～24:00・30分単位） */
export const STOP_TIME_START_OPTIONS = buildStopTimeStarts()
export const STOP_TIME_END_OPTIONS = buildStopTimeEnds()

function buildStopTimeStarts(): string[] {
  const options: string[] = []
  for (let m = 0; m < 24 * 60; m += PICKUP_SLOT_MINUTES) {
    options.push(formatClockStorage(m))
  }
  return options
}

function buildStopTimeEnds(): string[] {
  const options: string[] = []
  for (let m = PICKUP_SLOT_MINUTES; m <= 24 * 60; m += PICKUP_SLOT_MINUTES) {
    options.push(m >= 24 * 60 ? "24:00" : formatClockStorage(m))
  }
  return options
}

function parseStopTimeToMinutes(value: string): number | null {
  if (value.trim() === "24:00") return 24 * 60
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
  if (!m) return null
  const hours = Number(m[1])
  const minutes = Number(m[2])
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null
  return hours * 60 + minutes
}

export function formatStopTimeLabel(value: string): string {
  if (value === "24:00") return "24:00"
  const mins = parseStopTimeToMinutes(value)
  if (mins == null) return value
  return formatClockShort(mins)
}

export type ReceptionStopBlock = { blocked: true; label: string } | { blocked: false }

/** 選択した受取日・時間が受注停止に該当するか */
export function findReceptionStopBlock(
  date: string,
  time: string,
  stops: ReceptionStopEntry[],
): ReceptionStopBlock {
  const dateKey = date.trim()
  if (!dateKey) return { blocked: false }

  for (const entry of stops) {
    if (entry.stopDate.trim() !== dateKey) continue

    const timeStart = entry.timeStart?.trim() ?? ""
    const timeEnd = entry.timeEnd?.trim() ?? ""

    if (!timeStart && !timeEnd) {
      return { blocked: true, label: formatReceptionStopLabel(entry) }
    }

    const slotStart = normalizePickupTimeStart(time)
    if (!slotStart) continue

    if (doesPickupSlotOverlapStopBand(slotStart, timeStart, timeEnd)) {
      return { blocked: true, label: formatReceptionStopLabel(entry) }
    }
  }

  return { blocked: false }
}

export function formatReceptionStopLabel(entry: ReceptionStopEntry): string {
  if (!entry.stopDate) return "—"
  if (isAllDayReceptionStop(entry)) {
    const memo = entry.memo?.trim()
    return memo ? `${entry.stopDate} 終日（${memo}）` : `${entry.stopDate} 終日`
  }
  const t1 = formatStopTimeLabel(entry.timeStart?.trim() || "")
  const t2 = formatStopTimeLabel(entry.timeEnd?.trim() || "")
  const range = `${entry.stopDate} ${t1}〜${t2}`
  const memo = entry.memo?.trim()
  return memo ? `${range}（${memo}）` : range
}
