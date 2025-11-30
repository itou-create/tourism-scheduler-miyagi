# 仙台市オープンデータ統合

## 📋 概要

観光スポット情報を、仙台市が公開するオープンデータ（CSV形式）から取得するように改善しました。これにより、信頼性の高い公式データに基づいた観光情報を提供できます。

**データソース**: [仙台市オープンデータポータル - 観光施設等一覧](https://www.city.sendai.jp/kankokikaku/opendata/kankoshisetsu.html)

---

## 🎯 実装内容

### 1. 新しいサービスの追加: `sendaiOpenDataService.js`

仙台市の観光施設オープンデータ（CSV）を読み込み、管理するサービスを実装しました。

**機能**:
- サーバー起動時に自動的にCSVデータをダウンロード・パース
- Shift-JISエンコーディングに対応
- 97件の観光施設情報を取得
- テーマ別・位置別フィルタリング
- 既知の観光スポットには正確な座標を適用

**ファイル**: `server/services/sendaiOpenDataService.js`

### 2. 既存サービスの統合: `placesService.js`

観光スポット検索の優先順位を変更しました：

**検索優先順位**:
1. **仙台市オープンデータ**（最優先）
2. Google Places API（APIキーがある場合）
3. ダミーデータ（フォールバック）

これにより、公式データを優先的に使用し、データがない場合のみ他の手段を使用します。

### 3. サーバー起動時の自動初期化

サーバー起動時に自動的にオープンデータを読み込むように変更しました。

**ファイル**: `server/server.js`

```javascript
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);

  // 仙台市オープンデータを初期化
  await sendaiOpenDataService.initialize();
  console.log('✅ サーバーの初期化が完了しました');
});
```

---

## 📊 データ詳細

### CSVデータ構造

仙台市のCSVファイルには以下のカラムが含まれています：

```
- 名称
- 名称_カナ
- 名称_英語
- 所在地_連結表記
- 緯度（※データは空）
- 経度（※データは空）
- 説明
- 説明_英語
- アクセス方法
- URL
... 他57カラム
```

### 位置情報の取得方法

CSVファイルには緯度・経度のカラムは存在しますが、**データが空**です。
そのため、以下の2段階で座標を取得しています：

#### 1. 既知の場所から検索

主要な観光スポット（仙台城跡、瑞鳳殿、大崎八幡宮など）については、
正確な座標をマッピングしています（約40箇所）。

```javascript
this.knownLocations = {
  '仙台城跡': { lat: 38.2555, lon: 140.8636 },
  '瑞鳳殿': { lat: 38.2495, lon: 140.8797 },
  '大崎八幡宮': { lat: 38.2780, lon: 140.8520 },
  // ... 他37箇所
};
```

#### 2. 住所から推定

既知の場所にない場合、住所情報から区や地名を解析して、
おおよその座標を推定します。

```javascript
// 例: 「宮城県仙台市青葉区川内1」 → 青葉区の中心座標
```

---

## 🚀 動作確認

### サーバー起動ログ

```
🚀 Server is running on port 3001
📍 Health check: http://localhost:3001/api/health

🔄 仙台市オープンデータを初期化中...
📥 仙台市オープンデータ（観光施設）を読み込み中...
📊 CSVレコード数: 97
📋 CSVカラム: [...57カラム...]
✅ 観光施設データを読み込みました（97件）
✅ サーバーの初期化が完了しました
```

### APIレスポンス例

```bash
curl "http://localhost:3001/api/spots/search?lat=38.2606&lon=140.8817&theme=歴史&radius=5"
```

**レスポンス**:
```json
{
  "success": true,
  "data": [
    {
      "id": "sendai_open_瑞鳳殿",
      "name": "瑞鳳殿",
      "lat": 38.2495,
      "lon": 140.8797,
      "address": "",
      "description": "1637年に建立された伊達政宗公の霊屋...",
      "type": "観光施設",
      "source": "仙台市オープンデータ",
      "types": ["tourist_attraction"],
      "theme": "歴史",
      "rating": 4
    },
    // ... 52件のスポット
  ]
}
```

**ログ出力**:
```
✅ 仙台市オープンデータから52件のスポットを取得
```

---

## 🔧 技術的な詳細

### エンコーディング処理

仙台市のCSVファイルはShift-JISエンコーディングのため、
`iconv-lite`ライブラリを使用して変換しています。

```javascript
import iconv from 'iconv-lite';

// バイナリデータとして取得
const buffer = await response.buffer();

// Shift-JIS -> UTF-8 に変換
const csvText = iconv.decode(buffer, 'Shift_JIS');
```

### CSVパース

`csv-parse`ライブラリを使用して、柔軟にパースしています。

```javascript
import { parse } from 'csv-parse/sync';

const records = parse(csvText, {
  columns: true,  // 最初の行をヘッダーとして使用
  skip_empty_lines: true,
  trim: true,
  relax_column_count: true  // カラム数の不一致を許容
});
```

### テーマ推定ロジック

観光スポットのテーマは、名称や説明文から自動的に推定しています。

```javascript
inferTheme(name, type) {
  const text = (name || '') + ' ' + (type || '');

  if (text.match(/神社|寺|宮|城|史跡|文化財/)) return '歴史';
  if (text.match(/公園|庭園|森林|海|山|自然/)) return '自然';
  if (text.match(/市場|朝市|レストラン|グルメ/)) return 'グルメ';
  // ... 他のテーマ
}
```

---

## 📝 変更ファイル一覧

### 新規作成
1. **`server/services/sendaiOpenDataService.js`** (約400行)
   - 仙台市オープンデータの読み込み・管理

### 修正
2. **`server/services/placesService.js`**
   - オープンデータを優先的に使用するように変更
   - `searchSpotsByTheme()`メソッドの優先順位変更

3. **`server/server.js`**
   - サーバー起動時にオープンデータを初期化

4. **`SENDAI_OPENDATA_INTEGRATION.md`** (このファイル)
   - 実装内容のドキュメント

---

## ✅ メリット

### 1. 信頼性の向上
- 仙台市の公式データを使用
- 定期的に更新されるデータソース
- クリエイティブ・コモンズライセンス（CC BY 2.1）

### 2. データの豊富さ
- 97件の観光施設情報
- 詳細な説明文（日本語・英語）
- アクセス情報、駐車場情報、バリアフリー情報など

### 3. コスト削減
- Google Places APIの使用量を削減
- 無料で利用可能な公式データ

### 4. オフライン対応
- サーバー起動時に一度ダウンロード
- キャッシュされたデータを使用

---

## 🔍 今後の改善点

### 1. 緯度・経度データの改善

**現状**: CSVファイルには緯度・経度が含まれていない

**改善案**:
- **Geocoding APIの統合**: Google Maps Geocoding APIやOpenStreetMap Nominatimを使用して、住所から正確な座標を取得
- **既知の場所の拡充**: 主要な観光スポットの座標マッピングを増やす

### 2. データの定期更新

**現状**: サーバー起動時に1度だけダウンロード

**改善案**:
- 定期的にCSVを再ダウンロード（1日1回など）
- キャッシュの有効期限を設定

### 3. エラーハンドリングの強化

**現状**: ダウンロード失敗時はダミーデータを使用

**改善案**:
- リトライ機構の実装
- ダウンロード失敗時のログ記録
- ユーザーへの通知

### 4. 他の自治体のオープンデータ統合

**現状**: 仙台市のみ

**拡張案**:
- 塩釜市、七ヶ浜町、松島町などのオープンデータも統合
- 宮城県全域の観光情報を網羅

---

## 📚 関連リンク

- [仙台市オープンデータポータル](https://www.city.sendai.jp/joho-kikaku/shise/security/kokai/dataportal.html)
- [観光施設等一覧（CSV）](https://www.city.sendai.jp/kankokikaku/opendata/kankoshisetsu.html)
- [宮城県及び市町村共同オープンデータポータル](https://miyagi.dataeye.jp/)
- [クリエイティブ・コモンズ・ライセンス CC BY 2.1](https://creativecommons.org/licenses/by/2.1/jp/)

---

以上で、仙台市のオープンデータ統合が完了しました。信頼性の高い公式データに基づいた観光情報の提供が可能になりました。
