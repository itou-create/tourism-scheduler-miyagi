// PLATEAU 3D都市モデルから標高データを取得（簡易版）
// 実際のプロジェクトでは、PLATEAU APIを使用して標高を取得します

// 仙台市の標高データ（簡易版：ダミーデータ）
const SENDAI_ELEVATION_DATA = {
  '仙台城跡': { elevation: 140, slope: 3 }, // 高台にあるため坂きつい
  '瑞鳳殿': { elevation: 90, slope: 2 },
  '勾当台公園': { elevation: 40, slope: 1 },
  '仙台朝市': { elevation: 20, slope: 1 },
  '青葉通': { elevation: 30, slope: 1 },
  'せんだいメディアテーク': { elevation: 25, slope: 1 },
  '定禅寺通': { elevation: 35, slope: 1 },
  '大崎八幡宮': { elevation: 80, slope: 2 },
};

// 観光スポットの標高を取得
export const getElevation = (spotName) => {
  // ダミーデータから取得
  const data = SENDAI_ELEVATION_DATA[spotName];
  if (data) {
    return data;
  }

  // データがない場合はランダム生成（デモ用）
  const randomElevation = Math.floor(Math.random() * 100) + 20; // 20-120m
  const slope = randomElevation < 40 ? 1 : randomElevation < 80 ? 2 : 3;

  return {
    elevation: randomElevation,
    slope: slope,
  };
};

// 坂のきつさを星で表現
export const getSlopeStars = (slope) => {
  if (!slope) return '';
  return '★'.repeat(slope) + '☆'.repeat(3 - slope);
};

// 坂のきつさの説明
export const getSlopeDescription = (slope) => {
  switch (slope) {
    case 1:
      return '平坦（歩きやすい）';
    case 2:
      return 'やや坂あり（普通）';
    case 3:
      return '坂きつい（注意）';
    default:
      return '不明';
  }
};

// 観光スポットに標高情報を追加
export const addElevationToSpot = (spot) => {
  const elevationData = getElevation(spot.name);

  return {
    ...spot,
    elevation: elevationData.elevation,
    slope: elevationData.slope,
    slopeStars: getSlopeStars(elevationData.slope),
    slopeDescription: getSlopeDescription(elevationData.slope),
  };
};
