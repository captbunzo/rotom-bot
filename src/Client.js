
import config from '../config.json' with { type: 'json' };

import fs from 'fs';
import path from 'node:path';
import chalk from 'chalk';
import Logger from './Logger.js';

import Discord, { GatewayIntentBits } from 'discord.js';

const DiscordClient = Discord.Client;
const Collection    = Discord.Collection;

class Client extends DiscordClient {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds
            ]
            //intents: [
            //    GatewayIntentBits.Guilds,
            //    GatewayIntentBits.GuildMessages,
            //    GatewayIntentBits.MessageContent,
            //    GatewayIntentBits.GuildMembers
            //]
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

    // TODO - Improve logging of this as right now it just spits everything out and is a mess
    // TODO - It would be nice to change this to (1) delete all previous commands and (2) deploy commands individually
    async deployCommands() {
        // Load the commands
        await this.loadCommands();

        const globalCommandsJSON = [];
        const guildCommandsJSON  = [];

        for (const [commandName, command] of this.commands) {
            this.logger.log(`Loading Command: ${commandName}`);
            this.logger.dump(command.data.toJSON());
            this.logger.dump('');

            if (command.global) {
                globalCommandsJSON.push(command.data.toJSON());
            } else {
                guildCommandsJSON.push(command.data.toJSON());
            }
        }

        // Construct and prepare an instance of the REST module
        const rest = new Discord.REST().setToken(this.config.token);

        // Deploy global commands
        (async () => {
	        try {
                // Use the put method to fully refresh all global commands with the current set
                this.logger.log(`Started refreshing ${globalCommandsJSON.length} global application (/) commands.`);

                const globalData = await rest.put(
                    Discord.Routes.applicationCommands(this.config.client_id),
                    { body: globalCommandsJSON },
                );

                this.logger.log(`Successfully reloaded ${globalData.length} global application (/) commands.`);

                // Use the put method to fully refresh all guild commands with the current set
                this.logger.log(`Started refreshing ${guildCommandsJSON.length} guild application (/) commands.`);

                const guildData = await rest.put(
                    Discord.Routes.applicationGuildCommands(this.config.client_id, this.config.bot_guild_id),
                    { body: guildCommandsJSON },
                );

                this.logger.log(`Successfully reloaded ${guildData.length} global application (/) commands.`);
            } catch (error) {
                // And of course, make sure you catch and log any errors!
                this.logger.error(error);
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
                    this.logger.error(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
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
                this.logger.error(`[WARNING] The modal at ${filePath} is missing a required "data" or "show" or "handle" property.`);
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
            if ('data' in button && 'handle' in button) {
                this.logger.log(`Loading button: ${button.data.name}`);
                this.buttons.set(button.data.name, button);
            } else {
                this.logger.error(`[WARNING] The button at ${filePath} is missing a required "data" or "show" or "handle" property.`);
            }
        }
    }
}

if (global.client == null)
    global.client = new Client(global.client);

export default global.client;
