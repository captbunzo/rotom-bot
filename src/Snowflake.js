
// Load external classes
import { SnowflakeUtil } from 'discord.js';

export default class Snowflake {
    static generate() {
        return SnowflakeUtil.generate();
    }
}
