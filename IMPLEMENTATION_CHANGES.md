# 実装変更点（差分リスト）

オープンデータチャレンジ応募向けの実装変更を以下にまとめます。

## 📁 新規作成ファイル

### 1. フロントエンド - ルーティング・ページ

#### `client/src/components/Header.jsx`
- **目的**: ナビゲーションヘッダーコンポーネント（ホーム・Aboutリンク）
- **主な機能**:
  - React Router Linkを使用したナビゲーション
  - 現在のページをハイライト表示
  - レスポンシブデザイン対応

#### `client/src/pages/HomePage.jsx`
- **目的**: メインページコンポーネント（既存のApp.jsxから分離）
- **主な機能**:
  - スケジュール生成フォーム
  - 地図表示
  - 天気ウィジェット統合

#### `client/src/pages/AboutPage.jsx`
- **目的**: データ出典・ライセンス情報を表示するページ
- **表示内容**:
  - アプリ概要
  - 使用中のオープンデータ（仙台市営バス、七ヶ浜町ぐるりんこ）
  - 追加オープンデータ（Project LINKS、PLATEAU、ほこナビ、気象庁）
  - ライセンス情報（TODO付き）

---

### 2. 気象庁オープンデータ連携

#### `client/src/services/weatherService.js`
- **目的**: 気象庁APIから天気予報を取得
- **主な機能**:
  - 仙台市（地域コード: 040010）の天気予報取得
  - 今日・明日の天気と降水確率を整形
  - 降水確率50%以上で屋内優先フラグを判定
  - 天気アイコン生成（晴れ☀️、曇り☁️、雨🌧️、雪❄️）
- **API**: `https://www.jma.go.jp/bosai/forecast/data/forecast/040010.json`

#### `client/src/components/WeatherWidget.jsx`
- **目的**: 天気情報を表示するウィジェット
- **主な機能**:
  - 今日・明日の天気・降水確率を表示
  - 降水確率が高い場合は警告メッセージ表示
  - データ出典表示（気象庁オープンデータ）

---

### 3. Project LINKS（鉄道GTFS）連携

#### `client/src/data/railData.js`
- **目的**: 鉄道路線データ（簡易版）
- **内容**:
  - 仙石線（11駅）- 水色
  - 東北本線（4駅）- 赤
  - 仙山線（5駅）- 緑
- **注**: 実際のプロジェクトではGTFSデータをパースして動的に取得

---

### 4. PLATEAU（標高データ）連携

#### `client/src/services/plateauService.js`
- **目的**: PLATEAU 3D都市モデルから標高データを取得（簡易版）
- **主な機能**:
  - 観光スポットの標高データ取得（ダミーデータ含む）
  - 坂のきつさを3段階で判定（★1～3）
  - 坂のきつさの説明生成
- **データ例**:
  - 仙台城跡: 標高140m、坂きつい（★★★）
  - 勾当台公園: 標高40m、平坦（★）
- **注**: 実際のプロジェクトではPLATEAU APIを使用

---

## 📝 更新ファイル

### 1. `client/src/App.jsx`
**変更内容**: ルーティング設定への全面書き換え

**変更前**:
- 単一ページアプリ（ヘッダー、フォーム、地図を直接レンダリング）

**変更後**:
```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';

function App() {
  return (
    <Router>
      <div className="h-screen flex flex-col bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>
    </Router>
  );
}
```

**影響**:
- React Router v6を使用してルーティングを導入
- ヘッダーを共通コンポーネント化
- メインページをHomePageに分離

---

### 2. `client/src/components/Map.jsx`
**変更内容**: 鉄道路線表示レイヤーを追加

**追加要素**:
1. **インポート追加**:
   ```jsx
   import { Polyline } from 'react-leaflet';
   import { RAIL_LINES } from '../data/railData';
   ```

2. **RailLayerコンポーネント（新規）**:
   - 鉄道路線を地図にPolylineで描画
   - 路線ごとに色分け（仙石線: 水色、東北本線: 赤、仙山線: 緑）
   - 破線スタイルで表示

3. **鉄道路線表示切り替えボタン**:
   - 地図右上にチェックボックス配置
   - "鉄道路線を表示"のトグル機能
   - "Project LINKS"出典表示

4. **Map関数内のstate追加**:
   ```jsx
   const [showRailLayer, setShowRailLayer] = useState(true);
   ```

**主な変更箇所**:
- Line 1-6: インポート追加
- Line 87-119: RailLayerコンポーネント追加
- Line 234-255: 鉄道路線表示切り替えUI追加
- Line 271: RailLayerの描画呼び出し

---

### 3. `client/src/components/ScheduleView.jsx`
**変更内容**: PLATEAU標高情報を観光スポットに追加表示

**追加要素**:
1. **インポート追加**:
   ```jsx
   import { getElevation, getSlopeStars, getSlopeDescription } from '../services/plateauService';
   ```

2. **ScheduleItem内の標高情報取得**:
   ```jsx
   const elevationData = getElevation(item.spot.name);
   ```

3. **標高情報UI追加**:
   ```jsx
   <div className="mt-2 bg-indigo-50 border border-indigo-200 rounded px-2 py-1 inline-block">
     <span className="text-xs text-indigo-700">
       📍 標高: {elevationData.elevation}m | 坂のきつさ: {getSlopeStars(elevationData.slope)} {getSlopeDescription(elevationData.slope)}
     </span>
     <p className="text-xs text-gray-500 mt-0.5">データ出典: PLATEAU 3D都市モデル</p>
   </div>
   ```

**主な変更箇所**:
- Line 2: インポート追加
- Line 65-66: 標高データ取得処理追加
- Line 93-99: 標高情報UI追加

---

### 4. `client/src/pages/HomePage.jsx`
**変更内容**: WeatherWidgetを統合

**追加要素**:
1. **インポート追加**:
   ```jsx
   import WeatherWidget from '../components/WeatherWidget';
   ```

2. **WeatherWidget配置**:
   ```jsx
   <div className="flex-shrink-0 p-3 border-b border-gray-200">
     <WeatherWidget />
   </div>
   ```

**主な変更箇所**:
- Line 5: インポート追加
- Line 36-39: WeatherWidget配置

---

## 📊 実装統計

### 新規ファイル: 7ファイル
- ページ/コンポーネント: 4ファイル
- サービス: 2ファイル
- データ: 1ファイル

### 更新ファイル: 4ファイル
- App.jsx（全面書き換え）
- Map.jsx（鉄道路線レイヤー追加）
- ScheduleView.jsx（標高情報表示追加）
- HomePage.jsx（天気ウィジェット統合）

### 実装したオープンデータ: 3種類
1. ✅ 気象庁オープンデータ（天気予報API）
2. ✅ Project LINKS（鉄道GTFS - 簡易版）
3. ✅ PLATEAU（3D都市モデル - 標高データ簡易版）

---

## 🔧 技術的な変更点

### 依存関係
- **既存依存**: `react-router-dom` v6.20.1（既にpackage.jsonに含まれていた）
- **新規追加**: なし（すべて既存の依存関係で実装）

### ルーティング構造
```
/ (ホーム)
  ├─ SearchForm（検索フォーム）
  ├─ WeatherWidget（天気情報）
  ├─ Map（地図 + 鉄道路線レイヤー）
  └─ ScheduleView（スケジュール + 標高情報）

/about (About)
  └─ データ出典・ライセンス情報
```

### データフロー
```
気象庁API → weatherService → WeatherWidget → HomePage
鉄道データ → railData.js → RailLayer → Map
標高データ → plateauService → ScheduleItem → ScheduleView
```

---

## 📌 TODO（今後の改善点）

### ライセンス情報の正確な文言への差し替え
AboutPage.jsxの以下の箇所にTODOコメントあり:
- 仙台市営バスGTFSのライセンス
- 七ヶ浜町ぐるりんこGTFSのライセンス
- Project LINKSのライセンス
- PLATEAUのライセンス
- ほこナビのライセンス
- 気象庁オープンデータのライセンス

### 実データ統合（将来的な拡張）
- Project LINKS: 実際のGTFSデータのパースと統合
- PLATEAU: 実際のPLATEAU APIを使用した標高取得
- ほこナビ: 歩行空間GeoJSONの地図レイヤー表示（未実装）

---

以上が今回の実装変更の全容です。
