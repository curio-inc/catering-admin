# catering-admin

ケータリング（お弁当・オードブル等）事業者向けの**注文管理 Web アプリケーション**です。
店舗側の管理画面（注文・売上・請求書・設定）と、顧客側の注文受付ページで構成されます。

> ⚠️ **現状のリポジトリは「デモ（営業・提案用）ビルド」です。**
> データベースには接続せず、サンプルデータ（モックデータ）とブラウザの `localStorage` で動作します。
> 機能の全体像・本番化に向けた課題は [`docs/要件定義書.md`](./docs/要件定義書.md) を参照してください。

- 公開デモ: https://repit-lp.vercel.app/admin/orders

---

## 目次

- [技術スタック](#技術スタック)
- [必要環境](#必要環境)
- [セットアップ](#セットアップ)
- [環境変数](#環境変数)
- [npm スクリプト](#npm-スクリプト)
- [ディレクトリ構成](#ディレクトリ構成)
- [画面・ルーティング](#画面ルーティング)
- [データとデモ仕様](#データとデモ仕様)
- [デプロイ（Vercel）](#デプロイvercel)
- [エンジニア向け引き継ぎメモ](#エンジニア向け引き継ぎメモ)
- [関連ドキュメント](#関連ドキュメント)

---

## 技術スタック

| 区分 | 採用技術 |
| --- | --- |
| フレームワーク | Next.js 14.2（App Router） |
| 言語 | TypeScript 5 / React 18 |
| スタイル | Tailwind CSS 3 + 個別 CSS（`components/demo/demo.css` ほか） |
| 認証 | iron-session（Cookie セッション・単一パスワード） |
| 帳票 PDF 出力 | jspdf + html2canvas（クライアント側で DOM → PDF 変換） |
| パッケージ管理 | pnpm（Vercel のビルドも pnpm） |
| ホスティング | Vercel |

---

## 必要環境

- Node.js 18.17 以上（Next.js 14.2 の要件。動作確認は Node 22）
- pnpm 8 以上（`npm i -g pnpm` 等で導入）

> リポジトリのロックファイルは `pnpm-lock.yaml` です。pnpm を使用してください。

---

## セットアップ

```bash
# 1. 依存関係のインストール
pnpm install

# 2. 環境変数ファイルを用意（任意。未設定でもデモ既定値で動作）
cp .env.local.example .env.local

# 3. 開発サーバー起動（http://localhost:3000）
pnpm dev
```

ログイン画面（`/admin/login`）のパスワードは環境変数 `ADMIN_PASSWORD`（未設定時は `.env.local.example` の既定値）です。

---

## 環境変数

`.env.local`（ローカル）/ Vercel の環境変数で設定します。すべて任意で、未設定時はデモ用の既定値で動作します。

| 変数 | 用途 |
| --- | --- |
| `APP_BRAND_NAME` / `NEXT_PUBLIC_APP_BRAND_NAME` | 画面・メール・帳票に表示する事業者名 |
| `ADMIN_PASSWORD` | 管理画面ログインパスワード |
| `SESSION_SECRET` | セッション Cookie の暗号化キー（本番では必ず十分に長いランダム文字列を設定） |
| `NEXT_PUBLIC_DEMO_BACK_URL` | ヘッダー「← LP に戻る」リンク先（任意） |
| `INVOICE_ISSUER_COMPANY` / `INVOICE_ISSUER_REP` / `INVOICE_ISSUER_POSTAL` / `INVOICE_ISSUER_ADDRESS` / `INVOICE_ISSUER_TEL` / `INVOICE_ISSUER_EMAIL` | 請求書の発行元情報 |
| `INVOICE_BANK_LINES` / `INVOICE_PAYMENT_DUE_DAYS` / `INVOICE_TRANSFER_FEE_NOTE` | 請求書の振込先・支払期日・振込手数料注記 |

> ⚠️ `.env.production` にデモ用パスワードがコミットされています。**本番運用時は必ず Vercel の環境変数に置き換え、リポジトリから機密値を排除してください。**

---

## npm スクリプト

| コマンド | 内容 |
| --- | --- |
| `pnpm dev` | 開発サーバー起動（`dev-auto-port.mjs` 経由で空きポートを自動選択） |
| `pnpm dev:fast` | `.next` を消さずに高速起動 |
| `pnpm dev:turbo` | Turbopack で起動 |
| `pnpm build` | 本番ビルド（`prebuild` で dev 停止 & `.next` クリーン） |
| `pnpm start` | ビルド成果物を起動（ポート 3000） |
| `pnpm lint` | Next.js（ESLint）による静的チェック |
| `pnpm clean` | `.next` を削除 |

---

## ディレクトリ構成

```
catering-admin/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # ルートレイアウト（フォント・メタ）
│   ├── page.tsx                      # "/" → /admin/orders へリダイレクト
│   ├── globals.css
│   ├── admin/
│   │   ├── login/                    # ログイン（page / login-form / actions）
│   │   ├── logout/route.ts           # ログアウト
│   │   └── orders/
│   │       ├── page.tsx              # 注文管理ダッシュボード（サイドメニュー）
│   │       └── [id]/
│   │           ├── page.tsx              # 注文詳細
│   │           ├── demo-order-detail-page.tsx
│   │           └── receipt-print/page.tsx # 領収書（印刷用）
│   └── order/page.tsx                # 顧客向け注文受付ページ
│
├── components/
│   ├── demo/                         # 管理画面 UI（デモ本体）
│   │   ├── admin-demo-app.tsx        # ★ 管理画面の中核（各パネルの統合）
│   │   ├── demo-orders-calendar.tsx  # 注文カレンダー
│   │   ├── demo-order-detail.tsx     # 注文詳細フォーム
│   │   ├── demo-settings-panel.tsx   # 設定（受付停止）
│   │   ├── demo-email-template-panel*.tsx # 通知メールプレビュー
│   │   └── demo.css
│   ├── order/                        # 顧客注文ページ UI
│   ├── invoice-formal-document.tsx   # 請求書レイアウト
│   ├── receipt-formal-document.tsx   # 領収書レイアウト
│   └── *-email-body.tsx              # 各種通知メール本文
│
├── lib/                              # ドメインロジック・データ
│   ├── mock-orders.ts                # ★ サンプル注文データ
│   ├── mock-order-menu.ts            # サンプル商品メニュー
│   ├── orders.ts                     # 注文の型定義・取得関数（モック実装）
│   ├── build-demo-view-model.ts      # 注文 → 画面表示用 ViewModel 変換
│   ├── demo-order-status.ts          # ステータスの localStorage 永続化
│   ├── demo-order-delivery.ts        # お届け日時の localStorage 永続化
│   ├── demo-invoice-sent.ts          # 請求書送信済みフラグの永続化
│   ├── reception-stop.ts             # 受付停止設定
│   ├── pickup-time-slots.ts          # 30分枠の時間ユーティリティ
│   ├── app-brand.ts                  # ブランド名（環境変数連動）
│   ├── invoice-issuer.ts / invoice-format.ts / receipt-format.ts # 帳票
│   └── ...
│
├── scripts/                          # ビルド補助スクリプト
├── middleware.ts                     # /admin/* の認証ガード
├── docs/要件定義書.md                # 要件定義書
└── vercel.json
```

★ = まず読むべき中心的なファイル

---

## 画面・ルーティング

| パス | 役割 |
| --- | --- |
| `/` | `/admin/orders` へリダイレクト |
| `/admin/login` | 管理画面ログイン |
| `/admin/logout` | ログアウト |
| `/admin/orders` | 注文管理ダッシュボード（注文一覧／カレンダー／請求書発行／設定／メールテンプレをサイドメニューで切替） |
| `/admin/orders/[id]` | 注文詳細（お届け日時の編集・ステータス変更） |
| `/admin/orders/[id]/receipt-print` | 領収書（印刷用ページ。クレカ決済以外で表示） |
| `/order` | 顧客向け注文受付ページ |

機能の詳細仕様は [`docs/要件定義書.md`](./docs/要件定義書.md) の「6. 機能要件」を参照してください。

---

## データとデモ仕様

現状はデモビルドのため、以下の制約があります（本番化時に解消が必要）。

1. 注文データは `lib/mock-orders.ts` の**固定サンプル**。DB・外部 API には接続しない。
2. ステータス変更・お届け日時編集・請求書送信状態・受付停止設定は、**閲覧中ブラウザの `localStorage` のみ**に保存される（他端末・他ユーザーに共有されない）。

   | `localStorage` キー | 用途 |
   | --- | --- |
   | `catering-admin-demo-order-status` | 注文ごとの UI ステータス上書き |
   | `catering-admin-demo-order-delivery` | お届け日時の上書き |
   | `catering-admin-demo-invoice-sent` | 請求書送信済みフラグ |
   | `catering-admin-reception-stops` | 受付停止設定 |

3. 「自動送信」「注文送信」などのメール送信・決済は**実行されない**（UI 上の演出のみ）。クレジットカード決済（Stripe）は**採用可否が未定**。
4. 認証は**単一パスワード方式で確定**。ユーザー個別アカウント・ロール管理は要件外。

---

## デプロイ（Vercel）

`vercel.json` で以下を指定しています。

```json
{
  "installCommand": "pnpm install",
  "buildCommand": "pnpm run build"
}
```

- リポジトリを Vercel プロジェクトに接続すれば自動デプロイされます。
- 本番では最低限 `SESSION_SECRET` と `ADMIN_PASSWORD` を Vercel の環境変数に設定してください。

---

## エンジニア向け引き継ぎメモ

本番化を進める際の着手ポイント。詳細は [`docs/要件定義書.md`](./docs/要件定義書.md) の「10. 本番化に向けた課題」を参照。

| テーマ | 着手の起点 | 内容 |
| --- | --- | --- |
| データ永続化 | `lib/orders.ts` / `lib/mock-orders.ts` / `lib/demo-*.ts` | モック & `localStorage` を実 DB（例: Supabase / PostgreSQL）に置き換え。`fetchOrderWithItems` 等のインターフェースは維持しやすい構成 |
| メール送信 | `components/*-email-body.tsx` / `lib/order-email-subjects.ts` | 本文テンプレは実装済み。配信基盤（送信処理）との接続が必要 |
| 決済（**未定**） | `lib/payment-labels.ts`（`needsManualReceipt` 等） | クレジットカード決済（Stripe）の採用可否が未確定。導入時に決済処理と領収書自動配信を実装 |
| 顧客注文の確定 | `components/order/customer-order-page.tsx` | 送信時のサーバー保存・受付枠/在庫の整合制御 |

### コーディング規約・補足

- パスエイリアス `@/*` はリポジトリルート基準（`tsconfig.json`）。
- TypeScript は `strict: true`。
- 日付・時刻はすべて **Asia/Tokyo** 前提（`lib/date-tokyo.ts` ほか）。
- 受取・お届け時間は **30 分単位**（`lib/pickup-time-slots.ts`）。
- 表示文言・帳票・メールはすべて日本語。

---

## 関連ドキュメント

- [`docs/要件定義書.md`](./docs/要件定義書.md) — 機能要件・データモデル・非機能要件・本番化課題
