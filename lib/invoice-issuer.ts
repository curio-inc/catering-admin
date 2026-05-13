/** 請求書に印字する自社情報（未設定時はプレースホルダ。`.env.local` で上書き） */

export type InvoiceIssuer = {
  companyName: string
  repName: string
  postalCode: string
  addressLines: string
  tel: string
  email: string
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
      "〇〇銀行 〇〇支店",
      "普通 0000000",
      "カ）SPAMSグッド",
    ].join("\n"),
  )

  return {
    companyName: env("INVOICE_ISSUER_COMPANY", "SPAMS GOOD"),
    repName: env("INVOICE_ISSUER_REP", ""),
    postalCode: env("INVOICE_ISSUER_POSTAL", "〒000-0000"),
    addressLines: env("INVOICE_ISSUER_ADDRESS", "東京都〇〇区〇〇 〇〇ビル"),
    tel: env("INVOICE_ISSUER_TEL", "03-5772-5273"),
    email: env("INVOICE_ISSUER_EMAIL", "yamada@kai-juban.com"),
    bankLines: bankRaw,
    paymentDueDays: Math.max(1, Number.parseInt(env("INVOICE_PAYMENT_DUE_DAYS", "30"), 10) || 30),
    transferFeeNote: env(
      "INVOICE_TRANSFER_FEE_NOTE",
      "恐れ入りますが、振込手数料は貴社にてご負担願います。",
    ),
  }
}
