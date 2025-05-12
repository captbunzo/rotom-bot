
import path from 'node:path';
import { readFile } from 'fs/promises';

import {
    EmbedBuilder,
    MessageFlags,
    SlashCommandBuilder
} from 'discord.js';

import {
    FieldValueMaxSize,
    InterimLoadUpdates,
    MaxAutoCompleteChoices
} from '../../Constants.js';

import MasterPokemon from '../../data/MasterPokemon.js';
import Translation   from '../../data/Translation.js';

const MasterPokemonCmd = {
    global: false,
    data: new SlashCommandBuilder()
        .setName('master-pokemon')
        .setDescription('Manage Master Pokémon data')
        .addSubcommand(subCommand =>
            subCommand
                .setName('load')
                .setDescription('Load Master Pokémon data file')
        )
        .addSubcommand(subCommand =>
            subCommand
                .setName('list')
                .setDescription('List Master Pokémon templates')
                .addStringOption(option =>
                    option
                        .setName('pokemon')
                        .setDescription('Pokémon name')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        ),
    
    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'load': this.executeLoad(interaction); break;
            case 'list': this.executeList(interaction); break;
            default:
                await interaction.reply({
                    content: `Master Pokémon management command execution not yet implemented for subcommand -- ${subCommand}`,
                    flags: MessageFlags.Ephemeral
                }); 
        }
    },

    async autocomplete(interaction) {
        const client     = interaction.client;
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'load': this.autocompleteLoad(interaction); break;
            case 'list': this.autocompleteList(interaction); break;
            default:
                client.logger.error(`Master Pokémon management command autocomplete not yet implemented for subcommand -- ${subCommand}`);
        }
    },

    /**********************/
    /* Subcommand :: Load */
    /**********************/

    async executeLoad(interaction) {
        const client = interaction.client;
        const table  = 'master_pokemon';
        const file   = path.join(client.config.data_directory, 'master_pokemon.json');

        await interaction.reply({ content: `Starting load of ${table} table` });

        let json;
        try {
             json = JSON.parse(
                await readFile(
                    new URL(file, import.meta.url)
                )
            );
        } catch (error) {
            await interaction.followUp({ content: `Error reading file` });
        }

        let count = 0;
        let followUpMsg = await interaction.followUp({ content: `Loaded ${count} records into ${table} table` });

        for (let p = 0; p < json.length; p++) {
            let masterPokemonJSON = json[p];
            count++;

            client.logger.debug('Master Pokémon JSON');
            client.logger.dump(masterPokemonJSON);

            let masterPokemonObj = {
                templateId:           masterPokemonJSON.templateId,
                pokemonId:            masterPokemonJSON.pokemonId,
                pokedexId:           +masterPokemonJSON.templateId.substring(1, 5),
                type:                 masterPokemonJSON.type.replace(/^POKEMON_TYPE_/, ''),
                type2:                null,
                form:                 null,
                formMaster:           masterPokemonJSON.form,
                baseAttack:           masterPokemonJSON.baseAttack,
                baseDefense:          masterPokemonJSON.baseDefense,
                baseStamina:          masterPokemonJSON.baseStamina,
                candyToEvolve:        masterPokemonJSON.candyToEvolve,
                buddyDistanceKm:      masterPokemonJSON.kmBuddyDistance,
                purifyStardust:       masterPokemonJSON.purificationStardustNeeded
            }

            if (masterPokemonJSON.type2 != null) {
                masterPokemonObj.type2 = masterPokemonJSON.type2.replace(/^POKEMON_TYPE_/, '');
            }

            if (masterPokemonObj.formMaster != null) {
                masterPokemonObj.form = masterPokemonObj.formMaster.replace(new RegExp('^' + masterPokemonJSON.pokemonId + '_'), '');
            }

            client.logger.debug('Master Pokémon Object');
            client.logger.dump(masterPokemonObj);

            let masterPokemonRec = await MasterPokemon.get({ templateId: masterPokemonObj.templateId, unique: true });

            if (!masterPokemonRec) {
                masterPokemonRec = new MasterPokemon(masterPokemonObj);
                await masterPokemonRec.create();
            } else {
                masterPokemonRec.templateId           = masterPokemonObj.templateId;
                masterPokemonRec.pokemonId            = masterPokemonObj.pokemonId;
                masterPokemonRec.pokedexId            = masterPokemonObj.pokedexId;
                masterPokemonRec.type                 = masterPokemonObj.type;
                masterPokemonRec.type2                = masterPokemonObj.type2;
                masterPokemonRec.form                 = masterPokemonObj.form;
                masterPokemonRec.formMaster           = masterPokemonObj.formMaster;
                masterPokemonRec.baseAttack           = masterPokemonObj.baseAttack;
                masterPokemonRec.baseDefense          = masterPokemonObj.baseDefense;
                masterPokemonRec.baseStamina          = masterPokemonObj.baseStamina;
                masterPokemonRec.candyToEvolve        = masterPokemonObj.candyToEvolve;
                masterPokemonRec.buddyDistanceKm      = masterPokemonObj.buddyDistanceKm;
                masterPokemonRec.purifyStardust       = masterPokemonObj.purifyStardust;
                await masterPokemonRec.update();
            }                

            client.logger.debug('Master Pokémon Record');
            client.logger.dump(masterPokemonRec);

            if (count % InterimLoadUpdates == 0) {
                interaction.editReply({
                    message: followUpMsg,
                    content: `Loaded ${count} records into ${table} table`
                });
            }
        }

        interaction.editReply({
            message: followUpMsg,
            content: `Loaded ${count} records into ${table} table`
        });

        interaction.followUp({
            content: `Load of ${table} table complete`
        });
    },

    async autocompletLoad(interaction) {
        const client  = interaction.client;
        const focusedOption = interaction.options.getFocused(true);
        client.logger.error(
            `Master Pokémon management command autocomplete not yet implemented for load -- ${this.data.name} :: ${focusedOption.name} :: '${focusedOption.value}'`
        );
        await interaction.respond([]);
    },

    /**********************/
    /* Subcommand :: List */
    /**********************/

    async executeList(interaction) {
        const client = interaction.client;

        const pokemonId = interaction.options.getString('pokemon');
        client.logger.debug(`pokemonId = ${pokemonId}`);

        // Create the Boss search object
        const masterPokemonSearchObj = {
            pokemonId: pokemonId
        };

        let masterPokemonArray = await MasterPokemon.get(masterPokemonSearchObj);
        let masterPokemonRec = masterPokemonArray[0];

        let pokemonName = await Translation.getPokemonName(masterPokemonRec.pokedexId);
        let description = await Translation.getPokemonDescription(masterPokemonRec.pokedexId);
        let link = `https://pokemongo.gamepress.gg/c/pokemon/${masterPokemonRec.pokemonId.toLowerCase()}`;
        let thumbnail = `https://static.mana.wiki/pokemongo/${masterPokemonRec.pokemonId.toLowerCase()}-main.png`;
        
      //client.logger.debug(`Master Pokémon Array =`);
      //client.logger.dump(masterPokemonArray);

        let templateIdFieldArray = [];
        let templateIdArray = [];
        let templateIdArrayChars = 0;
        
        for (let x = 0; x < masterPokemonArray.length; x++) {
            masterPokemonRec = masterPokemonArray[x];
            let templateId = masterPokemonRec.templateId;

            if (templateIdArrayChars + templateId.length > FieldValueMaxSize) {
                templateIdFieldArray.push({
                    name: `Templates`,
                    value: templateIdArray.join('\n')
                });

                templateIdArray = [];
                templateIdArrayChars = 0;
            }

            templateIdArray.push(templateId);
            templateIdArrayChars += templateId.length + 1;
        }

        templateIdFieldArray.push({
            name: 'Templates',
            value: templateIdArray.join('\n')
        });

        let embed = new EmbedBuilder()
            .setTitle(pokemonName)
            .setURL(link)
            .setDescription(description)
            .setThumbnail(thumbnail)
            .addFields(templateIdFieldArray);

        await interaction.reply({
            embeds: [embed]
        });
    },

    async autocompleteList(interaction) {
        const client = interaction.client;
        const table  = 'master_pokemon';
        const focusedOption = interaction.options.getFocused(true);
        client.logger.debug(`Initiating autocomplete for boss -- ${this.data.name} :: ${focusedOption.name} :: ${focusedOption.value}`);

        let choices = [];
        const pokemonId = interaction.options.getString('pokemon');
        client.logger.debug(`pokemonId = ${pokemonId}`);

        // Create the Boss search object
        const masterPokemonSearchObj = {};

        if ( (focusedOption.name != 'pokemon') && (pokemonId != null) ) {
            masterPokemonSearchObj.pokemonId = pokemonId;
        }

        switch (focusedOption.name) {
            case 'pokemon':
                choices = await MasterPokemon.getPokemonIdChoices(focusedOption.value, masterPokemonSearchObj);
                break;
        }

        if (choices.length <= MaxAutoCompleteChoices) {
            await interaction.respond(
                choices.map(choice => ({ name: choice, value: choice })),
            );
        } else {
            await interaction.respond([]);
        }
    }
};

export default MasterPokemonCmd;
