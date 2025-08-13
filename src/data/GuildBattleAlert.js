
import {
    EmbedBuilder,
    channelMention,
    SnowflakeUtil,
    roleMention
} from 'discord.js';

import {
    DrossDatabase,
    DrossDatabaseTable
} from '@drossjs/dross-database';

import Translation from '#src/data/Translation.js';

class GuildBattleAlert extends DrossDatabaseTable {
    static schema = this.parseSchema({
        tableName: 'guild_battle_alert',
        orderBy: ['id'],
        fields: {
            'id':         { type: 'snowflake', nullable: false },
            'guild_id':   { type: 'snowflake', nullable: false },
            'role_id':    { type: 'snowflake', nullable: false },
            'channel_id': { type: 'snowflake', nullable: true },
            'boss_type':  { type: 'string',    nullable: true, length: 10 },
            'tier':       { type: 'tinyint',   nullable: true, unsigned: true },
            'is_mega':    { type: 'tinyint',   nullable: true, unsigned: true },
            'is_shadow':  { type: 'tinyint',   nullable: true, unsigned: true }
        },
        primaryKey: ['id']
    });
    
    constructor(data) {
        super(data);
    }
    
    // *********** //
    // * Getters * /
    // *********** //

    get id        () { return this.getField('id'); }
    get guildId   () { return this.getField('guildId'); }
    get roleId    () { return this.getField('roleId'); }
    get channelId () { return this.getField('channelId'); }
    get bossType  () { return this.getField('bossType'); }
    get tier      () { return this.getField('tier'); }
    get isMega    () { return this.getField('isMega'); }
    get isShadow  () { return this.getField('isShadow'); }

    // *********** //
    // * Setters * //
    // *********** //

    set id        (value) { this.setField('id', value); }
    set guildId   (value) { this.setField('guildId', value); }
    set roleId    (value) { this.setField('roleId', value); }
    set channelId (value) { this.setField('channelId', value); }
    set bossType  (value) { this.setField('bossType', value); }
    set tier      (value) { this.setField('tier', value); }
    set isMega    (value) { this.setField('isMega', value); }
    set isShadow  (value) { this.setField('isShadow', value); }

    // ***************** //
    // * Class Methods * //
    // ***************** //
    
    // ******************** //
    // * Instance Methods * //
    // ******************** //

    async create() {  
        if (!this.id) {
            this.id = SnowflakeUtil.generate();
        }
        
        await DrossDatabaseTable.prototype.create.call(this);
    }
    
    async buildEmbed() {
        DrossDatabase.logger.debug(`Guild Battle Record =`);
        DrossDatabase.logger.dump(this);

        const color = 0x595761;
        const channelText  = (this.channelId !== null) ? channelMention(this.channelId) : 'All';
        const bossTypeText = (this.bossType  !== null) ? Translation.getBossTypeName(this.bossType) : 'All';
        const tierText     = (this.tier      !== null) ? `${this.tier}` : 'All';
        const megaText     = (this.isMega    !== null) ? (this.isMega ? 'Yes' : 'No') : 'N/A';
        const shadowText   = (this.isShadow  !== null) ? (this.isShadow ? 'Yes' : 'No') : 'N/A';

        let embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(`Battle Alert ID: ${this.id}`)
            .setDescription(`The following role will be alerted for battles meeting these criteria:`)
            .addFields(
                { name: 'Role', value: roleMention(this.roleId), inline: true },
                { name: 'Channel', value: (this.channelId !== null) ? channelMention(this.channelId) : 'None', inline: true },
            )
            .addFields(
                { name: 'Boss Type', value: bossTypeText, inline: true },
                { name: 'Tier', value: tierText, inline: true },
            )
            .addFields(
                { name: 'Mega', value: megaText, inline: true },
                { name: 'Shadow', value: shadowText, inline: true }
            );
        
        return embed;
    }
}

export default GuildBattleAlert;
