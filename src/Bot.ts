
// TODO - Figure out why this is not working
// Google "how to require a node version for node.js project"
// Surely I can set this in the package.json or something
// This seems like a dumbass hack

// Verify the node version is 14.0.0 or above
if (Number(process.version.slice(1).split('.')[0]) < 22) {
    throw new Error('Node 22.0.0 or above is required. Update Node on your system.');
}

// Load the config
import config from '#root/config.json' with { type: 'json' };

// @ts-expect-error - TODO - Fix this later
global.config = config;

// Setup sentry for catching exceptions and stuff
import Sentry from '#src/Sentry.js';
Sentry.init(config);

// Load the database connection
import DatabaseConnection from '#src/Database.js';
const databaseConnection = DatabaseConnection.getInstance();

// Load the client
import Client from '#src/Client.js';
const client = Client.getInstance();

export default class Bot {
    static async start() {
        // Initialize the database
        await databaseConnection.init(config);

        // Initialize the client
        await client.init();
    }

    static async deployCommands() {
        // Deploy the commands
        await client.deployCommands();
    }
}
