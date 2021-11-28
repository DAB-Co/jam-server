#!/bin/bash

# killing by port number given after --port, 41371 in this case
sudo_pid=$(ps aux | grep 'sudo node main.js' | awk '{if ($11 == "sudo" && $15 == "41370"){print $2}}')
sudo kill -9 "$sudo_pid"

main_pid=$(ps aux | grep 'node main.js' | awk '{if ($11 == "node" && $14 == "41370"){print $2}}')
sudo kill -9 "$main_pid"

