import { init as SentryInit } from '@sentry/node';

// TODO - Turn this into a dross package
// TODO - Create a config file

export default class Sentry {
    static init(config: any) {
        SentryInit({
            dsn: config.sentry.dsn,
            environment: config.environment,
            release: config.sentry.release,
            
            
            // Set tracesSampleRate to 1.0 to capture 100%
            // of transactions for performance monitoring.
            // We recommend adjusting this value in production
            tracesSampleRate: config.sentry.tracesSampleRate,
        });
    
        /*
        if (config.sentry.triggerSampleAlerts) {
            const transaction = Sentry.startTransaction({
                op: 'test',
                name: 'My First Test Transaction',
            });
            
            setTimeout(() => {
                try {
                    // @ts-ignore
                    foo();
                } catch (e) {
                    Sentry.captureException(e);
                } finally {
                    transaction.finish();
                }
            }, 99);
        }
        */
    }
}