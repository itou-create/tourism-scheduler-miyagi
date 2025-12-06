import gtfsService from './server/services/gtfsService.js';

async function testNearbyStops() {
  console.log('🔍 Testing nearby stops for historical spots...\n');

  const spots = [
    { name: '仙台駅', lat: 38.2606, lon: 140.8817 },
    { name: '仙台城跡', lat: 38.2555, lon: 140.8636 },
    { name: '瑞鳳殿', lat: 38.2495, lon: 140.8797 },
    { name: '大崎八幡宮', lat: 38.278, lon: 140.852 }
  ];

  for (const spot of spots) {
    console.log(`\n📍 ${spot.name} (${spot.lat}, ${spot.lon})`);

    const stops1km = await gtfsService.findNearbyStops(spot.lat, spot.lon, 1.0);
    const stops500m = await gtfsService.findNearbyStops(spot.lat, spot.lon, 0.5);

    console.log(`  Stops within 1.0km: ${stops1km.length}`);
    if (stops1km.length > 0) {
      console.log(`  Top stops (1km):`);
      stops1km.slice(0, 5).forEach((stop, i) => {
        console.log(`    ${i + 1}. ${stop.stop_name} (${stop.stop_id})`);
      });
    }

    console.log(`  Stops within 0.5km: ${stops500m.length}`);
    if (stops500m.length > 0) {
      console.log(`  Top stops (500m):`);
      stops500m.slice(0, 3).forEach((stop, i) => {
        console.log(`    ${i + 1}. ${stop.stop_name} (${stop.stop_id})`);
      });
    }
  }
}

testNearbyStops().catch(console.error);
