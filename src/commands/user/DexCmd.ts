import {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	MessageFlags,
	SlashCommandBuilder
} from 'discord.js';

import Client from '#src/Client.js';
import MasterPokemon from '#src/models/MasterPokemon.js';
import { MaxAutoCompleteChoices } from '#src/Constants.js';

const DexType = {
    main: 'Main',
    shiny: 'Shiny',
    lucky: 'Lucky',
    xxl: 'XXL',
    xxs: 'XXS',
    gigantamax: 'Gigantamax',
    mega: 'Mega',
    shadow: 'Shadow',
    purified: 'Purified',
    hundo: 'Hundo'
}

const DexCmd = {
	global: true,
	data: new SlashCommandBuilder()
		.setName('dex')
		.setDescription('Manage your Pokédex')
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
		),

	async execute(interaction: ChatInputCommandInteraction) {
		const subCommand = interaction.options.getSubcommand();

		switch (subCommand) {
			default :
				await interaction.reply({ content: `Pokédex management not yet implemented -- ${subCommand}`, flags: MessageFlags.Ephemeral });
		}
	},

    async autocomplete(interaction: AutocompleteInteraction) {
        const client = interaction.client as Client;
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'need' : this.autocompleteNeed(interaction, subCommand); break;
            default :
                client.logger.error(`Pokédex command autocomplete not yet implemented for subcommand -- ${subCommand}`);
        }
    },

    async autocompleteNeed(interaction: AutocompleteInteraction, _subcommand: string) {
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

export default DexCmd;
