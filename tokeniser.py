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

import io
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
  'en.academic.ru/dic.nsf/enwiki',
  "ru.wikipedia.org",
  'dictionary',
  'twitter',
  'facebook',
  'mac.gmer.onemac.net/2014/06/24/historic-mac-games-wiki/',
  "www.gryphel.com/c/sw/games/index.html",
  "macscene.net",
  "home.planet.nl/~pulle071/firemac/games2.htm",
  "www.hsoi.com/hsoishop/links",
  "dosgames.ru",
  "www.roguebasin.com/index.php?title=Roguelike_Radio",
  "gk4.me/en/steam",
  "www.spacegamejunkie.com/featured/sgj-podcast-10-infinite-spaces-small-worlds",
  "www.gametrailers.com/videos",
  "www.neoseeker.com",
  "www.giantbomb.com/sting-entertainment/3010-1636",
  "www.mashpedia.com",
  "www.cubed3.com",
  "www.g4tv.com",
  "www.digital-eel.com/deep.htm",
  "norse-mythology.org/tales/ragnarok",
  "www.imdb.com",
  "www.gamesetwatch.com/2009/10/04-week",
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
  'Image',
  'Legend',
  'Ninja',
  'People',
  'Fantasy',
  'Life',
  'NBA',
  'NFL',
  'MLB',
  'Soccer',
  'Search',
  'Steam',
  'Contact',
  'Bugs',
  'Energy',
  'Silver',
  'Platinum',
  'Black',
  'White',
  'The Pit',
  'Solo',
  'All Games',
  'Retro',
  'Amazon',
  'Green',
  'Detroit',
  'Contact',
  'January',
  'Feedback',
  'Awesome',
  'Space',
  'Monsters',
  'Stealth',
  'Combat'
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
        names = soup.select('p > i') + soup.select('p > em') + soup.select('p > a')
        for name in names:
          n = name.text
          if n in game_set and n.lower() != game.lower() and len(n) > 1 and n not in not_games:
            games_in_url.append(n)
            appeared_games.add(n)

        relational_map[game].extend(games_in_url)
        print '{}: {}'.format(url, games_in_url)
      print

  with io.open(path, 'w', encoding="utf8") as f:
    output = json.dumps(relational_map, indent=2, ensure_ascii=False).decode('utf8')
    try:
      f.write(output)
    except TypeError:
      f.write(output.decode('utf8'))

  with io.open(path_additional, 'w', encoding="utf8") as f:
    output = json.dumps({k: v for k, v in game_set.iteritems() if k in appeared_games}, indent=2, ensure_ascii=False)
    try:
      f.write(output)
    except TypeError:
      f.write(output.decode('utf8'))

  return relational_map

if '__main__' in __name__:
  roguelikes = data.compile_roguelikes(write=False, use_file=True)
  content = data.compile_content(write=False, use_file=True, verbose=True)
  game_set = data.compile_games()
  roguelike_set = set(roguelikes.keys())

  # basic_statistics(roguelikes, content, game_set)
  relational_maps(content, game_set, cached=False, reload=True)

