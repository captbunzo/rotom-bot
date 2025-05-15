
import path from 'node:path';
import { readFile } from 'fs/promises';

import {
    MessageFlags,
    SlashCommandBuilder
} from 'discord.js';

import {
    InterimLoadUpdates
} from '../../Constants.js';

import MasterCPM from '../../data/MasterCPM.js';

const MasterCPMCmd = {
    global: false,
	data: new SlashCommandBuilder()
		.setName('master-cpm')
		.setDescription('Manage Master CP Multiplier data')
        .addSubcommand(subCommand => subCommand
            .setName('load')
            .setDescription('Load Master CP Multiplier data file')
        ),
	
	async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'load' : this.executeLoad(interaction); break;
            default :
                await interaction.reply({
                    content: `Master CP Multiplier management command execution not yet implemented for subcommand -- ${subCommand}`,
                    flags: MessageFlags.Ephemeral
                }); 
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
        const file   = path.join(client.config.data_directory, 'master_cpm.json');

        await interaction.reply({ content: `Starting load of ${table} table` });

        let json;
        try {
            json = JSON.parse(
                await readFile(
                    new URL(file, import.meta.url)
                )
            );
        } catch (error) {
            await interaction.followUp({ content: `Error reading file` });
        }

        client.logger.debug('Master CP Multiplier JSON');
        client.logger.dump(json);

        let count = 0;
        let followUpMsg = await interaction.followUp({ content: `Loaded ${count} records into ${table} table` });

        for (let x = 0; x < json.cpMultiplier.length; x++) {
            let cpmValue = json.cpMultiplier[x];
            count++;

            let masterCpmObject = {
                level: x + 1,
                cpm:   cpmValue
            }

            let masterCPM = await MasterCPM.get({ level: masterCpmObject.level, unique: true });

            if (!masterCPM) {
                masterCPM = new MasterCPM(masterCpmObject);
                await masterCPM.create();
            } else {
                masterCPM.level = masterCpmObject.level;
                masterCPM.cpm   = masterCpmObject.cpm;
                await masterCPM.update();
            }
            
            if (count % InterimLoadUpdates == 0) {
                interaction.editReply({
                    message: followUpMsg,
                    content: `Loaded ${count} records into ${table} table`
                });
            }
        }

        interaction.editReply({
            message: followUpMsg,
            content: `Loaded ${count} records into ${table} table`
        });

        interaction.followUp({
            content: `Load of ${table} table complete`
        });
    },

    async autocompleteLoad(interaction) {
        const client  = interaction.client;
        const focusedOption = interaction.options.getFocused(true);
        client.logger.error(`Data load autocomplete not yet implemented for master_cpm -- ${this.data.name} :: ${focusedOption.name} :: ${focusedOption.value}`);
        await interaction.respond([]);
    }
};

export default MasterCPMCmd;
