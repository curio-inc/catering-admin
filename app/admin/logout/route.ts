import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getIronSession } from "iron-session"
import { sessionOptions, type SessionData } from "@/lib/session"

export async function POST(request: Request) {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions)
  session.destroy()
  return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 })
}
