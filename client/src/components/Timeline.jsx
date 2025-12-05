/**
 * GTFSの24時を超える時刻を分かりやすく表示
 * 例: "25:29" → "翌日 01:29"
 */
function formatDisplayTime(timeStr) {
  if (!timeStr) return '';

  const [hours, minutes] = timeStr.split(':').map(Number);

  if (hours >= 24) {
    const displayHours = hours % 24;
    return `翌日 ${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  return timeStr;
}

function Timeline({ items }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Vertical Line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>

      {/* Timeline Items */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <TimelineItem key={index} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}

function TimelineItem({ item, index }) {
  if (item.type === 'visit') {
    return (
      <div className="relative flex items-start pl-10">
        {/* Dot */}
        <div className="absolute left-2.5 w-3 h-3 bg-primary-600 rounded-full border-2 border-white shadow"></div>

        {/* Content */}
        <div className="flex-1 bg-white border border-gray-200 rounded-md p-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">
              {item.spot.name}
            </span>
            <span className="text-xs text-gray-500">
              {item.duration}分
            </span>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {formatDisplayTime(item.arrivalTime)} - {formatDisplayTime(item.departureTime)}
          </div>
        </div>
      </div>
    );
  }

  if (item.type === 'transit') {
    return (
      <div className="relative flex items-start pl-10">
        {/* Dot */}
        <div className="absolute left-3 w-2 h-2 bg-gray-400 rounded-full"></div>

        {/* Content */}
        <div className="flex-1 p-2">
          <div className="flex items-center text-xs text-gray-600">
            <span>{item.mode === 'walking' ? '🚶' : '🚌'}</span>
            <span className="ml-2">
              {item.travelTime}分
              {item.waitTime > 0 && ` (待ち: ${item.waitTime}分)`}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default Timeline;
