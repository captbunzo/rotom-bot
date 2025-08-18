import {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	MessageFlags,
	InteractionContextType,
	SlashCommandBuilder
} from 'discord.js';

import Client from '#src/Client.js';

import {
	BattleStatus,
	BossType,
	MaxAutoCompleteChoices
} from '#src/Constants.js';

import Boss    from '#src/models/Boss.js';
import Battle  from '#src/models/Battle.js';
import Trainer from '#src/models/Trainer.js';

import BattlePlanningButtons from '#src/buttons/BattlePlanningButtons.js';

// TODO - Set server timezone and time or something
// TODO - Add guild settings
// TODO - Add option to ping a role when posting a wraid
// TODO - Replace pokemonId with pokemonName in all commands

const DynamaxCmd = {
	global: true,
	data: new SlashCommandBuilder()
		.setName('dynamax')
		.setDescription('Host a dynamax battle')
		.setContexts(InteractionContextType.Guild) // TODO - Figure out how to and this with InteractionContextType.PrivateChannel
		.addStringOption(option => option
			.setName('pokemon')
			.setDescription('Pokémon Name')
			.setRequired(true)
			.setAutocomplete(true)
		),
	
	async execute(interaction: ChatInputCommandInteraction) {
        const client    = interaction.client as Client;
		const guildId   = interaction.guild.id;
		const trainerId = interaction.user.id;
		const trainer   = await Trainer.getUnique({ id: trainerId });

        if (!trainer) {
        	interaction.reply(Trainer.getSetupTrainerFirstMessage());
            return;
        }

        // Create the Boss search object
        const pokemonId = interaction.options.getString('pokemon');

        const bossSearchObj = {
			bossType: BossType.Dynamax,
			pokemonId: pokemonId,
			isActive: true
		};

        client.logger.debug('Boss Search Object =');
		client.logger.dump(bossSearchObj);

		const bosses = await Boss.get(bossSearchObj);
		if (bosses.length == 0) {
			await interaction.reply({
				content: `Active dynamax boss not found with those options, please try again`,
				flags: MessageFlags.Ephemeral
			})
			return;
		} else if (bosses.length > 1) {
			await interaction.reply({
				content: `Multiple active dynamax bosses found with those options, please try again`,
				flags: MessageFlags.Ephemeral
			})
			return;
		}

		const boss = bosses[0];
        client.logger.debug('Boss Record =');
		client.logger.dump(boss);

		const battleObj = {
			bossId: boss.id,
			hostTrainerId: trainerId,
			guildId: guildId,
			status: BattleStatus.Planning
		}
		const battle = new Battle(battleObj);
		await battle.create();

        client.logger.debug('Battle Record =');
		client.logger.dump(battle);

		const battleEmbed = await battle.buildEmbed();
		const battlePlanningButtons = await BattlePlanningButtons.build(interaction); 

		await interaction.reply({
            embeds: [battleEmbed],
			components: [battlePlanningButtons]
		});
		let replyMessage = await interaction.fetchReply();

		client.logger.debug(`Reply Message =`);
		client.logger.dump(replyMessage);
		client.logger.debug(`replyMessage.id = ${replyMessage.id}`);

		battle.messageId = replyMessage.id;
		await battle.update();
	},

	async autocomplete(interaction: AutocompleteInteraction) {
        const client = interaction.client as Client;
		const focusedOption = interaction.options.getFocused(true);
		client.logger.debug(`Initiating autocomplete for ${this.data.name} :: ${focusedOption.name} :: ${focusedOption.value}`);

        const pokemonId  = interaction.options.getString('pokemon');
        client.logger.debug(`pokemonId  = ${pokemonId}`);

        // Create the Boss search object
        const bossSearchObj = {
			bossType: BossType.Dynamax,
			isActive: true
		};

        if ( (focusedOption.name != 'pokemon') && (pokemonId != null) ) {
            bossSearchObj.pokemonId = pokemonId;
        }

        client.logger.debug('Boss Search Object =');
		client.logger.dump(bossSearchObj);

        let choices: string[] = [];
		switch (focusedOption.name) {
			case 'pokemon':
				choices = await Boss.getPokemonIdChoices(focusedOption.value, bossSearchObj);
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

export default DynamaxCmd;