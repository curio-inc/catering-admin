import {
  doesPickupSlotOverlapStopBand,
  normalizePickupTimeStart,
} from "@/lib/pickup-time-slots"

export type ReceptionStopEntry = {
  id: string
  stopDate: string
  timeStart: string
  timeEnd: string
}

export const RECEPTION_STOPS_STORAGE_KEY = "catering-admin-reception-stops"

export function createReceptionStopEntry(): ReceptionStopEntry {
  return {
    id: crypto.randomUUID(),
    stopDate: "",
    timeStart: "",
    timeEnd: "",
  }
}

export function parseReceptionStopsJson(raw: string | null): ReceptionStopEntry[] {
  if (!raw) return []
  try {
    const data = JSON.parse(raw) as unknown
    if (!Array.isArray(data)) return []
    return data
      .map((row) => {
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
        return { id, stopDate, timeStart, timeEnd }
      })
      .filter((x): x is ReceptionStopEntry => x !== null)
  } catch {
    return []
  }
}

export type ReceptionStopBlock = { blocked: true; label: string } | { blocked: false }

/** 選択した受取日・時間が受付停止に該当するか */
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
  const t1 = entry.timeStart?.trim()
  const t2 = entry.timeEnd?.trim()
  if (!t1 && !t2) return entry.stopDate
  if (t1 && t2) return `${entry.stopDate} ${t1}〜${t2}`
  if (t1) return `${entry.stopDate} ${t1}〜`
  return `${entry.stopDate} 〜${t2}`
}
