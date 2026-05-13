import type { SessionOptions } from "iron-session"

export type SessionData = {
  isLoggedIn: boolean
}

export const sessionOptions: SessionOptions = {
  cookieName: "catering-admin-session",
  password: process.env.SESSION_SECRET ?? "fallback-dev-secret-change-in-production-!!",
  ttl: 60 * 60 * 8, // 8時間
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
}
