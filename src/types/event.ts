/**
 * Event Module Interface
 */
export interface EventModule {
    event: Event;
}

/**
 * Event Interface
 */
export interface Event {
    name: string;
    once: boolean;
    execute(...args: unknown[]): Promise<void> | void;
}
