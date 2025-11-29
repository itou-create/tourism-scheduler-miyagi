import { useState, useEffect } from 'react';
import { fetchWeatherForecast, getWeatherIcon } from '../services/weatherService';

function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadWeather = async () => {
      try {
        const data = await fetchWeatherForecast();
        setWeather(data);
      } catch (err) {
        console.error('Failed to load weather:', err);
        setError('天気情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadWeather();
  }, []);

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
        <p className="text-xs text-gray-600">天気情報を取得中...</p>
      </div>
    );
  }

  if (error || !weather) {
    return null; // エラー時は非表示
  }

  const highRainChance = parseInt(weather.today.pop) >= 50 || parseInt(weather.tomorrow.pop) >= 50;

  return (
    <div className={`border rounded-lg p-3 mb-3 ${highRainChance ? 'bg-blue-100 border-blue-300' : 'bg-sky-50 border-sky-200'}`}>
      <div className="flex items-center mb-2">
        <svg className="w-4 h-4 text-blue-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
        <h4 className="text-xs font-semibold text-gray-800">天気予報（{weather.areaName}）</h4>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* 今日 */}
        <div className="bg-white rounded p-2">
          <p className="text-gray-500 mb-1">{weather.today.date}</p>
          <div className="flex items-center">
            <span className="text-lg mr-1">{getWeatherIcon(weather.today.weather)}</span>
            <span className="text-gray-700 text-xs">{weather.today.weather}</span>
          </div>
          <p className="text-blue-600 mt-1">降水確率: {weather.today.pop}%</p>
        </div>

        {/* 明日 */}
        <div className="bg-white rounded p-2">
          <p className="text-gray-500 mb-1">{weather.tomorrow.date}</p>
          <div className="flex items-center">
            <span className="text-lg mr-1">{getWeatherIcon(weather.tomorrow.weather)}</span>
            <span className="text-gray-700 text-xs">{weather.tomorrow.weather}</span>
          </div>
          <p className="text-blue-600 mt-1">降水確率: {weather.tomorrow.pop}%</p>
        </div>
      </div>

      {highRainChance && (
        <div className="mt-2 text-xs text-blue-700 bg-blue-50 rounded p-2 flex items-start">
          <svg className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>降水確率が高いため、屋内スポットを優先します</span>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2">
        データ出典: 気象庁オープンデータ
      </p>
    </div>
  );
}

export default WeatherWidget;
