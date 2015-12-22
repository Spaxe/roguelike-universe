#!/usr/bin/env python3
import urllib
import json
import csv
import io

output = [["Game", "Text"]]

with open('data/corpus.json') as f:
  json_data = json.loads(f.read())
  for game, meta in json_data.items():
    if game == "Izuna: Legend of the Unemployed Ninja": continue
    row = [game]

    for label, data in meta.items():
      corpus = ''
      for words in data:
        words = words.replace('"', "'")
        words = words.replace('\r', ' ')
        words = words.replace('\n', ' ')
        corpus += words + ' '

    row.append(corpus)

    output.append(row)


with io.open('dataexp/corpus.csv', 'w', encoding="utf-8") as f:
  csvwriter = csv.writer(f)

  for row in output:
    csvwriter.writerow(row)


output = [["Game"]]
labelled = False

with open('data/game-sources.json') as f:
  json_data = json.loads(f.read())
  for game, meta in json_data.items():
    row = [game]

    for label, data in meta.items():
      if label == 'Links': continue

      if not labelled:
        output[0].append(label)

      row.append(data)

    labelled = True

    output.append(row)

with io.open('dataexp/game-sources.csv', 'w', encoding="utf-8") as f:
  csvwriter = csv.writer(f)

  for row in output:
    csvwriter.writerow(row)
