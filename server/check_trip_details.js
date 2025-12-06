import { openDb, getStops, getStoptimes } from 'gtfs';
import { gtfsConfig } from './utils/config.js';

async function checkTripDetails() {
  try {
    console.log('🔍 trip: 1全日_10時58分_系統81 の詳細を確認中...\n');

    await openDb(gtfsConfig);

    const tripId = '1全日_10時58分_系統81';

    // このtripの全停留所を取得
    const stoptimes = await getStoptimes(
      { trip_id: tripId },
      [],
      [['stop_sequence', 'ASC']]
    );

    console.log(`📅 Trip ${tripId} の停車駅一覧:\n`);

    // 全停留所の情報を取得
    const allStops = await getStops({});
    const stopMap = {};
    allStops.forEach(s => {
      stopMap[s.stop_id] = s.stop_name;
    });

    stoptimes.forEach(st => {
      const stopName = stopMap[st.stop_id] || st.stop_id;
      console.log(`  ${st.stop_sequence}. ${stopName}`);
      console.log(`     到着: ${st.arrival_time || 'N/A'}, 出発: ${st.departure_time}`);

      // 浦田か生涯学習センターの場合は強調表示
      if (stopName.includes('浦田')) {
        console.log(`     ⭐ 浦田停留所！`);
      }
      if (stopName.includes('生涯学習センター')) {
        console.log(`     ⭐ 生涯学習センター停留所！`);
      }
    });

  } catch (error) {
    console.error('❌ エラー:', error);
    console.error(error.stack);
  }
}

checkTripDetails();
