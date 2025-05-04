#!/bin/bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

fnm use 22

#while true; do
  date
  echo "Starting Rotom..."
  node ./app.js

  date
  echo "It died, how sad..."
  echo
#  echo "################################################################################";
#  echo "################################################################################";
#  echo "################################################################################";
#  echo
#
#  sleep 5
#done
