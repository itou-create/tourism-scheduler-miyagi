# 七ヶ浜町ぐるりんこバス表示問題の修正

## 🐛 報告された問題

**症状**: 検索結果に七ヶ浜町のぐるりんこバスが出てこない

---

## 🔍 問題の原因

### 1. GTFSファイル名の不一致（修正済み）
- ダウンロードスクリプトとconfig.jsのファイル名を統一しました
- `All_Gururinko-20250225.zip` → `shichigahama_gururinko.zip`

### 2. ローカル環境のGTFSデータが古い可能性
- 古いファイル名のGTFSデータが残っている
- 新しいファイル名でのダウンロード・インポートが必要

### 3. 七ヶ浜町のプリセット位置がなかった（修正済み）
- プリセット選択に七ヶ浜町を追加しました

---

## ✅ 修正内容

### 1. 七ヶ浜町のプリセット位置を追加

**`client/src/data/locationPresets.js`**
```javascript
{
  id: 'shichigahama',
  name: '七ヶ浜町',
  lat: 38.2983,
  lon: 141.0606,
  description: '七ヶ浜町役場周辺（ぐるりんこバス運行エリア）'
}
```

### 2. GTFSファイル名の統一

**`server/utils/config.js`** - 既に修正済み
```javascript
{
  path: join(__dirname, '../gtfs_data/shichigahama_gururinko.zip')
}
```

---

## 🎯 ローカル環境での対応手順（重要）

### ステップ1: 古いGTFSデータを削除

```bash
cd server/gtfs_data

# 古いファイルを削除
rm -f gtfs-jp_sendaicitybus_current_date.zip
rm -f All_Gururinko-20250225.zip

# データベースファイルを削除
rm -f gtfs.db
```

**Windowsの場合**:
```bash
cd server\gtfs_data
del gtfs-jp_sendaicitybus_current_date.zip
del All_Gururinko-20250225.zip
del gtfs.db
```

### ステップ2: GTFSデータを再ダウンロード

```bash
cd server
npm run download-gtfs
```

**実行結果の例**:
```
========================================
   GTFSデータ自動ダウンロード
========================================

📥 ダウンロード中: 仙台市営バス
✅ ダウンロード完了: sendai_bus.zip (X.XX MB)

📥 ダウンロード中: 七ヶ浜町民バス「ぐるりんこ」
✅ ダウンロード完了: shichigahama_gururinko.zip (X.XX MB)

✅ 成功: 2件
   - 仙台市営バス
   - 七ヶ浜町民バス「ぐるりんこ」
```

### ステップ3: データベースにインポート

```bash
npm run import-gtfs
```

**実行結果の例**:
```
📥 Starting GTFS import...
✅ GTFS import completed successfully!
```

### ステップ4: サーバーを再起動

```bash
npm start
```

または開発モード:
```bash
npm run dev
```

### ステップ5: 動作確認

#### A. フロントエンドで確認

1. ブラウザで http://localhost:5173 を開く
2. **出発地点**のプリセットで「七ヶ浜町」を選択
3. **テーマ**で「自然」または「文化」を選択
4. **スケジュールを生成**ボタンをクリック
5. 結果に「ぐるりんこ」バスが表示されることを確認

#### B. APIで直接確認

**七ヶ浜町周辺の停留所を検索**:
```bash
curl "http://localhost:3001/api/gtfs/stops/nearby?lat=38.2983&lon=141.0606&radius=1.0"
```

**期待される結果**:
```json
{
  "success": true,
  "data": [
    {
      "stop_id": "...",
      "stop_name": "七ヶ浜町役場前",
      "stop_lat": 38.2983,
      "stop_lon": 141.0606
    },
    // ... その他の七ヶ浜町のバス停
  ]
}
```

**スケジュール生成をテスト**:
```bash
curl -X POST http://localhost:3001/api/scheduler/generate \
  -H "Content-Type: application/json" \
  -d '{
    "location": {"lat": 38.2983, "lon": 141.0606},
    "theme": "自然",
    "startTime": "09:00",
    "visitDuration": 60,
    "maxSpots": 3
  }'
```

---

## 📊 七ヶ浜町の観光スポット（既に登録済み）

以下のスポットが既に`server/services/placesService.js`に登録されています：

1. **七ヶ浜国際村** (lat: 38.3080, lon: 141.0580)
   - テーマ: 文化
   - 評価: 4.2

2. **菖蒲田浜海水浴場** (lat: 38.2980, lon: 141.0650)
   - テーマ: 自然
   - 評価: 4.3

3. **花渕浜** (lat: 38.3050, lon: 141.0600)
   - テーマ: 自然
   - 評価: 4.1

4. **君ヶ岡公園** (lat: 38.3020, lon: 141.0520)
   - テーマ: 自然
   - 評価: 4.0

5. **七ヶ浜町歴史資料館** (lat: 38.3070, lon: 141.0540)
   - テーマ: 歴史
   - 評価: 3.8

---

## 🔧 技術的な詳細

### 検索範囲

**`server/services/optimizerService.js`**
```javascript
// 出発地・目的地の近隣停留所を1.0km範囲で検索
const fromStops = await gtfsService.findNearbyStops(from.lat, from.lon, 1.0);
const toStops = await gtfsService.findNearbyStops(to.lat, to.lon, 1.0);
```

1.0km（1000m）の範囲で停留所を検索するため、観光スポットから1km以内にぐるりんこのバス停があれば検出されます。

### 仙台駅から七ヶ浜町までの距離

```javascript
仙台駅: 38.2606, 140.8817
七ヶ浜町役場: 38.2983, 141.0606

直線距離: 約 18km
```

そのため、**仙台駅を出発地に設定しても七ヶ浜町のバスは表示されません**。

七ヶ浜町のバスを使用するには：
1. **出発地を七ヶ浜町に設定**
2. または仙台駅から七ヶ浜町への移動（仙台市営バス）+ 七ヶ浜町内での移動（ぐるりんこ）の組み合わせ

---

## 📝 本番環境での対応（Render）

本番環境でも同じ手順が必要です：

### Render Shellで実行

```bash
cd server

# GTFSデータをダウンロード
npm run download-gtfs

# データベースにインポート
npm run import-gtfs
```

サーバーが自動的に再起動され、七ヶ浜町のバスデータが利用可能になります。

---

## ✅ 動作確認チェックリスト

### ローカル環境

- [ ] 古いGTFSファイルを削除（`All_Gururinko-20250225.zip`など）
- [ ] gtfs.dbファイルを削除
- [ ] `npm run download-gtfs` を実行
- [ ] `shichigahama_gururinko.zip` がダウンロードされた
- [ ] `sendai_bus.zip` がダウンロードされた
- [ ] `npm run import-gtfs` を実行
- [ ] サーバーを再起動
- [ ] API で七ヶ浜町周辺の停留所が検索できる
- [ ] フロントエンドで「七ヶ浜町」プリセットが選択できる
- [ ] スケジュール生成で「ぐるりんこ」バスが表示される

### 本番環境（Render）

- [ ] Render Shellで `npm run download-gtfs` を実行
- [ ] Render Shellで `npm run import-gtfs` を実行
- [ ] サーバーが再起動された
- [ ] 本番URLでAPIテスト実施
- [ ] フロントエンドで「七ヶ浜町」プリセットが選択できる
- [ ] スケジュール生成で「ぐるりんこ」バスが表示される

---

## 🎯 重要なポイント

### 1. 出発地の設定が重要

七ヶ浜町のぐるりんこバスを使用するには：
- **出発地を七ヶ浜町に設定**してください
- 仙台駅から検索しても、七ヶ浜町は遠すぎて表示されません

### 2. テーマの選択

七ヶ浜町の観光スポットは以下のテーマで検索できます：
- **自然**: 菖蒲田浜海水浴場、花渕浜、君ヶ岡公園
- **文化**: 七ヶ浜国際村
- **歴史**: 七ヶ浜町歴史資料館

### 3. データのインポートは必須

- ローカル・本番ともに、`npm run download-gtfs` と `npm run import-gtfs` を実行しないと七ヶ浜町のデータは利用できません
- 古いファイル名のデータが残っている場合は削除してください

---

## ✅ 完了確認

- [x] 七ヶ浜町のプリセット位置を追加
- [x] GTFSファイル名を統一
- [x] ドキュメント作成（再ダウンロード・インポート手順）
- [ ] ローカル環境でGTFSデータを再ダウンロード・インポート（ユーザー実施）
- [ ] 本番環境でGTFSデータをダウンロード・インポート（ユーザー実施）

---

以上の手順を実行すれば、七ヶ浜町のぐるりんこバスが正しく表示されるようになります。

**次の作業**: ローカル環境で上記のステップ1〜5を実行してください。
