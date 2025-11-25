# データ確認ガイド

このガイドでは、アプリケーションが取得・処理しているデータを確認する方法を説明します。

## 方法1: ブラウザ開発者ツール（最も簡単）

### ステップ1: 開発者ツールを開く
1. ブラウザで http://localhost:5173 を開く
2. `F12` キーを押す（または右クリック → 「検証」）

### ステップ2: ネットワークタブで通信を監視
1. **「Network（ネットワーク）」タブを選択**
2. **「Fetch/XHR」でフィルタ**（API通信のみ表示）
3. **スケジュール生成ボタンをクリック**
4. **`generate` リクエストをクリック**

確認できる情報：
- **Headers**: リクエストURL、メソッド（POST）
- **Payload**: 送信データ
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
- **Preview/Response**: サーバーからの返信データ
  ```json
  {
    "success": true,
    "data": {
      "schedule": [...],
      "summary": {...}
    }
  }
  ```

### ステップ3: コンソールでログを確認
**「Console（コンソール）」タブ**で以下を確認：
- エラーメッセージ
- 警告
- APIレスポンスのログ（実装次第）

## 方法2: テストスクリプトの実行（詳細確認）

プロジェクトルートで以下を実行：

```bash
node test_api.js
```

### 出力例：
```
=== スケジュール生成APIテスト ===

📤 送信データ:
{
  "location": { "lat": 38.2606, "lon": 140.8817 },
  "theme": "歴史",
  "startTime": "09:00",
  "visitDuration": 60,
  "maxSpots": 5
}

📥 受信データ:
{
  "success": true,
  "data": {
    "schedule": [
      {
        "type": "visit",
        "spot": {
          "id": "sendai_1",
          "name": "仙台城跡（青葉城址）",
          "lat": 38.2555,
          "lon": 140.8636,
          "rating": 4.5,
          "vicinity": "青葉区川内1"
        },
        "arrivalTime": "09:00",
        "departureTime": "10:00",
        "duration": 60
      }
    ],
    "summary": {
      "totalSpots": 1,
      "totalDuration": 60,
      "startTime": "09:00",
      "endTime": "10:00"
    }
  }
}
```

## 方法3: curlコマンドで直接APIを呼び出し

### スケジュール生成
```bash
curl -X POST http://localhost:3001/api/scheduler/generate \
  -H "Content-Type: application/json" \
  -d '{"location":{"lat":38.2606,"lon":140.8817},"theme":"歴史","startTime":"09:00","visitDuration":60,"maxSpots":5}'
```

### 観光スポット検索
```bash
curl "http://localhost:3001/api/spots/search?lat=38.2606&lon=140.8817&theme=歴史&radius=5000"
```

### 近隣停留所検索
```bash
curl "http://localhost:3001/api/gtfs/stops/nearby?lat=38.2606&lon=140.8817&radius=0.5"
```

### ルート情報取得
```bash
curl "http://localhost:3001/api/gtfs/routes"
```

## 取得データの詳細

### 1. スケジュールデータ構造

```json
{
  "success": true,
  "data": {
    "schedule": [
      {
        "type": "visit",           // 訪問
        "spot": {
          "id": "sendai_1",
          "name": "仙台城跡（青葉城址）",
          "lat": 38.2555,
          "lon": 140.8636,
          "rating": 4.5,
          "types": ["museum", "tourist_attraction"],
          "vicinity": "青葉区川内1",
          "theme": "歴史"
        },
        "arrivalTime": "09:00",
        "departureTime": "10:00",
        "duration": 60
      },
      {
        "type": "transit",         // 移動
        "from": {...},             // 出発地
        "to": {...},               // 目的地
        "mode": "walking",         // 移動手段（walking/transit）
        "departureTime": "10:00",
        "arrivalTime": "10:15",
        "waitTime": 0,             // 待ち時間（分）
        "travelTime": 15,          // 移動時間（分）
        "totalTime": 15,
        "distance": 1.2,           // 距離（km）
        "scenicScore": 2.5         // 景観スコア
      }
    ],
    "summary": {
      "totalSpots": 5,             // 訪問スポット数
      "totalDuration": 360,        // 総所要時間（分）
      "startTime": "09:00",
      "endTime": "15:00"
    }
  }
}
```

### 2. 観光スポットデータ

```json
{
  "success": true,
  "data": [
    {
      "id": "sendai_1",
      "name": "仙台城跡（青葉城址）",
      "lat": 38.2555,
      "lon": 140.8636,
      "rating": 4.5,
      "types": ["museum", "tourist_attraction"],
      "vicinity": "青葉区川内1",
      "theme": "歴史"
    }
  ]
}
```

### 3. 停留所データ

```json
{
  "success": true,
  "data": [
    {
      "stop_id": "sendai_stop_1",
      "stop_name": "仙台駅前",
      "stop_lat": 38.2606,
      "stop_lon": 140.8817
    }
  ]
}
```

### 4. ルートデータ

```json
{
  "success": true,
  "data": [
    {
      "route_id": "1",
      "route_short_name": "1",
      "route_long_name": "循環バス",
      "route_type": 3              // 3 = バス
    }
  ]
}
```

## 現在のダミーデータ

### 観光スポット（仙台市）
1. **仙台城跡（青葉城址）** - 歴史
   - 座標: (38.2555, 140.8636)
   - 評価: 4.5

2. **勾当台公園** - 自然
   - 座標: (38.2687, 140.8720)
   - 評価: 4.2

3. **仙台朝市** - グルメ
   - 座標: (38.2595, 140.8798)
   - 評価: 4.3

4. **仙台市博物館** - 文化
   - 座標: (38.2526, 140.8608)
   - 評価: 4.4

5. **瑞鳳殿** - 歴史
   - 座標: (38.2495, 140.8797)
   - 評価: 4.6

6. **定禅寺通** - 景観
   - 座標: (38.2670, 140.8700)
   - 評価: 4.5

7. **大崎八幡宮** - 歴史
   - 座標: (38.2780, 140.8520)
   - 評価: 4.5

8. **牛たん通り** - グルメ
   - 座標: (38.2608, 140.8825)
   - 評価: 4.7

### 停留所（仙台市）
1. 仙台駅前 - (38.2606, 140.8817)
2. 青葉通一番町 - (38.2630, 140.8750)
3. 勾当台公園 - (38.2687, 140.8720)
4. 仙台城跡 - (38.2555, 140.8636)
5. 博物館・国際センター前 - (38.2520, 140.8600)

## データソースの場所

### バックエンド
- **観光スポット**: `server/services/placesService.js:120-205`
- **停留所**: `server/services/gtfsService.js:83-91`
- **ルート**: `server/services/gtfsService.js:73-78`
- **最適化ロジック**: `server/services/optimizerService.js:16-101`

### フロントエンド
- **API通信**: `client/src/services/api.js`
- **状態管理**: `client/src/App.jsx:8-14`
- **地図表示**: `client/src/components/Map.jsx`

## デバッグのヒント

### APIが失敗する場合
1. バックエンドが起動しているか確認
   ```bash
   curl http://localhost:3001/api/health
   ```

2. ブラウザコンソールでエラーを確認

3. サーバーログを確認（ターミナル）

### データが表示されない場合
1. ネットワークタブでレスポンスを確認
2. `success: false` の場合、エラーメッセージを確認
3. データ構造が期待通りか確認

### テーマで検索してもスポットが見つからない場合
- `placesService.js`のダミーデータを確認
- テーマの文字列が正確か確認（「歴史」「自然」「グルメ」など）
