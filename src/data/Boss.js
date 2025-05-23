
import client from '../Client.js';

import {
    EmbedBuilder
} from 'discord.js';

import StringFunctions from '../functions/StringFunctions.js';

import DatabaseTable from '../DatabaseTable.js';
import MasterCPM     from './MasterCPM.js';
import MasterPokemon from './MasterPokemon.js';
import WikiLink      from './WikiLink.js';
import Translation   from './Translation.js';

export default class Boss extends DatabaseTable {
    static schema = this.parseSchema({
        tableName: 'boss',
        orderBy: ['id'],
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
    get isShadow    () { return this.getField('isShadow') }
    get isActive    () { return this.getField('isActive') }
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
    
    set id          (value) { this.setField('id', value) }
    set bossType    (value) { this.setField('bossType', value) }
    set pokemonId   (value) { this.setField('pokemonId', value) }
    set form        (value) { this.setField('form', value) }
    set tier        (value) { this.setField('tier', value) }
    set isMega      (value) { this.setField('isMega', value) }
    set isShadow    (value) { this.setField('isShadow', value) }
    set isActive    (value) { this.setField('isActive', value) }
    set isShinyable (value) { this.setField('isShinyable', value) }
    set templateId  (value) { this.setField('templateId', value) }
    
    // ***************** //
    // * Class Methods * //
    // ***************** //
        
    /**
     * Get Boss(es) based on a given set of conditions in an optional order.
     * @param {object} [conditions] The criteria for the Boss(es) to retrieve
     * @param {object} [orderBy] The order in which the Boss(es) will be returned
     * @returns {Promise<Boss|Boss[]>} The Boss(es) retrieved
     */
    static async get(conditions = {}, orderBy = this.schema.orderBy) {
        if (typeof conditions == 'object' && conditions.id && conditions.unique) {
            return await super.get(conditions, orderBy);            
        }
        
        return await super.get(conditions, orderBy);
    }
    
    static async getPokemonIdChoices(pokemonIdPrefix, conditions = {}) {
        return await this.getChoices('pokemonId', pokemonIdPrefix, conditions);
    }

    static async getFormChoices(formPrefix, conditions = {}) {
        return await this.getChoices('form', formPrefix, conditions);
    }

    static async getIdChoices(idPrefix, conditions = {}) {
        return await this.getChoices('id', idPrefix, conditions);
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
        const masterPokemon = await MasterPokemon.get({ templateId: this.templateId, unique: true });

        client.logger.debug(`Boss Record =`);
        client.logger.dump(this);
        client.logger.debug(`Master Pokémon Record =`);
        client.logger.dump(masterPokemon);

        let bossTypeName       = await this.getBossTypeName();
        let pokemonName        = await masterPokemon.getName();
        let pokemonDescription = await masterPokemon.getDescription() ?? 'Description not available';

        let title = `#${masterPokemon.pokedexId} - ${bossTypeName} `;

        // TODO - Handle Primal Groudon and Kyogre
        if (this.isMega) {
            title += `${await Translation.getMegaName()} `;
        }

        if (this.isShadow) {
            title += `${await Translation.getShadowName()} `;
        }

        title += pokemonName;

        if (masterPokemon.form !== null) {
            title += ` (${StringFunctions.titleCase(masterPokemon.form)})`;
        }

        const wikiLink = await WikiLink.get(this);
        client.logger.debug(`Wiki Link Record =`);
        client.logger.dump(wikiLink);

        let typeColor = masterPokemon.getTypeColor(masterPokemon.type);
        let link = wikiLink !== null ? wikiLink.page : null;
        let thumbnail = wikiLink !== null ? wikiLink.image : null;
        let pokemonType = await masterPokemon.getTypeName();

        if (masterPokemon.type2 != null) {
            pokemonType += ` / ${await masterPokemon.getType2Name()}`;
        }

        let pokemonForm = masterPokemon.form != null ? StringFunctions.titleCase(masterPokemon.form) : 'No Form';

        let cpL20Min = await MasterCPM.getCombatPower(masterPokemon, 10, 10, 10, 20);
        let cpL20Max = await MasterCPM.getCombatPower(masterPokemon, 15, 15, 15, 20);
        let cpL25Min = await MasterCPM.getCombatPower(masterPokemon, 10, 10, 10, 25);
        let cpL25Max = await MasterCPM.getCombatPower(masterPokemon, 15, 15, 15, 25);
        let cpL50Min = await MasterCPM.getCombatPower(masterPokemon, 10, 10, 10, 50);
        let cpL50Max = await MasterCPM.getCombatPower(masterPokemon, 15, 15, 15, 50);

        let cpReg = `${cpL20Min} - ${cpL20Max}`;
        let cpWb  = `${cpL25Min} - ${cpL25Max}`;
        let cpL50 = `${cpL50Min} - ${cpL50Max}`;

        client.logger.debug(`link = ${link}`);
        client.logger.debug(`thumbnail = ${thumbnail}`);
        client.logger.debug(`pokemonType = ${pokemonType}`);
        client.logger.debug(`pokemonForm = ${pokemonForm}`);
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
                { name: 'Boss ID', value: this.id },
                { name: 'Pokémon Type', value: pokemonType },
                { name: 'Pokémon Form', value: pokemonForm},
            );
        
        console.log(`isShinyable = ${this.isShinyable}`);
        console.log(`isActive = ${this.isActive}`);
        console.log(`tier = ${this.tier}`);

        embed = embed
            .addFields(
                { name: 'Tier', value: `${this.tier}`, inline: true },
                { name: 'Shiny', value: `${this.isShinyable ? 'Can be Shiny' : 'Cannot be Shiny'}`, inline: true },
                { name: 'Status', value: `${this.isActive ? 'Active' : 'Inactive'}`, inline: true },
                { name: 'Mega', value: `${this.isMega ? 'Yes' : 'No'}`, inline: true },
                { name: 'Shadow', value: `${this.isShadow ? 'Yes' : 'No'}`, inline: true }
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

    async getBossTypeName() {
        return await Translation.getBossTypeName(this.bossType);
    }
    
    async getBattleTypeName() {
        return await Translation.getBattleTypeName(this.bossType);
    }
}
