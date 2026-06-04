/** お客様向け注文ページ用のお弁当サンプルメニュー */

/** モック用プレースホルダ画像（全メニュー共通） */
const MOCK_MENU_IMAGE_COLOR = "#d4d0c8"

export type MockMenuItem = {
  id: string
  name: string
  unitPriceYen: number
  /** プレースホルダ画像（CSS背景色） */
  imageColor: string
}

export type MockMenuCategory = {
  id: string
  title: string
  items: MockMenuItem[]
}

export const MOCK_ORDER_MENU: MockMenuCategory[] = [
  {
    id: "bento",
    title: "お弁当",
    items: [
      {
        id: "bento-season",
        name: "季節の幕の内弁当",
        unitPriceYen: 1500,
        imageColor: MOCK_MENU_IMAGE_COLOR,
      },
      {
        id: "bento-healthy",
        name: "ヘルシー和食弁当",
        unitPriceYen: 1200,
        imageColor: MOCK_MENU_IMAGE_COLOR,
      },
      {
        id: "bento-premium",
        name: "プレミアム幕の内弁当",
        unitPriceYen: 1800,
        imageColor: MOCK_MENU_IMAGE_COLOR,
      },
      {
        id: "bento-vege",
        name: "ベジタリアン弁当",
        unitPriceYen: 1400,
        imageColor: MOCK_MENU_IMAGE_COLOR,
      },
      {
        id: "bento-kids",
        name: "キッズランチボックス",
        unitPriceYen: 980,
        imageColor: MOCK_MENU_IMAGE_COLOR,
      },
      {
        id: "bento-deluxe",
        name: "デラックスお重弁当",
        unitPriceYen: 2200,
        imageColor: MOCK_MENU_IMAGE_COLOR,
      },
    ],
  },
  {
    id: "western",
    title: "洋風・BOX",
    items: [
      {
        id: "box-western",
        name: "ケータリングボックス（洋食）",
        unitPriceYen: 2000,
        imageColor: MOCK_MENU_IMAGE_COLOR,
      },
      {
        id: "box-sandwich",
        name: "サンドイッチプラッター",
        unitPriceYen: 1650,
        imageColor: MOCK_MENU_IMAGE_COLOR,
      },
      {
        id: "box-party",
        name: "パーティーオードブルBOX",
        unitPriceYen: 3500,
        imageColor: MOCK_MENU_IMAGE_COLOR,
      },
    ],
  },
  {
    id: "office",
    title: "会議・オフィス向け",
    items: [
      {
        id: "office-meeting",
        name: "会議用ミニ弁当（10個〜）",
        unitPriceYen: 1350,
        imageColor: MOCK_MENU_IMAGE_COLOR,
      },
      {
        id: "office-snack",
        name: "オフィススナックセット",
        unitPriceYen: 800,
        imageColor: MOCK_MENU_IMAGE_COLOR,
      },
    ],
  },
  {
    id: "drink",
    title: "ドリンク",
    items: [
      {
        id: "drink-tea",
        name: "お茶（ペットボトル）",
        unitPriceYen: 150,
        imageColor: MOCK_MENU_IMAGE_COLOR,
      },
      {
        id: "drink-coffee",
        name: "アイスコーヒー",
        unitPriceYen: 200,
        imageColor: MOCK_MENU_IMAGE_COLOR,
      },
    ],
  },
]
