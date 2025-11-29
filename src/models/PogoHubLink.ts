import { DrossDatabaseTable, DrossFieldType } from '@drossjs/dross-database';

import { BossType } from '@/constants.js';
import Boss from '@/models/Boss.js';
import MasterPokemon from '@/models/MasterPokemon.js';

export interface PogoHubLinkData {
    id: string;
    pokemonId: string;
    pokedexId: number;
    isMega: boolean;
    isGigantamax: boolean;
    page: string;
    image?: string | null | undefined;
    templateId: string;
    form?: string | null | undefined;
}

export interface PogoHubLinkConditions {
    id?: string;
    pokemonId?: string;
    pokedexId?: number;
    isMega?: boolean;
    isGigantamax?: boolean;
    page?: string;
    image?: string | null | undefined;
    templateId?: string;
    form?: string | null | undefined;
}

// TODO - Maybe merge this and the wiki links table
export class PogoHubLink extends DrossDatabaseTable {
    static override schema = this.parseSchema({
        tableName: 'pogo_hub_link',
        orderBy: ['id'],
        fields: {
            id: { type: DrossFieldType.String, nullable: false, length: 64 },
            pokemon_id: { type: DrossFieldType.String, nullable: false, length: 20 },
            pokedex_id: { type: DrossFieldType.SmallInt, nullable: false, unsigned: true },
            is_mega: { type: DrossFieldType.TinyInt, nullable: false, unsigned: true },
            is_gigantamax: { type: DrossFieldType.TinyInt, nullable: false, unsigned: true },
            page: { type: DrossFieldType.String, nullable: false, length: 128 },
            image: { type: DrossFieldType.String, nullable: true, length: 128 },
            template_id: { type: DrossFieldType.String, nullable: false, length: 64 },
            form: { type: DrossFieldType.String, nullable: true, length: 64 },
        },
        primaryKey: ['id'],
    });

    constructor(data: PogoHubLinkData) {
        super(data);
    }

    /***********
     * Getters *
     ***********/

    get id(): string {
        return this.getField('id');
    }
    get pokemonId(): string {
        return this.getField('pokemonId');
    }
    get pokedexId(): number {
        return this.getField('pokedexId');
    }
    get isMega(): boolean {
        return this.getField('isMega');
    }
    get isGigantamax(): boolean {
        return this.getField('isGigantamax');
    }
    get page(): string {
        return this.getField('page');
    }
    get image(): string | null {
        return this.getField('image');
    }
    get templateId(): string {
        return this.getField('templateId');
    }
    get form(): string | null {
        return this.getField('form');
    }

    /***********
     * Setters *
     ***********/

    set id(value: string) {
        this.setField('id', value);
    }
    set pokemonId(value: string) {
        this.setField('pokemonId', value);
    }
    set pokedexId(value: number) {
        this.setField('pokedexId', value);
    }
    set isMega(value: boolean) {
        this.setField('isMega', value);
    }
    set isGigantamax(value: boolean) {
        this.setField('isGigantamax', value);
    }
    set page(value: string) {
        this.setField('page', value);
    }
    set image(value: string | null) {
        this.setField('image', value);
    }
    set templateId(value: string) {
        this.setField('templateId', value);
    }
    set form(value: string | null) {
        this.setField('form', value);
    }

    /**************************
     * Class Method Overrides *
     **************************/

    static override async get(
        conditions: PogoHubLinkConditions = {},
        orderBy = this.schema.orderBy
    ) {
        return (await super.get(conditions, orderBy)) as PogoHubLink[];
    }

    static override async getUnique(
        conditions: PogoHubLinkConditions | Boss | MasterPokemon = {},
        orderBy = this.schema.orderBy
    ) {
        this.database.logger.debug(`typeof conditions = ${typeof conditions}`);
        this.database.logger.debug(`conditions.constructor.name = ${conditions.constructor.name}`);
        this.database.logger.debug(`conditions =`);
        this.database.logger.dump(conditions);

        if (typeof conditions == 'object' && conditions.constructor.name == 'Boss') {
            let boss: Boss = conditions as Boss;
            let masterPokemon = await MasterPokemon.getUnique({ templateId: boss.templateId });

            if (!masterPokemon) {
                throw new Error(`MasterPokemon not found for templateId: ${boss.templateId}`);
            }

            let pogoHubLinkSearchObj: PogoHubLinkConditions | null = null;
            let pogoHubLinks: PogoHubLink[];

            // First check for the wiki link record with the full search parameters
            pogoHubLinkSearchObj = {
                templateId: masterPokemon.templateId,
                isMega: boss.isMega,
                isGigantamax: boss.bossType == BossType.Gigantamax,
            };

            pogoHubLinks = await PogoHubLink.get(pogoHubLinkSearchObj);
            if (pogoHubLinks.length == 1) {
                return pogoHubLinks[0];
            }

            // Next check based on the pokemon name
            pogoHubLinkSearchObj = {
                pokemonId: masterPokemon.pokemonId,
                form: null,
                isMega: boss.isMega,
                isGigantamax: boss.bossType == BossType.Gigantamax,
            };

            pogoHubLinks = await PogoHubLink.get(pogoHubLinkSearchObj);
            if (pogoHubLinks.length == 1) {
                return pogoHubLinks[0];
            }

            // Otherwise check for the base record
            pogoHubLinkSearchObj = {
                templateId: masterPokemon.templateId,
                isMega: false,
                isGigantamax: false,
            };

            pogoHubLinks = await PogoHubLink.get(pogoHubLinkSearchObj);
            if (pogoHubLinks.length == 1) {
                return pogoHubLinks[0];
            }

            // And finally check for the base record with the pokemon name
            pogoHubLinkSearchObj = {
                pokemonId: masterPokemon.pokemonId,
                form: null,
                isMega: false,
                isGigantamax: false,
            };

            pogoHubLinks = await PogoHubLink.get(pogoHubLinkSearchObj);
            if (pogoHubLinks.length == 1) {
                return pogoHubLinks[0];
            }

            return;
        }

        if (typeof conditions == 'object' && conditions.constructor.name == 'MasterPokemon') {
            let masterPokemon: MasterPokemon = conditions as MasterPokemon;
            let pogoHubLinkSearchObj: PogoHubLinkConditions | null = null;
            let pogoHubLinks: PogoHubLink[];

            // First check for the base record
            pogoHubLinkSearchObj = {
                templateId: masterPokemon.templateId,
                form: masterPokemon.form,
                isMega: false,
                isGigantamax: false,
            };

            pogoHubLinks = await PogoHubLink.get(pogoHubLinkSearchObj);
            if (pogoHubLinks.length == 1) {
                return pogoHubLinks[0];
            }

            // Otherwise check for the base record without the form
            pogoHubLinkSearchObj = {
                pokemonId: masterPokemon.pokemonId,
                form: null,
                isMega: false,
                isGigantamax: false,
            };

            pogoHubLinks = await PogoHubLink.get(pogoHubLinkSearchObj);
            if (pogoHubLinks.length == 1) {
                return pogoHubLinks[0];
            }

            pogoHubLinkSearchObj = {
                id: masterPokemon.pokemonId.toLowerCase(),
                pokemonId: masterPokemon.pokemonId,
                form: null,
                isMega: false,
                isGigantamax: false,
            };

            pogoHubLinks = await PogoHubLink.get(pogoHubLinkSearchObj);
            if (pogoHubLinks.length == 1) {
                return pogoHubLinks[0];
            }

            return;
        }

        return (await super.getUnique(conditions, orderBy)) as PogoHubLink;
    }
    /*****************************
     * Instance Method Overrides *
     *****************************/

    override async update(condition: PogoHubLinkConditions = { id: this.id }) {
        await DrossDatabaseTable.prototype.update.call(this, condition);
    }

    override async delete(condition: PogoHubLinkConditions = { id: this.id }) {
        await DrossDatabaseTable.prototype.delete.call(this, condition);
    }

    // ***************** //
    // * Class Methods * //
    // ***************** //

    static async getPokemonIdChoices(
        pokemonIdPrefix: string,
        conditions: PogoHubLinkConditions = {}
    ) {
        return await this.getChoices('pokemonId', pokemonIdPrefix, conditions);
    }
}
