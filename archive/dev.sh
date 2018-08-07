node_modules/.bin/watchify roguelike-relations.js \
  -v -d \
  -t [ babelify --presets [ es2015 ] ] \
  -p [ minifyify --map roguelike-relations.map --output public/roguelike-relations.map ] \
  -o public/roguelike-relations.min.js &

cd public ; python3 -m http.server 8005
