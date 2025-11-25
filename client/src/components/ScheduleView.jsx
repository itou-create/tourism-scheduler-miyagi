import Timeline from './Timeline';

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
          </div>
        </div>
      </div>
    );
  }

  if (item.type === 'transit') {
    const isReturn = item.isReturn || false;
    const transitTitle = isReturn
      ? '出発地点へ帰る'
      : (item.mode === 'walking' ? '徒歩で移動' : '公共交通機関で移動');

    return (
      <div className={`border rounded-lg p-2 md:p-3 ml-3 md:ml-4 ${isReturn ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
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

            {/* ルート名・路線番号を表示 */}
            {item.mode === 'transit' && (item.routeName || item.routeNumber) && (
              <div className="mt-1 text-sm font-semibold text-blue-700">
                🚌 {item.routeName || '路線'}
                {item.routeNumber && ` (${item.routeNumber}番)`}
              </div>
            )}

            {/* バス停名を表示 */}
            {item.mode === 'transit' && item.route && (
              <div className="mt-2 text-xs text-gray-700 space-y-1 bg-gray-50 p-2 rounded">
                {item.route.fromStop && (
                  <div className="flex items-start">
                    <span className="text-orange-500 font-bold mr-1">🚌</span>
                    <span>
                      <span className="font-medium">乗車:</span> {item.route.fromStop.stop_name}
                    </span>
                  </div>
                )}
                {item.route.toStop && (
                  <div className="flex items-start">
                    <span className="text-green-500 font-bold mr-1">🚌</span>
                    <span>
                      <span className="font-medium">降車:</span> {item.route.toStop.stop_name}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-1 text-xs text-gray-600 space-x-3">
              <span>出発: {item.departureTime}</span>
              <span>到着: {item.arrivalTime}</span>
              {item.waitTime > 0 && (
                <span className="text-orange-600">待ち時間: {item.waitTime}分</span>
              )}
            </div>
            {item.mode === 'walking' && item.distance && (
              <p className="mt-1 text-xs text-gray-500">
                距離: {item.distance.toFixed(2)}km
              </p>
            )}
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
