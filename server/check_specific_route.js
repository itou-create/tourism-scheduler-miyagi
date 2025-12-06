import { openDb, getStops, getStoptimes, getTrips } from 'gtfs';
import { gtfsConfig } from './utils/config.js';

async function checkSpecificRoute() {
  try {
    console.log('🔍 浦田 → 生涯学習センター のルートを確認中...\n');

    // データベースを初期化
    await openDb(gtfsConfig);
    console.log('✅ GTFSデータベースを開きました\n');

    // "浦田"という名前の停留所を検索
    const allStops = await getStops({});
    const uradaStops = allStops.filter(s => s.stop_name && s.stop_name.includes('浦田'));

    if (uradaStops.length === 0) {
      console.log('❌ 浦田という停留所が見つかりませんでした');
      // 似た名前を検索
      const similar = allStops.filter(s => s.stop_name && s.stop_name.includes('浦'));
      console.log('\n"浦"を含む停留所:');
      similar.slice(0, 10).forEach(s => {
        console.log(`  - ${s.stop_name} (${s.stop_id})`);
      });
      return;
    }

    console.log(`📍 浦田停留所: ${uradaStops.length}件見つかりました`);
    uradaStops.forEach(stop => {
      console.log(`  - ${stop.stop_name} (${stop.stop_id})`);
    });

    // "生涯学習センター"という名前の停留所を検索
    const centerStops = allStops.filter(s => s.stop_name && s.stop_name.includes('生涯学習センター'));

    if (centerStops.length === 0) {
      console.log('\n❌ 生涯学習センターという停留所が見つかりませんでした');
      // 似た名前を検索
      const similar = allStops.filter(s => s.stop_name && (s.stop_name.includes('生涯') || s.stop_name.includes('学習')));
      console.log('\n"生涯"または"学習"を含む停留所:');
      similar.slice(0, 10).forEach(s => {
        console.log(`  - ${s.stop_name} (${s.stop_id})`);
      });
      return;
    }

    console.log(`\n📍 生涯学習センター停留所: ${centerStops.length}件見つかりました`);
    centerStops.forEach(stop => {
      console.log(`  - ${stop.stop_name} (${stop.stop_id})`);
    });

    // 最初の停留所で11:22前後の時刻表を確認
    const uradaStop = uradaStops[0];
    console.log(`\n🕐 ${uradaStop.stop_name}の時刻表（11:00-12:00）:`);

    const stoptimes = await getStoptimes({
      stop_id: uradaStop.stop_id
    }, [], [['departure_time', 'ASC']]);

    // 11:00-12:00の便を抽出
    const morningDepartures = stoptimes.filter(st => {
      return st.departure_time >= '11:00:00' && st.departure_time < '12:00:00';
    });

    console.log(`  見つかった便: ${morningDepartures.length}件\n`);

    for (const departure of morningDepartures.slice(0, 10)) {
      console.log(`  📅 出発: ${departure.departure_time} (trip: ${departure.trip_id})`);

      // このtripの詳細情報を取得
      const trips = await getTrips({ trip_id: departure.trip_id });
      if (trips.length > 0) {
        console.log(`     Route: ${trips[0].route_id}`);
      }

      // このtripの全停留所を取得して、生涯学習センターがあるか確認
      const tripStops = await getStoptimes(
        { trip_id: departure.trip_id },
        [],
        [['stop_sequence', 'ASC']]
      );

      // 生涯学習センターへの到着時刻を探す
      const centerArrival = tripStops.find(st =>
        centerStops.some(cs => cs.stop_id === st.stop_id)
      );

      if (centerArrival) {
        const centerStop = centerStops.find(cs => cs.stop_id === centerArrival.stop_id);
        console.log(`     ✅ → ${centerStop.stop_name}着: ${centerArrival.arrival_time}`);
        console.log(`        (所要時間: ${getTimeDiff(departure.departure_time, centerArrival.arrival_time)}分)\n`);
      } else {
        console.log(`     ❌ このルートは生涯学習センターを通りません\n`);
      }
    }

  } catch (error) {
    console.error('❌ エラー:', error);
    console.error(error.stack);
  }
}

function getTimeDiff(startTime, endTime) {
  const [h1, m1] = startTime.split(':').map(Number);
  const [h2, m2] = endTime.split(':').map(Number);
  const start = h1 * 60 + m1;
  const end = h2 * 60 + m2;
  return end - start;
}

checkSpecificRoute();
