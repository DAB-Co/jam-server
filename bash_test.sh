#!/bin/bash

function kill_server(){
	main_pid=$(ps aux | grep 'node jam_server_main.js' | awk '{if ($11 == "node"){print $2}}')
	kill -9 "$main_pid"
}

echo http_port=8080 > .env.local
if !(node overwrite_database.js); then
	echo 'error running node overwrite_database.js'
	exit 1
fi
nohup node jam_server_main.js --no_https > output &
if (npm run mocha); then
	kill_server
	exit 0
else
	echo '---server output---'
	cat output
	kill_server
	exit 2 
fi

