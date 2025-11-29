import { DrossDatabaseTable, DrossFieldType } from '@drossjs/dross-database';

import type MasterPokemon from '@/models/MasterPokemon.js';

export interface MasterCPMData {
    level: number;
    cpm: number;
}

export interface MasterCPMConditions {
    level?: number;
    cpm?: number;
}

export class MasterCPM extends DrossDatabaseTable {
    static override schema = this.parseSchema({
        tableName: 'master_cpm',
        orderBy: ['level'],
        fields: {
            level: { type: DrossFieldType.TinyInt, nullable: false, unsigned: true },
            cpm: { type: DrossFieldType.Decimal, nullable: false, precision: 9, scale: 8 },
        },
        primaryKey: ['level'],
    });

    constructor(data: MasterCPMData) {
        super(data);
    }

    /***********
     * Getters *
     ***********/

    get level(): number {
        return this.getField('level');
    }
    get cpm(): number {
        return this.getField('cpm');
    }

    /***********
     * Setters *
     ***********/

    set level(value: number) {
        this.setField('level', value);
    }
    set cpm(value: number) {
        this.setField('cpm', value);
    }

    /**************************
     * Class Method Overrides *
     **************************/

    static override async get(conditions: MasterCPMConditions = {}, orderBy = this.schema.orderBy) {
        return (await super.get(conditions, orderBy)) as MasterCPM[];
    }

    static override async getUnique(conditions: MasterCPMConditions = {}) {
        return (await super.getUnique(conditions)) as MasterCPM | null;
    }

    /*****************************
     * Instance Method Overrides *
     *****************************/

    override async update(condition: MasterCPMConditions = { level: this.level }) {
        await DrossDatabaseTable.prototype.update.call(this, condition);
    }

    override async delete(condition: MasterCPMConditions = { level: this.level }) {
        await DrossDatabaseTable.prototype.delete.call(this, condition);
    }

    // ***************** //
    // * Class Methods * //
    // ***************** //

    static async getCombatPower(
        masterPokemon: MasterPokemon,
        attackIV: number,
        defenseIV: number,
        staminaIV: number,
        level: number
    ) {
        const masterCPM = await MasterCPM.getUnique({ level: level });

        this.database.logger.debug('Master CP Multiplier Record');
        this.database.logger.dump(masterCPM);

        if (!masterCPM) {
            throw new Error(`MasterCPM with level ${level} not found`);
        }

        //
        // Combat Power (CP) = FLOOR(((Attack + Attack IV) * SQRT(Defense + Defense IV) * SQRT(Stamina + Stamina IV) * (CPM_AT_LEVEL(Level) ^ 2)) / 10)
        //

        if (!masterPokemon.baseAttack) {
            throw new Error(
                `MasterPokemon with templateId ${masterPokemon.templateId} does not have a baseAttack value`
            );
        }

        if (!masterPokemon.baseDefense) {
            throw new Error(
                `MasterPokemon with templateId ${masterPokemon.templateId} does not have a baseDefense value`
            );
        }

        if (!masterPokemon.baseStamina) {
            throw new Error(
                `MasterPokemon with templateId ${masterPokemon.templateId} does not have a baseStamina value`
            );
        }

        const attackTotal = masterPokemon.baseAttack + attackIV;
        const defenseTotal = masterPokemon.baseDefense + defenseIV;
        const staminaTotal = masterPokemon.baseStamina + staminaIV;
        const cp = Math.floor(
            (attackTotal *
                Math.sqrt(defenseTotal) *
                Math.sqrt(staminaTotal) *
                Math.pow(masterCPM.cpm, 2)) /
                10
        );

        return cp;
    }
}
