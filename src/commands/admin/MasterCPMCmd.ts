import path from 'node:path';
import { readFile } from 'fs/promises';

import {
    ChatInputCommandInteraction,
    MessageFlags,
    SlashCommandBuilder
} from 'discord.js';

import Client from '#src/Client.js';
import { InterimLoadUpdates } from '#src/Constants.js';
import MasterCPM from '#src/models/MasterCPM.js';

const MasterCPMCmd = {
    global: false,
	data: new SlashCommandBuilder()
		.setName('master-cpm')
		.setDescription('Manage Master CP Multiplier data')
        .addSubcommand(subCommand => subCommand
            .setName('load')
            .setDescription('Load Master CP Multiplier data file')
        ),
	
	async execute(interaction: ChatInputCommandInteraction) {
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

    /**********************
     * Subcommand :: Load *
     **********************/

    async executeLoad(interaction: ChatInputCommandInteraction) {
        const client = interaction.client as Client;
        const table  = 'master_cpm';
        const file   = path.join(client.config.data_directory, 'master_cpm.json');

        await interaction.reply({ content: `Starting load of ${table} table` });

        let json;
        try {
            const url = new URL(file, import.meta.url);
            const data = (await readFile(url)).toString();
            json = JSON.parse(data);
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

            let masterCPM = await MasterCPM.getUnique({ level: masterCpmObject.level });

            if (!masterCPM) {
                masterCPM = new MasterCPM(masterCpmObject);
                await masterCPM.create();
            } else {
                masterCPM.level = masterCpmObject.level;
                masterCPM.cpm   = masterCpmObject.cpm;
                await masterCPM.update();
            }
            
            if (count % InterimLoadUpdates == 0) {
                await interaction.editReply({
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
    }
};

export default MasterCPMCmd;