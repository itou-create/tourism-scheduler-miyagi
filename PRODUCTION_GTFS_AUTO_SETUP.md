# 本番環境でのGTFSデータ自動セットアップ

## 🐛 報告された問題

**症状**: 本番のデプロイされた環境だとぐるりんこが検索結果に出てこない

**原因**: 本番環境（Render）でGTFSデータのダウンロード・インポートが実行されていなかった

---

## ✅ 実装した解決策

### 1. ビルド時の自動ダウンロード・インポート

**`package.json`** (ルート)
```json
{
  "scripts": {
    "build": "cd client && npm ci && npm run build && cd ../server && npm ci && npm run download-gtfs && npm run import-gtfs"
  }
}
```

**変更点**:
- ビルドスクリプトに `npm run download-gtfs && npm run import-gtfs` を追加
- Renderでのデプロイ時に自動的にGTFSデータがダウンロード・インポートされる

### 2. エラーハンドリングの強化

#### A. ダウンロードスクリプト (`server/scripts/downloadGtfs.js`)

**Before**:
```javascript
} catch (error) {
  console.error('予期しないエラーが発生しました:', error);
  process.exit(1); // ❌ ビルド全体が失敗
}
```

**After**:
```javascript
} catch (error) {
  console.error('予期しないエラーが発生しました:', error);
  console.warn('⚠️  警告: GTFSデータのダウンロードをスキップします。');
  process.exit(0); // ✅ ビルドは続行
}
```

**メリット**:
- ダウンロードが失敗してもビルドは成功
- 本番環境でのデプロイが中断されない
- 手動でのリカバリーが可能

#### B. インポートスクリプト (`server/scripts/importGtfs.js`)

同様に、インポート失敗時もビルドを続行するように修正：

```javascript
} catch (error) {
  console.error('❌ Error importing GTFS:', error);
  console.warn('⚠️  警告: GTFSデータのインポートに失敗しました。');
  console.warn('   - GTFSファイルが存在するか確認してください');
  console.warn('   - npm run download-gtfs を先に実行してください');
  process.exit(0); // ビルドは続行
}
```

### 3. render.yamlの簡素化

**Before**:
```yaml
buildCommand: npm install && npm run install-all && npm run build
```

**After**:
```yaml
buildCommand: npm install && npm run build
```

**理由**:
- `npm run install-all` は未定義のスクリプト
- `npm run build` にすべての処理を集約

---

## 📊 動作の流れ

### Renderでのデプロイ時

```
1. npm install (ルートの依存関係をインストール)
   ↓
2. npm run build
   ↓
   2-1. cd client && npm ci && npm run build
        (フロントエンドをビルド)
   ↓
   2-2. cd ../server && npm ci
        (バックエンドの依存関係をインストール)
   ↓
   2-3. npm run download-gtfs
        ✅ 成功: sendai_bus.zip, shichigahama_gururinko.zip をダウンロード
        ❌ 失敗: 警告を出してビルドは続行
   ↓
   2-4. npm run import-gtfs
        ✅ 成功: gtfs.db にデータをインポート
        ❌ 失敗: 警告を出してビルドは続行
   ↓
3. npm start (サーバー起動)
```

---

## 🎯 本番環境での確認手順

### ステップ1: ビルドログを確認

Renderダッシュボード → "Events" タブ → 最新のデプロイログを確認

**成功の場合**:
```
========================================
   GTFSデータ自動ダウンロード
========================================

📥 ダウンロード中: 仙台市営バス
✅ ダウンロード完了: sendai_bus.zip (XX.XX MB)

📥 ダウンロード中: 七ヶ浜町民バス「ぐるりんこ」
✅ ダウンロード完了: shichigahama_gururinko.zip (X.XX MB)

✅ 成功: 2件

📥 Starting GTFS import...
✅ GTFS import completed successfully!
```

**失敗の場合**:
```
❌ すべてのダウンロードが失敗しました
⚠️  警告: GTFSデータがダウンロードできませんでした。手動でダウンロードしてください。

または

❌ Error importing GTFS: ...
⚠️  警告: GTFSデータのインポートに失敗しました。
```

### ステップ2: APIで確認

#### 仙台駅周辺の停留所を検索
```bash
curl "https://your-app.onrender.com/api/gtfs/stops/nearby?lat=38.2606&lon=140.8817&radius=1.0"
```

**期待される結果**:
```json
{
  "success": true,
  "data": [
    {
      "stop_id": "...",
      "stop_name": "仙台駅前",
      "stop_lat": 38.2606,
      "stop_lon": 140.8817
    },
    // ... 多数の停留所
  ]
}
```

#### 七ヶ浜町周辺の停留所を検索
```bash
curl "https://your-app.onrender.com/api/gtfs/stops/nearby?lat=38.2983&lon=141.0606&radius=1.0"
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
    // ... 七ヶ浜町のバス停
  ]
}
```

### ステップ3: フロントエンドで確認

1. `https://your-app.onrender.com` を開く
2. 出発地点のプリセットで「**七ヶ浜町**」を選択
3. テーマで「自然」を選択
4. 「スケジュールを生成」ボタンをクリック
5. 結果に「**ぐるりんこ**」バスが表示されることを確認

---

## 🔧 失敗時の手動リカバリー

ビルド時のダウンロード・インポートが失敗した場合：

### Render Shellで実行

1. **Render Shellを開く**
   - Renderダッシュボード → あなたのサービス → "Shell" タブ

2. **GTFSデータをダウンロード**
   ```bash
   cd server
   npm run download-gtfs
   ```

3. **データベースにインポート**
   ```bash
   npm run import-gtfs
   ```

4. **サーバーを再起動**
   - Renderダッシュボード → "Manual Deploy" → "Clear build cache & deploy"
   - または、自動的に再起動される

---

## 📝 技術的な詳細

### なぜビルド時にダウンロード・インポートを実行するのか

**理由**:
1. **自動化**: 手動実行の手間を省く
2. **一貫性**: 毎回最新のGTFSデータを取得
3. **デプロイの簡素化**: コード変更だけでデプロイ可能

**代替案との比較**:

| 方法 | メリット | デメリット |
|------|----------|------------|
| ビルド時に自動実行 ✅ | 完全自動化、手動作業不要 | ビルド時間が増加 |
| 起動時に自動実行 | ビルドが速い | 起動が遅くなる、複雑 |
| 手動実行 | シンプル、確実 | 毎回手動作業が必要 |

### GTFSデータのサイズ

- **仙台市営バス**: 約10-20 MB
- **七ヶ浜町ぐるりんこ**: 約1-5 MB
- **gtfs.db (インポート後)**: 約50 MB

### Renderの制限

- **Freeプラン**:
  - ビルド時間: 最大15分
  - ストレージ: 永続化されない（再デプロイで消える）
  - メモリ: 512 MB

**注意**: Renderの無料プランでは、ファイルシステムは永続化されません。そのため、再デプロイやサーバー再起動のたびにGTFSデータベースが消える可能性があります。ビルド時に毎回ダウンロード・インポートを実行することで、この問題を回避しています。

---

## ✅ 変更ファイル一覧

1. **`package.json`** (ルート)
   - buildスクリプトにGTFSダウンロード・インポートを追加

2. **`render.yaml`**
   - buildCommandを簡素化

3. **`server/scripts/downloadGtfs.js`**
   - エラー時にビルドを失敗させない

4. **`server/scripts/importGtfs.js`**
   - エラー時にビルドを失敗させない

5. **`CLAUDE.md`**
   - 本番環境での確認手順を追加

6. **`client/src/data/locationPresets.js`**
   - 七ヶ浜町プリセットを追加（既存の変更）

---

## 🎯 期待される動作

### 理想的なケース（ビルド成功）

1. Renderにプッシュ
2. 自動的にビルド開始
3. GTFSデータをダウンロード・インポート
4. サーバー起動
5. **七ヶ浜町のぐるりんこバスが検索結果に表示される** ✅

### ダウンロード失敗のケース

1. Renderにプッシュ
2. 自動的にビルド開始
3. GTFSダウンロード失敗（ネットワークエラーなど）
4. 警告を出してビルド続行
5. サーバー起動（ダミーデータモード）
6. **手動でRender Shellから実行** 🔧
7. サーバー再起動
8. **七ヶ浜町のぐるりんこバスが検索結果に表示される** ✅

---

## ✅ 完了確認

- [x] package.jsonにGTFSダウンロード・インポートを追加
- [x] downloadGtfs.jsのエラーハンドリングを強化
- [x] importGtfs.jsのエラーハンドリングを強化
- [x] render.yamlを簡素化
- [x] CLAUDE.mdに確認手順を追加
- [x] ドキュメント作成
- [ ] Renderにデプロイして動作確認（ユーザー実施）

---

以上の修正により、本番環境でもGTFSデータが自動的にセットアップされ、七ヶ浜町のぐるりんこバスが検索結果に表示されるようになります。
