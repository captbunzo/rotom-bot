#!/bin/bash

gamemaster=$1

if [[ -z $gamemaster  ]]; then
  echo "Usage: gamemaster_extract_pokemon.sh <game-master-file>"
  exit
fi

cat $gamemaster | jq --raw-output 'map(select(.templateId | test("^V[0-9]{4}_POKEMON")))' > master_pokemon.json

cat master_pokemon.json | jq 'map({
  templateId: .templateId,
  pokemonId: .data.pokemonSettings.pokemonId,
  type: .data.pokemonSettings.type,
  type2: .data.pokemonSettings.type2,
  form: .data.pokemonSettings.form,
  candyToEvolve: .data.pokemonSettings.candyToEvolve,
  kmBuddyDistance: .data.pokemonSettings.kmBuddyDistance,
  purificationStardustNeeded: .data.pokemonSettings.shadow.purificationStardustNeeded,
  baseStamina: .data.pokemonSettings.stats.baseStamina,
  baseAttack: .data.pokemonSettings.stats.baseAttack,
  baseDefense: .data.pokemonSettings.stats.baseDefense
}) | map(select(.pokemonId != null))' > master_pokemon_filtered.json

cat master_pokemon_filtered.json | jq -r '(.[0] | keys_unsorted) as $keys | $keys, map([.[ $keys[] ]])[] | @csv' > master_pokemon_filtered.csv

