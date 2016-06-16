#!/bin/bash
watchify web/roguelike-universe.js -o web/public/index.js \
  -v -d -t [ babelify --presets [ es2015 ] ] &
cd web/public
python3 -m http.server 8001