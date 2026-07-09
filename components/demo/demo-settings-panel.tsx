"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { buildMonthGrid, getWeekdayLabels, shiftMonth } from "@/lib/calendar-month"
import { todayIsoDateInTokyo } from "@/lib/date-tokyo"
import {
  addTimeSlotReceptionStop,
  filterReceptionStopsByMonth,
  formatReceptionStopLabel,
  formatStopTimeLabel,
  getReceptionStopDateStatus,
  isAllDayReceptionStop,
  parseReceptionStopsJson,
  RECEPTION_STOPS_STORAGE_KEY,
  removeReceptionStop,
  saveReceptionStops,
  STOP_TIME_END_OPTIONS,
  STOP_TIME_START_OPTIONS,
  toggleAllDayReceptionStop,
  type ReceptionStopEntry,
} from "@/lib/reception-stop"

type DemoSettingsPanelProps = {
  onSaved?: (message?: string) => void
}

function currentYmInTokyo() {
  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "numeric",
  }).formatToParts(new Date())
  const y = Number(parts.find((p) => p.type === "year")?.value)
  const m = Number(parts.find((p) => p.type === "month")?.value)
  return { y, m }
}

function monthValue(y: number, m: number) {
  return `${y}-${m < 10 ? "0" : ""}${m}`
}

function parseMonthInput(v: string): { y: number; m: number } | null {
  const p = /^(\d{4})-(\d{2})$/.exec(v)
  if (!p) return null
  return { y: Number(p[1]), m: Number(p[2]) }
}

function getDayOfWeek(dateKey: string): number {
  const [y, m, d] = dateKey.split("-").map(Number)
  return new Date(y, m - 1, d).getDay()
}

export function DemoSettingsPanel({ onSaved }: DemoSettingsPanelProps) {
  const now = currentYmInTokyo()
  const [entries, setEntries] = useState<ReceptionStopEntry[]>([])
  const [year, setYear] = useState(now.y)
  const [month, setMonth] = useState(now.m)
  const [loaded, setLoaded] = useState(false)
  const [slotDate, setSlotDate] = useState("")
  const [slotStart, setSlotStart] = useState(STOP_TIME_START_OPTIONS[0] ?? "00:00")
  const [slotEnd, setSlotEnd] = useState(STOP_TIME_END_OPTIONS[0] ?? "00:30")
  const [slotMemo, setSlotMemo] = useState("")
  const [formError, setFormError] = useState("")

  const persist = useCallback(
    (next: ReceptionStopEntry[], message?: string) => {
      setEntries(next)
      saveReceptionStops(next)
      onSaved?.(message)
    },
    [onSaved],
  )

  useEffect(() => {
    const parsed = parseReceptionStopsJson(localStorage.getItem(RECEPTION_STOPS_STORAGE_KEY))
    setEntries(parsed)
    setLoaded(true)
  }, [])

  const cells = useMemo(() => buildMonthGrid(year, month), [year, month])
  const weekdays = getWeekdayLabels()
  const monthStops = useMemo(() => filterReceptionStopsByMonth(entries, year, month), [entries, year, month])

  function goThisMonth() {
    const c = currentYmInTokyo()
    setYear(c.y)
    setMonth(c.m)
  }

  function goLastMonth() {
    const c = currentYmInTokyo()
    const { y, m } = shiftMonth(c.y, c.m, -1)
    setYear(y)
    setMonth(m)
  }

  function goPrevMonth() {
    const { y, m } = shiftMonth(year, month, -1)
    setYear(y)
    setMonth(m)
  }

  function goNextMonth() {
    const { y, m } = shiftMonth(year, month, 1)
    setYear(y)
    setMonth(m)
  }

  function handleToggleAllDay(dateKey: string) {
    const next = toggleAllDayReceptionStop(entries, dateKey)
    const added = next.length > entries.length
    persist(next, added ? "終日の受注停止を追加しました" : "終日の受注停止を解除しました")
  }

  function handleAddTimeSlot(e: React.FormEvent) {
    e.preventDefault()
    setFormError("")
    const result = addTimeSlotReceptionStop(entries, {
      stopDate: slotDate,
      timeStart: slotStart,
      timeEnd: slotEnd,
      memo: slotMemo,
    })
    if (result.error) {
      setFormError(result.error)
      return
    }
    persist(result.entries, "時間帯停止を追加しました")
    setSlotMemo("")
  }

  function handleRemove(id: string) {
    persist(removeReceptionStop(entries, id), "受注停止を削除しました")
  }

  if (!loaded) {
    return (
      <div className="admin-workspace">
        <p className="settings-loading">読み込み中…</p>
      </div>
    )
  }

  return (
    <div className="admin-workspace reception-stop-settings">
      <div className="rss-header-card">
        <div className="rss-header-text">
          <h2 className="rss-title">受注停止日時</h2>
          <p className="rss-lead">
            カレンダーで終日停止を切り替え、時間帯指定も追加できます。停止中の日は注文フォームから選べません。
          </p>
        </div>
        <div className="rss-month-controls">
          <label htmlFor="rss-month-input" className="sr-only">
            表示する年月
          </label>
          <input
            id="rss-month-input"
            type="month"
            value={monthValue(year, month)}
            onChange={(e) => {
              const p = parseMonthInput(e.target.value)
              if (p) {
                setYear(p.y)
                setMonth(p.m)
              }
            }}
          />
          <button type="button" className="btn btn-compact btn-primary" onClick={goThisMonth}>
            今月
          </button>
          <button type="button" className="btn btn-compact" onClick={goLastMonth}>
            先月
          </button>
        </div>
      </div>

      <div className="rss-calendar-card">
        <div className="rss-cal-toolbar">
          <button type="button" className="btn btn-compact" onClick={goPrevMonth}>
            ‹ 前月
          </button>
          <h3 className="rss-cal-month-title">
            {year}年{month}月
          </h3>
          <button type="button" className="btn btn-compact" onClick={goNextMonth}>
            次月 ›
          </button>
          <div className="rss-legend" aria-label="カレンダーの凡例">
            <span className="rss-legend-item">
              <span className="rss-legend-swatch rss-legend-swatch--all-day" aria-hidden />
              終日停止
            </span>
            <span className="rss-legend-item">
              <span className="rss-legend-swatch rss-legend-swatch--partial" aria-hidden />
              時間帯停止あり
            </span>
          </div>
          <p className="rss-cal-hint">日付をクリックで終日の受注停止を切り替え</p>
        </div>

        <div className="rss-calendar-grid" role="grid" aria-label={`${year}年${month}月の受注停止カレンダー`}>
          {weekdays.map((w, i) => (
            <div
              key={w}
              className={`rss-calendar-weekday${i === 0 ? " rss-calendar-weekday--sun" : ""}${i === 6 ? " rss-calendar-weekday--sat" : ""}`}
              role="columnheader"
            >
              {w}
            </div>
          ))}
          {cells.map((cell, i) => {
            if (!cell.inMonth || !cell.dateKey || cell.day == null) {
              return <div key={`pad-${i}`} className="rss-calendar-cell rss-calendar-cell--pad" role="gridcell" />
            }

            const dateKey = cell.dateKey
            const status = getReceptionStopDateStatus(dateKey, entries)
            const dow = getDayOfWeek(dateKey)
            return (
              <button
                key={dateKey}
                type="button"
                className={`rss-calendar-cell rss-calendar-cell--clickable rss-calendar-cell--${status}${dow === 0 ? " rss-calendar-cell--sun" : ""}${dow === 6 ? " rss-calendar-cell--sat" : ""}`}
                role="gridcell"
                aria-pressed={status === "all-day"}
                aria-label={`${month}月${cell.day}日${status === "all-day" ? " 終日停止中" : status === "partial" ? " 時間帯停止あり" : ""}`}
                onClick={() => handleToggleAllDay(dateKey)}
              >
                <span className="rss-calendar-day-num">{cell.day}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rss-bottom-grid">
        <form className="rss-add-card" onSubmit={handleAddTimeSlot}>
          <h3 className="rss-card-title">時間帯で停止を追加</h3>
          <div className="rss-add-fields">
            <label className="rss-field" htmlFor="rss-slot-date">
              日付
              <input
                id="rss-slot-date"
                type="date"
                required
                value={slotDate}
                min={todayIsoDateInTokyo()}
                onChange={(e) => setSlotDate(e.target.value)}
              />
            </label>
            <label className="rss-field" htmlFor="rss-slot-start">
              開始時間
              <select id="rss-slot-start" value={slotStart} onChange={(e) => setSlotStart(e.target.value)}>
                {STOP_TIME_START_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {formatStopTimeLabel(t)}
                  </option>
                ))}
              </select>
            </label>
            <label className="rss-field" htmlFor="rss-slot-end">
              終了時間
              <select id="rss-slot-end" value={slotEnd} onChange={(e) => setSlotEnd(e.target.value)}>
                {STOP_TIME_END_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {formatStopTimeLabel(t)}
                  </option>
                ))}
              </select>
            </label>
            <label className="rss-field rss-field--wide" htmlFor="rss-slot-memo">
              メモ（任意）
              <input
                id="rss-slot-memo"
                type="text"
                placeholder="例：設備点検"
                value={slotMemo}
                onChange={(e) => setSlotMemo(e.target.value)}
              />
            </label>
          </div>
          {formError ? (
            <p className="rss-form-error" role="alert">
              {formError}
            </p>
          ) : null}
          <button type="submit" className="btn btn-primary rss-add-btn">
            時間帯停止を追加
          </button>
        </form>

        <div className="rss-list-card">
          <h3 className="rss-card-title">
            {year}年{month}月の停止一覧
          </h3>
          {monthStops.length === 0 ? (
            <p className="rss-list-empty">この月の受注停止はありません。</p>
          ) : (
            <ul className="rss-list">
              {monthStops.map((entry) => (
                <li key={entry.id} className="rss-list-item">
                  <div className="rss-list-item-body">
                    <span
                      className={`rss-list-badge${isAllDayReceptionStop(entry) ? " rss-list-badge--all-day" : " rss-list-badge--partial"}`}
                    >
                      {isAllDayReceptionStop(entry) ? "終日" : "時間帯"}
                    </span>
                    <span className="rss-list-label">{formatReceptionStopLabel(entry)}</span>
                  </div>
                  <button type="button" className="btn btn-compact rss-list-remove" onClick={() => handleRemove(entry.id)}>
                    削除
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
