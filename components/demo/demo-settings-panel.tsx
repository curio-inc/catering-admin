"use client"

import { useEffect, useState } from "react"
import {
  createReceptionStopEntry,
  parseReceptionStopsJson,
  RECEPTION_STOPS_STORAGE_KEY,
  type ReceptionStopEntry,
} from "@/lib/reception-stop"

type DemoSettingsPanelProps = {
  onSaved?: () => void
}

export function DemoSettingsPanel({ onSaved }: DemoSettingsPanelProps) {
  const [entries, setEntries] = useState<ReceptionStopEntry[]>([createReceptionStopEntry()])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem(RECEPTION_STOPS_STORAGE_KEY)
    const parsed = parseReceptionStopsJson(raw)
    setEntries(parsed.length > 0 ? parsed : [createReceptionStopEntry()])
    setLoaded(true)
  }, [])

  function updateEntry(id: string, patch: Partial<ReceptionStopEntry>) {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }

  function addEntry() {
    setEntries((prev) => [...prev, createReceptionStopEntry()])
  }

  function removeEntry(id: string) {
    setEntries((prev) => (prev.length <= 1 ? [createReceptionStopEntry()] : prev.filter((e) => e.id !== id)))
  }

  function handleSave() {
    const toSave = entries.filter((e) => e.stopDate.trim() !== "")
    localStorage.setItem(RECEPTION_STOPS_STORAGE_KEY, JSON.stringify(toSave))
    setEntries(toSave.length > 0 ? toSave : [createReceptionStopEntry()])
    onSaved?.()
  }

  if (!loaded) {
    return (
      <div className="admin-workspace">
        <p className="settings-loading">読み込み中…</p>
      </div>
    )
  }

  return (
    <div className="admin-workspace settings-workspace">
      <h2 className="settings-section-title">受付停止</h2>

      <div className="settings-stop-list">
        {entries.map((entry, index) => (
          <div key={entry.id} className="settings-stop-row">
            <div className="settings-stop-row-head">
              <span className="settings-stop-index">{index + 1}</span>
              {entries.length > 1 ? (
                <button type="button" className="btn btn-compact settings-remove-btn" onClick={() => removeEntry(entry.id)}>
                  削除
                </button>
              ) : null}
            </div>
            <div className="settings-stop-fields">
              <div className="detail-field">
                <label htmlFor={`stop-date-${entry.id}`}>受付停止日</label>
                <input
                  id={`stop-date-${entry.id}`}
                  type="date"
                  value={entry.stopDate}
                  onChange={(e) => updateEntry(entry.id, { stopDate: e.target.value })}
                />
              </div>
              <div className="detail-field">
                <label htmlFor={`stop-time-start-${entry.id}`}>時間（開始）</label>
                <input
                  id={`stop-time-start-${entry.id}`}
                  type="time"
                  value={entry.timeStart}
                  onChange={(e) => updateEntry(entry.id, { timeStart: e.target.value })}
                />
              </div>
              <div className="detail-field">
                <label htmlFor={`stop-time-end-${entry.id}`}>時間（終了）</label>
                <input
                  id={`stop-time-end-${entry.id}`}
                  type="time"
                  value={entry.timeEnd}
                  onChange={(e) => updateEntry(entry.id, { timeEnd: e.target.value })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="settings-actions">
        <button type="button" className="btn" onClick={addEntry}>
          行を追加
        </button>
        <button type="button" className="btn btn-primary" onClick={handleSave}>
          保存
        </button>
      </div>
    </div>
  )
}
