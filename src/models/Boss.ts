import { EmbedBuilder } from 'discord.js';

import { DrossDatabaseTable, DrossFieldType } from '@drossjs/dross-database';

import Client from '@/client.js';
import StringFunctions from '@/utils/string.utils.js';

import MasterCPM from '@/models/MasterCPM.js';
import MasterPokemon from '@/models/MasterPokemon.js';
import PogoHubLink from '@/models/PogoHubLink.js';
import WikiLink from '@/models/WikiLink.js';

import { BossService } from '@/services/boss.service.js';
import { TranslationUtils } from '@/utils/translation.utils.js';

export interface BossData {
    id: string;
    bossType: string;
    pokemonId: string;
    form?: string | null;
    tier: number;
    isMega: boolean;
    isShadow: boolean;
    isActive: boolean;
    isShinyable: boolean;
    templateId: string;
}

export interface BossConditions {
    id?: string;
    bossType?: string;
    pokemonId?: string;
    form?: string | null;
    tier?: number;
    isMega?: boolean;
    isShadow?: boolean;
    isActive?: boolean;
    isShinyable?: boolean;
    templateId?: string;
}

export class Boss extends DrossDatabaseTable {
    static override schema = this.parseSchema({
        tableName: 'boss',
        orderBy: ['id'],
        fields: {
            id: { type: DrossFieldType.String, nullable: false, length: 64 },
            boss_type: { type: DrossFieldType.String, nullable: false, length: 10 },
            pokemon_id: { type: DrossFieldType.String, nullable: false, length: 20 },
            form: { type: DrossFieldType.String, nullable: true, length: 64 },
            tier: { type: DrossFieldType.TinyInt, nullable: false, unsigned: true },
            is_mega: { type: DrossFieldType.TinyInt, nullable: false, unsigned: true },
            is_shadow: { type: DrossFieldType.TinyInt, nullable: false, unsigned: true },
            is_active: { type: DrossFieldType.TinyInt, nullable: false, unsigned: true },
            is_shinyable: { type: DrossFieldType.TinyInt, nullable: false, unsigned: true },
            template_id: { type: DrossFieldType.String, nullable: false, length: 64 },
        },
        primaryKey: ['id'],
    });

    constructor(data: BossData) {
        super(data);
    }

    /***********
     * Getters *
     ***********/

    get id(): string {
        return this.getField('id');
    }
    get bossType(): string {
        return this.getField('bossType');
    }
    get pokemonId(): string {
        return this.getField('pokemonId');
    }
    get form(): string | null {
        return this.getField('form');
    }
    get tier(): number {
        return this.getField('tier');
    }
    get isMega(): boolean {
        return this.getField('isMega');
    }
    get isShadow(): boolean {
        return this.getField('isShadow');
    }
    get isActive(): boolean {
        return this.getField('isActive');
    }
    get isShinyable(): boolean {
        return this.getField('isShinyable');
    }
    get templateId(): string {
        return this.getField('templateId');
    }

    get bossTypeName(): string {
        return Translation.getBossTypeName(this.bossType);
    }

    get battleTypeName(): string {
        return Translation.getBattleTypeName(this.bossType);
    }

    /***********
     * Setters *
     ***********/

    set id(value: string) {
        this.setField('id', value);
    }
    set bossType(value: string) {
        this.setField('bossType', value);
    }
    set pokemonId(value: string) {
        this.setField('pokemonId', value);
    }
    set form(value: string | null) {
        this.setField('form', value);
    }
    set tier(value: number) {
        this.setField('tier', value);
    }
    set isMega(value: boolean) {
        this.setField('isMega', value);
    }
    set isShadow(value: boolean) {
        this.setField('isShadow', value);
    }
    set isActive(value: boolean) {
        this.setField('isActive', value);
    }
    set isShinyable(value: boolean) {
        this.setField('isShinyable', value);
    }
    set templateId(value: string) {
        this.setField('templateId', value);
    }

    /**************************
     * Class Method Overrides *
     **************************/

    static override async get(conditions: BossConditions = {}, orderBy = this.schema.orderBy) {
        return (await super.get(conditions, orderBy)) as Boss[];
    }

    static override async getUnique(conditions: BossConditions = {}) {
        return (await super.getUnique(conditions)) as Boss | null;
    }

    /*****************************
     * Instance Method Overrides *
     *****************************/

    override async update(condition: BossConditions = { id: this.id }) {
        await DrossDatabaseTable.prototype.update.call(this, condition);
    }

    override async delete(condition: BossConditions = { id: this.id }) {
        await DrossDatabaseTable.prototype.delete.call(this, condition);
    }

    /*****************
     * Class Methods *
     *****************/

    static async getPokemonIdChoices(pokemonIdPrefix: string, conditions: BossConditions = {}) {
        return await this.getChoices('pokemonId', pokemonIdPrefix, conditions);
    }

    static async getFormChoices(formPrefix: string, conditions: BossConditions = {}) {
        return await this.getChoices('form', formPrefix, conditions);
    }

    static async getIdChoices(idPrefix: string, conditions: BossConditions = {}) {
        return await this.getChoices('id', idPrefix, conditions);
    }

    /********************
     * Instance Methods *
     ********************/

    // TODO - Add icon to indicate if the raid boss is shinyable
    // TODO - Add icon to indicate if the raid boss is shadow
    // TODO - Add icon to indicate if the raid boss is mega
    // TODO - Add icon to indicate if the raid boss is active
    // TODO - Add stars or something to indicate if the raid boss tier

    async buildEmbed() {
        const client = Client.getInstance();
        const emoji = client.config.emoji;

        const masterPokemon = await MasterPokemon.getUnique({ templateId: this.templateId });

        if (!masterPokemon) {
            throw new Error(`Master Pokémon with templateId ${this.templateId} not found`);
        }

        this.database.logger.debug(`Boss Record =`);
        this.database.logger.dump(this);
        this.database.logger.debug(`Master Pokémon Record =`);
        this.database.logger.dump(masterPokemon);

        let bossTypeName = BossService.getBossTypeName(this.bossType);
        let pokemonName = await masterPokemon.getName();

        let title = `#${masterPokemon.pokedexId} - ${bossTypeName} `;

        // TODO - Handle Primal Groudon and Kyogre
        if (this.isMega) {
            title += `${TranslationUtils.getMegaName()} `;
        }

        if (this.isShadow) {
            title += `${TranslationUtils.getShadowName()} `;
        }

        title += pokemonName;

        if (masterPokemon.form !== null) {
            title += ` (${StringFunctions.titleCase(masterPokemon.form)})`;
        }
        title += ` ${emoji.shiny}`;

        let typeColor = masterPokemon.getTypeColor();
        let pokemonType = await masterPokemon.getTypeName();

        const wikiLink = await WikiLink.getUnique(this);
        const pogoHubLink = await PogoHubLink.getUnique(this);

        this.database.logger.debug(`Wiki Link Record =`);
        this.database.logger.dump(wikiLink);

        this.database.logger.debug(`PogoHub Link Record =`);
        this.database.logger.dump(pogoHubLink);

        let link = null;
        let thumbnail = null;

        if (wikiLink) {
            link = wikiLink.page;
            thumbnail = wikiLink.image;
        }

        if (pogoHubLink) {
            link = pogoHubLink.page;
        }

        if (masterPokemon.type2 != null) {
            pokemonType += ` / ${await masterPokemon.getType2Name()}`;
        }

        let pokemonForm =
            masterPokemon.form != null ? StringFunctions.titleCase(masterPokemon.form) : 'No Form';

        if (!pokemonType) {
            throw new Error(`No Pokémon type found for Pokémon ID ${this.pokemonId}`);
        }

        let cpL20Min = await MasterCPM.getCombatPower(masterPokemon, 10, 10, 10, 20);
        let cpL20Max = await MasterCPM.getCombatPower(masterPokemon, 15, 15, 15, 20);
        let cpL25Min = await MasterCPM.getCombatPower(masterPokemon, 10, 10, 10, 25);
        let cpL25Max = await MasterCPM.getCombatPower(masterPokemon, 15, 15, 15, 25);

        let cpReg = `${cpL20Min} - ${cpL20Max}`;
        let cpWb = `${cpL25Min} - ${cpL25Max}`;

        this.database.logger.debug(`link = ${link}`);
        this.database.logger.debug(`thumbnail = ${thumbnail}`);
        this.database.logger.debug(`pokemonType = ${pokemonType}`);
        this.database.logger.debug(`pokemonForm = ${pokemonForm}`);
        this.database.logger.debug(`typeColor = ${typeColor}`);

        let embed = new EmbedBuilder()
            .setColor(typeColor)
            .setTitle(title)
            .setURL(link)
            //.setAuthor({ name: 'Some name', iconURL: thumbnail, url: link })
            //.setDescription(`To join this raid, please click join below. If the raid host is not yet on your friends list, please send a friend request to them with the code ${hostTrainerCode}.`)
            .setThumbnail(thumbnail);

        embed = embed.addFields(
            { name: 'Boss ID', value: this.id },
            { name: 'Pokémon Type', value: pokemonType },
            { name: 'Pokémon Form', value: pokemonForm }
        );

        console.debug(`isShinyable = ${this.isShinyable}`);
        console.debug(`isActive = ${this.isActive}`);
        console.debug(`tier = ${this.tier}`);

        embed = embed.addFields(
            { name: 'Tier', value: `${this.tier}`, inline: true },
            {
                name: 'Shiny',
                value: `${this.isShinyable ? 'Can be Shiny' : 'Cannot be Shiny'}`,
                inline: true,
            },
            { name: 'Status', value: `${this.isActive ? 'Active' : 'Inactive'}`, inline: true },
            { name: 'Mega', value: `${this.isMega ? 'Yes' : 'No'}`, inline: true },
            { name: 'Shadow', value: `${this.isShadow ? 'Yes' : 'No'}`, inline: true }
        );

        embed = embed.addFields(
            { name: 'CP Range', value: '10/10/10 - 15/15/15' },
            { name: 'CP L20', value: cpReg, inline: true },
            { name: 'CP L25 (WB)', value: cpWb, inline: true }
        );

        embed = embed.setTimestamp();

        return embed;
    }
}
