import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchForm from '../components/SearchForm';
import WeatherWidget from '../components/WeatherWidget';
import { generateSchedule } from '../services/api';

function SearchPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState({
    lat: 38.2606,
    lon: 140.8817
  }); // デフォルト: 仙台駅

  const handleGenerateSchedule = async (params) => {
    setLoading(true);
    setError(null);

    try {
      const result = await generateSchedule(params);
      // 結果ページに遷移（stateでデータを渡す）
      navigate('/result', {
        state: {
          schedule: result.data,
          searchParams: params
        }
      });
    } catch (err) {
      console.error('Failed to generate schedule:', err);
      setError(err.response?.data?.error || 'スケジュール生成に失敗しました');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* ページタイトル */}
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            観光スケジュール検索
          </h2>
          <p className="text-sm md:text-base text-gray-600">
            条件を入力して、あなたにぴったりの観光ルートを見つけましょう
          </p>
        </div>

        {/* 天気ウィジェット */}
        <div className="mb-6">
          <WeatherWidget />
        </div>

        {/* 検索フォーム */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <SearchForm
            onSubmit={handleGenerateSchedule}
            loading={loading}
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
          />
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm md:text-base text-red-600">{error}</p>
          </div>
        )}

        {/* ローディング状態 */}
        {loading && (
          <div className="mt-6 flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-base md:text-lg text-gray-600">スケジュールを生成中...</p>
            <p className="text-sm text-gray-500 mt-2">しばらくお待ちください</p>
          </div>
        )}

        {/* 使い方ガイド */}
        {!loading && !error && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 使い方</h3>
            <ul className="text-xs md:text-sm text-blue-800 space-y-1">
              <li>1. 出発地の緯度・経度を入力（デフォルト: 仙台駅）</li>
              <li>2. お好みのテーマを選択</li>
              <li>3. 開始時刻と滞在時間を設定</li>
              <li>4. 「スケジュールを生成」ボタンをクリック</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
