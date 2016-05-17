#!/bin/bash
watchify roguelike-universe.js -o index.js -v -t [ babelify --presets [ es2015 ] ] &
python3 -m http.server 8001