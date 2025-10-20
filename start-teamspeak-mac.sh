#!/bin/bash
open -a "TeamSpeak" --args --remote-debugging-port=9222 --remote-debugging-address=127.0.0.1
sleep 3
node ./injector.js