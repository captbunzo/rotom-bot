
import {
	MessageFlags,
	InteractionContextType,
	SlashCommandBuilder
} from 'discord.js';

import {
	BattleStatus,
	BossType,
	MaxAutoCompleteChoices
} from '../../Constants.js';

import Boss    from '../../data/Boss.js';
import Battle  from '../../data/Battle.js';
import Trainer from '../../data/Trainer.js';

import BattlePlanningButtons from '../../buttons/BattlePlanningButtons.js';

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
		.addStringOption(option =>
			option
				.setName('pokemon')
				.setDescription('Pokémon Name')
				.setRequired(true)
				.setAutocomplete(true)
		)
		.addStringOption(option =>
			option
				.setName('form')
				.setDescription('Pokémon Form')
				.setRequired(false)
				.setAutocomplete(true)
		)
		.addBooleanOption(option =>
			option
				.setName('mega')
				.setDescription('Mega Raid')
				.setRequired(false)
		)
		.addBooleanOption(option =>
			option
				.setName('shadow')
				.setDescription('Shadow Raid')
				.setRequired(false)
		),
	
	async execute(interaction) {
        const client     = interaction.client;
		const guildId    = interaction.guild.id;
		const trainerId  = interaction.user.id;
		const trainerRec = await Trainer.get({ id: trainerId, unique: true });

        if (!trainerRec) {
        	interaction.reply(Trainer.getSetupTrainerFirstMessage());
            return;
        }

        // Create the Boss search object
        const pokemonId = interaction.options.getString('pokemon');
        const form      = interaction.options.getString('form');
        const isMega    = interaction.options.getBoolean('mega');
        const isShadow  = interaction.options.getBoolean('shadow');

        const bossSearchObj = {
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

		const bossRecArray = await Boss.get(bossSearchObj);
		if (bossRecArray.length == 0) {
			await interaction.reply({
				content: `Active raid boss not found with those options, please try again`,
				flags: MessageFlags.Ephemeral
			})
			return;
		} else if (bossRecArray.length > 1) {
			await interaction.reply({
				content: `Multiple active raid boss not found with those options, please try again`,
				flags: MessageFlags.Ephemeral
			})
			return;
		}

		const bossRec = bossRecArray[0];
        client.logger.debug('Boss Record =');
		client.logger.dump(bossRec);

		const battleObj = {
			bossId: bossRec.id,
			hostTrainerId: trainerId,
			guildId: guildId,
			status: BattleStatus.Planning
		}
		const battleRec = new Battle(battleObj);
		await battleRec.create();

        client.logger.debug('Battle Record =');
		client.logger.dump(battleRec);

		const battleEmbed   = await battleRec.buildEmbed();
		const battlePlanningButtons = await BattlePlanningButtons.build(interaction); 

		await interaction.reply({
            embeds: [battleEmbed],
			components: [battlePlanningButtons]
		});
		let replyMessage = await interaction.fetchReply();

		client.logger.debug(`Reply Message =`);
		client.logger.dump(replyMessage);
		client.logger.debug(`replyMessage.id = ${replyMessage.id}`);

		battleRec.messageId = replyMessage.id;
		await battleRec.update();
	},

	async autocomplete(interaction) {
        const client = interaction.client;
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
        const bossSearchObj = {
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

        let choices = [];
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
