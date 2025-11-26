import { init as SentryInit } from '@sentry/node';
import { config } from '@/config';

// TODO - Turn this into a dross package
// TODO - Create a config file

export const Sentry = {
    init() {
        SentryInit({
            dsn: config.sentry.dsn,
            environment: config.app.environment,
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
    },
};
