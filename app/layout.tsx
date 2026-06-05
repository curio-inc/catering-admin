import type { Metadata } from "next"
import { Noto_Sans_JP } from "next/font/google"
import { getAppBrand } from "@/lib/app-brand"
import "./globals.css"

const brand = getAppBrand()

const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto",
})

export const metadata: Metadata = {
  title: `管理画面デモ | ${brand.displayName}`,
  description: `${brand.displayName} 注文管理画面デモ`,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={notoSans.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${notoSans.className} min-h-screen`}>{children}</body>
    </html>
  )
}
