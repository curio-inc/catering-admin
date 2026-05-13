import { createClient, type SupabaseClient } from "@supabase/supabase-js"

function envUrl(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "").trim()
}

function envServiceKey(): string {
  return (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? "").trim()
}

/** 接続できないとき、どの変数が足りないか（サーバーログ用・UI メッセージ用） */
export function describeSupabaseEnvGap(): string | null {
  const url = envUrl()
  const key = envServiceKey()
  if (url && key) return null
  if (!url && !key) {
    return "NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY の両方が未設定、または空です。"
  }
  if (!url) {
    return "NEXT_PUBLIC_SUPABASE_URL（または SUPABASE_URL）が未設定、または空です。"
  }
  return "SUPABASE_SERVICE_ROLE_KEY（または SUPABASE_SECRET_KEY）が未設定、または空です。.env.local を保存し、キーは「=」の右側に改行なしで1行で貼り付けてください。"
}

/**
 * サーバー専用。service role で RLS をバイパス（注文フォームの API と同じ前提）。
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = envUrl()
  const key = envServiceKey()
  if (!url || !key) {
    return null
  }
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
