import { useState, useEffect } from 'react';
import LocationMapModal from './LocationMapModal';
import { LOCATION_PRESETS, getPresetLocation } from '../data/locationPresets';

const THEMES = [
  { value: '初めて訪れた人向け', label: '初めて訪れた人向けコース' },
  { value: '2回目の人向け', label: '2回目の人向けコース（穴場スポット）' },
  { value: '歴史とカフェ', label: '歴史とカフェを楽しむコース' },
  { value: '絶景とグルメ', label: '絶景とグルメを満喫コース' },
  { value: 'アクティブ', label: 'アクティブに楽しむコース' },
  { value: 'ファミリー', label: 'ファミリー向けコース' }
];

function SearchForm({ onSubmit, loading, selectedLocation, onLocationChange, selectedTheme, onThemeChange }) {
  // 今日の日付をデフォルトに設定
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD形式
  };

  const [formData, setFormData] = useState({
    theme: selectedTheme || '初めて訪れた人向け',
    date: getTodayDate(),
    startTime: '09:00',
    returnTime: '18:00', // 帰宅予定時刻のデフォルトを18:00に
    visitDuration: 60,
    maxSpots: 5,
    scenicPriority: 3
  });
  const [selectedPreset, setSelectedPreset] = useState('shichigahama');
  const [showMapModal, setShowMapModal] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);

  // 外部から渡されたselectedThemeが変更されたら、formDataを更新
  useEffect(() => {
    if (selectedTheme) {
      setFormData(prev => ({
        ...prev,
        theme: selectedTheme
      }));
    }
  }, [selectedTheme]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'visitDuration' || name === 'maxSpots' || name === 'scenicPriority'
        ? parseInt(value)
        : value
    }));

    // テーマが変更された場合、親コンポーネントにも通知
    if (name === 'theme' && onThemeChange) {
      onThemeChange(value);
    }
  };

  const handleLocationChange = (field, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onLocationChange({
        ...selectedLocation,
        [field]: numValue
      });
    }
  };

  // プリセット選択時
  const handlePresetChange = (e) => {
    const presetId = e.target.value;
    setSelectedPreset(presetId);

    if (presetId === 'custom') {
      setShowManualInput(true);
      return;
    }

    setShowManualInput(false);
    const preset = getPresetLocation(presetId);
    if (preset && preset.lat !== null) {
      onLocationChange({
        lat: preset.lat,
        lon: preset.lon
      });
    }
  };

  // 地図モーダルで位置選択
  const handleMapLocationSelect = (location) => {
    onLocationChange(location);
    setSelectedPreset('custom');
    setShowManualInput(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      location: selectedLocation,
      ...formData,
      preferences: {
        scenicPriority: formData.scenicPriority
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        {/* Location Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            出発地点
          </label>

          {/* プリセット選択 */}
          <select
            value={selectedPreset}
            onChange={handlePresetChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
          >
            {LOCATION_PRESETS.map(preset => (
              <option key={preset.id} value={preset.id}>
                {preset.name} {preset.description && `- ${preset.description}`}
              </option>
            ))}
          </select>

          {/* 地図で選択ボタン */}
          <button
            type="button"
            onClick={() => setShowMapModal(true)}
            className="w-full mb-2 px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-300 rounded-md hover:bg-primary-100 transition-colors flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            地図で選択
          </button>

          {/* 手動入力（「手動入力」選択時のみ表示） */}
          {showManualInput && (
            <div className="space-y-2 mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
              <div>
                <label className="block text-xs text-gray-600 mb-1">緯度</label>
                <input
                  type="number"
                  step="0.0001"
                  value={selectedLocation.lat}
                  onChange={(e) => handleLocationChange('lat', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="例: 38.2606"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">経度</label>
                <input
                  type="number"
                  step="0.0001"
                  value={selectedLocation.lon}
                  onChange={(e) => handleLocationChange('lon', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="例: 140.8817"
                />
              </div>
            </div>
          )}

          {/* 選択中の位置表示 */}
          <p className="text-xs text-gray-600 mt-2">
            📍 緯度 {selectedLocation.lat.toFixed(4)}, 経度 {selectedLocation.lon.toFixed(4)}
          </p>
        </div>

        {/* Theme */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            テーマ
          </label>
          <select
            name="theme"
            value={formData.theme}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {THEMES.map(theme => (
              <option key={theme.value} value={theme.value}>
                {theme.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            訪問日
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={getTodayDate()}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            ※選択された日付に基づいて、平日便・土日祝便を自動判定します
          </p>
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              出発時刻
            </label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              帰宅予定時刻
            </label>
            <input
              type="time"
              name="returnTime"
              value={formData.returnTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Visit Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            各スポットの滞在時間（分）
          </label>
          <input
            type="number"
            name="visitDuration"
            value={formData.visitDuration}
            onChange={handleChange}
            min="15"
            max="180"
            step="15"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Max Spots */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            訪問スポット数
          </label>
          <input
            type="number"
            name="maxSpots"
            value={formData.maxSpots}
            onChange={handleChange}
            min="2"
            max="10"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Scenic Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            景観優先度
          </label>
          <input
            type="range"
            name="scenicPriority"
            value={formData.scenicPriority}
            onChange={handleChange}
            min="0"
            max="5"
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>効率重視</span>
            <span className="font-medium text-primary-600">{formData.scenicPriority}</span>
            <span>景観重視</span>
          </div>
        </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-3 md:py-3 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm text-base min-h-[44px]"
        >
          {loading ? '生成中...' : 'スケジュールを生成'}
        </button>
      </div>

      {/* 地図選択モーダル */}
      <LocationMapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        onLocationSelect={handleMapLocationSelect}
        initialLocation={selectedLocation}
      />
    </form>
  );
}

export default SearchForm;
