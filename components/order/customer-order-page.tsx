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
import { todayIsoDateInTokyo } from "@/lib/date-tokyo"
import { PickupTimeSlotSelect } from "@/components/pickup-time-slot-select"
import { formatPickupTimeRange } from "@/lib/pickup-time-slots"
import { IconCart, IconCreditCard, IconFileText, IconStore, IconTruck } from "@/components/order/order-sidebar-icons"
import "./customer-order.css"

const TAX_RATE = 0.08

type Quantities = Record<string, number>

type ArrivalHandling = "tel" | "leave" | "other"

function arrivalHandlingLabel(value: ArrivalHandling): string {
  if (value === "tel") return "到着後TEL"
  if (value === "leave") return "置き配"
  return "その他"
}

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
        <p className="co-card-description">{item.description}</p>
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

export function CustomerOrderPage() {
  const [qty, setQty] = useState<Quantities>({})
  const [receiving, setReceiving] = useState<"pickup" | "delivery">("delivery")
  const [companyName, setCompanyName] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [arrivalHandling, setArrivalHandling] = useState<ArrivalHandling | "">("")
  const [arrivalHandlingOther, setArrivalHandlingOther] = useState("")
  const [pickupDate, setPickupDate] = useState("")
  const [pickupTime, setPickupTime] = useState("")
  const [dayContactName, setDayContactName] = useState("")
  const [dayContactPhone, setDayContactPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [invoiceCompanyName, setInvoiceCompanyName] = useState("")
  const [workNumber, setWorkNumber] = useState("")
  const [workName, setWorkName] = useState("")
  const [invoiceEmail1, setInvoiceEmail1] = useState("")
  const [invoiceEmail2, setInvoiceEmail2] = useState("")
  const [invoiceAddress, setInvoiceAddress] = useState("")
  const [invoiceNotes, setInvoiceNotes] = useState("")
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
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const pickupTimeLabel = formatPickupTimeRange(pickupTime)

  if (submitted) {
    return (
      <div className="co-page">
        <header className="co-header">
          <p className="co-brand">ロゴ</p>
          <Link href="/admin/orders" className="co-admin-back">
            管理画面へ戻る
          </Link>
        </header>

        <main className="co-main co-main--complete">
          <div className="co-complete">
            <div className="co-complete-badge" aria-hidden>
              ✓
            </div>
            <h1 className="co-complete-title">リクエスト完了</h1>
            <p className="co-complete-lead">
              ご注文内容を受け付けました。
              <br />
              2〜3営業日以内に担当者よりご連絡させていただきます。
            </p>

            <div className="co-complete-summary">
              {lines.length > 0 ? (
                <ul className="co-complete-lines">
                  {lines.map((l) => (
                    <li key={l.item.id}>
                      {l.item.name} × {l.quantity}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="co-complete-empty">商品は選択されていません</p>
              )}
              <dl className="co-complete-meta">
                {companyName ? (
                  <>
                    <dt>会社名</dt>
                    <dd>{companyName}</dd>
                  </>
                ) : null}
                {name ? (
                  <>
                    <dt>お名前</dt>
                    <dd>{name}</dd>
                  </>
                ) : null}
                {receiving === "delivery" && deliveryAddress ? (
                  <>
                    <dt>お届け先住所</dt>
                    <dd>{deliveryAddress}</dd>
                  </>
                ) : null}
                {receiving === "delivery" && arrivalHandling ? (
                  <>
                    <dt>到着後の対応</dt>
                    <dd>
                      {arrivalHandling === "other" && arrivalHandlingOther.trim()
                        ? arrivalHandlingOther.trim()
                        : arrivalHandlingLabel(arrivalHandling)}
                    </dd>
                  </>
                ) : null}
                {pickupDate ? (
                  <>
                    <dt>受取日</dt>
                    <dd>{pickupDate}</dd>
                  </>
                ) : null}
                {pickupTimeLabel ? (
                  <>
                    <dt>受け取り時間</dt>
                    <dd>{pickupTimeLabel}</dd>
                  </>
                ) : null}
                {dayContactName ? (
                  <>
                    <dt>当日のご担当者様</dt>
                    <dd>{dayContactName}</dd>
                  </>
                ) : null}
                {dayContactPhone ? (
                  <>
                    <dt>当日のご担当者様（電話番号）</dt>
                    <dd>{dayContactPhone}</dd>
                  </>
                ) : null}
                {payment === "invoice" && invoiceCompanyName ? (
                  <>
                    <dt>請求先会社名</dt>
                    <dd>{invoiceCompanyName}</dd>
                  </>
                ) : null}
                {payment === "invoice" && workNumber ? (
                  <>
                    <dt>作品番号</dt>
                    <dd>{workNumber}</dd>
                  </>
                ) : null}
                {payment === "invoice" && workName ? (
                  <>
                    <dt>作品名</dt>
                    <dd>{workName}</dd>
                  </>
                ) : null}
                <dt>合計金額</dt>
                <dd>{yen(total)}</dd>
              </dl>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="co-page">
      <header className="co-header">
        <p className="co-brand">ロゴ</p>
        <Link href="/admin/orders" className="co-admin-back">
          管理画面へ戻る
        </Link>
      </header>

      <main className="co-main">
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
            <form className="co-checkout-form" onSubmit={handleSubmit} noValidate>
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
                  <label className="co-radio-card">
                    <input
                      type="radio"
                      name="receiving"
                      className="co-radio-input"
                      checked={receiving === "delivery"}
                      onChange={() => setReceiving("delivery")}
                    />
                    <span className="co-radio-mark" aria-hidden />
                    <span className="co-radio-body">
                      <IconTruck />
                      <span>デリバリー</span>
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
                  <label className="co-field-grid" htmlFor="co-company">
                    会社名
                    <input
                      id="co-company"
                      type="text"
                      placeholder="株式会社サンプル"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </label>
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
                  {receiving === "delivery" ? (
                    <>
                      <label className="co-field-grid" htmlFor="co-address">
                        お届け先住所 *
                        <textarea
                          id="co-address"
                          rows={2}
                          placeholder="東京都港区六本木1-2-3 ○○ビル5F"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                        />
                      </label>
                      <div className="co-arrival-handling">
                        <p className="co-arrival-handling-title">到着後の対応</p>
                        <div className="co-arrival-handling-options" role="radiogroup" aria-label="到着後の対応">
                          <label className="co-radio-card">
                            <input
                              type="radio"
                              name="arrival-handling"
                              className="co-radio-input"
                              checked={arrivalHandling === "tel"}
                              onChange={() => setArrivalHandling("tel")}
                            />
                            <span className="co-radio-mark" aria-hidden />
                            <span className="co-radio-body co-radio-body--center">到着後TEL</span>
                          </label>
                          <label className="co-radio-card">
                            <input
                              type="radio"
                              name="arrival-handling"
                              className="co-radio-input"
                              checked={arrivalHandling === "leave"}
                              onChange={() => setArrivalHandling("leave")}
                            />
                            <span className="co-radio-mark" aria-hidden />
                            <span className="co-radio-body co-radio-body--center">置き配</span>
                          </label>
                          <label className="co-radio-card">
                            <input
                              type="radio"
                              name="arrival-handling"
                              className="co-radio-input"
                              checked={arrivalHandling === "other"}
                              onChange={() => setArrivalHandling("other")}
                            />
                            <span className="co-radio-mark" aria-hidden />
                            <span className="co-radio-body co-radio-body--center">その他</span>
                          </label>
                        </div>
                        {arrivalHandling === "other" ? (
                          <label className="co-field-grid co-arrival-handling-other" htmlFor="co-arrival-other">
                            その他の内容
                            <input
                              id="co-arrival-other"
                              type="text"
                              value={arrivalHandlingOther}
                              onChange={(e) => setArrivalHandlingOther(e.target.value)}
                            />
                          </label>
                        ) : null}
                        {arrivalHandling === "leave" ? (
                          <p className="co-arrival-handling-note">
                            ※置き配対応の場合、夏季は30分以内の回収をお願いいたします。
                          </p>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                  <div className="co-field-row">
                    <label className="co-field-grid" htmlFor="co-date">
                      受取日 *
                      <input
                        id="co-date"
                        type="date"
                        required
                        min={todayIsoDateInTokyo()}
                        value={pickupDate}
                        aria-invalid={receptionBlock.blocked}
                        onChange={(e) => setPickupDate(e.target.value)}
                      />
                    </label>
                    <label className="co-field-grid" htmlFor="co-time">
                      受け取り時間 *
                      <PickupTimeSlotSelect
                        id="co-time"
                        required
                        value={pickupTime}
                        aria-invalid={receptionBlock.blocked}
                        onChange={setPickupTime}
                      />
                      <span className="co-field-hint-block">30分枠から選択（例: 5:00～5:30）</span>
                    </label>
                  </div>
                  <label className="co-field-grid" htmlFor="co-day-contact">
                    当日のご担当者様
                    <input
                      id="co-day-contact"
                      type="text"
                      placeholder="山田太郎"
                      value={dayContactName}
                      onChange={(e) => setDayContactName(e.target.value)}
                    />
                  </label>
                  <label className="co-field-grid" htmlFor="co-day-contact-phone">
                    当日のご担当者様（電話番号）
                    <input
                      id="co-day-contact-phone"
                      type="tel"
                      placeholder="090-1234-5678"
                      value={dayContactPhone}
                      onChange={(e) => setDayContactPhone(e.target.value)}
                    />
                  </label>
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
                  <p className="co-emergency-contact">
                    DELIcoupe当日の緊急連絡先（080-4613-9422）
                  </p>
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
                {payment === "invoice" ? (
                  <div className="co-panel-section co-panel-section--fields co-invoice-fields">
                    <p className="co-invoice-fields-title">請求書払い情報</p>
                    <label className="co-field-grid" htmlFor="co-invoice-company">
                      請求先会社名
                      <input
                        id="co-invoice-company"
                        type="text"
                        placeholder="株式会社サンプル"
                        value={invoiceCompanyName}
                        onChange={(e) => setInvoiceCompanyName(e.target.value)}
                      />
                    </label>
                    <label className="co-field-grid" htmlFor="co-work-number">
                      作品番号
                      <input
                        id="co-work-number"
                        type="text"
                        value={workNumber}
                        onChange={(e) => setWorkNumber(e.target.value)}
                      />
                    </label>
                    <label className="co-field-grid" htmlFor="co-work-name">
                      作品名
                      <input
                        id="co-work-name"
                        type="text"
                        value={workName}
                        onChange={(e) => setWorkName(e.target.value)}
                      />
                    </label>
                    <label className="co-field-grid" htmlFor="co-invoice-email1">
                      お送り先メールアドレス①
                      <input
                        id="co-invoice-email1"
                        type="email"
                        placeholder="billing@example.com"
                        value={invoiceEmail1}
                        onChange={(e) => setInvoiceEmail1(e.target.value)}
                      />
                    </label>
                    <label className="co-field-grid" htmlFor="co-invoice-email2">
                      お送り先メールアドレス②
                      <input
                        id="co-invoice-email2"
                        type="email"
                        placeholder="accounting@example.com"
                        value={invoiceEmail2}
                        onChange={(e) => setInvoiceEmail2(e.target.value)}
                      />
                    </label>
                    <label className="co-field-grid" htmlFor="co-invoice-address">
                      会社所在地
                      <input
                        id="co-invoice-address"
                        type="text"
                        placeholder="東京都渋谷区..."
                        value={invoiceAddress}
                        onChange={(e) => setInvoiceAddress(e.target.value)}
                      />
                    </label>
                    <label className="co-field-grid" htmlFor="co-invoice-notes">
                      備考
                      <textarea
                        id="co-invoice-notes"
                        rows={2}
                        placeholder="請求書に関するご要望など"
                        value={invoiceNotes}
                        onChange={(e) => setInvoiceNotes(e.target.value)}
                      />
                    </label>
                  </div>
                ) : null}
                {payment === "cash" ? (
                  <div className="co-panel-section co-payment-notice">
                    <p className="co-payment-notice-text">
                      ※現金ご希望のお客様は、おつりの無いようご準備をお願いいたします。
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="co-panel">
                <div className="co-panel-head co-panel-head--amber">
                  <h2 className="co-panel-title">注文確定</h2>
                </div>
                <div className="co-panel-section">
                  <button type="submit" className="co-submit">
                    {payment === "card" ? "決済へ進む" : "注文をリクエスト"}
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
