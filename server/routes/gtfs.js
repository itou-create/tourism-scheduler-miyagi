import express from 'express';
import gtfsService from '../services/gtfsService.js';

const router = express.Router();

/**
 * GET /api/gtfs/routes
 * すべてのルート情報を取得
 */
router.get('/routes', async (req, res) => {
  try {
    const routes = await gtfsService.getAllRoutes();
    res.json({
      success: true,
      data: routes
    });
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({
      error: 'Failed to fetch routes',
      message: error.message
    });
  }
});

/**
 * GET /api/gtfs/stops/nearby
 * 近隣の停留所を検索
 */
router.get('/stops/nearby', async (req, res) => {
  try {
    const { lat, lon, radius } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        error: 'Latitude and longitude are required'
      });
    }

    const stops = await gtfsService.findNearbyStops(
      parseFloat(lat),
      parseFloat(lon),
      parseFloat(radius) || 0.5
    );

    res.json({
      success: true,
      data: stops
    });
  } catch (error) {
    console.error('Error finding nearby stops:', error);
    res.status(500).json({
      error: 'Failed to find nearby stops',
      message: error.message
    });
  }
});

/**
 * GET /api/gtfs/stops/:stopId
 * 特定の停留所情報を取得
 */
router.get('/stops/:stopId', async (req, res) => {
  try {
    const { stopId } = req.params;
    const stop = await gtfsService.getStopById(stopId);

    if (!stop) {
      return res.status(404).json({
        error: 'Stop not found'
      });
    }

    res.json({
      success: true,
      data: stop
    });
  } catch (error) {
    console.error('Error fetching stop:', error);
    res.status(500).json({
      error: 'Failed to fetch stop',
      message: error.message
    });
  }
});

/**
 * GET /api/gtfs/departures/:stopId
 * 指定停留所の出発時刻を取得
 */
router.get('/departures/:stopId', async (req, res) => {
  try {
    const { stopId } = req.params;
    const { afterTime, limit } = req.query;

    const departures = await gtfsService.getNextDepartures(
      stopId,
      afterTime || '00:00',
      parseInt(limit) || 10
    );

    res.json({
      success: true,
      data: departures
    });
  } catch (error) {
    console.error('Error fetching departures:', error);
    res.status(500).json({
      error: 'Failed to fetch departures',
      message: error.message
    });
  }
});

export default router;
