#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# gtfsService.jsから重複したgetArrivalTimeメソッドを削除

import re

# ファイルを読み込む
with open('services/gtfsService.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 2つ目のgetArrivalTimeメソッドを検索して削除
# パターン: 2つ目のgetArrivalTimeメソッド全体（コメントから閉じ括弧まで）
pattern = r'\n\s*/\*\*\s+\* 指定したtripの指定した停留所での実際の到着時刻を取得[\s\S]*?async getArrivalTime\(tripId, stopId\)[\s\S]*?\n  \}\n\n\}'

# 最初のマッチを保持、2つ目を削除
matches = list(re.finditer(pattern, content))

if len(matches) >= 2:
    # 2つ目のマッチを削除
    second_match = matches[1]
    content = content[:second_match.start()] + '\n\n}' + content[second_match.end():]
    print(f"OK: Removed duplicate getArrivalTime method at position {second_match.start()}")
else:
    print(f"Found {len(matches)} getArrivalTime methods")

# ファイルに書き込む
with open('services/gtfsService.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("OK: File updated")
