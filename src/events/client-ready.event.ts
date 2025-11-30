import { Events } from 'discord.js';
import type { Client } from '@/client.js';
import type { Event } from '@/types/event';
import { t } from '@/i18n/index.js';

export class ClientReadyEvent implements Event {
    name = Events.ClientReady;
    once = true;

    /**
     * @param {import('discord.js').Client} client
     */
    execute(client: Client) {
        if (client.user) {
            client.logger.log(t('bot.ready', { username: client.user.tag }));
        } else {
            client.logger.error(t('bot.clientUserUndefined'));
        }
    }
}

export const event = new ClientReadyEvent();
