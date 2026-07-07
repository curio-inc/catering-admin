import type { DemoOrderView } from "@/lib/build-demo-view-model"
import { MOCK_CUSTOMERS, type RegisteredCustomer } from "@/lib/mock-customers"

export type DemoCustomerView = {
  id: string
  companyName: string | null
  name: string
  email: string
  registeredLabel: string
  orders: DemoOrderView[]
}

function formatRegisteredAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      timeZone: "Asia/Tokyo",
    }).format(new Date(iso))
  } catch {
    return "—"
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function buildDemoCustomersForClient(orders: DemoOrderView[]): DemoCustomerView[] {
  const ordersByEmail = new Map<string, DemoOrderView[]>()
  for (const order of orders) {
    const key = normalizeEmail(order.order.customer_email)
    const list = ordersByEmail.get(key) ?? []
    list.push(order)
    ordersByEmail.set(key, list)
  }

  return MOCK_CUSTOMERS.map((customer) => toCustomerView(customer, ordersByEmail.get(normalizeEmail(customer.email)) ?? []))
    .sort((a, b) => a.name.localeCompare(b.name, "ja"))
}

function toCustomerView(customer: RegisteredCustomer, orders: DemoOrderView[]): DemoCustomerView {
  const sortedOrders = [...orders].sort((a, b) => {
    if (b.createdAtMs !== a.createdAtMs) return b.createdAtMs - a.createdAtMs
    return b.id.localeCompare(a.id)
  })

  return {
    id: customer.id,
    companyName: customer.company_name?.trim() || null,
    name: customer.name,
    email: customer.email,
    registeredLabel: formatRegisteredAt(customer.registered_at),
    orders: sortedOrders,
  }
}

export function filterDemoCustomers(customers: DemoCustomerView[], query: string): DemoCustomerView[] {
  const q = query.trim().toLowerCase()
  if (!q) return customers
  return customers.filter((c) => {
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.companyName?.toLowerCase().includes(q) ?? false)
    )
  })
}
