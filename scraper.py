#!/usr/bin/env python
'''
# Web Scraper

Author: Xavier Ho <contact@xavierho.com>

Overview
--------
Collects interviews, postmortems and developer Q&A's from the internet using
a simple set of heuristics.

The scraper works on a list of keywords, usually game titles, and crawls for
related articles on the making-of. The content of the articles are then filtered
down to keywords and phrases such as developer names, inspirations, and related
works. The output is a list of items with related titles.

This program requires BeautifulSoup and Requests.
'''
import os
import csv
import bs4
import pprint
import requests
import collections

__dir = os.path.dirname(os.path.realpath(__file__))
Game = collections.namedtuple('Game', ['First','Last','Title','Developer','Setting','Platform','Notes'], rename=True)

def get_games():
  '''Return a dict of videogame names'''
  games = collections.OrderedDict()
  with open(os.path.join(__dir, 'data', 'list-of-roguelike-games-wikipedia.csv')) as f:
    reader = csv.reader(f)
    reader.next() # Discard header
    for row in reader:
      row[2] = row[2].strip(' *')
      game = Game(*row)
      games[game.Title] = game._asdict()
  # pprint.pprint(games, indent=2)
  return games

def get_urls(game):
  '''Return a list of potential websites to scrap'''
  title = game['Title'].replace(' ', '+')
  developer = game['Developer'].replace(' ', '+')
  response = requests.get('http://duckduckgo.com/html/?q={}+{}'.format(title, developer))
  soup = bs4.BeautifulSoup(response.text)
  links = []
  for node in soup.select('div.web-result'):
    if 'web-result-sponsored' in node['class']:
      continue
    links.append(node.select('a.large')[0].get('href'))
  return links

def compile_urls():
  games = get_games()
  with open(os.path.join(__dir, 'generated', 'postmortems-with-developer.csv'), 'w+') as f:
    f.write('Title,Links\n')
    total = len(games)
    for i, game in enumerate(games.values()):
      print '{}%: {}'.format(i*100/total, game['Title'])
      game['Links'] = [x.encode('utf-8').replace('"', '\\"') for x in get_urls(game)]
      f.write('"{}","{}"\n'.format(game['Title'], '\n'.join(game['Links'])))


if '__main__' in __name__:
  compile_urls()

