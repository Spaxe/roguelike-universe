#############################################################################
# Environment
testing="core@188.166.209.155"

env=$testing

alias node='node --harmony'

# Testing GNU version (Mac users should get coreutils on homebrew)
if date --version >/dev/null 2>&1 ; then
  alias tail='gtail'
fi


#############################################################################
# Development
task_server () {
  cd server
  npm install
  nodemon server.js
}

task_client () {
  cd client
  npm install
  node node_modules/http-server/bin/http-server -p 8003
}

task_babel () {
  cd client
  watchify -v --debug -t [ babelify --presets [ react es2015 ] ] rogue-ideas.js -o public/rogue-ideas.min.js
}

task_build () {
  runner_parallel build_server build_client
}

task_push () {
  runner_parallel push_server push_client
}

task_start_tunnel () {
  runner_parallel start_tunnel_admin start_tunnel_driver
}

task_stop_tunnel () {
  runner_parallel stop_tunnel_admin stop_tunnel_driver
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

task_start_tunnel_admin () {
  autossh -M0 -f -NTL localhost:8004:$(ssh ${env} "docker inspect --format \
  '{{ .NetworkSettings.IPAddress }}' universe-testing"):8080 ${env}
}

task_stop_tunnel_admin () {
  kill $(lsof -t -i @localhost:8004 -sTCP:listen)
}

task_start_tunnel_driver () {
  autossh -M0 -f -NTL localhost:8005:$(ssh ${env} "docker inspect --format \
  '{{ .NetworkSettings.IPAddress }}' universe-testing"):28015 ${env}
}

task_stop_tunnel_driver () {
  kill $(lsof -t -i @localhost:8005 -sTCP:listen)
}

#############################################################################
# Deployment
task_upgrade_server () {
  runner_sequence pull_server stop_server remove_server run_server
}

task_upgrade_client () {
  runner_sequence pull_client stop_client remove_client run_client
}

task_pull_server () {
  docker pull spaxe/rogue-ideas-server
}

task_pull_client () {
  docker pull spaxe/rogue-ideas
}

task_run_server () {
  alias HOSTIP=`ip -4 addr show scope global dev docker0 | grep inet | awk '{print $2}' | cut -d / -f 1`
  docker run --name=rogue-ideas-server --restart=always \
             -p 80:8002 --add-host=dockerhost:${HOSTIP} -d spaxe/rogue-ideas-server
}

task_run_client () {
  docker run --name=rogue-ideas --restart=always \
             -p 80:8003 -d spaxe/rogue-ideas
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


#############################################################################
# Testing

task_upgrade_testing_database () {
  runner_sequence stop_testing_database remove_testing_database run_testing_database
}

task_run_testing_database () {
  docker run --name=universe-testing --restart=always -v "$PWD/database:/data" -d rethinkdb
}

task_start_testing_database () {
  docker start universe-testing
}

task_stop_testing_database () {
  docker stop universe-testing
}

task_remove_testing_database () {
  docker rm universe-testing
}

task_test_connection () {
  cd devops
  npm install
  node test_connection.js
}

task_populate_database () {
  cd devops
  npm install
  node populate_database.js
}

task_test () {
  echo "Testing"
}
