import Link from "next/link"
import { updateOrderStatusAction } from "@/app/admin/orders/actions"
import { LogoutButton } from "@/components/logout-button"
import { OrderStatusSelect } from "@/components/order-status-select"
import { SalesFilterBar } from "@/components/sales-filter-bar"
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
const statusOptions = Object.entries(statusJa).map(([key, label]) => ({ key, label }))

function invoiceProgress(row: { payment_method: string; invoice_issued_at?: string | null; invoice_sent_at?: string | null }) {
  if (row.payment_method !== "invoice") return "—"
  if (row.invoice_sent_at) return "送付済"
  if (row.invoice_issued_at) return `発行済 (${formatDateShort(row.invoice_issued_at)})`
  return "未発行"
}

type SearchParams = { from?: string; to?: string }

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const fromFilter = searchParams.from?.trim() ?? ""
  const toFilter = searchParams.to?.trim() ?? ""

  const res = await fetchOrdersList()
  const isEnvIssue =
    !res.ok && /NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY|SUPABASE_URL|SUPABASE_SECRET_KEY|未設定、または空/i.test(res.message)

  // キャンセル除外・期間フィルター後の行
  const activeRows = res.ok
    ? res.rows.filter((r) => {
        if (r.status === "cancelled") return false
        if (fromFilter && r.delivery_date && r.delivery_date < fromFilter) return false
        if (toFilter && r.delivery_date && r.delivery_date > toFilter) return false
        return true
      })
    : []

  const salesTotal = activeRows.reduce((sum, r) => sum + r.total_yen, 0)
  const salesCount = activeRows.length

  // 表示行は全件（キャンセルも含む）だが、期間フィルターは適用
  const displayRows = res.ok
    ? res.rows.filter((r) => {
        if (fromFilter && r.delivery_date && r.delivery_date < fromFilter) return false
        if (toFilter && r.delivery_date && r.delivery_date > toFilter) return false
        return true
      })
    : []

  const isFiltered = !!(fromFilter || toFilter)

  return (
    <div className="min-h-screen">
      <header className="border-b border-amber-200 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium opacity-90">SPAMS GOOD</p>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">注文管理</h1>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-8">
        {!res.ok ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-950">
            <p className="font-semibold">データを読み込めませんでした</p>
            <p className="mt-2 text-sm">{res.message}</p>
            {isEnvIssue ? (
              <p className="mt-4 text-sm text-stone-700">
                <code className="rounded bg-white px-1">.env.local</code> の
                <code className="mx-1 rounded bg-white px-1">NEXT_PUBLIC_SUPABASE_URL</code> と
                <code className="rounded bg-white px-1">SUPABASE_SERVICE_ROLE_KEY</code> を確認し、保存後に
                <code className="mx-1 rounded bg-white px-1">npm run dev:clean</code> で再起動してください。
              </p>
            ) : (
              <p className="mt-4 text-sm text-stone-700">
                一時的な通信失敗の可能性があります。<code className="rounded bg-white px-1">npm run dev:clean</code> で再起動し、
                VPN・プロキシ・ネットワーク設定を確認してください。
              </p>
            )}
          </div>
        ) : (
          <>
            {/* 期間フィルター */}
            <SalesFilterBar from={fromFilter} to={toFilter} />

            {/* 売上サマリー */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[180px] rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4">
                <p className="text-xs font-medium text-emerald-700">
                  売上合計{isFiltered ? "（絞り込み期間）" : "（全期間）"}
                  <span className="ml-1 text-stone-500">キャンセル除く</span>
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-900">{yen(salesTotal)}</p>
                <p className="mt-0.5 text-xs text-emerald-700">{salesCount} 件</p>
              </div>
            </div>

            {/* 注文テーブル */}
            {displayRows.length === 0 ? (
              <p className="rounded-lg border border-stone-200 bg-white p-8 text-center text-stone-600">
                {isFiltered ? "この期間に該当する注文はありません。" : "まだ注文がありません。"}
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
                    {displayRows.map((row) => (
                      <tr key={row.id} className={`hover:bg-sg-sand/50 ${row.status === "cancelled" ? "opacity-50" : ""}`}>
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
                        <td className="whitespace-nowrap px-3 py-3">
                          <OrderStatusSelect
                            orderId={row.id}
                            currentStatus={row.status}
                            options={statusOptions}
                            action={updateOrderStatusAction}
                          />
                        </td>
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
          </>
        )}
      </main>
    </div>
  )
}
