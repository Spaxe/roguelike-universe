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
import re
import os
import bs4
import json
import logging
import collections
import data

logging.basicConfig(format='%(levelname)s: %(message)s', filename='program.log',level=logging.DEBUG)

__dir = os.path.dirname(os.path.realpath(__file__))

blacklist = set([
  "2-dimensions.com/tag/sega/page/5/",
  "wn.com",
  "dosgames.ru",
  "en.wikipedia.org/wiki/Genesis_games",
  "en.wikipedia.org/wiki/Wikipedia:WikiProject_Video_games/Reference_library/Official_PlayStation_Magazine",
  "gk4.me/en/steam",
  "home.planet.nl/~pulle071/firemac/games2.htm",
  "labyrinth.wikia.com/wiki/Labyrinth_(film)",
  "macscene.net",
  "nocturnalhitoshura.blogspot.com",
  "norse-mythology.org/tales/ragnarok",
  "pl.wn.com/F**k_Fatal_Labyrinth",
  "ru.wikipedia.org",
  "store.steampowered.com",
  "techcrunch.com/2008/11/06/sega-releasing-40-game-ultimate-genesis-collection-for-ps3-and-360-early-next-year-will-cost-30/",
  "www.actiontrip.com/cheats/ps3/sonics-ultimate-genesis-collection.phtml",
  "www.cubed3.com",
  "www.cultofmac.com/127163/bill-gates-on-steve-jobs-we-created-the-mac-together-video/",
  "www.diablowiki.net/Storyline",
  "www.digital-eel.com/deep.htm",
  "www.g4tv.com",
  "www.gamasutra.com/view/feature/3674",
  "www.gamesetwatch.com/2009/10/04-week",
  "www.gametrailers.com/videos",
  "www.gamewinners.com",
  "www.giantbomb.com/sting-entertainment/3010-1636",
  "www.gryphel.com/c/sw/games/index.html",
  "www.hsoi.com/hsoishop/links",
  "www.imdb.com",
  "www.mashpedia.com",
  "www.neoseeker.com",
  "www.roguebasin.com/index.php?title=Roguelike_Radio",
  "www.spacegamejunkie.com/featured/sgj-podcast-10-infinite-spaces-small-worlds",
  "www.tigsource.com/category/open-source/",
  'Chronology_of_roguelike_video_games',
  'dictionary',
  'en.academic.ru/dic.nsf/enwiki',
  'facebook',
  'Liste_chronologique_des_Rogue-like',
  'mac.gmer.onemac.net/2014/06/24/historic-mac-games-wiki/',
  'twitter',
  'youtube',
  "www.gamesetwatch.com/2010/02/best_of_indie_games_flip_that.php",
  "www.australiansatwarfilmarchive.gov.au",
  "wowwiki.com",
  "www.iacenter.org",
  "lumbungbuku.wordpress.com",
])

not_games = set([
  'Add',
  'Advent',
  'Adventure',
  'Adventures',
  'Air',
  'Alien',
  'All Games',
  'Amazon',
  'Android',
  'Animal',
  'Arena',
  'Atlantis',
  'Awesome',
  'Black',
  'Blood',
  'Box',
  'Breed',
  'Bridge',
  'Bugs',
  'Caesar',
  'Cal',
  'Campaign',
  'Casino',
  'Char',
  'Chrome',
  'Colossal Cave',
  'Combat',
  'Conquest',
  'Contact',
  'Contact',
  'Contra',
  'Create',
  'Dark',
  'Dennis',
  'Detroit',
  'Drag',
  'Dragon',
  'Dreams',
  'Drop',
  'Dungeon',
  'Dungeons',
  'Edmund',
  'Energy',
  'Epic',
  'Est',
  'Exile',
  'Explore',
  'Eye',
  'Fantasy',
  'Fate',
  'Feedback',
  'Fighter',
  'Firefox',
  'Fish',
  'Fusion',
  'Galaxy',
  'Golem',
  'Green',
  'Guard',
  'Guardian',
  'Guardians',
  'Hank',
  'Hearts',
  'Hero',
  'Hook',
  'How',
  'Hunt',
  'Ichi',
  'Image',
  'Inside',
  'January',
  'Jotto',
  'Karate',
  'Khan',
  'Kicks',
  'Killer',
  'Kingdom',
  'Legend',
  'Life',
  'Love',
  'Machines',
  'Max',
  'Meanwhile',
  'Meat Boy',
  'Meteor',
  'Mines',
  'MLB',
  'mono',
  'Monsters',
  'Moon',
  'Morse',
  'Mummies',
  'Music',
  'NBA',
  'NFL',
  'Ninja',
  'Nippon',
  'Nomad',
  'Nox',
  'One',
  'Outlaw',
  'Patience',
  'Pedro',
  'People',
  'Persona',
  'Pinball',
  'Piranha',
  'Platinum',
  'Plot',
  'Pool',
  'Power',
  'President',
  'Primal',
  'Puzzle',
  'Racing',
  'Realm',
  'Realms',
  'Rescue',
  'Retro',
  'Reverse',
  'Rider',
  'Runner',
  'Screen',
  'Search',
  'Seven',
  'Silver',
  'Soccer',
  'Solo',
  'SOS',
  'Soul',
  'Space',
  'Speed',
  'Spike',
  'Sports',
  'Sports',
  'Spot',
  'Stealth',
  'Steam',
  'Steel',
  'Tactic',
  'Tank',
  'Team',
  'Temporal',
  'That',
  'The Pit',
  'There',
  'This',
  'Time',
  'Tornado',
  'Tower',
  'Town',
  'Trap',
  'Trek',
  'Tri',
  'Troll',
  'uin',
  'Waker',
  'Walker',
  'Wander',
  'Wanderer',
  'Warfare',
  'What',
  'Where',
  'Which',
  'White',
  'Wizard',
  'Yesterday',
])

def basic_statistics(roguelikes, content, games):
  print '--- Basic Stats ---'

  game_stats = collections.OrderedDict()
  for game, info in roguelikes.iteritems():
    game_stats[game] = len(info['Links'])
  print "Crawled {} roguelike games for average {} links each.".format(len(roguelikes), sum(game_stats.values())/float(len(roguelikes)))
  print 'Got {} videogame names.'.format(len(games))


def relational_maps(content, game_set, roguelikes, cached=True, use_file=False, reload=None):
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
    if game in ['Ragnarok', 'TwinBee']:
      continue
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
          if n in game_set and len(n) > 2 and n not in not_games and n.lower() != game.lower():
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
              for g in game_set:
                if g in ['Rogue', 'DUNGEON'] or g in game:
                  continue
                n = g
                # if re.compile(r'\b{}\b'.format(re.escape(n))).search(sentence):
                if ' {} '.format(n) in sentence:
                  if len(n) > 2 and n not in not_games and n.lower() != game.lower():
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
          logging.debug('adding {} to {}'.format(game, source))
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
  # basic_statistics(roguelikes, content, game_set)
  relational_maps(content, game_set, roguelikes, reload=True)

