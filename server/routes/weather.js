import express from 'express';
import axios from 'axios';

const router = express.Router();

// 気象庁オープンデータから天気予報を取得
const SENDAI_AREA_CODE = '040000'; // 宮城県の地域コード

router.get('/forecast', async (req, res) => {
  try {
    console.log('🌤️ 天気予報を取得中...');

    // 気象庁の天気予報API
    const response = await axios.get(
      `https://www.jma.go.jp/bosai/forecast/data/forecast/${SENDAI_AREA_CODE}.json`,
      {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      }
    );

    if (!response.data || response.data.length === 0) {
      return res.status(404).json({
        success: false,
        error: '天気予報データが見つかりません'
      });
    }

    const data = response.data;
    const timeSeriesData = data[0]?.timeSeries?.[0];

    if (!timeSeriesData) {
      return res.status(404).json({
        success: false,
        error: '天気予報データの形式が不正です'
      });
    }

    const areas = timeSeriesData.areas?.[0];
    const timeDefines = timeSeriesData.timeDefines || [];
    const weathers = areas?.weathers || [];
    const pops = data[0]?.timeSeries?.[1]?.areas?.[0]?.pops || [];

    // 気温データの取得
    const tempData = data[0]?.timeSeries?.[2]?.areas?.[0];
    const temps = tempData?.temps || [];

    // 今日と明日の天気情報
    const today = {
      date: timeDefines[0] ? new Date(timeDefines[0]).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' }) : '今日',
      dateObj: timeDefines[0] || new Date().toISOString(),
      weather: weathers[0] || '不明',
      pop: pops[0] || '0',
      tempMax: temps[0] || null,
      tempMin: temps[1] || null,
    };

    const tomorrow = {
      date: timeDefines[1] ? new Date(timeDefines[1]).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' }) : '明日',
      dateObj: timeDefines[1] || new Date(Date.now() + 86400000).toISOString(),
      weather: weathers[1] || '不明',
      pop: pops[4] || pops[1] || '0',
      tempMax: temps[2] || null,
      tempMin: temps[3] || null,
    };

    const result = {
      today,
      tomorrow,
      areaName: areas?.area?.name || '宮城県',
    };

    console.log('✅ 天気予報を取得しました:', result);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ 天気予報の取得に失敗:', error.message);
    res.status(500).json({
      success: false,
      error: '天気予報の取得に失敗しました',
      details: error.message
    });
  }
});

export default router;
