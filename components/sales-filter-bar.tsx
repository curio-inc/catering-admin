"use client"

import { useRouter } from "next/navigation"
import { useRef } from "react"

type SalesFilterBarProps = {
  from: string
  to: string
}

export function SalesFilterBar({ from, to }: SalesFilterBarProps) {
  const router = useRouter()
  const fromRef = useRef<HTMLInputElement>(null)
  const toRef = useRef<HTMLInputElement>(null)

  function submit() {
    const f = fromRef.current?.value ?? ""
    const t = toRef.current?.value ?? ""
    const params = new URLSearchParams()
    if (f) params.set("from", f)
    if (t) params.set("to", t)
    router.push(`/admin/orders?${params.toString()}`)
  }

  function clear() {
    router.push("/admin/orders")
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-col gap-0.5">
        <label className="text-xs font-medium text-stone-600">配達日 From</label>
        <input
          ref={fromRef}
          type="date"
          defaultValue={from}
          className="rounded-md border border-stone-300 px-2 py-1 text-sm text-stone-800"
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <label className="text-xs font-medium text-stone-600">配達日 To</label>
        <input
          ref={toRef}
          type="date"
          defaultValue={to}
          className="rounded-md border border-stone-300 px-2 py-1 text-sm text-stone-800"
        />
      </div>
      <button
        type="button"
        onClick={submit}
        className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
      >
        絞り込む
      </button>
      {(from || to) && (
        <button
          type="button"
          onClick={clear}
          className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm text-stone-600 hover:bg-stone-50"
        >
          クリア
        </button>
      )}
    </div>
  )
}
