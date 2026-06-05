"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getIronSession } from "iron-session"
import { getAdminPassword } from "@/lib/admin-password"
import { sessionOptions, type SessionData } from "@/lib/session"

export type LoginState = { error: string } | null

export async function loginAction(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "").trim()
  const adminPassword = getAdminPassword()

  if (password !== adminPassword) {
    return { error: "パスワードが違います。" }
  }

  const session = await getIronSession<SessionData>(cookies(), sessionOptions)
  session.isLoggedIn = true
  await session.save()

  redirect("/admin/orders")
}
