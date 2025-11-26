import { rawConfig } from './types/raw.config.js';

export interface LogConfig {
    level: string;
    sql: boolean;
}

export const logConfig: LogConfig = {
    level: rawConfig.getStringParameter('log', 'level'),
    sql: rawConfig.getBooleanParameter('log', 'sql'),
};
