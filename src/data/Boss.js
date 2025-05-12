
import client from '../Client.js';

import {
    EmbedBuilder
} from 'discord.js';

import DatabaseTable from '../DatabaseTable.js';
import MasterCPM     from './MasterCPM.js';
import MasterPokemon from './MasterPokemon.js';
import Translation   from '../data/Translation.js';

export default class Boss extends DatabaseTable {
    static schema = this.parseSchema({
        tableName: 'boss',
        orderBy: 'id',
        fields: {
            'id':           { type: 'string',    nullable: false, length: 64 },
            'boss_type':    { type: 'string',    nullable: false, length: 10 },
            'pokemon_id':   { type: 'string',    nullable: false, length: 20 },
            'form':         { type: 'string',    nullable: true,  length: 64 },
            'tier':         { type: 'tinyint',   nullable: false, unsigned: true },
            'is_mega':      { type: 'tinyint',   nullable: false, unsigned: true },
            'is_shadow':    { type: 'tinyint',   nullable: false, unsigned: true },
            'is_active':    { type: 'tinyint',   nullable: false, unsigned: true },
            'is_shinyable': { type: 'tinyint',   nullable: false, unsigned: true },
            'template_id':  { type: 'string',    nullable: false, length: 64 }
        },
        primaryKey: ['id']
    });
    
    constructor(data) {
        super(data);
    }
    
    // *********** //
    // * Getters * //
    // *********** //
    
    get id          () { return this.getField('id'); }
    get bossType    () { return this.getField('bossType') }
    get pokemonId   () { return this.getField('pokemonId') }
    get form        () { return this.getField('form') }
    get tier        () { return this.getField('tier') }
    get isMega      () { return this.getField('isMega') }
    get isActive    () { return this.getField('isActive') }
    get isShadow    () { return this.getField('isShadow') }
    get isShinyable () { return this.getField('isShinyable') }
    get templateId  () { return this.getField('templateId') }
    
    get bossTypeName () {
        return Translation.getBossTypeName(this.bossType);
    }

    get battleTypeName () {
        return Translation.getBattleTypeName(this.bossType);
    }

    // *********** //
    // * Setters * //
    // *********** //
    
    set id          (value) { this.setField(value, 'id') }
    set bossType    (value) { this.setField(value, 'bossType') }
    set pokemonId   (value) { this.setField(value, 'pokemonId') }
    set form        (value) { this.setField(value, 'form') }
    set tier        (value) { this.setField(value, 'tier') }
    set isMega      (value) { this.setField(value, 'isMega') }
    set isShadow    (value) { this.setField(value, 'isShadow') }
    set isActive    (value) { this.setField(value, 'isActive') }
    set isShinyable (value) { this.setField(value, 'isShinyable') }
    set templateId  (value) { this.setField(value, 'templateId') }
    
    // ***************** //
    // * Class Methods * //
    // ***************** //
    
    //static parseConditions(conditions) {
    //    return conditions;
    //}
    
    /**
     * Get guardian(s) based on a given set of conditions in an optional order.
     * @param {object} [conditions] The criteria for the guardian(s) to retrieve
     * @param {object} [orderBy] The order in which the guardian(s) will be returned
     * @returns {Promise<Guardian|Guardian[]>} The guardian(s) retrieved
     */
    static async get(conditions = {}, orderBy = this.schema.orderBy) {
        if (typeof conditions == 'object' && conditions.id && conditions.unique) {
            let boss = await super.get(conditions, orderBy);            
            return boss;
        }
        
        return await super.get(conditions, orderBy);
    }
    
    static async getPokemonIdChoices(pokemonIdPrefix, conditions = {}) {
        return await this.getChoices('pokemonId', pokemonIdPrefix, conditions);
    }

    static async getFormChoices(formPrefix, conditions = {}) {
        return await this.getChoices('form', formPrefix, conditions);
    }

    // ******************** //
    // * Instance Methods * //
    // ******************** //
    
    // TODO - Add icon to indicate if the raid boss is shinyable
    // TODO - Add icon to indicate if the raid boss is shadow
    // TODO - Add icon to indicate if the raid boss is mega
    // TODO - Add icon to indicate if the raid boss is active
    // TODO - Add stars or something to indicate if the raid boss tier
    
    async buildEmbed() {
        const masterPokemonRec = await MasterPokemon.get({ templateId: this.templateId, unique: true });

        client.logger.debug(`Boss Record =`);
        client.logger.dump(this);
        client.logger.debug(`Master Pokémon Record =`);
        client.logger.dump(masterPokemonRec);

        let title = `#${masterPokemonRec.pokedexId} ${masterPokemonRec.pokemonId}`;

        if (masterPokemonRec.form != null) {
            title += ` ${masterPokemonRec.form}`;
        }

        title += ` ${this.bossType}`;

        if (this.isMega) {
            title += ' [Mega]';
        }

        let typeColor = masterPokemonRec.getTypeColor(masterPokemonRec.type);
        let link = `https://pokemongo.gamepress.gg/c/pokemon/${masterPokemonRec.pokemonId.toLowerCase()}`;
        let thumbnail = `https://static.mana.wiki/pokemongo/${masterPokemonRec.pokemonId.toLowerCase()}-main.png`;
        let pokemonType = masterPokemonRec.type;

        if (masterPokemonRec.type2 != null) {
            pokemonType += ` / ${masterPokemonRec.type2}`;
        }

        let pokemonForm = 'No Form'; //masterPokemonRec.form ?? 'No Form';

        let cpL20Min = await MasterCPM.getCombatPower(masterPokemonRec, 10, 10, 10, 20);
        let cpL20Max = await MasterCPM.getCombatPower(masterPokemonRec, 15, 15, 15, 20);
        let cpL25Min = await MasterCPM.getCombatPower(masterPokemonRec, 10, 10, 10, 25);
        let cpL25Max = await MasterCPM.getCombatPower(masterPokemonRec, 15, 15, 15, 25);
        let cpL50Min = await MasterCPM.getCombatPower(masterPokemonRec, 10, 10, 10, 50);
        let cpL50Max = await MasterCPM.getCombatPower(masterPokemonRec, 15, 15, 15, 50);

        let cpReg = `${cpL20Min} - ${cpL20Max}`;
        let cpWb  = `${cpL25Min} - ${cpL25Max}`;
        let cpL50 = `${cpL50Min} - ${cpL50Max}`;

        client.logger.debug(`typeColor = ${typeColor}`);

        let embed =  new EmbedBuilder()
            .setColor(typeColor)
            .setTitle(title)
            .setURL(link)
          //.setAuthor({ name: 'Some name', iconURL: thumbnail, url: link })
          //.setDescription(`To join this raid, please click join below. If the raid host is not yet on your friends list, please send a friend request to them with the code ${hostTrainerCode}.`)
            .setThumbnail(thumbnail);
        
        embed = embed
            .addFields(
                { name: 'Pokémon Type', value: pokemonType },
                { name: 'Pokémon Form', value: pokemonForm},
            );
        
        console.log(`isShinyable = ${this.isShinyable}`);
        console.log(`isActive = ${this.isActive}`);
        console.log(`tier = ${this.tier}`);

        embed = embed
            .addFields(
                { name: 'Tier', value: `${this.tier}`, inline: true },
                { name: 'Shiny', value: `${this.isActive ? 'Can be Shiny' : 'Cannot be Shiny'}`, inline: true },
                { name: 'Status', value: `${this.isActive ? 'Active' : 'Inactive'}`, inline: true }
            );
        
        embed = embed
            .addFields(
              //{ name: '\u200B', value: '\u200B' },
                { name: 'CP Range', value: '10/10/10 - 15/15/15' },
                { name: 'CP L20', value: cpReg, inline: true },
                { name: 'CP L25 (WB)', value: cpWb, inline: true },
                { name: 'CP L50', value: cpL50, inline: true }
            );
        
        embed = embed
            .setTimestamp()
          //.setFooter({ text: `Raid hosted by ${raidHost}` });

        return embed;
    }
}
