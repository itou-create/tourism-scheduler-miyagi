import fetch from 'node-fetch';

async function testScheduleGeneration() {
  try {
    console.log('🧪 Testing schedule generation with user parameters...\n');
    console.log('Parameters:');
    console.log('  出発点: 七ヶ浜町 (38.2983, 141.0606)');
    console.log('  テーマ: 歴史・文化財');
    console.log('  出発時刻: 09:00\n');

    const response = await fetch('http://localhost:3001/api/scheduler/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location: { lat: 38.2983, lon: 141.0606 },
        theme: '歴史',
        startTime: '09:00',
        visitDuration: 60,
        maxSpots: 3
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      console.log('❌ API returned error:', result.error);
      return;
    }

    console.log('✅ Schedule generated successfully!\n');
    console.log('📋 Schedule items:\n');

    result.data.schedule.forEach((item, index) => {
      console.log(`${index + 1}. Type: ${item.type}`);

      if (item.type === 'visit') {
        console.log(`   Spot: ${item.spot.name}`);
        console.log(`   Arrival: ${item.arrivalTime}, Departure: ${item.departureTime}`);
      } else if (item.type === 'transit') {
        console.log(`   From: ${item.from.name}`);
        console.log(`   To: ${item.to.name}`);
        console.log(`   Mode: ${item.mode}`);
        console.log(`   Departure: ${item.departureTime}`);
        console.log(`   Arrival: ${item.arrivalTime}`);

        if (item.mode === 'transit' && item.route) {
          console.log(`   🚌 Route Details:`);
          console.log(`      From Stop: ${item.route.fromStop?.stop_name || 'N/A'}`);
          console.log(`      To Stop: ${item.route.toStop?.stop_name || 'N/A'}`);
          console.log(`      Route Name: ${item.routeName || 'N/A'}`);
          console.log(`      Route Number: ${item.routeNumber || 'N/A'}`);
          console.log(`      Boarding Time: ${item.boardingTime || 'N/A'}`);
          console.log(`      Alighting Time: ${item.alightingTime || 'N/A'}`);
          console.log(`      Wait Time: ${item.waitTime || 0}分`);
          console.log(`      Travel Time: ${item.travelTime || 0}分`);
        }
      }
      console.log('');
    });

    // 特に浦田と生涯学習センターの時刻をチェック
    console.log('\n🔍 Checking for Urata and Lifelong Learning Center times:');
    result.data.schedule.forEach((item, index) => {
      if (item.type === 'transit' && item.route) {
        const fromStop = item.route.fromStop?.stop_name || '';
        const toStop = item.route.toStop?.stop_name || '';

        if (fromStop.includes('浦田') || toStop.includes('浦田') ||
            fromStop.includes('生涯学習センター') || toStop.includes('生涯学習センター')) {
          console.log(`\n⭐ Item ${index + 1}:`);
          console.log(`   From: ${fromStop} → To: ${toStop}`);
          console.log(`   Boarding: ${item.boardingTime}, Alighting: ${item.alightingTime}`);
          console.log(`   (Expected: Urata 11:22, Lifelong Learning Center 11:27)`);
        }
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

testScheduleGeneration();
