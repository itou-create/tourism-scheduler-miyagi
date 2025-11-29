import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Map from '../components/Map';
import ScheduleView from '../components/ScheduleView';

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  const [showMap, setShowMap] = useState(true);

  useEffect(() => {
    // location.stateからデータを取得
    if (location.state?.schedule) {
      setSchedule(location.state.schedule);
      setSearchParams(location.state.searchParams);
    } else {
      // データがない場合は検索ページに戻る
      navigate('/');
    }
  }, [location, navigate]);

  if (!schedule) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  const selectedLocation = searchParams?.location || { lat: 38.2606, lon: 140.8817 };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      {/* ヘッダー（スマホ用） */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm md:text-base"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          新しく検索
        </Link>

        {/* スマホ用：表示切り替えボタン */}
        <div className="flex gap-2 md:hidden">
          <button
            onClick={() => setShowMap(false)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              !showMap ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            スケジュール
          </button>
          <button
            onClick={() => setShowMap(true)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              showMap ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            地図
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex overflow-hidden">
        {/* PC: 2カラムレイアウト、スマホ: 切り替え表示 */}

        {/* スケジュール表示 */}
        <div className={`w-full md:w-96 flex-shrink-0 overflow-y-auto bg-white md:shadow-lg ${
          showMap ? 'hidden md:block' : 'block'
        }`}>
          <ScheduleView schedule={schedule} />
        </div>

        {/* 地図表示 */}
        <div className={`flex-1 relative ${
          !showMap ? 'hidden md:block' : 'block'
        }`}>
          <Map
            center={[selectedLocation.lat, selectedLocation.lon]}
            schedule={schedule}
            onLocationSelect={() => {}} // 結果ページでは位置選択は不要
          />
        </div>
      </div>

      {/* スマホ用：下部固定ボタン */}
      <div className="md:hidden bg-white border-t border-gray-200 px-4 py-3 flex gap-2">
        <Link
          to="/"
          className="flex-1 bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium text-sm text-center hover:bg-gray-300 transition-colors"
        >
          条件を変更
        </Link>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex-1 bg-primary-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-primary-700 transition-colors"
        >
          ページトップへ
        </button>
      </div>
    </div>
  );
}

export default ResultPage;
