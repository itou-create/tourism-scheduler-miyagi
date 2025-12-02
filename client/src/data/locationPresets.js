// よく使う出発地点のプリセット

export const LOCATION_PRESETS = [
  {
    id: 'shichigahama',
    name: '七ヶ浜町',
    lat: 38.2983,
    lon: 141.0606,
    description: '七ヶ浜町役場周辺（ぐるりんこバス運行エリア）'
  },
  {
    id: 'shiogama_station',
    name: '塩釜駅',
    lat: 38.3142,
    lon: 141.0197,
    description: 'JR仙石線 本塩釜駅'
  },
  {
    id: 'sendai_station',
    name: '仙台駅',
    lat: 38.2606,
    lon: 140.8817,
    description: 'JR仙台駅周辺'
  },
  {
    id: 'kotodai_park',
    name: '勾当台公園',
    lat: 38.2686,
    lon: 140.8708,
    description: '市中心部の公園'
  },
  {
    id: 'sendai_castle',
    name: '仙台城跡（青葉城）',
    lat: 38.2544,
    lon: 140.8431,
    description: '仙台の観光名所'
  },
  {
    id: 'zuihoden',
    name: '瑞鳳殿',
    lat: 38.2478,
    lon: 140.8656,
    description: '伊達政宗公の霊廟'
  },
  {
    id: 'jozenji_street',
    name: '定禅寺通',
    lat: 38.2672,
    lon: 140.8722,
    description: 'ケヤキ並木の美しい通り'
  },
  {
    id: 'sendai_mediatheque',
    name: 'せんだいメディアテーク',
    lat: 38.2644,
    lon: 140.8731,
    description: '文化施設'
  },
  {
    id: 'aobayama_station',
    name: '青葉山駅',
    lat: 38.2528,
    lon: 140.8375,
    description: '地下鉄東西線'
  },
  {
    id: 'custom',
    name: '手動入力',
    lat: null,
    lon: null,
    description: '緯度・経度を直接入力'
  }
];

// プリセットIDから位置情報を取得
export const getPresetLocation = (presetId) => {
  return LOCATION_PRESETS.find(preset => preset.id === presetId);
};

// 緯度経度から最も近いプリセットを探す（表示用）
export const findNearestPreset = (lat, lon) => {
  let nearest = null;
  let minDistance = Infinity;

  LOCATION_PRESETS.forEach(preset => {
    if (preset.lat === null) return; // 手動入力は除外

    const distance = Math.sqrt(
      Math.pow(preset.lat - lat, 2) + Math.pow(preset.lon - lon, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = preset;
    }
  });

  // 距離が0.001度（約100m）以内なら一致とみなす
  return minDistance < 0.001 ? nearest : null;
};
