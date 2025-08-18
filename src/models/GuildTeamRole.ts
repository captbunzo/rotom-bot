import {
    type DrossTableConditions,
    type DrossTableData,
    DrossDatabaseTable,
    DrossFieldType,
} from '@drossjs/dross-database';

export interface GuildTeamRoleData extends DrossTableData {
    guildId: string;
    team: string;
    roleId: string;
}

export interface GuildTeamRoleConditions extends DrossTableConditions {
    guildId?: string;
    team?: string;
    roleId?: string;
}

export default class GuildTeamRole extends DrossDatabaseTable {
    static override schema = this.parseSchema({
        tableName: 'guild_team_role',
        orderBy: ['guild_id', 'team'],
        fields: {
            'guild_id': { type: DrossFieldType.Snowflake, nullable: false },
            'team':     { type: DrossFieldType.String,    nullable: false, length: 8 },
            'role_id':  { type: DrossFieldType.Snowflake, nullable: false }
        },
        primaryKey: ['guild_id', 'team']
    });

    constructor(data: GuildTeamRoleData) {
        super(data);
    }
    
    /***********
     * Getters *
     ***********/

    get guildId (): string { return this.getField('guildId'); }
    get team    (): string { return this.getField('team'); }
    get roleId  (): string { return this.getField('roleId'); }

    /***********
     * Setters *
     ***********/

    set guildId (value: string) { this.setField('guildId', value); }
    set team    (value: string) { this.setField('team', value); }
    set roleId  (value: string) { this.setField('roleId', value); }

    /**************************
     * Class Method Overrides *
     **************************/

    static override async get(conditions: GuildTeamRoleConditions = {}, orderBy = this.schema.orderBy) {
        return await super.get(conditions, orderBy) as GuildTeamRole[];
    }

    static override async getUnique(conditions: GuildTeamRoleConditions = {}) {
        return await super.getUnique(conditions) as GuildTeamRole | null;
    }

    /*****************************
     * Instance Method Overrides *
     *****************************/

    override async update(condition: GuildTeamRoleConditions = { guildId: this.guildId, team: this.team }) {
        await DrossDatabaseTable.prototype.update.call(this, condition);
    }

    override async delete(condition: GuildTeamRoleConditions = { guildId: this.guildId, team: this.team }) {
        await DrossDatabaseTable.prototype.delete.call(this, condition);
    }
}