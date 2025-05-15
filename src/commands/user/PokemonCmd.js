
import {
    MessageFlags,
    SlashCommandBuilder
 } from 'discord.js';

import {
    MaxAutoCompleteChoices,
    SearchStringCode,
    SearchStringName,
    SearchStringBuddyKmName,
    SearchStringBuddyKmValue,
    SearchStringPurifyStardustName,
    SearchStringPurifyStardustValue
} from '../../Constants.js';

import MasterCPM     from '../../data/MasterCPM.js';
import MasterPokemon from '../../data/MasterPokemon.js';

// TODO - Think about framework for moving all command, subcommand, and option names to constants in the command objects
// TODO - Think about turning these into proper classes

const PokemonCmd = {
    global: true,
	data: new SlashCommandBuilder()
		.setName('pokemon')
		.setDescription('Get Pokémon information')
        .addSubcommand(subCommand => subCommand
            .setName('cp')
            .setDescription('Show CPs for a Pokémon')
            .addStringOption(option => option
                .setName('name')
                .setDescription('Pokémon Name')
                .setRequired(true)
                .setAutocomplete(true)
            )
            .addStringOption(option => option
                .setName('form')
                .setDescription('Pokémon Form')
                .setRequired(false)
                .setAutocomplete(true)
            )
            .addIntegerOption(option => option
                .setName('attack')
                .setDescription('Attack IV')
                .setMinValue(1)
                .setMaxValue(15)
                .setRequired(false)
            )
            .addIntegerOption(option => option
                .setName('defense')
                .setDescription('Defense IV')
                .setMinValue(1)
                .setMaxValue(15)
                .setRequired(false)
            )
            .addIntegerOption(option => option
                .setName('stamina')
                .setDescription('Stamina IV')
                .setMinValue(1)
                .setMaxValue(15)
                .setRequired(false)
            )
            .addIntegerOption(option => option
                .setName('level')
                .setDescription('Level')
                .setMinValue(1)
                .setMaxValue(50)
                .setRequired(false)
            )
        )
        .addSubcommand(subCommand => subCommand
            .setName(SearchStringCode.buddyKm)
            .setDescription('Get Pokémon buddy km search strings')
            .addStringOption(option => option
                .setName('value')
                .setDescription('Buddy walking distance')
                .setRequired(true)
                .addChoices(
                    { name: SearchStringBuddyKmName.distance1k, value: `${SearchStringBuddyKmValue.distance1k}` },
                    { name: SearchStringBuddyKmName.distance3k, value: `${SearchStringBuddyKmValue.distance3k}` },
                    { name: SearchStringBuddyKmName.distance5k, value: `${SearchStringBuddyKmValue.distance5k}` },
                    { name: SearchStringBuddyKmName.distance20k, value: `${SearchStringBuddyKmValue.distance20k}` }
                )
            )
        )
        .addSubcommand(subCommand => subCommand
            .setName(SearchStringCode.purifyStardust)
            .setDescription('Get Pokémon purification stardust search strings')
            .addStringOption(option => option
                .setName('value')
                .setDescription('Stardust amount')
                .setRequired(true)
                .addChoices(
                    { name: SearchStringPurifyStardustName.stardust1k, value: `${SearchStringPurifyStardustValue.stardust1k}` },
                    { name: SearchStringPurifyStardustName.stardust3k, value: `${SearchStringPurifyStardustValue.stardust3k}` },
                    { name: SearchStringPurifyStardustName.stardust5k, value: `${SearchStringPurifyStardustValue.stardust5k}` },
                    { name: SearchStringPurifyStardustName.stardust20k, value: `${SearchStringPurifyStardustValue.stardust20k}` }
                )
            )
        ),
    
    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'cp' : this.executeCP(interaction); break;
            case SearchStringCode.buddyKm        : this.executeSearch(interaction, subCommand); break;
            case SearchStringCode.purifyStardust : this.executeSearch(interaction, subCommand); break;
            default :
                await interaction.reply({ content: `Pokémon command execution not yet implemented for subcommand -- ${subCommand}`, flags: MessageFlags.Ephemeral }); 
        }
    },

    async autocomplete(interaction) {
        const client  = interaction.client;
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'cp' : this.autocompleteCP(interaction); break;
            default :
                client.logger.error(`Pokémon command autocomplete not yet implemented for subcommand -- ${subCommand}`);
        }
    },
    
    /********************/
    /* Subcommand :: CP */
    /********************/

    // TODO - Make the response to this non-ephemeral and put it in an embed with a proper title 
    async executeCP(interaction) {
        const client  = interaction.client;

        const name    = interaction.options.getString('name');
        const form    = interaction.options.getString('form');
        let   attack  = interaction.options.getInteger('attack');
        let   defense = interaction.options.getInteger('defense');
        let   stamina = interaction.options.getInteger('stamina');
        let   level   = interaction.options.getInteger('level');
        
        if (form == null) {
            await interaction.reply({
                content: `Searching for Pokémon: ${name}`,
                flags: MessageFlags.Ephemeral
            });
        } else {
            await interaction.reply({
                content: `Searching for Pokémon: ${name} (${form})`,
                flags: MessageFlags.Ephemeral
            });
        }

        const nameSearchValue = name.toUpperCase();
        const formSearchValue = form ? form.toUpperCase() : null;
        const masterPokemons = await MasterPokemon.get({ pokemonId: nameSearchValue, form: formSearchValue });
        let masterPokemon = null;

        if (masterPokemons.length > 1) {
            await interaction.followUp({
                content: `Multiple Pokémon found for name = ${nameSearchValue}, form = ${formSearchValue}`,
                flags: MessageFlags.Ephemeral
            });

            for (let masterPokemon of masterPokemons) {
                await interaction.followUp({
                    content: `Pokémon: ${masterPokemon.pokemonId}, Form: ${masterPokemon.form}, Type: ${masterPokemon.type}, Type2: ${masterPokemon.type2}`,
                    flags: MessageFlags.Ephemeral
                });
            }

            return
        }

        masterPokemon = masterPokemons[0];
        client.logger.debug('Master Pokémon Object');
        client.logger.dump(masterPokemon);
        
        if (attack != null || defense != null || stamina != null) {
            if (attack == null || defense == null || stamina == null) {
                await interaction.followUp({
                    content: `All or none of Attack, Defense, and Stamina must be provided`,
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            if (attack < 0 || attack > 15 || defense < 0 || defense > 15 || stamina < 0 || stamina > 15) {
                await interaction.followUp({
                    content: `Attack, Defense, and Stamina must be between 0 and 15`,
                    flags: MessageFlags.Ephemeral
                });
                return;
            }
        } else {
            attack = 15;
            defense = 15;
            stamina = 15;
        }
        let pokemonName = await masterPokemon.getName();
        if (form != null) {
            pokemonName += ` (${form})`;
        }

        if (level != null) {
            const cp = await MasterCPM.getCombatPower(masterPokemon, attack, defense, stamina, level);

            client.logger.debug(`IVs: ${attack} / ${defense} / ${stamina}`);
            client.logger.debug(`CP Level ${level}: ${cp}`);

            await interaction.followUp({
                content: `Pokémon: ${pokemonName}\n`
                       + `IVs: ${attack} / ${defense} / ${stamina}\n`
                       + `CP Level ${level}: ${cp}`
            });

        } else {
            const cpLevel15 = await masterPokemon.getCombatPower(attack, defense, stamina, 15);
            const cpLevel20 = await masterPokemon.getCombatPower(attack, defense, stamina, 20);
            const cpLevel25 = await masterPokemon.getCombatPower(attack, defense, stamina, 25);
            const cpLevel50 = await masterPokemon.getCombatPower(attack, defense, stamina, 50);

            client.logger.debug(`Pokémon: ${pokemonName}`);
            client.logger.debug(`IVs: ${attack} / ${defense} / ${stamina}`);
            client.logger.debug(`CP Level 15: ${cpLevel15}`);
            client.logger.debug(`CP Level 20: ${cpLevel20}`);
            client.logger.debug(`CP Level 25: ${cpLevel25}`);
            client.logger.debug(`CP Level 50: ${cpLevel50}`);

            await interaction.followUp({
                content: `Pokémon: ${pokemonName}\n`
                    + `IVs: ${attack} / ${defense} / ${stamina}\n`
                    + `CP Level 15: ${cpLevel15}\n`
                    + `CP Level 20: ${cpLevel20}\n`
                    + `CP Level 25: ${cpLevel25}\n`
                    + `CP Level 50: ${cpLevel50}`
            });
        }
	},

    async autocompleteCP(interaction) {
        const client = interaction.client;

        const focusedOption = interaction.options.getFocused(true);
        client.logger.debug(`Initiating autocomplete for ${this.data.name} :: ${focusedOption.name} :: ${focusedOption.value}`);

        let choices = [];
        switch (focusedOption.name) {
            case 'name':
                choices = await MasterPokemon.getPokemonIdChoices(focusedOption.value);
                break;
            case 'form':
                const pokemonId = interaction.options.getString('name');
                choices = await MasterPokemon.getFormChoices(focusedOption.value, { pokemonId: pokemonId });
                break;
        }

		//const filtered = choices.filter(choice => choice.startsWith(focusedOption.value));

        if (choices.length <= MaxAutoCompleteChoices) {
            await interaction.respond(
                choices.map(choice => ({ name: choice, value: choice })),
            );
        } else {
            await interaction.respond([]);
        }
    },

    /************************/
    /* Subcommand :: Search */
    /************************/

    // TODO - Make the response to this non-ephemeral and put it in an embed with a proper title 
    async executeSearch(interaction, subCommand) {
        const client = interaction.client;
        const value  = interaction.options.getString('value');

        client.logger.debug(`Pokémon command search for ${subCommand} with value = ${value}`);
        let masterPokemonSearchObj = {};
        let title;

        switch (subCommand) {
            case SearchStringCode.buddyKm:
                title = `${SearchStringName.buddyKm}: ${value} km`;
                masterPokemonSearchObj.buddyDistanceKm = value;
                break;
            case SearchStringCode.purifyStardust:
                title = `${SearchStringName.purifyStardust}: ${value} stardust`;
                masterPokemonSearchObj.purifyStardust = value;
                break;
            default:
                await interaction.reply({
                    content: `Pokémon command search not yet implemented for subcommand -- ${subCommand}`,
                    flags: MessageFlags.Ephemeral
                });
                return;
        }

        const pokedexIds = await MasterPokemon.getDistinct('pokedexId', masterPokemonSearchObj);
        if (pokedexIds.length === 0) {
            await interaction.reply({
                content: `No Pokémon found for ${subCommand} with value = ${value}`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const pokedexIdRanges = [];
        let range;

        for (const pokedexId of pokedexIds) {
            if (range == null) {
                range = { start: pokedexId, end: pokedexId };
            } else if (pokedexId === range.end + 1) {
                range.end = pokedexId;
            } else {
                if (range.start === range.end) {
                    pokedexIdRanges.push(range.start);
                } else {
                    pokedexIdRanges.push(range.start + '-' + range.end);
                }
                range = null;
            }
        }

        let pokedexRangesString = pokedexIdRanges.join(',');
        
        if (subCommand == SearchStringCode.purifyStardust) {
          pokedexRangesString += ' & shadow';
        }
        client.logger.debug(`Pokédex IDs: ${pokedexRangesString}`);
        await interaction.reply({
            content: title
        });
        await interaction.followUp({
            content: pokedexRangesString
        });
    }
};

export default PokemonCmd;
