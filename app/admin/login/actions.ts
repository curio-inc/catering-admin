"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getIronSession } from "iron-session"
import { sessionOptions, type SessionData } from "@/lib/session"

export type LoginState = { error: string } | null

export async function loginAction(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "").trim()
  const adminPassword = process.env.ADMIN_PASSWORD?.trim()

  if (!adminPassword) {
    return { error: "サーバーに ADMIN_PASSWORD が設定されていません。" }
  }

  if (password !== adminPassword) {
    return { error: "パスワードが違います。" }
  }

  const session = await getIronSession<SessionData>(cookies(), sessionOptions)
  session.isLoggedIn = true
  await session.save()

  redirect("/admin/orders")
}
