function AboutPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">このアプリについて</h2>

        {/* アプリ概要 */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">アプリ概要</h3>
          <p className="text-gray-700 leading-relaxed mb-3">
            本アプリは、GTFS など複数のオープンデータを活用し、テーマ別に"実行可能な"観光周遊スケジュールを自動生成する Web アプリケーションです。
          </p>
          <p className="text-gray-700 leading-relaxed">
            宮城県内の観光振興、移動効率化、交通空白補完を目的としています。
          </p>
        </section>

        {/* 使用しているオープンデータ */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">使用しているオープンデータ</h3>

          <div className="space-y-4">
            {/* 仙台市営バス GTFS */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-800 mb-2">仙台市営バス GTFS</h4>
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
                <span className="font-medium">ライセンス：</span>
                <span className="text-orange-600">TODO: 提供元の利用規約に従う（後で正確な文言に差し替え）</span>
              </p>
            </div>

            {/* 七ヶ浜町民バス「ぐるりんこ」GTFS */}
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-800 mb-2">七ヶ浜町民バス「ぐるりんこ」GTFS</h4>
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
                <span className="font-medium">ライセンス：</span>
                <span className="text-orange-600">TODO: 公共交通オープンデータ基本ライセンス（正確な文言に差し替え）</span>
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

            {/* PLATEAU */}
            <div className="border-l-4 border-indigo-500 pl-4">
              <h4 className="font-semibold text-gray-800 mb-2">PLATEAU（3D 都市モデル）</h4>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">URL：</span>
                <a
                  href="https://www.mlit.go.jp/plateau/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  https://www.mlit.go.jp/plateau/
                </a>
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">用途：</span>観光スポットの標高情報表示（坂のきつさ評価）
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">ライセンス：</span>
                <a
                  href="https://www.mlit.go.jp/plateau/site-policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  PLATEAUサイトポリシー
                </a>
                （CC BY 4.0）
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

        {/* 注意書き */}
        <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">注意書き</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>各オープンデータのライセンス条件は提供元の利用規約に従います</li>
            <li>本アプリはオープンデータチャレンジ応募向け開発として作成されました</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default AboutPage;
