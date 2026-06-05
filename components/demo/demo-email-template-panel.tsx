import { CustomerOrderCancelEmailBody } from "@/components/customer-order-cancel-email-body"
import { CustomerOrderEmailBody } from "@/components/customer-order-email-body"
import { StoreOrderEmailBody } from "@/components/store-order-email-body"
import { StripeReceiptEmailBody } from "@/components/stripe-receipt-email-body"
import { DemoEmailTemplatePanelClient } from "@/components/demo/demo-email-template-panel-client"
import {
  buildCustomerOrderCancelEmailSubject,
  buildCustomerOrderEmailSubject,
  buildStoreOrderEmailSubject,
  buildStripeReceiptEmailSubject,
} from "@/lib/order-email-subjects"
import { getStripeReceiptEmailSample } from "@/lib/stripe-receipt-email-sample"
import { getCancelOrderEmailSample, getOrderEmailSample } from "@/lib/store-order-email-sample"

export function DemoEmailTemplatePanel() {
  const { order, items } = getOrderEmailSample()
  const cancelSample = getCancelOrderEmailSample()
  const receiptSample = getStripeReceiptEmailSample()

  return (
    <div className="admin-workspace demo-email-template-workspace">
      <p className="demo-email-template-lead">
        注文受付・キャンセル・決済時に送られる通知メールのイメージです。表示内容はサンプルデータに基づいています。
      </p>

      <DemoEmailTemplatePanelClient
        tabs={[
          {
            id: "store",
            label: "店舗向け",
            subject: buildStoreOrderEmailSubject(order),
            lead: "店舗（管理者）宛ての新規注文通知メールです。",
            preview: <StoreOrderEmailBody order={order} items={items} mainTitle="新規注文を受け付けました" />,
          },
          {
            id: "customer",
            label: "お客様向け",
            subject: buildCustomerOrderEmailSubject(),
            lead: "ご注文者様宛ての受付確認メールです。",
            preview: <CustomerOrderEmailBody order={order} items={items} />,
          },
          {
            id: "customer-cancel",
            label: "キャンセル",
            subject: buildCustomerOrderCancelEmailSubject(),
            lead: "ご注文者様宛てのキャンセル通知メールです。",
            preview: <CustomerOrderCancelEmailBody order={cancelSample.order} items={cancelSample.items} />,
          },
          {
            id: "receipt",
            label: "領収書",
            subject: buildStripeReceiptEmailSubject(),
            lead: "クレジットカード決済（Stripe）完了時に自動配信される領収書メールです。",
            preview: <StripeReceiptEmailBody {...receiptSample} />,
          },
        ]}
      />
    </div>
  )
}
