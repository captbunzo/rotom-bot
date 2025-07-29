
import {
    EmbedBuilder,
    MessageFlags
} from 'discord.js';

import client from '#src/Client.js';

import {
    Team,
    TeamColor
} from '#src/Constants.js';

import DatabaseTable from '#src/types/DatabaseTable.js';

export default class Trainer extends DatabaseTable {
    static schema = this.parseSchema({
        tableName: 'trainer',
        orderBy: ['trainer_name'],
        fields: {
            'id':               { type: 'snowflake', nullable: false },
            'trainer_name':     { type: 'string',    nullable: false, length: 32 },
            'first_name':       { type: 'string',    nullable: true,  length: 32 },
            'code':             { type: 'string',    nullable: true,  length: 12 },
            'level':            { type: 'integer',   nullable: true },
            'team':             { type: 'string',    nullable: true,  length: 8 },
            'about_me':         { type: 'string',    nullable: true,  length: 256 },
            'favorite_pokemon': { type: 'string',    nullable: true,  length: 24 }
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
    get trainerName     () { return this.getField('trainer_name'); }
    get firstName       () { return this.getField('first_name'); }
    get code            () { return this.getField('code'); }
    get level           () { return this.getField('level'); }
    get team            () { return this.getField('team'); }
    get favoritePokemon () { return this.getField('favoritePokemon'); }

    get formattedCode() {
        return this.code.match(/.{1,4}/g).join(' ').trim();
    }
    
    // *********** //
    // * Setters * //
    // *********** //
    
    set id              (value) { this.setField('id', value); }
    set trainerName     (value) { this.setField('trainer_name', value); }
    set firstName       (value) { this.setField('first_name', value); }
    set code            (value) { this.setField('code', value); }
    set level           (value) { this.setField('level', value); }
    set team            (value) { this.setField('team', value); }
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
    
    static async getTrainerNameChoices(namePrefix, conditions = {}) {
        return await this.getChoices('trainerName', namePrefix, conditions);
    }

    static getSetupTrainerFirstMessage() {
        return {
            content: `Please setup your profile first with /setup-profile`,
            flags: MessageFlags.Ephemeral
        };
    }

    // ******************** //
    // * Instance Methods * //
    // ******************** //
    
    async buildEmbed() {
        client.logger.debug(`Trainer Record =`);
        client.logger.dump(this);

        const color = this.team == Team.Instinct ? TeamColor.Instinct :
                      this.team == Team.Mystic   ? TeamColor.Mystic :
                      this.team == Team.Valor    ? TeamColor.Valor :
                      0x595761;

        let embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(`${this.trainerName}'s Profile`)
            .setDescription(`Trainer Code: ${this.formattedCode}`)
            .addFields(
                { name: 'First Name', value: this.firstName ?? 'N/A', inline: true },
                { name: 'Team', value: this.team ?? 'N/A', inline: true },
                { name: 'Level', value: this.level ? this.level.toString() : 'N/A', inline: true }
            )
            .addFields(
                { name: 'Favorite Pokemon', value: this.favoritePokemon ?? 'N/A' }
            );
        
        return embed;
    }
}
