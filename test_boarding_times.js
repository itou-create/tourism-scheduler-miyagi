import fetch from 'node-fetch';

async function testScheduleGeneration() {
  try {
    console.log('🧪 Testing schedule generation with boarding/alighting times...\n');

    const requestData = {
      location: {
        lat: 38.2606,
        lon: 140.8817,
        name: '仙台駅'
      },
      theme: '歴史',
      startTime: '09:00',
      visitDuration: 60,
      maxSpots: 3
    };

    console.log('📤 Request:', JSON.stringify(requestData, null, 2));

    const response = await fetch('http://localhost:3001/api/scheduler/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();

    if (!result.success) {
      console.log('❌ Error:', result.error);
      return;
    }

    const { schedule, summary } = result.data;

    console.log('\n📊 Schedule Summary:');
    console.log(`  Total Spots: ${summary.totalSpots}`);
    console.log(`  Duration: ${summary.totalDuration} minutes`);
    console.log(`  Start: ${summary.startTime}`);
    console.log(`  End: ${summary.endTime}\n`);

    console.log('📋 Detailed Schedule:\n');

    schedule.forEach((item, index) => {
      if (item.type === 'visit') {
        console.log(`${index + 1}. 訪問: ${item.spot.name}`);
        console.log(`   到着: ${item.arrivalTime} → 出発: ${item.departureTime}`);
      } else if (item.type === 'transit') {
        console.log(`${index + 1}. 移動: ${item.from.name || '現在地'} → ${item.to.name || '目的地'}`);
        console.log(`   Mode: ${item.mode}`);

        if (item.mode === 'transit') {
          console.log(`   Route: ${item.routeName || 'N/A'} (${item.routeNumber || 'N/A'}番)`);

          if (item.route && item.route.fromStop && item.route.toStop) {
            console.log(`   乗車バス停: ${item.route.fromStop.stop_name}`);
            if (item.boardingTime) {
              console.log(`   🕐 乗車時刻: ${item.boardingTime} ✅`);
            } else {
              console.log('   ⚠️  乗車時刻: なし');
            }

            console.log(`   降車バス停: ${item.route.toStop.stop_name}`);
            if (item.alightingTime) {
              console.log(`   🕐 降車時刻: ${item.alightingTime} ✅`);
            } else {
              console.log('   ⚠️  降車時刻: なし');
            }
          }

          console.log(`   待ち時間: ${item.waitTime}分, 移動時間: ${item.travelTime}分`);
        } else {
          console.log(`   移動時間: ${item.travelTime}分`);
        }
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

testScheduleGeneration();
