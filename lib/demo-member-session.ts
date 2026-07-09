import { MOCK_CUSTOMERS, type RegisteredCustomer } from "@/lib/mock-customers"

export const DEMO_MEMBER_SESSION_KEY = "demo-member-session"

export type DemoMemberSession = {
  email: string
  name: string
  companyName: string | null
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function findDemoMemberByEmail(email: string): RegisteredCustomer | null {
  const key = normalizeEmail(email)
  return MOCK_CUSTOMERS.find((c) => normalizeEmail(c.email) === key) ?? null
}

export function readDemoMemberSession(): DemoMemberSession | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(DEMO_MEMBER_SESSION_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as DemoMemberSession
    if (!data.email?.trim()) return null
    return {
      email: data.email.trim(),
      name: data.name?.trim() ?? "",
      companyName: data.companyName?.trim() || null,
    }
  } catch {
    return null
  }
}

export function writeDemoMemberSession(session: DemoMemberSession): void {
  if (typeof window === "undefined") return
  localStorage.setItem(
    DEMO_MEMBER_SESSION_KEY,
    JSON.stringify({
      email: session.email.trim(),
      name: session.name.trim(),
      companyName: session.companyName?.trim() || null,
    }),
  )
}

export function clearDemoMemberSession(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(DEMO_MEMBER_SESSION_KEY)
}
