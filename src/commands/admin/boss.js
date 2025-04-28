
import {
    MessageFlags,
    SlashCommandBuilder
} from 'discord.js';

import { BossType, MaxAutoCompleteChoices } from '../../Constants.js';

import Boss          from '../../data/Boss.js';
import MasterPokemon from '../../data/MasterPokemon.js';

const boss = {
    global: false,
    data: new SlashCommandBuilder()
        .setName('boss')
        .setDescription('Manage Pokémom boss data')
        .addSubcommand(subCommand =>
            subCommand
                .setName('load')
                .setDescription('Load Boss Pokémom data')
                .addStringOption(option =>
                    option
                        .setName('pokemon')
                        .setDescription('Pokémom Name')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addStringOption(option =>
                    option
                        .setName('template')
                        .setDescription('Master Pokémom Template')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addStringOption(option =>
                    option
                        .setName('boss_type')
                        .setDescription('Boss Type')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Raid', value: BossType.Raid },
                            { name: 'Dynamax', value: BossType.Dynamax },
                            { name: 'Gigantamax', value: BossType.Gigantamax }
                        )
                )
                .addBooleanOption(option =>
                    option
                        .setName('mega')
                        .setDescription('Mega Boss')
                        .setRequired(false)
                )
                .addBooleanOption(option =>
                    option
                        .setName('shadow')
                        .setDescription('Mega Boss')
                        .setRequired(false)
                )
        ),
    
    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'load' : this.executeLoad(interaction); break;
            default :
                await interaction.reply({ content: `Boss management command execution not yet implemented for subcommand -- ${subCommand}`, flags: MessageFlags.Ephemeral }); 
        }
    },

    async autocomplete(interaction) {
        const client  = interaction.client;
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'load' : this.autocompleteLoad(interaction); break;
            default :
                client.logger.error(`Boss management command autocomplete not yet implemented for subcommand -- ${subCommand}`);
        }
    },

    /**********************/
    /* Subcommand :: Load */
    /**********************/

    async executeLoad(interaction) {
        const client = interaction.client;
        const table  = 'boss';

        const pokemonId  = interaction.options.getString('pokemon');
        const templateId = interaction.options.getString('template');
        const bossType   = interaction.options.getString('boss_type');
        const isMega     = interaction.options.getBoolean('mega') ?? false;
        const isShadow   = interaction.options.getBoolean('shadow') ?? false;

        client.logger.debug(`pokemonId  = ${pokemonId}`);
        client.logger.debug(`templateId = ${templateId}`);
        client.logger.debug(`bossType   = ${bossType}`);
        client.logger.debug(`isMega     = ${isMega}`);
        client.logger.debug(`isShadow   = ${isShadow}`);

        // Get the Pokemon Master record
        const masterPokemonRec = await MasterPokemon.get({templateId: templateId, unique: true});
        client.logger.debug('Master Pokémom Record');
        client.logger.dump(masterPokemonRec);

        // Derive the Boss ID
        let id = `${bossType.toUpperCase()}_${pokemonId.toUpperCase()}`;
        
        if (masterPokemonRec.form != null) {
            id += `_${masterPokemonRec.form.toUpperCase()}`;
        }

        if (isMega) {
            id += '_MEGA';
        }

        if (isShadow) {
            id += '_SHADOW';
        }

        // Create the Boss object
        const bossObj = {
            id: id,
            bossType: bossType.toUpperCase(),
            pokemonId: pokemonId.toUpperCase(),
            form: masterPokemonRec.form,
            isMega: isMega,
            isShadow: isShadow,
            isActive: false,
            templateId: templateId.toUpperCase()
        }

        client.logger.debug('Boss Object');
        client.logger.dump(bossObj);

        let bossRec = await Boss.get({ id: bossObj.id, unique: true });

        if (!bossRec) {
            bossRec = new Boss(bossObj);
            await bossRec.create();
        } else {
            bossRec.id         = bossObj.id;
            bossRec.bossType   = bossObj.bossType;
            bossRec.pokemonId  = bossObj.pokemonId;
            bossRec.form       = bossObj.form;
            bossRec.isMega     = bossObj.isMega;
            bossRec.isShadow   = bossObj.isShadow;
            bossRec.isActive   = bossObj.isActive;
            bossRec.templateId = bossObj.templateId;
            await bossRec.update();
        }

        await interaction.reply({ content: `Boss load not yet implemented`, flags: MessageFlags.Ephemeral });
    },

    async autocompleteLoad(interaction) {
        const client = interaction.client;
        const focusedOption = interaction.options.getFocused(true);
        client.logger.debug(`Initiating autocomplete for boss -- ${this.data.name} :: ${focusedOption.name} :: ${focusedOption.value}`);

        let choices = [];
        let pokemonId;
        let templateId;

        switch (focusedOption.name) {
            case 'pokemon':
                //choices = await MasterPokemon.getPokemonChoices(focusedOption.value);
                choices = await MasterPokemon.getPokemonIdChoices(focusedOption.value);
                break;
            case 'template':
                pokemonId = interaction.options.getString('pokemon');
                choices = await MasterPokemon.getTemplateIdChoices(focusedOption.value, { pokemonId: pokemonId });
                break;
            case 'form':
                pokemonId  = interaction.options.getString('pokemon');
                templateId = interaction.options.getString('template');
                choices = await MasterPokemon.getFormChoices(focusedOption.value, { pokemonId: pokemonId, templateId: templateId });
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

export default boss;
