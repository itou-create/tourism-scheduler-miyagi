# 地図表示の改善：出発地マーカーと詳細ルート線

## 📋 実装した機能

### 1. 出発地マーカーの表示

**機能**:
- 地図上に出発地が赤色のマーカー🏁で表示される
- クリックすると出発時刻と座標が表示される

**実装**:
```javascript
// 出発地マーカーアイコン（赤色、32x32px）
const createStartIcon = () => {
  return L.divIcon({
    html: `<div style="background-color: #dc2626; ...">🏁</div>`,
    iconSize: [32, 32]
  });
};

// スケジュールから出発地を検索して表示
const firstTransit = schedule.schedule.find(
  item => item.type === 'transit' && item.isFirstTransit
);
```

---

### 2. 詳細なルート線の描画

**改善前**:
- 移動区間全体を1本の線で表示
- 出発地→観光地まで直接描画

**改善後**:
- 移動を詳細なセグメントに分割
- すべての移動経路を順序通りに描画

#### 徒歩移動の場合

**表示**:
- 🚶 緑色の点線（dashArray: '8, 12'）
- weight: 4, opacity: 0.6

**セグメント**:
1. 出発地 → 目的地（直接徒歩）

#### バス移動の場合

**表示**:
- 🚶 緑色の点線（徒歩部分）
- 🚌 青色の実線（バス部分、weight: 5, opacity: 0.8）

**セグメント**:
1. **出発地/観光地 → バス停（乗車）**: 緑の点線
2. **バス停（乗車）→ バス停（降車）**: 青の実線
3. **バス停（降車）→ 目的地/観光地**: 緑の点線

---

## 🎨 視覚的な違い

### マーカーの種類

| マーカー | アイコン | 色 | サイズ | 説明 |
|---------|---------|-----|--------|------|
| 出発地 | 🏁 | 赤 (#dc2626) | 32px | 旅の開始地点 |
| 観光地 | 1,2,3... | 青 (#3b82f6) | 30px | 訪問順に番号付き |
| バス停（乗車） | 🚌 | オレンジ (#f97316) | 24px | 乗車バス停 |
| バス停（降車） | 🚌 | 緑 (#10b981) | 24px | 降車バス停 |

### ルート線の種類

| ルート | 色 | スタイル | 説明 |
|--------|-----|----------|------|
| 徒歩 | 緑 (#10b981) | 点線（8, 12） | 歩行ルート |
| バス | 青 (#3b82f6) | 実線 | バスルート |

---

## 🔧 技術的な実装

### ルート描画のロジック

```javascript
for (let i = 0; i < schedule.schedule.length; i++) {
  const item = schedule.schedule[i];

  if (item.type === 'transit') {
    if (item.mode === 'walking') {
      // 徒歩移動: そのまま1セグメント
      segments.push({
        fromLat, fromLon, toLat, toLon,
        mode: 'walking',
        label: '🚶 徒歩'
      });
    } else {
      // バス移動: 3セグメントに分割

      // 1. 出発地 → 乗車バス停（徒歩）
      if (distance > 0.0001) { // 10m以上離れている場合のみ
        segments.push({
          fromLat: startLat, fromLon: startLon,
          toLat: stopLat, toLon: stopLon,
          mode: 'walking',
          label: '🚶 徒歩',
          description: `${fromStop.stop_name}まで徒歩`
        });
      }

      // 2. 乗車バス停 → 降車バス停（バス）
      segments.push({
        fromLat: fromStop.stop_lat, fromLon: fromStop.stop_lon,
        toLat: toStop.stop_lat, toLon: toStop.stop_lon,
        mode: 'bus',
        label: `🚌 ${routeName}`,
        description: `${routeNumber}番`
      });

      // 3. 降車バス停 → 目的地（徒歩）
      if (distance > 0.0001) {
        segments.push({
          fromLat: stopLat, fromLon: stopLon,
          toLat: endLat, toLon: endLon,
          mode: 'walking',
          label: '🚶 徒歩',
          description: `${toStop.stop_name}から徒歩`
        });
      }
    }
  }
}
```

### OSRM APIでのルート取得

```javascript
// 各セグメントに対してOSRM APIでルートを取得
fetch(`https://router.project-osrm.org/route/v1/foot/${fromLon},${fromLat};${toLon},${toLat}?overview=full&geometries=geojson`)
  .then(response => response.json())
  .then(data => {
    const coordinates = data.routes[0].geometry.coordinates;

    // Leaflet Polylineで描画
    const polyline = L.polyline(coordinates, {
      color: mode === 'walking' ? '#10b981' : '#3b82f6',
      weight: mode === 'walking' ? 4 : 5,
      opacity: mode === 'walking' ? 0.6 : 0.8,
      dashArray: mode === 'walking' ? '8, 12' : null
    }).addTo(map);
  });
```

---

## 📊 データフロー

### スケジュールデータの構造

```javascript
{
  "schedule": [
    // 1. 出発地から最初の観光地への移動
    {
      "type": "transit",
      "isFirstTransit": true,  // 出発地フラグ
      "from": { "lat": 38.2606, "lon": 140.8817 },  // 出発地
      "to": { "spot": { "lat": 38.2544, "lon": 140.8431 } },  // 観光地
      "mode": "bus",
      "route": {
        "fromStop": { "stop_name": "仙台駅前", "stop_lat": ..., "stop_lon": ... },
        "toStop": { "stop_name": "仙台城跡前", "stop_lat": ..., "stop_lon": ... }
      },
      "routeName": "仙台市営バス",
      "routeNumber": "16"
    },
    // 2. 観光地訪問
    {
      "type": "visit",
      "spot": { "name": "仙台城跡", "lat": 38.2544, "lon": 140.8431 },
      "arrivalTime": "09:15",
      "departureTime": "10:15",
      "duration": 60
    },
    // 3. 次の観光地への移動
    {
      "type": "transit",
      "from": { "spot": { "lat": 38.2544, "lon": 140.8431 } },
      "to": { "spot": { "lat": 38.2686, "lon": 140.8708 } },
      "mode": "walking"
    },
    // ...
  ]
}
```

### ルート描画の流れ

```
1. スケジュールデータを解析
   ↓
2. 各移動（transit）を詳細なセグメントに分割
   - 徒歩: 1セグメント
   - バス: 3セグメント（徒歩→バス→徒歩）
   ↓
3. 各セグメントに対してOSRM APIでルートを取得
   ↓
4. 取得したルートをLeaflet Polylineで描画
   - 徒歩: 緑の点線
   - バス: 青の実線
   ↓
5. ポップアップを追加（ラベル、説明）
```

---

## 🎯 ユーザー体験の改善

### Before（改善前）

- ❌ 出発地がどこか分からない
- ❌ ルートが大雑把（観光地→観光地の直線）
- ❌ バス停までの徒歩ルートが見えない

### After（改善後）

- ✅ 出発地が🏁マーカーで明確に表示される
- ✅ すべての移動経路が順序通りに表示される
- ✅ バス停までの徒歩ルートも表示される
- ✅ 徒歩とバスが色で区別される（緑の点線 vs 青の実線）
- ✅ ルートをクリックすると詳細情報が表示される

---

## 📝 使用例

### 例1: 出発地からバスで観光地へ

**表示されるルート**:
1. 🏁 出発地（仙台駅）
2. 緑の点線: 仙台駅 → 仙台駅前バス停（🚌オレンジ）
3. 青の実線: 仙台駅前バス停 → 仙台城跡前バス停（🚌緑）
4. 緑の点線: 仙台城跡前バス停 → 仙台城跡（1）

### 例2: 観光地間を徒歩で移動

**表示されるルート**:
1. 1️⃣ 仙台城跡
2. 緑の点線: 仙台城跡 → 勾当台公園
3. 2️⃣ 勾当台公園

---

## 🔍 デバッグ情報

### ルートが表示されない場合

**確認ポイント**:
1. スケジュールデータに `transit` タイプのアイテムがあるか
2. `from` と `to` に座標が含まれているか
3. ブラウザのコンソールで OSRM API のエラーを確認

**コンソールログ**:
```javascript
// エラー時のログ
console.error('ルート取得エラー:', error);
// → OSRM APIへのリクエストが失敗した場合、直線で描画される
```

---

## ✅ 変更ファイル

**`client/src/components/Map.jsx`**

### 追加された関数・コンポーネント

1. **createStartIcon()**: 出発地マーカーアイコン
2. **出発地マーカー表示ロジック**: isFirstTransitフラグで検索
3. **RoadRoute コンポーネントの改善**:
   - バス移動を3セグメントに分割
   - 距離チェック（10m以上離れている場合のみ描画）
   - ラベルと説明の追加

### 変更行数

- 約150行の大幅な改善
- 新規追加: 約80行
- 修正: 約70行

---

## 🚀 今後の拡張ポイント

1. **帰路の表示**: 最後の観光地から出発地への帰路を別の色で表示
2. **ルート距離の表示**: 各セグメントの距離を表示
3. **所要時間の表示**: 各セグメントの所要時間を表示
4. **アニメーション**: ルートを順番に描画するアニメーション
5. **ルートの非表示/表示**: レイヤーコントロールでルートの表示/非表示を切り替え

---

以上、地図表示の大幅な改善により、ユーザーが旅の全体像を把握しやすくなりました。
