import axios from 'axios';
import { config } from '../utils/config.js';

/**
 * Places Service
 * Google Places APIを使用して観光スポット情報を取得
 */
class PlacesService {
  constructor() {
    this.apiKey = config.googlePlacesApiKey;
    this.baseUrl = 'https://maps.googleapis.com/maps/api/place';
  }

  /**
   * テーマに基づいて観光スポットを検索
   */
  async searchSpotsByTheme(lat, lon, theme, radius = 5000) {
    const typeMapping = {
      '歴史': ['museum', 'tourist_attraction', 'place_of_worship'],
      '自然': ['park', 'natural_feature'],
      'グルメ': ['restaurant', 'cafe', 'food'],
      '文化': ['art_gallery', 'museum', 'library'],
      'ショッピング': ['shopping_mall', 'store'],
      'エンタメ': ['amusement_park', 'movie_theater', 'night_club']
    };

    const types = typeMapping[theme] || ['tourist_attraction'];
    const spots = [];

    try {
      for (const type of types) {
        const results = await this.nearbySearch(lat, lon, radius, type);
        spots.push(...results);
      }

      // 重複を除去（idベース）
      const uniqueSpots = Array.from(
        new Map(spots.map(spot => [spot.id, spot])).values()
      );

      return uniqueSpots;
    } catch (error) {
      console.error('Error searching spots:', error);
      throw error;
    }
  }

  /**
   * 近隣検索を実行
   */
  async nearbySearch(lat, lon, radius, type) {
    if (!this.apiKey) {
      // APIキーがない場合はダミーデータを返す
      return this.getDummySpots(lat, lon, type);
    }

    try {
      const response = await axios.get(`${this.baseUrl}/nearbysearch/json`, {
        params: {
          location: `${lat},${lon}`,
          radius,
          type,
          key: this.apiKey,
          language: 'ja'
        }
      });

      if (response.data.status === 'OK') {
        return response.data.results.map(place => ({
          id: place.place_id,
          name: place.name,
          lat: place.geometry.location.lat,
          lon: place.geometry.location.lng,
          rating: place.rating || 0,
          types: place.types,
          vicinity: place.vicinity,
          photos: place.photos || []
        }));
      }

      return [];
    } catch (error) {
      console.error('Places API error:', error.message);
      return this.getDummySpots(lat, lon, type);
    }
  }

  /**
   * スポットの詳細情報を取得
   */
  async getPlaceDetails(placeId) {
    if (!this.apiKey) {
      return null;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/details/json`, {
        params: {
          place_id: placeId,
          fields: 'name,rating,formatted_address,geometry,opening_hours,website,photos',
          key: this.apiKey,
          language: 'ja'
        }
      });

      if (response.data.status === 'OK') {
        return response.data.result;
      }

      return null;
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  }

  /**
   * ダミーの観光スポットデータを生成（開発・デモ用 - 宮城県仙台市）
   */
  getDummySpots(lat, lon, type) {
    const allSpots = [
      {
        id: 'sendai_1',
        name: '仙台城跡（青葉城址）',
        lat: 38.2555,
        lon: 140.8636,
        rating: 4.5,
        types: ['museum', 'tourist_attraction'],
        vicinity: '青葉区川内1',
        theme: '歴史'
      },
      {
        id: 'sendai_2',
        name: '勾当台公園',
        lat: 38.2687,
        lon: 140.8720,
        rating: 4.2,
        types: ['park'],
        vicinity: '青葉区本町3丁目',
        theme: '自然'
      },
      {
        id: 'sendai_3',
        name: '仙台朝市',
        lat: 38.2595,
        lon: 140.8798,
        rating: 4.3,
        types: ['market', 'food'],
        vicinity: '青葉区中央4丁目',
        theme: 'グルメ'
      },
      {
        id: 'sendai_4',
        name: '仙台市博物館',
        lat: 38.2526,
        lon: 140.8608,
        rating: 4.4,
        types: ['museum'],
        vicinity: '青葉区川内26',
        theme: '文化'
      },
      {
        id: 'sendai_5',
        name: '瑞鳳殿',
        lat: 38.2495,
        lon: 140.8797,
        rating: 4.6,
        types: ['tourist_attraction', 'place_of_worship'],
        vicinity: '青葉区霊屋下23-2',
        theme: '歴史'
      },
      {
        id: 'sendai_6',
        name: '定禅寺通',
        lat: 38.2670,
        lon: 140.8700,
        rating: 4.5,
        types: ['tourist_attraction'],
        vicinity: '青葉区国分町',
        theme: '景観'
      },
      {
        id: 'sendai_7',
        name: '大崎八幡宮',
        lat: 38.2780,
        lon: 140.8520,
        rating: 4.5,
        types: ['place_of_worship', 'tourist_attraction'],
        vicinity: '青葉区八幡4丁目6-1',
        theme: '歴史'
      },
      {
        id: 'sendai_8',
        name: '牛たん通り',
        lat: 38.2608,
        lon: 140.8825,
        rating: 4.7,
        types: ['restaurant', 'food'],
        vicinity: '青葉区中央1丁目（仙台駅3F）',
        theme: 'グルメ'
      }
    ];

    // typeが指定されている場合、そのtypeを含むスポットのみ返す
    // typeが指定されていない場合は全てを返す
    if (type) {
      return allSpots.filter(spot => spot.types.includes(type));
    }

    return allSpots;
  }
}

export default new PlacesService();
