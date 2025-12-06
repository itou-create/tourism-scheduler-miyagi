import { openDb, getStops, getStoptimes } from 'gtfs';
import { gtfsConfig } from './utils/config.js';

async function checkAllDepartures() {
  try {
    console.log('🔍 浦田停留所の全便を確認中...\n');

    await openDb(gtfsConfig);
    console.log('✅ GTFSデータベースを開きました\n');

    // 浦田停留所を検索
    const allStops = await getStops({});
    const uradaStops = allStops.filter(s => s.stop_name && s.stop_name.includes('浦田'));

    if (uradaStops.length === 0) {
      console.log('❌ 浦田停留所が見つかりませんでした');
      return;
    }

    console.log(`📍 浦田停留所: ${uradaStops.length}件`);
    uradaStops.forEach(stop => {
      console.log(`  - ${stop.stop_name} (${stop.stop_id})`);
    });

    // 各停留所の時刻表を確認（10:00-13:00の範囲で）
    for (const stop of uradaStops) {
      console.log(`\n📅 ${stop.stop_name} (${stop.stop_id})の時刻表（10:00-13:00）:`);

      const stoptimes = await getStoptimes({
        stop_id: stop.stop_id
      }, [], [['departure_time', 'ASC']]);

      const timeRange = stoptimes.filter(st => {
        return st.departure_time >= '10:00:00' && st.departure_time < '13:00:00';
      });

      if (timeRange.length === 0) {
        console.log('  便なし');
        continue;
      }

      console.log(`  見つかった便: ${timeRange.length}件\n`);

      for (const st of timeRange.slice(0, 20)) {
        console.log(`  ${st.departure_time} 発 (trip: ${st.trip_id}, sequence: ${st.stop_sequence})`);
      }
    }

  } catch (error) {
    console.error('❌ エラー:', error);
    console.error(error.stack);
  }
}

checkAllDepartures();
