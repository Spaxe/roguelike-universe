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

task_build_server () {
  docker build -t spaxe/rogue-ideas-server server
}

task_build_client () {
  docker build -t spaxe/rogue-ideas client
}

task_push_server () {
  docker push spaxe/rogue-ideas-server
}

task_push_client () {
  docker push spaxe/rogue-ideas
}

task_pull_server () {
  docker pull spaxe/rogue-ideas-server
}

task_pull_client () {
  docker pull spaxe/rogue-ideas
}

task_run_server () {
  docker run --name=rogue-ideas-server --restart=always -p 80:8002 -d spaxe/rogue-ideas-server
}

task_run_client () {
  docker run --name=rogue-ideas --restart=always -p 80:8003 -d spaxe/rogue-ideas
}

task_stop_server () {
  docker stop rogue-ideas-server
}

task_stop_client () {
  docker stop rogue-ideas
}

task_remove_server () {
  docker rm rogue-ideas-server
}

task_remove_client () {
  docker rm rogue-ideas
}

task_upgrade_server () {
  runner_sequence pull_server stop_server remove_server run_server
}

task_upgrade_client () {
  runner_sequence pull_client stop_client remove_client run_client
}