import gtfsService from './server/services/gtfsService.js';

async function testRoutes() {
  console.log('🔍 Testing routes between stops...\n');

  const testCases = [
    {
      from: { name: '仙台駅前', id: '50_0' },
      to: { name: '高等裁判所前', id: '9_51' },
      desc: '仙台駅 → 仙台城跡近く'
    },
    {
      from: { name: '仙台駅前', id: '50_0' },
      to: { name: '東七番丁・荒町市民センター前', id: '5041_50' },
      desc: '仙台駅 → 瑞鳳殿近く'
    },
    {
      from: { name: '仙台駅前', id: '50_0' },
      to: { name: '三条町', id: '9017_10' },
      desc: '仙台駅 → 大崎八幡宮近く'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📍 ${testCase.desc}`);
    console.log(`   From: ${testCase.from.name} (${testCase.from.id})`);
    console.log(`   To: ${testCase.to.name} (${testCase.to.id})`);

    const routes = await gtfsService.findRoutesBetweenStops(
      testCase.from.id,
      testCase.to.id
    );

    console.log(`   ✅ Routes found: ${routes.length}`);

    if (routes.length > 0) {
      routes.slice(0, 3).forEach((route, i) => {
        console.log(`   ${i + 1}. Route ${route.route_id} - ${route.route_short_name || route.route_long_name}`);
      });

      // 次の出発便を確認
      const departures = await gtfsService.getNextDepartures(
        testCase.from.id,
        '09:00',
        routes.slice(0, 3).map(r => r.route_id)
      );

      console.log(`   ⏰ Next departures from 09:00: ${departures.length}`);
      departures.slice(0, 3).forEach((dep, i) => {
        console.log(`      ${i + 1}. ${dep.departure_time} - Route ${dep.route_id}`);
      });
    } else {
      console.log(`   ❌ No routes found!`);
    }
  }
}

testRoutes().catch(console.error);
