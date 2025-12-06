import fetch from 'node-fetch';

async function testSchedule() {
  console.log('🧪 Testing schedule generation with 大崎八幡宮...\n');

  // 大崎八幡宮を含むスポットを手動で指定
  const requestBody = {
    location: { lat: 38.2606, lon: 140.8817 },  // 仙台駅
    theme: '歴史',
    maxSpots: 1,
    startTime: '09:00',
    visitDuration: 60
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
      console.log('\n✅ Schedule generated successfully!\n');
      console.log('📊 Summary:', data.data.summary);
      console.log('\n📋 Detailed Schedule:\n');

      data.data.schedule.forEach((item, index) => {
        console.log(`\n[${index + 1}] ${item.type.toUpperCase()}`);

        if (item.type === 'transit') {
          if (item.mode === 'bus') {
            console.log(`  🚌 Bus Transit`);
            console.log(`  From: ${item.from?.spot?.name || item.from?.lat + ',' + item.from?.lon}`);
            console.log(`  To: ${item.to?.spot?.name || item.to?.lat + ',' + item.to?.lon}`);
            console.log(`  Departure Time: ${item.departureTime}`);
            console.log(`  Arrival Time: ${item.arrivalTime}`);
            console.log(`  🚏 Boarding Stop: ${item.route?.fromStop?.stop_name || 'N/A'}`);
            console.log(`  🚏 Alighting Stop: ${item.route?.toStop?.stop_name || 'N/A'}`);
            console.log(`  🚌 Route: ${item.routeName || 'N/A'} - ${item.routeNumber || 'N/A'}`);
            console.log(`  ⏱️ Wait Time: ${item.waitTime} min`);
            console.log(`  ⏱️ Travel Time: ${item.travelTime} min`);
          } else {
            console.log(`  🚶 Walking`);
            console.log(`  Duration: ${item.travelTime} min`);
          }
        } else if (item.type === 'visit') {
          console.log(`  📍 Visit: ${item.spot?.name}`);
          console.log(`  Arrival: ${item.arrivalTime}`);
          console.log(`  Departure: ${item.departureTime}`);
          console.log(`  Duration: ${item.duration} min`);
        }
      });

    } else {
      console.log('\n❌ Error:', data.error);
    }
  } catch (error) {
    console.error('\n❌ Request failed:', error.message);
  }
}

testSchedule().catch(console.error);
