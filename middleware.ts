import { getIronSession } from "iron-session"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { sessionOptions, type SessionData } from "@/lib/session"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/admin/logout")) {
    return NextResponse.next()
  }

  if (pathname === "/admin/login") {
    const response = NextResponse.next()
    const session = await getIronSession<SessionData>(request, response, sessionOptions)
    if (session.isLoggedIn) {
      return NextResponse.redirect(new URL("/admin/orders", request.url))
    }
    return response
  }

  const response = NextResponse.next()
  const session = await getIronSession<SessionData>(request, response, sessionOptions)
  if (!session.isLoggedIn) {
    const loginUrl = new URL("/admin/login", request.url)
    if (pathname !== "/admin") loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ["/admin/:path*"],
}
