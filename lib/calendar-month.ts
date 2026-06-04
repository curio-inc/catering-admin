export type CalendarCell = {
  dateKey: string | null
  day: number | null
  inMonth: boolean
}

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"] as const

export function getWeekdayLabels(): readonly string[] {
  return WEEKDAY_LABELS
}

/** 日曜始まりの月間グリッド（6週×7日） */
export function buildMonthGrid(year: number, month: number): CalendarCell[] {
  const first = new Date(year, month - 1, 1)
  const startPad = first.getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells: CalendarCell[] = []

  for (let i = 0; i < startPad; i++) {
    cells.push({ dateKey: null, day: null, inMonth: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    cells.push({ dateKey, day: d, inMonth: true })
  }
  while (cells.length < 42) {
    cells.push({ dateKey: null, day: null, inMonth: false })
  }
  return cells
}

export function shiftMonth(year: number, month: number, delta: number): { y: number; m: number } {
  let m = month + delta
  let y = year
  while (m < 1) {
    m += 12
    y -= 1
  }
  while (m > 12) {
    m -= 12
    y += 1
  }
  return { y, m }
}
