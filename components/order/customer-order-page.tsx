"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { MOCK_ORDER_MENU, type MockMenuItem } from "@/lib/mock-order-menu"
import {
  findReceptionStopBlock,
  parseReceptionStopsJson,
  RECEPTION_STOPS_STORAGE_KEY,
  type ReceptionStopEntry,
} from "@/lib/reception-stop"
import { IconCart, IconCreditCard, IconFileText, IconStore, IconTruck } from "@/components/order/order-sidebar-icons"
import "./customer-order.css"

const DELIVERY_MIN_YEN = 10000
const TAX_RATE = 0.08

type CustomerOrderPageProps = {
  brandName: string
}

type Quantities = Record<string, number>

function yen(n: number) {
  return `¥${n.toLocaleString("ja-JP")}`
}

function MenuProductCard({
  item,
  quantity,
  onQuantityChange,
}: {
  item: MockMenuItem
  quantity: number
  onQuantityChange: (n: number) => void
}) {
  return (
    <article className="co-card">
      <div className="co-card-image-wrap">
        <div className="co-card-image" style={{ backgroundColor: item.imageColor }} aria-hidden />
        <span className="sr-only">{item.name}</span>
      </div>
      <div className="co-card-head">
        <h3 className="co-card-name">{item.name}</h3>
        <p className="co-card-price">{yen(item.unitPriceYen)}</p>
      </div>
      <div className="co-card-body">
        <label className="co-card-qty-label">
          個数
          <input
            type="number"
            min={0}
            max={999}
            value={quantity}
            onChange={(e) => onQuantityChange(Number.parseInt(e.target.value, 10) || 0)}
            className="co-card-qty-input"
          />
        </label>
      </div>
    </article>
  )
}

export function CustomerOrderPage({ brandName }: CustomerOrderPageProps) {
  const [qty, setQty] = useState<Quantities>({})
  const [receiving, setReceiving] = useState<"pickup" | "delivery">("pickup")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [pickupDate, setPickupDate] = useState("")
  const [pickupTime, setPickupTime] = useState("")
  const [notes, setNotes] = useState("")
  const [caseRef, setCaseRef] = useState("")
  const [payment, setPayment] = useState<"card" | "invoice" | "cash">("card")
  const [submitted, setSubmitted] = useState(false)
  const [receptionStops, setReceptionStops] = useState<ReceptionStopEntry[]>([])

  useEffect(() => {
    const load = () => {
      setReceptionStops(parseReceptionStopsJson(localStorage.getItem(RECEPTION_STOPS_STORAGE_KEY)))
    }
    load()
    const onStorage = (e: StorageEvent) => {
      if (e.key === RECEPTION_STOPS_STORAGE_KEY || e.key === null) load()
    }
    window.addEventListener("storage", onStorage)
    document.addEventListener("visibilitychange", load)
    return () => {
      window.removeEventListener("storage", onStorage)
      document.removeEventListener("visibilitychange", load)
    }
  }, [])

  const receptionBlock = useMemo(
    () => findReceptionStopBlock(pickupDate, pickupTime, receptionStops),
    [pickupDate, pickupTime, receptionStops],
  )

  const lines = useMemo(() => {
    const result: { item: MockMenuItem; quantity: number; subtotal: number }[] = []
    for (const cat of MOCK_ORDER_MENU) {
      for (const item of cat.items) {
        const quantity = qty[item.id] ?? 0
        if (quantity > 0) {
          result.push({ item, quantity, subtotal: item.unitPriceYen * quantity })
        }
      }
    }
    return result
  }, [qty])

  const itemCount = lines.reduce((s, l) => s + l.quantity, 0)
  const subtotal = lines.reduce((s, l) => s + l.subtotal, 0)
  const tax = Math.floor(subtotal * TAX_RATE)
  const total = subtotal + tax
  const deliveryAvailable = subtotal >= DELIVERY_MIN_YEN

  useEffect(() => {
    if (!deliveryAvailable && receiving === "delivery") {
      setReceiving("pickup")
    }
  }, [deliveryAvailable, receiving])

  function setQuantity(id: string, next: number) {
    const n = Math.max(0, Math.min(999, next))
    setQty((prev) => {
      const copy = { ...prev }
      if (n === 0) delete copy[id]
      else copy[id] = n
      return copy
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (itemCount === 0 || receptionBlock.blocked) return
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="co-page">
      <header className="co-header">
        <p className="co-brand">{brandName}</p>
        <Link href="/admin/orders" className="co-admin-back">
          管理画面へ戻る
        </Link>
      </header>

      <main className="co-main">
        {submitted ? (
          <div className="co-notice co-notice--ok" role="status">
            ご注文内容を受け付けました（デモ表示のため実際には送信されません）。
          </div>
        ) : null}

        <h1 className="co-title">オンライン注文</h1>
        <p className="co-lead">お好みのお弁当・メニューを選択してご注文ください</p>

        <div className="co-layout" id="menu">
          <div className="co-menu">
            {MOCK_ORDER_MENU.map((cat) => (
              <section key={cat.id} className="co-category">
                <h2 className="co-category-title">{cat.title}</h2>
                <div className="co-card-grid">
                  {cat.items.map((item) => (
                    <MenuProductCard
                      key={item.id}
                      item={item}
                      quantity={qty[item.id] ?? 0}
                      onQuantityChange={(n) => setQuantity(item.id, n)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className="co-aside">
            <form className="co-checkout-form" onSubmit={handleSubmit}>
              <div className="co-panel">
                <div className="co-panel-head co-panel-head--gradient">
                  <h2 className="co-panel-title">
                    <IconCart />
                    注文内容
                  </h2>
                </div>
                <div className="co-panel-section">
                  <div className="co-cart-scroll">
                    {lines.length === 0 ? (
                      <p className="co-cart-empty">商品が選択されていません</p>
                    ) : (
                      <ul className="co-cart-lines">
                        {lines.map((l) => (
                          <li key={l.item.id} className="co-cart-line">
                            <span className="co-cart-line-name">
                              {l.item.name} × {l.quantity}
                            </span>
                            <span className="co-cart-line-price">{yen(l.subtotal)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="co-cart-count-row">
                      <span>合計個数:</span>
                      <span>{itemCount}個</span>
                    </div>
                  </div>
                </div>
                <div className="co-panel-foot">
                  <div className="co-totals-stack">
                    <div className="co-totals-row">
                      <span>小計（商品）:</span>
                      <span>{yen(subtotal)}</span>
                    </div>
                    <div className="co-totals-row">
                      <span>消費税(商品 8%):</span>
                      <span>{yen(tax)}</span>
                    </div>
                    <div className="co-totals-row co-totals-row--grand">
                      <span>合計金額:</span>
                      <span>{yen(total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="co-panel">
                <div className="co-panel-head co-panel-head--amber">
                  <h2 className="co-panel-title">受け取り方法</h2>
                </div>
                <div className="co-panel-section co-panel-section--radios">
                  <label className={`co-radio-card${!deliveryAvailable ? " is-disabled" : ""}`}>
                    <input
                      type="radio"
                      name="receiving"
                      className="co-radio-input"
                      checked={receiving === "delivery"}
                      disabled={!deliveryAvailable}
                      onChange={() => setReceiving("delivery")}
                    />
                    <span className="co-radio-mark" aria-hidden />
                    <span className="co-radio-body">
                      <IconTruck />
                      <span>
                        デリバリー
                        {!deliveryAvailable ? (
                          <small>10,000円未満のため選択できません。</small>
                        ) : null}
                      </span>
                    </span>
                  </label>
                  <label className="co-radio-card">
                    <input
                      type="radio"
                      name="receiving"
                      className="co-radio-input"
                      checked={receiving === "pickup"}
                      onChange={() => setReceiving("pickup")}
                    />
                    <span className="co-radio-mark" aria-hidden />
                    <span className="co-radio-body">
                      <IconStore />
                      <span>店舗受け取り</span>
                    </span>
                  </label>
                </div>
              </div>

              <div className="co-panel">
                <div className="co-panel-head co-panel-head--amber">
                  <h2 className="co-panel-title">お客様情報</h2>
                </div>
                <div className="co-panel-section co-panel-section--fields">
                  <label className="co-field-grid" htmlFor="co-name">
                    お名前 *
                    <input id="co-name" required placeholder="山田太郎" value={name} onChange={(e) => setName(e.target.value)} />
                  </label>
                  <label className="co-field-grid" htmlFor="co-phone">
                    電話番号 *
                    <input
                      id="co-phone"
                      required
                      type="tel"
                      placeholder="090-1234-5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </label>
                  <label className="co-field-grid" htmlFor="co-email">
                    メールアドレス *
                    <input
                      id="co-email"
                      required
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </label>
                  <div className="co-field-row">
                    <label className="co-field-grid" htmlFor="co-date">
                      受取日 *
                      <input
                        id="co-date"
                        type="date"
                        required
                        value={pickupDate}
                        aria-invalid={receptionBlock.blocked}
                        onChange={(e) => setPickupDate(e.target.value)}
                      />
                    </label>
                    <label className="co-field-grid" htmlFor="co-time">
                      受け取り時間 *
                      <input
                        id="co-time"
                        type="time"
                        required
                        step={60}
                        value={pickupTime}
                        aria-invalid={receptionBlock.blocked}
                        onChange={(e) => setPickupTime(e.target.value)}
                      />
                    </label>
                  </div>
                  {receptionBlock.blocked ? (
                    <p className="co-reception-stop-msg" role="alert">
                      選択された日時は受付停止のためご注文いただけません（{receptionBlock.label}）。
                    </p>
                  ) : null}
                  <label className="co-field-grid" htmlFor="co-notes">
                    備考・特別なご要望
                    <textarea
                      id="co-notes"
                      rows={2}
                      placeholder="アレルギー情報や特別なご要望がございましたらご記入ください"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </label>
                  <div className="co-field-grid">
                    <div>
                      <label className="co-field-label" htmlFor="co-case">
                        案件名・案件番号
                      </label>
                      <p className="co-field-hint-block">請求書に記載が必要な方のみご記載ください。</p>
                    </div>
                    <input id="co-case" type="text" value={caseRef} onChange={(e) => setCaseRef(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="co-panel">
                <div className="co-panel-head co-panel-head--amber">
                  <h2 className="co-panel-title">支払い方法</h2>
                </div>
                <div className="co-panel-section co-panel-section--radios">
                  <label className="co-radio-card">
                    <input
                      type="radio"
                      name="payment"
                      className="co-radio-input"
                      checked={payment === "card"}
                      onChange={() => setPayment("card")}
                    />
                    <span className="co-radio-mark" aria-hidden />
                    <span className="co-radio-body">
                      <IconCreditCard />
                      <span>クレジットカード決済</span>
                    </span>
                  </label>
                  <label className="co-radio-card">
                    <input
                      type="radio"
                      name="payment"
                      className="co-radio-input"
                      checked={payment === "invoice"}
                      onChange={() => setPayment("invoice")}
                    />
                    <span className="co-radio-mark" aria-hidden />
                    <span className="co-radio-body co-radio-body--center">
                      <IconFileText />
                      <span>請求書払い</span>
                    </span>
                  </label>
                  <label className="co-radio-card">
                    <input
                      type="radio"
                      name="payment"
                      className="co-radio-input"
                      checked={payment === "cash"}
                      onChange={() => setPayment("cash")}
                    />
                    <span className="co-radio-mark" aria-hidden />
                    <span className="co-radio-body co-radio-body--center">
                      <IconCreditCard />
                      <span>当日現金払い</span>
                    </span>
                  </label>
                </div>
              </div>

              <div className="co-panel">
                <div className="co-panel-head co-panel-head--amber">
                  <h2 className="co-panel-title">注文確定</h2>
                </div>
                <div className="co-panel-section">
                  <button
                    type="submit"
                    className="co-submit"
                    disabled={itemCount === 0 || receptionBlock.blocked}
                  >
                    注文をリクエスト
                  </button>
                </div>
              </div>
            </form>
          </aside>
        </div>
      </main>
    </div>
  )
}
