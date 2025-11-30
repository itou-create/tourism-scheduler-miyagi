import { importGtfs } from 'gtfs';
import { gtfsConfig } from '../utils/config.js';

/**
 * GTFSデータをインポートするスクリプト
 * 使用方法: npm run import-gtfs
 */
async function runImport() {
  console.log('📥 Starting GTFS import...');
  console.log('Config:', JSON.stringify(gtfsConfig, null, 2));

  try {
    await importGtfs(gtfsConfig);
    console.log('✅ GTFS import completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing GTFS:', error);
    console.warn('⚠️  警告: GTFSデータのインポートに失敗しました。');
    console.warn('   - GTFSファイルが存在するか確認してください');
    console.warn('   - npm run download-gtfs を先に実行してください');
    // ビルドは失敗させずに警告のみ
    process.exit(0);
  }
}

runImport();
