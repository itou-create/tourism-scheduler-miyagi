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
    lat: 38.2983,
    lon: 141.0606
  }); // デフォルト: 七ヶ浜町
  const [selectedTheme, setSelectedTheme] = useState('初めて訪れた人向け');

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
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* ヒーローセクション */}
      <div className="relative bg-gradient-to-r from-blue-500 to-cyan-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="none">
            {/* 波のイラスト */}
            <path d="M0,100 C300,150 500,50 800,100 C1000,130 1100,80 1200,100 L1200,400 L0,400 Z" fill="currentColor" opacity="0.3"/>
            <path d="M0,150 C300,200 500,100 800,150 C1000,180 1100,130 1200,150 L1200,400 L0,400 Z" fill="currentColor" opacity="0.3"/>
            {/* 島のシルエット */}
            <ellipse cx="200" cy="200" rx="40" ry="25" fill="currentColor" opacity="0.4"/>
            <ellipse cx="400" cy="220" rx="30" ry="20" fill="currentColor" opacity="0.4"/>
            <ellipse cx="600" cy="190" rx="50" ry="30" fill="currentColor" opacity="0.4"/>
            <ellipse cx="900" cy="210" rx="35" ry="22" fill="currentColor" opacity="0.4"/>
          </svg>
        </div>

        <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl relative z-10">
          <div className="text-center">
            {/* ロゴ・アイコン */}
            <div className="mb-4 flex justify-center">
              <svg className="w-16 h-16 md:w-20 md:h-20" viewBox="0 0 100 100" fill="none">
                {/* バスのアイコン */}
                <rect x="20" y="35" width="60" height="40" rx="5" fill="white" opacity="0.9"/>
                <rect x="25" y="40" width="20" height="15" fill="#3B82F6"/>
                <rect x="55" y="40" width="20" height="15" fill="#3B82F6"/>
                <circle cx="35" cy="75" r="5" fill="#1F2937"/>
                <circle cx="65" cy="75" r="5" fill="#1F2937"/>
                <path d="M30,35 L70,35 L75,30 L25,30 Z" fill="white" opacity="0.9"/>
                {/* 松島の波 */}
                <path d="M5,85 Q15,80 25,85 T45,85 T65,85 T85,85 T95,85" stroke="white" strokeWidth="2" fill="none" opacity="0.7"/>
              </svg>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              七ヶ浜 観光スケジューラー
            </h1>
            <p className="text-lg md:text-xl text-blue-50 mb-2">
              松島湾を望む、七つの浜を巡る旅
            </p>
            <p className="text-sm md:text-base text-blue-100 max-w-2xl mx-auto">
              実際のバス時刻表とオープンデータを活用した、あなただけの観光プランを自動生成
            </p>
          </div>
        </div>

        {/* 波のボトム装飾 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-8 md:h-12" viewBox="0 0 1200 100" preserveAspectRatio="none">
            <path d="M0,50 C300,80 500,20 800,50 C1000,70 1100,40 1200,50 L1200,100 L0,100 Z" fill="white"/>
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* 人気のコース紹介 */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '🌊', title: '初めての方', desc: '定番スポットを巡る', color: 'from-blue-400 to-cyan-400', theme: '初めて訪れた人向け' },
            { icon: '🏛️', title: '歴史とカフェ', desc: '歴史とグルメを満喫', color: 'from-amber-400 to-orange-400', theme: '歴史とカフェ' },
            { icon: '🎨', title: 'アクティブ', desc: '体験型の観光', color: 'from-green-400 to-emerald-400', theme: 'アクティブ' }
          ].map((course, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedTheme(course.theme)}
              className="group hover:scale-105 transition-transform duration-300 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl"
            >
              <div className={`bg-gradient-to-br ${course.color} p-4 rounded-xl shadow-lg text-white ${selectedTheme === course.theme ? 'ring-4 ring-white ring-offset-2' : ''}`}>
                <div className="text-3xl mb-2">{course.icon}</div>
                <h3 className="font-bold text-lg mb-1">{course.title}</h3>
                <p className="text-sm text-white/90">{course.desc}</p>
                {selectedTheme === course.theme && (
                  <div className="mt-2 flex items-center text-xs font-semibold">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    選択中
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 左カラム: 天気ウィジェット */}
          <div className="md:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-5 sticky top-4">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                今日の天気
              </h3>
              <WeatherWidget />

              {/* おすすめポイント */}
              <div className="mt-6 p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-2 text-sm">📍 七ヶ浜のポイント</h4>
                <ul className="text-xs text-gray-700 space-y-2">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>松島四大観「偉観」から絶景を</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>新鮮な海の幸を堪能</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>ぐるりんこバスで快適移動</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 右カラム: 検索フォーム */}
          <div className="md:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8">
              <div className="flex items-center mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full mr-3"></div>
                <h2 className="text-2xl font-bold text-gray-800">
                  スケジュール作成
                </h2>
              </div>

              <SearchForm
                onSubmit={handleGenerateSchedule}
                loading={loading}
                selectedLocation={selectedLocation}
                onLocationChange={setSelectedLocation}
                selectedTheme={selectedTheme}
                onThemeChange={setSelectedTheme}
              />
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* ローディング状態 */}
            {loading && (
              <div className="mt-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8">
                <div className="flex flex-col items-center justify-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
                  </div>
                  <p className="text-lg font-semibold text-gray-700 mt-4">最適なルートを探しています...</p>
                  <p className="text-sm text-gray-500 mt-2">バスの時刻表と照らし合わせています</p>
                </div>
              </div>
            )}

            {/* 使い方ガイド */}
            {!loading && !error && (
              <div className="mt-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl p-5 shadow">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg mr-3">
                    💡
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">使い方</h3>
                </div>
                <div className="space-y-3">
                  {[
                    '出発地点を選択（七ヶ浜町がおすすめ！）',
                    'お好みのコースを選択',
                    '出発時刻と滞在時間を設定',
                    '「スケジュールを生成」をクリック'
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-start">
                      <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-gray-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* フッター情報 */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full shadow text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            宮城県オープンデータ活用プロジェクト
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
