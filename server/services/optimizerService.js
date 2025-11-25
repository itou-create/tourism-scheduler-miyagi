import gtfsService from './gtfsService.js';

/**
 * Optimizer Service
 * 待ち時間を最小化する周遊スケジュールを生成（貪欲法ベース）
 */
class OptimizerService {
  /**
   * 周遊スケジュールを生成
   * @param {Object} params - パラメータ
   * @param {Array} params.spots - 訪問する観光スポットリスト
   * @param {string} params.startTime - 開始時刻 (HH:MM)
   * @param {number} params.visitDuration - 各スポットの滞在時間（分）
   * @param {Object} params.preferences - ユーザー設定（移動手段、景観優先度など）
   */
  async generateSchedule(params) {
    const {
      spots,
      startTime,
      visitDuration = 60,
      preferences = {},
      startLocation = null
    } = params;

    if (!spots || spots.length === 0) {
      throw new Error('No spots provided');
    }

    const schedule = [];
    let currentTime = this.parseTime(startTime);
    let currentLocation = null;

    // 開始地点から最も近いスポットを最初の訪問先とする
    const sortedSpots = [...spots];
    const firstSpot = sortedSpots[0];

    for (let i = 0; i < sortedSpots.length; i++) {
      const spot = sortedSpots[i];

      if (i === 0) {
        // 最初のスポット
        schedule.push({
          type: 'visit',
          spot: spot,
          arrivalTime: this.formatTime(currentTime),
          departureTime: this.formatTime(currentTime + visitDuration),
          duration: visitDuration
        });
        currentTime += visitDuration;
        currentLocation = spot;
      } else {
        // 前のスポットから次のスポットへの移動を計算
        const route = await this.findBestRoute(
          currentLocation,
          spot,
          currentTime,
          preferences
        );

        if (route) {
          // 移動を追加
          schedule.push({
            type: 'transit',
            from: currentLocation,
            to: spot,
            route: route,
            departureTime: this.formatTime(currentTime),
            arrivalTime: this.formatTime(currentTime + route.waitTime + route.travelTime),
            waitTime: route.waitTime,
            travelTime: route.travelTime,
            totalTime: route.waitTime + route.travelTime,
            mode: route.mode,
            routeName: route.routeName || null,
            routeNumber: route.routeNumber || null,
            scenicScore: route.scenicScore || 0
          });

          currentTime += route.waitTime + route.travelTime;

          // 訪問を追加
          schedule.push({
            type: 'visit',
            spot: spot,
            arrivalTime: this.formatTime(currentTime),
            departureTime: this.formatTime(currentTime + visitDuration),
            duration: visitDuration
          });

          currentTime += visitDuration;
          currentLocation = spot;
        }
      }
    }

    // 出発地への帰路を追加
    if (startLocation && currentLocation) {
      const returnRoute = await this.findBestRoute(
        currentLocation,
        startLocation,
        currentTime,
        preferences
      );

      if (returnRoute) {
        schedule.push({
          type: 'transit',
          from: currentLocation,
          to: startLocation,
          route: returnRoute,
          departureTime: this.formatTime(currentTime),
          arrivalTime: this.formatTime(currentTime + returnRoute.waitTime + returnRoute.travelTime),
          waitTime: returnRoute.waitTime,
          travelTime: returnRoute.travelTime,
          totalTime: returnRoute.waitTime + returnRoute.travelTime,
          mode: returnRoute.mode,
          routeName: returnRoute.routeName || null,
          routeNumber: returnRoute.routeNumber || null,
          scenicScore: returnRoute.scenicScore || 0,
          isReturn: true  // 帰路フラグ
        });

        currentTime += returnRoute.waitTime + returnRoute.travelTime;
      }
    }

    return {
      schedule,
      summary: {
        totalSpots: spots.length,
        totalDuration: currentTime - this.parseTime(startTime),
        startTime: startTime,
        endTime: this.formatTime(currentTime),
        includesReturn: !!startLocation
      }
    };
  }

  /**
   * 2地点間の最適なルートを検索（貪欲法）
   */
  async findBestRoute(from, to, currentTime, preferences = {}) {
    try {
      // 出発地と目的地の近くの停留所を検索
      const fromStops = await gtfsService.findNearbyStops(from.lat, from.lon, 0.5);
      const toStops = await gtfsService.findNearbyStops(to.lat, to.lon, 0.5);

      if (fromStops.length === 0 || toStops.length === 0) {
        // 公共交通機関が利用できない場合は徒歩を想定
        return this.createWalkingRoute(from, to, currentTime);
      }

      let bestRoute = null;
      let minTotalTime = Infinity;

      // 各停留所の組み合わせで最適なルートを探索
      for (const fromStop of fromStops.slice(0, 3)) {
        for (const toStop of toStops.slice(0, 3)) {
          const routes = await gtfsService.findRoutesBetweenStops(
            fromStop.stop_id,
            toStop.stop_id
          );

          if (routes.length > 0) {
            // 現在時刻以降の次の便を探す
            const nextDepartures = await gtfsService.getNextDepartures(
              fromStop.stop_id,
              this.formatTime(currentTime),
              5
            );

            for (const departure of nextDepartures) {
              const waitTime = this.calculateWaitTime(currentTime, departure.departure_time);
              const travelTime = this.estimateTravelTime(fromStop, toStop, departure);

              const totalTime = waitTime + travelTime;

              if (totalTime < minTotalTime) {
                minTotalTime = totalTime;

                // ルート情報を取得
                const routeInfo = routes[0] ? await gtfsService.getRouteById(routes[0].route_id) : null;

                bestRoute = {
                  fromStop,
                  toStop,
                  departure,
                  waitTime,
                  travelTime,
                  mode: 'transit',
                  routeName: routeInfo ? routeInfo.route_long_name : null,
                  routeNumber: routeInfo ? routeInfo.route_short_name : null,
                  scenicScore: this.calculateScenicScore(fromStop, toStop, preferences)
                };
              }
            }
          }
        }
      }

      if (bestRoute) {
        return bestRoute;
      }

      // 公共交通機関が見つからない場合は徒歩
      return this.createWalkingRoute(from, to, currentTime);
    } catch (error) {
      console.error('Error finding route:', error);
      return this.createWalkingRoute(from, to, currentTime);
    }
  }

  /**
   * 徒歩ルートを作成
   */
  createWalkingRoute(from, to, currentTime) {
    const distance = gtfsService.calculateDistance(
      from.lat,
      from.lon,
      to.lat,
      to.lon
    );
    const walkingSpeed = 4; // km/h
    const travelTime = Math.ceil((distance / walkingSpeed) * 60); // 分

    return {
      mode: 'walking',
      waitTime: 0,
      travelTime,
      distance,
      scenicScore: 0
    };
  }

  /**
   * 待ち時間を計算
   */
  calculateWaitTime(currentTime, departureTime) {
    const current = this.parseTime(this.formatTime(currentTime));
    const departure = this.parseTime(departureTime);
    return Math.max(0, departure - current);
  }

  /**
   * 移動時間を推定
   */
  estimateTravelTime(fromStop, toStop, departure) {
    const distance = gtfsService.calculateDistance(
      fromStop.stop_lat,
      fromStop.stop_lon,
      toStop.stop_lat,
      toStop.stop_lon
    );

    // 平均速度を30km/hと仮定
    const avgSpeed = 30; // km/h
    return Math.ceil((distance / avgSpeed) * 60); // 分
  }

  /**
   * 景観スコアを計算
   */
  calculateScenicScore(fromStop, toStop, preferences) {
    // 簡易実装：景観優先度に応じたスコア
    const scenicPriority = preferences.scenicPriority || 0;
    // 実際には地形データや景観ポイントDBと連携
    return Math.random() * scenicPriority;
  }

  /**
   * 時刻文字列を分に変換 (HH:MM → minutes)
   */
  parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * 分を時刻文字列に変換 (minutes → HH:MM)
   */
  formatTime(minutes) {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }
}

export default new OptimizerService();
