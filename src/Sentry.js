
// Load external classes
import * as Sentry from '@sentry/node';
import Tracing from '@sentry/tracing';

export function init(config) {
    Sentry.init({
        dsn: config.sentry.dsn,
        environment: config.environment,
        release: 'rotom-bot@1.00.00',
        
        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: config.sentry.tracesSampleRate,
    });
    
    if (config.sentry.triggerSampleAlerts) {
        const transaction = Sentry.startTransaction({
            op: 'test',
            name: 'My First Test Transaction',
        });
        
        setTimeout(() => {
            try {
                foo();
            } catch (e) {
                Sentry.captureException(e);
            } finally {
                transaction.finish();
            }
        }, 99);
    }
};
