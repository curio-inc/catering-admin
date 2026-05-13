"use client"

import { useState } from "react"

type StatusOption = {
  key: string
  label: string
}

type OrderStatusSelectProps = {
  orderId: string
  currentStatus: string
  options: StatusOption[]
  action: (formData: FormData) => void | Promise<void>
}

const statusColorClass: Record<string, string> = {
  requested: "border-rose-300 bg-rose-50 text-rose-800",
  confirmed: "border-sky-300 bg-sky-50 text-sky-800",
  preparing: "border-amber-300 bg-amber-50 text-amber-900",
  delivered: "border-emerald-300 bg-emerald-50 text-emerald-800",
  cancelled: "border-stone-300 bg-stone-100 text-stone-600",
}

export function OrderStatusSelect({ orderId, currentStatus, options, action }: OrderStatusSelectProps) {
  const [value, setValue] = useState(currentStatus)
  const colorClass = statusColorClass[value] ?? "border-stone-300 bg-white text-stone-800"

  return (
    <form action={action}>
      <input type="hidden" name="orderId" value={orderId} />
      <select
        name="status"
        value={value}
        className={`rounded-full border px-3 py-1 text-xs font-semibold focus:outline-none ${colorClass}`}
        onChange={(e) => {
          const next = e.currentTarget.value
          setValue(next)
          if (next !== currentStatus) {
            e.currentTarget.form?.requestSubmit()
          }
        }}
      >
        {options.map((opt) => (
          <option key={opt.key} value={opt.key}>
            {opt.label}
          </option>
        ))}
        {options.some((opt) => opt.key === currentStatus) ? null : (
          <option value={currentStatus}>{currentStatus}</option>
        )}
      </select>
    </form>
  )
}
