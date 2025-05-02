
import {
    MessageMentions
} from 'discord.js';

export default class StringFunctions {
    static camelToSnakeCase(str) {
        return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    }

    static snakeToCamelCase(str) {
        return str.replace( /([-_][a-z])/g, (group) => group.toUpperCase().replace('_', '') );
    }

    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    static titleCase(str) {
        return str.replace(/\w\S*/g,
            function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
    }

    static makeId(length) {
        let result  = '';
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ3456789';
        const charsLength = chars.length;

        for ( var i = 0; i < length; i++ ) {
            result += chars.charAt(Math.floor(Math.random() * charsLength));
        }

        return result;
    }

    static makeInviteCode() {
        return this.makeId(6);
    }

    static trimCleanseArgs(value) {
        return value.replace(/^'(.+)'$/g, '$1').replace(/^"(.+)"$/g, '$1');
    }

    static joinTrimCleanseArgs(args) {
        return this.trimCleanseArgs(args.join(' '));
    }

    static getPrefix(words) {
        // Check border cases size 1 array and empty first word)
        if (!words[0] || words.length ==  1)
            return words[0] || '';

        let i = 0;

        // While all words have the same character at position i, increment i
        while (words[0][i] && words.every(w => w[i] === words[0][i]))
            i++;

        // Prefix is the substring from the beginning to the last successfully checked i
        return words[0].slice(0, i);
    };

    static SNOWFLAKE_PATTERN = /[\d]{17,20}/;
    static SNOWFLAKE_PATTERN = this.SNOWFLAKE_PATTERN;
    static CHANNELS_PATTERN = MessageMentions.ChannelsPattern;
    static EVERYONE_PATTERN = MessageMentions.EveryonePattern;
    static ROLES_PATTERN    = MessageMentions.RolesPattern;
    static USERS_PATTERN    = MessageMentions.UsersPattern;

    static getSnowflakeId (mention) {
        const matches = mention.match(SNOWFLAKE_PATTERN);
        if (matches.length > 0) {
            return matches[0];
        }
    }

    static INDENT = '    ';
    static ZWSP = '\u200b';
}
