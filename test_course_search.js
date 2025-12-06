import fetch from 'node-fetch';

async function testCourseSearch() {
  const testData = {
    location: { lat: 38.2983, lon: 141.0606 }, // 七ヶ浜町
    theme: '初めて訪れた人向け',
    startTime: '09:00',
    visitDuration: 60,
    maxSpots: 5
  };

  console.log('🧪 テストデータ:', JSON.stringify(testData, null, 2));

  try {
    const response = await fetch('http://localhost:3001/api/scheduler/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(testData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ 成功:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ エラー:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('❌ リクエスト失敗:', error.message);
  }
}

testCourseSearch();
