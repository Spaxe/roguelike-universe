#!/usr/bin/env python
'''
# Content Tokeniser

Author: Xavier Ho <contact@xavierho.com>

Overview
--------
Breaks down HTML content into meaningful fragments: sentences, phrases, words,
tags, headlines.

This program requires BeautifulSoup.
'''
# Set default encoding to UTF-8 so print statements don't complain
import sys
reload(sys)
sys.setdefaultencoding('utf-8')

import bs4
import json
import collections
import data

def basic_statistics(games, content):
  print '--- Basic Stats ---'

  game_stats = collections.OrderedDict()
  for game, info in games.iteritems():
    game_stats[game] = len(info['Links'])
  print "Crawled {} games for average {} links each.".format(len(games), sum(game_stats.values())/float(len(games)))

if '__main__' in __name__:
  games = data.compile_games(write=False)
  content = data.compile_content(write=False)

  basic_statistics(games, content)
