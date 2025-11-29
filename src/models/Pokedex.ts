import type { Snowflake } from 'discord.js';

import { DrossDatabaseTable, DrossFieldType } from '@drossjs/dross-database';

export interface PokedexData {
    discordId: Snowflake;
    isPublic: boolean;
}

export interface PokedexConditions {
    discordId?: Snowflake;
    isPrivate?: boolean;
}

export class Pokedex extends DrossDatabaseTable {
    static override schema = this.parseSchema({
        tableName: 'pokedex',
        orderBy: ['discord_id'],
        fields: {
            discord_id: { type: DrossFieldType.Snowflake, nullable: false },
            is_private: { type: DrossFieldType.Boolean, nullable: false },
        },
        primaryKey: ['discord_id'],
    });

    constructor(data: PokedexData) {
        super(data);
    }

    /***********
     * Getters *
     ***********/

    get discordId(): Snowflake {
        return this.getField('discordId');
    }
    get isPrivate(): boolean {
        return this.getField('isPrivate');
    }

    /***********
     * Setters *
     ***********/

    set discordId(value: Snowflake) {
        this.setField('discordId', value);
    }
    set isPrivate(value: boolean) {
        this.setField('isPrivate', value);
    }

    /**************************
     * Class Method Overrides *
     **************************/

    static override async get(conditions: PokedexConditions = {}, orderBy = this.schema.orderBy) {
        return (await super.get(conditions, orderBy)) as Pokedex[];
    }

    static override async getUnique(conditions: PokedexConditions = {}) {
        return (await super.getUnique(conditions)) as Pokedex | null;
    }

    /*****************************
     * Instance Method Overrides *
     *****************************/

    override async update(condition: PokedexConditions = { discordId: this.discordId }) {
        await DrossDatabaseTable.prototype.update.call(this, condition);
    }

    override async delete(condition: PokedexConditions = { discordId: this.discordId }) {
        await DrossDatabaseTable.prototype.delete.call(this, condition);
    }
}
