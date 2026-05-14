/** 請求書に印字する自社情報（未設定時はプレースホルダ。`.env.local` で上書き） */

export type InvoiceIssuer = {
  companyName: string
  repName: string
  postalCode: string
  addressLines: string
  tel: string
  email: string
  /** 適格請求書発行事業者登録番号（T + 13桁）*/
  registrationNumber: string
  /** 振込先など複数行（改行区切り） */
  bankLines: string
  /** 振込期日までの日数（請求日基準） */
  paymentDueDays: number
  /** 備考欄の定型文（振込手数料など） */
  transferFeeNote: string
}

function env(name: string, fallback: string): string {
  const v = process.env[name]
  return typeof v === "string" && v.trim() !== "" ? v.trim() : fallback
}

export function getInvoiceIssuer(): InvoiceIssuer {
  const bankRaw = env(
    "INVOICE_BANK_LINES",
    [
      "城南信用金庫　営業部本店",
      "口座種別　普通預金",
      "口座番号　868006",
      "カブシキカイシャ　スパムズグッド",
    ].join("\n"),
  ).replace(/\\n/g, "\n")

  return {
    companyName: env("INVOICE_ISSUER_COMPANY", "株式会社 SPAMS GOOD"),
    repName: env("INVOICE_ISSUER_REP", ""),
    postalCode: env("INVOICE_ISSUER_POSTAL", "〒106-0032"),
    addressLines: env("INVOICE_ISSUER_ADDRESS", "東京都港区六本木5-11-32\n第三岩崎ビル4階").replace(/\\n/g, "\n"),
    tel: env("INVOICE_ISSUER_TEL", "03-5772-5273"),
    email: env("INVOICE_ISSUER_EMAIL", "yamada@kai-juban.com"),
    registrationNumber: env("INVOICE_ISSUER_REGISTRATION_NUMBER", "T6010401154826"),
    bankLines: bankRaw,
    paymentDueDays: Math.max(1, Number.parseInt(env("INVOICE_PAYMENT_DUE_DAYS", "30"), 10) || 30),
    transferFeeNote: env(
      "INVOICE_TRANSFER_FEE_NOTE",
      "恐れ入りますが振込手数料は貴社にてご負担でお願い致します。\nご注文ありがとうございました。どうぞよろしくお願い致します。",
    ).replace(/\\n/g, "\n"),
  }
}
