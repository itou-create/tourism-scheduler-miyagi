import axios from 'axios';
import { config } from '../utils/config.js';
import sendaiOpenDataService from './sendaiOpenDataService.js';

/**
 * Places Service
 * 観光スポット情報を取得（仙台市オープンデータ優先、Google Places APIフォールバック）
 */
class PlacesService {
  constructor() {
    this.apiKey = config.googlePlacesApiKey;
    this.baseUrl = 'https://maps.googleapis.com/maps/api/place';
  }

  /**
   * コース別のテーママッピング
   */
  getCourseThemes(course) {
    const courseMapping = {
      '初めて訪れた人向け': {
        themes: ['自然', '歴史', 'グルメ'],
        weights: [0.4, 0.3, 0.3], // 自然40%, 歴史30%, グルメ30%
        description: '定番スポットをバランスよく周遊'
      },
      '2回目の人向け': {
        themes: ['自然', '歴史', '文化', 'グルメ'],
        weights: [0.3, 0.3, 0.2, 0.2],
        filterFunc: (spot) => spot.rating <= 4.2, // 穴場スポット優先
        description: '知る人ぞ知る穴場スポット'
      },
      '歴史とカフェ': {
        themes: ['歴史', 'グルメ'],
        weights: [0.5, 0.5],
        filterFunc: (spot) => spot.theme === '歴史' || (spot.theme === 'グルメ' && (spot.types?.includes('cafe') || spot.name.includes('カフェ'))),
        description: '歴史スポットとカフェを楽しむ'
      },
      '絶景とグルメ': {
        themes: ['自然', 'グルメ'],
        weights: [0.6, 0.4],
        filterFunc: (spot) => {
          if (spot.theme === '自然') {
            return spot.types?.includes('viewpoint') || spot.name.includes('展望') || spot.name.includes('眺') || spot.rating >= 4.3;
          }
          return spot.theme === 'グルメ';
        },
        description: '絶景ポイントとグルメを満喫'
      },
      'アクティブ': {
        themes: ['エンタメ', '自然'],
        weights: [0.6, 0.4],
        filterFunc: (spot) => spot.types?.includes('activity') || spot.types?.includes('cycling') || spot.types?.includes('beach') || spot.theme === 'エンタメ',
        description: 'アクティビティを楽しむ'
      },
      'ファミリー': {
        themes: ['エンタメ', '自然', '文化'],
        weights: [0.4, 0.4, 0.2],
        filterFunc: (spot) => {
          const familyTypes = ['park', 'beach', 'museum', 'activity', 'gym'];
          return familyTypes.some(type => spot.types?.includes(type)) || ['エンタメ', '自然', '文化'].includes(spot.theme);
        },
        description: '家族みんなで楽しめるスポット'
      }
    };

    return courseMapping[course] || null;
  }

  /**
   * テーマ/コースに基づいて観光スポットを検索
   */
  async searchSpotsByTheme(lat, lon, theme, radius = 5000) {
    console.log(`🔍 searchSpotsByTheme called: theme="${theme}", lat=${lat}, lon=${lon}, radius=${radius}`);

    // まず仙台市オープンデータから検索
    if (sendaiOpenDataService.isDataLoaded()) {
      // コース別の処理
      const courseConfig = this.getCourseThemes(theme);
      console.log(`📋 courseConfig:`, courseConfig ? `Found for "${theme}"` : `Not found for "${theme}"`);

      let openDataSpots = [];

      if (courseConfig) {
        // コースの場合：複数のテーマからスポットを取得してミックス
        console.log(`📋 コース「${theme}」で検索: ${courseConfig.description}`);

        const allSpots = sendaiOpenDataService.getAllSpots();
        console.log(`📊 Total spots in database: ${allSpots.length}`);

        // 位置情報とコースのフィルタでフィルタリング
        const radiusKm = radius / 1000;
        const minDistanceKm = 0.1;

        openDataSpots = allSpots.filter(spot => {
          if (!spot.lat || !spot.lon) return false;

          const distance = this.calculateDistance(lat, lon, spot.lat, spot.lon);
          if (distance < minDistanceKm || distance > radiusKm) return false;

          // コース固有のフィルタを適用
          if (courseConfig.filterFunc) {
            return courseConfig.filterFunc(spot);
          }

          // フィルタ関数がない場合は、テーマで絞り込み
          return courseConfig.themes.includes(spot.theme);
        });

        console.log(`📊 After filtering: ${openDataSpots.length} spots`);

        // テーマごとにバランスよく選択（シャッフルして多様性を確保）
        const spotsByTheme = {};
        courseConfig.themes.forEach(t => {
          spotsByTheme[t] = openDataSpots.filter(s => s.theme === t);
        });

        // 各テーマからランダムに選択してミックス
        const mixed = [];
        const totalCount = Math.min(openDataSpots.length, 20); // 最大20件
        courseConfig.themes.forEach((t, idx) => {
          const count = Math.ceil(totalCount * courseConfig.weights[idx]);
          const themeSpots = spotsByTheme[t] || [];
          // ランダムシャッフル
          const shuffled = themeSpots.sort(() => Math.random() - 0.5);
          mixed.push(...shuffled.slice(0, count));
        });

        openDataSpots = mixed;
      } else {
        // 従来の単一テーマの処理
        openDataSpots = sendaiOpenDataService.getSpotsByTheme(theme);

        // 位置情報でフィルタリング（radiusをkmに変換）
        const radiusKm = radius / 1000;
        const minDistanceKm = 0.1; // 最小距離100m（出発地と同じ場所のスポットを除外）
        openDataSpots = openDataSpots.filter(spot => {
          if (!spot.lat || !spot.lon) return false;
          const distance = this.calculateDistance(lat, lon, spot.lat, spot.lon);
          // 最小距離以上、最大半径以内のスポットのみ
          return distance >= minDistanceKm && distance <= radiusKm;
        });
      }

      if (openDataSpots.length > 0) {
        console.log(`✅ 仙台市オープンデータから${openDataSpots.length}件のスポットを取得`);
        return openDataSpots;
      }
    }

    // オープンデータがない場合、APIキーがあればGoogle Places APIを使用
    if (this.apiKey) {
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

        if (uniqueSpots.length > 0) {
          return uniqueSpots;
        }
      } catch (error) {
        console.error('Error searching spots:', error);
      }
    }

    // 最後のフォールバック：ダミーデータ
    console.log('⚠️  オープンデータとAPIが利用できないため、ダミーデータを使用');
    return this.getDummySpotsByTheme(lat, lon, theme);
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
      // 歴史・文化財
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
        id: 'sendai_9',
        name: '仙台東照宮',
        lat: 38.2782,
        lon: 140.8935,
        rating: 4.3,
        types: ['place_of_worship', 'tourist_attraction'],
        vicinity: '青葉区東照宮1丁目6-1',
        theme: '歴史'
      },
      {
        id: 'sendai_10',
        name: '榴岡天満宮',
        lat: 38.2623,
        lon: 140.8920,
        rating: 4.2,
        types: ['place_of_worship'],
        vicinity: '宮城野区榴岡105-3',
        theme: '歴史'
      },
      {
        id: 'sendai_11',
        name: '輪王寺',
        lat: 38.2731,
        lon: 140.8590,
        rating: 4.4,
        types: ['place_of_worship'],
        vicinity: '青葉区北山1丁目14-1',
        theme: '歴史'
      },

      // 自然・公園
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
        id: 'sendai_12',
        name: '榴岡公園',
        lat: 38.2632,
        lon: 140.8930,
        rating: 4.3,
        types: ['park'],
        vicinity: '宮城野区五輪1丁目',
        theme: '自然'
      },
      {
        id: 'sendai_13',
        name: '西公園',
        lat: 38.2530,
        lon: 140.8660,
        rating: 4.1,
        types: ['park'],
        vicinity: '青葉区桜ヶ岡公園1-3',
        theme: '自然'
      },
      {
        id: 'sendai_14',
        name: '台原森林公園',
        lat: 38.3020,
        lon: 140.8770,
        rating: 4.4,
        types: ['park'],
        vicinity: '青葉区台原森林公園',
        theme: '自然'
      },
      {
        id: 'sendai_15',
        name: '青葉山公園',
        lat: 38.2540,
        lon: 140.8620,
        rating: 4.3,
        types: ['park'],
        vicinity: '青葉区川内',
        theme: '自然'
      },

      // グルメ・飲食
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
        id: 'sendai_8',
        name: '牛たん通り',
        lat: 38.2608,
        lon: 140.8825,
        rating: 4.7,
        types: ['restaurant', 'food'],
        vicinity: '青葉区中央1丁目（仙台駅3F）',
        theme: 'グルメ'
      },
      {
        id: 'sendai_16',
        name: 'ずんだ小径',
        lat: 38.2608,
        lon: 140.8823,
        rating: 4.5,
        types: ['restaurant', 'food'],
        vicinity: '青葉区中央1丁目（仙台駅3F）',
        theme: 'グルメ'
      },
      {
        id: 'sendai_17',
        name: '阿部蒲鉾店 本店',
        lat: 38.2588,
        lon: 140.8735,
        rating: 4.4,
        types: ['store', 'food'],
        vicinity: '青葉区中央2丁目3-18',
        theme: 'グルメ'
      },
      {
        id: 'sendai_18',
        name: '仙台市場',
        lat: 38.2595,
        lon: 140.8810,
        rating: 4.2,
        types: ['market', 'food'],
        vicinity: '若林区卸町4丁目3-1',
        theme: 'グルメ'
      },

      // 芸術・文化
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
        id: 'sendai_6',
        name: '定禅寺通',
        lat: 38.2670,
        lon: 140.8700,
        rating: 4.5,
        types: ['tourist_attraction'],
        vicinity: '青葉区国分町',
        theme: '文化'
      },
      {
        id: 'sendai_19',
        name: 'せんだいメディアテーク',
        lat: 38.2665,
        lon: 140.8708,
        rating: 4.3,
        types: ['museum', 'library'],
        vicinity: '青葉区春日町2-1',
        theme: '文化'
      },
      {
        id: 'sendai_20',
        name: '仙台文学館',
        lat: 38.2930,
        lon: 140.8765,
        rating: 4.2,
        types: ['museum'],
        vicinity: '青葉区北根2丁目7-1',
        theme: '文化'
      },
      {
        id: 'sendai_21',
        name: '東北大学植物園',
        lat: 38.2540,
        lon: 140.8580,
        rating: 4.3,
        types: ['park', 'museum'],
        vicinity: '青葉区川内12-2',
        theme: '文化'
      },
      {
        id: 'sendai_22',
        name: '仙台市科学館',
        lat: 38.2291,
        lon: 140.8570,
        rating: 4.4,
        types: ['museum'],
        vicinity: '青葉区台原森林公園4-1',
        theme: '文化'
      },

      // ショッピング
      {
        id: 'sendai_23',
        name: '仙台三越',
        lat: 38.2605,
        lon: 140.8735,
        rating: 4.1,
        types: ['shopping_mall', 'store'],
        vicinity: '青葉区一番町4丁目8-15',
        theme: 'ショッピング'
      },
      {
        id: 'sendai_24',
        name: '藤崎',
        lat: 38.2612,
        lon: 140.8725,
        rating: 4.0,
        types: ['shopping_mall', 'store'],
        vicinity: '青葉区一番町3丁目2-17',
        theme: 'ショッピング'
      },
      {
        id: 'sendai_25',
        name: 'S-PAL仙台',
        lat: 38.2608,
        lon: 140.8820,
        rating: 4.2,
        types: ['shopping_mall'],
        vicinity: '青葉区中央1丁目1-1',
        theme: 'ショッピング'
      },
      {
        id: 'sendai_26',
        name: 'アエル',
        lat: 38.2602,
        lon: 140.8820,
        rating: 4.0,
        types: ['shopping_mall'],
        vicinity: '青葉区中央1丁目3-1',
        theme: 'ショッピング'
      },
      {
        id: 'sendai_27',
        name: '仙台PARCO',
        lat: 38.2615,
        lon: 140.8730,
        rating: 4.1,
        types: ['shopping_mall'],
        vicinity: '青葉区中央1丁目2-3',
        theme: 'ショッピング'
      },

      // エンターテイメント
      {
        id: 'sendai_28',
        name: '仙台うみの杜水族館',
        lat: 38.2850,
        lon: 141.0520,
        rating: 4.6,
        types: ['aquarium', 'tourist_attraction'],
        vicinity: '宮城野区中野4丁目6',
        theme: 'エンタメ'
      },
      {
        id: 'sendai_29',
        name: '八木山ベニーランド',
        lat: 38.2270,
        lon: 140.8430,
        rating: 4.2,
        types: ['amusement_park'],
        vicinity: '太白区長町越路19-1',
        theme: 'エンタメ'
      },
      {
        id: 'sendai_30',
        name: '仙台市天文台',
        lat: 38.2910,
        lon: 140.7800,
        rating: 4.5,
        types: ['museum'],
        vicinity: '青葉区錦ケ丘9丁目29-32',
        theme: 'エンタメ'
      },
      {
        id: 'sendai_31',
        name: '八木山動物公園',
        lat: 38.2250,
        lon: 140.8480,
        rating: 4.4,
        types: ['zoo', 'tourist_attraction'],
        vicinity: '太白区八木山本町1丁目43',
        theme: 'エンタメ'
      },

      // 七ヶ浜町エリア
      {
        id: 'shichigahama_1',
        name: '七ヶ浜国際村',
        lat: 38.3080,
        lon: 141.0580,
        rating: 4.2,
        types: ['tourist_attraction', 'museum'],
        vicinity: '宮城郡七ヶ浜町花渕浜大山1-1',
        theme: '文化'
      },
      {
        id: 'shichigahama_2',
        name: '菖蒲田浜海水浴場',
        lat: 38.2980,
        lon: 141.0650,
        rating: 4.3,
        types: ['tourist_attraction', 'natural_feature'],
        vicinity: '宮城郡七ヶ浜町菖蒲田浜',
        theme: '自然'
      },
      {
        id: 'shichigahama_3',
        name: '花渕浜',
        lat: 38.3050,
        lon: 141.0600,
        rating: 4.1,
        types: ['tourist_attraction', 'natural_feature'],
        vicinity: '宮城郡七ヶ浜町花渕浜',
        theme: '自然'
      },
      {
        id: 'shichigahama_4',
        name: '君ヶ岡公園',
        lat: 38.3020,
        lon: 141.0520,
        rating: 4.0,
        types: ['park', 'tourist_attraction'],
        vicinity: '宮城郡七ヶ浜町君ヶ岡',
        theme: '自然'
      },
      {
        id: 'shichigahama_5',
        name: '七ヶ浜町歴史資料館',
        lat: 38.3070,
        lon: 141.0540,
        rating: 3.8,
        types: ['museum'],
        vicinity: '宮城郡七ヶ浜町境山2-1-1',
        theme: '歴史'
      },

      // 塩釜市エリア
      {
        id: 'shiogama_1',
        name: '鹽竈神社',
        lat: 38.3152,
        lon: 141.0207,
        rating: 4.6,
        types: ['place_of_worship', 'tourist_attraction'],
        vicinity: '塩釜市一森山1-1',
        theme: '歴史'
      },
      {
        id: 'shiogama_2',
        name: 'マリンゲート塩釜',
        lat: 38.3130,
        lon: 141.0260,
        rating: 4.2,
        types: ['shopping_mall', 'tourist_attraction'],
        vicinity: '塩釜市港町1-4-1',
        theme: 'ショッピング'
      },
      {
        id: 'shiogama_3',
        name: '塩釜市魚市場',
        lat: 38.3100,
        lon: 141.0290,
        rating: 4.3,
        types: ['market', 'food'],
        vicinity: '塩釜市新浜町1-20-74',
        theme: 'グルメ'
      },
      {
        id: 'shiogama_4',
        name: '塩釜水産物仲卸市場',
        lat: 38.3105,
        lon: 141.0275,
        rating: 4.4,
        types: ['market', 'food'],
        vicinity: '塩釜市新浜町1-20-74',
        theme: 'グルメ'
      },
      {
        id: 'shiogama_5',
        name: '御釜神社',
        lat: 38.3140,
        lon: 141.0220,
        rating: 4.1,
        types: ['place_of_worship'],
        vicinity: '塩釜市本町6-1',
        theme: '歴史'
      },
      {
        id: 'shiogama_6',
        name: '塩釜市杉村惇美術館',
        lat: 38.3155,
        lon: 141.0195,
        rating: 3.9,
        types: ['museum', 'art_gallery'],
        vicinity: '塩釜市本町8-1',
        theme: '文化'
      },

      // 松島周辺（七ヶ浜の近く）
      {
        id: 'matsushima_1',
        name: '松島海岸',
        lat: 38.3680,
        lon: 141.0640,
        rating: 4.7,
        types: ['tourist_attraction', 'natural_feature'],
        vicinity: '宮城郡松島町松島',
        theme: '自然'
      },
      {
        id: 'matsushima_2',
        name: '瑞巌寺',
        lat: 38.3750,
        lon: 141.0630,
        rating: 4.6,
        types: ['place_of_worship', 'tourist_attraction'],
        vicinity: '宮城郡松島町松島町内91',
        theme: '歴史'
      },
      {
        id: 'matsushima_3',
        name: '五大堂',
        lat: 38.3720,
        lon: 141.0660,
        rating: 4.5,
        types: ['place_of_worship', 'tourist_attraction'],
        vicinity: '宮城郡松島町松島町内111',
        theme: '歴史'
      },
      {
        id: 'matsushima_4',
        name: '円通院',
        lat: 38.3760,
        lon: 141.0625,
        rating: 4.5,
        types: ['place_of_worship', 'tourist_attraction'],
        vicinity: '宮城郡松島町松島町内67',
        theme: '歴史'
      }
    ];

    // typeが指定されている場合、そのtypeを含むスポットのみ返す
    if (type) {
      return allSpots.filter(spot => spot.types.includes(type));
    }

    return allSpots;
  }

  /**
   * テーマに基づいてダミースポットを取得
   */
  getDummySpotsByTheme(lat, lon, theme) {
    const allSpots = this.getDummySpots(lat, lon);

    if (!theme) {
      return allSpots;
    }

    // themeで絞り込む
    return allSpots.filter(spot => spot.theme === theme);
  }

  /**
   * 2地点間の距離を計算（Haversine formula）
   * @returns 距離（km）
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 地球の半径（km）
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * 度をラジアンに変換
   */
  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * スポットのスコアを計算（距離とレーティングを考慮）
   */
  calculateSpotScore(spot, originLat, originLon) {
    const distance = this.calculateDistance(originLat, originLon, spot.lat, spot.lon);
    const rating = spot.rating || 3.0;

    // 距離スコア: 近いほど高い（最大10km想定）
    const distanceScore = Math.max(0, 10 - distance) / 10;

    // レーティングスコア: 5点満点を1.0に正規化
    const ratingScore = rating / 5.0;

    // 総合スコア: レーティング60%、距離40%の重み付け
    return ratingScore * 0.6 + distanceScore * 0.4;
  }

  /**
   * 出発地を考慮してスポットを選定
   */
  selectSpotsNearOrigin(spots, originLat, originLon, maxSpots = 5) {
    // 各スポットにスコアを付与
    const spotsWithScore = spots.map(spot => ({
      ...spot,
      score: this.calculateSpotScore(spot, originLat, originLon),
      distance: this.calculateDistance(originLat, originLon, spot.lat, spot.lon)
    }));

    // スコアでソートして上位を選択
    return spotsWithScore
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSpots);
  }
}

export default new PlacesService();
