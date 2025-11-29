import Timeline from './Timeline';
import { getElevation, getSlopeStars, getSlopeDescription } from '../services/plateauService';

function ScheduleView({ schedule }) {
  if (!schedule || !schedule.schedule) {
    return null;
  }

  const { schedule: items, summary } = schedule;

  return (
    <div className="p-3 md:p-4">
      {/* Summary */}
      <div className="bg-primary-50 rounded-lg p-3 md:p-4 mb-3 md:mb-4">
        <h2 className="text-base md:text-lg font-semibold text-primary-900 mb-2">
          スケジュール概要
        </h2>
        <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
          <div>
            <span className="text-gray-600">訪問スポット:</span>
            <span className="ml-2 font-semibold">{summary.totalSpots}箇所</span>
          </div>
          <div>
            <span className="text-gray-600">所要時間:</span>
            <span className="ml-2 font-semibold">
              {Math.floor(summary.totalDuration / 60)}時間{summary.totalDuration % 60}分
            </span>
          </div>
          <div>
            <span className="text-gray-600">開始:</span>
            <span className="ml-2 font-semibold">{summary.startTime}</span>
          </div>
          <div>
            <span className="text-gray-600">終了予定:</span>
            <span className="ml-2 font-semibold">{summary.endTime}</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-3 md:mb-4">
        <h3 className="text-sm md:text-md font-semibold text-gray-800 mb-2 md:mb-3">
          タイムライン
        </h3>
        <Timeline items={items} />
      </div>

      {/* Detailed Schedule */}
      <div>
        <h3 className="text-sm md:text-md font-semibold text-gray-800 mb-2 md:mb-3">
          詳細スケジュール
        </h3>
        <div className="space-y-2 md:space-y-3">
          {items.map((item, index) => (
            <ScheduleItem key={index} item={item} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ScheduleItem({ item, index }) {
  if (item.type === 'visit') {
    // PLATEAU標高データを取得
    const elevationData = getElevation(item.spot.name);

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 shadow-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xs md:text-sm">
            {Math.floor(index / 2) + 1}
          </div>
          <div className="ml-2 md:ml-3 flex-1">
            <h4 className="font-semibold text-sm md:text-base text-gray-900">{item.spot.name}</h4>
            {item.spot.vicinity && (
              <p className="text-xs md:text-sm text-gray-600 mt-1">{item.spot.vicinity}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm">
              <span className="text-gray-600">
                🕐 {item.arrivalTime} - {item.departureTime}
              </span>
              <span className="text-gray-600">
                ⏱️ {item.duration}分
              </span>
              {item.spot.rating && (
                <span className="text-gray-600">
                  ⭐ {item.spot.rating}
                </span>
              )}
            </div>

            {/* PLATEAU標高情報 */}
            <div className="mt-2 bg-indigo-50 border border-indigo-200 rounded px-2 py-1 inline-block">
              <span className="text-xs text-indigo-700">
                📍 標高: {elevationData.elevation}m | 坂のきつさ: {getSlopeStars(elevationData.slope)} {getSlopeDescription(elevationData.slope)}
              </span>
              <p className="text-xs text-gray-500 mt-0.5">データ出典: PLATEAU 3D都市モデル</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (item.type === 'transit') {
    const isReturn = item.isReturn || false;
    const isFirst = item.isFirstTransit || false;
    const isTransferLeg = item.isTransferLeg || 0;

    let transitTitle = '';
    if (isReturn) {
      transitTitle = '出発地点へ帰る';
    } else if (isFirst) {
      transitTitle = '出発地から最初の目的地へ';
    } else if (isTransferLeg === 1) {
      transitTitle = '乗り換えルート（第1区間）';
    } else if (isTransferLeg === 2) {
      transitTitle = '乗り換えルート（第2区間）';
    } else {
      transitTitle = item.mode === 'walking' ? '徒歩で移動' : '公共交通機関で移動';
    }

    return (
      <div className={`border rounded-lg p-2 md:p-3 ml-3 md:ml-4 ${isReturn ? 'bg-green-50 border-green-200' : isTransferLeg ? 'bg-purple-50 border-purple-200' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex items-center text-xs md:text-sm">
          <div className="flex-shrink-0">
            {item.mode === 'walking' ? (
              <span className="text-2xl">🚶</span>
            ) : (
              <span className="text-2xl">🚌</span>
            )}
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">
                {transitTitle}
              </span>
              <span className="text-gray-600">
                {item.totalTime}分
              </span>
            </div>

            {/* 乗り換えバッジ */}
            {isTransferLeg > 0 && (
              <div className="mt-1 inline-block bg-purple-600 text-white text-xs px-2 py-1 rounded">
                🔄 乗り換えあり
              </div>
            )}

            {/* ルート名・路線番号を表示 */}
            {item.mode === 'transit' && (item.routeName || item.routeNumber) && (
              <div className="mt-1 text-sm font-semibold text-blue-700">
                🚌 {item.routeName || '路線'}
                {item.routeNumber && ` (${item.routeNumber}番)`}
              </div>
            )}

            {/* 詳細な経路情報を表示 */}
            {item.mode === 'transit' && item.route && (
              <div className="mt-2 text-xs text-gray-800 space-y-2 bg-white border border-gray-200 p-3 rounded">
                <div className="font-semibold text-gray-700 mb-2 border-b pb-1">
                  📍 移動経路の詳細
                </div>

                {/* 出発地からバス停までの徒歩 */}
                <div className="flex items-start space-x-2 pl-2">
                  <span className="text-gray-500">1️⃣</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-700">
                      🚶 {item.from.name || '現在地'}から徒歩でバス停へ
                    </div>
                    {item.route.fromStop && (
                      <div className="text-gray-600 ml-4 mt-1">
                        → <span className="font-medium text-orange-600">{item.route.fromStop.stop_name}</span>（バス停）
                      </div>
                    )}
                  </div>
                </div>

                {/* バス乗車 */}
                {item.route.fromStop && (
                  <div className="flex items-start space-x-2 pl-2 bg-blue-50 p-2 rounded">
                    <span className="text-blue-600">2️⃣</span>
                    <div className="flex-1">
                      <div className="font-medium text-blue-700">
                        🚌 バス乗車
                      </div>
                      <div className="text-gray-700 ml-4 mt-1 space-y-1">
                        <div>
                          <span className="text-orange-500 font-bold">●</span> 乗車: <span className="font-medium">{item.route.fromStop.stop_name}</span>
                        </div>
                        {item.routeNumber && (
                          <div className="text-blue-600">
                            ├ 路線: <span className="font-semibold">{item.routeNumber}番</span>
                          </div>
                        )}
                        <div>
                          <span className="text-green-500 font-bold">●</span> 降車: <span className="font-medium">{item.route.toStop.stop_name}</span>
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          🕐 乗車時間: {item.travelTime}分
                          {item.waitTime > 0 && ` (待ち時間: ${item.waitTime}分)`}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* バス停から目的地までの徒歩 */}
                {item.route.toStop && (
                  <div className="flex items-start space-x-2 pl-2">
                    <span className="text-gray-500">3️⃣</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-700">
                        🚶 バス停から目的地へ徒歩
                      </div>
                      <div className="text-gray-600 ml-4 mt-1">
                        <span className="font-medium text-green-600">{item.route.toStop.stop_name}</span>（バス停）から
                        → <span className="font-medium">{item.to.name || '目的地'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 徒歩の場合の情報 */}
            {item.mode === 'walking' && (
              <div className="mt-2 text-xs text-gray-700 bg-white border border-gray-200 p-3 rounded">
                <div className="font-medium">
                  🚶 {item.from.name || '出発地'} → {item.to.name || '目的地'}
                </div>
                {item.route && item.route.distance && (
                  <div className="text-gray-600 mt-1">
                    距離: {item.route.distance.toFixed(2)}km
                  </div>
                )}
              </div>
            )}

            <div className="mt-2 text-xs text-gray-600 space-x-3">
              <span>🕐 出発: {item.departureTime}</span>
              <span>🏁 到着: {item.arrivalTime}</span>
            </div>

            {item.scenicScore > 0 && (
              <p className="mt-1 text-xs text-green-600">
                🌄 景観ルート (スコア: {item.scenicScore.toFixed(1)})
              </p>
            )}
            {isReturn && (
              <p className="mt-1 text-xs text-green-700 font-medium">
                ✅ 出発地点に戻ります
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default ScheduleView;
