
// Load the config
import config from '../config.json' with { type: 'json' };

// Load our classes
import DuplicateError from './error/DuplicateError.js';
import PermissionError from './error/PermissionError.js';
import Logger from './Logger.js';

// Load external modules
import fs from 'fs';
import chalk from 'chalk';

// Load discord modules
import Discord from 'discord.js';
import { expressErrorHandler } from '@sentry/node';
const DiscordClient = Discord.Client;
const Collection    = Discord.Collection;
const Permissions   = Discord.Permissions;

class Client extends DiscordClient {
    constructor() {
        super({
            intents: [],
        });
        
        // Load the colors
        this.chalk = chalk;
        
        // Set some colors
        this.colorizeCommand = this.chalk.green;
        this.colorizeAlias   = this.chalk.cyan;
        this.colorizeAction  = this.chalk.yellow;
        
        // Set some database colors
        this.colorizeTable   = this.chalk.cyan;
        this.colorizeField   = this.chalk.green;
        this.colorizeType    = this.chalk.yellow;
        this.colorizeNotNull = this.chalk.red;
        this.colorizeFkName  = this.chalk.magenta;
        
        // Discord API errors
        // this.DISCORD_ERROR_UNKNOWN_ACCOUNT     = 10001;
        // this.DISCORD_ERROR_UNKNOWN_APPLICATION = 10002;
        // this.DISCORD_ERROR_UNKNOWN_CHANNEL     = 10003;
        // this.DISCORD_ERROR_UNKNOWN_GUILD       = 10004;
        // this.DISCORD_ERROR_UNKNOWN_INTEGRATION = 10005;
        // this.DISCORD_ERROR_UNKNOWN_INVITE      = 10006;
        // this.DISCORD_ERROR_UNKNOWN_MEMBER      = 10007;
        // this.DISCORD_ERROR_UNKNOWN_MESSAGE     = 10008;
        // this.DISCORD_ERROR_UNKNOWN_ROLE        = 10011;
        // this.DISCORD_ERROR_UNKNOWN_TOKEN       = 10012;
        // this.DISCORD_ERROR_UNKNOWN_USER        = 10013;
        // this.DISCORD_ERROR_UNKNOWN_EMOJI       = 10014;
        // this.DISCORD_ERROR_UNKNOWN_WEBHOOK     = 10015;
        
        // Attach the config and logger
        this.config = config;
        this.logger = new Logger();
        
        // Set the log level
        this.logger.logLevel = this.config.logLevel;
        this.logger.logSql   = this.config.logSql;
    }

    // ************************* //
    // * Initialize the Client * //
    // ************************* //

    async init() {
        // Connect to discord
        await this.login(this.config.token);

        // Load all the stuff
        // this.loadTimezones();
        // this.loadEvents();
        // this.loadCommands();

        // Launch the background scheduler
        // this.scheduler = require(`./Scheduler`);
    }
}

if (global.client == null)
    global.client = new Client(global.client);

export default global.client;

// export function get() {
//     if (global.client == null)
//         global.client = new Client(config);
//     return global.client;
// }

// console.log(global.config);

// module.exports = function (config) {
//     if (global.client) return global.client;
//     global.client = new Client(config);
//     return global.client;
// };
