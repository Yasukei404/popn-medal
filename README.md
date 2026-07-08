# popn-medal

pop'n music の e-amusement プレーデータから、**難易度（LIGHT / NORMAL / HYPER / EX）× メダル種別**の枚数を集計して `TOTAL MEDALS` 表を表示するブックマークレットです。画像は使わず色付き記号で表示します。外部への送信は一切ありません（ローカル表示のみ）。

## 使い方

e-amusement のベーシックコース登録済みアカウントが必要です。

1. 下のローダーを、ブックマークの **URL（アドレス）欄**に貼り付けて保存します。

   ```
   javascript:void function(d){var s=d.createElement("script");s.src="https://cdn.jsdelivr.net/gh/Yasukei404/popn-medal@v3/medal-census.js";d.head.appendChild(s)}(document);
   ```

2. e-amusement に**ログインした状態**で、pop'n のプレーデータのページ
   （`https://p.eagate.573.jp/game/popn/popn29/playdata/index.html`）を開きます。
3. 保存したブックマークをクリック。全レベルを走査するため、初回は数分かかります（進捗表示あり）。
4. 2 回目以降はキャッシュ（前回の結果）が即座に表示されます。最新の状態に更新したいときは、表の右下にある「更新」ボタンを押してください。

## 注意

- 開発中のため、正しいメダル数にならない可能性があります。ご了承ください。
- レベル 1〜50 を全走査するため、実行のたびに数百リクエストを送ります。
- 表示されるのはメダルの集計のみで、データを外部に送信することはありません。
- 本ツールはAIを使用して作成しました。使用に際して生じたいかなる損害についても、作者は一切の責任を負いません。自己責任でご利用ください。

