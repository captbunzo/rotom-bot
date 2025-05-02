
import {
    MessageFlags,
    SlashCommandBuilder
 } from 'discord.js';

import {
    MaxAutoCompleteChoices
} from '../../Constants.js';

import MasterCPM     from '../../data/MasterCPM.js';
import MasterPokemon from '../../data/MasterPokemon.js';

const PokemonCmd = {
    global: true,
	data: new SlashCommandBuilder()
		.setName('pokemon')
		.setDescription('Do Pokémon stuff')
        .addStringOption(option =>
            option
                .setName('name')
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
        .addIntegerOption(option =>
            option
                .setName('attack')
                .setDescription('Attack IV')
                .setMinValue(1)
                .setMaxValue(15)
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option
                .setName('defense')
                .setDescription('Defense IV')
                .setMinValue(1)
                .setMaxValue(15)
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option
                .setName('stamina')
                .setDescription('Stamina IV')
                .setMinValue(1)
                .setMaxValue(15)
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option
                .setName('level')
                .setDescription('Level')
                .setMinValue(1)
                .setMaxValue(50)
                .setRequired(false)
        ),
    
	async execute(interaction) {
        const client  = interaction.client;

        const name    = interaction.options.getString('name');
        const form    = interaction.options.getString('form');
        let   attack  = interaction.options.getInteger('attack');
        let   defense = interaction.options.getInteger('defense');
        let   stamina = interaction.options.getInteger('stamina');
        let   level   = interaction.options.getInteger('level');
        
        if (form == null) {
            await interaction.reply({
                content: `Name: ${name}`,
                flags: MessageFlags.Ephemeral
            });
        } else {
            await interaction.reply({
                content: `Name: ${name}, Form: ${form}`,
                flags: MessageFlags.Ephemeral
            });
        }

        const nameSearchValue = name.toUpperCase();
        const formSearchValue = form ? form.toUpperCase() : null;
        const masterPokemonRecs = await MasterPokemon.get({ pokemonId: nameSearchValue, form: formSearchValue });
        let masterPokemonRec = null;

        if (masterPokemonRecs.length > 1) {
            await interaction.followUp({
                content: `Multiple Pokemon found for name = ${nameSearchValue}, form = ${formSearchValue}`,
                flags: MessageFlags.Ephemeral
            });

            for (let x = 0; x < masterPokemonRecs.length; x++) {
                masterPokemonRec = masterPokemonRecs[x];
                await interaction.followUp({
                    content: `Pokemon: ${masterPokemonRec.pokemonId}, Form: ${masterPokemonRec.form}, Type: ${masterPokemonRec.type}, Type2: ${masterPokemonRec.type2}`,
                    flags: MessageFlags.Ephemeral
                });
            }

            return
        }

        masterPokemonRec = masterPokemonRecs[0];
        client.logger.debug('Master Pokémon Object');
        client.logger.dump(masterPokemonRec);
        
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

        if (level != null) {
            const cp = await MasterCPM.getCombatPower(masterPokemonRec, attack, defense, stamina, level);

            client.logger.debug(`IVs: ${attack} / ${defense} / ${stamina}`);
            client.logger.debug(`CP Level ${level}: ${cp}`);

            await interaction.followUp({
                content: `IVs: ${attack} / ${defense} / ${stamina}\n`
                       + `CP Level ${level}: ${cp}`,
                flags: MessageFlags.Ephemeral
            });

        } else {
            const cpLevel15 = await MasterCPM.getCombatPower(masterPokemonRec, attack, defense, stamina, 15);
            const cpLevel20 = await MasterCPM.getCombatPower(masterPokemonRec, attack, defense, stamina, 20);
            const cpLevel25 = await MasterCPM.getCombatPower(masterPokemonRec, attack, defense, stamina, 25);
            const cpLevel50 = await MasterCPM.getCombatPower(masterPokemonRec, attack, defense, stamina, 50);

            client.logger.debug(`IVs: ${attack} / ${defense} / ${stamina}`);
            client.logger.debug(`CP Level 15: ${cpLevel15}`);
            client.logger.debug(`CP Level 20: ${cpLevel20}`);
            client.logger.debug(`CP Level 25: ${cpLevel25}`);
            client.logger.debug(`CP Level 50: ${cpLevel50}`);

            await interaction.followUp({
                content: `IVs: ${attack} / ${defense} / ${stamina}\n`
                    + `CP Level 15: ${cpLevel15}\n`
                    + `CP Level 20: ${cpLevel20}\n`
                    + `CP Level 25: ${cpLevel25}\n`
                    + `CP Level 50: ${cpLevel50}`,
                flags: MessageFlags.Ephemeral
            });
        }
	},

    async autocomplete(interaction) {
        const client  = interaction.client;

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
    }
};

export default PokemonCmd;
