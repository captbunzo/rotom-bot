export class ConfigSectionNotFoundError extends Error {
    constructor(section: string) {
        super(`Config section ${section} not found`);
        this.name = 'ConfigSectionNotFoundError';
    }
}

export class ConfigNotFoundError extends Error {
    constructor(parameter: string, section?: string) {
        super(`Config parameter ${section ? `${section}.` : ''}${parameter} not found`);
        this.name = 'ConfigNotFoundError';
    }
}

export class ConfigTypeError extends TypeError {
    constructor(parameter: string, expectedType: string, value: unknown, section?: string) {
        super(
            `Config parameter ${section ? `${section}.` : ''}${parameter} must be a ${expectedType}, but received ${typeof value} with value ${JSON.stringify(value)}`
        );
        this.name = 'ConfigTypeError';
    }
}

export class ConfigStringTypeError extends ConfigTypeError {
    constructor(parameter: string, value: unknown, section?: string) {
        super(parameter, 'string', value, section);
        this.name = 'ConfigStringTypeError';
    }
}

export class ConfigNumberTypeError extends ConfigTypeError {
    constructor(parameter: string, value: unknown, section?: string) {
        super(parameter, 'number', value, section);
        this.name = 'ConfigNumberTypeError';
    }
}

export class ConfigBooleanTypeError extends ConfigTypeError {
    constructor(parameter: string, value: unknown, section?: string) {
        super(parameter, 'boolean', value, section);
        this.name = 'ConfigBooleanTypeError';
    }
}
