# popn-medal

pop'n music の e-amusement プレーデータから、**難易度（LIGHT / NORMAL / HYPER / EX）× メダル種別**の枚数を集計して `TOTAL MEDALS` 表を表示するブックマークレットです。画像は使わず色付き記号で表示します。外部への送信は一切ありません（ローカル表示のみ）。

## 使い方

1. 下のローダーを、ブックマークの **URL（アドレス）欄**に貼り付けて保存します。

   ```
   javascript:void function(d){var s=d.createElement("script");s.src="https://cdn.jsdelivr.net/gh/Yasukei404/popn-medal@main/medal-census.js";d.head.appendChild(s)}(document);
   ```

2. e-amusement に**ログインした状態**で、pop'n のプレーデータのページ
   （`https://p.eagate.573.jp/game/popn/popn29/playdata/...`）を開きます。
3. 保存したブックマークをクリック。全レベルを走査するため、初回は数分かかります（進捗表示あり）。

## 注意

- e-amusement のベーシックコース登録済みアカウントが必要です。
- レベル 1〜50 を全走査するため、実行のたびに数百リクエストを送ります。
- 表示されるのはメダルの集計のみで、データを外部に送信することはありません。

## 更新

`medal-census.js` を更新して push すると、jsDelivr のキャッシュ（最大24時間）が切れ次第、全利用者に反映されます。即時反映したい場合はローダーの `@main` を `@<コミットSHA>` やタグ `@v1` に固定してください。
