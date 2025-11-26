import debugFunction from 'debug';
import path from 'node:path';

// TODO - Consider extending this to support modules (route, controller, etc) -- But probably not needed
const log = debugFunction('komunifi-api:log');
const error = debugFunction('komunifi-api:error');
const info = debugFunction('komunifi-api:info');
const debug = debugFunction('komunifi-api:debug');

// TODO - Consider renaming this to Logger or StackLogger or something

// interface StackConstructorProps {
//     stack?: string[] | string;
//     filename?: string;
// }

export class Stack {
    private stack: string[];

    constructor(stack: string[] | string | object) {
        if (typeof stack === 'string') {
            this.stack = [stack];
            return;
        }

        if (Array.isArray(stack)) {
            this.stack = stack;
            return;
        }

        if ('filename' in stack && typeof stack.filename === 'string') {
            const filename = stack.filename;
            const parentDirectory = path.basename(path.dirname(filename));
            const filenameOnly = path.basename(filename, path.extname(filename));

            this.stack = [`${parentDirectory}/${filenameOnly}`];
            return;
        }

        throw new Error(
            'Stack constructor requires a string, array of strings, or import.meta (object with filename property)'
        );
    }

    toString() {
        if (Array.isArray(this.stack)) {
            return this.stack.join(' -> ');
        }
        return this.stack;
    }

    here(item: string) {
        return new Stack([...this.stack, item]);
    }

    ping() {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    log(...parameters: any[]) {
        if (parameters.length > 1) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            log(`${this.here(parameters[0])} :`, parameters.slice(1));
        } else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            log(`${this} :`, ...parameters);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error(...parameters: any[]) {
        if (parameters.length > 1) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            error(`${this.here(parameters[0])} :`, parameters.slice(1));
        } else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            error(`${this} :`, ...parameters);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    info(...parameters: any[]) {
        if (parameters.length > 1) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            info(`${this.here(parameters[0])} :`, parameters.slice(1));
        } else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            info(`${this} :`, ...parameters);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debug(...parameters: any[]) {
        if (parameters.length > 1) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            debug(`${this.here(parameters[0])} :`, parameters.slice(1));
        } else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            debug(`${this} :`, ...parameters);
        }
    }
}
