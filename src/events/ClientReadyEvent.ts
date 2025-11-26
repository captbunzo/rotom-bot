import { Events } from 'discord.js';

import Client from '@root/src/client.js';

const ClientReadyEvent = {
    name: Events.ClientReady,
    once: true,

    /**
     * @param {import('discord.js').Client} client
     */
    execute(client: Client) {
        if (!client.user) {
            client.logger.error('Client user is not defined');
        } else {
            client.logger.log(`Ready! Logged in as ${client.user.tag}`);
        }
    },
};

export default ClientReadyEvent;
