# 宮城県GTFSデータセットアップガイド

## 前提条件
オープンデータチャレンジで使用可能な宮城県内の公共交通GTFSデータを使用します。

## ステップ1: GTFSデータのダウンロード

### 推奨データソース

#### オプション1: 仙台市営バス・地下鉄（推奨）
1. 仙台市オープンデータポータルにアクセス
   - https://www.city.sendai.jp/opendata/

2. 以下のデータセットを検索してダウンロード：
   - 「仙台市営バス GTFS-JP」
   - 「仙台市営地下鉄 GTFS-JP」

3. ダウンロード後、以下のいずれかの場所に配置：
   ```
   server/gtfs_data/sendai-bus.zip
   server/gtfs_data/sendai-subway.zip
   ```

#### オプション2: 公共交通オープンデータセンター
1. https://www.odpt.org/ にアクセス
2. 開発者登録を行い、APIキーを取得
3. 宮城県のデータセットをダウンロード

### ダウンロード方法（コマンドライン）

仙台市のオープンデータが直接ダウンロード可能な場合：
```bash
# サーバーディレクトリに移動
cd server

# GTFSデータ保存用ディレクトリを作成
mkdir -p gtfs_data

# GTFSデータをダウンロード（URLは実際のものに置き換え）
# 例: 仙台市営バス
curl -o gtfs_data/sendai-bus.zip "https://www.city.sendai.jp/opendata/gtfs/bus.zip"

# 例: 仙台市営地下鉄
curl -o gtfs_data/sendai-subway.zip "https://www.city.sendai.jp/opendata/gtfs/subway.zip"
```

## ステップ2: 環境変数の設定

`.env`ファイルを編集：
```bash
notepad .env
```

以下の内容に更新：
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Google Places API（オプション）
GOOGLE_PLACES_API_KEY=

# GTFS Data Configuration - 宮城県（仙台市）
# ローカルファイルを使用する場合
GTFS_DATA_PATH=./gtfs_data/sendai-bus.zip

# または、直接URLからダウンロードする場合
GTFS_DATA_URL=https://www.city.sendai.jp/opendata/gtfs/bus.zip

GTFS_DB_PATH=./gtfs_data

# CORS Settings
CORS_ORIGIN=http://localhost:5173
```

## ステップ3: GTFSインポート設定の調整

`server/utils/config.js`を宮城県用に更新：
```javascript
export const gtfsConfig = {
  agencies: [
    {
      // 仙台市営バス
      url: process.env.GTFS_DATA_URL || './gtfs_data/sendai-bus.zip',
      exclude: []
    }
    // 複数データソースを使用する場合
    // {
    //   // 仙台市営地下鉄
    //   url: './gtfs_data/sendai-subway.zip',
    // }
  ],
  sqlitePath: join(__dirname, '../', config.gtfsDbPath),
  verbose: config.nodeEnv === 'development'
};
```

## ステップ4: フロントエンドのデフォルト位置を仙台に変更

`client/src/App.jsx`を編集：
```javascript
// 35行目付近
const [selectedLocation, setSelectedLocation] = useState({
  lat: 38.2606,  // 仙台駅の緯度
  lon: 140.8817  // 仙台駅の経度
}); // デフォルト: 仙台
```

## ステップ5: GTFSサービスを実データ使用に切り替え

`server/services/gtfsService.js`の修正が必要です。
詳細は次のステップで実施します。

## ステップ6: GTFSデータのインポート

```bash
# サーバーディレクトリに移動
cd server

# GTFSデータをデータベースにインポート
npm run import-gtfs
```

**出力例**：
```
📥 Starting GTFS import...
Downloading GTFS from ./gtfs_data/sendai-bus.zip
Importing agency.txt...
Importing routes.txt... (15 routes)
Importing stops.txt... (1,234 stops)
Importing trips.txt... (3,456 trips)
Importing stop_times.txt... (45,678 stop times)
✅ GTFS import completed successfully!
```

## ステップ7: サーバーの再起動

```bash
# 古いサーバープロセスを停止
pkill -f "node server.js"

# 新しいサーバーを起動
npm start
```

## ステップ8: 動作確認

### API確認
```bash
# 仙台駅周辺の停留所を検索
curl "http://localhost:3001/api/gtfs/stops/nearby?lat=38.2606&lon=140.8817&radius=0.5"

# ルート一覧を取得
curl "http://localhost:3001/api/gtfs/routes"
```

### ブラウザで確認
1. http://localhost:5173 にアクセス
2. 地図が仙台駅周辺を中心に表示される
3. テーマを選択して「スケジュールを生成」をクリック
4. 仙台市内の観光スポットと公共交通ルートが表示される

## 仙台市内の観光スポット例

テスト用に以下のエリアを試してみてください：

- **仙台駅周辺**: 緯度 38.2606, 経度 140.8817
- **青葉城址（仙台城跡）**: 緯度 38.2555, 経度 140.8636
- **勾当台公園**: 緯度 38.2687, 経度 140.8720
- **仙台市博物館**: 緯度 38.2526, 経度 140.8608
- **瑞鳳殿**: 緯度 38.2495, 経度 140.8797

## トラブルシューティング

### エラー: "GTFS file not found"
```bash
# ファイルの存在確認
ls -l server/gtfs_data/

# ファイルが存在しない場合は再ダウンロード
```

### エラー: "Invalid GTFS format"
- ダウンロードしたzipファイルを展開して中身を確認
- 必須ファイル（agency.txt, routes.txt, stops.txt等）が含まれているか確認

### データが表示されない
```bash
# データベースの確認
ls -l server/gtfs_data/*.db

# データベースが作成されていない場合は再インポート
rm -f server/gtfs_data/*.db
npm run import-gtfs
```

## 注意事項

1. **データ更新**: GTFSデータは定期的に更新されるため、最新版を使用してください
2. **ライセンス**: 各データソースのライセンス条項を確認し、オープンデータチャレンジの規約に従ってください
3. **容量**: GTFSデータのインポートには数分〜10分程度かかる場合があります

## 次のステップ

1. 実際のGTFSデータを使用してスケジュール生成をテスト
2. Google Places APIを設定して実際の観光スポットデータを取得
3. 景観ルート情報の追加
4. オープンデータチャレンジ向けの機能拡張
