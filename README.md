# パパジム

器具なしの筋トレとストレッチを、毎日ゼロにせず続けるための個人用アプリです（iPhoneのホーム画面に追加して使うWebアプリ）。

- **最低ライン**：1種目だけで「やった日」。**目標ライン**：5〜10分のメニュー
- 連続記録・お休みチケット（毎月2枚、最大3枚）・カード収集・レベル
- 家族の要素（写真つき応援、20歳のときの年齢、家族とのごほうび）。家族側の操作は一切不要
- 月1回の体力チェックと推移グラフ
- データは端末内（IndexedDB）のみ。設定からバックアップを書き出せます

## 開発

```sh
npm install
npm run dev     # http://localhost:5173/papa-gym/
npm test        # ロジックのテスト
npm run build
```

## 公開（GitHub Pages）

リポジトリの Settings → Pages → Source を **GitHub Actions** にすると、`main` への push で自動公開されます。
公開後、iPhoneのSafariで `https://<ユーザー名>.github.io/papa-gym/` を開き、共有ボタンから「ホーム画面に追加」します。

設計書：https://claude.ai/code/artifact/0ac840a4-2a6f-40fd-b6ad-c950f16e7f35
