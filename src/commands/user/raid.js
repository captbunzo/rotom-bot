
import {
	MessageFlags,
	InteractionContextType,
	SlashCommandBuilder
} from 'discord.js';

import { MaxAutoCompleteChoices } from '../../Constants.js';
import MasterPokemon from '../../data/MasterPokemon.js';

const raid = {
	global: true,
	data: new SlashCommandBuilder()
		.setName('raid')
		.setDescription('Do raid stuff')
		.setContexts(InteractionContextType.Guild) // TODO - Figure out how to and this with InteractionContextType.PrivateChannel
		.addStringOption(option =>
			option
				.setName('pokemon')
				.setDescription('Pokémom Name')
				.setRequired(true)
				.setAutocomplete(true)
		)
		.addStringOption(option =>
			option
				.setName('form')
				.setDescription('Pokémom Form')
				.setRequired(false)
				.setAutocomplete(true)
		)
		.addBooleanOption(option =>
			option
				.setName('mega')
				.setDescription('Mega Raid')
				.setRequired(false)
		),
	
	async execute(interaction) {
        const client  = interaction.client;

		await interaction.reply({
			content: 'Raid stuff not yet implemented',
			flags: MessageFlags.Ephemeral
		});
	},

	async autocomplete(interaction) {
        const client  = interaction.client;

		const focusedOption = interaction.options.getFocused(true);
		client.logger.debug(`Initiating autocomplete for ${this.data.name} :: ${focusedOption.name} :: ${focusedOption.value}`);

		let choices = [];
		switch (focusedOption.name) {
			case 'pokemon':
				choices = await MasterPokemon.getPokemonIdChoices(focusedOption.value);
				break;
			case 'form':
				const pokemonId = interaction.options.getString('pokemon');
				choices = await MasterPokemon.getFormChoices(focusedOption.value, { pokemonId: pokemonId });
				break;
		}

		// TODO - Delete this later when we decide if we ever need to reference this way of doing things again
		//const filtered = choices.filter(choice => choice.startsWith(focusedOption.value));

		if (choices.length <= MaxAutoCompleteChoices) {
			await interaction.respond(
				choices.map(choice => ({ name: choice, value: choice })),
			);
		} else {
			await interaction.respond([]);
		}
	}
};

export default raid;
