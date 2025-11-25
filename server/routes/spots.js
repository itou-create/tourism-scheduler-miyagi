import express from 'express';
import placesService from '../services/placesService.js';

const router = express.Router();

/**
 * GET /api/spots/search
 * テーマ別観光スポット検索
 */
router.get('/search', async (req, res) => {
  try {
    const { lat, lon, theme, radius } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        error: 'Latitude and longitude are required'
      });
    }

    if (!theme) {
      return res.status(400).json({
        error: 'Theme is required'
      });
    }

    const spots = await placesService.searchSpotsByTheme(
      parseFloat(lat),
      parseFloat(lon),
      theme,
      parseInt(radius) || 5000
    );

    res.json({
      success: true,
      data: spots
    });
  } catch (error) {
    console.error('Error searching spots:', error);
    res.status(500).json({
      error: 'Failed to search spots',
      message: error.message
    });
  }
});

/**
 * GET /api/spots/:placeId
 * スポット詳細情報を取得
 */
router.get('/:placeId', async (req, res) => {
  try {
    const { placeId } = req.params;
    const details = await placesService.getPlaceDetails(placeId);

    if (!details) {
      return res.status(404).json({
        error: 'Place not found'
      });
    }

    res.json({
      success: true,
      data: details
    });
  } catch (error) {
    console.error('Error fetching place details:', error);
    res.status(500).json({
      error: 'Failed to fetch place details',
      message: error.message
    });
  }
});

export default router;
