import { getAppBrand } from "@/lib/app-brand"

/** 請求書に印字する自社情報（未設定時はデモ用プレースホルダ。`.env.local` で上書き） */

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
  const brand = getAppBrand()
  const bankRaw = env(
    "INVOICE_BANK_LINES",
    [
      "サンプル銀行　本店営業部",
      "口座種別　普通預金",
      "口座番号　1234567",
      "カ）サンプル",
    ].join("\n"),
  ).replace(/\\n/g, "\n")

  return {
    companyName: brand.legalCompanyName,
    repName: env("INVOICE_ISSUER_REP", "山田 太郎"),
    postalCode: env("INVOICE_ISSUER_POSTAL", "〒100-0001"),
    addressLines: env("INVOICE_ISSUER_ADDRESS", "東京都千代田区丸の内1-1-1\nサンプルビル3階").replace(/\\n/g, "\n"),
    tel: env("INVOICE_ISSUER_TEL", "03-0000-0000"),
    email: brand.contactEmail,
    registrationNumber: env("INVOICE_ISSUER_REGISTRATION_NUMBER", "T0000000000001"),
    bankLines: bankRaw,
    paymentDueDays: Math.max(1, Number.parseInt(env("INVOICE_PAYMENT_DUE_DAYS", "30"), 10) || 30),
    transferFeeNote: env(
      "INVOICE_TRANSFER_FEE_NOTE",
      "恐れ入りますが振込手数料は貴社にてご負担でお願い致します。\nご注文ありがとうございました。どうぞよろしくお願い致します。",
    ).replace(/\\n/g, "\n"),
  }
}
