# CKAN APIトークンの設定

## 📋 概要

七ヶ浜町民バス「ぐるりんこ」のGTFSデータは、公共交通オープンデータセンター（CKAN ODPT）から取得しています。このデータのダウンロードには**CKAN APIトークン**が必要です。

---

## 🔑 APIトークンの取得方法

### 1. アカウント作成

https://developer-tokyochallenge.odpt.org/ にアクセスして、アカウントを作成します。

### 2. APIトークンの取得

ログイン後、プロフィールページからAPIトークンを取得できます。

**提供されたトークン**:
```
名称: Challenge2025DefaultApplication
トークン: e6lvmepjlan4h8g6xs03tmrrk7wtz6ws7r8zm592bsut4ii1n6wujzzxv26fb56o
```

---

## ⚙️ 環境変数の設定

### ローカル環境

`server/.env` ファイルを作成して、以下を追加：

```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
GTFS_DB_PATH=./gtfs_data
CKAN_API_TOKEN=e6lvmepjlan4h8g6xs03tmrrk7wtz6ws7r8zm592bsut4ii1n6wujzzxv26fb56o
```

**注意**: `.env`ファイルは`.gitignore`に含まれているため、Gitにコミットされません。

### 本番環境（Render）

`render.yaml` に環境変数を追加済み：

```yaml
envVars:
  - key: NODE_ENV
    value: production
  - key: PORT
    value: 10000
  - key: CKAN_API_TOKEN
    value: e6lvmepjlan4h8g6xs03tmrrk7wtz6ws7r8zm592bsut4ii1n6wujzzxv26fb56o
```

または、Renderダッシュボードから手動で設定：
1. Renderダッシュボード → あなたのサービス
2. "Environment" タブ
3. "Add Environment Variable" をクリック
4. Key: `CKAN_API_TOKEN`
5. Value: `e6lvmepjlan4h8g6xs03tmrrk7wtz6ws7r8zm592bsut4ii1n6wujzzxv26fb56o`

---

## 🔧 ダウンロードスクリプトの実装

### コード変更

**`server/scripts/downloadGtfs.js`**

```javascript
// GTFSデータソース
const GTFS_SOURCES = [
  {
    name: '仙台市営バス',
    url: '...',
    filename: 'sendai_bus.zip',
    requiresAuth: false  // 認証不要
  },
  {
    name: '七ヶ浜町民バス「ぐるりんこ」',
    url: '...',
    filename: 'shichigahama_gururinko.zip',
    requiresAuth: true  // 認証必要
  }
];

async function downloadGtfsFile(source) {
  // ヘッダーを設定
  const headers = {
    'User-Agent': 'Mozilla/5.0 ...'
  };

  // CKAN APIアクセストークンを追加
  if (source.requiresAuth && process.env.CKAN_API_TOKEN) {
    headers['X-CKAN-API-Key'] = process.env.CKAN_API_TOKEN;
    console.log(`   🔑 Using CKAN API token`);
  }

  const response = await fetch(source.url, { headers });
  // ...
}
```

---

## 📊 動作の流れ

### ローカル環境

```
1. server/.env ファイルにCKAN_API_TOKENを設定
   ↓
2. npm run download-gtfs を実行
   ↓
3. 仙台市営バス: 認証なしでダウンロード
   七ヶ浜町ぐるりんこ: 環境変数からトークンを取得してダウンロード
   ↓
4. ✅ 両方のZIPファイルがダウンロードされる
   ↓
5. npm run import-gtfs でデータベースにインポート
```

### 本番環境（Render）

```
1. render.yaml または Renderダッシュボードで環境変数を設定
   ↓
2. GitHubにプッシュ → 自動デプロイ
   ↓
3. ビルド時に npm run build が実行される
   → npm run download-gtfs が実行される
   → 環境変数からCKAN_API_TOKENを取得
   ↓
4. ✅ 七ヶ浜町のデータがダウンロードされる
   ↓
5. npm run import-gtfs でデータベースにインポート
```

---

## ✅ 動作確認

### ローカル環境で確認

```bash
cd server
npm run download-gtfs
```

**成功の場合**:
```
📥 ダウンロード中: 七ヶ浜町民バス「ぐるりんこ」
   URL: https://ckan.odpt.org/...
   🔑 Using CKAN API token
✅ ダウンロード完了: shichigahama_gururinko.zip (X.XX MB)
```

**失敗の場合**（トークンがない）:
```
📥 ダウンロード中: 七ヶ浜町民バス「ぐるりんこ」
   URL: https://ckan.odpt.org/...
❌ ダウンロード失敗: 七ヶ浜町民バス「ぐるりんこ」
   エラー: HTTP 403: Forbidden
```

### 本番環境で確認

デプロイ後、ビルドログを確認：
```
📥 ダウンロード中: 七ヶ浜町民バス「ぐるりんこ」
   🔑 Using CKAN API token
✅ ダウンロード完了: shichigahama_gururinko.zip (X.XX MB)
```

---

## 🔒 セキュリティに関する注意

### 重要な注意事項

1. **APIトークンは秘密情報です**
   - Gitにコミットしないこと
   - 公開リポジトリに含めないこと
   - `.env`ファイルは`.gitignore`に含まれている

2. **render.yamlのトークンについて**
   - 現在はrender.yamlにトークンを直接記載しています
   - より安全な方法：Renderダッシュボードで環境変数を設定（render.yamlから削除）

3. **トークンの再発行**
   - トークンが漏洩した場合は、すぐに再発行してください
   - 開発者サイトで古いトークンを無効化できます

### より安全な設定方法（推奨）

**render.yamlからトークンを削除**:
```yaml
envVars:
  - key: NODE_ENV
    value: production
  - key: PORT
    value: 10000
  # CKAN_API_TOKEN はRenderダッシュボードで設定
```

**Renderダッシュボードで設定**:
1. Environment タブ → Add Environment Variable
2. Key: `CKAN_API_TOKEN`
3. Value: トークンを入力
4. "Secret" にチェック（暗号化される）

---

## 🎯 トラブルシューティング

### ダウンロードが403エラーで失敗する

**原因**: APIトークンが設定されていない、または無効

**解決策**:
1. `.env`ファイルに`CKAN_API_TOKEN`が設定されているか確認
2. トークンが正しいか確認
3. トークンが有効期限内か確認

### 環境変数が読み込まれない

**原因**: dotenvが正しく読み込まれていない

**解決策**:
1. `server/.env`ファイルが存在するか確認
2. サーバーを再起動

---

## ✅ 変更ファイル一覧

1. **server/scripts/downloadGtfs.js**
   - CKAN APIトークンのサポートを追加
   - `requiresAuth`フラグを追加

2. **server/.env.example**
   - 環境変数の例を追加

3. **server/.env**
   - CKAN_API_TOKENを設定（Gitに含まれない）

4. **render.yaml**
   - 本番環境用の環境変数を追加

---

以上の設定により、七ヶ浜町のGTFSデータが正しくダウンロードできるようになります。
