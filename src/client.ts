import BotConfig from '@root/config.json' with { type: 'json' };

import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import DrossLogger from '@drossjs/dross-logger';

import {
    Client as DiscordClient,
    REST as DiscordREST,
    GatewayIntentBits,
    Routes,
} from 'discord.js';

import { type Snowflake, Collection, Guild } from 'discord.js';

// import ComponentIndex from '@/types/ComponentIndex.js';
// import { PokedexRegisteryIndex } from '@/components/compound/PokedexRegisteryComponent.js';

//export interface ClientInterface extends Discord.Client {
//    logger: DrossLogger;
//}

// TODO - If this singleton works, turn DrossLogger into a singleton

export class Client extends DiscordClient {
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
            intents: [GatewayIntentBits.Guilds],
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
    public colorizeAlias = this.chalk.cyan;
    public colorizeAction = this.chalk.yellow;

    public commands: Collection<string, any> = new Collection();
    public buttons: Collection<string, any> = new Collection();
    public modals: Collection<string, any> = new Collection();
    public selects: Collection<string, any> = new Collection();

    /*****************************
     * Initialize Discord Client *
     *****************************/

    async init() {
        // Load commands and events
        await this.loadCommands();
        await this.loadComponents();
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
        const guildCommandsJSON = [];

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
                this.logger.log(
                    `Loading ${globalCommandsJSON.length} global application (/) commands`
                );

                const globalCommandDeploymentResults: any = await discordREST.put(
                    Routes.applicationCommands(this.config.client_id),
                    { body: globalCommandsJSON }
                );

                this.logger.log(
                    `Successfully loaded ${globalCommandDeploymentResults.length} global application (/) commands`
                );

                // Use the put method to fully refresh all guild commands with the current set
                this.logger.log(
                    `Loading ${guildCommandsJSON.length} guild application (/) commands`
                );

                const guildCommandDeploymentResults: any = await discordREST.put(
                    Routes.applicationGuildCommands(
                        this.config.client_id,
                        this.config.bot_guild_id
                    ),
                    { body: guildCommandsJSON }
                );

                this.logger.log(
                    `Successfully loaded ${guildCommandDeploymentResults.length} guild application (/) commands`
                );
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
            const commandFiles = fs
                .readdirSync(commandsPath)
                .filter((file) => file.endsWith('.ts'));

            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const cmdFilePath = filePath.replace(/^(src\/)/, './');
                const { default: command } = await import(cmdFilePath);

                // Set a new item in the Collection with the key as the command name and the value as the exported module
                if ('data' in command && 'execute' in command) {
                    this.logger.log(`  -> ${command.data.name}`);
                    this.commands.set(command.data.name, command);
                } else {
                    this.logger.error(
                        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
                    );
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
        const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.ts'));

        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const eventFilePath = filePath.replace(/^(src\/)/, './');
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

    /*******************
     * Load Components *
     *******************/

    async loadComponents() {
        this.logger.log('Loading components');

        this.buttons = new Collection();
        this.modals = new Collection();
        this.selects = new Collection();

        const componentPaths = [
            './src/components/compound',
            './src/components/buttons',
            './src/components/selects',
            './src/components/modals',
        ];

        for (const componentsPath of componentPaths) {
            const theseComponentFiles = fs
                .readdirSync(componentsPath)
                .filter((file) => file.endsWith('.ts'));

            for (const file of theseComponentFiles) {
                const filePath = path.join(componentsPath, file);
                const componentFilePath = filePath.replace(/^(src\/)/, './');
                const { default: component } = await import(componentFilePath);

                if (component.handleButton) {
                    this.logger.log(`  -> button -> ${component.name}`);
                    this.buttons.set(component.name, component);
                }

                if (component.handleModalSubmit) {
                    this.logger.log(`  -> modal  -> ${component.name}`);
                    this.modals.set(component.name, component);
                }

                if (component.handleStringSelectMenu) {
                    this.logger.log(`  -> select -> ${component.name}`);
                    this.selects.set(component.name, component);
                }
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
