import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * GTFSデータ自動ダウンロードスクリプト
 * 仙台市営バスと七ヶ浜町ぐるりんこのGTFSデータをダウンロード
 */

// ダウンロード先ディレクトリ
const GTFS_DIR = path.join(__dirname, '..', 'gtfs_data');

// GTFSデータソース
const GTFS_SOURCES = [
  {
    name: '仙台市営バス',
    id: 'sendai_bus',
    // 宮城県オープンデータポータルのURL（最新版を取得）
    url: 'https://miyagi.dataeye.jp/dataset/e1e43e08-3b8f-49db-87d3-70802b0b77bb/resource/aa69fe64-b32a-4e85-a9e1-14e18f3ffa2e/download/sendai_bus.zip',
    filename: 'sendai_bus.zip'
  },
  {
    name: '七ヶ浜町民バス「ぐるりんこ」',
    id: 'shichigahama_gururinko',
    // CKAN ODPT のリソースURL
    url: 'https://ckan.odpt.org/dataset/e58f6e8a-d1fb-4f5a-b336-bb97e0490e19/resource/e58f6e8a-d1fb-4f5a-b336-bb97e0490e19/download/shichigahama_town_all_gururinko.zip',
    filename: 'shichigahama_gururinko.zip'
  }
];

/**
 * ディレクトリが存在しない場合は作成
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 ディレクトリを作成: ${dirPath}`);
  }
}

/**
 * GTFSデータをダウンロード
 */
async function downloadGtfsFile(source) {
  const filePath = path.join(GTFS_DIR, source.filename);

  console.log(`\n📥 ダウンロード中: ${source.name}`);
  console.log(`   URL: ${source.url}`);

  try {
    const response = await fetch(source.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // ファイルに保存
    const fileStream = createWriteStream(filePath);
    await pipeline(response.body, fileStream);

    // ファイルサイズを確認
    const stats = fs.statSync(filePath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`✅ ダウンロード完了: ${source.filename} (${fileSizeMB} MB)`);
    return { success: true, source, filePath };
  } catch (error) {
    console.error(`❌ ダウンロード失敗: ${source.name}`);
    console.error(`   エラー: ${error.message}`);
    return { success: false, source, error: error.message };
  }
}

/**
 * すべてのGTFSデータをダウンロード
 */
async function downloadAllGtfsData() {
  console.log('========================================');
  console.log('   GTFSデータ自動ダウンロード');
  console.log('========================================\n');

  // ディレクトリを作成
  ensureDirectoryExists(GTFS_DIR);

  const results = [];

  // 各データソースをダウンロード
  for (const source of GTFS_SOURCES) {
    const result = await downloadGtfsFile(source);
    results.push(result);
  }

  // 結果サマリー
  console.log('\n========================================');
  console.log('   ダウンロード結果');
  console.log('========================================\n');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ 成功: ${successful.length}件`);
  successful.forEach(r => {
    console.log(`   - ${r.source.name}`);
  });

  if (failed.length > 0) {
    console.log(`\n❌ 失敗: ${failed.length}件`);
    failed.forEach(r => {
      console.log(`   - ${r.source.name}: ${r.error}`);
    });
  }

  console.log('\n========================================');

  if (successful.length > 0) {
    console.log('\n💡 次のステップ:');
    console.log('   1. npm run import-gtfs を実行してデータをインポート');
    console.log('   2. サーバーを再起動\n');
  }

  return results;
}

// メイン実行
(async () => {
  try {
    await downloadAllGtfsData();
  } catch (error) {
    console.error('予期しないエラーが発生しました:', error);
    process.exit(1);
  }
})();
