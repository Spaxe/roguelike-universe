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
import logging
import collections
import data

logging.basicConfig(format='%(levelname)s: %(message)s', filename='tokeniser.log',level=logging.DEBUG)

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
  "nocturnalhitoshura.blogspot.com",
  "en.wikipedia.org/wiki/Wikipedia:WikiProject_Video_games/Reference_library/Official_PlayStation_Magazine",
  "labyrinth.wikia.com/wiki/Labyrinth_(film)",
  "article.wn.com",
  "en.wikipedia.org/wiki/Genesis_games",
  "www.gamasutra.com/view/feature/3674",
  "2-dimensions.com/tag/sega/page/5/",
  "www.diablowiki.net/Storyline",
  "pl.wn.com/F**k_Fatal_Labyrinth",
  "techcrunch.com/2008/11/06/sega-releasing-40-game-ultimate-genesis-collection-for-ps3-and-360-early-next-year-will-cost-30/",
  "www.gamewinners.com",
  "www.actiontrip.com/cheats/ps3/sonics-ultimate-genesis-collection.phtml",
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


def inspirations(content, game_set):
  path = os.path.join(__dir, 'generated', 'roguelike-inspirations.json')
  inspirations = {}
  keywords = ('inspire', 'based on', 'drawn from', 'influence', 'similar', 'like')

  logging.debug('##########')
  logging.debug('Inspiration Map')
  logging.debug('##########')
  for game, info in content.iteritems():
    for url, html in info.iteritems():
      if url.count('/') <= 3 and url.endswith('/'):
        # logging.info('{} is a top level, skipped.'.format(url))
        continue
      blacklisted = False
      for b in blacklist:
        if b in url:
          # logging.info('Blacklisted {}.'.format(url))
          blacklisted = True
          continue
      if blacklisted:
        continue

      soup = bs4.BeautifulSoup(html)
      key_sentences = []
      paragraphs = []

      if 'wikipedia.org' in url:
        paragraphs = soup.select('#mw-content-text > p')
      else:
        paragraphs = soup.select('p')

      for sentence in ''.join(p.text.strip() for p in paragraphs).split('.'):
        for keyword in keywords:
          if keyword in sentence:
            key_sentences.append(sentence)

    inspirations[game] = key_sentences
    logging.debug('--- {} ---\n{}'.format(game, '\n'.join(key_sentences)))

  with io.open(path, 'w', encoding="utf8") as f:
    output = json.dumps(inspirations, indent=2, ensure_ascii=False).decode('utf8')
    try:
      f.write(output)
    except TypeError:
      f.write(output.decode('utf8'))
  return inspirations


def relational_maps(content, game_set, roguelike_set, cached=True, use_file=False, reload=None):
  path = os.path.join(__dir, 'generated', 'roguelike-relational-maps.json')
  path_additional = os.path.join(__dir, 'generated', 'games-small.json')
  keywords = ('inspir', 'based', 'drawn', 'influenc', 'similar', 'like')
  relational_map = {}
  appeared_games = set()

  if cached and os.path.exists(path):
    with open(path) as f:
      relational_map = json.loads(f.read())
      if use_file:
        return relational_map

  logging.debug('##########')
  logging.debug('Relational Map')
  logging.debug('##########')
  for game, info in content.iteritems():
    if reload is True or (reload and game in reload):
      relational_map[game] = []

      logging.debug('--- {} ---'.format(game))
      for i, (url, html) in enumerate(info.iteritems()):
        if url.count('/') <= 3 and url.endswith('/'):
          # logging.info('{} is a top level, skipped.'.format(url))
          continue
        blacklisted = False
        for b in blacklist:
          if b in url:
            # logging.info('Blacklisted {}.'.format(url))
            blacklisted = True
            continue
        if blacklisted:
          continue

        logging.debug(url)
        # Italics and bold are often used for name of games.
        games_in_url = []
        soup = bs4.BeautifulSoup(html)
        names = []

        if 'wikipedia.org' in url:
          names = soup.select('#mw-content-text > p > i') + soup.select('#mw-content-text > p > em') + soup.select('#mw-content-text > p > a')
        else:
          names = soup.select('p > i') + soup.select('p > em') + soup.select('p > a')
        for name in names:
          n = name.text
          if n in game_set and n.lower() != game.lower() and len(n) > 1 and n not in not_games:
            games_in_url.append(n)
            appeared_games.add(n)

        # Also check sentences that contain possible keywords
        key_sentences = []
        paragraphs = []

        if 'wikipedia.org' in url:
          paragraphs = soup.select('#mw-content-text > p')
        else:
          paragraphs = soup.select('p')

        for sentence in ''.join(p.text.strip() + '.' for p in paragraphs).split('.'):
          for keyword in keywords:
            if keyword in sentence:
              for roguelike in roguelike_set:
                if roguelike in sentence:
                  n = roguelike
                  if n in game_set and n.lower() != game.lower() and len(n) > 1 and n not in not_games:
                    games_in_url.append(n)
                    appeared_games.add(n)

        relational_map[game].extend(games_in_url)
        logging.debug('{}/{} {}'.format(i+1, len(info), games_in_url))

    # Return the most common occurences
    counter = collections.Counter(relational_map[game])
    relational_map[game] = [x[0] for x in counter.most_common(5)]

  # Make the map 2-way
  for source, target in relational_map.iteritems():
    if reload is True or (reload and source in reload):
      new_target = set(target)
      for game in target:
        if game in relational_map:
          new_target.add(game)
      relational_map[source] = list(new_target)

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
  roguelikes = data.compile_roguelikes(use_file=True, verbose=True)
  content = data.compile_content(use_file=True, verbose=True)
  game_set = data.compile_games()
  roguelike_set = set(roguelikes.keys())
  # basic_statistics(roguelikes, content, game_set)
  relational_maps(content, game_set, roguelike_set, reload=True)
  # inspirations(content, game_set)

