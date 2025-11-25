# セットアップガイド

## 現在の状態

アプリケーションは**既に起動中**です：
- バックエンドサーバー: http://localhost:3001
- フロントエンドアプリ: http://localhost:5173

## アプリケーションの使用方法

### 1. Webアプリケーションにアクセス

ブラウザで以下のURLを開いてください：
```
http://localhost:5173
```

### 2. 周遊スケジュールの生成手順

1. **出発地点の設定**
   - 地図をクリックして出発地点を選択
   - または、デフォルトの東京（緯度: 35.6812, 経度: 139.7671）を使用

2. **条件の設定**
   - **テーマ**: 歴史・文化財、自然・公園、グルメなどから選択
   - **出発時刻**: 周遊開始時刻を指定
   - **滞在時間**: 各スポットでの滞在時間（分）
   - **訪問スポット数**: 2〜10箇所で指定
   - **景観優先度**: スライダーで0（効率重視）〜5（景観重視）を設定

3. **スケジュール生成**
   - 「スケジュールを生成」ボタンをクリック
   - 数秒で最適化された周遊ルートが表示されます

4. **結果の確認**
   - **地図**: 訪問スポットとルートが表示されます
   - **タイムライン**: 訪問順序と移動時間を視覚的に確認
   - **詳細スケジュール**: 各スポットの到着・出発時刻、移動手段、待ち時間などの詳細情報

## 主な機能

### 実装済み機能
- テーマ別観光スポット検索（ダミーデータ使用）
- 待ち時間を最小化する周遊ルート最適化
- インタラクティブな地図表示（Leaflet使用）
- タイムラインビュー
- 詳細スケジュール表示
- レスポンシブデザイン

### 今後の拡張
現在は**デモ用ダミーデータ**を使用していますが、以下のように拡張可能です：

1. **実際のGTFSデータの使用**
   - `.env`ファイルに`GTFS_DATA_URL`を設定
   - `npm run import-gtfs`でデータをインポート
   - `server/services/gtfsService.js`のコメントアウト部分を有効化

2. **Google Places APIの統合**
   - `.env`ファイルに`GOOGLE_PLACES_API_KEY`を設定
   - 実際の観光スポット情報を取得

## サーバーの起動・停止

### サーバーの停止
現在実行中のバックグラウンドプロセスを停止するには：
```bash
# プロセスの確認
/tasks

# 停止したいプロセスのIDを指定（例）
pkill -f "node server.js"
pkill -f "vite"
```

### サーバーの再起動

#### バックエンド
```bash
cd server
npm start
```

#### フロントエンド
```bash
cd client
npm run dev
```

## APIエンドポイント

### スケジュール生成
```bash
POST http://localhost:3001/api/scheduler/generate
Content-Type: application/json

{
  "location": { "lat": 35.6812, "lon": 139.7671 },
  "theme": "歴史",
  "startTime": "09:00",
  "visitDuration": 60,
  "maxSpots": 5
}
```

### 観光スポット検索
```bash
GET http://localhost:3001/api/spots/search?lat=35.6812&lon=139.7671&theme=歴史&radius=5000
```

### ヘルスチェック
```bash
GET http://localhost:3001/api/health
```

## トラブルシューティング

### ポートが既に使用されている
別のアプリケーションがポート3001または5173を使用している場合：
- `.env`ファイルで`PORT`を変更（バックエンド）
- `vite.config.js`で`server.port`を変更（フロントエンド）

### 地図が表示されない
- ブラウザのコンソールでエラーを確認
- Leaflet CSSが正しく読み込まれているか確認

### APIエラー
- バックエンドサーバーが起動しているか確認: `curl http://localhost:3001/api/health`
- CORSエラーの場合、`.env`の`CORS_ORIGIN`を確認

## プロジェクト構造

```
claude-test/
├── client/                 # React フロントエンド
│   ├── src/
│   │   ├── components/    # UIコンポーネント
│   │   ├── services/      # API通信
│   │   └── App.jsx        # メインアプリ
│   └── package.json
├── server/                 # Node.js バックエンド
│   ├── routes/            # APIルート
│   ├── services/          # ビジネスロジック
│   ├── utils/             # ユーティリティ
│   └── server.js          # サーバーエントリポイント
├── .env                    # 環境変数
└── README.md              # プロジェクト説明
```

## 開発のヒント

### コンポーネントの編集
- フロントエンド: `client/src/components/`以下のファイルを編集
- 変更は自動的にホットリロードされます

### APIの追加
1. `server/routes/`に新しいルートファイルを作成
2. `server/server.js`でルートを登録
3. 必要に応じて`server/services/`にロジックを追加

### スタイリング
- Tailwind CSSを使用
- カスタムスタイル: `client/src/index.css`

## 次のステップ

1. 実際のGTFSデータを取得してインポート
2. Google Places APIキーを取得して実データを使用
3. ユーザー認証機能の追加
4. お気に入りルートの保存機能
5. ソーシャルシェア機能

---

**問題が発生した場合は、GitHub Issuesで報告してください。**
