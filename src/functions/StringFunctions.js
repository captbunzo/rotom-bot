
// Load external modules
//const MessageMentions = require('discord.js').MessageMentions;
import { MessageMentions } from 'discord.js';

const StringFunctions = {};

StringFunctions.camelToSnakeCase = (str) => {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

StringFunctions.snakeToCamelCase = (str) => {
    return str.replace( /([-_][a-z])/g, (group) => group.toUpperCase().replace('_', '') );
};

StringFunctions.capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

StringFunctions.titleCase = (str) => {
    return str.replace(/\w\S*/g,
        function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
};

StringFunctions.makeId = (length) => {
   let result        = '';
   const chars       = 'ABCDEFGHJKLMNPQRSTUVWXYZ3456789';
   const charsLength = chars.length;
   for ( var i = 0; i < length; i++ ) {
      result += chars.charAt(Math.floor(Math.random() * charsLength));
   }
   return result;
};

StringFunctions.makeInviteCode = () => {
    return this.makeId(6);
};

StringFunctions.trimCleanseArgs = (value) => {
    return value.replace(/^'(.+)'$/g, '$1').replace(/^"(.+)"$/g, '$1');
};

StringFunctions.joinTrimCleanseArgs = (args) => {
    return this.trimCleanseArgs(args.join(' '));
};

const SNOWFLAKE_PATTERN = /[\d]{17,20}/;
StringFunctions.SNOWFLAKE_PATTERN = SNOWFLAKE_PATTERN;
StringFunctions.CHANNELS_PATTERN = MessageMentions.CHANNELS_PATTERN;
StringFunctions.EVERYONE_PATTERN = MessageMentions.EVERYONE_PATTERN;
StringFunctions.ROLES_PATTERN    = MessageMentions.ROLES_PATTERN;
StringFunctions.USERS_PATTERN    = MessageMentions.USERS_PATTERN;

StringFunctions.getSnowflakeId = (mention) => {
    const matches = mention.match(SNOWFLAKE_PATTERN);
    if (matches.length > 0) {
        return matches[0];
    }
}

StringFunctions.INDENT = '    ';
StringFunctions.ZWSP = '\u200b';

export default StringFunctions;
