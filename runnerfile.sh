task_server () {
  cd server
  npm install
  npm start
}

task_client() {
  cd client
  npm install
  node node_modules/http-server/bin/http-server -p 8003
}

task_build () {
  docker build -t spaxe/rogue-ideas-server server
  docker build -t spaxe/rogue-ideas client
}

task_push () {
  docker push spaxe/rogue-ideas-server
  docker push spaxe/rogue-ideas
}

task_pull () {
  docker pull spaxe/rogue-ideas-server
  docker pull spaxe/rogue-ideas
}

task_start_server () {
  docker run -p 80:8002 -d spaxe/rogue-ideas-server
}

task_start_client () {
  docker run -p 80:8003 -d spaxe/rogue-ideas
}