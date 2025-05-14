
import {
	MessageFlags,
	SlashCommandBuilder
} from 'discord.js';

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const PingCmd = {
	global: false,
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	
	async execute(interaction) {
		await interaction.reply({ content: 'Rotom is alive!' });
		await sleep(2_000);
		await interaction.editReply({ content: 'Rotom is still alive!!' });
	}
};

export default PingCmd;
