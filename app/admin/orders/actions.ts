"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { chromium, type Browser } from "playwright"
import { Resend } from "resend"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function markOrderOpened(orderId: string): Promise<void> {
  const sb = getSupabaseAdmin()
  if (!sb || !orderId) return

  const { error } = await sb.from("orders").update({ admin_opened_at: new Date().toISOString() }).eq("id", orderId)
  if (error) return

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
}

export async function issueInvoiceAction(formData: FormData): Promise<void> {
  const orderId = String(formData.get("orderId") ?? "").trim()
  const sb = getSupabaseAdmin()
  if (!sb || !orderId) return

  const { data: o, error: selErr } = await sb
    .from("orders")
    .select("id, payment_method, invoice_issued_at")
    .eq("id", orderId)
    .maybeSingle()

  if (selErr || !o) return
  const row = o as { payment_method: string; invoice_issued_at: string | null }
  if (row.payment_method !== "invoice") return

  if (!row.invoice_issued_at) {
    const { error } = await sb.from("orders").update({ invoice_issued_at: new Date().toISOString() }).eq("id", orderId)
    if (error) return
  }

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
  redirect(`/admin/orders/${orderId}/invoice-print`)
}

export type SendInvoiceState = { ok: boolean; message: string } | null

export async function sendInvoiceAction(prevState: SendInvoiceState, formData: FormData): Promise<SendInvoiceState> {
  const orderId = String(formData.get("orderId") ?? "").trim()
  const sb = getSupabaseAdmin()
  if (!sb || !orderId) return { ok: false, message: "注文IDが不正です。" }

  const { data: o, error: selErr } = await sb
    .from("orders")
    .select(
      "id, order_number, payment_method, invoice_issued_at, invoice_sent_at, customer_email, customer_name",
    )
    .eq("id", orderId)
    .maybeSingle()

  if (selErr || !o) return { ok: false, message: "注文が見つかりません。" }
  const order = o as {
    order_number: string | null
    payment_method: string
    invoice_issued_at: string | null
    invoice_sent_at: string | null
    customer_email: string
    customer_name: string
  }

  if (order.payment_method !== "invoice") return { ok: false, message: "請求書払いの注文ではありません。" }
  if (!order.invoice_issued_at) return { ok: false, message: "先に請求書を発行してください。" }

  const now = new Date().toISOString()
  const { error: upErr } = await sb.from("orders").update({ invoice_sent_at: now }).eq("id", orderId)
  if (upErr) return { ok: false, message: upErr.message }

  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.RESEND_FROM?.trim() || "order@spams-good.com"
  const to = order.customer_email?.trim()
  if (apiKey && to) {
    const resend = new Resend(apiKey)
    const html = `
      <!DOCTYPE html>
      <html lang="ja"><head><meta charset="UTF-8" /></head>
      <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <p>${order.customer_name}様</p>
        <p>お世話になっております。</p>
        <p>請求書を送付いたしますのでご査収のほどよろしくお願いいたします。</p>
        <br />
        <p>※本メールは自動送信です。</p>
        <p>※ご不明な点がございましたらご連絡ください。</p>
        <br />
        <p>SPAMS GOOD</p>
        <p>yamada@kai-juban.com</p>
      </body></html>
    `
    try {
      const pdfBytes = await renderInvoicePdf(orderId)
      await resend.emails.send({
        from,
        to,
        subject: "【SPAMS GOOD】請求書の送付について",
        html,
        attachments: [
          {
            filename: buildInvoicePdfFilename(order.order_number, orderId),
            content: Buffer.from(pdfBytes).toString("base64"),
          },
        ],
      })
    } catch (e) {
      console.error("[sendInvoice] Resend failed:", e)
      await sb.from("orders").update({ invoice_sent_at: null }).eq("id", orderId)
      revalidatePath("/admin/orders")
      revalidatePath(`/admin/orders/${orderId}`)
      return { ok: false, message: "メール送信またはPDF生成に失敗しました。RESEND_API_KEY / 送信元ドメイン / 実行環境を確認してください。" }
    }
  }

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
  return { ok: true, message: "送信しました。" }
}

const ORDER_STATUSES = ["requested", "confirmed", "preparing", "delivered", "cancelled"] as const

export async function updateOrderStatusAction(formData: FormData): Promise<void> {
  const orderId = String(formData.get("orderId") ?? "").trim()
  const status = String(formData.get("status") ?? "").trim()
  const sb = getSupabaseAdmin()
  if (!sb || !orderId || !status) return
  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) return

  const { error } = await sb.from("orders").update({ status }).eq("id", orderId)
  if (error) return

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
}

function getRequestBaseUrl(): string {
  const h = headers()
  const host = h.get("x-forwarded-host") ?? h.get("host")
  const proto = h.get("x-forwarded-proto") ?? "http"
  if (host) return `${proto}://${host}`
  return process.env.APP_BASE_URL?.trim() || "http://localhost:3340"
}

async function renderInvoicePdf(orderId: string): Promise<Uint8Array> {
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

async function launchPdfBrowser(): Promise<Browser> {
  try {
    // まず Playwright 管理の Chromium を試す
    return await chromium.launch({ headless: true })
  } catch (firstErr) {
    const first = firstErr instanceof Error ? firstErr.message : String(firstErr)
    try {
      // バイナリ未配置環境では、ローカルの Chrome を使って続行
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

function buildInvoicePdfFilename(orderNumber: string | null, orderId: string): string {
  const raw = orderNumber?.trim() || orderId.slice(0, 8)
  const safe = raw.replace(/[\\/:*?"<>|]/g, "_")
  return `【SPAMS GOOD】ご請求書_${safe}.pdf`
}
