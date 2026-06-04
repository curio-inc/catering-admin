"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { InvoiceFormalDocument } from "@/components/invoice-formal-document"
import { DemoOrderStatusSelect } from "@/components/demo/demo-order-status-select"
import { DemoPageShell } from "@/components/demo/demo-page-shell"
import { DemoOrdersCalendar } from "@/components/demo/demo-orders-calendar"
import { DemoSettingsPanel } from "@/components/demo/demo-settings-panel"
import type { DemoOrderView, DemoUiStatus } from "@/lib/build-demo-view-model"
import { filterOrdersByDeliveryMonth, sortDemoOrders } from "@/lib/build-demo-view-model"
import { isDemoInvoiceSent, markDemoInvoiceSent, readDemoInvoiceSent } from "@/lib/demo-invoice-sent"
import { applyDemoStatuses, writeDemoOrderStatus } from "@/lib/demo-order-status"
import {
  buildInvoicePdfDownloadName,
  downloadInvoicePdfFromElement,
} from "@/lib/download-invoice-pdf-browser"
import "./demo.css"

type AdminDemoAppProps = {
  brandName: string
  backUrl?: string
  initialOrders: DemoOrderView[]
  initialSelectedId?: string
  initialPanel?: "orders" | "orders-calendar" | "invoices" | "settings"
}

type DemoPanel = "orders" | "orders-calendar" | "invoices" | "settings"

function yen(n: number) {
  return `¥${n.toLocaleString("ja-JP")}`
}

function monthValue(y: number, m: number) {
  return `${y}-${m < 10 ? "0" : ""}${m}`
}

function parseMonthInput(v: string): { y: number; m: number } | null {
  const p = /^(\d{4})-(\d{2})$/.exec(v)
  if (!p) return null
  return { y: Number(p[1]), m: Number(p[2]) }
}

function currentYmInTokyo() {
  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "numeric",
  }).formatToParts(new Date())
  const y = Number(parts.find((p) => p.type === "year")?.value)
  const m = Number(parts.find((p) => p.type === "month")?.value)
  return { y, m }
}

export function AdminDemoApp({
  brandName,
  backUrl,
  initialOrders,
  initialSelectedId,
  initialPanel = "orders",
}: AdminDemoAppProps) {
  const router = useRouter()
  const now = currentYmInTokyo()
  const [orders, setOrders] = useState(initialOrders)
  const [panel, setPanel] = useState<DemoPanel>(initialPanel)
  const [sortMode, setSortMode] = useState<"recent" | "delivery">("recent")
  const [salesY, setSalesY] = useState(now.y)
  const [salesM, setSalesM] = useState(now.m)
  const [calY, setCalY] = useState(now.y)
  const [calM, setCalM] = useState(now.m)
  const [invoicePreviewId, setInvoicePreviewId] = useState<string | null>(null)
  const [pdfRenderOrder, setPdfRenderOrder] = useState<DemoOrderView | null>(null)
  const [pdfBusyId, setPdfBusyId] = useState<string | null>(null)
  const [toast, setToast] = useState("")
  const [invoiceSentIds, setInvoiceSentIds] = useState<Record<string, true>>({})
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pdfSourceRef = useRef<HTMLDivElement>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(""), 2800)
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  const refreshOrders = useCallback(() => {
    setOrders(applyDemoStatuses(initialOrders))
  }, [initialOrders])

  useEffect(() => {
    refreshOrders()
    setInvoiceSentIds(readDemoInvoiceSent())
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        refreshOrders()
        setInvoiceSentIds(readDemoInvoiceSent())
      }
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [refreshOrders])

  useEffect(() => {
    if (initialPanel === "invoices" && initialSelectedId) {
      setInvoicePreviewId(initialSelectedId)
    }
  }, [initialPanel, initialSelectedId])

  const ordersInSalesMonth = useMemo(
    () => filterOrdersByDeliveryMonth(orders, salesY, salesM),
    [orders, salesY, salesM],
  )

  const sorted = useMemo(() => sortDemoOrders(ordersInSalesMonth, sortMode), [ordersInSalesMonth, sortMode])

  const monthTotal = useMemo(() => {
    return ordersInSalesMonth.reduce((acc, o) => {
      if (o.uiStatus === "cancelled") return acc
      return acc + o.totalYen
    }, 0)
  }, [ordersInSalesMonth])

  const invoiceOrders = useMemo(() => orders.filter((o) => o.isInvoicePay), [orders])

  const previewOrder = invoicePreviewId ? orders.find((o) => o.id === invoicePreviewId) : null

  async function waitForPaint() {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })
  }

  async function handleInvoicePdfDownload(o: DemoOrderView) {
    if (pdfBusyId) return
    setPdfBusyId(o.id)
    setPdfRenderOrder(o)
    try {
      await waitForPaint()
      const el = pdfSourceRef.current?.firstElementChild as HTMLElement | null
      if (!el) throw new Error("invoice source missing")
      const filename = buildInvoicePdfDownloadName(brandName, o.orderNumber, o.id)
      await downloadInvoicePdfFromElement(el, filename)
      showToast("PDFをダウンロードしました")
    } catch {
      showToast("PDFの作成に失敗しました")
    } finally {
      setPdfBusyId(null)
      setPdfRenderOrder(null)
    }
  }

  function openOrder(id: string) {
    router.push(`/admin/orders/${id}`)
  }

  function updateOrderStatus(orderId: string, ui: DemoUiStatus) {
    writeDemoOrderStatus(orderId, ui)
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, uiStatus: ui } : o)))
  }

  function invoiceIsSent(o: DemoOrderView): boolean {
    return !!invoiceSentIds[o.id] || isDemoInvoiceSent(o.id, o.order.invoice_sent_at ?? null)
  }

  function handleInvoiceAutoSend(o: DemoOrderView) {
    if (invoiceIsSent(o)) return
    markDemoInvoiceSent(o.id)
    setInvoiceSentIds((prev) => ({ ...prev, [o.id]: true }))
    showToast(`請求書を ${o.form.email} へ送信しました`)
  }

  function goThisMonth() {
    const c = currentYmInTokyo()
    setSalesY(c.y)
    setSalesM(c.m)
  }

  function goPrevMonth() {
    let y = salesY
    let m = salesM - 1
    if (m < 1) {
      m = 12
      y -= 1
    }
    setSalesY(y)
    setSalesM(m)
  }

  return (
    <DemoPageShell brandName={brandName} backUrl={backUrl}>
      <div className="demo-app">
        <aside className="demo-sidebar" aria-label="管理メニュー">
          <div className="demo-sidebar-label">Menu</div>
          <button
            type="button"
            className={`demo-nav-btn${panel === "orders" ? " is-active" : ""}`}
            aria-current={panel === "orders" ? "page" : undefined}
            onClick={() => setPanel("orders")}
          >
            注文管理
          </button>
          <button
            type="button"
            className={`demo-nav-btn${panel === "orders-calendar" ? " is-active" : ""}`}
            aria-current={panel === "orders-calendar" ? "page" : undefined}
            onClick={() => setPanel("orders-calendar")}
          >
            注文管理（カレンダー）
          </button>
          <button
            type="button"
            className={`demo-nav-btn${panel === "invoices" ? " is-active" : ""}`}
            onClick={() => {
              setPanel("invoices")
              setInvoicePreviewId(null)
            }}
          >
            請求書発行
          </button>
          <button
            type="button"
            className={`demo-nav-btn${panel === "settings" ? " is-active" : ""}`}
            onClick={() => setPanel("settings")}
          >
            設定
          </button>
          <Link href="/order" className="demo-nav-btn demo-nav-link">
            注文ページ
          </Link>
        </aside>

        <main className="demo-main">
          <section
            id="panel-orders"
            className={`demo-panel${panel === "orders" ? " is-active" : ""}`}
            aria-labelledby="orders-heading"
          >
            <h1 id="orders-heading" className="demo-panel-title">
              注文管理
            </h1>

            <div className="admin-workspace">
              <div className="month-sales-card" aria-live="polite">
                <p className="month-sales-label">
                  {salesY}年{salesM}月の売上合計
                </p>
                <p className="month-sales-total">{yen(monthTotal)}</p>
                <div className="month-sales-controls">
                  <label htmlFor="sales-month-input" className="sr-only">
                    売上を集計する年月
                  </label>
                  <input
                    id="sales-month-input"
                    type="month"
                    value={monthValue(salesY, salesM)}
                    onChange={(e) => {
                      const p = parseMonthInput(e.target.value)
                      if (p) {
                        setSalesY(p.y)
                        setSalesM(p.m)
                      }
                    }}
                  />
                  <button type="button" className="btn btn-compact btn-primary" onClick={goThisMonth}>
                    今月
                  </button>
                  <button type="button" className="btn btn-compact" onClick={goPrevMonth}>
                    先月
                  </button>
                </div>
              </div>

              <div className="order-section order-section--list">
                <h2 className="order-section-title">
                  注文一覧（{salesY}年{salesM}月のお届け予定）
                </h2>
                <div className="order-sort-bar" role="group" aria-label="一覧の並び替え">
                  <span className="order-sort-label">並び替え</span>
                  <button
                    type="button"
                    className={`btn btn-compact${sortMode === "recent" ? " btn-primary" : ""}`}
                    aria-pressed={sortMode === "recent"}
                    onClick={() => setSortMode("recent")}
                  >
                    新着順
                  </button>
                  <button
                    type="button"
                    className={`btn btn-compact${sortMode === "delivery" ? " btn-primary" : ""}`}
                    aria-pressed={sortMode === "delivery"}
                    onClick={() => setSortMode("delivery")}
                  >
                    お届け日順
                  </button>
                </div>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>受付</th>
                        <th>顧客</th>
                        <th>お届け日時</th>
                        <th>金額</th>
                        <th>状態</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ color: "var(--muted)" }}>
                            {salesY}年{salesM}月のお届け予定の注文はありません。
                          </td>
                        </tr>
                      ) : (
                        sorted.map((o) => (
                          <tr key={o.id}>
                            <td>
                              {o.receivedLabel}
                              <br />
                              <small style={{ color: "var(--muted)" }}>{o.orderNumber}</small>
                            </td>
                            <td>{o.customerName}</td>
                            <td>{o.deliveryLabel}</td>
                            <td>{yen(o.totalYen)}</td>
                            <td>
                              <DemoOrderStatusSelect
                                showLabel={false}
                                value={o.uiStatus}
                                onChange={(ui) => updateOrderStatus(o.id, ui)}
                              />
                            </td>
                            <td className="demo-open-cell">
                              <Link href={`/admin/orders/${o.id}`} className="demo-open-link">
                                開く
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          <section
            id="panel-orders-calendar"
            className={`demo-panel${panel === "orders-calendar" ? " is-active" : ""}`}
            aria-labelledby="orders-calendar-heading"
          >
            <h1 id="orders-calendar-heading" className="demo-panel-title">
              注文管理（カレンダー）
            </h1>
            <DemoOrdersCalendar
              orders={orders}
              year={calY}
              month={calM}
              onMonthChange={(y, m) => {
                setCalY(y)
                setCalM(m)
              }}
              onOpenOrder={openOrder}
            />
          </section>

          <section
            id="panel-invoices"
            className={`demo-panel${panel === "invoices" ? " is-active" : ""}`}
            aria-labelledby="inv-heading"
          >
            <h1 id="inv-heading" className="demo-panel-title">
              請求書発行
            </h1>
            <div className="admin-workspace">
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>注文No.</th>
                      <th>顧客</th>
                      <th>お届け日時</th>
                      <th>金額（税込）</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ color: "var(--muted)" }}>
                          該当する注文はありません。
                        </td>
                      </tr>
                    ) : (
                      invoiceOrders.map((o) => (
                        <tr key={o.id}>
                          <td>
                            {o.orderNumber}
                            <br />
                            <small style={{ color: "var(--muted)" }}>{o.receivedLabel}</small>
                          </td>
                          <td>{o.customerName}</td>
                          <td>{o.deliveryLabel}</td>
                          <td>{yen(o.totalYen)}</td>
                          <td className="inv-cell-actions">
                            <button
                              type="button"
                              className="btn"
                              disabled={pdfBusyId === o.id}
                              onClick={() => void handleInvoicePdfDownload(o)}
                            >
                              {pdfBusyId === o.id ? "作成中…" : "PDF出力"}
                            </button>
                            {invoiceIsSent(o) ? (
                              <span className="inv-sent-badge">送信済み</span>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => handleInvoiceAutoSend(o)}
                              >
                                自動送信
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {previewOrder ? (
                <div className="invoice-preview-panel">
                  <div className="invoice-preview-inner">
                    <InvoiceFormalDocument order={previewOrder.order} items={previewOrder.items} />
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section
            id="panel-settings"
            className={`demo-panel${panel === "settings" ? " is-active" : ""}`}
            aria-labelledby="settings-heading"
          >
            <h1 id="settings-heading" className="demo-panel-title">
              設定
            </h1>
            <DemoSettingsPanel onSaved={() => showToast("設定を保存しました")} />
          </section>
        </main>
      </div>

      <div ref={pdfSourceRef} className="demo-invoice-pdf-source" aria-hidden>
        {pdfRenderOrder ? (
          <InvoiceFormalDocument order={pdfRenderOrder.order} items={pdfRenderOrder.items} />
        ) : null}
      </div>

      <div className={`demo-toast${toast ? " is-on" : ""}`} role="status">
        {toast}
      </div>
    </DemoPageShell>
  )
}
