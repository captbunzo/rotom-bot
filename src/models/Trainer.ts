import {
    type Snowflake,
    type InteractionReplyOptions,
    EmbedBuilder,
    MessageFlags
} from 'discord.js';

import {
    DrossDatabaseTable,
    DrossFieldType,
} from '@drossjs/dross-database';

import {
    Team,
    TeamColor
} from '#src/Constants.js';

export interface TrainerData {
    discordId: Snowflake;
    trainerName: string;
    firstName?: string | null | undefined;
    code?: string | null | undefined;
    level?: number | null | undefined;
    team?: string | null | undefined;
    aboutMe?: string | null | undefined;
    favoritePokemon?: string | null | undefined;
}

export interface TrainerConditions {
    discordId?: Snowflake;
    trainerName?: string;
    firstName?: string | null | undefined;
    code?: string | null | undefined;
    level?: number | null | undefined;
    team?: string | null | undefined;
    aboutMe?: string | null | undefined;
    favoritePokemon?: string | null | undefined;
}

export class Trainer extends DrossDatabaseTable {
    static override schema = this.parseSchema({
        tableName: 'trainer',
        orderBy: ['trainer_name'],
        fields: {
            'discord_id':       { type: DrossFieldType.Snowflake, nullable: false },
            'trainer_name':     { type: DrossFieldType.String,    nullable: false, length: 32 },
            'first_name':       { type: DrossFieldType.String,    nullable: true,  length: 32 },
            'code':             { type: DrossFieldType.String,    nullable: true,  length: 12 },
            'level':            { type: DrossFieldType.Integer,   nullable: true },
            'team':             { type: DrossFieldType.String,    nullable: true,  length: 8 },
            'about_me':         { type: DrossFieldType.String,    nullable: true,  length: 256 },
            'favorite_pokemon': { type: DrossFieldType.String,    nullable: true,  length: 24 }
        },
        primaryKey: ['discord_id']
    });

    constructor(data: TrainerData) {
        super(data);
    }
    
    /***********
     * Getters *
     ***********/

    get discordId       (): Snowflake     { return this.getField('discordId'); }
    get trainerName     (): string        { return this.getField('trainerName'); }
    get firstName       (): string | null { return this.getField('firstName'); }
    get code            (): string | null { return this.getField('code'); }
    get level           (): number | null { return this.getField('level'); }
    get team            (): string | null { return this.getField('team'); }
    get favoritePokemon (): string | null { return this.getField('favoritePokemon'); }

    get formattedCode(): string | undefined {
        if (!this.code) {
            return;
        }

        const match = this.code.match(/.{1,4}/g);

        // @ts-ignore
        return match.join(' ').trim();
    }
    
    /***********
     * Setters *
     ***********/

    set discordId       ( value: Snowflake     ) { this.setField('discordId', value); }
    set trainerName     ( value: string        ) { this.setField('trainerName', value); }
    set firstName       ( value: string | null ) { this.setField('firstName', value); }
    set code            ( value: string | null ) { this.setField('code', value); }
    set level           ( value: number | null ) { this.setField('level', value); }
    set team            ( value: string | null ) { this.setField('team', value); }
    set favoritePokemon ( value: string | null ) { this.setField('favoritePokemon', value); }

    /**************************
     * Class Method Overrides *
     **************************/

    static override async get(conditions: TrainerConditions = {}, orderBy = this.schema.orderBy) {
        return await super.get(conditions, orderBy) as Trainer[];
    }

    static override async getUnique(conditions: TrainerConditions = {}) {
        return await super.getUnique(conditions) as Trainer | null;
    }

    /*****************************
     * Instance Method Overrides *
     *****************************/

    override async update(condition: TrainerConditions = { discordId: this.discordId }) {
        await DrossDatabaseTable.prototype.update.call(this, condition);
    }

    override async delete(condition: TrainerConditions = { discordId: this.discordId }) {
        await DrossDatabaseTable.prototype.delete.call(this, condition);
    }

    /*****************
     * Class Methods *
     *****************/
    
    static async getTrainerNameChoices(namePrefix: string, conditions: TrainerConditions = {}) {
        return await this.getChoices('trainerName', namePrefix, conditions);
    }

    static getSetupTrainerFirstMessage(): InteractionReplyOptions {
        return {
            content: `Please setup your profile first with /setup-profile`,
            flags: MessageFlags.Ephemeral
        };
    }

    /********************
     * Instance Methods *
     ********************/
    
    async buildEmbed(): Promise<EmbedBuilder> {
        this.database.logger.debug(`Trainer Record =`);
        this.database.logger.dump(this);

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

export default Trainer;