/**
 * Error thrown when an entity is not found in the database
 */
export class EntityNotFoundError extends Error {
    public readonly entityType: string;
    public readonly identifier: string | number | Record<string, unknown>;

    constructor(entityType: string, identifier: string | number | Record<string, unknown>) {
        const identifierString =
            typeof identifier === 'object' ? JSON.stringify(identifier) : identifier.toString();

        super(`${entityType} with identifier ${identifierString} not found`);

        this.name = 'EntityNotFoundError';
        this.entityType = entityType;
        this.identifier = identifier;
    }
}
