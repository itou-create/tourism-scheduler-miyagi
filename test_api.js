// API テストスクリプト - 取得データを見やすく表示
import fetch from 'node-fetch';

const testScheduleGeneration = async () => {
  console.log('=== スケジュール生成APIテスト ===\n');

  const requestData = {
    location: { lat: 38.2606, lon: 140.8817 },
    theme: '歴史',
    startTime: '09:00',
    visitDuration: 60,
    maxSpots: 5,
    preferences: { scenicPriority: 3 }
  };

  console.log('📤 送信データ:');
  console.log(JSON.stringify(requestData, null, 2));
  console.log('\n--- API呼び出し中... ---\n');

  try {
    const response = await fetch('http://localhost:3001/api/scheduler/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });

    const data = await response.json();

    console.log('📥 受信データ:');
    console.log(JSON.stringify(data, null, 2));

    if (data.success && data.data) {
      console.log('\n=== 取得情報の詳細 ===\n');

      console.log('📊 スケジュール概要:');
      console.log(`  訪問スポット数: ${data.data.summary.totalSpots}`);
      console.log(`  総所要時間: ${data.data.summary.totalDuration}分`);
      console.log(`  開始時刻: ${data.data.summary.startTime}`);
      console.log(`  終了時刻: ${data.data.summary.endTime}`);

      console.log('\n📍 訪問スポット一覧:');
      data.data.schedule.forEach((item, index) => {
        if (item.type === 'visit') {
          console.log(`\n  ${Math.floor(index / 2) + 1}. ${item.spot.name}`);
          console.log(`     住所: ${item.spot.vicinity}`);
          console.log(`     評価: ⭐ ${item.spot.rating}`);
          console.log(`     座標: (${item.spot.lat}, ${item.spot.lon})`);
          console.log(`     到着: ${item.arrivalTime} / 出発: ${item.departureTime}`);
          console.log(`     滞在時間: ${item.duration}分`);
        } else if (item.type === 'transit') {
          console.log(`\n  🚶 移動: ${item.from.name} → ${item.to.name}`);
          console.log(`     方法: ${item.mode === 'walking' ? '徒歩' : '公共交通'}`);
          console.log(`     移動時間: ${item.travelTime}分`);
          console.log(`     待ち時間: ${item.waitTime}分`);
        }
      });
    }
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
};

// 他のAPIエンドポイントもテスト
const testOtherApis = async () => {
  console.log('\n\n=== その他のAPIテスト ===\n');

  // 観光スポット検索
  console.log('1. 観光スポット検索 (テーマ: 歴史)');
  try {
    const response = await fetch('http://localhost:3001/api/spots/search?lat=38.2606&lon=140.8817&theme=歴史&radius=5000');
    const data = await response.json();
    console.log(`   取得スポット数: ${data.data?.length || 0}`);
    if (data.data && data.data.length > 0) {
      console.log('   スポット例:');
      data.data.slice(0, 3).forEach(spot => {
        console.log(`   - ${spot.name} (評価: ${spot.rating})`);
      });
    }
  } catch (error) {
    console.error('   エラー:', error.message);
  }

  // 停留所検索
  console.log('\n2. 近隣停留所検索');
  try {
    const response = await fetch('http://localhost:3001/api/gtfs/stops/nearby?lat=38.2606&lon=140.8817&radius=0.5');
    const data = await response.json();
    console.log(`   取得停留所数: ${data.data?.length || 0}`);
    if (data.data && data.data.length > 0) {
      console.log('   停留所例:');
      data.data.slice(0, 3).forEach(stop => {
        console.log(`   - ${stop.stop_name} (ID: ${stop.stop_id})`);
      });
    }
  } catch (error) {
    console.error('   エラー:', error.message);
  }

  // ルート情報
  console.log('\n3. ルート情報取得');
  try {
    const response = await fetch('http://localhost:3001/api/gtfs/routes');
    const data = await response.json();
    console.log(`   取得ルート数: ${data.data?.length || 0}`);
    if (data.data && data.data.length > 0) {
      console.log('   ルート例:');
      data.data.forEach(route => {
        console.log(`   - ${route.route_long_name} (番号: ${route.route_short_name})`);
      });
    }
  } catch (error) {
    console.error('   エラー:', error.message);
  }
};

// メイン実行
(async () => {
  await testScheduleGeneration();
  await testOtherApis();
  console.log('\n=== テスト完了 ===\n');
})();
