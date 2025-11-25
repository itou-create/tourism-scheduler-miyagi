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
  } catch (error) {
    console.error('❌ Error importing GTFS:', error);
    process.exit(1);
  }
}

runImport();
