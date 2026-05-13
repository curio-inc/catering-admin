import { NextResponse, type NextRequest } from "next/server"
import { unsealData } from "iron-session"
import { sessionOptions, type SessionData } from "@/lib/session"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // /admin/login と /admin/logout は認証不要
  if (pathname.startsWith("/admin/login") || pathname.startsWith("/admin/logout")) {
    return NextResponse.next()
  }

  const cookieValue = request.cookies.get(sessionOptions.cookieName)?.value

  if (cookieValue) {
    try {
      const session = await unsealData<SessionData>(cookieValue, {
        password: sessionOptions.password as string,
        ttl: sessionOptions.ttl,
      })
      if (session.isLoggedIn) {
        return NextResponse.next()
      }
    } catch {
      // 不正・期限切れクッキーは無視してリダイレクト
    }
  }

  const loginUrl = new URL("/admin/login", request.url)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/admin/:path*"],
}
