import path from 'node:path';
import { readFile } from 'fs/promises';

import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    EmbedBuilder,
    MessageFlags,
    SlashCommandBuilder,
} from 'discord.js';

import Client from '#src/Client.js';

import { FieldValueMaxSize, InterimLoadUpdates, MaxAutoCompleteChoices } from '#src/Constants.js';

import type { MasterPokemonConditions, MasterPokemonData } from '#src/models/MasterPokemon.js';

import MasterPokemon from '#src/models/MasterPokemon.js';
import PogoHubLink from '#src/models/PogoHubLink.js';
import Translation from '#src/models/Translation.js';
import WikiLink from '#src/models/WikiLink.js';

const MasterPokemonCmd = {
    global: false,
    data: new SlashCommandBuilder()
        .setName('master-pokemon')
        .setDescription('Manage Master Pokémon data')
        .addSubcommand((subCommand) =>
            subCommand.setName('load').setDescription('Load Master Pokémon data file')
        )
        .addSubcommand((subCommand) =>
            subCommand
                .setName('list')
                .setDescription('List Master Pokémon templates')
                .addStringOption((option) =>
                    option
                        .setName('pokemon')
                        .setDescription('Pokémon name')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'load':
                this.executeLoad(interaction);
                break;
            case 'list':
                this.executeList(interaction);
                break;
            default:
                await interaction.reply({
                    content: `Master Pokémon management command execution not yet implemented for subcommand -- ${subCommand}`,
                    flags: MessageFlags.Ephemeral,
                });
        }
    },

    async autocomplete(interaction: AutocompleteInteraction) {
        const client = interaction.client as Client;
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'load':
                this.autocompleteLoad(interaction);
                break;
            case 'list':
                this.autocompleteList(interaction);
                break;
            default:
                client.logger.error(
                    `Master Pokémon management command autocomplete not yet implemented for subcommand -- ${subCommand}`
                );
        }
    },

    /**********************
     * Subcommand :: Load *
     **********************/

    async executeLoad(interaction: ChatInputCommandInteraction) {
        const client = interaction.client as Client;
        const table = 'master_pokemon';
        const file = path.join(client.config.data_directory, 'master_pokemon.json');

        await interaction.reply({ content: `Starting load of ${table} table` });

        let json;
        try {
            const url = new URL(file, import.meta.url);
            const data = (await readFile(url)).toString();
            json = JSON.parse(data);
        } catch (error) {
            await interaction.followUp({ content: `Error reading file` });
        }

        let count = 0;
        let followUpMsg = await interaction.followUp({
            content: `Loaded ${count} records into ${table} table`,
        });

        for (let p = 0; p < json.length; p++) {
            let masterPokemonJSON = json[p];
            count++;

            client.logger.debug('Master Pokémon JSON');
            client.logger.dump(masterPokemonJSON);

            let pokemonId = masterPokemonJSON.pokemonId;

            // Check if masterPokemonJSON.pokemonId is numeric
            if (masterPokemonJSON.pokemonId && !isNaN(masterPokemonJSON.pokemonId)) {
                client.logger.dump(masterPokemonJSON.templateId.split('_'));
                pokemonId = masterPokemonJSON.templateId.split('_')[2];
            }

            let masterPokemonObj: MasterPokemonData = {
                templateId: masterPokemonJSON.templateId,
                pokemonId: pokemonId,
                pokedexId: +masterPokemonJSON.templateId.substring(1, 5),
                type: masterPokemonJSON.type.replace(/^POKEMON_TYPE_/, ''),
                type2: null,
                form: null,
                formMaster: masterPokemonJSON.form,
                baseAttack: masterPokemonJSON.baseAttack,
                baseDefense: masterPokemonJSON.baseDefense,
                baseStamina: masterPokemonJSON.baseStamina,
                candyToEvolve: masterPokemonJSON.candyToEvolve,
                buddyDistanceKm: masterPokemonJSON.kmBuddyDistance,
                purifyStardust: masterPokemonJSON.purificationStardustNeeded,
            };

            if (masterPokemonJSON.type2 != null) {
                masterPokemonObj.type2 = masterPokemonJSON.type2.replace(/^POKEMON_TYPE_/, '');
            }

            if (masterPokemonObj.formMaster != null) {
                if (typeof masterPokemonObj.formMaster === 'string') {
                    masterPokemonObj.form = masterPokemonObj.formMaster.replace(
                        new RegExp('^' + masterPokemonJSON.pokemonId + '_'),
                        ''
                    );
                } else {
                    masterPokemonObj.form = masterPokemonObj.formMaster;
                }
            }

            client.logger.debug('Master Pokémon Object');
            client.logger.dump(masterPokemonObj);

            let masterPokemon = await MasterPokemon.getUnique({
                templateId: masterPokemonObj.templateId,
            });

            if (!masterPokemon) {
                masterPokemon = new MasterPokemon(masterPokemonObj);
                await masterPokemon.create();
            } else {
                masterPokemon.templateId = masterPokemonObj.templateId;
                masterPokemon.pokemonId = masterPokemonObj.pokemonId;
                masterPokemon.pokedexId = masterPokemonObj.pokedexId;
                masterPokemon.type = masterPokemonObj.type;
                masterPokemon.type2 = masterPokemonObj.type2 || null;
                masterPokemon.form = masterPokemonObj.form || null;
                masterPokemon.formMaster = masterPokemonObj.formMaster || null;
                masterPokemon.baseAttack = masterPokemonObj.baseAttack || null;
                masterPokemon.baseDefense = masterPokemonObj.baseDefense || null;
                masterPokemon.baseStamina = masterPokemonObj.baseStamina || null;
                masterPokemon.candyToEvolve = masterPokemonObj.candyToEvolve || null;
                masterPokemon.buddyDistanceKm = masterPokemonObj.buddyDistanceKm;
                masterPokemon.purifyStardust = masterPokemonObj.purifyStardust || null;

                await masterPokemon.update();
            }

            client.logger.debug('Master Pokémon Record');
            client.logger.dump(masterPokemon);

            if (count % InterimLoadUpdates == 0) {
                interaction.editReply({
                    message: followUpMsg,
                    content: `Loaded ${count} records into ${table} table`,
                });
            }
        }

        interaction.editReply({
            message: followUpMsg,
            content: `Loaded ${count} records into ${table} table`,
        });

        interaction.followUp({
            content: `Load of ${table} table complete`,
        });
    },

    async autocompleteLoad(interaction: AutocompleteInteraction) {
        const client = interaction.client as Client;
        const focusedOption = interaction.options.getFocused(true);
        client.logger.error(
            `Master Pokémon management command autocomplete not yet implemented for load -- ${this.data.name} :: ${focusedOption.name} :: '${focusedOption.value}'`
        );
        await interaction.respond([]);
    },

    /**********************
     * Subcommand :: List *
     **********************/

    async executeList(interaction: ChatInputCommandInteraction) {
        const client = interaction.client as Client;

        const pokemonId = interaction.options.getString('pokemon');
        client.logger.debug(`pokemonId = ${pokemonId}`);

        if (!pokemonId) {
            return await interaction.reply({
                content: `You must specify a Pokémon to list templates for`,
                flags: MessageFlags.Ephemeral,
            });
        }

        // Create the Boss search object
        const masterPokemonSearchObj: MasterPokemonConditions = {
            pokemonId: pokemonId,
        };

        const masterPokemonArray = await MasterPokemon.get(masterPokemonSearchObj);
        const firstMasterPokemon = masterPokemonArray[0];

        if (!firstMasterPokemon) {
            return await interaction.reply({
                content: `No Master Pokémon found for ID: ${pokemonId}`,
                flags: MessageFlags.Ephemeral,
            });
        }

        const pokemonName = await Translation.getPokemonName(firstMasterPokemon.pokedexId);
        const description = await Translation.getPokemonDescription(firstMasterPokemon.pokedexId);

        const pogoHubLink = await PogoHubLink.getUnique(firstMasterPokemon);
        const wikiLink = await WikiLink.getUnique(firstMasterPokemon);

        let link = null;
        let thumbnail = null;

        if (wikiLink) {
            link = wikiLink.page;
            thumbnail = wikiLink.image;
        }

        if (pogoHubLink) {
            link = pogoHubLink.page;
        }

        //client.logger.debug(`Master Pokémon Array =`);
        //client.logger.dump(masterPokemonArray);

        let templateIdFieldArray = [];
        let templateIdArray = [];
        let templateIdArrayChars = 0;

        for (const masterPokemon of masterPokemonArray) {
            let templateId = masterPokemon.templateId;

            if (templateIdArrayChars + templateId.length > FieldValueMaxSize) {
                templateIdFieldArray.push({
                    name: `Templates`,
                    value: templateIdArray.join('\n'),
                });

                templateIdArray = [];
                templateIdArrayChars = 0;
            }

            templateIdArray.push(templateId);
            templateIdArrayChars += templateId.length + 1;
        }

        templateIdFieldArray.push({
            name: 'Templates',
            value: templateIdArray.join('\n'),
        });

        let embed = new EmbedBuilder()
            .setTitle(pokemonName)
            .setURL(link)
            .setDescription(description)
            .setThumbnail(thumbnail)
            .addFields(templateIdFieldArray);

        return await interaction.reply({
            embeds: [embed],
        });
    },

    async autocompleteList(interaction: AutocompleteInteraction) {
        const client = interaction.client as Client;

        const focusedOption = interaction.options.getFocused(true);
        client.logger.debug(
            `Initiating autocomplete for boss -- ${this.data.name} :: ${focusedOption.name} :: ${focusedOption.value}`
        );

        let choices: string[] = [];
        const pokemonId = interaction.options.getString('pokemon');
        client.logger.debug(`pokemonId = ${pokemonId}`);

        // Create the Boss search object
        const masterPokemonSearchObj: MasterPokemonConditions = {};

        if (focusedOption.name != 'pokemon' && pokemonId != null) {
            masterPokemonSearchObj.pokemonId = pokemonId;
        }

        switch (focusedOption.name) {
            case 'pokemon':
                choices = await MasterPokemon.getPokemonIdChoices(
                    focusedOption.value,
                    masterPokemonSearchObj
                );
                break;
        }

        if (choices.length <= MaxAutoCompleteChoices) {
            await interaction.respond(choices.map((choice) => ({ name: choice, value: choice })));
        } else {
            await interaction.respond([]);
        }
    },
};

export default MasterPokemonCmd;
