import Link from "next/link"
import { fetchOrdersList } from "@/lib/orders"
import { formatPaymentMethod } from "@/lib/payment-labels"

export const dynamic = "force-dynamic"

function yen(n: number) {
  return `¥${Number(n).toLocaleString("ja-JP")}`
}

function formatDateShort(iso: string | null | undefined) {
  if (!iso) return "—"
  try {
    return new Intl.DateTimeFormat("ja-JP", { dateStyle: "short", timeZone: "Asia/Tokyo" }).format(new Date(iso))
  } catch {
    return "—"
  }
}

function formatDeliveryDate(row: { delivery_date: string | null; delivery_time: string | null }) {
  if (!row.delivery_date?.trim()) return "—"
  const d = row.delivery_date.trim()
  const t = row.delivery_time?.trim()
  return t ? `${d} ${t}` : d
}

const statusJa: Record<string, string> = {
  requested: "受付",
  confirmed: "確定",
  preparing: "準備中",
  delivered: "完了",
  cancelled: "キャンセル",
}

function invoiceProgress(row: { payment_method: string; invoice_issued_at?: string | null; invoice_sent_at?: string | null }) {
  if (row.payment_method !== "invoice") return "—"
  if (row.invoice_sent_at) return `送付済 (${formatDateShort(row.invoice_sent_at)})`
  if (row.invoice_issued_at) return `発行済 (${formatDateShort(row.invoice_issued_at)})`
  return "未発行"
}

export default async function AdminOrdersPage() {
  const res = await fetchOrdersList()

  return (
    <div className="min-h-screen">
      <header className="border-b border-amber-200 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium opacity-90">SPAMS GOOD</p>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">注文管理</h1>
          </div>
          <p className="text-sm opacity-90">Supabase の orders を表示（本番は認証を追加してください）</p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {!res.ok ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-950">
            <p className="font-semibold">データを読み込めませんでした</p>
            <p className="mt-2 text-sm">{res.message}</p>
            <p className="mt-4 text-sm text-stone-700">
              プロジェクト直下の <code className="rounded bg-white px-1">.env.local</code> に{" "}
              <code className="rounded bg-white px-1">NEXT_PUBLIC_SUPABASE_URL</code> と{" "}
              <code className="rounded bg-white px-1">SUPABASE_SERVICE_ROLE_KEY</code> を設定し、
              <strong className="font-semibold">保存（⌘S）</strong>したうえで <code className="rounded bg-white px-1">npm run dev</code> を
              再起動してください。キーは <code className="rounded bg-white px-1">=</code> の直後に改行せず1行で貼り付けます。
            </p>
          </div>
        ) : res.rows.length === 0 ? (
          <p className="rounded-lg border border-stone-200 bg-white p-8 text-center text-stone-600">
            まだ注文がありません。注文フォームから送信するとここに表示されます。
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-100 text-stone-600">
                  <th className="whitespace-nowrap px-3 py-3 font-semibold">確認</th>
                  <th className="whitespace-nowrap px-3 py-3 font-semibold">配達日</th>
                  <th className="whitespace-nowrap px-3 py-3 font-semibold">お客様</th>
                  <th className="whitespace-nowrap px-3 py-3 font-semibold">連絡先</th>
                  <th className="whitespace-nowrap px-3 py-3 font-semibold">ステータス</th>
                  <th className="whitespace-nowrap px-3 py-3 font-semibold">支払い方法</th>
                  <th className="whitespace-nowrap px-3 py-3 font-semibold">請求書</th>
                  <th className="whitespace-nowrap px-3 py-3 text-right font-semibold">合計</th>
                  <th className="whitespace-nowrap px-3 py-3 font-semibold">詳細</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {res.rows.map((row) => (
                  <tr key={row.id} className="hover:bg-sg-sand/50">
                    <td className="whitespace-nowrap px-3 py-3">
                      {!row.admin_opened_at ? (
                        <span className="inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800">
                          未確認
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">確認済</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-stone-600">{formatDeliveryDate(row)}</td>
                    <td className="max-w-[140px] truncate px-3 py-3 font-medium" title={row.customer_name}>
                      {row.customer_name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-stone-700">{row.customer_phone}</td>
                    <td className="whitespace-nowrap px-3 py-3">{statusJa[row.status] ?? row.status}</td>
                    <td className="max-w-[160px] truncate px-3 py-3" title={formatPaymentMethod(row.payment_method, row.payment_method_label)}>
                      {formatPaymentMethod(row.payment_method, row.payment_method_label)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-stone-600">{invoiceProgress(row)}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-right font-medium tabular-nums">{yen(row.total_yen)}</td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <Link href={`/admin/orders/${row.id}`} className="font-medium text-sg-amber hover:underline">
                        開く
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
