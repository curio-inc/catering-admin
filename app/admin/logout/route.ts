import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getIronSession } from "iron-session"
import { sessionOptions, type SessionData } from "@/lib/session"

export async function POST() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions)
  session.destroy()
  return NextResponse.redirect(new URL("/admin/orders", process.env.APP_BASE_URL || "http://localhost:3000"), { status: 303 })
}
