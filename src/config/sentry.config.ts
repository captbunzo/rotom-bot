import { rawConfig } from './types/raw.config.js';

export interface SentryConfig {
    dsn: string;
    tracesSampleRate: number;
    triggerSampleAlerts: boolean;
    release: string;
}

export const sentryConfig: SentryConfig = {
    dsn: rawConfig.getStringParameter('sentry', 'dsn'),
    tracesSampleRate: rawConfig.getNumberParameter('sentry', 'tracesSampleRate'),
    triggerSampleAlerts: rawConfig.getBooleanParameter('sentry', 'triggerSampleAlerts'),
    release: rawConfig.getStringParameter('sentry', 'release'),
};
