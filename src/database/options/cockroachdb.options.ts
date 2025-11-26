import { type DataSourceOptions } from 'typeorm';
import { databaseConfig } from '@/config/database.config';

export const dataSourceOptions: DataSourceOptions = {
    type: 'cockroachdb',
    url: `postgresql://${databaseConfig.user}:${databaseConfig.password}@${databaseConfig.host}:${databaseConfig.port}/defaultdb?sslmode=${databaseConfig.sslmode}`,
    ssl: true,
    timeTravelQueries: false,

    // extra: {
    //     options: routingId,
    // },

    // synchronize: true,
    logger: 'debug',
    // entities: ['src/database/entities/*.ts'],
    // subscribers: ['src/database/subscribers/*.ts'],

    // // TODO - Add migrations later
    // migrations: [],
};
