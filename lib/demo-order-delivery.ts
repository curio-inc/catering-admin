import { orderToDemoView, type DemoOrderView } from "@/lib/build-demo-view-model"

export type DemoDeliveryOverride = {
  deliveryDate: string
  deliveryTime: string
}

const STORAGE_KEY = "catering-admin-demo-order-delivery"

export function readDemoOrderDeliveries(): Record<string, DemoDeliveryOverride> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const data = JSON.parse(raw) as unknown
    if (!data || typeof data !== "object") return {}
    return data as Record<string, DemoDeliveryOverride>
  } catch {
    return {}
  }
}

export function writeDemoOrderDelivery(orderId: string, deliveryDate: string, deliveryTime: string): void {
  if (typeof window === "undefined") return
  const map = readDemoOrderDeliveries()
  map[orderId] = { deliveryDate, deliveryTime }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

export function getDemoDeliveryOverride(orderId: string): DemoDeliveryOverride | null {
  return readDemoOrderDeliveries()[orderId] ?? null
}

export function rebuildDemoOrderViewWithDelivery(
  view: DemoOrderView,
  deliveryDate: string,
  deliveryTime: string,
): DemoOrderView {
  const patchedOrder = {
    ...view.order,
    delivery_date: deliveryDate.trim() || null,
    delivery_time: deliveryTime.trim() || null,
  }
  const rebuilt = orderToDemoView(patchedOrder, view.items)
  return { ...rebuilt, uiStatus: view.uiStatus }
}

export function applyDemoDeliveries(orders: DemoOrderView[]): DemoOrderView[] {
  const map = readDemoOrderDeliveries()
  return orders.map((o) => {
    const override = map[o.id]
    if (!override) return o
    return rebuildDemoOrderViewWithDelivery(o, override.deliveryDate, override.deliveryTime)
  })
}
