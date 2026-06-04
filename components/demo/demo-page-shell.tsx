import type { ReactNode } from "react"
import "./demo.css"

type DemoPageShellProps = {
  brandName: string
  backUrl?: string
  children: ReactNode
}

export function DemoPageShell({ brandName, backUrl, children }: DemoPageShellProps) {
  const brandInitial = brandName.trim().charAt(0) || "D"

  return (
    <div className="demo-root">
      <header className="demo-header">
        {backUrl ? (
          <a href={backUrl} className="demo-back">
            ← LPに戻る
          </a>
        ) : (
          <span className="demo-back" style={{ visibility: "hidden" }}>
            ←
          </span>
        )}
        <div className="demo-brand">
          <span className="demo-brand-icon" aria-hidden>
            {brandInitial}
          </span>
          {brandName} 管理画面デモ
        </div>
      </header>
      {children}
    </div>
  )
}
