# GTFSデータ確認ガイド

## ✅ 問題解決状況

### 1. 施設が1つしか取得できない問題 → **解決済み**

**修正内容:**
- `server/services/placesService.js` の `getDummySpots()` メソッドを修正
- typeによるフィルタリング機能を追加
- 重複除去のプロパティ名を修正（place_id → id）

**結果:**
- 修正前: 1施設のみ
- 修正後: テーマに応じて複数施設を取得（歴史テーマで4施設）

**取得例（歴史テーマ）:**
1. 瑞鳳殿
2. 仙台城跡（青葉城址）
3. 定禅寺通
4. 大崎八幡宮

---

## 📊 GTFSデータの確認方法

### 方法1: 専用確認ツールの使用（推奨）

```bash
node check_gtfs_data.js
```

**確認できる内容:**
- ✅ ルート情報（バス・電車の路線）
- ✅ 停留所情報（位置、距離）
- ✅ 出発時刻情報
- ✅ スケジュール生成での利用状況
- ✅ 現在のデータソース

### 方法2: 個別APIで確認

#### ルート情報
```bash
curl "http://localhost:3001/api/gtfs/routes"
```

**出力例:**
```json
{
  "success": true,
  "data": [
    {
      "route_id": "1",
      "route_short_name": "1",
      "route_long_name": "循環バス",
      "route_type": 3
    },
    {
      "route_id": "2",
      "route_short_name": "2",
      "route_long_name": "観光路線",
      "route_type": 3
    }
  ]
}
```

#### 停留所情報（仙台駅周辺）
```bash
curl "http://localhost:3001/api/gtfs/stops/nearby?lat=38.2606&lon=140.8817&radius=1.0"
```

**出力例:**
```json
{
  "success": true,
  "data": [
    {
      "stop_id": "sendai_stop_1",
      "stop_name": "仙台駅前",
      "stop_lat": 38.2606,
      "stop_lon": 140.8817
    },
    {
      "stop_id": "sendai_stop_2",
      "stop_name": "青葉通一番町",
      "stop_lat": 38.263,
      "stop_lon": 140.875
    }
  ]
}
```

#### 出発時刻情報
```bash
curl "http://localhost:3001/api/gtfs/departures/sendai_stop_1?afterTime=09:00&limit=5"
```

**出力例:**
```json
{
  "success": true,
  "data": [
    {
      "trip_id": "trip_0",
      "departure_time": "09:15",
      "stop_id": "stop_1"
    },
    {
      "trip_id": "trip_1",
      "departure_time": "09:30",
      "stop_id": "stop_1"
    }
  ]
}
```

---

## 🗂️ 現在のGTFSデータ内容

### ルート（2件）
| 路線ID | 路線名 | 路線番号 | 種別 |
|--------|--------|----------|------|
| 1 | 循環バス | 1 | バス |
| 2 | 観光路線 | 2 | バス |

### 停留所（5件）
| 停留所ID | 停留所名 | 緯度 | 経度 | 備考 |
|----------|----------|------|------|------|
| sendai_stop_1 | 仙台駅前 | 38.2606 | 140.8817 | 仙台駅 |
| sendai_stop_2 | 青葉通一番町 | 38.2630 | 140.8750 | 商店街 |
| sendai_stop_3 | 勾当台公園 | 38.2687 | 140.8720 | 公園前 |
| sendai_stop_4 | 仙台城跡 | 38.2555 | 140.8636 | 観光地 |
| sendai_stop_5 | 博物館・国際センター前 | 38.2520 | 140.8600 | 文化施設 |

### 出発時刻
- **間隔**: 15分ごと
- **時間帯**: 現在時刻以降
- **例**: 09:00以降 → 09:15, 09:30, 09:45...

---

## 🔍 スケジュール生成でのGTFS利用状況

### テスト実行結果

**テストケース:**
- 場所: 仙台駅 (38.2606, 140.8817)
- テーマ: 歴史
- 開始時刻: 09:00
- 訪問スポット数: 3

**生成されたスケジュール:**
1. **瑞鳳殿** (09:00-10:00)
2. 🚶 **徒歩移動** → 仙台城跡 (24分)
3. **仙台城跡（青葉城址）** (10:24-11:24)
4. 🚌 **公共交通** → 定禅寺通 (移動4分、待ち15分)
5. **定禅寺通** (11:43-12:43)

**移動統計:**
- 公共交通機関利用: 1回
- 徒歩移動: 1回

---

## ⚙️ 現在のモード

**状態**: ✅ ダミーデータモード（動作確認用）

### ダミーデータモードの特徴
- 実際のGTFSデータなしで動作テスト可能
- 仙台市の主要観光地と停留所をカバー
- 15分間隔の出発時刻データ
- スケジュール生成の動作確認に最適

### データの場所
```
server/services/gtfsService.js
├── getDummyRoutes()       # 73-78行目
├── getDummyStops()        # 83-91行目
└── getDummyDepartures()   # 94-110行目
```

---

## 🔄 実際のGTFSデータへの切り替え方法

実際の仙台市のGTFSデータを使用する場合：

### ステップ1: GTFSデータの入手
1. 仙台市オープンデータポータルにアクセス
   - https://www.city.sendai.jp/opendata/
2. 「仙台市営バス GTFS-JP」をダウンロード
3. `server/gtfs_data/sendai-bus.zip` に配置

### ステップ2: コードの修正
```bash
# server/services/gtfsService.js を編集
# 1-7行目のコメントを解除
# 18行目を変更: useDummyData = false
```

### ステップ3: データのインポート
```bash
cd server
npm run import-gtfs
```

### ステップ4: サーバー再起動
```bash
npm start
```

詳細は `MIYAGI_SETUP.md` を参照してください。

---

## 📈 データ拡張のポイント

### 1. 停留所の追加
`server/services/gtfsService.js` の `getDummyStops()` に追加

### 2. ルートの追加
`server/services/gtfsService.js` の `getDummyRoutes()` に追加

### 3. 運行時刻のカスタマイズ
`server/services/gtfsService.js` の `getDummyDepartures()` で間隔を変更

---

## 🐛 トラブルシューティング

### GTFSデータが取得できない
```bash
# サーバーが起動しているか確認
curl http://localhost:3001/api/health

# ルート情報を確認
curl http://localhost:3001/api/gtfs/routes
```

### スケジュールで公共交通が使われない
- 停留所が観光スポットから0.5km以内にあるか確認
- 現在時刻以降の出発便があるか確認

### 施設が取得できない
- サーバーを再起動
- ブラウザのキャッシュをクリア
- ブラウザの開発者ツールでネットワークエラーを確認

---

## 📚 関連ドキュメント

- **MIYAGI_SETUP.md**: 実際のGTFSデータ導入手順
- **DATA_INSPECTION_GUIDE.md**: データ確認の完全マニュアル
- **CLAUDE.md**: プロジェクト全体の概要とアーキテクチャ
