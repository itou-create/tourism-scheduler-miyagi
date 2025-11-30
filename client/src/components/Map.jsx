import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { RAIL_LINES } from '../data/railData';

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

// 出発地マーカーアイコン
const createStartIcon = () => {
  return L.divIcon({
    className: 'start-marker',
    html: `
      <div style="
        background-color: #dc2626;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 16px;
        box-shadow: 0 3px 6px rgba(0,0,0,0.4);
      ">
        🏁
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
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

// 鉄道路線表示コンポーネント
function RailLayer({ visible }) {
  if (!visible) return null;

  return (
    <>
      {RAIL_LINES.map((line, lineIndex) => {
        const positions = line.stations.map(station => [station.lat, station.lon]);
        return (
          <Polyline
            key={`rail-line-${lineIndex}`}
            positions={positions}
            pathOptions={{
              color: line.color,
              weight: 3,
              opacity: 0.8,
              dashArray: '10, 5'
            }}
          >
            <Popup>
              <div className="text-sm">
                <strong>{line.name}</strong>
                <p className="text-xs text-gray-600 mt-1">
                  駅数: {line.stations.length}
                </p>
              </div>
            </Popup>
          </Polyline>
        );
      })}
    </>
  );
}

// 道路に沿ったルート描画コンポーネント
function RoadRoute({ schedule }) {
  const map = useMap();
  const routeLayers = useRef([]);

  useEffect(() => {
    // 既存のルートをクリア
    routeLayers.current.forEach(layer => {
      map.removeLayer(layer);
    });
    routeLayers.current = [];

    if (!schedule || !schedule.schedule) return;

    // スケジュールから移動区間を抽出（より詳細に）
    const transitSegments = [];

    for (let i = 0; i < schedule.schedule.length; i++) {
      const item = schedule.schedule[i];

      if (item.type === 'transit') {
        let segments = [];

        if (item.mode === 'walking') {
          // 徒歩移動
          let fromLat, fromLon, toLat, toLon;

          // 出発地の座標
          if (item.from.lat !== undefined) {
            fromLat = item.from.lat;
            fromLon = item.from.lon;
          } else if (item.from.spot) {
            fromLat = item.from.spot.lat;
            fromLon = item.from.spot.lon;
          }

          // 目的地の座標
          if (item.to.lat !== undefined) {
            toLat = item.to.lat;
            toLon = item.to.lon;
          } else if (item.to.spot) {
            toLat = item.to.spot.lat;
            toLon = item.to.spot.lon;
          }

          if (fromLat && toLat) {
            segments.push({
              fromLat, fromLon, toLat, toLon,
              mode: 'walking',
              label: '🚶 徒歩',
              description: item.isFirstTransit ? '出発地から移動' : '徒歩移動'
            });
          }
        } else {
          // バス移動 - より詳細なセグメントに分割

          // 1. 出発地/観光地からバス停（乗車）までの徒歩
          if (item.route && item.route.fromStop) {
            let startLat, startLon;

            if (item.from.lat !== undefined) {
              startLat = item.from.lat;
              startLon = item.from.lon;
            } else if (item.from.spot) {
              startLat = item.from.spot.lat;
              startLon = item.from.spot.lon;
            }

            if (startLat) {
              const stopLat = item.route.fromStop.stop_lat;
              const stopLon = item.route.fromStop.stop_lon;

              // 座標が異なる場合のみ追加（同じ場所の場合はスキップ）
              const distance = Math.sqrt(
                Math.pow(startLat - stopLat, 2) + Math.pow(startLon - stopLon, 2)
              );

              if (distance > 0.0001) { // 約10m以上離れている場合
                segments.push({
                  fromLat: startLat, fromLon: startLon,
                  toLat: stopLat, toLon: stopLon,
                  mode: 'walking',
                  label: '🚶 徒歩',
                  description: `${item.route.fromStop.stop_name}まで徒歩`
                });
              }
            }
          }

          // 2. バス停間のバス移動
          if (item.route && item.route.fromStop && item.route.toStop) {
            segments.push({
              fromLat: item.route.fromStop.stop_lat,
              fromLon: item.route.fromStop.stop_lon,
              toLat: item.route.toStop.stop_lat,
              toLon: item.route.toStop.stop_lon,
              mode: 'bus',
              routeNumber: item.routeNumber,
              routeName: item.routeName,
              label: `🚌 ${item.routeName || 'バス'}`,
              description: item.routeNumber ? `${item.routeNumber}番` : 'バス移動'
            });
          }

          // 3. バス停（降車）から目的地/観光地までの徒歩
          if (item.route && item.route.toStop) {
            let endLat, endLon;

            if (item.to.lat !== undefined) {
              endLat = item.to.lat;
              endLon = item.to.lon;
            } else if (item.to.spot) {
              endLat = item.to.spot.lat;
              endLon = item.to.spot.lon;
            }

            if (endLat) {
              const stopLat = item.route.toStop.stop_lat;
              const stopLon = item.route.toStop.stop_lon;

              const distance = Math.sqrt(
                Math.pow(endLat - stopLat, 2) + Math.pow(endLon - stopLon, 2)
              );

              if (distance > 0.0001) { // 約10m以上離れている場合
                segments.push({
                  fromLat: stopLat, fromLon: stopLon,
                  toLat: endLat, toLon: endLon,
                  mode: 'walking',
                  label: '🚶 徒歩',
                  description: `${item.route.toStop.stop_name}から徒歩`
                });
              }
            }
          }
        }

        transitSegments.push(...segments);
      }
    }

    // 各区間のルートを取得して描画
    transitSegments.forEach((segment, index) => {
      const { fromLat, fromLon, toLat, toLon, mode, label, description } = segment;

      // OSRM APIでルート取得（徒歩の場合はfoot、バスの場合もfootで道路を取得）
      fetch(`https://router.project-osrm.org/route/v1/foot/${fromLon},${fromLat};${toLon},${toLat}?overview=full&geometries=geojson`)
        .then(response => response.json())
        .then(data => {
          if (data.code === 'Ok' && data.routes && data.routes[0]) {
            const coordinates = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);

            // 色を決定（徒歩=緑の点線、バス=青の実線）
            const color = mode === 'walking' ? '#10b981' : '#3b82f6';
            const weight = mode === 'walking' ? 4 : 5;
            const dashArray = mode === 'walking' ? '8, 12' : null; // 徒歩は点線
            const opacity = mode === 'walking' ? 0.6 : 0.8;

            // ルートを描画
            const polyline = L.polyline(coordinates, {
              color: color,
              weight: weight,
              opacity: opacity,
              dashArray: dashArray
            }).addTo(map);

            // ポップアップを追加
            const popupContent = `
              <div style="min-width: 120px;">
                <strong>${label}</strong><br/>
                <span style="font-size: 12px; color: #666;">${description}</span>
              </div>
            `;

            polyline.bindPopup(popupContent);

            routeLayers.current.push(polyline);
          }
        })
        .catch(error => {
          console.error('ルート取得エラー:', error);
          // エラー時は直線で描画
          const color = mode === 'walking' ? '#10b981' : '#3b82f6';
          const polyline = L.polyline(
            [[fromLat, fromLon], [toLat, toLon]],
            {
              color: color,
              weight: mode === 'walking' ? 4 : 5,
              opacity: 0.5,
              dashArray: '10, 10'
            }
          ).addTo(map);

          const popupContent = `
            <div style="min-width: 120px;">
              <strong>${label}</strong><br/>
              <span style="font-size: 12px; color: #666;">${description} (直線)</span>
            </div>
          `;

          polyline.bindPopup(popupContent);

          routeLayers.current.push(polyline);
        });
    });

    // クリーンアップ
    return () => {
      routeLayers.current.forEach(layer => {
        map.removeLayer(layer);
      });
      routeLayers.current = [];
    };
  }, [schedule, map]);

  return null;
}

function Map({ center, schedule, onLocationSelect }) {
  const [mapCenter, setMapCenter] = useState(center);
  const [showRailLayer, setShowRailLayer] = useState(false); // デフォルトOFF

  useEffect(() => {
    setMapCenter(center);
  }, [center]);

  return (
    <>
      {/* 鉄道路線表示切り替えボタン */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-2">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={showRailLayer}
            onChange={(e) => setShowRailLayer(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm font-medium text-gray-700">鉄道路線を表示</span>
        </label>
        <p className="text-xs text-gray-500 mt-1">Project LINKS</p>
      </div>

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

        {/* 鉄道路線表示 */}
        <RailLayer visible={showRailLayer} />

        {/* 道路に沿ったルート描画 */}
        <RoadRoute schedule={schedule} />

      {/* 出発地マーカー表示 */}
      {schedule && schedule.schedule && schedule.schedule.length > 0 && (() => {
        const firstTransit = schedule.schedule.find(item => item.type === 'transit' && item.isFirstTransit);
        if (firstTransit && firstTransit.from && firstTransit.from.lat) {
          return (
            <Marker
              key="start-location"
              position={[firstTransit.from.lat, firstTransit.from.lon]}
              icon={createStartIcon()}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-base mb-1">🏁 出発地</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>出発時刻: {firstTransit.departureTime}</p>
                    <p>座標: ({firstTransit.from.lat.toFixed(4)}, {firstTransit.from.lon.toFixed(4)})</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        }
        return null;
      })()}

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
    </MapContainer>
    </>
  );
}

export default Map;
