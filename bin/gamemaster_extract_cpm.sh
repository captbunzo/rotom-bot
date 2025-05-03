#!/bin/bash

gamemaster=$1

if [[ -z $gamemaster  ]]; then
  echo "Usage: gamemaster_extract_cpm.sh <game-master-file>"
  exit
fi

cat $gamemaster | jq --raw-output '
    map(select(.templateId | test("PLAYER_LEVEL_SETTINGS")))[0]
  | { cpMultiplier: .data.playerLevel.cpMultiplier }
' > master_cpm.json

