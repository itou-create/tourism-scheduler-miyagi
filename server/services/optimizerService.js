import gtfsService from './gtfsService.js';

/**
 * Optimizer Service
 * 待ち時間を最小化する周遊スケジュールを生成（貪欲法ベース）
 */
class OptimizerService {
  /**
   * 1時間以内に到達可能なスポットをフィルタリング
   */
  async filterReachableSpots(spots, startLocation, startTime, maxTravelTime = 60) {
    console.log(`🔍 Filtering reachable spots within ${maxTravelTime} minutes from start location`);

    const reachableSpots = [];
    const currentTime = this.parseTime(startTime);

    for (const spot of spots) {
      console.log(`🔍 Checking spot: ${spot.name}, lat: ${spot.lat}, lon: ${spot.lon}`);
      const route = await this.findBestRoute(startLocation, spot, currentTime, {});
      const travelTime = route ? (route.waitTime + route.travelTime) : null;

      if (travelTime && travelTime <= maxTravelTime) {
        reachableSpots.push({
          ...spot,
          travelTimeFromStart: travelTime,
          routeFromStart: route
        });
      }
    }

    console.log(`✅ Found ${reachableSpots.length} reachable spots out of ${spots.length} total`);
    return reachableSpots.sort((a, b) => a.travelTimeFromStart - b.travelTimeFromStart);
  }

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

    // 2時間以内に到達可能なスポットのみにフィルタリング
    let filteredSpots = spots;
    if (startLocation) {
      filteredSpots = await this.filterReachableSpots(spots, startLocation, startTime, 120);

      if (filteredSpots.length === 0) {
        throw new Error('No reachable spots found within 2 hours from start location');
      }
    }

    const schedule = [];
    let currentTime = this.parseTime(startTime);
    let currentLocation = startLocation || null;

    // フィルタリングされたスポットを使用
    const sortedSpots = [...filteredSpots];

    for (let i = 0; i < sortedSpots.length; i++) {
      const spot = sortedSpots[i];

      if (i === 0 && startLocation) {
        // 出発地から最初のスポットへの移動
        const firstRoute = await this.findBestRoute(
          startLocation,
          spot,
          currentTime,
          preferences
        );

        if (firstRoute) {
          // バスの場合、乗車時刻・降車時刻をスケジュール上の時刻として計算
          let boardingTime = null;
          let alightingTime = null;

          if (firstRoute.mode === 'transit' && firstRoute.departure) {
            // スケジュール上の乗車時刻 = 現在時刻 + 待ち時間
            boardingTime = this.formatTime(currentTime + firstRoute.waitTime);
            // スケジュール上の降車時刻 = 乗車時刻 + 移動時間
            alightingTime = this.formatTime(currentTime + firstRoute.waitTime + firstRoute.travelTime);
          }

          // 出発地からの移動を追加
          schedule.push({
            type: 'transit',
            from: startLocation,
            to: spot,
            route: firstRoute,
            departureTime: this.formatTime(currentTime),
            arrivalTime: this.formatTime(currentTime + firstRoute.waitTime + firstRoute.travelTime),
            boardingTime: boardingTime,  // バス停での乗車時刻
            alightingTime: alightingTime, // バス停での降車時刻
            waitTime: firstRoute.waitTime,
            travelTime: firstRoute.travelTime,
            totalTime: firstRoute.waitTime + firstRoute.travelTime,
            mode: firstRoute.mode,
            routeName: firstRoute.routeName || null,
            routeNumber: firstRoute.routeNumber || null,
            scenicScore: firstRoute.scenicScore || 0,
            isFirstTransit: true  // 最初の移動フラグ
          });

          currentTime += firstRoute.waitTime + firstRoute.travelTime;
        }

        // 最初のスポット訪問
        schedule.push({
          type: 'visit',
          spot: spot,
          arrivalTime: this.formatTime(currentTime),
          departureTime: this.formatTime(currentTime + visitDuration),
          duration: visitDuration
        });
        currentTime += visitDuration;
        currentLocation = spot;
      } else if (i === 0) {
        // startLocationがない場合（従来の動作）
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
          // 乗り換えルートの場合は2区間に分けて追加
          if (route.isTransfer) {
            const firstLeg = route.firstLeg;
            const secondLeg = route.secondLeg;

            // 第1区間の乗車時刻・降車時刻（スケジュール上の時刻）
            let firstBoardingTime = null;
            let firstAlightingTime = null;
            if (firstLeg.departure) {
              // スケジュール上の乗車時刻 = 現在時刻 + 待ち時間
              firstBoardingTime = this.formatTime(currentTime + firstLeg.waitTime);
              // スケジュール上の降車時刻 = 乗車時刻 + 移動時間
              firstAlightingTime = this.formatTime(currentTime + firstLeg.waitTime + firstLeg.travelTime);
            }

            // 第1区間: 出発地 → 乗り換えハブ
            schedule.push({
              type: 'transit',
              from: currentLocation,
              to: { ...route.transferHub, name: firstLeg.toStop.stop_name },
              route: firstLeg,
              departureTime: this.formatTime(currentTime),
              arrivalTime: this.formatTime(currentTime + firstLeg.waitTime + firstLeg.travelTime),
              boardingTime: firstBoardingTime,
              alightingTime: firstAlightingTime,
              waitTime: firstLeg.waitTime,
              travelTime: firstLeg.travelTime,
              totalTime: firstLeg.waitTime + firstLeg.travelTime,
              mode: 'transit',
              routeName: firstLeg.routeName || null,
              routeNumber: firstLeg.routeNumber || null,
              scenicScore: 0,
              isTransferLeg: 1
            });

            currentTime += firstLeg.waitTime + firstLeg.travelTime;

            // 乗り換え待ち時間（5分）
            currentTime += 5;

            // 第2区間の乗車時刻・降車時刻（スケジュール上の時刻）
            let secondBoardingTime = null;
            let secondAlightingTime = null;
            if (secondLeg.departure) {
              // スケジュール上の乗車時刻 = 現在時刻（第1区間後+乗り換え時間） + 待ち時間
              secondBoardingTime = this.formatTime(currentTime + secondLeg.waitTime);
              // スケジュール上の降車時刻 = 乗車時刻 + 移動時間
              secondAlightingTime = this.formatTime(currentTime + secondLeg.waitTime + secondLeg.travelTime);
            }

            // 第2区間: 乗り換えハブ → 目的地
            schedule.push({
              type: 'transit',
              from: { name: secondLeg.fromStop.stop_name },
              to: spot,
              route: secondLeg,
              departureTime: this.formatTime(currentTime),
              arrivalTime: this.formatTime(currentTime + secondLeg.waitTime + secondLeg.travelTime),
              boardingTime: secondBoardingTime,
              alightingTime: secondAlightingTime,
              waitTime: secondLeg.waitTime,
              travelTime: secondLeg.travelTime,
              totalTime: secondLeg.waitTime + secondLeg.travelTime,
              mode: 'transit',
              routeName: secondLeg.routeName || null,
              routeNumber: secondLeg.routeNumber || null,
              scenicScore: 0,
              isTransferLeg: 2
            });

            currentTime += secondLeg.waitTime + secondLeg.travelTime;
          } else {
            // バスの場合、乗車時刻・降車時刻をスケジュール上の時刻として計算
            let boardingTime = null;
            let alightingTime = null;

            if (route.mode === 'transit' && route.departure) {
              // スケジュール上の乗車時刻 = 現在時刻 + 待ち時間
              boardingTime = this.formatTime(currentTime + route.waitTime);
              // スケジュール上の降車時刻 = 乗車時刻 + 移動時間
              alightingTime = this.formatTime(currentTime + route.waitTime + route.travelTime);
            }

            // 通常の直接ルート
            schedule.push({
              type: 'transit',
              from: currentLocation,
              to: spot,
              route: route,
              departureTime: this.formatTime(currentTime),
              arrivalTime: this.formatTime(currentTime + route.waitTime + route.travelTime),
              boardingTime: boardingTime,  // バス停での乗車時刻
              alightingTime: alightingTime, // バス停での降車時刻
              waitTime: route.waitTime,
              travelTime: route.travelTime,
              totalTime: route.waitTime + route.travelTime,
              mode: route.mode,
              routeName: route.routeName || null,
              routeNumber: route.routeNumber || null,
              scenicScore: route.scenicScore || 0
            });

            currentTime += route.waitTime + route.travelTime;
          }

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
        // 帰路のバス乗車時刻・降車時刻をスケジュール上の時刻として計算
        let returnBoardingTime = null;
        let returnAlightingTime = null;

        if (returnRoute.mode === 'transit' && returnRoute.departure) {
          // スケジュール上の乗車時刻 = 現在時刻 + 待ち時間
          returnBoardingTime = this.formatTime(currentTime + returnRoute.waitTime);
          // スケジュール上の降車時刻 = 乗車時刻 + 移動時間
          returnAlightingTime = this.formatTime(currentTime + returnRoute.waitTime + returnRoute.travelTime);
        }

        schedule.push({
          type: 'transit',
          from: currentLocation,
          to: startLocation,
          route: returnRoute,
          departureTime: this.formatTime(currentTime),
          arrivalTime: this.formatTime(currentTime + returnRoute.waitTime + returnRoute.travelTime),
          boardingTime: returnBoardingTime,  // バス停での乗車時刻
          alightingTime: returnAlightingTime, // バス停での降車時刻
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
      console.log(`🔍 findBestRoute called - From: (${from.lat}, ${from.lon}), To: (${to.lat}, ${to.lon})`);

      // 出発地と目的地の近くの停留所を検索（半径を1.0kmに拡大）
      const fromStops = await gtfsService.findNearbyStops(from.lat, from.lon, 1.0);
      const toStops = await gtfsService.findNearbyStops(to.lat, to.lon, 1.0);

      console.log(`🔍 Nearby stops - From: ${fromStops.length}, To: ${toStops.length}`);
      if (fromStops.length > 0) {
        console.log(`  From stops: ${fromStops.slice(0, 2).map(s => s.stop_name).join(', ')}`);
      }
      if (toStops.length > 0) {
        console.log(`  To stops: ${toStops.slice(0, 2).map(s => s.stop_name).join(', ')}`);
      }

      if (fromStops.length === 0 || toStops.length === 0) {
        console.log(`⚠️  No stops found, using walking route`);
        // 公共交通機関が利用できない場合は徒歩を想定
        return this.createWalkingRoute(from, to, currentTime);
      }

      let bestRoute = null;
      let minTotalTime = Infinity;
      let routesChecked = 0;
      let routesFound = 0;
      let departuresFound = 0;

      // 各停留所の組み合わせで最適なルートを探索（上位5つまで拡大）
      for (const fromStop of fromStops.slice(0, 5)) {
        for (const toStop of toStops.slice(0, 5)) {
          routesChecked++;
          const routes = await gtfsService.findRoutesBetweenStops(
            fromStop.stop_id,
            toStop.stop_id
          );

          if (routes.length > 0) {
            routesFound++;
            // 現在時刻以降の次の便を探す（該当ルートのみ）
            const routeIds = routes.map(r => r.route_id);
            const nextDepartures = await gtfsService.getNextDepartures(
              fromStop.stop_id,
              this.formatTime(currentTime),
              routeIds,  // ルートIDの配列を渡す
              5          // 取得する便の最大数
            );

            if (nextDepartures.length > 0) {
              departuresFound++;
            }

            for (const departure of nextDepartures) {
              const waitTime = this.calculateWaitTime(currentTime, departure.departure_time);

              // GTFSから実際の移動時間と到着時刻を取得
              const tripData = await gtfsService.getTravelTimeForTrip(
                departure.trip_id,
                fromStop.stop_id,
                toStop.stop_id,
                departure.departure_time
              );

              // 移動時間を取得（実データがない場合は推定）
              let travelTime;
              let actualArrivalTime = null;
              if (tripData) {
                travelTime = tripData.travelTime;
                actualArrivalTime = tripData.arrivalTime;
                console.log(`✅ Using actual trip data: ${departure.departure_time} -> ${actualArrivalTime} (${travelTime}min)`);
              } else {
                travelTime = this.estimateTravelTime(fromStop, toStop, departure);
                console.log(`⚠️  No actual trip data, using estimate: ${travelTime}min`);
              }

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
                  actualArrivalTime,  // 実際の到着時刻を追加
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

      console.log(`🚌 Route search results: Checked ${routesChecked} combinations, Found ${routesFound} routes, Found ${departuresFound} departures`);

      if (bestRoute) {
        const transitTotalTime = bestRoute.waitTime + bestRoute.travelTime;
        console.log(`🚌 Best transit: ${bestRoute.fromStop.stop_name} → ${bestRoute.toStop.stop_name} (wait: ${bestRoute.waitTime}min, travel: ${bestRoute.travelTime}min, total: ${transitTotalTime}min)`);

        // 徒歩ルートと比較
        const walkingRoute = this.createWalkingRoute(from, to, currentTime);
        console.log(`🚶 Walking option: ${walkingRoute.travelTime}min`);

        // 徒歩が30分以内で、バスの待ち時間+移動時間が徒歩より長い場合は徒歩を選択
        if (walkingRoute.travelTime <= 30 && transitTotalTime > walkingRoute.travelTime) {
          console.log(`✅ Walking is faster, using walking route`);
          return walkingRoute;
        }

        // バスの待ち時間が20分以上で、徒歩が40分以内なら徒歩を選択
        if (bestRoute.waitTime >= 20 && walkingRoute.travelTime <= 40) {
          console.log(`✅ Bus wait time too long, using walking route`);
          return walkingRoute;
        }

        console.log(`✅ Using transit (more efficient than walking)`);
        return bestRoute;
      }

      // 徒歩ルートを作成して比較の基準にする
      const walkingRoute = this.createWalkingRoute(from, to, currentTime);
      console.log(`🚶 Walking option: ${walkingRoute.travelTime}min`);

      // 直接ルートが見つからない場合、乗り換えを試す
      console.log(`🔄 No direct route found, trying transfer via major hubs...`);
      const transferRoute = await this.findTransferRoute(from, to, currentTime, fromStops, toStops, preferences);

      if (transferRoute) {
        const transferTotalTime = transferRoute.waitTime + transferRoute.travelTime;
        console.log(`🚌 Transfer route option: ${transferTotalTime}min (wait: ${transferRoute.waitTime}min, travel: ${transferRoute.travelTime}min)`);

        // 徒歩 vs バス乗り換えの比較
        // 徒歩が30分以内で、バス乗り換えが徒歩の1.5倍以上かかる場合は徒歩を選択
        if (walkingRoute.travelTime <= 30 && transferTotalTime >= walkingRoute.travelTime * 1.5) {
          console.log(`✅ Walking is more efficient, using walking route`);
          return walkingRoute;
        }

        // バス乗り換えが60分以上かかる場合は徒歩を選択（徒歩が40分以内の場合）
        if (transferTotalTime >= 60 && walkingRoute.travelTime <= 40) {
          console.log(`✅ Transfer takes too long, using walking route`);
          return walkingRoute;
        }

        console.log(`✅ Using transfer route (more efficient than walking)`);
        return transferRoute;
      }

      console.log(`✅ No suitable transit found, using walking route (${walkingRoute.travelTime}min)`);
      return walkingRoute;
    } catch (error) {
      console.error('Error finding route:', error);
      return this.createWalkingRoute(from, to, currentTime);
    }
  }

  /**
   * 乗り換えを含むルートを検索（主要ハブ経由）
   */
  async findTransferRoute(from, to, currentTime, fromStops, toStops, preferences) {
    try {
      // 主要な乗り換えハブ（仙台駅、仙台駅前など）
      const transferHubs = [
        { name: '仙台駅前', lat: 38.2599, lon: 140.8815 },
        { name: '仙台駅', lat: 38.2606, lon: 140.8817 },
        { name: '青葉通一番町', lat: 38.2604, lon: 140.8723 }
      ];

      let bestTransferRoute = null;
      let minTotalTime = Infinity;

      for (const hub of transferHubs) {
        // ハブ付近の停留所を検索
        const hubStops = await gtfsService.findNearbyStops(hub.lat, hub.lon, 0.3);

        if (hubStops.length === 0) continue;

        // 出発地 → ハブ の最適ルートを検索
        let bestFirstLeg = null;
        let minFirstLegTime = Infinity;

        for (const fromStop of fromStops.slice(0, 3)) {
          for (const hubStop of hubStops.slice(0, 3)) {
            const routes = await gtfsService.findRoutesBetweenStops(fromStop.stop_id, hubStop.stop_id);

            if (routes.length > 0) {
              const routeIds = routes.map(r => r.route_id);
              const nextDepartures = await gtfsService.getNextDepartures(
                fromStop.stop_id,
                this.formatTime(currentTime),
                routeIds,
                3
              );

              for (const departure of nextDepartures) {
                const waitTime = this.calculateWaitTime(currentTime, departure.departure_time);

                // GTFSから実際の移動時間と到着時刻を取得
                const tripData = await gtfsService.getTravelTimeForTrip(
                  departure.trip_id,
                  fromStop.stop_id,
                  hubStop.stop_id,
                  departure.departure_time
                );

                // 移動時間を取得（実データがない場合は推定）
                let travelTime;
                let actualArrivalTime = null;
                if (tripData) {
                  travelTime = tripData.travelTime;
                  actualArrivalTime = tripData.arrivalTime;
                } else {
                  travelTime = this.estimateTravelTime(fromStop, hubStop, departure);
                }

                const totalTime = waitTime + travelTime;

                if (totalTime < minFirstLegTime) {
                  minFirstLegTime = totalTime;
                  const routeInfo = routes[0] ? await gtfsService.getRouteById(routes[0].route_id) : null;

                  bestFirstLeg = {
                    fromStop,
                    toStop: hubStop,
                    departure,
                    waitTime,
                    travelTime,
                    actualArrivalTime,  // 実際の到着時刻を追加
                    arrivalTime: currentTime + waitTime + travelTime,
                    routeName: routeInfo ? routeInfo.route_long_name : null,
                    routeNumber: routeInfo ? routeInfo.route_short_name : null
                  };
                }
              }
            }
          }
        }

        if (!bestFirstLeg) continue;

        // ハブ → 目的地 の最適ルートを検索
        let bestSecondLeg = null;
        let minSecondLegTime = Infinity;
        const transferTime = bestFirstLeg.arrivalTime + 5; // 5分の乗り換え時間

        for (const hubStop of hubStops.slice(0, 3)) {
          for (const toStop of toStops.slice(0, 3)) {
            const routes = await gtfsService.findRoutesBetweenStops(hubStop.stop_id, toStop.stop_id);

            if (routes.length > 0) {
              const routeIds = routes.map(r => r.route_id);
              const nextDepartures = await gtfsService.getNextDepartures(
                hubStop.stop_id,
                this.formatTime(transferTime),
                routeIds,
                3
              );

              for (const departure of nextDepartures) {
                const waitTime = this.calculateWaitTime(transferTime, departure.departure_time);

                // GTFSから実際の移動時間と到着時刻を取得
                const tripData = await gtfsService.getTravelTimeForTrip(
                  departure.trip_id,
                  hubStop.stop_id,
                  toStop.stop_id,
                  departure.departure_time
                );

                // 移動時間を取得（実データがない場合は推定）
                let travelTime;
                let actualArrivalTime = null;
                if (tripData) {
                  travelTime = tripData.travelTime;
                  actualArrivalTime = tripData.arrivalTime;
                } else {
                  travelTime = this.estimateTravelTime(hubStop, toStop, departure);
                }

                const totalTime = waitTime + travelTime;

                if (totalTime < minSecondLegTime) {
                  minSecondLegTime = totalTime;
                  const routeInfo = routes[0] ? await gtfsService.getRouteById(routes[0].route_id) : null;

                  bestSecondLeg = {
                    fromStop: hubStop,
                    toStop,
                    departure,
                    waitTime,
                    travelTime,
                    actualArrivalTime,  // 実際の到着時刻を追加
                    routeName: routeInfo ? routeInfo.route_long_name : null,
                    routeNumber: routeInfo ? routeInfo.route_short_name : null
                  };
                }
              }
            }
          }
        }

        if (bestSecondLeg) {
          const totalTransferTime =
            bestFirstLeg.waitTime + bestFirstLeg.travelTime +
            5 + // 乗り換え時間
            bestSecondLeg.waitTime + bestSecondLeg.travelTime;

          if (totalTransferTime < minTotalTime) {
            minTotalTime = totalTransferTime;
            bestTransferRoute = {
              mode: 'transit',
              isTransfer: true,
              firstLeg: bestFirstLeg,
              secondLeg: bestSecondLeg,
              transferHub: hub.name,
              waitTime: bestFirstLeg.waitTime + bestSecondLeg.waitTime + 5,
              travelTime: bestFirstLeg.travelTime + bestSecondLeg.travelTime,
              fromStop: bestFirstLeg.fromStop,
              toStop: bestSecondLeg.toStop,
              routeName: `${bestFirstLeg.routeNumber || '?'} → ${bestSecondLeg.routeNumber || '?'}`,
              routeNumber: `${bestFirstLeg.routeNumber || '?'}/${bestSecondLeg.routeNumber || '?'}`,
              scenicScore: this.calculateScenicScore(bestFirstLeg.fromStop, bestSecondLeg.toStop, preferences)
            };
          }
        }
      }

      return bestTransferRoute;
    } catch (error) {
      console.error('Error finding transfer route:', error);
      return null;
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
   * GTFSの深夜便対応: 24時を超える時刻もそのまま表示（例: 25:29）
   */
  formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }
}

export default new OptimizerService();
