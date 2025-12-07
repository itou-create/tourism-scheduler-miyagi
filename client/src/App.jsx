import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import SearchPage from './pages/SearchPage';
import ResultPage from './pages/ResultPage';
import AboutPage from './pages/AboutPage';
import { healthCheck } from './services/api';

function App() {
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let retryTimer;
    let isMounted = true;
    const startTime = Date.now();

    const checkBackendHealth = async () => {
      try {
        await healthCheck();

        if (isMounted) {
          // 最小800msのローディング表示時間を確保
          const elapsedTime = Date.now() - startTime;
          const remainingTime = Math.max(0, 800 - elapsedTime);

          setTimeout(() => {
            if (isMounted) {
              setIsBackendReady(true);
              setErrorMessage('');
            }
          }, remainingTime);
        }
      } catch (error) {
        if (isMounted) {
          console.log('バックエンド接続待ち...', error.message);
          setRetryCount(prev => prev + 1);

          // 30秒以上接続できない場合はエラーメッセージを表示
          if (retryCount > 10) {
            setErrorMessage('サーバーへの接続に時間がかかっています。しばらくお待ちください。');
          }

          // 3秒後に再試行
          retryTimer = setTimeout(() => {
            checkBackendHealth();
          }, 3000);
        }
      }
    };

    checkBackendHealth();

    return () => {
      isMounted = false;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [retryCount]);

  // バックエンドが準備できていない場合、接続待ち画面を表示
  if (!isBackendReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          {/* アニメーションするバスアイコン */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <svg
                className="w-20 h-20 animate-bounce"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 16C4 16.5304 4.21071 17.0391 4.58579 17.4142C4.96086 17.7893 5.46957 18 6 18H7C7 18.7956 7.31607 19.5587 7.87868 20.1213C8.44129 20.6839 9.20435 21 10 21C10.7956 21 11.5587 20.6839 12.1213 20.1213C12.6839 19.5587 13 18.7956 13 18H17C17 18.7956 17.3161 19.5587 17.8787 20.1213C18.4413 20.6839 19.2044 21 20 21C20.7956 21 21.5587 20.6839 22.1213 20.1213C22.6839 19.5587 23 18.7956 23 18H24C24.5304 18 25.0391 17.7893 25.4142 17.4142C25.7893 17.0391 26 16.5304 26 16V6C26 5.46957 25.7893 4.96086 25.4142 4.58579C25.0391 4.21071 24.5304 4 24 4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V16Z"
                  stroke="#667eea"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="#667eea"
                  opacity="0.8"
                />
                <circle cx="10" cy="18" r="1.5" fill="white"/>
                <circle cx="20" cy="18" r="1.5" fill="white"/>
                <rect x="7" y="7" width="16" height="6" rx="1" fill="white" opacity="0.8"/>
              </svg>
              {/* 道路のライン */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            サーバーに接続中
          </h2>

          <div className="mb-4">
            <div className="inline-flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>

          <p className="text-gray-600 mb-4">
            バックエンドサーバーの起動を待っています
          </p>

          {errorMessage && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-yellow-800 text-sm">{errorMessage}</p>
            </div>
          )}

          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-blue-700 text-sm">
              💡 初回アクセス時は、サーバーの起動に<br />
              <strong>30秒〜1分程度</strong>かかる場合があります
            </p>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            再試行回数: {retryCount}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router basename="/tourism-scheduler-miyagi">
      <div className="h-screen flex flex-col bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
