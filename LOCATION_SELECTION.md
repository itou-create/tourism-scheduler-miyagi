# 出発地点選択機能の改善

## 📍 問題点

画面を検索ページと結果ページに分離したことで、地図上をクリックして出発地点を設定する機能が使えなくなりました。

### Before（改善前）
- 検索フォームと地図が同じページにあり、地図をクリックすると緯度経度がフォームに反映された
- 画面分離後、検索ページには地図がないため位置選択不可

### 課題
緯度経度の手動入力は、多くのユーザーにとって使いにくい

---

## ✅ 解決策

以下の3つの方法で出発地点を選択できるようになりました：

### 1. **プリセット選択**（最も簡単）
よく使う地点をドロップダウンから選択

### 2. **地図モーダル**（視覚的で正確）
ボタンをクリックしてモーダルで地図を開き、地図上をクリックして位置を選択

### 3. **手動入力**（詳細設定）
緯度経度を直接入力

---

## 📁 実装ファイル

### 新規作成

#### 1. `client/src/data/locationPresets.js`
**目的**: よく使う出発地点のプリセットデータ

**プリセット地点**:
1. 仙台駅（デフォルト）
2. 勾当台公園
3. 仙台城跡（青葉城）
4. 瑞鳳殿
5. 定禅寺通
6. せんだいメディアテーク
7. 青葉山駅
8. 手動入力（緯度経度を直接入力）

**主な関数**:
- `getPresetLocation(presetId)` - プリセットIDから位置情報を取得
- `findNearestPreset(lat, lon)` - 緯度経度から最も近いプリセットを探す

---

#### 2. `client/src/components/LocationMapModal.jsx`
**目的**: 地図で位置を選択するモーダルコンポーネント

**主な機能**:
- モーダル内にLeaflet地図を表示
- 地図をクリックして位置を選択
- 選択中の緯度経度をリアルタイム表示
- 「この位置に決定」ボタンで確定
- 「キャンセル」ボタンでモーダルを閉じる

**Props**:
- `isOpen`: モーダルの表示/非表示
- `onClose`: モーダルを閉じる関数
- `onLocationSelect`: 位置選択時のコールバック
- `initialLocation`: 初期位置（現在の選択位置）

**UI構成**:
```
┌────────────────────────────────────┐
│ 出発地を地図で選択           [✕] │ ← ヘッダー
├────────────────────────────────────┤
│ 選択中: 緯度 38.2606, 経度 140.8817│ ← 位置情報
│ 💡 地図上をクリックして選択        │
├────────────────────────────────────┤
│                                    │
│         [地図エリア]               │ ← Leaflet Map
│                                    │
├────────────────────────────────────┤
│       [キャンセル] [この位置に決定] │ ← フッター
└────────────────────────────────────┘
```

---

### 更新ファイル

#### `client/src/components/SearchForm.jsx`
**変更内容**: 出発地点選択UIの全面改善

**追加要素**:

1. **インポート追加**:
```javascript
import LocationMapModal from './LocationMapModal';
import { LOCATION_PRESETS, getPresetLocation } from '../data/locationPresets';
```

2. **state追加**:
```javascript
const [selectedPreset, setSelectedPreset] = useState('sendai_station');
const [showMapModal, setShowMapModal] = useState(false);
const [showManualInput, setShowManualInput] = useState(false);
```

3. **ハンドラー関数追加**:
- `handlePresetChange()` - プリセット選択時の処理
- `handleMapLocationSelect()` - 地図モーダルで位置選択時の処理

4. **新しいUI構成**:
```jsx
<div>
  {/* プリセット選択ドロップダウン */}
  <select value={selectedPreset} onChange={handlePresetChange}>
    {LOCATION_PRESETS.map(preset => (
      <option key={preset.id} value={preset.id}>
        {preset.name} - {preset.description}
      </option>
    ))}
  </select>

  {/* 地図で選択ボタン */}
  <button type="button" onClick={() => setShowMapModal(true)}>
    🗺️ 地図で選択
  </button>

  {/* 手動入力（「手動入力」選択時のみ表示） */}
  {showManualInput && (
    <div>
      <input type="number" /* 緯度 */ />
      <input type="number" /* 経度 */ />
    </div>
  )}

  {/* 選択中の位置表示 */}
  <p>📍 緯度 {lat}, 経度 {lon}</p>
</div>

{/* 地図選択モーダル */}
<LocationMapModal
  isOpen={showMapModal}
  onClose={() => setShowMapModal(false)}
  onLocationSelect={handleMapLocationSelect}
  initialLocation={selectedLocation}
/>
```

---

## 🎯 使い方

### パターン1: プリセットを使う（最も簡単）

1. 「出発地点」ドロップダウンをクリック
2. 「仙台駅」「仙台城跡」などから選択
3. 自動的に緯度経度が設定される
4. 選択した位置が下部に表示される

**利用シーン**: 主要な観光地から出発する場合

---

### パターン2: 地図で選択する（視覚的で正確）

1. 「🗺️ 地図で選択」ボタンをクリック
2. モーダルで地図が開く
3. 地図上の任意の場所をクリック
4. 選択中の緯度経度がリアルタイム表示される
5. 「この位置に決定」ボタンをクリック
6. モーダルが閉じて、選択した位置がフォームに反映される

**利用シーン**: 細かい位置調整が必要な場合、ホテルなど任意の地点から出発する場合

---

### パターン3: 手動で入力する（詳細設定）

1. 「出発地点」ドロップダウンで「手動入力」を選択
2. 緯度・経度の入力欄が表示される
3. 数値を直接入力
4. 入力した位置が下部に表示される

**利用シーン**: 正確な緯度経度が分かっている場合

---

## 📱 スマホ対応

### プリセット選択
- ネイティブのselectドロップダウンで使いやすい
- タップで即座に選択可能

### 地図モーダル
- モーダルがスマホ画面いっぱいに表示される
- 地図のピンチズーム、パンが可能
- 大きなボタンでタップしやすい

### 手動入力
- 数値入力キーボードが自動で表示される
- 小数点4桁まで入力可能（約10m単位の精度）

---

## 🔧 技術的な詳細

### プリセットデータ構造

```javascript
{
  id: 'sendai_station',      // 一意のID
  name: '仙台駅',            // 表示名
  lat: 38.2606,              // 緯度
  lon: 140.8817,             // 経度
  description: 'JR仙台駅周辺' // 説明
}
```

### モーダルの実装

**z-index**: `2000`
- ヘッダー（z-index: 通常）より上に表示
- 鉄道路線切り替えボタン（z-index: 1000）より上に表示

**背景のオーバーレイ**:
```jsx
<div className="fixed inset-0 z-[2000] bg-black bg-opacity-50">
  {/* モーダルコンテンツ */}
</div>
```

**地図のクリックイベント**:
```javascript
useMapEvents({
  click: (e) => {
    onLocationSelect({
      lat: e.latlng.lat,
      lon: e.latlng.lng
    });
  },
});
```

---

## ✅ 動作確認ポイント

### プリセット選択
- [ ] ドロップダウンで8つのプリセットが表示される
- [ ] プリセット選択時、緯度経度が自動更新される
- [ ] 選択中の位置が正しく表示される

### 地図モーダル
- [ ] 「地図で選択」ボタンをクリックするとモーダルが開く
- [ ] モーダル内の地図が表示される
- [ ] 地図上をクリックするとマーカーが移動する
- [ ] 選択中の緯度経度がリアルタイム表示される
- [ ] 「この位置に決定」で位置が確定してモーダルが閉じる
- [ ] 「キャンセル」で変更せずにモーダルが閉じる
- [ ] モーダル外をクリックしてもモーダルが閉じない（意図的な設計）

### 手動入力
- [ ] 「手動入力」選択時、緯度経度の入力欄が表示される
- [ ] 数値を入力すると位置が更新される
- [ ] 小数点4桁まで入力可能

### スマホ表示
- [ ] プリセット選択がタップしやすい
- [ ] 地図モーダルが画面いっぱいに表示される
- [ ] モーダル内の地図が操作しやすい

---

## 🎨 UI/UX の改善点

### Before（改善前）
❌ 緯度経度の手動入力のみ
❌ 多くのユーザーにとって使いにくい
❌ 地図がないため視覚的に確認できない

### After（改善後）
✅ プリセットで簡単に主要地点を選択
✅ 地図モーダルで視覚的に位置を確認
✅ 手動入力も可能（詳細設定）
✅ スマホでも快適に操作可能
✅ 選択中の位置が常に表示される

---

## 📊 変更統計

- **新規ファイル**: 2個
  - `client/src/data/locationPresets.js`
  - `client/src/components/LocationMapModal.jsx`
- **更新ファイル**: 1個
  - `client/src/components/SearchForm.jsx`
- **追加行数**: 約300行
- **プリセット地点数**: 8箇所

---

## 🚀 今後の拡張案

### 1. 現在地取得機能
ブラウザのGeolocation APIを使用して現在地を取得

```javascript
navigator.geolocation.getCurrentPosition((position) => {
  onLocationChange({
    lat: position.coords.latitude,
    lon: position.coords.longitude
  });
});
```

### 2. 住所検索機能
住所を入力して緯度経度に変換（Geocoding API使用）

### 3. プリセットのカスタマイズ
ユーザーがお気に入りの場所を保存できる機能（LocalStorage使用）

### 4. 最近使った地点
最近選択した地点を履歴として保存

---

以上、出発地点選択機能の改善が完了しました。
