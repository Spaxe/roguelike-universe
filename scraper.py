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

# Set default encoding to UTF-8 so print statements don't complain
import sys
reload(sys)
sys.setdefaultencoding('utf-8')

import os
import csv
import bs4
import json
import pprint
import urllib
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

def compile_urls(cached=True):
  path = os.path.join(__dir, 'generated', 'roguelike-games.json')
  games = None
  if cached and os.path.exists(path):
    try:
      with open(path) as f:
        games = json.loads(f.read())
    except:
      games = get_games()
  else:
    games = get_games()

  print "Compiling a list of URLs...."

  for i, (title, game) in enumerate(games.items()):
    print '{}%: {}'.format(i*100/len(games), title)
    # Skip scraping if links already exist
    if cached and 'Links' in game and game['Links']:
      print u"--- {} already has {} links.".format(title, len(game['Links']))
      continue

    links = [x.encode('utf-8').replace('"', '\\"') for x in get_urls(game)]
    game['Links'] = links
    print 'Scrapped {} links.'.format(len(links))

  with open(path, 'w+') as f:
    f.write(json.dumps(games, indent=2))
  return games

def compile_content(cached=True):
  path = os.path.join(__dir, 'generated', 'roguelike-game-articles.json')
  content = None
  if cached and os.path.exists(path):
    try:
      with open(path) as f:
        content = json.loads(f.read())
    except:
      content = {}
  else:
    content = {}

  games = compile_urls()

  print "Scrapping all the URLs..."

  for i, (title, game) in enumerate(games.items()):
    print '{}%: {}'.format(i*100/len(games), title)
    # Skip scraping if content already exist
    if cached and title in content and content[title]:
      print '--- Skipping {}, already has content.'.format(title)
      continue
    content[title] = get_url_content(game)

    with open(os.path.join(__dir, 'generated', 'roguelike-game-articles.json'), 'w+') as f:
      f.write(json.dumps(content, indent=2))

def get_urls(game):
  '''Return a list of potential websites to scrap'''
  title = game['Title'].replace(' ', '+')
  developer = game['Developer'].replace(' ', '+')
  response = requests.get('http://duckduckgo.com/html/?q={}'.format(urllib.quote("{} {}".format(title, developer))), timeout=(9.1, 12.1))
  soup = bs4.BeautifulSoup(response.text)
  links = []
  for node in soup.select('div.web-result'):
    if 'web-result-sponsored' in node['class']:
      continue
    try:
      links.append(node.select('a.large')[0].get('href'))
    except:
      pass
  return links

def get_url_content(game):
  scrape = {}
  for i, url in enumerate(game['Links']):
    print u"{}/{}\tLoading {}".format(i+1, len(game['Links']), url)
    try:
      response = requests.get(url, timeout=(3.1, 10.1))
    except Exception as e:
      print u"{}: Failed to load {}".format(e, url)
      continue
    scrape[url] = response.text
  return scrape

if '__main__' in __name__:
  compile_content()

