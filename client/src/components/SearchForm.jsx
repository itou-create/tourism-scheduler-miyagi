import { useState } from 'react';

const THEMES = [
  { value: '歴史', label: '歴史・文化財' },
  { value: '自然', label: '自然・公園' },
  { value: 'グルメ', label: 'グルメ・飲食' },
  { value: '文化', label: '芸術・文化' },
  { value: 'ショッピング', label: 'ショッピング' },
  { value: 'エンタメ', label: 'エンターテイメント' }
];

function SearchForm({ onSubmit, loading, selectedLocation, onLocationChange }) {
  const [formData, setFormData] = useState({
    theme: '歴史',
    startTime: '09:00',
    visitDuration: 60,
    maxSpots: 5,
    scenicPriority: 3
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'visitDuration' || name === 'maxSpots' || name === 'scenicPriority'
        ? parseInt(value)
        : value
    }));
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
    <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="p-3 pb-2 md:p-4 md:pb-2 flex-shrink-0">
        <h2 className="text-base md:text-lg font-semibold text-gray-800">検索条件</h2>
      </div>

      {/* Scrollable Form Fields */}
      <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-3 md:px-4 md:space-y-4 min-h-0">
        {/* Location Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            出発地点
          </label>
          <div className="space-y-2">
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
          <p className="text-xs text-gray-500 mt-1">
            💡 地図をクリックしても変更できます
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

        {/* Start Time */}
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
      </div>

      {/* Fixed Submit Button */}
      <div className="p-3 pt-3 md:p-4 md:pt-3 border-t border-gray-100 flex-shrink-0 bg-white" style={{ minHeight: '72px' }}>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-3 md:py-3 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm text-base min-h-[44px]"
        >
          {loading ? '生成中...' : 'スケジュールを生成'}
        </button>
      </div>
    </form>
  );
}

export default SearchForm;
