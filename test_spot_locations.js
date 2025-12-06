import sendaiOpenDataService from './server/services/sendaiOpenDataService.js';

async function testSpotLocations() {
  console.log('🔍 Testing spot locations...\n');

  await sendaiOpenDataService.initialize();

  const historicalSpots = sendaiOpenDataService.getSpotsByTheme('歴史');

  console.log(`📍 Historical spots (first 5):\n`);
  historicalSpots.slice(0, 5).forEach((spot, i) => {
    console.log(`${i + 1}. ${spot.name}`);
    console.log(`   Coordinates: ${spot.lat}, ${spot.lon}`);
    console.log(`   Source: ${spot.source}`);
    console.log('');
  });
}

testSpotLocations().catch(console.error);
