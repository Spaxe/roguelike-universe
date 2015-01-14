#!/usr/bin/env python
'''Parsing list-of-video-games to CSV form'''

import re
import json
from collections import namedtuple

data = namedtuple('Game', ['title', 'year', 'publisher', 'platforms'], verbose=False, rename=True)
regex = re.compile('^\s*(.*) \(([0-9]+), (.*)\) \((.*)\)\s*$')
games = []

with open('list-of-video-games.txt') as f:
  for line in f.readlines():
    match = regex.match(line)
    if match:
      games.append(data(*match.groups()))
    else:
      print 'Error: {} is abnormal.'.format(line)

# with open('list-of-video-games.csv', 'w+') as f:
#   f.write('Title,Year,Publisher,Platforms\n')
#   for game in games:
#     f.write(
#         '{}\n'.format(
#           ','.join(('"{}"'.format(x.strip()) for x in game._asdict().values()))
#         )
#       )

with open('../generated/games.json', 'w+') as f:
  output = [{game[0].strip(): game._asdict()} for game in games]
  f.write(json.dumps(output, indent=2))

with open('../generated/games-years.json', 'w+') as f:
  output = [{game[0].strip(): game.year} for game in games]
  f.write(json.dumps(output, indent=2))