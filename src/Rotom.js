
// TODO - Figure out why this is not working
// Google "how to require a node version for node.js project"
// Surely I can set this in the package.json or something
// This seems like a dumbass hack

// Verify the node version is 14.0.0 or above
if (Number(process.version.slice(1).split('.')[0]) < 22) {
    throw new Error('Node 22.0.0 or above is required. Update Node on your system.');
}

// Load the config
import config from '../config.json' with { type: 'json' };
global.config = config;

// Setup sentry for catching exceptions and stuff
import * as Sentry from './Sentry.js';
Sentry.init(config);

// Load singletons - which here in .js is actually initializing them
import client from './Client.js';
import knex from './Database.js';

// We are doing real fancy node 8 async/await stuff here, and to do that we
// need to wrap stuff in an anonymous function. It is annoying but it works.

import Trainer from './data/Trainer.js';

/* const init = async () => {
    // Initialize the database
    await knex.discordBotDatabaseInit();
    
    // Initialize the client
    await client.init();
};
 */

export default class Rotom {
    static async start() {
        // Initialize the database
        await knex.discordBotDatabaseInit();
        
        // Initialize the client
        await client.init();
    }

    static async deployCommands() {
        // Deploy the commands
        await client.deployCommands();
    }
}
