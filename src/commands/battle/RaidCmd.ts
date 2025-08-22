import {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	MessageFlags,
	InteractionContextType,
	SlashCommandBuilder
} from 'discord.js';

import { NonUniqueResultError } from '@drossjs/dross-database';

import Client from '#src/Client.js';

import {
	BattleStatus,
	BossType,
	MaxAutoCompleteChoices
} from '#src/Constants.js';

import type {
	BossConditions,
	BattleData
} from '#src/types/ModelTypes.js';

import Boss    from '#src/models/Boss.js';
import Battle  from '#src/models/Battle.js';
import Trainer from '#src/models/Trainer.js';

import BattlePlanningButtons from '#src/components/buttons/BattlePlanningButtons.js';

// TODO - Set server timezone and time or something
// TODO - Add guild settings
// TODO - Add option to ping a role when posting a wraid
// TODO - Replace pokemonId with pokemonName in all commands

const RaidCmd = {
	global: true,
	data: new SlashCommandBuilder()
		.setName('raid')
		.setDescription('Host a raid battle')
		.setContexts(InteractionContextType.Guild) // TODO - Figure out how to and this with InteractionContextType.PrivateChannel
		.addStringOption(option => option
			.setName('pokemon')
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
		.addBooleanOption(option => option
			.setName('mega')
			.setDescription('Mega Raid')
			.setRequired(false)
		)
		.addBooleanOption(option => option
			.setName('shadow')
			.setDescription('Shadow Raid')
			.setRequired(false)
		),

	async execute(interaction: ChatInputCommandInteraction) {
        const client = interaction.client as Client;
		if (!interaction.guild) {
			throw new Error('interaction.guild is undefined');
		}

		const guildId = interaction.guild.id;
		const trainer = await Trainer.getUnique({ discordId: interaction.user.id });

        if (!trainer || !trainer.trainerName || !trainer.code) {
        	interaction.reply(Trainer.getSetupTrainerFirstMessage(trainer));
            return;
        }

        // Create the Boss search object
        const pokemonId = interaction.options.getString('pokemon');
        const form      = interaction.options.getString('form');
        const isMega    = interaction.options.getBoolean('mega');
        const isShadow  = interaction.options.getBoolean('shadow');

		if (!pokemonId) {
			throw new Error('Required option pokemon does not have a value');
		}

        const bossSearchObj: BossConditions = {
			bossType: BossType.Raid,
			pokemonId: pokemonId,
			isActive: true
		};

		if (form != null) {
			bossSearchObj.form = form;
		}

		if (isMega != null) {
			bossSearchObj.isMega = isMega;
		}

		if (isShadow != null) {
			bossSearchObj.isShadow = isShadow;
		}

        client.logger.debug('Boss Search Object =');
		client.logger.dump(bossSearchObj);

		let boss: Boss | null;

		try {
			boss = await Boss.getUnique(bossSearchObj);

			if (!boss) {
				return await interaction.reply({
					content: `Active raid boss not found with those options, please try again`,
					flags: MessageFlags.Ephemeral
				})
			}
		} catch (error) {
			if (error instanceof NonUniqueResultError) {
				return await interaction.reply({
					content: `Multiple active raid bosses found with those options, please try again`,
					flags: MessageFlags.Ephemeral
				})
			} else throw error;
		}

        client.logger.debug('Boss Record =');
		client.logger.dump(boss);

		const battleObj: BattleData = {
			bossId: boss.id,
			hostDiscordId: interaction.user.id,
			guildId: guildId,
			status: BattleStatus.Planning
		}
		const battle = new Battle(battleObj);
		await battle.create();

        client.logger.debug('Battle Record =');
		client.logger.dump(battle);

		const battleEmbed = await battle.buildEmbed();
		const battlePlanningButtons = BattlePlanningButtons.build(); 

		await interaction.reply({
            embeds: [battleEmbed],
			components: [battlePlanningButtons]
		});
		let replyMessage = await interaction.fetchReply();

		client.logger.debug(`Reply Message =`);
		client.logger.dump(replyMessage);
		client.logger.debug(`replyMessage.id = ${replyMessage.id}`);

		battle.messageId = replyMessage.id;
		return await battle.update();
	},

	async autocomplete(interaction: AutocompleteInteraction) {
        const client = interaction.client as Client;
		const focusedOption = interaction.options.getFocused(true);
		client.logger.debug(`Initiating autocomplete for ${this.data.name} :: ${focusedOption.name} :: ${focusedOption.value}`);

        const pokemonId  = interaction.options.getString('pokemon');
        const form       = interaction.options.getString('form');
        const isMega     = interaction.options.getBoolean('mega');
        const isShadow   = interaction.options.getBoolean('shadow');

        client.logger.debug(`pokemonId  = ${pokemonId}`);
        client.logger.debug(`form       = ${form}`);
        client.logger.debug(`isMega     = ${isMega}`);
        client.logger.debug(`isShadow   = ${isShadow}`);

        // Create the Boss search object
        const bossSearchObj: BossConditions = {
			bossType: BossType.Raid,
			isActive: true
		};

        if ( (focusedOption.name != 'pokemon') && (pokemonId != null) ) {
            bossSearchObj.pokemonId = pokemonId;
        }

        if ( (focusedOption.name != 'form') && (form != null) ) {
            bossSearchObj.form = form;
        }

        if (isMega != null) {
            bossSearchObj.isMega = isMega;
        }

        if (isShadow != null) {
            bossSearchObj.isShadow = isShadow;
        }
		
        client.logger.debug('Boss Search Object =');
		client.logger.dump(bossSearchObj);

        let choices: string[] = [];
		switch (focusedOption.name) {
			case 'pokemon':
				choices = await Boss.getPokemonIdChoices(focusedOption.value, bossSearchObj);
				break;
			case 'form':
				choices = await Boss.getFormChoices(focusedOption.value, bossSearchObj);
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

export default RaidCmd;