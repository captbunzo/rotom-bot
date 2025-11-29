// Load the config
// import { config } from '@/config';
// console.log(config);

// Setup sentry for catching exceptions and stuff
import { Sentry } from '@/utils/sentry';
Sentry.init();

// Setup the database connection
import { dataSourceInit } from '@/database/data-source';

// Load the client
import { client } from '@/client.js';

export const Bot = {
    async start() {
        console.log('Starting bot...');

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
