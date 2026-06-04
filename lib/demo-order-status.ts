import { statusToUi, type DemoOrderView, type DemoUiStatus } from "@/lib/build-demo-view-model"

const STORAGE_KEY = "catering-admin-demo-order-status"

export function readDemoOrderStatuses(): Record<string, DemoUiStatus> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const data = JSON.parse(raw) as unknown
    if (!data || typeof data !== "object") return {}
    return data as Record<string, DemoUiStatus>
  } catch {
    return {}
  }
}

export function writeDemoOrderStatus(orderId: string, uiStatus: DemoUiStatus): void {
  if (typeof window === "undefined") return
  const map = readDemoOrderStatuses()
  map[orderId] = uiStatus
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

export function applyDemoStatuses(orders: DemoOrderView[]): DemoOrderView[] {
  const map = readDemoOrderStatuses()
  return orders.map((o) => {
    const override = map[o.id]
    return override ? { ...o, uiStatus: override } : o
  })
}

export function getDemoUiStatus(orderId: string, dbStatus: string): DemoUiStatus {
  const map = readDemoOrderStatuses()
  return map[orderId] ?? statusToUi(dbStatus)
}
