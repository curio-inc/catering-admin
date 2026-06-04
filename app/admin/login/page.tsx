import { redirect } from "next/navigation"
import { isDemoMode } from "@/lib/demo-mode"
import { LoginForm } from "./login-form"

export default function LoginPage() {
  if (isDemoMode()) {
    redirect("/admin/orders")
  }

  return <LoginForm />
}
