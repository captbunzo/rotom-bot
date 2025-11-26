import { appConfig, type AppConfig } from './app.config';
import { battlesConfig, type BattlesConfig } from './battles.config';
import { databaseConfig, type DatabaseConfig } from './database.config';
import { discordConfig, type DiscordConfig } from './discord.config';
import { logConfig, type LogConfig } from './log.config';
import { sentryConfig, type SentryConfig } from './sentry.config';

interface Config {
    app: AppConfig;
    battles: BattlesConfig;
    database: DatabaseConfig;
    discord: DiscordConfig;
    log: LogConfig;
    sentry: SentryConfig;
}

export const config: Config = {
    app: appConfig,
    battles: battlesConfig,
    database: databaseConfig,
    discord: discordConfig,
    log: logConfig,
    sentry: sentryConfig,
};
