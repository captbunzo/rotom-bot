
import BotConfig from '#root/config.json' with { type: 'json' };

import fs from 'fs';
import path from 'node:path';
import chalk from 'chalk';
import DrossLogger from '@drossjs/dross-logger';

import {
    Client as DiscordClient,
    REST as DiscordREST,
    GatewayIntentBits,
    Routes
} from 'discord.js';

import {
    type Snowflake,
    Collection,
    Guild
} from 'discord.js';

//export interface ClientInterface extends Discord.Client {
//    logger: DrossLogger;
//}

// TODO - If this singleton works, turn DrossLogger into a singleton

export default class Client extends DiscordClient {
    /*********************
     * Singleton Members *
     *********************/
    private static instance: Client;

    // Private constructor to prevent direct instantiation
    private constructor() {
        super({
            // Intents to maybe user later:
            //  - GatewayIntentBits.Guilds
            //  - GatewayIntentBits.GuildMessages
            //  - GatewayIntentBits.MessageContent
            //  - GatewayIntentBits.GuildMembers
            intents: [
                GatewayIntentBits.Guilds
            ]
        });

        this.logger.log('Client singleton instance created');
    }

    // Static method to get the single instance
    public static getInstance(): Client {
        if (!Client.instance) {
            Client.instance = new Client();
        }
        return Client.instance;
    }

    /*****************************
     * Public instance variables *
     *****************************/

    // TODO - Check if these all work or if I need to move any of these into the constructor()

    public config = BotConfig;
    public logger: DrossLogger = new DrossLogger(this.config.logLevel, this.config.logSql);

    public chalk = chalk;
    public colorizeCommand = this.chalk.green;
    public colorizeAlias   = this.chalk.cyan;
    public colorizeAction  = this.chalk.yellow;

    public commands : Collection<string, any> = new Collection();
    public buttons  : Collection<string, any> = new Collection();
    public modals   : Collection<string, any> = new Collection();

    /*****************************
     * Initialize Discord Client *
     *****************************/

    async init() {
        // Load commands and events
        await this.loadCommands();
        await this.loadButtons();
        await this.loadModals();
        await this.loadEventHandlers();

        // Connect to discord
        this.logger.log('Starting bot');
        await this.login(this.config.token);

        // Launch the background scheduler
        // this.scheduler = require(`./Scheduler`);
    }

    /*******************
     * Deploy Commands *
     *******************/

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
        const discordREST = new DiscordREST().setToken(this.config.token);

        // Deploy global commands
        (async () => {
	        try {
                // Use the put method to fully refresh all global commands with the current set
                this.logger.log(`Loading ${globalCommandsJSON.length} global application (/) commands`);

                const globalCommandDeploymentResults: any = await discordREST.put(
                    Routes.applicationCommands(this.config.client_id),
                    { body: globalCommandsJSON },
                );

                this.logger.log(`Successfully loaded ${globalCommandDeploymentResults.length} global application (/) commands`);

                // Use the put method to fully refresh all guild commands with the current set
                this.logger.log(`Loading ${guildCommandsJSON.length} guild application (/) commands`);

                const guildCommandDeploymentResults: any = await discordREST.put(
                    Routes.applicationGuildCommands(this.config.client_id, this.config.bot_guild_id),
                    { body: guildCommandsJSON },
                );

                this.logger.log(`Successfully loaded ${guildCommandDeploymentResults.length} guild application (/) commands`);
            } catch (error) {
                // And of course, make sure you catch and log any errors!
                this.logger.error(error);
            }
        })();
    }

    /*****************
     * Load Commands *
     *****************/

    async loadCommands() {
        this.logger.log('Loading commands');
        this.commands = new Collection();
        
        const foldersPath = './src/commands';
        const commandFolders = fs.readdirSync(foldersPath);
        
        for (const folder of commandFolders) {
            const commandsPath = path.join(foldersPath, folder);
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
            
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const cmdFilePath = filePath.replace(/^(src\/)/,"./");
                const { default: command } = await import(cmdFilePath);
                
                // Set a new item in the Collection with the key as the command name and the value as the exported module
                if ('data' in command && 'execute' in command) {
                    this.logger.log(`  -> ${command.data.name}`);
                    this.commands.set(command.data.name, command);
                } else {
                    this.logger.error(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            }
        }
    }

    /************************
     * Load Events Handlers *
     ************************/

    async loadEventHandlers() {
        this.logger.log('Loading event handlers');

        const eventsPath = './src/events';
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts'));
        
        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const eventFilePath = filePath.replace(/^(src\/)/,"./");
            const { default: event } = await import(eventFilePath);

            if (event.once) {
                this.logger.log(`  -> ${event.name} (once)`);
                this.once(event.name, (...args) => event.execute(...args));
            } else {
                this.logger.log(`  -> ${event.name}`);
                this.on(event.name, (...args) => event.execute(...args));
            }
        }
    }

    /********************
     * Load all Buttons *
     ********************/
    
    async loadButtons() {
        this.logger.log('Loading buttons');
        this.buttons = new Collection();
        
        const buttonsPath = './src/buttons';
        const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.ts'));
        
        for (const file of buttonFiles) {
            const filePath = path.join(buttonsPath, file);
            const buttonFilePath = filePath.replace(/^(src\/)/,"./");
            const { default: button } = await import(buttonFilePath);
            
            // Set a new item in the Collection with the key as the button name and the value as the exported module
            if ('data' in button && 'handle' in button) {
                this.logger.log(`  -> ${button.data.name}`);
                this.buttons.set(button.data.name, button);
            } else {
                this.logger.error(`[WARNING] The button at ${filePath} is missing a required "data" or "show" or "handle" property.`);
            }
        }
    }
    
    /***************
     * Load Modals *
     ***************/

    async loadModals() {
        this.logger.log('Loading modals');
        this.modals = new Collection();
        
        const modalsPath = './src/modals';
        const modalFiles = fs.readdirSync(modalsPath).filter(file => file.endsWith('.ts'));
        
        for (const file of modalFiles) {
            const filePath = path.join(modalsPath, file);
            const modalFilePath = filePath.replace(/^(src\/)/,"./");
            const { default: modal } = await import(modalFilePath);
            
            // Set a new item in the Collection with the key as the modal name and the value as the exported module
            if ('data' in modal && 'show' in modal && 'handle' in modal) {
                this.logger.log(`  -> ${modal.data.name}`);
                this.modals.set(modal.data.name, modal);
            } else {
                this.logger.error(`[WARNING] The modal at ${filePath} is missing a required "data" or "show" or "handle" property.`);
            }
        }
    }

    /********************
     * Helper Functions *
     ********************/

    // TODO - Come up with a better naming convention for these types of helper functions
    async getGuild(id: string): Promise<Guild | null> {
        let guild = await this.guilds.fetch(id);

        if (typeof guild == 'object' && guild.constructor.name == 'Collection') {
            const guildCollection = guild as unknown as Collection<Snowflake, Guild>;
            guild = (await guildCollection.first()!.fetch()) as Guild;
        }

        return guild;
    }
}