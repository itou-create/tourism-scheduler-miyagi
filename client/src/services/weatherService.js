// 気象庁オープンデータから天気予報を取得
const SENDAI_AREA_CODE = '040010'; // 仙台市の地域コード

export const fetchWeatherForecast = async () => {
  try {
    // 気象庁の天気予報API
    const response = await fetch(
      `https://www.jma.go.jp/bosai/forecast/data/forecast/${SENDAI_AREA_CODE}.json`
    );

    if (!response.ok) {
      throw new Error('天気予報の取得に失敗しました');
    }

    const data = await response.json();

    // データの整形
    if (!data || data.length === 0) {
      return null;
    }

    const timeSeriesData = data[0]?.timeSeries?.[0];
    if (!timeSeriesData) {
      return null;
    }

    const areas = timeSeriesData.areas?.[0];
    const timeDefines = timeSeriesData.timeDefines || [];
    const weathers = areas?.weathers || [];
    const pops = data[0]?.timeSeries?.[1]?.areas?.[0]?.pops || [];

    // 今日と明日の天気情報
    const today = {
      date: timeDefines[0] ? new Date(timeDefines[0]).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }) : '今日',
      weather: weathers[0] || '不明',
      pop: pops[0] || '0',
    };

    const tomorrow = {
      date: timeDefines[1] ? new Date(timeDefines[1]).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }) : '明日',
      weather: weathers[1] || '不明',
      pop: pops[4] || pops[1] || '0', // 明日の降水確率
    };

    return {
      today,
      tomorrow,
      areaName: areas?.area?.name || '仙台市',
    };
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
