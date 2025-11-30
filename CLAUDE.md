# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

宮城県（仙台市）のオープンデータを活用した観光周遊スケジュール自動生成Webアプリケーション。GTFSデータと観光スポット情報を組み合わせて、待ち時間を最小化する最適な周遊ルートを生成する。オープンデータチャレンジ向けプロジェクト。

**技術スタック**:
- フロントエンド: React (Vite) + Leaflet + Tailwind CSS
- バックエンド: Node.js + Express
- データ処理: GTFS (node-gtfs)、Google Places API（オプション）

## 開発コマンド

### 初回セットアップ
```bash
# バックエンド依存関係のインストール
cd server
npm install

# フロントエンド依存関係のインストール
cd ../client
npm install

# 環境変数ファイルの作成
cp .env.example .env
```

### サーバー起動
```bash
# バックエンド（ポート3001）
cd server
npm start          # 本番モード
npm run dev        # 開発モード（nodemon使用）

# フロントエンド（ポート5173）
cd client
npm run dev        # 開発サーバー起動
npm run build      # 本番ビルド
npm run preview    # ビルド結果のプレビュー
```

### GTFSデータのダウンロードとインポート
```bash
# 方法1: 自動ダウンロード（推奨）
cd server
npm run download-gtfs    # GTFSデータを自動ダウンロード
npm run import-gtfs      # データベースにインポート

# 方法2: 手動で配置する場合
# 1. server/gtfs_data/ ディレクトリに以下のファイルを配置:
#    - sendai_bus.zip (仙台市営バス)
#    - shichigahama_gururinko.zip (七ヶ浜町ぐるりんこ)
# 2. npm run import-gtfs を実行

# GTFSデータの確認
node ../check_gtfs_data.js
```

### APIテスト
```bash
# ヘルスチェック
curl http://localhost:3001/api/health

# 仙台駅周辺の停留所検索
curl "http://localhost:3001/api/gtfs/stops/nearby?lat=38.2606&lon=140.8817&radius=0.5"

# スケジュール生成
curl -X POST http://localhost:3001/api/scheduler/generate \
  -H "Content-Type: application/json" \
  -d '{"location":{"lat":38.2606,"lon":140.8817},"theme":"歴史","startTime":"09:00","visitDuration":60,"maxSpots":3}'
```

## アーキテクチャ概要

### バックエンド構造
```
server/
├── server.js                    # Expressサーバーエントリポイント
├── routes/                      # APIルート定義
│   ├── scheduler.js            # スケジュール生成エンドポイント
│   ├── gtfs.js                 # GTFS関連エンドポイント
│   └── spots.js                # 観光スポット検索エンドポイント
├── services/                    # ビジネスロジック層
│   ├── gtfsService.js          # GTFS処理（停留所検索、ルート検索等）
│   ├── optimizerService.js     # 周遊ルート最適化（貪欲法ベース）
│   └── placesService.js        # 観光スポット取得（Google Places API統合）
├── utils/
│   └── config.js               # 環境変数と設定管理
└── scripts/
    ├── downloadGtfs.js         # GTFSデータ自動ダウンロードスクリプト
    └── importGtfs.js           # GTFSデータインポートスクリプト
```

### フロントエンド構造
```
client/src/
├── App.jsx                      # メインアプリケーションコンポーネント
├── components/
│   ├── SearchForm.jsx          # 検索条件入力フォーム
│   ├── Map.jsx                 # Leaflet地図コンポーネント
│   ├── ScheduleView.jsx        # スケジュール表示（概要と詳細）
│   └── Timeline.jsx            # タイムライン表示
└── services/
    └── api.js                  # バックエンドAPI通信
```

### データフロー
1. **ユーザー入力**: SearchForm → App.jsx（状態管理）
2. **API呼び出し**: `api.generateSchedule()` → `/api/scheduler/generate`
3. **バックエンド処理**:
   - `schedulerRoutes` → `placesService`（観光スポット検索）
   - `optimizerService.generateSchedule()`（ルート最適化）
   - `gtfsService`（公共交通情報取得）
4. **レスポンス**: `{ schedule: [...], summary: {...} }`
5. **UI更新**: ScheduleView（リスト表示）+ Map（地図上にマーカー・ルート表示）

### 周遊スケジュール最適化ロジック（optimizerService.js）
- **アルゴリズム**: 貪欲法（Greedy Algorithm）
- **目的**: 待ち時間と移動時間の合計を最小化
- **処理フロー**:
  1. 各観光スポットの近隣停留所を検索（0.5km以内）
  2. 停留所間の接続ルートを確認
  3. 現在時刻以降の次の出発便を取得
  4. 待ち時間+移動時間が最小となるルートを選択
  5. 公共交通が利用できない場合は徒歩ルートを生成（時速4km想定）
  6. **出発地への帰路を自動生成**（`startLocation`パラメータ使用時）

### 主要機能
- **バス路線名表示**: 実際のGTFSデータからバス路線名と路線番号を取得して表示（`ScheduleView.jsx`）
- **出発地への帰路**: 最終観光スポットから出発地点までの帰路を自動で追加（`isReturn`フラグで識別）
- **実際のバス時刻表**: 仙台市営バスと七ヶ浜町ぐるりんこの実際の時刻表を使用

## 重要な設定

### 環境変数（.env）
```env
PORT=3001                              # バックエンドポート
NODE_ENV=development                   # 環境（development/production）
GOOGLE_PLACES_API_KEY=                 # Google Places APIキー（オプション）
GTFS_DATA_URL=                         # GTFSデータのURL
GTFS_DB_PATH=./gtfs_data              # GTFSデータベース保存先
CORS_ORIGIN=http://localhost:5173     # CORS許可オリジン
```

### デフォルト設定（宮城県仙台市）
- **地図中心**: 仙台駅（緯度 38.2606, 経度 140.8817）- `client/src/App.jsx:11-14`
- **ダミー観光スポット**: 仙台城跡、勾当台公園、仙台朝市など - `server/services/placesService.js:120-205`
- **ダミー停留所**: 仙台駅前、青葉通一番町など - `server/services/gtfsService.js:83-91`

### GTFS統合モード
現在は**実データモード**で動作（`gtfsService.js:11 useDummyData = false`）

**統合済みGTFSデータ**:
- 仙台市営バス（335路線、2,147停留所）
- 七ヶ浜町民バス「ぐるりんこ」（8路線、154停留所）

**データソース**:
- 仙台市営バス: 宮城県オープンデータポータル
- 七ヶ浜町ぐるりんこ: 公共交通オープンデータセンター (ckan.odpt.org)

**設定ファイル**: `server/utils/config.js:19-32`
- GTFSファイルパス指定
- SQLiteデータベースパス: `server/gtfs_data/gtfs.db`
- `ignoreDuplicates: true` で重複データを許可

## API仕様

### POST /api/scheduler/generate
周遊スケジュールを生成

**リクエスト**:
```json
{
  "location": { "lat": 38.2606, "lon": 140.8817 },
  "theme": "歴史",
  "startTime": "09:00",
  "visitDuration": 60,
  "maxSpots": 5,
  "preferences": { "scenicPriority": 3 }
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "schedule": [
      { "type": "visit", "spot": {...}, "arrivalTime": "09:00", "departureTime": "10:00" },
      { "type": "transit", "from": {...}, "to": {...}, "mode": "walking", "travelTime": 15 }
    ],
    "summary": { "totalSpots": 5, "totalDuration": 360, "startTime": "09:00", "endTime": "15:00" }
  }
}
```

### GET /api/spots/search
観光スポット検索（テーマ別）

**パラメータ**: `lat`, `lon`, `theme`, `radius`

### GET /api/gtfs/stops/nearby
近隣の停留所検索

**パラメータ**: `lat`, `lon`, `radius`

## 開発時の注意事項

### サーバーポート競合
- ポート3001が既に使用されている場合、`.env`の`PORT`を変更
- Windowsでは `taskkill /F /IM node.exe` でNode.jsプロセスを強制終了可能

### 地図表示トラブル
- Leaflet CSSが`index.html`で正しく読み込まれているか確認
- マーカーアイコンの画像パス問題は`client/src/components/Map.jsx:9-15`で対処済み

### API呼び出しエラー
- バックエンドが起動しているか確認: `curl http://localhost:3001/api/health`
- Viteのプロキシ設定: `client/vite.config.js:7-12`で`/api`を`http://localhost:3001`に転送

### データ更新
- 観光スポットやGTFSデータを変更した場合、サーバー再起動が必要
- GTFSデータ再インポート:
  ```bash
  cd server
  rm -f gtfs_data/gtfs.db
  npm run import-gtfs
  ```
- GTFSデータの確認: `node check_gtfs_data.js`（ルート数、停留所数、時刻表を確認）

## Renderへのデプロイ

### デプロイ手順

1. **GitHubリポジトリにプッシュ**
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push origin master
   ```

2. **Renderでプロジェクトを作成**
   - https://render.com にアクセス
   - "New" → "Web Service" を選択
   - GitHubリポジトリを接続: `itou-create/tourism-scheduler-miyagi`

3. **デプロイ設定（render.yamlで自動設定）**
   - **Name**: tourism-scheduler-miyagi
   - **Region**: Oregon (US West)
   - **Branch**: master
   - **Build Command**: `npm install && npm run install-all && npm run build`
   - **Start Command**: `npm start`

4. **環境変数の設定**
   Renderのダッシュボードで以下を設定：
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (Renderが自動設定)
   - `CORS_ORIGIN` = 本番URLまたは `*`

5. **GTFSデータのダウンロードとインポート**
   デプロイ後、Render Shellで実行：
   ```bash
   cd server
   npm run download-gtfs    # GTFSデータをダウンロード
   npm run import-gtfs      # データベースにインポート
   ```

   **重要**: 両方のコマンドを実行してください。download-gtfsを実行しないと、七ヶ浜町のバスデータがインポートされません。

### デプロイ後の確認

- **ヘルスチェック**: `https://your-app.onrender.com/api/health`
- **アプリケーション**: `https://your-app.onrender.com`

### 注意事項

- Freeプランでは15分間アクセスがないとスリープ状態になります
- 初回アクセス時は起動に時間がかかる場合があります
- GTFSデータベース（約50MB）はGitに含まれていないため、デプロイ後に手動インポートが必要

## 拡張ポイント

1. ✅ **実際のGTFSデータ統合**: 仙台市営バスと七ヶ浜町ぐるりんこのデータを統合済み
2. ✅ **道路に沿ったルート表示**: OSRM APIを使用した実際の道路ネットワークに基づくルート表示
3. ✅ **バス乗り換え対応**: 主要ハブ経由の1回乗り換えルート検索
4. **Google Places API**: 実際の観光スポット情報を取得（現在はダミーデータ）
5. **最適化アルゴリズム強化**: 遺伝的アルゴリズムやA*探索の導入
6. **景観ルート評価**: 地形データや景観ポイントデータベースとの連携
7. **ユーザー認証・保存機能**: お気に入りルートの保存
8. **時刻表データの改善**: 出発時刻の取得ロジックを改善して、より多くのバス便を表示
