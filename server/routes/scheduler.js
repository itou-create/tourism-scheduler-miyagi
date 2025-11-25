import express from 'express';
import optimizerService from '../services/optimizerService.js';
import placesService from '../services/placesService.js';

const router = express.Router();

/**
 * POST /api/scheduler/generate
 * 周遊スケジュールを生成
 */
router.post('/generate', async (req, res) => {
  try {
    const {
      location,
      theme,
      startTime,
      visitDuration,
      preferences,
      maxSpots
    } = req.body;

    // バリデーション
    if (!location || !location.lat || !location.lon) {
      return res.status(400).json({
        error: 'Location (lat, lon) is required'
      });
    }

    if (!theme) {
      return res.status(400).json({
        error: 'Theme is required'
      });
    }

    if (!startTime) {
      return res.status(400).json({
        error: 'Start time is required'
      });
    }

    // 観光スポットを検索
    const allSpots = await placesService.searchSpotsByTheme(
      location.lat,
      location.lon,
      theme,
      10000 // 10km radius
    );

    // 出発地からの距離とレーティングを考慮して選択
    const selectedSpots = placesService.selectSpotsNearOrigin(
      allSpots,
      location.lat,
      location.lon,
      maxSpots || 5
    );

    if (selectedSpots.length === 0) {
      return res.status(404).json({
        error: 'No spots found for the given theme and location'
      });
    }

    // スケジュールを生成（出発地情報を含める）
    const schedule = await optimizerService.generateSchedule({
      spots: selectedSpots,
      startTime,
      visitDuration: visitDuration || 60,
      preferences: preferences || {},
      startLocation: {
        lat: location.lat,
        lon: location.lon,
        name: '出発地点'
      }
    });

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('Error generating schedule:', error);
    res.status(500).json({
      error: 'Failed to generate schedule',
      message: error.message
    });
  }
});

/**
 * POST /api/scheduler/optimize
 * 既存のスポットリストを最適化
 */
router.post('/optimize', async (req, res) => {
  try {
    const { spots, startTime, visitDuration, preferences } = req.body;

    if (!spots || spots.length === 0) {
      return res.status(400).json({
        error: 'Spots array is required'
      });
    }

    const schedule = await optimizerService.generateSchedule({
      spots,
      startTime: startTime || '09:00',
      visitDuration: visitDuration || 60,
      preferences: preferences || {}
    });

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('Error optimizing schedule:', error);
    res.status(500).json({
      error: 'Failed to optimize schedule',
      message: error.message
    });
  }
});

export default router;
