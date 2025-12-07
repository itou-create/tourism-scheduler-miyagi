import { openDb, getRoutes, getStops, getStoptimes, getTrips, getCalendars, getCalendarDates } from 'gtfs';
import { gtfsConfig } from '../utils/config.js';

/**
 * GTFS Service
 * GTFSデータの取得と処理を担当
 */
class GtfsService {
  constructor() {
    this.db = null;
    this.useDummyData = false; // 実データモード
    this.initialized = false;
  }

  /**
   * データベース接続を初期化
   */
  async initializeDb() {
    if (this.initialized) {
      return this.db;
    }

    try {
      this.db = await openDb(gtfsConfig);
      this.initialized = true;
      console.log('✅ GTFS database initialized');
      return this.db;
    } catch (error) {
      console.error('❌ Failed to initialize GTFS database:', error.message);
      console.warn('⚠️  Falling back to dummy data mode');
      this.useDummyData = true;
      this.initialized = true;
      return null;
    }
  }

  /**
   * すべてのルート情報を取得
   */
  async getAllRoutes() {
    if (this.useDummyData) {
      return this.getDummyRoutes();
    }

    try {
      await this.initializeDb();
      const routes = await getRoutes();
      return routes || [];
    } catch (error) {
      console.error('Error fetching routes:', error);
      return this.getDummyRoutes();
    }
  }

  /**
   * 指定されたルートIDの情報を取得
   */
  async getRouteById(routeId) {
    if (this.useDummyData) {
      const routes = this.getDummyRoutes();
      return routes.find(r => r.route_id === routeId) || null;
    }

    try {
      await this.initializeDb();
      const routes = await getRoutes({ route_id: routeId });
      return routes && routes.length > 0 ? routes[0] : null;
    } catch (error) {
      console.error('Error fetching route:', error);
      return null;
    }
  }

  /**
   * 指定された停留所の情報を取得
   */
  async getStopById(stopId) {
    if (this.useDummyData) {
      const stops = this.getDummyStops();
      return stops.find(s => s.stop_id === stopId) || null;
    }

    try {
      await this.initializeDb();
      const stops = await getStops({ stop_id: stopId });
      return stops && stops.length > 0 ? stops[0] : null;
    } catch (error) {
      console.error('Error fetching stop:', error);
      return null;
    }
  }

  /**
   * 近隣の停留所を検索
   */
  async findNearbyStops(lat, lon, radiusKm = 0.5) {
    if (this.useDummyData) {
      const allStops = this.getDummyStops();
      return allStops.filter(stop => {
        const distance = this.calculateDistance(
          lat, lon,
          stop.stop_lat, stop.stop_lon
        );
        return distance <= radiusKm;
      }).sort((a, b) => {
        const distA = this.calculateDistance(lat, lon, a.stop_lat, a.stop_lon);
        const distB = this.calculateDistance(lat, lon, b.stop_lat, b.stop_lon);
        return distA - distB;
      });
    }

    try {
      await this.initializeDb();
      const allStops = await getStops();

      const nearbyStops = allStops.filter(stop => {
        const distance = this.calculateDistance(
          lat, lon,
          stop.stop_lat, stop.stop_lon
        );
        return distance <= radiusKm;
      });

      // 距離でソート
      return nearbyStops.sort((a, b) => {
        const distA = this.calculateDistance(lat, lon, a.stop_lat, a.stop_lon);
        const distB = this.calculateDistance(lat, lon, b.stop_lat, b.stop_lon);
        return distA - distB;
      });
    } catch (error) {
      console.error('Error finding nearby stops:', error);
      return [];
    }
  }

  /**
   * 指定時刻以降の出発便を取得
   * @param {string} stopId - 停留所ID
   * @param {string} afterTime - 指定時刻（HH:MM:SS形式）
   * @param {Array<string>} routeIds - ルートIDの配列（指定された場合、そのルートの便のみ返す）
   * @param {number} limit - 取得する便の最大数
   */
  async getNextDepartures(stopId, afterTime, routeIds = [], limit = 10) {
    if (this.useDummyData) {
      return this.getDummyDepartures(afterTime, limit);
    }

    try {
      await this.initializeDb();

      // 指定停留所の時刻表を取得
      const stoptimes = await getStoptimes({
        stop_id: stopId
      }, [], [
        ['departure_time', 'ASC']
      ], limit * 10); // 余裕を持って取得（フィルタリング後に十分な数を確保）

      if (!stoptimes || stoptimes.length === 0) {
        return [];
      }

      // trip_idからroute_idを取得するため、tripsテーブルを参照
      const tripIds = [...new Set(stoptimes.map(st => st.trip_id))];
      const trips = await getTrips({
        trip_id: tripIds
      });

      const tripToRouteMap = {};
      trips.forEach(trip => {
        tripToRouteMap[trip.trip_id] = trip.route_id;
      });

      // 指定時刻以降の便をフィルタ
      let departures = stoptimes
        .filter(st => st.departure_time >= afterTime)
        .map(st => ({
          trip_id: st.trip_id,
          route_id: tripToRouteMap[st.trip_id],
          departure_time: st.departure_time,
          stop_id: stopId,
          stop_sequence: st.stop_sequence
        }));

      // routeIdsが指定されている場合、そのルートの便のみに絞る
      if (routeIds && routeIds.length > 0) {
        departures = departures.filter(dep => routeIds.includes(dep.route_id));
      }

      return departures.slice(0, limit);
    } catch (error) {
      console.error('Error fetching departures:', error);
      return this.getDummyDepartures(afterTime, limit);
    }
  }

  /**
   * 2つの停留所間のルートを検索（正しい方向のみ）
   */
  async findRoutesBetweenStops(fromStopId, toStopId) {
    if (this.useDummyData) {
      return [
        {
          trip_id: 'trip_1',
          route_id: '1',
          stop_id: toStopId
        }
      ];
    }

    try {
      await this.initializeDb();

      // 出発停留所を通るトリップを取得
      const fromStoptimes = await getStoptimes({ stop_id: fromStopId });

      // 到着停留所を通るトリップを取得
      const toStoptimes = await getStoptimes({ stop_id: toStopId });

      // trip_idとstop_sequenceのマップを作成
      const fromStopMap = {};
      fromStoptimes.forEach(st => {
        if (!fromStopMap[st.trip_id]) {
          fromStopMap[st.trip_id] = [];
        }
        fromStopMap[st.trip_id].push(st.stop_sequence);
      });

      const toStopMap = {};
      toStoptimes.forEach(st => {
        if (!toStopMap[st.trip_id]) {
          toStopMap[st.trip_id] = [];
        }
        toStopMap[st.trip_id].push(st.stop_sequence);
      });

      // 両方の停留所を通り、かつfrom < toの順序になっているトリップを見つける
      const validRoutes = [];
      for (const tripId of Object.keys(fromStopMap)) {
        if (toStopMap[tripId]) {
          // このトリップが両方の停留所を通る
          const fromSequences = fromStopMap[tripId];
          const toSequences = toStopMap[tripId];

          // fromのいずれかのstop_sequence < toのいずれかのstop_sequenceであることを確認
          let hasValidDirection = false;
          for (const fromSeq of fromSequences) {
            for (const toSeq of toSequences) {
              if (fromSeq < toSeq) {
                hasValidDirection = true;
                break;
              }
            }
            if (hasValidDirection) break;
          }

          if (hasValidDirection) {
            const trips = await getTrips({ trip_id: tripId });
            if (trips && trips.length > 0) {
              validRoutes.push({
                trip_id: tripId,
                route_id: trips[0].route_id,
                stop_id: toStopId
              });
            }
          }
        }
      }

      console.log(`🔍 findRoutesBetweenStops: ${fromStopId} → ${toStopId}: Found ${validRoutes.length} valid routes (correct direction only)`);
      return validRoutes;
    } catch (error) {
      console.error('Error finding routes between stops:', error);
      return [];
    }
  }

  /**
   * ダミールート情報
   */
  getDummyRoutes() {
    return [
      { route_id: '1', route_short_name: '1', route_long_name: '循環バス', route_type: 3 },
      { route_id: '2', route_short_name: '2', route_long_name: '観光路線', route_type: 3 }
    ];
  }

  /**
   * ダミー停留所情報（宮城県仙台市）
   */
  getDummyStops() {
    return [
      { stop_id: 'sendai_stop_1', stop_name: '仙台駅前', stop_lat: 38.2606, stop_lon: 140.8817 },
      { stop_id: 'sendai_stop_2', stop_name: '青葉通一番町', stop_lat: 38.2630, stop_lon: 140.8750 },
      { stop_id: 'sendai_stop_3', stop_name: '勾当台公園', stop_lat: 38.2687, stop_lon: 140.8720 },
      { stop_id: 'sendai_stop_4', stop_name: '仙台城跡', stop_lat: 38.2555, stop_lon: 140.8636 },
      { stop_id: 'sendai_stop_5', stop_name: '博物館・国際センター前', stop_lat: 38.2520, stop_lon: 140.8600 }
    ];
  }

  /**
   * ダミー出発時刻
   */
  getDummyDepartures(afterTime, limit) {
    const departures = [];
    const [hours, minutes] = afterTime.split(':').map(Number);
    let currentMinutes = hours * 60 + minutes;

    for (let i = 0; i < limit; i++) {
      currentMinutes += 15; // 15分間隔
      const h = Math.floor(currentMinutes / 60) % 24;
      const m = currentMinutes % 60;
      departures.push({
        trip_id: `trip_${i}`,
        departure_time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
        stop_id: 'stop_1'
      });
    }
    return departures;
  }

  /**
   * 2点間の距離を計算（ハバーサイン公式、km単位）
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 地球の半径（km）
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * 度数をラジアンに変換
   */
  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }
  /**
   * trip内の2つの停留所間の移動時間を取得
   * @param {string} tripId - トリップID
   * @param {string} fromStopId - 出発停留所ID
   * @param {string} toStopId - 到着停留所ID
   * @param {string} departureTime - 出発時刻（HH:MM:SS形式）
   * @returns {Promise<{travelTime: number, arrivalTime: string}|null>} 移動時間（分）と到着時刻
   */
  async getTravelTimeForTrip(tripId, fromStopId, toStopId, departureTime) {
    if (this.useDummyData) {
      return null;
    }

    try {
      await this.initializeDb();

      // このtripのすべてのstoptimesを取得（stop_sequence順）
      const allStoptimes = await getStoptimes({
        trip_id: tripId
      }, [], [
        ['stop_sequence', 'ASC']
      ]);

      if (!allStoptimes || allStoptimes.length === 0) {
        return null;
      }

      // 出発停留所を見つける
      const fromStoptime = allStoptimes.find(st =>
        st.stop_id === fromStopId && st.departure_time === departureTime
      );

      if (!fromStoptime) {
        console.log(`  ⚠️  From stop not found: ${fromStopId} at ${departureTime}`);
        return null;
      }

      // 到着停留所を見つける（出発停留所より後のstop_sequence）
      const toStoptime = allStoptimes.find(st =>
        st.stop_id === toStopId && st.stop_sequence > fromStoptime.stop_sequence
      );

      if (!toStoptime) {
        console.log(`  ⚠️  To stop not found: ${toStopId} after seq ${fromStoptime.stop_sequence}`);
        return null;
      }

      // 移動時間を計算
      const departureMinutes = this.parseTime(fromStoptime.departure_time);
      const arrivalMinutes = this.parseTime(toStoptime.arrival_time || toStoptime.departure_time);
      const travelTime = arrivalMinutes - departureMinutes;

      console.log(`  ✅ Travel time: ${fromStopId}(seq=${fromStoptime.stop_sequence}, ${fromStoptime.departure_time}) → ${toStopId}(seq=${toStoptime.stop_sequence}, ${toStoptime.arrival_time}) = ${travelTime}min`);

      return {
        travelTime,
        arrivalTime: toStoptime.arrival_time || toStoptime.departure_time
      };
    } catch (error) {
      console.error('Error getting travel time:', error);
      return null;
    }
  }

  /**
   * 2点間の距離を計算（ハバーサイン公式、km単位）
   */
  parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * 指定された日付で運行されるservice_idを取得
   * @param {string} dateString - 日付 (YYYY-MM-DD形式)
   * @returns {Promise<Array<string>>} - その日に運行されるservice_idのリスト
   */
  async getServiceIdsForDate(dateString) {
    try {
      await this.initializeDb();

      // YYYY-MM-DD を YYYYMMDD に変換
      const dateNum = parseInt(dateString.replace(/-/g, ''));

      // 日付から曜日を取得 (0=日曜, 1=月曜, ..., 6=土曜)
      const date = new Date(dateString);
      const dayOfWeek = date.getDay();

      // 曜日をカレンダーのフィールド名にマッピング
      const dayFields = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayField = dayFields[dayOfWeek];

      // カレンダー情報を取得
      const calendars = await getCalendars();

      // 通常運行のservice_idを取得
      const regularServiceIds = calendars
        .filter(cal => {
          // 期間内かチェック
          const inPeriod = cal.start_date <= dateNum && cal.end_date >= dateNum;
          // その曜日に運行しているかチェック
          const runsOnDay = cal[dayField] === 1;
          return inPeriod && runsOnDay;
        })
        .map(cal => cal.service_id);

      // 例外日情報を取得
      const calendarDates = await getCalendarDates({
        date: dateNum
      });

      // 例外日の処理
      const serviceIds = new Set(regularServiceIds);

      if (calendarDates && calendarDates.length > 0) {
        calendarDates.forEach(exception => {
          if (exception.exception_type === 1) {
            // 1 = 追加運行
            serviceIds.add(exception.service_id);
          } else if (exception.exception_type === 2) {
            // 2 = 運休
            serviceIds.delete(exception.service_id);
          }
        });
      }

      const result = Array.from(serviceIds);

      // ログ出力
      console.log(`📅 ${dateString} (${['日', '月', '火', '水', '木', '金', '土'][dayOfWeek]}曜日) の運行service_id: ${result.length}件`);
      console.log(`   service_ids: ${result.join(', ')}`);

      return result;
    } catch (error) {
      console.error('Error getting service IDs for date:', error);
      // エラー時は全てのservice_idを返す（後方互換性のため）
      return [];
    }
  }


}

export default new GtfsService();
