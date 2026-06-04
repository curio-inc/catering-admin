"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { Resend } from "resend"
import { getAppBrand } from "@/lib/app-brand"
import { getInvoiceIssuer } from "@/lib/invoice-issuer"
import { buildInvoicePdfFilename, formatInvoicePdfError, renderInvoicePdf } from "@/lib/invoice-pdf"
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

  const brand = getAppBrand()
  const issuer = getInvoiceIssuer()
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = brand.resendFromFallback
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
        <p>${brand.displayName}</p>
        <p>${issuer.email}</p>
      </body></html>
    `
    let pdfBytes: Uint8Array
    try {
      pdfBytes = await renderInvoicePdf(orderId)
    } catch (e) {
      console.error("[sendInvoice] PDF generation failed:", e)
      await sb.from("orders").update({ invoice_sent_at: null }).eq("id", orderId)
      revalidatePath("/admin/orders")
      revalidatePath(`/admin/orders/${orderId}`)
      return { ok: false, message: formatInvoicePdfError(e) }
    }

    try {
      await resend.emails.send({
        from,
        to,
        subject: `【${brand.displayName}】請求書の送付について`,
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
      return {
        ok: false,
        message:
          "メール送信に失敗しました。RESEND_API_KEY・送信元ドメイン・宛先メールアドレスを確認してください。",
      }
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

