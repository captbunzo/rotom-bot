import { rawConfig } from './types/raw.config.js';

export interface DiscordConfig {
    clientId: string;
    token: string;
    clientSecret: string;
    botGuildId: string;
}

export const discordConfig: DiscordConfig = {
    clientId: rawConfig.getStringParameter('discord', 'clientId'),
    token: rawConfig.getStringParameter('discord', 'token'),
    clientSecret: rawConfig.getStringParameter('discord', 'clientSecret'),
    botGuildId: rawConfig.getStringParameter('discord', 'botGuildId'),
};
