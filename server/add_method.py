#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# gtfsService.jsにgetArrivalTimeメソッドを追加するスクリプト

import re

# 追加するメソッド
new_method = '''
  /**
   * 指定したtripの指定した停留所での実際の到着時刻を取得
   * @param {string} tripId - トリップID
   * @param {string} stopId - 停留所ID
   * @returns {Promise<string|null>} 到着時刻（HH:MM:SS形式）またはnull
   */
  async getArrivalTime(tripId, stopId) {
    if (this.useDummyData) {
      return null;
    }

    try {
      await this.initializeDb();

      const stoptimes = await getStoptimes({
        trip_id: tripId,
        stop_id: stopId
      });

      if (stoptimes && stoptimes.length > 0) {
        // arrival_timeがあればそれを返す、なければdeparture_timeを返す
        return stoptimes[0].arrival_time || stoptimes[0].departure_time;
      }

      return null;
    } catch (error) {
      console.error('Error fetching arrival time:', error);
      return null;
    }
  }
'''

# ファイルを読み込む
with open('services/gtfsService.js', 'r', encoding='utf-8') as f:
    content = f.read()

# toRad メソッドの後、クラスの閉じ括弧の前に挿入
# パターン: toRad メソッド全体を見つけて、その後に新しいメソッドを挿入
pattern = r'(  toRad\(degrees\) \{\s+return degrees \* \(Math\.PI / 180\);\s+\})'
replacement = r'\1' + new_method

# 置換
new_content = re.sub(pattern, replacement, content)

# ファイルに書き込む
with open('services/gtfsService.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("OK: getArrivalTime method added")
