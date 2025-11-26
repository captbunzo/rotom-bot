// Load the config
import { config } from '@/config';
console.log(config);

// Setup sentry for catching exceptions and stuff
import { Sentry } from '@/utils/sentry';
Sentry.init();

// Load the database connection
// import DatabaseConnection from '@root/src/database.js';
// const databaseConnection = DatabaseConnection.getInstance();

// Load the client
// import Client from '@root/src/client.js';
// const client = Client.getInstance();

export const Bot = {
    async start() {
        console.log('Starting bot...');
        //         // Initialize the database
        //         await databaseConnection.init(config);
        //
        //         // Initialize the client
        //         await client.init();
    },

    async deployCommands() {
        //         // Deploy the commands
        //         await client.deployCommands();
    },
};
