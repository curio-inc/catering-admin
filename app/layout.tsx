import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "注文管理 | SPAMS GOOD",
  description: "SPAMS GOOD ケータリング注文の管理画面",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
