"use client"

import { useEffect, useRef } from "react"
import { useFormState, useFormStatus } from "react-dom"
import type { SendInvoiceState } from "@/app/admin/orders/actions"

type Props = {
  orderId: string
  issued: boolean
  sent: boolean
  action: (prevState: SendInvoiceState, formData: FormData) => Promise<SendInvoiceState>
}

function SubmitButton({ sent }: { sent: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border border-amber-700 bg-white px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100 disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-400"
    >
      {pending ? "送信中…" : sent ? "再送付" : "送付"}
    </button>
  )
}

export function SendInvoiceButton({ orderId, issued, sent, action }: Props) {
  const [state, formAction] = useFormState(action, null)
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!state) return
    if (toastRef.current) clearTimeout(toastRef.current)
    toastRef.current = setTimeout(() => {
      // 自動消去は任意。ここでは残す
    }, 4000)
  }, [state])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <form action={formAction}>
          <input type="hidden" name="orderId" value={orderId} />
          <fieldset disabled={!issued}>
            <SubmitButton sent={sent} />
          </fieldset>
        </form>

        {state?.ok ? (
          <span className="text-sm font-medium text-emerald-700">{state.message}</span>
        ) : null}
      </div>

      {state && !state.ok ? (
        <p
          role="alert"
          className="max-w-xl rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm leading-relaxed text-red-800"
        >
          {state.message}
        </p>
      ) : null}
    </div>
  )
}
