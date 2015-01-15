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

import os
import bs4
import json
import collections
import data

__dir = os.path.dirname(os.path.realpath(__file__))

blacklist = set([
  'youtube',
  'Chronology_of_roguelike_video_games',
  'Liste_chronologique_des_Rogue-like',
  'en.academic.ru/dic.nsf/enwiki/5833202',
  'dictionary',
  'twitter',
  'facebook',
  'mac.gmer.onemac.net/2014/06/24/historic-mac-games-wiki/',
  "www.gryphel.com/c/sw/games/index.html",
  "macscene.net",
  "home.planet.nl/~pulle071/firemac/games2.htm",
  "www.hsoi.com/hsoishop/links",
])

not_games = set([
  'Android',
  'Firefox',
  'Chrome',
  'Dragon',
  'Wizard',
  'Puzzle',
  'Music',
  'Racing',
  'Sports',
  'Casino',
  'Sports',
  'Adventure',
  'Image',
  'Legend',
  'Ninja'
])

def basic_statistics(roguelikes, content, games):
  print '--- Basic Stats ---'

  game_stats = collections.OrderedDict()
  for game, info in roguelikes.iteritems():
    game_stats[game] = len(info['Links'])
  print "Crawled {} roguelike games for average {} links each.".format(len(roguelikes), sum(game_stats.values())/float(len(roguelikes)))
  print 'Got {} videogame names.'.format(len(games))


def relational_maps(content, game_set, cached=True, use_file=False, reload=None):
  path = os.path.join(__dir, 'generated', 'roguelike-relational-maps.json')
  path_additional = os.path.join(__dir, 'generated', 'games-small.json')
  relational_map = {}
  appeared_games = set()

  if cached and os.path.exists(path):
    with open(path) as f:
      relational_map = json.loads(f.read())
      if use_file:
        return relational_map

  for game, info in content.iteritems():
    if reload is True or (reload and game in reload):
      relational_map[game] = []

      print '--- {} ---'.format(game)
      for url, html in info.iteritems():
        blacklisted = False
        for b in blacklist:
          if b in url:
            print 'Blacklisted {}.'.format(url)
            blacklisted = True
            continue
        if blacklisted:
          continue

        # Italics and bold are often used for name of games.
        games_in_url = []
        soup = bs4.BeautifulSoup(html)
        names = soup.select('i') + soup.select('em') + soup.select('a')
        for name in names:
          n = name.text
          if n in game_set and n.lower() != game.lower() and len(n) > 1 and n not in not_games:
            games_in_url.append(n)
            appeared_games.add(n)

        relational_map[game].extend(games_in_url)
        print '{}: {}'.format(url, games_in_url)
      print

  with open(path, 'w+') as f:
    f.write(json.dumps(relational_map, indent=2))

  with open(path_additional, 'w+') as f:
    f.write(json.dumps({k: v for k, v in game_set.iteritems() if k in appeared_games}, indent=2))

  return relational_map

if '__main__' in __name__:
  roguelikes = data.compile_roguelikes(write=False, use_file=True)
  content = data.compile_content(write=False, use_file=True, verbose=True)
  game_set = data.compile_games()
  roguelike_set = set(roguelikes.keys())

  # basic_statistics(roguelikes, content, game_set)
  relational_maps(content, game_set, reload=True)

