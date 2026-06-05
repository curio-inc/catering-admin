import { cookies } from "next/headers"
import { getIronSession } from "iron-session"
import { redirect } from "next/navigation"
import { LoginForm } from "@/app/admin/login/login-form"
import { sessionOptions, type SessionData } from "@/lib/session"

export default async function LoginPage() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions)
  if (session.isLoggedIn) {
    redirect("/admin/orders")
  }

  return <LoginForm />
}
