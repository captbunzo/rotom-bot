
import { DrossDatabaseTable } from '@drossjs/dross-database';

class GuildTeamRole extends DrossDatabaseTable {
    static schema = this.parseSchema({
        tableName: 'guild_team_role',
        orderBy: ['guild_id', 'team'],
        fields: {
            'guild_id': { type: 'snowflake', nullable: false },
            'team':     { type: 'string',    nullable: false, length: 8 },
            'role_id':  { type: 'snowflake', nullable: false }
        },
        primaryKey: ['guild_id', 'team']
    });
    
    constructor(data) {
        super(data);
    }
    
    // *********** //
    // * Getters * //
    // *********** //

    get guildId () { return this.getField('guildId'); }
    get team    () { return this.getField('team'); }
    get roleId  () { return this.getField('roleId'); }

    // *********** //
    // * Setters * //
    // *********** //

    set guildId (value) { this.setField('guildId', value); }
    set team    (value) { this.setField('team', value); }
    set roleId  (value) { this.setField('roleId', value); }

    // ***************** //
    // * Class Methods * //
    // ***************** //
    
    // ******************** //
    // * Instance Methods * //
    // ******************** //

    async update(condition = { guildId: this.guildId, team: this.team }) {
        await DrossDatabaseTable.prototype.update.call(this, condition);
    }

    async delete(condition = { guildId: this.guildId, team: this.team }) {
        await DrossDatabaseTable.prototype.delete.call(this, condition);
    }
}

export default GuildTeamRole;
