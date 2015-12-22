#!/usr/bin/env bash
cd `dirname ${0}`
source ./runner.sh

task_server () {
  cd server
  npm install
  npm start
}