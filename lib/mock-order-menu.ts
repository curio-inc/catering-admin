/** お客様向け注文ページ用のお弁当サンプルメニュー */

/** モック用プレースホルダ画像（全メニュー共通） */
const MOCK_MENU_IMAGE_COLOR = "#d4d0c8"

export type MockMenuItem = {
  id: string
  name: string
  /** 商品説明（120文字前後） */
  description: string
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
        description:
          "旬の野菜と厳選素材を使った定番の幕の内弁当です。ご飯・主菜・副菜・汁物をバランスよく盛り付け、会議や接待・社内イベントにも最適。彩り豊かな盛り付けでテーブルを華やかに演出します。最小10個から承り、ご指定の日時にお届けいたします。",
        unitPriceYen: 1500,
        imageColor: MOCK_MENU_IMAGE_COLOR,
      },
      {
        id: "bento-healthy",
        name: "ヘルシー和食弁当",
        description:
          "低カロリーながら満足感のある和食弁当。蒸し物や焼き物を中心に、塩分・油分を控えめに調整。健康志向の会議ランチや終日イベント向け。個包装で配布しやすく、常温から温め直しにも対応。10個以上のご注文でお届け可能です。",
        unitPriceYen: 1200,
        imageColor: MOCK_MENU_IMAGE_COLOR,
      },
      {
        id: "bento-premium",
        name: "プレミアム幕の内弁当",
        description:
          "厳選した主菜と彩り副菜を贅沢に盛り込んだ上位グレードの幕の内。接待や重要な打合せ、記念イベント向けの一品。見た目の華やかさと味のバランスを両立。名入れ焼印オプションもご相談ください。最小10個から、日時指定でお届けします。",
        unitPriceYen: 1800,
        imageColor: MOCK_MENU_IMAGE_COLOR,
      },
      {
        id: "bento-vege",
        name: "ベジタリアン弁当",
        description:
          "卵・乳製品・動物性だしを使わない植物性メニュー。ベジタリアンやヴィーガンのゲストがいる会食にも安心。栄養バランスを考えた副菜とご飯で満足感を確保。アレルギー対応のご相談も承ります。10個からご注文いただけます。",
        unitPriceYen: 1400,
        imageColor: MOCK_MENU_IMAGE_COLOR,
      },
      {
        id: "bento-kids",
        name: "キッズランチボックス",
        description:
          "子ども向けの小さめサイズ弁当。食べやすい一口サイズのおかずと、見た目も楽しい盛り付け。学校行事・キッズイベント・家族向けパーティーに。アレルギー情報は事前にご相談ください。5個から承り、指定日時にお届けいたします。",
        unitPriceYen: 980,
        imageColor: MOCK_MENU_IMAGE_COLOR,
      },
      {
        id: "bento-deluxe",
        name: "デラックスお重弁当",
        description:
          "二段重ねの特別仕様。複数種類の主菜と副菜をたっぷり詰め合わせ、記念日やVIP接待向け。重箱ならではの格式高い見た目で、写真映えも抜群。人数に合わせたご提案も可能。最小5個から、事前予約制でお作りします。",
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
        description:
          "パン・サラダ・メインの洋食をBOXに詰め合わせ。立食パーティーやセミナー休憩の軽食に最適。個包装で配布・回収がスムーズ。温め直し不要のメニュー中心で、会場設営の負担を軽減。10個以上からご注文いただけます。",
        unitPriceYen: 2000,
        imageColor: MOCK_MENU_IMAGE_COLOR,
      },
      {
        id: "box-sandwich",
        name: "サンドイッチプラッター",
        description:
          "複数種類のサンドイッチをカットしてプラッター盛り。軽食ミーティングやアフタヌーンイベント向け。ベジタリアン対応の種類もご用意可能。見栄えの良い盛り付けで、少人数から大人数まで柔軟に対応。8個以上から承ります。",
        unitPriceYen: 1650,
        imageColor: MOCK_MENU_IMAGE_COLOR,
      },
      {
        id: "box-party",
        name: "パーティーオードブルBOX",
        description:
          "チーズ・生ハム・フルーツなどを彩ったオードブルBOX。歓送迎会や懇親会のテーブルセンターに。人数に合わせて量を調整し、追加オーダーもご相談ください。盛り付け済みでそのまま提供可能。15個以上からお届けいたします。",
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
        description:
          "会議室向けのコンパクト弁当。机の上で食べやすいサイズ感と、匂いの立ちにくいメニュー構成。短時間の昼食休憩にも最適。名札スペース付きラベル対応も可能。10個以上のご注文で、指定日時にお届けします。",
        unitPriceYen: 1350,
        imageColor: MOCK_MENU_IMAGE_COLOR,
      },
      {
        id: "office-snack",
        name: "オフィススナックセット",
        description:
          "クッキー・ナッツ・ドライフルーツなどを詰め合わせたスナックセット。長時間の会議や研修の休憩時間に。個包装パックで配布しやすく、コーヒーブレイクにも。5セット以上から承り、数量に応じて内容を調整可能です。",
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
        description:
          "500mlペットボトル入りのお茶。会議・イベントのドリンク補助として。常温保存で配布が簡単。緑茶・麦茶など種類はご相談ください。食事弁当とセットでのご注文がおすすめ。20本以上からお届け、数量割引もご相談いただけます。",
        unitPriceYen: 150,
        imageColor: MOCK_MENU_IMAGE_COLOR,
      },
      {
        id: "drink-coffee",
        name: "アイスコーヒー",
        description:
          "500mlボトル入りのアイスコーヒー。午後の会議や夏季イベント向け。個包装で衛生的に配布でき、冷蔵または保冷ボックスでの提供も可能。お弁当とのセット注文で手配がスムーズ。20本以上から承り、日時指定でお届けします。",
        unitPriceYen: 200,
        imageColor: MOCK_MENU_IMAGE_COLOR,
      },
    ],
  },
]
