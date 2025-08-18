import {
    ChatInputCommandInteraction,
    MessageFlags,
    SlashCommandBuilder
} from 'discord.js';

import {
    BotReturnCode
} from '#src/Constants.js';

import Client from '#src/Client.js';

async function sleep(ms: number) {
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
	
	async execute(interaction: ChatInputCommandInteraction) {
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

    async executeRestartStop(interaction: ChatInputCommandInteraction, subCommand: string) {
        const client = interaction.client as Client;

        switch (subCommand) {
            case 'restart' :
                await interaction.reply({ content: `Restarting Rotom bot`, flags: MessageFlags.Ephemeral });
                await client.destroy();
                process.exit(BotReturnCode.Restart);
            case 'stop' :
                await interaction.reply({ content: `Stopping Rotom bot`, flags: MessageFlags.Ephemeral });
                await client.destroy();
                process.exit(BotReturnCode.Success);
        }
    },

    /*********************************/
    /* Subcommand :: Deploy Commands */
    /*********************************/

    // TODO - Edit client.deployCommands() to provide feedback on command deployment back to the user in discord
    async executeDeployCommands(interaction: ChatInputCommandInteraction) {
        const client = interaction.client as Client;
        await interaction.reply({ content: `Deploying commands`, flags: MessageFlags.Ephemeral });
        await client.deployCommands();
        await interaction.followUp({ content: `Commands deployed`, flags: MessageFlags.Ephemeral });
    },

    /*******************************/
    /* Subcommand :: Ping Commands */
    /*******************************/

	async executePing(interaction: ChatInputCommandInteraction) {
		await interaction.reply({ content: 'Rotom is alive!' });
		await sleep(2_000);
		await interaction.editReply({ content: 'Rotom is still alive!!' });
	}
};

export default RotomCmd;