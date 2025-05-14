
import {
	Events
} from 'discord.js';

const clientReady = {
	name: Events.ClientReady,
	once: true,
	
	/**
	 * @param {import('discord.js').Client} client
	 */
	execute(client) {
		client.logger.log(`Ready! Logged in as ${client.user.tag}`);
	},
};

export default clientReady;
