function HowToUsePage() {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">使い方</h2>

        {/* デモ動画セクション */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">📹 デモ動画</h3>
          <p className="text-gray-700 mb-4">
            実際の操作画面を録画したデモ動画です。基本的な使い方を確認できます。
          </p>
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">
              デモ動画: <code className="bg-gray-200 px-2 py-1 rounded">recorded-demo.mp4</code>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              ※ 動画ファイルはプロジェクトルートに保存されています
            </p>
          </div>
        </section>

        {/* 基本的な使い方 */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">📝 基本的な使い方</h3>
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-4">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-2">出発地点を選択</h4>
                <p className="text-gray-700 mb-2">
                  ドロップダウンメニューから出発地点を選択します。主要な駅やバス停が選択できます。
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
                  <li>仙台駅</li>
                  <li>仙台市役所</li>
                  <li>七ヶ浜国際村</li>
                  <li>その他の主要スポット</li>
                </ul>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-4">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-2">観光テーマを選択</h4>
                <p className="text-gray-700 mb-2">
                  訪問したい観光スポットのテーマを選択します。
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-2 rounded-md text-sm">🗺️ 初めて訪れた人向けコース</span>
                  <span className="bg-purple-100 text-purple-800 px-3 py-2 rounded-md text-sm">💎 2回目の人向けコース（穴場スポット）</span>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-md text-sm">☕ 歴史とカフェを楽しむコース</span>
                  <span className="bg-pink-100 text-pink-800 px-3 py-2 rounded-md text-sm">🌅 絶景とグルメを満喫コース</span>
                  <span className="bg-green-100 text-green-800 px-3 py-2 rounded-md text-sm">🏃 アクティブに楽しむコース</span>
                  <span className="bg-indigo-100 text-indigo-800 px-3 py-2 rounded-md text-sm">👨‍👩‍👧‍👦 ファミリー向けコース</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-4">
                3
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-2">出発時刻を入力</h4>
                <p className="text-gray-700 mb-2">
                  観光を開始する時刻を指定します。実際のバス時刻表に基づいてスケジュールが生成されます。
                </p>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  💡 例: 09:00（午前9時出発）
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-4">
                4
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-2">各スポットでの滞在時間を設定</h4>
                <p className="text-gray-700 mb-2">
                  各観光スポットで滞在する時間（分）を指定します。
                </p>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  💡 推奨: 30分〜120分（観光スポットの規模に応じて調整）
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-4">
                5
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-2">訪問スポット数を指定</h4>
                <p className="text-gray-700 mb-2">
                  1日で訪問したい観光スポットの数を指定します。
                </p>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  💡 推奨: 3〜5箇所（無理のないスケジュールのため）
                </p>
              </div>
            </div>

            {/* Step 6 */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold mr-4">
                6
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-2">スケジュール生成ボタンをクリック</h4>
                <p className="text-gray-700 mb-2">
                  「スケジュールを生成」ボタンをクリックすると、最適な観光ルートが自動生成されます。
                </p>
                <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                  ⏱️ 通常、数秒〜10秒程度で結果が表示されます
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 結果画面の見方 */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">🗺️ 結果画面の見方</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">📊 概要エリア</h4>
              <p className="text-gray-700 text-sm mb-2">
                画面上部には、スケジュールの概要が表示されます：
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
                <li>訪問スポット数</li>
                <li>総所要時間</li>
                <li>出発時刻と帰着時刻</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">📍 スケジュール詳細</h4>
              <p className="text-gray-700 text-sm mb-2">
                タイムラインには以下の情報が表示されます：
              </p>
              <div className="space-y-3 mt-3">
                <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                  <p className="text-sm font-semibold text-blue-900">🎯 観光スポット</p>
                  <p className="text-xs text-blue-700 mt-1">スポット名、到着・出発時刻、滞在時間</p>
                </div>
                <div className="bg-green-50 p-3 rounded border-l-4 border-green-500">
                  <p className="text-sm font-semibold text-green-900">🚌 バス移動</p>
                  <p className="text-xs text-green-700 mt-1">路線名、路線番号、乗車・降車時刻、バス停名</p>
                </div>
                <div className="bg-gray-50 p-3 rounded border-l-4 border-gray-500">
                  <p className="text-sm font-semibold text-gray-900">🚶 徒歩移動</p>
                  <p className="text-xs text-gray-700 mt-1">出発地点、到着地点、所要時間</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">🗺️ 地図表示</h4>
              <p className="text-gray-700 text-sm mb-2">
                インタラクティブな地図で以下の情報を確認できます：
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
                <li>観光スポットの位置（赤いマーカー）</li>
                <li>バス停の位置（青いマーカー）</li>
                <li>移動ルート（道路に沿った実際のルート）</li>
                <li>乗車・降車バス停（緑/オレンジのマーカー）</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 各入力項目の詳細説明 */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">⚙️ 入力項目の詳細</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-800 mb-1">出発地点</h4>
              <p className="text-sm text-gray-700 mb-2">
                観光の起点となる場所です。最後にこの地点に戻るルートが自動生成されます。
              </p>
              <p className="text-xs text-gray-600">
                ※ 選択肢に希望の場所がない場合は、近い地点を選択してください
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-800 mb-1">テーマ</h4>
              <p className="text-sm text-gray-700 mb-2">
                選択したテーマに応じて、関連する観光スポットが自動的に選ばれます。6つのコースから選択できます。
              </p>
              <p className="text-xs text-gray-600">
                例: 「初めて訪れた人向けコース」では定番の人気スポット、「2回目の人向けコース」では穴場スポットが選ばれます
              </p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-semibold text-gray-800 mb-1">出発時刻</h4>
              <p className="text-sm text-gray-700 mb-2">
                この時刻以降の最適なバス便が検索されます。早い時間帯の方が選択肢が多くなります。
              </p>
              <p className="text-xs text-gray-600">
                推奨: 午前中（9:00〜10:00）の出発
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold text-gray-800 mb-1">滞在時間（分）</h4>
              <p className="text-sm text-gray-700 mb-2">
                各観光スポットでの平均的な滞在時間です。全スポット共通の時間が適用されます。
              </p>
              <p className="text-xs text-gray-600">
                小規模スポット: 30〜45分 / 中規模: 60〜90分 / 大規模: 120分以上
              </p>
            </div>

            <div className="border-l-4 border-pink-500 pl-4">
              <h4 className="font-semibold text-gray-800 mb-1">訪問スポット数</h4>
              <p className="text-sm text-gray-700 mb-2">
                1日で訪問する観光スポットの数です。待ち時間を最小化するアルゴリズムで最適なルートを提案します。
              </p>
              <p className="text-xs text-gray-600">
                多すぎると移動時間が長くなるため、3〜5箇所が推奨です
              </p>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">💡 便利な使い方のコツ</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2 mt-1">✓</span>
              <div>
                <span className="font-semibold text-gray-800">時間に余裕を持たせる</span>
                <p className="text-sm text-gray-700 mt-1">
                  予期しない遅延に備えて、滞在時間を少し長めに設定すると安心です。
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 mt-1">✓</span>
              <div>
                <span className="font-semibold text-gray-800">天候を確認する</span>
                <p className="text-sm text-gray-700 mt-1">
                  画面右上の天気ウィジェットで当日の天候と降水確率を確認できます。
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-purple-500 mr-2 mt-1">✓</span>
              <div>
                <span className="font-semibold text-gray-800">地図を活用する</span>
                <p className="text-sm text-gray-700 mt-1">
                  地図をクリック・ドラッグして、周辺の情報を確認できます。
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-500 mr-2 mt-1">✓</span>
              <div>
                <span className="font-semibold text-gray-800">帰路を確認する</span>
                <p className="text-sm text-gray-700 mt-1">
                  スケジュールの最後には、出発地点への帰路が自動で追加されます。
                </p>
              </div>
            </li>
          </ul>
        </section>

        {/* 注意事項 */}
        <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">⚠️ 注意事項</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
            <li>バス時刻表データは定期的に更新されますが、実際の運行状況と異なる場合があります</li>
            <li>天候や道路状況により、実際の移動時間が予測と異なる場合があります</li>
            <li>バスの運休や遅延については、事前に交通機関の公式サイトでご確認ください</li>
            <li>観光スポットの営業時間や休業日は、各施設の公式サイトで事前にご確認ください</li>
            <li>初回アクセス時は、バックエンドサーバーの起動に30秒〜1分程度かかる場合があります</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default HowToUsePage;
