"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  findDemoMemberByEmail,
  writeDemoMemberSession,
} from "@/lib/demo-member-session"
import "@/components/order/customer-order.css"

type MemberLoginFormProps = {
  orderUrl?: string
  signupUrl?: string
}

export function MemberLoginForm({ orderUrl = "/order", signupUrl = "/order/signup" }: MemberLoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("メールアドレスを正しく入力してください。")
      return
    }
    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください。")
      return
    }

    const member = findDemoMemberByEmail(trimmedEmail)
    if (!member) {
      setError("メールアドレスまたはパスワードが正しくありません。")
      return
    }

    writeDemoMemberSession({
      email: member.email,
      name: member.name,
      companyName: member.company_name,
    })
    router.push(orderUrl)
  }

  return (
    <div className="co-page">
      <header className="co-header">
        <p className="co-brand">オンライン注文</p>
        <Link href={orderUrl} className="co-admin-back">
          ← 注文ページへ
        </Link>
      </header>

      <main className="co-main co-signup-main">
        <h1 className="co-title">ログイン</h1>
        <p className="co-lead">登録済みのメールアドレスとパスワードでログインできます。</p>

        <form className="co-panel co-signup-panel" onSubmit={handleSubmit}>
          <div className="co-panel-head co-panel-head--amber">
            <h2 className="co-panel-title">アカウント情報</h2>
          </div>
          <div className="co-panel-section co-panel-section--fields">
            <label className="co-field-grid" htmlFor="login-email">
              メールアドレス *
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="co-field-grid" htmlFor="login-password">
              パスワード *
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="8文字以上"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            {error ? (
              <p className="co-signup-error" role="alert">
                {error}
              </p>
            ) : null}

            <button type="submit" className="co-submit">
              ログイン
            </button>

            <p className="co-signup-footer">
              アカウントをお持ちでない方は{" "}
              <Link href={signupUrl} className="co-signup-inline-link">
                会員登録
              </Link>
              からご登録ください。
            </p>
          </div>
        </form>
      </main>
    </div>
  )
}
