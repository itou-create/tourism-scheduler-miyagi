// バックエンドAPI経由で天気予報を取得
export const fetchWeatherForecast = async () => {
  try {
    // バックエンドの天気APIを呼び出す
    const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
    const response = await fetch(`${API_BASE_URL}/weather/forecast`);

    if (!response.ok) {
      throw new Error('天気予報の取得に失敗しました');
    }

    const json = await response.json();

    if (!json.success || !json.data) {
      throw new Error(json.error || '天気予報データが不正です');
    }

    console.log('🌤️ 天気情報を取得しました:', json.data);
    return json.data;
  } catch (error) {
    console.error('Weather fetch error:', error);
    return null;
  }
};

// 降水確率から屋内優先フラグを判定
export const shouldPrioritizeIndoor = (weatherData) => {
  if (!weatherData) return false;

  const todayPop = parseInt(weatherData.today.pop) || 0;
  const tomorrowPop = parseInt(weatherData.tomorrow.pop) || 0;

  // 降水確率が50%以上の場合は屋内を優先
  return todayPop >= 50 || tomorrowPop >= 50;
};

// 天気アイコンを取得
export const getWeatherIcon = (weather) => {
  if (!weather) return '☀️';

  if (weather.includes('晴')) return '☀️';
  if (weather.includes('曇')) return '☁️';
  if (weather.includes('雨')) return '🌧️';
  if (weather.includes('雪')) return '❄️';

  return '☀️';
};
