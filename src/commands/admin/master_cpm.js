
import {
    MessageFlags,
    SlashCommandBuilder
} from 'discord.js';

import { readFile } from 'fs/promises';
import MasterCPM from '../../data/MasterCPM.js';

const master_cpm = {
    global: false,
	data: new SlashCommandBuilder()
		.setName('master-cpm')
		.setDescription('Manage Master CP Multiplier data')
        .addSubcommand(subCommand =>
            subCommand
                .setName('load')
                .setDescription('Load Master CP Multiplier data file')
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
                    { content: `Master CP Multiplier management command execution not yet implemented for subcommand -- ${subCommand}`, flags: MessageFlags.Ephemeral }
                ); 
        }
	},

    async autocomplete(interaction) {
        const client  = interaction.client;
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'load' : this.autocompleteLoad(interaction); break;
            default :
                client.logger.error(`Master CP Multiplier management command autocomplete not yet implemented for subcommand -- ${subCommand}`);
        }
    },

    /**********************/
    /* Subcommand :: Load */
    /**********************/

    async executeLoad(interaction) {
        const client = interaction.client;
        const table  = 'master_cpm';
        const file   = interaction.options.getString('file')  ?? 'No file provided';
                
        await interaction.reply({ content: `Starting ${table} load`, flags: MessageFlags.Ephemeral });
        await interaction.followUp({ content: `Reading ${file}`, flags: MessageFlags.Ephemeral });

        const masterCpmJSON = JSON.parse(
            await readFile(
                new URL(file, import.meta.url)
            )
        );
        
        client.logger.debug('Master CP Multiplier JSON');
        client.logger.dump(masterCpmJSON);

        let count = 0;
        for (let x = 0; x < masterCpmJSON.cpMultiplier.length; x++) {
            let cpmValue = masterCpmJSON.cpMultiplier[x];
            count++;

            let masterCpmObject = {
                level: x + 1,
                cpm:   cpmValue
            }

            let masterCpmRecord = await MasterCPM.get({ level: masterCpmObject.level, unique: true });

            if (!masterCpmRecord) {
                masterCpmRecord = new MasterCPM(cpm);
                await masterCpmRecord.create();
            } else {
                masterCpmRecord.level = masterCpmObject.level;
                masterCpmRecord.cpm   = masterCpmObject.cpm;
                await masterCpmRecord.update();
            }
        }

        await interaction.followUp({ content: `Loaded ${count} records from ${file}`, flags: MessageFlags.Ephemeral });
    },

    async autocompleteLoad(interaction) {
        const client  = interaction.client;
        const focusedOption = interaction.options.getFocused(true);
        client.logger.error(`Data load autocomplete not yet implemented for master_cpm -- ${this.data.name} :: ${focusedOption.name} :: ${focusedOption.value}`);
        await interaction.respond([]);
    }
};

export default master_cpm;
