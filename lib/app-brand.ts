/** 画面・メール・請求書の表示名（`.env.local` の `APP_BRAND_NAME` で上書き可） */

function env(name: string, fallback: string): string {
  const v = process.env[name]
  return typeof v === "string" && v.trim() !== "" ? v.trim() : fallback
}

export type AppBrand = {
  /** ヘッダー・タイトル用の短い名称 */
  displayName: string
  /** 請求書の発行元法人名（`INVOICE_ISSUER_COMPANY` と連動） */
  legalCompanyName: string
  /** 注文番号の接頭辞（例: DM-202605-001） */
  orderNumberPrefix: string
  contactEmail: string
}

export function getAppBrand(): AppBrand {
  const legalCompanyName = env("INVOICE_ISSUER_COMPANY", "株式会社サンプル")
  return {
    displayName: env("APP_BRAND_NAME", "サンプル"),
    legalCompanyName,
    orderNumberPrefix: env("ORDER_NUMBER_PREFIX", "DM-"),
    contactEmail: env("INVOICE_ISSUER_EMAIL", "demo@example.com"),
  }
}
