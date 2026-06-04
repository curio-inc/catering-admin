"use client"

import { useMemo } from "react"
import type { DemoOrderView } from "@/lib/build-demo-view-model"
import { buildMonthGrid, getWeekdayLabels, shiftMonth } from "@/lib/calendar-month"

function yen(n: number) {
  return `¥${n.toLocaleString("ja-JP")}`
}

type DemoOrdersCalendarProps = {
  orders: DemoOrderView[]
  year: number
  month: number
  onMonthChange: (y: number, m: number) => void
  onOpenOrder: (id: string) => void
}

export function DemoOrdersCalendar({ orders, year, month, onMonthChange, onOpenOrder }: DemoOrdersCalendarProps) {
  const cells = useMemo(() => buildMonthGrid(year, month), [year, month])
  const weekdays = getWeekdayLabels()

  const calendarOrders = useMemo(
    () => orders.filter((o) => o.uiStatus !== "cancelled"),
    [orders],
  )

  const byDate = useMemo(() => {
    const map = new Map<string, DemoOrderView[]>()
    for (const o of calendarOrders) {
      const key = o.deliveryDateKey
      if (!key) continue
      const list = map.get(key) ?? []
      list.push(o)
      map.set(key, list)
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.deliveryMs - b.deliveryMs)
    }
    return map
  }, [calendarOrders])

  const unscheduled = useMemo(
    () => calendarOrders.filter((o) => !o.deliveryDateKey),
    [calendarOrders],
  )

  const monthOrderCount = useMemo(() => {
    return calendarOrders.filter((o) => o.deliveryYear === year && o.deliveryMonth === month).length
  }, [calendarOrders, year, month])

  function goPrev() {
    const { y, m } = shiftMonth(year, month, -1)
    onMonthChange(y, m)
  }

  function goNext() {
    const { y, m } = shiftMonth(year, month, 1)
    onMonthChange(y, m)
  }

  return (
    <div className="admin-workspace demo-calendar-workspace">
      <div className="demo-calendar-toolbar">
        <button type="button" className="btn btn-compact" onClick={goPrev} aria-label="前の月">
          ←
        </button>
        <h2 className="demo-calendar-month-title">
          {year}年{month}月
        </h2>
        <button type="button" className="btn btn-compact" onClick={goNext} aria-label="次の月">
          →
        </button>
        <p className="demo-calendar-count">{monthOrderCount} 件のお届け予定</p>
      </div>

      <div className="demo-calendar-grid" role="grid" aria-label={`${year}年${month}月の注文カレンダー`}>
        {weekdays.map((w) => (
          <div key={w} className="demo-calendar-weekday" role="columnheader">
            {w}
          </div>
        ))}
        {cells.map((cell, i) => {
          const dayOrders = cell.dateKey ? (byDate.get(cell.dateKey) ?? []) : []
          const isToday = cell.dateKey === todayKeyInTokyo()
          return (
            <div
              key={`${cell.dateKey ?? "pad"}-${i}`}
              className={`demo-calendar-cell${cell.inMonth ? "" : " demo-calendar-cell--pad"}${isToday ? " demo-calendar-cell--today" : ""}`}
              role="gridcell"
            >
              {cell.day != null ? <span className="demo-calendar-day-num">{cell.day}</span> : null}
              <div className="demo-calendar-events">
                {dayOrders.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    className="demo-cal-event"
                    onClick={() => onOpenOrder(o.id)}
                    title={`${o.customerName} ${o.deliveryLabel} ${yen(o.totalYen)}`}
                  >
                    <span className="demo-cal-event-time">{o.form.time || "—"}</span>
                    <span className="demo-cal-event-name">{o.customerName}</span>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {unscheduled.length > 0 ? (
        <div className="demo-calendar-unscheduled">
          <h3 className="order-section-title">お届け日未設定</h3>
          <ul className="demo-calendar-unscheduled-list">
            {unscheduled.map((o) => (
              <li key={o.id}>
                <button type="button" className="demo-cal-event" onClick={() => onOpenOrder(o.id)}>
                  {o.orderNumber} · {o.customerName}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

function todayKeyInTokyo(): string {
  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date())
  const y = parts.find((p) => p.type === "year")?.value
  const m = parts.find((p) => p.type === "month")?.value
  const d = parts.find((p) => p.type === "day")?.value
  if (!y || !m || !d) return ""
  return `${y}-${m}-${d}`
}
