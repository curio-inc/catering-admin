"use client"

import { PICKUP_TIME_SLOTS, normalizePickupTimeStart } from "@/lib/pickup-time-slots"

type PickupTimeSlotSelectProps = {
  id?: string
  value: string
  onChange: (start: string) => void
  required?: boolean
  className?: string
  "aria-invalid"?: boolean
}

export function PickupTimeSlotSelect({
  id,
  value,
  onChange,
  required,
  className,
  "aria-invalid": ariaInvalid,
}: PickupTimeSlotSelectProps) {
  const normalized = normalizePickupTimeStart(value) ?? ""

  return (
    <select
      id={id}
      required={required}
      value={normalized}
      aria-invalid={ariaInvalid}
      className={className}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">選択してください</option>
      {PICKUP_TIME_SLOTS.map((slot) => (
        <option key={slot.start} value={slot.start}>
          {slot.label}
        </option>
      ))}
    </select>
  )
}
