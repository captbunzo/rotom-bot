import 'reflect-metadata';
import { DataSource, type DataSourceOptions } from 'typeorm';

import { databaseConfig, DatabaseClient } from '@/config/database.config';

import { Stack } from '@/types/stack';
const moduleStack = new Stack(import.meta);

/**********************************
 * Set up the data source options *
 **********************************/

let dataSourceOptions: DataSourceOptions;

switch (databaseConfig.client) {
    case DatabaseClient.mysql: {
        dataSourceOptions = await import('./options/mysql.options.js').then(
            (module) => module.dataSourceOptions
        );
        break;
    }
    case DatabaseClient.postgres: {
        dataSourceOptions = await import('./options/postgres.options.js').then(
            (module) => module.dataSourceOptions
        );
        break;
    }
    case DatabaseClient.cockroachdb: {
        dataSourceOptions = await import('./options/cockroachdb.options.js').then(
            (module) => module.dataSourceOptions
        );
        break;
    }
    default: {
        throw new Error(`Unsupported database client: ${databaseConfig.client}`);
    }
}

dataSourceOptions = {
    ...dataSourceOptions,
    synchronize: true,
    logger: 'debug',

    entities: ['src/database/entities/*.ts'],
    subscribers: ['src/database/subscribers/*.ts'],

    // TODO - Add migrations later
    migrations: [],
};

/*******************************************
 * Create the datasource and init function *
 *******************************************/

export const dataSource = new DataSource(dataSourceOptions);

export const dataSourceInit = async () => {
    const stack = moduleStack.here('datasourceInit()');
    stack.log('Initializing datasource');

    try {
        await dataSource.initialize();
        stack.log('Datasource initialized');
    } catch (error: unknown) {
        stack.error('Error during Data Source initialization:', error);
        throw error;
    }
};
