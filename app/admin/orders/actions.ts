"use server"

import { revalidatePath } from "next/cache"
import { Resend } from "resend"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { formatPaymentMethod } from "@/lib/payment-labels"

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
  if (row.invoice_issued_at) return

  const { error } = await sb.from("orders").update({ invoice_issued_at: new Date().toISOString() }).eq("id", orderId)
  if (error) return

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
}

export async function sendInvoiceAction(formData: FormData): Promise<void> {
  const orderId = String(formData.get("orderId") ?? "").trim()
  const sb = getSupabaseAdmin()
  if (!sb || !orderId) return

  const { data: o, error: selErr } = await sb
    .from("orders")
    .select(
      "id, payment_method, invoice_issued_at, invoice_sent_at, customer_email, customer_name, invoice_company_name, invoice_billing_address, total_yen, payment_method_label",
    )
    .eq("id", orderId)
    .maybeSingle()

  if (selErr || !o) return
  const order = o as {
    payment_method: string
    invoice_issued_at: string | null
    invoice_sent_at: string | null
    customer_email: string
    customer_name: string
    invoice_company_name: string | null
    invoice_billing_address: string | null
    total_yen: number
    payment_method_label: string | null
  }

  if (order.payment_method !== "invoice") return
  if (!order.invoice_issued_at) return
  if (order.invoice_sent_at) return

  const now = new Date().toISOString()
  const { error: upErr } = await sb.from("orders").update({ invoice_sent_at: now }).eq("id", orderId)
  if (upErr) return

  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.RESEND_FROM?.trim() || "order@spams-good.com"
  const to = order.customer_email?.trim()
  if (apiKey && to) {
    const resend = new Resend(apiKey)
    const payLabel = formatPaymentMethod("invoice", order.payment_method_label)
    const html = `
      <!DOCTYPE html>
      <html lang="ja"><head><meta charset="UTF-8" /></head>
      <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <p>${order.customer_name} 様</p>
        <p>平素よりSPAMS GOODをご利用いただきありがとうございます。</p>
        <p>ご注文に関する<strong>請求書</strong>を送付いたしました（${payLabel}）。</p>
        <p>合計金額（税込相当）: <strong>¥${Number(order.total_yen).toLocaleString("ja-JP")}</strong></p>
        ${
          order.invoice_company_name
            ? `<p>宛名: ${order.invoice_company_name}</p>`
            : ""
        }
        ${
          order.invoice_billing_address
            ? `<p>請求先住所:<br/>${order.invoice_billing_address.replace(/\n/g, "<br/>")}</p>`
            : ""
        }
      </body></html>
    `
    try {
      await resend.emails.send({
        from,
        to,
        subject: "【SPAMS GOOD】請求書の送付について",
        html,
      })
    } catch (e) {
      console.error("[sendInvoice] Resend failed:", e)
      await sb.from("orders").update({ invoice_sent_at: null }).eq("id", orderId)
      revalidatePath("/admin/orders")
      revalidatePath(`/admin/orders/${orderId}`)
      throw new Error("メール送信に失敗しました。RESEND_API_KEY または送信元ドメインを確認してください。")
    }
  }

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
}
