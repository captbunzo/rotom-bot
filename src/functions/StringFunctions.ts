
export default class StringFunctions {
    static camelToSnakeCase(str: string) {
        return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    }

    static snakeToCamelCase(str: string) {
        return str.replace( /([-_][a-z])/g, (group) => group.toUpperCase().replace('_', '') );
    }

    static capitalize(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    static titleCase(str: string) {
        return str.replace(/\w\S*/g,
            function(txt: string) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
    }

    static makeId(length: number) {
        let result  = '';
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ3456789';
        const charsLength = chars.length;

        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * charsLength));
        }

        return result;
    }

    static makeInviteCode() {
        return this.makeId(6);
    }

    static trimCleanseArgs(value: string) {
        return value.replace(/^'(.+)'$/g, '$1').replace(/^"(.+)"$/g, '$1');
    }

    static joinTrimCleanseArgs(args: string[]) {
        return this.trimCleanseArgs(args.join(' '));
    }

    static getPrefix(words: string[]): string | null {
        if (words.length === 0) {
            return null;
        }

        const firstWord = words[0];

        // Check border cases size 1 array and empty first word)
        if (!firstWord || words.length == 1)
            return firstWord || '';

        // While all words have the same character at position i, increment i
        let i = 0;
        while (firstWord[i] && words.every(w => w[i] === firstWord[i])) {
            i++;
        }

        /*
        while (words[0][i] && words.every(w => w[i] === words[0][i])) {
            i++;
        }
        */

        // Prefix is the substring from the beginning to the last successfully checked i
        return firstWord.slice(0, i);
    };

    static INDENT = '    ';
    static ZWSP = '\u200b';
}
