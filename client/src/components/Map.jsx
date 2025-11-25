import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leafletのデフォルトアイコンの修正
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// カスタムマーカーアイコン
const createNumberedIcon = (number, color = '#3b82f6') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      ">
        ${number}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

// バス停マーカーアイコン
const createBusStopIcon = (type = 'departure') => {
  const color = type === 'departure' ? '#f97316' : '#10b981'; // オレンジ(出発) / 緑(到着)
  return L.divIcon({
    className: 'bus-stop-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        🚌
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

function LocationSelector({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect({
        lat: e.latlng.lat,
        lon: e.latlng.lng
      });
    },
  });
  return null;
}

function Map({ center, schedule, onLocationSelect }) {
  const [mapCenter, setMapCenter] = useState(center);

  useEffect(() => {
    setMapCenter(center);
  }, [center]);

  // スケジュールからルートの座標を抽出
  const getRouteCoordinates = () => {
    if (!schedule || !schedule.schedule) return [];

    const coords = [];
    schedule.schedule.forEach((item, index) => {
      if (item.type === 'visit' && item.spot) {
        coords.push([item.spot.lat, item.spot.lon]);
      }
    });
    return coords;
  };

  const routeCoordinates = getRouteCoordinates();

  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      className="h-full w-full"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <LocationSelector onLocationSelect={onLocationSelect} />

      {/* スケジュールのマーカー表示 */}
      {schedule && schedule.schedule && schedule.schedule.map((item, index) => {
        if (item.type === 'visit' && item.spot) {
          return (
            <Marker
              key={`spot-${index}`}
              position={[item.spot.lat, item.spot.lon]}
              icon={createNumberedIcon(
                Math.floor(index / 2) + 1,
                '#3b82f6'
              )}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-base mb-1">{item.spot.name}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>到着: {item.arrivalTime}</p>
                    <p>出発: {item.departureTime}</p>
                    <p>滞在: {item.duration}分</p>
                    {item.spot.rating && (
                      <p>評価: ⭐ {item.spot.rating}</p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        }
        return null;
      })}

      {/* バス停マーカー表示 */}
      {schedule && schedule.schedule && schedule.schedule.map((item, index) => {
        if (item.type === 'transit' && item.route && item.mode !== 'walking') {
          const markers = [];

          // 出発バス停
          if (item.route.fromStop) {
            markers.push(
              <Marker
                key={`from-stop-${index}`}
                position={[item.route.fromStop.stop_lat, item.route.fromStop.stop_lon]}
                icon={createBusStopIcon('departure')}
              >
                <Popup>
                  <div className="p-2 min-w-[150px]">
                    <h4 className="font-bold text-sm mb-1">🚌 乗車バス停</h4>
                    <p className="text-sm font-semibold">{item.route.fromStop.stop_name}</p>
                    <p className="text-xs text-gray-600 mt-1">出発: {item.departureTime}</p>
                    {item.routeName && (
                      <p className="text-xs text-blue-600 mt-1">
                        {item.routeName}
                        {item.routeNumber && ` (${item.routeNumber}番)`}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          }

          // 到着バス停
          if (item.route.toStop) {
            markers.push(
              <Marker
                key={`to-stop-${index}`}
                position={[item.route.toStop.stop_lat, item.route.toStop.stop_lon]}
                icon={createBusStopIcon('arrival')}
              >
                <Popup>
                  <div className="p-2 min-w-[150px]">
                    <h4 className="font-bold text-sm mb-1">🚌 降車バス停</h4>
                    <p className="text-sm font-semibold">{item.route.toStop.stop_name}</p>
                    <p className="text-xs text-gray-600 mt-1">到着: {item.arrivalTime}</p>
                  </div>
                </Popup>
              </Marker>
            );
          }

          return markers;
        }
        return null;
      })}

      {/* ルートラインを表示 */}
      {routeCoordinates.length > 1 && (
        <Polyline
          positions={routeCoordinates}
          color="#3b82f6"
          weight={3}
          opacity={0.7}
          dashArray="10, 10"
        />
      )}
    </MapContainer>
  );
}

export default Map;
