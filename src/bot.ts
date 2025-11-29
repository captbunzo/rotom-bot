// Load the config
// import { config } from '@/config';
// console.log(config);

// Setup sentry for catching exceptions and stuff
import { Sentry } from '@/utils/sentry';
Sentry.init();

// Setup i18n for internationalization (initialized synchronously on import)
// This must be imported before any code that uses t()
import '@/i18n/index.js';
import { t } from '@/i18n/index.js';

// Setup the database connection
import { dataSourceInit } from '@/database/data-source';

// Load the client
import { client } from '@/client.js';

export const Bot = {
    async start() {
        console.log(t('bot.starting'));

        // Initialize the database
        await dataSourceInit();

        // Initialize the client
        await client.init();
    },

    async deployCommands() {
        // Deploy the commands
        await client.deployCommands();
    },
};
