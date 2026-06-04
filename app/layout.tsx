import type { Metadata } from "next"
import { M_PLUS_Rounded_1c, Noto_Sans_JP } from "next/font/google"
import { getAppBrand } from "@/lib/app-brand"
import { isDemoMode } from "@/lib/demo-mode"
import "./globals.css"

const brand = getAppBrand()
const demo = isDemoMode()

const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto",
})
const mPlusRounded = M_PLUS_Rounded_1c({
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
  variable: "--font-rounded",
})

export const metadata: Metadata = {
  title: demo ? `管理画面デモ | ${brand.displayName}` : `注文管理 | ${brand.displayName}`,
  description: `${brand.displayName} 注文管理画面`,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${notoSans.variable} ${mPlusRounded.variable}`}>
      <body className={`${notoSans.className} min-h-screen`}>{children}</body>
    </html>
  )
}
