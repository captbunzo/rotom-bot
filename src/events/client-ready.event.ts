import { Events } from 'discord.js';
import type { Client } from '@/client.js';
import type { Event } from '@/types/event';

export class ClientReadyEvent implements Event {
    name = Events.ClientReady;
    once = true;

    /**
     * @param {import('discord.js').Client} client
     */
    execute(client: Client) {
        if (client.user) {
            client.logger.log(`Ready! Logged in as ${client.user.tag}`);
        } else {
            client.logger.error('Client user is not defined');
        }
    }
}

export const event = new ClientReadyEvent();
