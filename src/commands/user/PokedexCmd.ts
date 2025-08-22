import {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	MessageFlags,
	SlashCommandBuilder
} from 'discord.js';

import Client from '#src/Client.js';

import { MaxAutoCompleteChoices } from '#src/Constants.js';
import MasterPokemon from '#src/models/MasterPokemon.js';
import PokedexRegister from '#src/components/compound/PokedexRegisteryComponent.js';

const PokedexCmd = {
	global: true,
	data: new SlashCommandBuilder()
		.setName('pokedex')
		.setDescription('Manage your Pokédex')
        .addSubcommand(subCommand => subCommand
            .setName('register')
            .setDescription('View and update your Pokédex')
            .addStringOption(option => option
                .setName('pokémon-name')
                .setDescription('Pokémon Name')
                .setRequired(false)
                .setAutocomplete(true)
            )
            .addIntegerOption(option => option
                .setName('pokédex-id')
                .setDescription('Pokédex ID')
                .setRequired(false)
            )
        )
        /*
		.addSubcommand(subCommand => subCommand
			.setName('need')
			.setDescription('Setup your Pokédex')
            .addStringOption(option => option
                .setName('name')
                .setDescription('Pokémon Name')
                .setRequired(true)
                .setAutocomplete(true)
            )
            .addStringOption(option => option
                .setName('type')
                .setDescription('Pokédex type')
                .setRequired(true)
                .addChoices(
                    { name: DexType.main, value: `${DexType.main}` },
                    { name: DexType.shiny, value: `${DexType.shiny}` },
                    { name: DexType.lucky, value: `${DexType.lucky}` },
                    { name: DexType.xxl, value: `${DexType.xxl}` },
                    { name: DexType.xxs, value: `${DexType.xxs}` },
                    { name: DexType.gigantamax, value: `${DexType.gigantamax}` },
                    { name: DexType.mega, value: `${DexType.mega}` },
                    { name: DexType.shadow, value: `${DexType.shadow}` },
                    { name: DexType.purified, value: `${DexType.purified}` },
                    { name: DexType.hundo, value: `${DexType.hundo}` }
                )
            )
		)*/,

	async execute(interaction: ChatInputCommandInteraction) {
		const subCommand = interaction.options.getSubcommand();

		switch (subCommand) {
            case 'register' : this.executeRegister(interaction); break;
            case 'need'     : this.executeNeed(interaction); break;
			default :
				await interaction.reply({ content: `Pokédex management not yet implemented -- ${subCommand}`, flags: MessageFlags.Ephemeral });
		}
	},

    async autocomplete(interaction: AutocompleteInteraction) {
        const client = interaction.client as Client;
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'register' : this.autocompleteRegister(interaction); break;
            case 'need'     : this.autocompleteNeed(interaction); break;
            default :
                client.logger.error(`Pokédex command autocomplete not yet implemented for subcommand -- ${subCommand}`);
        }
    },

    /**************************
     * Subcommand :: Register *
     **************************/

    async executeRegister(interaction: ChatInputCommandInteraction) {
        const pokemonName = interaction.options.getString('pokémon-name');
        let   pokedexId   = interaction.options.getInteger('pokédex-id');

        if (pokemonName && pokedexId) {
            return await interaction.reply({
                content: 'Please provide either Pokémon Name or Pokédex ID',
                flags: MessageFlags.Ephemeral
            });
        }

        let masterPokemon: MasterPokemon | null;

        if (pokemonName) {
            masterPokemon = await MasterPokemon.getUnique({ pokemonId: pokemonName, form: null });
            if (!masterPokemon) {
                return await interaction.reply({
                    content: `Pokémon not found with name ${pokemonName}`,
                    flags: MessageFlags.Ephemeral
                });
            }
        } else {
            if (!pokedexId) {
                pokedexId = 1;
            }

            masterPokemon = await MasterPokemon.getUnique({ pokedexId: pokedexId, form: null });
            if (!masterPokemon) {
                return await interaction.reply({
                    content: `Pokémon not found with Pokédex ID #${pokedexId}`,
                    flags: MessageFlags.Ephemeral
                });
            }
        }

        // Get the client and buttons and show the register interface
		return await PokedexRegister.show(interaction, masterPokemon);
    },

    async autocompleteRegister(interaction: AutocompleteInteraction) {
        const client = interaction.client as Client;

        const focusedOption = interaction.options.getFocused(true);
        client.logger.debug(`Initiating autocomplete for ${this.data.name} :: ${focusedOption.name} :: ${focusedOption.value}`);

        let choices: string[] = [];
        switch (focusedOption.name) {
            case 'pokémon-name':
                choices = await MasterPokemon.getPokemonIdChoices(focusedOption.value);
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

    /**********************
     * Subcommand :: Need *
     **********************/

    async executeNeed(interaction: ChatInputCommandInteraction) {
        await interaction.reply({ content: 'Pokédex need subcommand not yet implemented', flags: MessageFlags.Ephemeral });
    },

    async autocompleteNeed(interaction: AutocompleteInteraction) {
        const client = interaction.client as Client;

        const focusedOption = interaction.options.getFocused(true);
        client.logger.debug(`Initiating autocomplete for ${this.data.name} :: ${focusedOption.name} :: ${focusedOption.value}`);

        let choices: string[] = [];
        switch (focusedOption.name) {
            case 'name':
                choices = await MasterPokemon.getPokemonIdChoices(focusedOption.value);
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
};

export default PokedexCmd;