import { rawConfig } from './types/raw.config.js';

export enum DatabaseClient {
    mysql = 'mysql',
    postgres = 'postgres',
    cockroachdb = 'cockroachdb',
}

export interface DatabaseConfig {
    client: DatabaseClient;
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    sslmode?: string;
}

const client = rawConfig.getStringParameter('database', 'client');
if (!Object.values(DatabaseClient).includes(client as DatabaseClient)) {
    throw new Error(`Invalid database client: ${client}`);
}

export const databaseConfig: DatabaseConfig = {
    client: rawConfig.getStringParameter('database', 'client') as DatabaseClient,
    host: rawConfig.getStringParameter('database', 'host'),
    port: rawConfig.getNumberParameter('database', 'port'),
    database: rawConfig.getStringParameter('database', 'name'),
    user: rawConfig.getStringParameter('database', 'user'),
    password: rawConfig.getStringParameter('database', 'password'),
};

const sslMode = rawConfig.getOptionalStringParameter('database', 'sslmode');
if (sslMode) {
    databaseConfig.sslmode = sslMode;
}
