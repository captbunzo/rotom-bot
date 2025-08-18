import {
    EmbedBuilder,
    channelMention,
    SnowflakeUtil,
    roleMention
} from 'discord.js';

import {
    type DrossTableConditions,
    type DrossTableData,
    DrossDatabaseTable,
    DrossFieldType,
} from '@drossjs/dross-database';

import Translation from '#src/models/Translation.js';

export interface GuildBattleAlertData extends DrossTableData {
    id: string;
    guildId: string;
    roleId: string;
    channelId?: string | null;
    bossType?: string | null;
    tier?: number | null;
    isMega?: boolean | null;
    isShadow?: boolean | null;
}

export interface GuildBattleAlertConditions extends DrossTableConditions {
    id?: string;
    guildId?: string;
    roleId?: string;
    channelId?: string | null;
    bossType?: string | null;
    tier?: number | null;
    isMega?: boolean | null;
    isShadow?: boolean | null;
}

export default class GuildBattleAlert extends DrossDatabaseTable {
    static override schema = this.parseSchema({
        tableName: 'guild_battle_alert',
        orderBy: ['id'],
        fields: {
            'id':         { type: DrossFieldType.Snowflake, nullable: false },
            'guild_id':   { type: DrossFieldType.Snowflake, nullable: false },
            'role_id':    { type: DrossFieldType.Snowflake, nullable: false },
            'channel_id': { type: DrossFieldType.Snowflake, nullable: true },
            'boss_type':  { type: DrossFieldType.String,    nullable: true, length: 10 },
            'tier':       { type: DrossFieldType.TinyInt,   nullable: true, unsigned: true },
            'is_mega':    { type: DrossFieldType.TinyInt,   nullable: true, unsigned: true },
            'is_shadow':  { type: DrossFieldType.TinyInt,   nullable: true, unsigned: true }
        },
        primaryKey: ['id']
    });
    
    constructor(data: GuildBattleAlertData) {
        super(data);
    }
    
    /***********
     * Getters *
     ***********/

    get id        (): string         { return this.getField('id'); }
    get guildId   (): string         { return this.getField('guildId'); }
    get roleId    (): string         { return this.getField('roleId'); }
    get channelId (): string  | null { return this.getField('channelId'); }
    get bossType  (): string  | null { return this.getField('bossType'); }
    get tier      (): number  | null { return this.getField('tier'); }
    get isMega    (): boolean | null { return this.getField('isMega'); }
    get isShadow  (): boolean | null { return this.getField('isShadow'); }

    /***********
     * Setters *
     ***********/

    set id        (value: string        ) { this.setField('id', value); }
    set guildId   (value: string        ) { this.setField('guildId', value); }
    set roleId    (value: string        ) { this.setField('roleId', value); }
    set channelId (value: string  | null) { this.setField('channelId', value); }
    set bossType  (value: string  | null) { this.setField('bossType', value); }
    set tier      (value: number  | null) { this.setField('tier', value); }
    set isMega    (value: boolean | null) { this.setField('isMega', value); }
    set isShadow  (value: boolean | null) { this.setField('isShadow', value); }

    /**************************
     * Class Method Overrides *
     **************************/

    static override async get(conditions: GuildBattleAlertConditions = {}, orderBy = this.schema.orderBy) {
        return await super.get(conditions, orderBy) as GuildBattleAlert[];
    }

    static override async getUnique(conditions: GuildBattleAlertConditions = {}) {
        return await super.getUnique(conditions) as GuildBattleAlert | null;
    }

    /*****************************
     * Instance Method Overrides *
     *****************************/

    override async create() {  
        if (!this.id) {
            this.id = SnowflakeUtil.generate().toString();
        }
        
        await DrossDatabaseTable.prototype.create.call(this);
    }

    override async update(condition: GuildBattleAlertConditions = { id: this.id }) {
        await DrossDatabaseTable.prototype.update.call(this, condition);
    }

    override async delete(condition: GuildBattleAlertConditions = { id: this.id }) {
        await DrossDatabaseTable.prototype.delete.call(this, condition);
    }

    /*****************
     * Class Methods *
     *****************/

    /********************
     * Instance Methods *
     ********************/

    async buildEmbed(): Promise<EmbedBuilder> {
        this.database.logger.debug(`Guild Battle Record =`);
        this.database.logger.dump(this);

        const color = 0x595761;
      //const channelText  = (this.channelId !== null) ? channelMention(this.channelId) : 'All';
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