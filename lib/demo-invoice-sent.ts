const STORAGE_KEY = "catering-admin-demo-invoice-sent"

export function readDemoInvoiceSent(): Record<string, true> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const data = JSON.parse(raw) as unknown
    if (!data || typeof data !== "object") return {}
    return data as Record<string, true>
  } catch {
    return {}
  }
}

export function markDemoInvoiceSent(orderId: string): void {
  if (typeof window === "undefined") return
  const map = readDemoInvoiceSent()
  map[orderId] = true
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

export function isDemoInvoiceSent(orderId: string, invoiceSentAt: string | null): boolean {
  if (invoiceSentAt?.trim()) return true
  return !!readDemoInvoiceSent()[orderId]
}
