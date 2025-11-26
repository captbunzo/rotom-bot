// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import configData from '@root/config.json' with { type: 'json' };

import {
    ConfigSectionNotFoundError,
    ConfigNotFoundError,
    ConfigStringTypeError,
    ConfigNumberTypeError,
    ConfigBooleanTypeError,
} from './errors.js';

interface RawConfig {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;

    validateSection: (section: string) => void;
    getStringParameter: (section: string, parameter: string) => string;
    getNumberParameter: (section: string, parameter: string) => number;
    getBooleanParameter: (section: string, parameter: string) => boolean;

    getOptionalStringParameter: (section: string, parameter: string) => string | undefined;
    getOptionalNumberParameter: (section: string, parameter: string) => number | undefined;
    getOptionalBooleanParameter: (section: string, parameter: string) => boolean | undefined;
}

export const rawConfig: RawConfig = {
    ...configData,

    validateSection: (section: string) => {
        if (!(section in rawConfig)) {
            throw new ConfigSectionNotFoundError(section);
        }

        if (typeof rawConfig[section] !== 'object') {
            throw new ConfigSectionNotFoundError(section);
        }
    },

    getStringParameter: (section: string, parameter: string): string => {
        rawConfig.validateSection(section);

        if (!(parameter in rawConfig[section])) {
            throw new ConfigNotFoundError(parameter, section);
        }

        if (typeof rawConfig[section][parameter] !== 'string') {
            throw new ConfigStringTypeError(parameter, rawConfig[section][parameter], section);
        }

        return rawConfig[section][parameter];
    },

    getNumberParameter: (section: string, parameter: string): number => {
        rawConfig.validateSection(section);

        if (!(parameter in rawConfig[section])) {
            throw new ConfigNotFoundError(parameter, section);
        }

        if (typeof rawConfig[section][parameter] !== 'number') {
            throw new ConfigNumberTypeError(parameter, rawConfig[section][parameter], section);
        }

        return rawConfig[section][parameter];
    },

    getBooleanParameter: (section: string, parameter: string): boolean => {
        rawConfig.validateSection(section);

        if (!(parameter in rawConfig[section])) {
            throw new ConfigNotFoundError(parameter, section);
        }

        if (typeof rawConfig[section][parameter] !== 'boolean') {
            throw new ConfigBooleanTypeError(parameter, rawConfig[section][parameter], section);
        }

        return rawConfig[section][parameter];
    },

    getOptionalStringParameter: (section: string, parameter: string): string | undefined => {
        rawConfig.validateSection(section);

        if (!(parameter in rawConfig[section])) {
            return undefined;
        }

        if (typeof rawConfig[section][parameter] !== 'string') {
            throw new ConfigStringTypeError(parameter, rawConfig[section][parameter], section);
        }

        return rawConfig[section][parameter];
    },

    getOptionalNumberParameter: (section: string, parameter: string): number | undefined => {
        rawConfig.validateSection(section);

        if (!(parameter in rawConfig[section])) {
            return undefined;
        }

        if (typeof rawConfig[section][parameter] !== 'number') {
            throw new ConfigNumberTypeError(parameter, rawConfig[section][parameter], section);
        }

        return rawConfig[section][parameter];
    },

    getOptionalBooleanParameter: (section: string, parameter: string): boolean | undefined => {
        rawConfig.validateSection(section);

        if (!(parameter in rawConfig[section])) {
            return undefined;
        }

        if (typeof rawConfig[section][parameter] !== 'boolean') {
            throw new ConfigBooleanTypeError(parameter, rawConfig[section][parameter], section);
        }

        return rawConfig[section][parameter];
    },
};
