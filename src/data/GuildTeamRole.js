
import client from '#src/Client.js';
import DatabaseTable from '#src/types/DatabaseTable.js';

export default class GuildTeamRole extends DatabaseTable {
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
    
    /**
     * Get GuildTeamRole(s) based on a given set of conditions in an optional order.
     * @param {object} [conditions] The criteria for the GuildTeamRole(s) to retrieve
     * @param {object} [orderBy] The order in which the GuildTeamRole(s) will be returned
     * @returns {Promise<GuildTeamRole|GuildTeamRole[]>} The GuildTeamRole(s) retrieved
     */
    static async get(conditions = {}, orderBy = this.schema.orderBy) {
        if (typeof conditions == 'object' && conditions.id && conditions.unique) {
            return await super.get(conditions, orderBy);
        }
        
        return await super.get(conditions, orderBy);
    }
    
    // ******************** //
    // * Instance Methods * //
    // ******************** //

    async update(condition = { guildId: this.guildId, team: this.team }) {
        await DatabaseTable.prototype.update.call(this, condition);
    }

    async delete(condition = { guildId: this.guildId, team: this.team }) {
        await DatabaseTable.prototype.delete.call(this, condition);
    }
}
