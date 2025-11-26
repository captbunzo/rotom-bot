import { type DataSourceOptions } from 'typeorm';
import { databaseConfig } from '@/config/database.config';

export const dataSourceOptions: DataSourceOptions = {
    type: 'mysql',
    host: databaseConfig.host,
    port: databaseConfig.port,
    username: databaseConfig.user,
    password: databaseConfig.password,
    database: databaseConfig.database,

    // synchronize: true,
    // logger: 'debug',

    // entities: ['src/database/entities/*.ts'],
    // subscribers: ['src/database/subscribers/*.ts'],

    // // TODO - Add migrations later
    // migrations: [],
};
