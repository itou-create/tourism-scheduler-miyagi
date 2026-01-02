import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import SearchPage from './pages/SearchPage';
import ResultPage from './pages/ResultPage';
import AboutPage from './pages/AboutPage';
import HowToUsePage from './pages/HowToUsePage';
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
                className="w-24 h-24 animate-bounce"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* バスのアイコン（トップページと同じデザイン） */}
                <rect x="20" y="35" width="60" height="40" rx="5" fill="#667eea" opacity="0.9"/>
                <rect x="25" y="40" width="20" height="15" fill="#3B82F6"/>
                <rect x="55" y="40" width="20" height="15" fill="#3B82F6"/>
                <circle cx="35" cy="75" r="5" fill="#1F2937"/>
                <circle cx="65" cy="75" r="5" fill="#1F2937"/>
                <path d="M30,35 L70,35 L75,30 L25,30 Z" fill="#667eea" opacity="0.9"/>
                {/* 松島の波 */}
                <path d="M5,85 Q15,80 25,85 T45,85 T65,85 T85,85 T95,85" stroke="#667eea" strokeWidth="2" fill="none" opacity="0.7"/>
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
          <Route path="/how-to-use" element={<HowToUsePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
