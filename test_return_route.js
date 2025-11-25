// 出発地への帰路とルート名表示のテスト
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

console.log('========================================');
console.log('   出発地への帰路テスト');
console.log('========================================\n');

async function testReturnRoute() {
  try {
    const requestData = {
      location: { lat: 38.2606, lon: 140.8817 },
      theme: '歴史',
      startTime: '09:00',
      visitDuration: 45,
      maxSpots: 3,
      preferences: { scenicPriority: 3 }
    };

    console.log('📤 送信データ:');
    console.log(`  出発地: (${requestData.location.lat}, ${requestData.location.lon})`);
    console.log(`  テーマ: ${requestData.theme}`);
    console.log(`  開始時刻: ${requestData.startTime}`);
    console.log(`  訪問スポット数: ${requestData.maxSpots}\n`);

    const response = await fetch(`${API_BASE}/scheduler/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });

    const data = await response.json();

    if (data.success && data.data) {
      console.log('✅ スケジュール生成成功\n');
      console.log('📊 スケジュール概要:');
      console.log(`  訪問スポット数: ${data.data.summary.totalSpots}`);
      console.log(`  総所要時間: ${data.data.summary.totalDuration}分`);
      console.log(`  開始時刻: ${data.data.summary.startTime}`);
      console.log(`  終了時刻: ${data.data.summary.endTime}`);
      console.log(`  出発地への帰路: ${data.data.summary.includesReturn ? 'あり ✅' : 'なし'}\n`);

      console.log('📍 詳細スケジュール:\n');

      data.data.schedule.forEach((item, index) => {
        if (item.type === 'visit') {
          const visitNumber = Math.floor(index / 2) + 1;
          console.log(`【${visitNumber}】 ${item.spot.name}`);
          console.log(`     住所: ${item.spot.vicinity}`);
          console.log(`     評価: ⭐ ${item.spot.rating}`);
          console.log(`     到着: ${item.arrivalTime} / 出発: ${item.departureTime}`);
          console.log(`     滞在時間: ${item.duration}分\n`);
        } else if (item.type === 'transit') {
          const isReturn = item.isReturn || false;
          const modeIcon = item.mode === 'walking' ? '🚶' : '🚌';

          if (isReturn) {
            console.log(`🔙 【出発地点へ帰る】`);
          } else {
            console.log(`${modeIcon} 【移動】`);
          }

          if (item.mode === 'transit') {
            // バス・公共交通の場合
            console.log(`     乗車: ${item.routeName || '路線'}${item.routeNumber ? ` (${item.routeNumber}番)` : ''}`);
            console.log(`     出発: ${item.departureTime}`);
            console.log(`     到着: ${item.arrivalTime}`);
            console.log(`     移動時間: ${item.travelTime}分`);
            console.log(`     待ち時間: ${item.waitTime}分`);
          } else {
            // 徒歩の場合
            console.log(`     出発: ${item.departureTime}`);
            console.log(`     到着: ${item.arrivalTime}`);
            console.log(`     移動時間: ${item.travelTime}分`);
            if (item.distance) {
              console.log(`     距離: ${item.distance.toFixed(2)}km`);
            }
          }

          console.log('');
        }
      });

      // 統計情報
      let transitCount = 0;
      let walkingCount = 0;
      let returnCount = 0;
      const routesUsed = new Set();

      data.data.schedule.forEach((item) => {
        if (item.type === 'transit') {
          if (item.isReturn) {
            returnCount++;
          }
          if (item.mode === 'walking') {
            walkingCount++;
          } else {
            transitCount++;
            if (item.routeName) {
              routesUsed.add(`${item.routeName} (${item.routeNumber}番)`);
            }
          }
        }
      });

      console.log('📊 移動統計:');
      console.log(`  公共交通機関利用: ${transitCount}回`);
      console.log(`  徒歩移動: ${walkingCount}回`);
      console.log(`  出発地への帰路: ${returnCount}回\n`);

      if (routesUsed.size > 0) {
        console.log('🚌 使用したバス路線:');
        routesUsed.forEach(route => {
          console.log(`  - ${route}`);
        });
      }

      console.log('');

      // 改善の確認
      console.log('✨ 改善ポイント:');
      if (data.data.summary.includesReturn) {
        console.log('  ✅ 出発地点に戻るルートが追加されました');
      }
      if (routesUsed.size > 0) {
        console.log('  ✅ バス路線名が表示されています');
      }
      console.log('');

    } else {
      console.log('❌ スケジュール生成に失敗しました');
      console.log(data);
    }
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  }
}

// メイン実行
(async () => {
  await testReturnRoute();
  console.log('========================================');
  console.log('   テスト完了');
  console.log('========================================');
})();
