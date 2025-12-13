function AboutPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">このアプリについて</h2>

        {/* アプリ概要 */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">アプリ概要</h3>
          <p className="text-gray-700 leading-relaxed mb-3">
            本アプリは、GTFS（標準的なバス情報フォーマット）などのオープンデータを活用し、テーマ別に実際のバス時刻表に基づいた"実行可能な"観光周遊スケジュールを自動生成するWebアプリケーションです。
          </p>
          <p className="text-gray-700 leading-relaxed mb-3">
            仙台市営バス（335路線）と七ヶ浜町民バス「ぐるりんこ」（8路線）の実際のバス時刻表を統合し、乗車・降車時刻、バス路線名、バス停位置を地図上に表示します。
          </p>
          <p className="text-gray-700 leading-relaxed">
            待ち時間を最小化する最適化アルゴリズムにより、効率的な観光ルートを提案し、出発地への帰路も自動生成します。
          </p>
        </section>

        {/* 使用しているオープンデータ */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">使用しているオープンデータ</h3>

          <div className="space-y-4">
            {/* 仙台市営バス GTFS */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-800 mb-2">仙台市営バス GTFS（335路線、2,147停留所）</h4>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">出典：</span>宮城県オープンデータポータル
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">URL：</span>
                <a
                  href="https://miyagi.dataeye.jp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  https://miyagi.dataeye.jp/
                </a>
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">ライセンス：</span>CC BY 4.0（クリエイティブ・コモンズ 表示 4.0 国際）
              </p>
            </div>

            {/* 七ヶ浜町民バス「ぐるりんこ」GTFS */}
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-800 mb-2">七ヶ浜町民バス「ぐるりんこ」GTFS（8路線、154停留所）</h4>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">出典：</span>公共交通オープンデータセンター（CKAN）
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">URL：</span>
                <a
                  href="https://ckan.odpt.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  https://ckan.odpt.org/
                </a>
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">ライセンス：</span>CC BY 4.0（クリエイティブ・コモンズ 表示 4.0 国際）
              </p>
            </div>
          </div>
        </section>

        {/* 追加オープンデータ */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">追加オープンデータ</h3>

          <div className="space-y-4">
            {/* 気象庁オープンデータ */}
            <div className="border-l-4 border-sky-500 pl-4">
              <h4 className="font-semibold text-gray-800 mb-2">気象庁オープンデータ</h4>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">URL：</span>
                <a
                  href="https://www.jma.go.jp/bosai/forecast/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  https://www.jma.go.jp/bosai/forecast/
                </a>
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">用途：</span>天気予報・降水確率取得、屋内スポット優先ロジック
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">ライセンス：</span>
                <a
                  href="https://www.jma.go.jp/jma/kishou/info/coment.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  気象庁ホームページについて
                </a>
              </p>
            </div>

            {/* OSRM API */}
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold text-gray-800 mb-2">OSRM（Open Source Routing Machine）API</h4>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">URL：</span>
                <a
                  href="https://router.project-osrm.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  https://router.project-osrm.org/
                </a>
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">用途：</span>道路に沿った実際のルート表示、徒歩移動時間の計算
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">ライセンス：</span>
                <a
                  href="https://github.com/Project-OSRM/osrm-backend/blob/master/LICENSE.TXT"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  BSD 2-Clause License
                </a>
              </p>
            </div>

            {/* OpenStreetMap */}
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-800 mb-2">OpenStreetMap</h4>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">URL：</span>
                <a
                  href="https://www.openstreetmap.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  https://www.openstreetmap.org/
                </a>
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">用途：</span>地図表示、ルート可視化
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">ライセンス：</span>
                <a
                  href="https://www.openstreetmap.org/copyright"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  © OpenStreetMap contributors
                </a>
                （ODbL）
              </p>
            </div>
          </div>
        </section>

        {/* 主要機能 */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">主要機能</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">✓</span>
              <span><strong>実際のバス時刻表に基づくスケジュール生成：</strong>仙台市営バスと七ヶ浜町民バス「ぐるりんこ」の実際の運行データを使用</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">✓</span>
              <span><strong>バス乗降時刻の明確な表示：</strong>バス停での乗車時刻と降車時刻を正確に表示</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">✓</span>
              <span><strong>バス路線名・路線番号の表示：</strong>実際のGTFSデータから取得した路線情報を表示</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">✓</span>
              <span><strong>地図上での可視化：</strong>バス停位置、乗車・降車マーカー、道路に沿ったルートを地図上に表示</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">✓</span>
              <span><strong>出発地への帰路自動生成：</strong>最終観光スポットから出発地点までの帰路を自動で追加</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">✓</span>
              <span><strong>待ち時間最小化の最適化：</strong>貪欲法アルゴリズムにより、待ち時間と移動時間を最小化</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">✓</span>
              <span><strong>テーマ別観光スポット検索：</strong>歴史、自然、グルメなどのテーマから選択可能</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">✓</span>
              <span><strong>スマホ対応レスポンシブデザイン：</strong>PC、タブレット、スマートフォンで快適に利用可能</span>
            </li>
          </ul>
        </section>

        {/* 技術スタック */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">技術スタック</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">フロントエンド</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>React 18.3.1 + Vite</li>
                <li>React Router v6</li>
                <li>Tailwind CSS</li>
                <li>Leaflet（地図表示）</li>
                <li>Axios（API通信）</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">バックエンド</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>Node.js + Express</li>
                <li>node-gtfs（GTFS処理）</li>
                <li>SQLite（データベース）</li>
                <li>CORS対応</li>
              </ul>
            </div>
          </div>
        </section>

        {/* デプロイ構成 */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">デプロイ構成</h3>
          <div className="space-y-3 text-gray-700">
            <p>
              <span className="font-medium">フロントエンド：</span>
              <a
                href="https://pages.github.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                GitHub Pages
              </a>
              （静的ホスティング）
            </p>
            <p>
              <span className="font-medium">バックエンド：</span>
              <a
                href="https://render.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                Render
              </a>
              （APIサーバー）
            </p>
            <p className="text-sm text-gray-600 mt-2">
              ※ フロントエンドとバックエンドを分離することで、フロントエンドの高速な読み込みと、バックエンドの柔軟なスケーリングを実現しています。
            </p>
          </div>
        </section>

        {/* GitHubリポジトリ */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">GitHubリポジトリ</h3>
          <p className="text-gray-700 mb-2">
            本プロジェクトのソースコードはGitHubで公開されています：
          </p>
          <a
            href="https://github.com/itou-create/tourism-scheduler-miyagi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:underline font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            itou-create/tourism-scheduler-miyagi
          </a>
        </section>

        {/* 注意書き */}
        <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">注意書き</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>各オープンデータのライセンス条件は提供元の利用規約に従います</li>
            <li>本アプリはオープンデータチャレンジ応募向けプロジェクトとして作成されました</li>
            <li>バス時刻表データは定期的に更新されるため、実際の運行状況と異なる場合があります</li>
            <li>天候や道路状況により、実際の移動時間が予測と異なる場合があります</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default AboutPage;
