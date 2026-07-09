"use client"

import Link from "next/link"
import { useState } from "react"
import { writeDemoMemberSession } from "@/lib/demo-member-session"
import "@/components/order/customer-order.css"

type MemberSignupFormProps = {
  orderUrl?: string
  loginUrl?: string
}

export function MemberSignupForm({ orderUrl = "/order", loginUrl = "/order/login" }: MemberSignupFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

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
    if (password !== passwordConfirm) {
      setError("パスワード（確認）が一致しません。")
      return
    }

    writeDemoMemberSession({
      email: trimmedEmail,
      name: "",
      companyName: null,
    })
    setDone(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
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
        {done ? (
          <div className="co-panel co-signup-panel">
            <div className="co-panel-head co-panel-head--amber">
              <h1 className="co-panel-title">会員登録が完了しました</h1>
            </div>
            <div className="co-panel-section co-panel-section--fields">
              <p className="co-member-signup-text">
                {email.trim()} で会員登録が完了しました。注文ページからご注文ください。
              </p>
              <Link href={orderUrl} className="co-submit co-signup-submit-link">
                注文ページへ進む
              </Link>
            </div>
          </div>
        ) : (
          <>
            <h1 className="co-title">会員登録</h1>
            <p className="co-lead">メールアドレスとパスワードで会員登録できます。</p>

            <form className="co-panel co-signup-panel" onSubmit={handleSubmit}>
              <div className="co-panel-head co-panel-head--amber">
                <h2 className="co-panel-title">アカウント情報</h2>
              </div>
              <div className="co-panel-section co-panel-section--fields">
                <label className="co-field-grid" htmlFor="signup-email">
                  メールアドレス *
                  <input
                    id="signup-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <label className="co-field-grid" htmlFor="signup-password">
                  パスワード *
                  <input
                    id="signup-password"
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="8文字以上"
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
                <label className="co-field-grid" htmlFor="signup-password-confirm">
                  パスワード（確認） *
                  <input
                    id="signup-password-confirm"
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="もう一度入力"
                    minLength={8}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                  />
                </label>

                {error ? (
                  <p className="co-signup-error" role="alert">
                    {error}
                  </p>
                ) : null}

                <button type="submit" className="co-submit">
                  会員登録する
                </button>

                <p className="co-signup-footer">
                  すでにアカウントをお持ちの方は{" "}
                  <Link href={loginUrl} className="co-signup-inline-link">
                    ログイン
                  </Link>
                  してください。
                </p>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  )
}
