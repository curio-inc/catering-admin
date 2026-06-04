"use client"

import type { DemoUiStatus } from "@/lib/build-demo-view-model"

export const DEMO_STATUS_OPTIONS: { value: DemoUiStatus; label: string }[] = [
  { value: "new", label: "新着" },
  { value: "processing", label: "対応中" },
  { value: "done", label: "完了" },
  { value: "cancelled", label: "キャンセル" },
]

const statusColorClass: Record<DemoUiStatus, string> = {
  new: "demo-status-select--new",
  processing: "demo-status-select--processing",
  done: "demo-status-select--done",
  cancelled: "demo-status-select--cancelled",
}

type DemoOrderStatusSelectProps = {
  value: DemoUiStatus
  onChange: (next: DemoUiStatus) => void
  id?: string
  /** 一覧テーブル内ではラベルを省略 */
  showLabel?: boolean
}

export function DemoOrderStatusSelect({ value, onChange, id, showLabel = true }: DemoOrderStatusSelectProps) {
  const colorClass = statusColorClass[value] ?? ""

  return (
    <div className={`demo-status-field${showLabel ? "" : " demo-status-field--compact"}`}>
      {showLabel ? (
        <label htmlFor={id} className="demo-status-field-label">
          状態
        </label>
      ) : null}
      <select
        id={id}
        className={`demo-status-select ${colorClass}`}
        value={value}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onChange(e.target.value as DemoUiStatus)}
      >
        {DEMO_STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
