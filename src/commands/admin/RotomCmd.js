
import {
    MessageFlags,
    SlashCommandBuilder
} from 'discord.js';

import {
    RotomReturnCode
} from '../../Constants.js';

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const RotomCmd = {
    global: false,
	data: new SlashCommandBuilder()
		.setName('rotom')
		.setDescription('Manage Rotom bot')
        .addSubcommand(subCommand => subCommand
            .setName('restart')
            .setDescription('Restart Rotom bot')
        )
        .addSubcommand(subCommand => subCommand
            .setName('stop')
            .setDescription('Stop Rotom bot')
        )
        .addSubcommand(subCommand => subCommand
            .setName('deploy-commands')
            .setDescription('Deploy Rotom commands')
        )
        .addSubcommand(subCommand => subCommand
            .setName('ping')
            .setDescription('Ping Rotom bot')
        ),
	
	async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'restart'         : this.executeRestartStop(interaction, subCommand); break;
            case 'stop'            : this.executeRestartStop(interaction, subCommand); break;
            case 'deploy-commands' : this.executeDeployCommands(interaction); break;
            case 'ping'            : this.executePing(interaction); break;
            default :
                await interaction.reply({
                    content: `Rotom management command execution not yet implemented for subcommand -- ${subCommand}`,
                    flags: MessageFlags.Ephemeral
                }); 
        }
	},

    /********************************/
    /* Subcommand :: Restart / Stop */
    /********************************/

    async executeRestartStop(interaction, subCommand) {
        const client = interaction.client;

        switch (subCommand) {
            case 'restart' :
                await interaction.reply({ content: `Restarting Rotom bot`, flags: MessageFlags.Ephemeral });
                await client.destroy();
                process.exit(RotomReturnCode.Restart);
            case 'stop' :
                await interaction.reply({ content: `Stopping Rotom bot`, flags: MessageFlags.Ephemeral });
                await client.destroy();
                process.exit(RotomReturnCode.Success);
        }
    },

    /*********************************/
    /* Subcommand :: Deploy Commands */
    /*********************************/

    // TODO - Edit client.deployCommands() to provide feedback on command deployment back to the user in discord
    async executeDeployCommands(interaction) {
        const client = interaction.client;
        await interaction.reply({ content: `Deploying commands`, flags: MessageFlags.Ephemeral });
        await client.deployCommands();
        await interaction.followUp({ content: `Commands deployed`, flags: MessageFlags.Ephemeral });
    },

    /*******************************/
    /* Subcommand :: Ping Commands */
    /*******************************/

	async executePing(interaction) {
		await interaction.reply({ content: 'Rotom is alive!' });
		await sleep(2_000);
		await interaction.editReply({ content: 'Rotom is still alive!!' });
	}
};

export default RotomCmd;
