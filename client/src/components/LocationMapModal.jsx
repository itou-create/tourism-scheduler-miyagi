import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
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

// 地図の中心を動的に変更
function MapViewController({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

// 地図クリックで位置を選択
function LocationPicker({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      console.log('Map clicked:', e.latlng.lat, e.latlng.lng);
      onLocationSelect({
        lat: e.latlng.lat,
        lon: e.latlng.lng
      });
    },
  });
  return null;
}

function LocationMapModal({ isOpen, onClose, onLocationSelect, initialLocation }) {
  const [selectedLocation, setSelectedLocation] = useState(
    initialLocation || { lat: 38.2606, lon: 140.8817 }
  );

  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
    }
  }, [initialLocation]);

  if (!isOpen) return null;

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
  };

  const handleConfirm = () => {
    onLocationSelect(selectedLocation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl h-[80vh] flex flex-col">
        {/* ヘッダー */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">出発地を地図で選択</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 選択中の位置情報 */}
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-200 flex-shrink-0">
          <div className="text-sm text-gray-700">
            <span className="font-medium">選択中の位置:</span>
            <span className="ml-2">
              緯度 {selectedLocation.lat.toFixed(4)}, 経度 {selectedLocation.lon.toFixed(4)}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            💡 地図上をクリックして位置を選択してください
          </p>
        </div>

        {/* 地図 */}
        <div className="flex-1 relative" style={{ minHeight: '400px' }}>
          <MapContainer
            center={[selectedLocation.lat, selectedLocation.lon]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapViewController center={[selectedLocation.lat, selectedLocation.lon]} />
            <LocationPicker
              onLocationSelect={handleLocationClick}
            />
            {/* 選択中のマーカー */}
            <Marker position={[selectedLocation.lat, selectedLocation.lon]} />
          </MapContainer>
        </div>

        {/* フッター */}
        <div className="px-4 py-3 border-t border-gray-200 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
          >
            この位置に決定
          </button>
        </div>
      </div>
    </div>
  );
}

export default LocationMapModal;
