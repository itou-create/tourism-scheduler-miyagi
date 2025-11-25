import { useState } from 'react';
import SearchForm from './components/SearchForm';
import Map from './components/Map';
import ScheduleView from './components/ScheduleView';
import { generateSchedule } from './services/api';

function App() {
  const [schedule, setSchedule] = useState(null);
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
      setSchedule(result.data);
    } catch (err) {
      console.error('Failed to generate schedule:', err);
      setError(err.response?.data?.error || 'スケジュール生成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-primary-600 text-white shadow-lg">
        <div className="container mx-auto px-3 py-3 md:px-4 md:py-4">
          <h1 className="text-lg md:text-2xl font-bold">観光周遊スケジュール自動生成</h1>
          <p className="text-xs md:text-sm text-primary-100 mt-1">
            GTFSデータを活用した効率的な観光ルート提案
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel - Form and Schedule */}
        <div className="w-full lg:w-96 flex flex-col bg-white shadow-lg overflow-hidden">
          {/* Search Form Container - Fixed Height with Internal Scroll */}
          <div className="flex-shrink-0 border-b border-gray-200 flex flex-col min-h-0" style={{ maxHeight: 'min(600px, 40vh)', maxHeightLg: 'min(600px, 55vh)' }}>
            <SearchForm
              onSubmit={handleGenerateSchedule}
              loading={loading}
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-3 mt-3 p-2 md:mx-4 md:mt-4 md:p-3 bg-red-50 border border-red-200 rounded-lg flex-shrink-0">
              <p className="text-xs md:text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex-1 flex items-center justify-center min-h-[150px] md:min-h-[200px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-3 md:mt-4 text-sm md:text-base text-gray-600">スケジュールを生成中...</p>
              </div>
            </div>
          )}

          {/* Schedule View - Scrollable */}
          {!loading && schedule && (
            <div className="flex-1 overflow-y-auto">
              <ScheduleView schedule={schedule} />
            </div>
          )}

          {/* Empty State */}
          {!loading && !schedule && !error && (
            <div className="flex-1 flex items-center justify-center p-6 md:p-8 min-h-[150px] md:min-h-[200px]">
              <div className="text-center text-gray-500">
                <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="mt-3 md:mt-4 text-sm md:text-base">条件を設定して<br/>スケジュールを生成してください</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Map */}
        <div className="flex-1 relative min-h-[300px] md:min-h-[400px] lg:min-h-0">
          <Map
            center={[selectedLocation.lat, selectedLocation.lon]}
            schedule={schedule}
            onLocationSelect={setSelectedLocation}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
