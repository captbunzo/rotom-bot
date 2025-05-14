
import {
    MessageFlags,
    SlashCommandBuilder
} from 'discord.js';

import {
    BossType,
    MaxAutoCompleteChoices
} from '../../Constants.js';

import StringFunctions from '../../functions/StringFunctions.js';

import Boss          from '../../data/Boss.js';
import MasterPokemon from '../../data/MasterPokemon.js';

// TODO - Add boss edit command

const BossCmd = {
    global: false,
    data: new SlashCommandBuilder()
        .setName('boss')
        .setDescription('Manage Pokémon boss data')
        .addSubcommand(subCommand => subCommand
            .setName('load')
            .setDescription('Load Boss Pokémon data')
            .addStringOption(option => option
                .setName('pokemon')
                .setDescription('Pokémon Name')
                .setRequired(true)
                .setAutocomplete(true)
            )
            .addStringOption(option => option
                .setName('template')
                .setDescription('Master Pokémon Template')
                .setRequired(true)
                .setAutocomplete(true)
            )
            .addStringOption(option => option
                .setName('boss-type')
                .setDescription('Boss Type')
                .setRequired(true)
                .addChoices(
                    { name: 'Raid', value: BossType.Raid },
                    { name: 'Dynamax', value: BossType.Dynamax },
                    { name: 'Gigantamax', value: BossType.Gigantamax }
                )
            )
            .addIntegerOption(option => option
                .setName('tier')
                .setDescription('Boss Tier')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(7)
            )
            .addBooleanOption(option => option
                .setName('shinyable')
                .setDescription('Can be shiny?')
                .setRequired(false)
            )
            .addBooleanOption(option => option
                .setName('mega')
                .setDescription('Mega Boss')
                .setRequired(false)
            )
            .addBooleanOption(option => option
                .setName('shadow')
                .setDescription('Mega Boss')
                .setRequired(false)
            )
            .addBooleanOption(option => option
                .setName('active')
                .setDescription('Boss is Active')
                .setRequired(false)
            )
        )
        .addSubcommand(subCommand => subCommand
            .setName('list')
            .setDescription('Show Boss Pokémon data')
            .addStringOption(option => option
                .setName('pokemon')
                .setDescription('Pokémon Name')
                .setRequired(false)
                .setAutocomplete(true)
            )
            .addStringOption(option => option
                .setName('form')
                .setDescription('Pokémon Form')
                .setRequired(false)
                .setAutocomplete(true)
            )
            .addStringOption(option => option
                .setName('boss-type')
                .setDescription('Boss Type')
                .setRequired(false)
                .addChoices(
                    { name: 'Raid', value: BossType.Raid },
                    { name: 'Dynamax', value: BossType.Dynamax },
                    { name: 'Gigantamax', value: BossType.Gigantamax }
                )
            )
            .addIntegerOption(option => option
                .setName('tier')
                .setDescription('Boss Tier')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(7)
            )
            .addBooleanOption(option => option
                .setName('shinyable')
                .setDescription('Can be shiny?')
                .setRequired(false)
            )
            .addBooleanOption(option => option
                .setName('mega')
                .setDescription('Mega Boss')
                .setRequired(false)
            )
            .addBooleanOption(option => option
                .setName('shadow')
                .setDescription('Mega Boss')
                .setRequired(false)
            )
            .addBooleanOption(option => option
                .setName('active')
                .setDescription('Boss is Active')
                .setRequired(false)
            )
        )
        .addSubcommand(subCommand => subCommand
            .setName('enable')
            .setDescription('Enable a Boss Pokémon')
            .addStringOption(option => option
                .setName('pokemon')
                .setDescription('Pokémon Name')
                .setRequired(false)
                .setAutocomplete(true)
            )
            .addStringOption(option => option
                .setName('form')
                .setDescription('Pokémon Form')
                .setRequired(false)
                .setAutocomplete(true)
            )
            .addStringOption(option => option
                .setName('boss-type')
                .setDescription('Boss Type')
                .setRequired(false)
                .addChoices(
                    { name: 'Raid', value: BossType.Raid },
                    { name: 'Dynamax', value: BossType.Dynamax },
                    { name: 'Gigantamax', value: BossType.Gigantamax }
                )
            )
            .addBooleanOption(option => option
                .setName('mega')
                .setDescription('Mega Boss')
                .setRequired(false)
            )
            .addBooleanOption(option => option
                .setName('shadow')
                .setDescription('Mega Boss')
                .setRequired(false)
            )
        )
        .addSubcommand(subCommand => subCommand
            .setName('disable')
            .setDescription('Disable a Boss Pokémon')
            .addStringOption(option => option
                .setName('pokemon')
                .setDescription('Pokémon Name')
                .setRequired(false)
                .setAutocomplete(true)
            )
            .addStringOption(option => option
                .setName('form')
                .setDescription('Pokémon Form')
                .setRequired(false)
                .setAutocomplete(true)
            )
            .addStringOption(option => option
                .setName('boss-type')
                .setDescription('Boss Type')
                .setRequired(false)
                .addChoices(
                    { name: 'Raid', value: BossType.Raid },
                    { name: 'Dynamax', value: BossType.Dynamax },
                    { name: 'Gigantamax', value: BossType.Gigantamax }
                )
            )
            .addBooleanOption(option => option
                .setName('mega')
                .setDescription('Mega Boss')
                .setRequired(false)
            )
            .addBooleanOption(option => option
                .setName('shadow')
                .setDescription('Mega Boss')
                .setRequired(false)
            )
        ),
    
    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'load'    : this.executeLoad(interaction); break;
            case 'list'    : this.executeList(interaction); break;
            case 'enable'  : this.executeToggleActive(interaction, true); break;
            case 'disable' : this.executeToggleActive(interaction, false); break;
            default :
                await interaction.reply({ content: `Boss management command execution not yet implemented for subcommand -- ${subCommand}`, flags: MessageFlags.Ephemeral }); 
        }
    },

    async autocomplete(interaction) {
        const client  = interaction.client;
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'load'    : this.autocompleteLoad(interaction); break;
            case 'list'    : this.autocompleteSearch(interaction); break;
            case 'enable'  : this.autocompleteSearch(interaction); break;
            case 'disable' : this.autocompleteSearch(interaction); break;
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

        const pokemonId   = interaction.options.getString('pokemon');
        const templateId  = interaction.options.getString('template');
        const bossType    = interaction.options.getString('boss-type');
        const tier        = interaction.options.getInteger('tier'); // Todo -- Add in validation of tiers (1, 3, 5, ?)
        const isMega      = interaction.options.getBoolean('mega') ?? false;
        const isShadow    = interaction.options.getBoolean('shadow') ?? false;
        const isShinyable = interaction.options.getBoolean('shinyable') ?? false;
        const isActive    = interaction.options.getBoolean('active') ?? true;

        client.logger.debug(`pokemonId   = ${pokemonId}`);
        client.logger.debug(`templateId  = ${templateId}`);
        client.logger.debug(`bossType    = ${bossType}`);
        client.logger.debug(`tier        = ${tier}`);
        client.logger.debug(`isMega      = ${isMega}`);
        client.logger.debug(`isShadow    = ${isShadow}`);
        client.logger.debug(`isShinyable = ${isShinyable}`);
        client.logger.debug(`isActive    = ${isActive}`);

        // Get the Pokemon Master record
        const masterPokemon = await MasterPokemon.get({templateId: templateId, unique: true});
        client.logger.debug('Master Pokémon Record');
        client.logger.dump(masterPokemon);

        // Derive the Boss ID
        let id = `${bossType.toUpperCase()}_${pokemonId.toUpperCase()}`;
        
        if (masterPokemon.form != null) {
            id += `_${masterPokemon.form.toUpperCase()}`;
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
            form: masterPokemon.form,
            tier: tier,
            isMega: isMega,
            isShadow: isShadow,
            isShinyable: isShinyable,
            isActive: isActive,
            templateId: templateId.toUpperCase()
        }

        client.logger.debug('Boss Object');
        client.logger.dump(bossObj);

        let boss = await Boss.get({ id: bossObj.id, unique: true });

        if (!boss) {
            boss = new Boss(bossObj);
            await boss.create();
        } else {
            boss.id          = bossObj.id;
            boss.bossType    = bossObj.bossType;
            boss.pokemonId   = bossObj.pokemonId;
            boss.form        = bossObj.form;
            boss.tier        = bossObj.tier;
            boss.isMega      = bossObj.isMega;
            boss.isShadow    = bossObj.isShadow;
            boss.isShinyable = bossObj.isShinyable;
            boss.isActive    = bossObj.isActive;
            boss.templateId  = bossObj.templateId;
            await boss.update();
        }

        const bossEmbed = await boss.buildEmbed();
        await interaction.reply({
            embeds: [bossEmbed]
        });
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

        client.logger.debug(`focusedOption.name choices =`);
        client.logger.dump(choices);

        if (choices.length <= MaxAutoCompleteChoices) {
            await interaction.respond(
                choices.map(choice => ({ name: choice, value: choice })),
            );
            return;
        }

        let prefix = StringFunctions.getPrefix(choices);
        client.logger.debug(`prefix = ${prefix}`);

        let choicesPrefixed = [];
        for (let choiceFull of choices) {
            let choice = choiceFull.slice(0, prefix.length + 1);
            
            if (choice == prefix) {
                choicesPrefixed.push(choice);
            } else {
                choicesPrefixed.push(choice + '*');
            }
        }

        client.logger.debug(`choicesPrefixed =`);
        client.logger.dump(choicesPrefixed);

        let choicesSubset = new Set(choicesPrefixed);
        client.logger.debug(`choicesPrchoicesSubsetefixed =`);
        client.logger.dump(choicesSubset);

        choices = [...choicesSubset];
        client.logger.debug(`choices =`);
        client.logger.dump(choices);

        if (choices.length <= MaxAutoCompleteChoices) {
            await interaction.respond(
                choices.map(choice => ({ name: choice, value: choice })),
            );
            return;
        }

        await interaction.respond([]);
    },

    /**********************/
    /* Subcommand :: List */
    /**********************/

    async executeList(interaction) {
        const client = interaction.client;
        const table  = 'boss';

        const pokemonId   = interaction.options.getString('pokemon');
        const form        = interaction.options.getString('form');
        const bossType    = interaction.options.getString('boss-type');
        const tier        = interaction.options.getInteger('tier');
        const isMega      = interaction.options.getBoolean('mega');
        const isShadow    = interaction.options.getBoolean('shadow');
        const isShinyable = interaction.options.getBoolean('shinyable');
        const isActive    = interaction.options.getBoolean('active');
 
        client.logger.debug(`pokemonId   = ${pokemonId}`);
        client.logger.debug(`form        = ${form}`);
        client.logger.debug(`bossType    = ${bossType}`);
        client.logger.debug(`tier        = ${tier}`);
        client.logger.debug(`isMega      = ${isMega}`);
        client.logger.debug(`isShadow    = ${isShadow}`);
        client.logger.debug(`isShinyable = ${isShinyable}`);
        client.logger.debug(`isActive    = ${isActive}`);

        // Create the Boss search object
        const bossSearchObj = {};

        if (pokemonId != null) {
            bossSearchObj.pokemonId = pokemonId;
        }

        if (form != null) {
            bossSearchObj.form = form;
        }

        if (bossType != null) {
            bossSearchObj.bossType = bossType;
        }

        if (tier != null) {
            bossSearchObj.tier = tier;
        }

        if (isMega != null) {
            bossSearchObj.isMega = isMega;
        }

        if (isShadow != null) {
            bossSearchObj.isShadow = isShadow;
        }

        if (isShinyable != null) {
            bossSearchObj.isShinyable = isShinyable;
        }

        if (isActive != null) {
            bossSearchObj.isActive = isActive;
        }

        client.logger.debug('Boss Search Object');
        client.logger.dump(bossSearchObj);
        
        // Run the search query
        const bosses = await Boss.get(bossSearchObj, [ 'tier', 'pokemonId' ] );

        // Iterate through the results
        let bossEembedArray = [];

        for (let boss of bosses) {
            let bossEmbed = await boss.buildEmbed();
            bossEembedArray.push(bossEmbed);
        }

        // Display a dummy message for now
        await interaction.reply({ content: `Found ${bossEembedArray.length} bosses`, flags: MessageFlags.Ephemeral });

        // Show all of the bosses
        for (let x = 0; x < bossEembedArray.length; x++) {
            await interaction.followUp({
                embeds: [ bossEembedArray[x] ],
                flags: MessageFlags.Ephemeral
            })
        }
    },

    /************************************/
    /* Subcommand :: Enable and Disable */
    /************************************/

    async executeToggleActive(interaction, isActive) {
        const client = interaction.client;
        const table  = 'boss';

        const pokemonId  = interaction.options.getString('pokemon');
        const form       = interaction.options.getString('form');
        const bossType   = interaction.options.getString('boss-type') ?? BossType.Raid;
        const isMega     = interaction.options.getBoolean('mega')     ?? false;
        const isShadow   = interaction.options.getBoolean('shadow')   ?? false;

        client.logger.debug(`pokemonId  = ${pokemonId}`);
        client.logger.debug(`form       = ${form}`);
        client.logger.debug(`bossType   = ${bossType}`);
        client.logger.debug(`isMega     = ${isMega}`);
        client.logger.debug(`isShadow   = ${isShadow}`);

        // Create the Boss search object
        const bossSearchObj = {
            pokemonId: pokemonId,
            bossType: bossType,
            isMega: isMega
        };

        if (form != null) {
            bossSearchObj.form = form;
        }   

        // Run the query
        let bossRecArray = await Boss.get(bossSearchObj);

        if (bossRecArray.length == 0) {
            await interaction.reply({ content: `Could not find boss with those parameters`, flags: MessageFlags.Ephemeral });
        } else if (bossRecArray.length > 1) {
            await interaction.reply({ content: `More than one boss found with those parameters`, flags: MessageFlags.Ephemeral });
        } else {
            const bossRec = bossRecArray[0];
            bossRec.isActive = isActive;
            await bossRec.update();
            
            const embed = await bossRec.buildEmbed();
            await interaction.reply({
                content: `Boss updated`,
                embeds: [embed]
            });
        }
    },
    
    /******************************************************/
    /* Subcommand Autocomplete  :: List, Enable, Disable  */
    /******************************************************/

    async autocompleteSearch(interaction) {
        const client = interaction.client;
        const subCommand = interaction.options.getSubcommand();
        const focusedOption = interaction.options.getFocused(true);
        client.logger.debug(`Initiating autocomplete for boss -- ${this.data.name} :: ${focusedOption.name} :: ${focusedOption.value}`);

        let choices = [];
        const pokemonId  = interaction.options.getString('pokemon');
        const form       = interaction.options.getString('form');
        const bossType   = interaction.options.getString('boss-type');
        const isMega     = interaction.options.getBoolean('mega');
        const isShadow   = interaction.options.getBoolean('shadow');
        let   isActive   = interaction.options.getBoolean('active');

        switch (subCommand) {
            case 'enable':  isActive = false; break;
            case 'disable': isActive = true; break;
        }

        client.logger.debug(`pokemonId  = ${pokemonId}`);
        client.logger.debug(`form       = ${form}`);
        client.logger.debug(`bossType   = ${bossType}`);
        client.logger.debug(`isMega     = ${isMega}`);
        client.logger.debug(`isShadow   = ${isShadow}`);
        client.logger.debug(`isActive   = ${isActive}`);

        // Create the Boss search object
        const bossSearchObj = {};

        if ( (focusedOption.name != 'pokemon') && (pokemonId != null) ) {
            bossSearchObj.pokemonId = pokemonId;
        }

        if ( (focusedOption.name != 'form') && (form != null) ) {
            bossSearchObj.form = form;
        }

        if (bossType != null) {
            bossSearchObj.bossType = bossType;
        }

        if (isMega != null) {
            bossSearchObj.isMega = isMega;
        }

        if (isShadow != null) {
            bossSearchObj.isShadow = isShadow;
        }

        if (isActive != null) {
            bossSearchObj.isActive = isActive;
        }

        switch (focusedOption.name) {
            case 'pokemon':
                choices = await Boss.getPokemonIdChoices(focusedOption.value, bossSearchObj);
                break;
            case 'form':
                choices = await Boss.getFormChoices(focusedOption.value, bossSearchObj);
                break;
        }

        if (choices.length <= MaxAutoCompleteChoices) {
            await interaction.respond(
                choices.map(choice => ({ name: choice, value: choice })),
            );
            return;
        }

        await interaction.respond([]);
    }
};

export default BossCmd;
