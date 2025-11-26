import { rawConfig } from './types/raw.config.js';

export interface AppConfig {
    environment: string;
    collectorTimeoutSecs: number;
    messagePurgeDelaySecs: number;
    schedulerLoopSecs: number;
}

export const appConfig: AppConfig = {
    environment: rawConfig.getStringParameter('app', 'environment'),
    collectorTimeoutSecs: rawConfig.getNumberParameter('app', 'collectorTimeoutSecs'),
    messagePurgeDelaySecs: rawConfig.getNumberParameter('app', 'messagePurgeDelaySecs'),
    schedulerLoopSecs: rawConfig.getNumberParameter('app', 'schedulerLoopSecs'),
};
