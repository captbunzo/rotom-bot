
// Load the config
import config from '../config.json' with { type: 'json' };

// Load our classes
import DuplicateError from './error/DuplicateError.js';
import PermissionError from './error/PermissionError.js';
import Logger from './Logger.js';

// Load external modules
import fs from 'fs';
import path from 'node:path';
import chalk from 'chalk';

// Load discord modules
import Discord from 'discord.js';
import { throws } from 'node:assert';

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
        // Load commands and events
        await this.loadCommands();
        await this.loadEvents();
        await this.loadModals();
        await this.loadButtons();

        // Connect to discord
        this.logger.log('Starting bot');
        await this.login(this.config.token);

        // Launch the background scheduler
        // this.scheduler = require(`./Scheduler`);
    }

    async deployCommands() {
        // Load the commands
        await this.loadCommands();

        const commandsJSON = [];
        for (const [commandName, command] of this.commands) {
            console.log(command.data.toJSON());
            commandsJSON.push(command.data.toJSON());
        }

        // Construct and prepare an instance of the REST module
        const rest = new Discord.REST().setToken(this.config.token);

        // and deploy your commands!
        (async () => {
	        try {
                console.log(`Started refreshing ${commandsJSON.length} application (/) commands.`);

                // The put method is used to fully refresh all commands in the guild with the current set
                const data = await rest.put(
                    Discord.Routes.applicationCommands(this.config.client_id),
                    { body: commandsJSON },
                );

                console.log(`Successfully reloaded ${data.length} application (/) commands.`);
            } catch (error) {
                // And of course, make sure you catch and log any errors!
                console.error(error);
            }
        })();
    }

    // ********************* //
    // * Load all Commands * //
    // ********************* //

    async loadCommands() {
        this.commands = new Collection();
        
        const foldersPath = './src/commands';
        const commandFolders = fs.readdirSync(foldersPath);
        
        for (const folder of commandFolders) {
            const commandsPath = path.join(foldersPath, folder);
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const cmdFilePath = filePath.replace(/^(src\/)/,"./");
                const { default: command } = await import(cmdFilePath);
                
                // Set a new item in the Collection with the key as the command name and the value as the exported module
                if ('data' in command && 'execute' in command) {
                    this.logger.log(`Loading command: ${command.data.name}`);
                    this.commands.set(command.data.name, command);
                } else {
                    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            }
        }
    }

    // ******************* //
    // * Load all Events * //
    // ******************* //
    async loadEvents() {
        const eventsPath = './src/events';
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
        
        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const eventFilePath = filePath.replace(/^(src\/)/,"./");
            const { default: event } = await import(eventFilePath);

            if (event.once) {
                this.logger.log(`Loading event: ${event.name} (once)`);
                this.once(event.name, (...args) => event.execute(...args));
            } else {
                this.logger.log(`Loading event: ${event.name}`);
                this.on(event.name, (...args) => event.execute(...args));
            }
        }
    }

    // ******************* //
    // * Load all Modals * //
    // ******************* //
    async loadModals() {
        this.modals = new Collection();
        
        const modalsPath = './src/modals';
        const modalFiles = fs.readdirSync(modalsPath).filter(file => file.endsWith('.js'));
        
        for (const file of modalFiles) {
            const filePath = path.join(modalsPath, file);
            const modalFilePath = filePath.replace(/^(src\/)/,"./");
            const { default: modal } = await import(modalFilePath);
            
            // Set a new item in the Collection with the key as the modal name and the value as the exported module
            if ('data' in modal && 'show' in modal && 'handle' in modal) {
                this.logger.log(`Loading modal: ${modal.data.name}`);
                this.modals.set(modal.data.name, modal);
            } else {
                console.log(`[WARNING] The modal at ${filePath} is missing a required "data" or "show" or "handle" property.`);
            }
        }
    }

    // ******************** //
    // * Load all Buttons * //
    // ******************** //
    async loadButtons() {
        this.buttons = new Collection();
        
        const buttonsPath = './src/buttons';
        const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));
        
        for (const file of buttonFiles) {
            const filePath = path.join(buttonsPath, file);
            const buttonFilePath = filePath.replace(/^(src\/)/,"./");
            const { default: button } = await import(buttonFilePath);
            
            // Set a new item in the Collection with the key as the button name and the value as the exported module
            if ('data' in button && 'show' in button && 'handle' in button) {
                this.logger.log(`Loading button: ${button.data.name}`);
                this.buttons.set(button.data.name, button);
            } else {
                console.log(`[WARNING] The button at ${filePath} is missing a required "data" or "show" or "handle" property.`);
            }
        }
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
