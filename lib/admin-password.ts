/** 管理画面ログイン用パスワード（`.env.local` の `ADMIN_PASSWORD` で上書き可） */
export function getAdminPassword(): string {
  const fromEnv = process.env.ADMIN_PASSWORD?.trim()
  return fromEnv || "20260605"
}
