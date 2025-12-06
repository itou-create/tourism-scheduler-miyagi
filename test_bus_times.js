import fetch from 'node-fetch';

async function testSchedule() {
  console.log('🧪 Testing bus boarding/alighting times...\n');

  const requestBody = {
    location: { lat: 38.2606, lon: 140.8817 },  // 仙台駅
    theme: '歴史',
    startTime: '09:00',
    visitDuration: 60,
    maxSpots: 3
  };

  console.log('📍 Request:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch('http://localhost:3001/api/scheduler/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (data.success) {
      console.log('\n✅ Schedule generated successfully\n');
      console.log('📊 Summary:', data.data.summary);
      console.log('\n📋 Schedule details:\n');

      data.data.schedule.forEach((item, index) => {
        if (item.type === 'transit') {
          console.log(`${index}. 🚌 TRANSIT (${item.mode})`);

          if (item.mode === 'bus') {
            console.log(`   From: ${item.from?.spot?.name || '出発地'}`);
            console.log(`   To: ${item.to?.spot?.name || '目的地'}`);
            console.log(`   ⏰ Departure Time: ${item.departureTime || 'N/A'}`);
            console.log(`   ⏰ Arrival Time: ${item.arrivalTime || 'N/A'}`);
            console.log(`   🚏 From Stop: ${item.route?.fromStop?.stop_name || 'N/A'}`);
            console.log(`   🚏 To Stop: ${item.route?.toStop?.stop_name || 'N/A'}`);
            console.log(`   🚌 Route: ${item.routeName || 'N/A'} (${item.routeNumber || 'N/A'})`);
            console.log(`   ⏱️ Travel Time: ${item.travelTime || 'N/A'} min`);
            console.log(`   ⏱️ Wait Time: ${item.waitTime || 'N/A'} min`);
          } else {
            console.log(`   Mode: ${item.mode}`);
            console.log(`   Travel Time: ${item.travelTime || 'N/A'} min`);
          }
          console.log('');
        } else if (item.type === 'visit') {
          console.log(`${index}. 📍 VISIT: ${item.spot?.name}`);
          console.log(`   ⏰ Arrival: ${item.arrivalTime}`);
          console.log(`   ⏰ Departure: ${item.departureTime}`);
          console.log(`   Duration: ${item.duration} min\n`);
        }
      });

      // バス移動だけを抽出して詳細表示
      const busTransits = data.data.schedule.filter(item =>
        item.type === 'transit' && item.mode === 'bus'
      );

      if (busTransits.length > 0) {
        console.log('\n🔍 Bus transits analysis:\n');
        busTransits.forEach((transit, i) => {
          console.log(`Bus Transit #${i + 1}:`);
          console.log(`  Departure: ${transit.departureTime}`);
          console.log(`  Arrival: ${transit.arrivalTime}`);
          console.log(`  From Stop: ${transit.route?.fromStop?.stop_name}`);
          console.log(`  To Stop: ${transit.route?.toStop?.stop_name}`);
          console.log(`  Travel Time: ${transit.travelTime} min`);
          console.log(`  Wait Time: ${transit.waitTime} min`);
          console.log('');
        });
      }

    } else {
      console.log('❌ Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testSchedule().catch(console.error);
