import { headers } from "next/headers"
import { chromium, type Browser } from "playwright"
import { getAppBrand } from "@/lib/app-brand"

export class InvoicePdfError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InvoicePdfError"
  }
}

/** Vercel / Lambda など Chromium 起動が困難な実行環境 */
export function isServerlessPdfEnvironment(): boolean {
  return process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null
}

export function formatInvoicePdfError(error: unknown): string {
  if (error instanceof InvoicePdfError) return error.message

  const detail = error instanceof Error ? error.message : String(error)

  if (isServerlessPdfEnvironment()) {
    return (
      "請求書PDFの自動生成に失敗しました。" +
      "本機能は Playwright（Chromium）に依存しており、Vercel などのサーバーレス環境では Chromium を起動できないため、メール送付時のPDF添付が動作しない場合があります。" +
      "「PDF発行」画面からブラウザの印刷機能でPDFを保存し、手動で送付してください。"
    )
  }

  if (detail.includes("PDF生成ブラウザ")) {
    return (
      "請求書PDFの生成に失敗しました。Chromium が未インストールの可能性があります。" +
      " ローカルで `npx playwright install chromium` を実行してください。"
    )
  }

  return `請求書PDFの生成に失敗しました。${detail.slice(0, 240)}`
}

function getRequestBaseUrl(): string {
  const h = headers()
  const host = h.get("x-forwarded-host") ?? h.get("host")
  const proto = h.get("x-forwarded-proto") ?? "http"
  if (host) return `${proto}://${host}`
  return process.env.APP_BASE_URL?.trim() || "http://localhost:3340"
}

async function launchPdfBrowser(): Promise<Browser> {
  if (isServerlessPdfEnvironment()) {
    throw new InvoicePdfError(formatInvoicePdfError(new Error("serverless")))
  }

  try {
    return await chromium.launch({ headless: true })
  } catch (firstErr) {
    const first = firstErr instanceof Error ? firstErr.message : String(firstErr)
    try {
      return await chromium.launch({ channel: "chrome", headless: true })
    } catch (secondErr) {
      const second = secondErr instanceof Error ? secondErr.message : String(secondErr)
      throw new Error(
        `PDF生成ブラウザの起動に失敗しました。Chromium未配置またはChrome未インストールの可能性があります。` +
          `\n- 1st: ${first}\n- 2nd: ${second}\n` +
          "対処: `npx playwright install chromium` を実行してください。",
      )
    }
  }
}

export async function renderInvoicePdf(orderId: string): Promise<Uint8Array> {
  const baseUrl = getRequestBaseUrl()
  const url = `${baseUrl}/admin/orders/${orderId}/invoice-print`
  const browser = await launchPdfBrowser()
  try {
    const context = await browser.newContext({ locale: "ja-JP" })
    const page = await context.newPage()
    await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 })
    await page.emulateMedia({ media: "print" })
    return await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    })
  } finally {
    await browser.close()
  }
}

export function buildInvoicePdfFilename(orderNumber: string | null, orderId: string): string {
  const raw = orderNumber?.trim() || orderId.slice(0, 8)
  const safe = raw.replace(/[\\/:*?"<>|]/g, "_")
  const { displayName } = getAppBrand()
  return `【${displayName}】ご請求書_${safe}.pdf`
}
