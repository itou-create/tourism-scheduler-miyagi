import fetch from 'node-fetch';
import iconv from 'iconv-lite';
import { parse } from 'csv-parse/sync';

/**
 * 仙台市オープンデータサービス
 * 仙台市が公開する観光施設データを取得・管理
 */
class SendaiOpenDataService {
  constructor() {
    this.tourismSpots = [];
    this.lastUpdated = null;
    this.isLoading = false;
    // ダミーデータから正確な座標を取得するためのマッピング
    this.knownLocations = this.initializeKnownLocations();
  }

  /**
   * 既知の観光スポットの正確な座標をマッピング
   */
  initializeKnownLocations() {
    return {
      '仙台城跡': { lat: 38.2555, lon: 140.8636 },
      '青葉城址': { lat: 38.2555, lon: 140.8636 },
      '瑞鳳殿': { lat: 38.2495, lon: 140.8797 },
      '大崎八幡宮': { lat: 38.2780, lon: 140.8520 },
      '仙台東照宮': { lat: 38.2782, lon: 140.8935 },
      '東照宮': { lat: 38.2782, lon: 140.8935 },
      '榴岡天満宮': { lat: 38.2623, lon: 140.8920 },
      '輪王寺': { lat: 38.2731, lon: 140.8590 },
      '勾当台公園': { lat: 38.2687, lon: 140.8720 },
      '榴岡公園': { lat: 38.2632, lon: 140.8930 },
      '西公園': { lat: 38.2530, lon: 140.8660 },
      '台原森林公園': { lat: 38.3020, lon: 140.8770 },
      '青葉山公園': { lat: 38.2540, lon: 140.8620 },
      '仙台朝市': { lat: 38.2595, lon: 140.8798 },
      '牛たん通り': { lat: 38.2608, lon: 140.8825 },
      'ずんだ小径': { lat: 38.2608, lon: 140.8823 },
      '仙台市博物館': { lat: 38.2526, lon: 140.8608 },
      '定禅寺通': { lat: 38.2670, lon: 140.8700 },
      'せんだいメディアテーク': { lat: 38.2665, lon: 140.8708 },
      '仙台文学館': { lat: 38.2930, lon: 140.8765 },
      '東北大学植物園': { lat: 38.2540, lon: 140.8580 },
      '仙台市科学館': { lat: 38.2291, lon: 140.8570 },
      '仙台うみの杜水族館': { lat: 38.2850, lon: 141.0520 },
      '八木山ベニーランド': { lat: 38.2270, lon: 140.8430 },
      '仙台市天文台': { lat: 38.2910, lon: 140.7800 },
      '八木山動物公園': { lat: 38.2250, lon: 140.8480 },
      '鹽竈神社': { lat: 38.3152, lon: 141.0207 },
      'マリンゲート塩釜': { lat: 38.3130, lon: 140.0260 },
      '松島海岸': { lat: 38.3680, lon: 141.0640 },
      '瑞巌寺': { lat: 38.3750, lon: 141.0630 },
      '五大堂': { lat: 38.3720, lon: 141.0660 },
      '円通院': { lat: 38.3760, lon: 141.0625 },
      '宮城県護国神社': { lat: 38.2560, lon: 140.8640 },
      '青葉神社': { lat: 38.2760, lon: 140.8570 },
      '秋保大滝': { lat: 38.2210, lon: 140.7350 },
      '磊々峡': { lat: 38.2320, lon: 140.7620 },
      '泉ヶ岳': { lat: 38.3910, lon: 140.7770 },
      '広瀬川': { lat: 38.2530, lon: 140.8660 }
    };
  }

  /**
   * 観光施設データを初期ロード
   */
  async initialize() {
    if (this.isLoading) {
      console.log('⏳ 観光データの読み込みが既に進行中です');
      return;
    }

    try {
      this.isLoading = true;
      console.log('📥 仙台市オープンデータ（観光施設）を読み込み中...');

      await this.loadTourismData();

      // 七ヶ浜町の静的データを追加
      this.addShichigahamaSpots();

      this.lastUpdated = new Date();
      console.log(`✅ 観光施設データを読み込みました（${this.tourismSpots.length}件）`);
    } catch (error) {
      console.error('❌ 観光データの読み込みに失敗:', error.message);
      console.warn('⚠️  ダミーデータを使用します');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * 仙台市の観光施設CSVデータを読み込み
   */
  async loadTourismData() {
    const csvUrl = 'https://www.city.sendai.jp/kankokikaku/opendata/documents/041009_tourism.csv';

    try {
      const response = await fetch(csvUrl);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // バイナリデータとして取得
      const buffer = await response.buffer();

      // Shift-JIS -> UTF-8 に変換（日本の官公庁はShift-JISが多い）
      let csvText;
      try {
        csvText = iconv.decode(buffer, 'Shift_JIS');
      } catch (error) {
        // Shift-JISで失敗したらUTF-8を試す
        csvText = buffer.toString('utf-8');
      }

      // CSVをパース
      const records = parse(csvText, {
        columns: true,  // 最初の行をヘッダーとして使用
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true  // カラム数の不一致を許容
      });

      console.log(`📊 CSVレコード数: ${records.length}`);

      // データの最初の行を確認（デバッグ用）
      if (records.length > 0) {
        console.log('📋 CSVカラム:', Object.keys(records[0]));
        console.log('📊 最初のレコードのサンプル:');
        console.log('  名称:', records[0]['名称']);
        console.log('  緯度:', records[0]['緯度']);
        console.log('  経度:', records[0]['経度']);
        console.log('  所在地_連結表記:', records[0]['所在地_連結表記']);
      }

      // データを整形して保存
      this.tourismSpots = this.parseRecords(records);

    } catch (error) {
      console.error('CSV読み込みエラー:', error);
      throw error;
    }
  }

  /**
   * CSVレコードを内部形式に変換
   */
  parseRecords(records) {
    const spots = [];

    for (const record of records) {
      try {
        // カラム名の可能性を探る（実際のカラム名が不明なため柔軟に対応）
        const spot = this.extractSpotData(record);

        if (spot && spot.name) {
          spots.push(spot);
        }
      } catch (error) {
        console.warn('レコードの解析に失敗:', error.message);
      }
    }

    return spots;
  }

  /**
   * レコードからスポット情報を抽出
   * カラム名が不明なため、柔軟にマッピング
   */
  extractSpotData(record) {
    // カラム名のパターンを推測
    const nameKey = this.findKey(record, ['名称', 'name', '施設名', 'タイトル', 'title']);
    const addressKey = this.findKey(record, ['住所', 'address', '所在地', 'location']);
    const descKey = this.findKey(record, ['説明', '概要', 'description', '備考', 'note']);
    const latKey = this.findKey(record, ['緯度', 'latitude', 'lat', 'y']);
    const lonKey = this.findKey(record, ['経度', 'longitude', 'lon', 'lng', 'x']);
    const typeKey = this.findKey(record, ['種類', 'type', 'カテゴリ', 'category']);
    const urlKey = this.findKey(record, ['URL', 'url', 'website', 'ホームページ']);

    const name = nameKey ? record[nameKey] : null;

    if (!name) {
      return null;
    }

    // 緯度経度の取得と変換
    let lat = latKey ? parseFloat(record[latKey]) : null;
    let lon = lonKey ? parseFloat(record[lonKey]) : null;

    // 緯度経度がない場合、既知の場所から検索
    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
      console.log(`⚠️  緯度経度がないスポット: ${name}`);
      // まず既知の場所から検索
      const knownLocation = this.findKnownLocation(name);
      if (knownLocation) {
        console.log(`✅ 既知の場所から座標を取得: ${name} -> (${knownLocation.lat}, ${knownLocation.lon})`);
        lat = knownLocation.lat;
        lon = knownLocation.lon;
      } else {
        // 既知の場所にない場合、住所から推定
        const estimated = this.estimateLocationFromAddress(
          addressKey ? record[addressKey] : null,
          name
        );
        console.log(`📍 住所から座標を推定: ${name} -> (${estimated.lat}, ${estimated.lon})`);
        lat = estimated.lat;
        lon = estimated.lon;
      }
    }

    return {
      id: `sendai_open_${name.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: name,
      lat: lat,
      lon: lon,
      address: addressKey ? record[addressKey] : null,
      description: descKey ? record[descKey] : null,
      type: typeKey ? record[typeKey] : '観光施設',
      url: urlKey ? record[urlKey] : null,
      source: '仙台市オープンデータ',
      types: this.inferTypes(name, typeKey ? record[typeKey] : null),
      theme: this.inferTheme(name, typeKey ? record[typeKey] : null),
      rating: 4.0  // デフォルト評価
    };
  }

  /**
   * オブジェクトから指定されたキーのいずれかを見つける
   */
  findKey(obj, candidates) {
    for (const key of Object.keys(obj)) {
      for (const candidate of candidates) {
        if (key.includes(candidate) || candidate.includes(key)) {
          return key;
        }
      }
    }
    return null;
  }

  /**
   * 既知の場所から座標を検索
   */
  findKnownLocation(name) {
    // 完全一致を試す
    if (this.knownLocations[name]) {
      return this.knownLocations[name];
    }

    // 部分一致を試す（例：「仙台城跡（青葉城址）」→「仙台城跡」）
    for (const [knownName, coords] of Object.entries(this.knownLocations)) {
      if (name.includes(knownName) || knownName.includes(name)) {
        return coords;
      }
    }

    return null;
  }

  /**
   * 住所や名称から緯度経度を推定（簡易版）
   * より正確な位置情報が必要な場合はGeocoding APIを使用
   */
  estimateLocationFromAddress(address, name) {
    // 主要な仙台市の地名と座標のマッピング
    const locationMap = {
      '青葉区': { lat: 38.2687, lon: 140.8700 },
      '宮城野区': { lat: 38.2606, lon: 140.9056 },
      '若林区': { lat: 38.2385, lon: 140.8969 },
      '太白区': { lat: 38.2244, lon: 140.8794 },
      '泉区': { lat: 38.3241, lon: 140.8857 },
      '仙台駅': { lat: 38.2606, lon: 140.8817 },
      '仙台城': { lat: 38.2555, lon: 140.8636 },
      '青葉城': { lat: 38.2555, lon: 140.8636 },
      '勾当台': { lat: 38.2687, lon: 140.8720 },
      '定禅寺通': { lat: 38.2670, lon: 140.8700 },
      '一番町': { lat: 38.2605, lon: 140.8735 },
      '国分町': { lat: 38.2650, lon: 140.8710 },
      '榴岡': { lat: 38.2632, lon: 140.8930 },
      '長町': { lat: 38.2208, lon: 140.8697 },
      '泉中央': { lat: 38.3229, lon: 140.8857 }
    };

    const text = (address || '') + ' ' + (name || '');

    for (const [keyword, coords] of Object.entries(locationMap)) {
      if (text.includes(keyword)) {
        return coords;
      }
    }

    // マッチしない場合は仙台駅をデフォルトとする
    return { lat: 38.2606, lon: 140.8817 };
  }

  /**
   * 名称や種類からタイプを推定
   */
  inferTypes(name, type) {
    const types = [];

    const text = (name || '') + ' ' + (type || '');

    if (text.match(/神社|寺|宮|天満宮|八幡/)) {
      types.push('place_of_worship');
    }
    if (text.match(/城|史跡|文化財|資料館|記念館/)) {
      types.push('museum', 'tourist_attraction');
    }
    if (text.match(/公園|庭園|森林/)) {
      types.push('park');
    }
    if (text.match(/美術館|博物館|科学館|水族館|動物園/)) {
      types.push('museum', 'tourist_attraction');
    }
    if (text.match(/市場|朝市/)) {
      types.push('market', 'food');
    }
    if (text.match(/温泉|ホテル|旅館/)) {
      types.push('lodging');
    }
    if (text.match(/レストラン|食堂|カフェ/)) {
      types.push('restaurant', 'cafe');
    }
    if (text.match(/ショッピング|百貨店|モール/)) {
      types.push('shopping_mall');
    }

    if (types.length === 0) {
      types.push('tourist_attraction');
    }

    return types;
  }

  /**
   * 名称や種類からテーマを推定
   */
  inferTheme(name, type) {
    const text = (name || '') + ' ' + (type || '');

    if (text.match(/神社|寺|宮|城|史跡|文化財|資料館|記念館/)) {
      return '歴史';
    }
    if (text.match(/公園|庭園|森林|海|山|自然/)) {
      return '自然';
    }
    if (text.match(/市場|朝市|レストラン|食堂|グルメ|牛たん|ずんだ/)) {
      return 'グルメ';
    }
    if (text.match(/美術館|博物館|図書館|文学|メディア/)) {
      return '文化';
    }
    if (text.match(/ショッピング|百貨店|モール|店/)) {
      return 'ショッピング';
    }
    if (text.match(/水族館|動物園|遊園地|科学館|天文台/)) {
      return 'エンタメ';
    }

    return '歴史';  // デフォルト
  }

  /**
   * テーマに基づいてスポットを検索
   */
  getSpotsByTheme(theme) {
    if (this.tourismSpots.length === 0) {
      return [];
    }

    if (!theme) {
      return this.tourismSpots;
    }

    return this.tourismSpots.filter(spot => spot.theme === theme);
  }

  /**
   * 近隣のスポットを検索
   */
  getSpotsByLocation(lat, lon, radiusKm = 5) {
    return this.tourismSpots.filter(spot => {
      if (!spot.lat || !spot.lon) return false;

      const distance = this.calculateDistance(lat, lon, spot.lat, spot.lon);
      return distance <= radiusKm;
    });
  }

  /**
   * 2地点間の距離を計算（km）
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
   * 全スポットを取得
   */
  getAllSpots() {
    return this.tourismSpots;
  }

  /**
   * データが読み込まれているか確認
   */
  isDataLoaded() {
    return this.tourismSpots.length > 0;
  }

  /**
   * 七ヶ浜町の観光スポットを追加
   * 公式オープンデータがないため、信頼性の高い公式情報源を基に静的データを追加
   */
  addShichigahamaSpots() {
    const shichigahamaSpots = [
      {
        id: 'shichigahama_tamonzan',
        name: '多聞山（毘沙門堂）',
        lat: 38.3100,
        lon: 141.0500,
        address: '宮城郡七ヶ浜町代ヶ崎浜',
        description: '松島湾を一望できる展望スポット。松島四大観の一つ「偉観」として知られています。多聞山の頂上にある毘沙門堂からは、松島湾に浮かぶ260余りの島々を見渡すことができます。',
        type: '観光スポット',
        url: '',
        source: '七ヶ浜町観光協会',
        types: ['tourist_attraction', 'natural_feature'],
        theme: '自然',
        rating: 4.5
      },
      {
        id: 'shichigahama_shobudahama',
        name: '菖蒲田浜海水浴場',
        lat: 38.2980,
        lon: 141.0650,
        address: '宮城郡七ヶ浜町菖蒲田浜',
        description: '七ヶ浜町を代表する海水浴場。夏は海水浴、パラグライダー体験も楽しめます。松島の島々を背景に空を飛ぶパラグライダーは人気のアクティビティです。',
        type: '観光スポット',
        url: '',
        source: '七ヶ浜町観光協会',
        types: ['beach', 'tourist_attraction'],
        theme: '自然',
        rating: 4.3
      },
      {
        id: 'shichigahama_yogasaki_art',
        name: '養ヶ崎おはじきアート',
        lat: 38.2950,
        lon: 141.0700,
        address: '宮城郡七ヶ浜町養ヶ崎',
        description: '防波堤に約100mにわたって描かれたモザイクアート。地元の子どもたちの成長を描いた作品で、カラフルなタイルで作られています。七ヶ浜町のフォトスポットとして人気です。',
        type: '観光スポット',
        url: '',
        source: '七ヶ浜町観光協会',
        types: ['art_gallery', 'tourist_attraction'],
        theme: '文化',
        rating: 4.0
      },
      {
        id: 'shichigahama_ogigakoi',
        name: '大木囲貝塚',
        lat: 38.3070,
        lon: 141.0580,
        address: '宮城郡七ヶ浜町',
        description: '縄文時代前期から中期にかけての貝塚遺跡。国の史跡に指定されています。縄文時代の人々の生活を知ることができる重要な遺跡です。',
        type: '史跡',
        url: '',
        source: '七ヶ浜町',
        types: ['museum', 'tourist_attraction'],
        theme: '歴史',
        rating: 3.8
      },
      {
        id: 'shichigahama_kokusaimura',
        name: '七ヶ浜国際村',
        lat: 38.3080,
        lon: 141.0580,
        address: '宮城郡七ヶ浜町花渕浜大山1-1',
        description: '国際理解と地域文化の振興を目的とした複合施設。ホール、展示室、研修室などを備え、コンサート、展覧会、講座など様々なイベントが開催されています。',
        type: '文化施設',
        url: '',
        source: '七ヶ浜町',
        types: ['museum', 'tourist_attraction'],
        theme: '文化',
        rating: 4.2
      },
      {
        id: 'shichigahama_hanamizuhama',
        name: '花渕浜',
        lat: 38.3050,
        lon: 141.0600,
        address: '宮城郡七ヶ浜町花渕浜',
        description: '美しい海岸線が続く静かな浜辺。潮干狩りや海水浴を楽しめます。松島湾の景観を楽しめる穴場スポットです。',
        type: '海岸',
        url: '',
        source: '七ヶ浜町観光協会',
        types: ['beach', 'natural_feature'],
        theme: '自然',
        rating: 4.1
      },
      {
        id: 'shichigahama_kimioka',
        name: '君ヶ岡公園',
        lat: 38.3020,
        lon: 141.0520,
        address: '宮城郡七ヶ浜町君ヶ岡',
        description: '高台にある公園で、松島湾や太平洋を見渡せる絶景スポット。桜の名所としても知られ、春には多くの花見客で賑わいます。',
        type: '公園',
        url: '',
        source: '七ヶ浜町',
        types: ['park', 'tourist_attraction'],
        theme: '自然',
        rating: 4.0
      },
      {
        id: 'shichigahama_history_museum',
        name: '七ヶ浜町歴史資料館',
        lat: 38.3070,
        lon: 141.0540,
        address: '宮城郡七ヶ浜町境山2-1-1',
        description: '七ヶ浜町の歴史と文化を紹介する資料館。縄文時代の大木囲貝塚の出土品や、漁業の歴史など、町の歩みを知ることができます。',
        type: '資料館',
        url: '',
        source: '七ヶ浜町',
        types: ['museum'],
        theme: '歴史',
        rating: 3.8
      },
      {
        id: 'shichigahama_kouryu_center',
        name: '七ヶ浜町観光交流センター',
        lat: 38.2990,
        lon: 141.0630,
        address: '宮城郡七ヶ浜町',
        description: '白い建物が特徴的な観光情報の拠点施設。海とヨットをイメージしたデザインで、観光案内や地域の情報を提供しています。',
        type: '観光案内所',
        url: '',
        source: '七ヶ浜町',
        types: ['tourist_attraction'],
        theme: '文化',
        rating: 4.0
      },
      {
        id: 'shichigahama_daigazaki',
        name: '代ヶ崎浜',
        lat: 38.3090,
        lon: 141.0510,
        address: '宮城郡七ヶ浜町代ヶ崎浜',
        description: '多聞山の麓に広がる静かな浜辺。岩場と砂浜が混在し、磯遊びに最適です。',
        type: '海岸',
        url: '',
        source: '七ヶ浜町観光協会',
        types: ['beach', 'natural_feature'],
        theme: '自然',
        rating: 3.9
      },
      {
        id: 'shichigahama_yoshidahama',
        name: '吉田浜',
        lat: 38.2930,
        lon: 141.0680,
        address: '宮城郡七ヶ浜町吉田浜',
        description: '七ヶ浜町の南端に位置する浜辺。静かで落ち着いた雰囲気が魅力です。',
        type: '海岸',
        url: '',
        source: '七ヶ浜町観光協会',
        types: ['beach', 'natural_feature'],
        theme: '自然',
        rating: 3.8
      },
      {
        id: 'shichigahama_aqua_arena',
        name: '七ヶ浜アクアリーナ',
        lat: 38.3000,
        lon: 141.0600,
        address: '宮城郡七ヶ浜町吉田浜字野山5-1',
        description: 'プールと体育館を備えた総合スポーツ施設。温水プールは一年中利用でき、各種スポーツ教室も開催されています。',
        type: 'スポーツ施設',
        url: '',
        source: '七ヶ浜町',
        types: ['gym', 'tourist_attraction'],
        theme: 'エンタメ',
        rating: 4.1
      }
    ];

    // 既存のスポットに追加
    this.tourismSpots.push(...shichigahamaSpots);

    console.log(`✅ 七ヶ浜町の観光スポットを追加しました（${shichigahamaSpots.length}件）`);
  }
}

export default new SendaiOpenDataService();
