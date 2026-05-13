-- 管理画面用: 未確認（詳細未閲覧）・請求書発行・送付日時
alter table public.orders add column if not exists admin_opened_at timestamptz;
alter table public.orders add column if not exists invoice_issued_at timestamptz;
alter table public.orders add column if not exists invoice_sent_at timestamptz;

comment on column public.orders.admin_opened_at is '管理画面で注文詳細を初めて開いた日時。null の間は一覧で未確認表示。';
comment on column public.orders.invoice_issued_at is '請求書払い注文の請求書発行日時。';
comment on column public.orders.invoice_sent_at is '請求書払い注文の請求書送付日時。';
