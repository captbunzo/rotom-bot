
import { Events } from 'discord.js';

const clientReady = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		client.logger.log(`Ready! Logged in as ${client.user.tag}`);
	},
};

export default clientReady;
