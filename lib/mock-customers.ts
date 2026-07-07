/** デモ用の会員（登録ユーザー） */

export type RegisteredCustomer = {
  id: string
  company_name: string | null
  name: string
  email: string
  registered_at: string
}

export const MOCK_CUSTOMERS: RegisteredCustomer[] = [
  {
    id: "cust-001",
    company_name: "株式会社ミニトマト",
    name: "田中 花子",
    email: "hanako@minitomato.co.jp",
    registered_at: "2026-04-10T10:00:00+09:00",
  },
  {
    id: "cust-002",
    company_name: "合同会社グリーンオフィス",
    name: "佐藤 太郎",
    email: "sato@greenoffice.jp",
    registered_at: "2026-04-18T14:20:00+09:00",
  },
  {
    id: "cust-003",
    company_name: null,
    name: "山田 美咲",
    email: "misaki.yamada@example.com",
    registered_at: "2026-04-22T09:15:00+09:00",
  },
  {
    id: "cust-004",
    company_name: "株式会社テックスタート",
    name: "鈴木 一郎",
    email: "suzuki@techstart.co.jp",
    registered_at: "2026-04-25T11:00:00+09:00",
  },
  {
    id: "cust-005",
    company_name: "有限会社サンプル商事",
    name: "小林 次郎",
    email: "kobayashi@sample-shoji.jp",
    registered_at: "2026-05-01T08:30:00+09:00",
  },
  {
    id: "cust-006",
    company_name: "株式会社フューチャーワークス",
    name: "伊藤 真理",
    email: "ito@futureworks.example",
    registered_at: "2026-05-03T16:45:00+09:00",
  },
  {
    id: "cust-007",
    company_name: null,
    name: "中村 健太",
    email: "nakamura.k@example.com",
    registered_at: "2026-05-06T10:10:00+09:00",
  },
  {
    id: "cust-008",
    company_name: "株式会社アーバンラボ",
    name: "高橋 由美",
    email: "takahashi@urbanlab.co.jp",
    registered_at: "2026-05-08T13:00:00+09:00",
  },
  {
    id: "cust-009",
    company_name: null,
    name: "渡辺 翔",
    email: "watanabe.s@example.com",
    registered_at: "2026-05-10T09:40:00+09:00",
  },
  {
    id: "cust-010",
    company_name: "学校法人青葉学園",
    name: "松本 恵子",
    email: "matsumoto@aoba-gakuen.ed.jp",
    registered_at: "2026-05-12T11:20:00+09:00",
  },
  {
    id: "cust-011",
    company_name: null,
    name: "木村 大輔",
    email: "kimura.d@example.com",
    registered_at: "2026-05-15T15:00:00+09:00",
  },
  {
    id: "cust-012",
    company_name: "株式会社ネクストイベント",
    name: "石井 彩",
    email: "ishii.a@example.com",
    registered_at: "2026-06-15T09:00:00+09:00",
  },
]
