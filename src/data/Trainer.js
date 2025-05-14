
import client from '../Client.js';

import {
    EmbedBuilder,
    MessageFlags
} from 'discord.js';

import {
    Team,
    TeamColor
} from '../Constants.js';

import DatabaseTable from '../DatabaseTable.js';

export default class Trainer extends DatabaseTable {
    static schema = this.parseSchema({
        tableName: 'trainer',
        orderBy: ['name'],
        fields: {
            'id':               { type: 'snowflake', nullable: false },
            'name':             { type: 'string',    nullable: false, length: 32 },
            'code':             { type: 'string',    nullable: true, length: 12 },
            'level':            { type: 'integer',   nullable: true },
            'team':             { type: 'string',    nullable: true, length: 8 },
            'about_me':         { type: 'string',    nullable: true, length: 256 },
            'favorite_pokemon': { type: 'string',    nullable: true, length: 24 }
        },
        primaryKey: ['id']
    });
    
    constructor(data) {
        super(data);
    }
    
    // *********** //
    // * Getters * //
    // *********** //

    get id              () { return this.getField('id'); }
    get name            () { return this.getField('name'); }
    get code            () { return this.getField('code'); }
    get level           () { return this.getField('level'); }
    get team            () { return this.getField('team'); }
    get aboutMe         () { return this.getField('aboutMe'); }
    get favoritePokemon () { return this.getField('favoritePokemon'); }

    get formattedCode() {
        return this.code.match(/.{1,4}/g).join(' ').trim();
    }
    
    // *********** //
    // * Setters * //
    // *********** //
    
    set id              (value) { this.setField('id', value); }
    set name            (value) { this.setField('name', value); }
    set code            (value) { this.setField('code', value); }
    set level           (value) { this.setField('level', value); }
    set team            (value) { this.setField('team', value); }
    set aboutMe         (value) { this.setField('aboutMe', value); }
    set favoritePokemon (value) { this.setField('favoritePokemon', value); }
    
    // ***************** //
    // * Class Methods * //
    // ***************** //
    
    //static parseConditions(conditions) {
    //    return conditions;
    //}
    
    /**
     * Get Trainer(s) based on a given set of conditions in an optional order.
     * @param {object} [conditions] The criteria for the Trainer(s) to retrieve
     * @param {object} [orderBy] The order in which the Trainer(s) will be returned
     * @returns {Promise<Trainer|Trainer[]>} The Trainer(s) retrieved
     */
    static async get(conditions = {}, orderBy = this.schema.orderBy) {
        if (typeof conditions == 'object' && conditions.id && conditions.unique) {
            return await super.get(conditions, orderBy);
        }
        
        return await super.get(conditions, orderBy);
    }
    
    static async getNameChoices(namePrefix, conditions = {}) {
        return await this.getChoices('name', namePrefix, conditions);
    }

    static getSetupTrainerFirstMessage() {
        return {
            content: `Please setup your profile first with /trainer profile`,
            flags: MessageFlags.Ephemeral
        };
    }

    // ******************** //
    // * Instance Methods * //
    // ******************** //
    
    async create() {  
        // If need be, retrieve the username
        if (!this.name) {
            const user = await client.users.fetch(this.id);
            if (user) this.name = user.name;
        }
        
        // Attempt to create it
        await DatabaseTable.prototype.create.call(this);
    }

    async buildEmbed() {
        client.logger.debug(`Trainer Record =`);
        client.logger.dump(this);

        const color = this.team == Team.Instinct ? TeamColor.Instinct :
                      this.team == Team.Mystic   ? TeamColor.Mystic :
                      this.team == Team.Valor    ? TeamColor.Valor :
                      0x595761;

        let embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(`${this.name}'s Profile`)
            .setDescription(`Trainer Code: ${this.formattedCode}`)
            .addFields(
                { name: 'Team', value: this.team ?? 'N/A', inline: true },
                { name: 'Level', value: this.level ? this.level.toString() : 'N/A', inline: true }
            )
            .addFields(
                { name: 'About Me', value: this.aboutMe ?? 'N/A' }
            )
            .addFields(
                { name: 'Favorite Pokemon', value: this.favoritePokemon ?? 'N/A' }
            );
        
        return embed;
    }
}
