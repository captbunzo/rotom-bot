
import {
    MessageFlags,
    SlashCommandBuilder
} from 'discord.js';

import { readFile } from 'fs/promises';
import MasterPokemon from '../../data/MasterPokemon.js';

const master_pokemon = {
    global: false,
    data: new SlashCommandBuilder()
        .setName('master-pokemon')
        .setDescription('Manage Master Pokémom data')
        .addSubcommand(subCommand =>
            subCommand
                .setName('load')
                .setDescription('Load Master Pokémom data file')
                .addStringOption(option =>
                    option
                        .setName('file')
                        .setDescription('File to load')
                        .setRequired(true)
                )
        ),
    
    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'load' : this.executeLoad(interaction); break;
            default :
                await interaction.reply(
                    { content: `Master Pokémom management command execution not yet implemented for subcommand -- ${subCommand}`, flags: MessageFlags.Ephemeral }
                ); 
        }
    },

    async autocomplete(interaction) {
        const client  = interaction.client;
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'load' : this.autocompleteLoad(interaction); break;
            default :
                client.logger.error(`Master Pokémom management command autocomplete not yet implemented for subcommand -- ${subCommand}`);
        }
    },

    /**********************/
    /* Subcommand :: Load */
    /**********************/

    async executeLoad(interaction) {
        const client = interaction.client;
        const table  = 'master_pokemon';
        const file   = interaction.options.getString('file')  ?? 'No file provided';
                
        await interaction.reply({ content: `Starting pokemon_master load`, flags: MessageFlags.Ephemeral });
        await interaction.followUp({ content: `Reading ${file}`, flags: MessageFlags.Ephemeral });

        const json = JSON.parse(
            await readFile(
                new URL(file, import.meta.url)
            )
        );

        let count = 0;
        for (let p = 0; p < json.length; p++) {
            let masterPokemonJSON = json[p];
            count++;

            client.logger.debug('Master Pokémom JSON');
            client.logger.dump(masterPokemonJSON);

            let masterPokemonObj = {
                templateId:           masterPokemonJSON.templateId,
                pokemonId:            masterPokemonJSON.pokemonId,
                pokedexId:           +masterPokemonJSON.templateId.substring(1, 5),
                type:                 masterPokemonJSON.type.replace(/^POKEMON_TYPE_/, ''),
                type2:                null,
                form:                 null,
                formMaster:           masterPokemonJSON.form,
                baseAttack:           masterPokemonJSON.baseAttack,
                baseDefense:          masterPokemonJSON.baseDefense,
                baseStamina:          masterPokemonJSON.baseStamina,
                candyToEvolve:        masterPokemonJSON.candyToEvolve,
                buddyDistanceKm:      masterPokemonJSON.kmBuddyDistance,
                purifyStardust:       masterPokemonJSON.purificationStardustNeeded
            }

            if (masterPokemonJSON.type2 != null) {
                masterPokemonObj.type2 = masterPokemonJSON.type2.replace(/^POKEMON_TYPE_/, '');
            }

            if (masterPokemonObj.formMaster != null) {
                masterPokemonObj.form = masterPokemonObj.formMaster.replace(new RegExp('^' + masterPokemonJSON.pokemonId + '_'), '');
            }

            client.logger.debug('Master Pokémom Object');
            client.logger.dump(masterPokemonObj);

            let masterPokemonRec = await MasterPokemon.get({ templateId: masterPokemonObj.templateId, unique: true });

            if (!masterPokemonRec) {
                masterPokemonRec = new MasterPokemon(pokemon);
                await masterPokemonRec.create();
            } else {
                masterPokemonRec.templateId           = masterPokemonObj.templateId;
                masterPokemonRec.pokemonId            = masterPokemonObj.pokemonId;
                masterPokemonRec.pokedexId            = masterPokemonObj.pokedexId;
                masterPokemonRec.type                 = masterPokemonObj.type;
                masterPokemonRec.type2                = masterPokemonObj.type2;
                masterPokemonRec.form                 = masterPokemonObj.form;
                masterPokemonRec.formMaster           = masterPokemonObj.formMaster;
                masterPokemonRec.baseAttack           = masterPokemonObj.baseAttack;
                masterPokemonRec.baseDefense          = masterPokemonObj.baseDefense;
                masterPokemonRec.baseStamina          = masterPokemonObj.baseStamina;
                masterPokemonRec.candyToEvolve        = masterPokemonObj.candyToEvolve;
                masterPokemonRec.buddyDistanceKm      = masterPokemonObj.buddyDistanceKm;
                masterPokemonRec.purifyStardust       = masterPokemonObj.purifyStardust;
                await masterPokemonRec.update();
            }                

            client.logger.debug('Master Pokémom Record');
            client.logger.dump(masterPokemonRec);            
        }

        await interaction.followUp({ content: `Loaded ${count} records from ${file}`, flags: MessageFlags.Ephemeral });
    },

    async autocompletLoad(interaction) {
        const client  = interaction.client;
        const focusedOption = interaction.options.getFocused(true);
        client.logger.error(
            `Master Pokémom management command autocomplete not yet implemented for load -- ${this.data.name} :: ${focusedOption.name} :: '${focusedOption.value}'`
        );
        await interaction.respond([]);
    }
};

export default master_pokemon;
