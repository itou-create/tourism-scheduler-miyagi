// GTFSデータ確認スクリプト
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

console.log('========================================');
console.log('   GTFSデータ確認ツール');
console.log('========================================\n');

// 1. ルート情報の取得
async function checkRoutes() {
  console.log('📍 1. ルート情報（バス・電車の路線）');
  console.log('----------------------------------------');

  try {
    const response = await fetch(`${API_BASE}/gtfs/routes`);
    const data = await response.json();

    if (data.success && data.data) {
      console.log(`✅ 取得ルート数: ${data.data.length}件\n`);

      data.data.forEach((route, index) => {
        console.log(`[${index + 1}] ${route.route_long_name}`);
        console.log(`    路線番号: ${route.route_short_name}`);
        console.log(`    ルートID: ${route.route_id}`);
        console.log(`    種別: ${getRouteTypeName(route.route_type)}`);
        console.log('');
      });
    } else {
      console.log('❌ ルート情報の取得に失敗しました\n');
    }
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

// 2. 停留所情報の取得
async function checkStops() {
  console.log('📍 2. 停留所情報（仙台駅周辺）');
  console.log('----------------------------------------');

  try {
    const response = await fetch(`${API_BASE}/gtfs/stops/nearby?lat=38.2606&lon=140.8817&radius=1.0`);
    const data = await response.json();

    if (data.success && data.data) {
      console.log(`✅ 取得停留所数: ${data.data.length}件\n`);

      data.data.forEach((stop, index) => {
        console.log(`[${index + 1}] ${stop.stop_name}`);
        console.log(`    停留所ID: ${stop.stop_id}`);
        console.log(`    座標: (${stop.stop_lat}, ${stop.stop_lon})`);

        // 仙台駅からの距離を計算
        const distance = calculateDistance(38.2606, 140.8817, stop.stop_lat, stop.stop_lon);
        console.log(`    仙台駅からの距離: ${distance.toFixed(2)}km`);
        console.log('');
      });
    } else {
      console.log('❌ 停留所情報の取得に失敗しました\n');
    }
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

// 3. 出発時刻情報の取得
async function checkDepartures() {
  console.log('📍 3. 出発時刻情報（仙台駅前から9:00以降）');
  console.log('----------------------------------------');

  try {
    const response = await fetch(`${API_BASE}/gtfs/departures/sendai_stop_1?afterTime=09:00&limit=10`);
    const data = await response.json();

    if (data.success && data.data) {
      console.log(`✅ 取得出発便数: ${data.data.length}件\n`);

      data.data.forEach((departure, index) => {
        console.log(`[${index + 1}] 出発時刻: ${departure.departure_time}`);
        console.log(`    便ID: ${departure.trip_id}`);
        console.log(`    停留所ID: ${departure.stop_id}`);
        console.log('');
      });
    } else {
      console.log('❌ 出発時刻情報の取得に失敗しました\n');
    }
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

// 4. スケジュール生成での使用状況
async function checkScheduleUsage() {
  console.log('📍 4. スケジュール生成でのGTFS利用状況');
  console.log('----------------------------------------');

  try {
    const response = await fetch(`${API_BASE}/scheduler/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: { lat: 38.2606, lon: 140.8817 },
        theme: '歴史',
        startTime: '09:00',
        visitDuration: 60,
        maxSpots: 3
      })
    });

    const data = await response.json();

    if (data.success && data.data) {
      console.log('✅ スケジュール生成成功\n');

      let transitCount = 0;
      let walkingCount = 0;

      data.data.schedule.forEach((item) => {
        if (item.type === 'transit') {
          if (item.mode === 'walking') {
            walkingCount++;
            console.log(`🚶 徒歩移動: ${item.from.name} → ${item.to.name}`);
            console.log(`   移動時間: ${item.travelTime}分`);
            console.log(`   距離: ${item.distance ? item.distance.toFixed(2) + 'km' : '不明'}`);
          } else {
            transitCount++;
            console.log(`🚌 公共交通: ${item.from.name} → ${item.to.name}`);
            console.log(`   移動時間: ${item.travelTime}分`);
            console.log(`   待ち時間: ${item.waitTime}分`);
          }
          console.log('');
        }
      });

      console.log(`📊 移動統計:`);
      console.log(`   公共交通機関利用: ${transitCount}回`);
      console.log(`   徒歩移動: ${walkingCount}回`);
      console.log('');

      if (transitCount === 0 && walkingCount > 0) {
        console.log('⚠️  現在はすべて徒歩移動になっています');
        console.log('   理由: GTFSダミーデータモードで動作中');
        console.log('   実際のGTFSデータを使用すると公共交通機関のルートが生成されます');
      }
    } else {
      console.log('❌ スケジュール生成に失敗しました\n');
    }
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

// 5. GTFSデータソースの確認
function checkDataSource() {
  console.log('\n📍 5. 現在のデータソース');
  console.log('----------------------------------------');
  console.log('ℹ️  現在の状態: ダミーデータモード');
  console.log('');
  console.log('📁 データの場所:');
  console.log('   ルート: server/services/gtfsService.js:73-78');
  console.log('   停留所: server/services/gtfsService.js:83-91');
  console.log('   出発時刻: server/services/gtfsService.js:94-110');
  console.log('');
  console.log('🔄 実際のGTFSデータを使用する方法:');
  console.log('   1. 仙台市オープンデータポータルからGTFSデータをダウンロード');
  console.log('   2. server/gtfs_data/ に配置');
  console.log('   3. server/services/gtfsService.js のコメントを解除');
  console.log('   4. npm run import-gtfs を実行');
  console.log('   詳細は MIYAGI_SETUP.md を参照');
  console.log('');
}

// ユーティリティ関数
function getRouteTypeName(type) {
  const types = {
    0: '路面電車',
    1: '地下鉄',
    2: '鉄道',
    3: 'バス',
    4: 'フェリー',
    5: 'ケーブルカー',
    6: 'ゴンドラ',
    7: 'ケーブルカー'
  };
  return types[type] || `不明(${type})`;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 地球の半径（km）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// メイン実行
(async () => {
  try {
    await checkRoutes();
    await checkStops();
    await checkDepartures();
    await checkScheduleUsage();
    checkDataSource();

    console.log('========================================');
    console.log('   確認完了');
    console.log('========================================');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
})();
