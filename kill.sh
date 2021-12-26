#!/bin/bash

# killing by port number given after --port, 41370 in this case
sudo_pid=$(ps aux | grep 'sudo node jam_server_main.js' | awk '{if ($11 == "sudo"){print $2}}')
sudo kill -9 "$sudo_pid"

main_pid=$(ps aux | grep 'node jam_server_main.js' | awk '{if ($11 == "node"){print $2}}')
sudo kill -9 "$main_pid"

