import fetch from 'node-fetch';

async function testSendaiStation() {
  try {
    console.log('🧪 Testing Sendai Station search...\n');
    console.log('Parameters:');
    console.log('  Location: 仙台駅 (38.2606, 140.8817)');
    console.log('  Theme: 歴史');
    console.log('  Start Time: 09:00\n');

    const response = await fetch('http://localhost:3001/api/scheduler/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location: { lat: 38.2606, lon: 140.8817 }, // 仙台駅
        theme: '歴史',
        startTime: '09:00',
        visitDuration: 60,
        maxSpots: 3
      })
    });

    const result = await response.json();

    if (!result.success) {
      console.log('❌ API returned error:', result.error);
      return;
    }

    console.log('✅ Schedule generated successfully!\n');
    console.log(`Total spots: ${result.data.schedule.filter(i => i.type === 'visit').length}`);

    result.data.schedule.forEach((item, index) => {
      if (item.type === 'visit') {
        console.log(`\n📍 Spot ${index + 1}: ${item.spot.name}`);
        console.log(`   Coordinates: (${item.spot.lat}, ${item.spot.lon})`);
        console.log(`   Visit: ${item.arrivalTime} - ${item.departureTime}`);
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSendaiStation();
