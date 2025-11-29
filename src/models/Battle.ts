import { type Snowflake, bold, EmbedBuilder, SnowflakeUtil } from 'discord.js';

import { DrossDatabaseTable, DrossFieldType } from '@drossjs/dross-database';

import Client from '@/client.js';
const client = Client.getInstance();

import StringFunctions from '@/utils/string.utils.js';
import { BattleStatus } from '@/constants.js';

import BattleMember from '@/models/BattleMember.js';
import Boss from '@/models/Boss.js';
import MasterPokemon from '@/models/MasterPokemon.js';
import PogoHubLink from '@/models/PogoHubLink.js';
import Trainer from '@/models/Trainer.js';
import Translation from '@/models/Translation.js';
import WikiLink from '@/models/WikiLink.js';

export interface BattleData {
    id?: Snowflake;
    bossId: Snowflake;
    hostDiscordId: Snowflake;
    guildId: Snowflake;
    status: string;
    messageId?: Snowflake | null | undefined;
}

export interface BattleConditions {
    id?: Snowflake;
    bossId?: Snowflake;
    hostDiscordId?: Snowflake;
    guildId?: Snowflake;
    status?: string;
    messageId?: Snowflake | null | undefined;
}

export class Battle extends DrossDatabaseTable {
    static override schema = this.parseSchema({
        tableName: 'battle',
        orderBy: ['id'],
        fields: {
            id: { type: DrossFieldType.Snowflake, nullable: false },
            boss_id: { type: DrossFieldType.String, nullable: false, length: 100 },
            host_discord_id: { type: DrossFieldType.Snowflake, nullable: false },
            guild_id: { type: DrossFieldType.Snowflake, nullable: false },
            status: { type: DrossFieldType.String, nullable: false, length: 20 },
            message_id: { type: DrossFieldType.Snowflake, nullable: true },
        },
        primaryKey: ['id'],
    });

    constructor(data: BattleData) {
        super(data);
    }

    /***********
     * Getters *
     ***********/

    get id(): Snowflake {
        return this.getField('id');
    }
    get bossId(): Snowflake {
        return this.getField('bossId');
    }
    get hostDiscordId(): Snowflake {
        return this.getField('hostDiscordId');
    }
    get guildId(): Snowflake {
        return this.getField('guildId');
    }
    get status(): string {
        return this.getField('status');
    }
    get messageId(): Snowflake | null {
        return this.getField('messageId');
    }

    /***********
     * Setters *
     ***********/

    set id(value: Snowflake) {
        this.setField('id', value);
    }
    set bossId(value: Snowflake) {
        this.setField('bossId', value);
    }
    set hostDiscordId(value: Snowflake) {
        this.setField('hostDiscordId', value);
    }
    set guildId(value: Snowflake) {
        this.setField('guildId', value);
    }
    set status(value: string) {
        this.setField('status', value);
    }
    set messageId(value: Snowflake | null) {
        this.setField('messageId', value);
    }

    /**************************
     * Class Method Overrides *
     **************************/

    static override async get(conditions: BattleConditions = {}, orderBy = this.schema.orderBy) {
        return (await super.get(conditions, orderBy)) as Battle[];
    }

    static override async getUnique(conditions: BattleConditions = {}) {
        return (await super.getUnique(conditions)) as Battle | null;
    }

    /*****************************
     * Instance Method Overrides *
     *****************************/

    override async create() {
        if (!this.id) {
            this.id = SnowflakeUtil.generate().toString();
        }

        await DrossDatabaseTable.prototype.create.call(this);
    }

    override async update(condition: BattleConditions = { id: this.id }) {
        await DrossDatabaseTable.prototype.update.call(this, condition);
    }

    override async delete(condition: BattleConditions = { id: this.id }) {
        await DrossDatabaseTable.prototype.delete.call(this, condition);
    }

    /********************
     * Instance Methods *
     ********************/

    async buildEmbed(): Promise<EmbedBuilder> {
        const client = Client.getInstance();
        const emoji = client.config.emoji;

        const boss = await Boss.getUnique({ id: this.bossId });
        if (!boss) {
            throw new Error(`Boss not found: ${this.bossId}`);
        }

        const masterPokemon = await MasterPokemon.getUnique({ templateId: boss.templateId });
        if (!masterPokemon) {
            throw new Error(`Master Pokémon not found for templateId: ${boss.templateId}`);
        }

        const hostTrainer = await Trainer.getUnique({ discordId: this.hostDiscordId });
        if (!hostTrainer) {
            throw new Error(`Host Trainer not found: ${this.hostDiscordId}`);
        }

        const battleMembers = await BattleMember.get({ battleId: this.id });

        // Get some discord objects
        let hostDiscordGuild = await client.getGuild(this.guildId);
        if (!hostDiscordGuild) {
            throw new Error(`Host Discord Guild not found: ${this.guildId}`);
        }

        //DrossDatabase.logger.debug(`Host Discord Guild =`)
        //DrossDatabase.logger.dump(hostDiscordGuild);
        //DrossDatabase.logger.debug(`hostDiscordGuild.name = ${hostDiscordGuild.name}`);
        //DrossDatabase.logger.dump(hostDiscordGuild.members);

        const hostDiscordMember = await hostDiscordGuild.members.fetch(hostTrainer.discordId);

        // Log records for debugging
        //DrossDatabase.logger.debug(`Battle Record =`);
        //DrossDatabase.logger.dump(this);
        //DrossDatabase.logger.debug(`Boss Record =`);
        //DrossDatabase.logger.dump(boss);
        //DrossDatabase.logger.debug(`Master Pokémon Record =`);
        //DrossDatabase.logger.dump(masterPokemon);
        //DrossDatabase.logger.debug(`Host Trainer =`);
        //DrossDatabase.logger.dump(hostTrainer);
        //DrossDatabase.logger.debug(`Battle Member Array`);
        //DrossDatabase.logger.dump(battleMemberArray);
        //DrossDatabase.logger.debug(`hostDiscordUser =`);
        //DrossDatabase.logger.dump(hostDiscordMember);
        //DrossDatabase.logger.debug(`hostDiscordMember.nickname = ${hostDiscordMember.nickname}`);

        let bossTypeName = await boss.getBossTypeName();
        let battleTypeName = await boss.getBattleTypeName();
        let pokemonName = await masterPokemon.getName();
        let pokemonDescription =
            (await masterPokemon.getDescription()) ?? 'Description not available';

        let title = `${bossTypeName}: `;

        // TODO - Handle Primal Groudon and Kyogre
        if (boss.isMega) {
            title += `${await Translation.getMegaName()} `;
        }

        if (boss.isShadow) {
            title += `${await Translation.getShadowName()} `;
        }

        title += pokemonName;

        if (masterPokemon.form !== null) {
            title += ` (${StringFunctions.titleCase(masterPokemon.form)})`;
        }
        title += ` ${emoji.shiny}`;

        switch (this.status) {
            case BattleStatus.Started:
                title += ' -- Started';
                break;
            case BattleStatus.Completed:
                title += ' -- Completed';
                break;
            case BattleStatus.Failed:
                title += ' -- Failed';
                break;
            case BattleStatus.Cancelled:
                title += ' -- Cancelled';
                break;
        }

        let typeColor = masterPokemon.getTypeColor();

        const wikiLink = await WikiLink.getUnique(boss);
        const pogoHubLink = await PogoHubLink.getUnique(boss);

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

        let hostTrainerCode = hostTrainer.formattedCode || 'N/A';
        let description =
            `To join this ${battleTypeName.toLowerCase()}, please click join below. ` +
            `If the ${battleTypeName.toLowerCase()} host is not yet on your friends list, please send a friend request to them with the code. ${bold(hostTrainerCode)}.`;

        let pokemonType = await masterPokemon.getTypeName();
        if (masterPokemon.type2 != null) {
            pokemonType += ` / ${await masterPokemon.getType2Name()}`;
        }

        let raidHost = hostDiscordMember.nickname ?? hostDiscordMember.user.displayName;

        let cpL20Min = await masterPokemon.getCombatPower(10, 10, 10, 20);
        let cpL20Max = await masterPokemon.getCombatPower(15, 15, 15, 20);
        let cpL25Min = await masterPokemon.getCombatPower(10, 10, 10, 25);
        let cpL25Max = await masterPokemon.getCombatPower(15, 15, 15, 25);

        let cpReg = `${cpL20Min} - ${cpL20Max}`;
        let cpWb = `${cpL25Min} - ${cpL25Max}`;

        let battleMembersText = 'No Battle Members Yet';
        let battleMembersTextArray = [];

        for (const battleMember of battleMembers) {
            if (client.config.options.showBattleMemberTrainerNames) {
                const battleMemberTrainer = await Trainer.getUnique({
                    discordId: battleMember.discordId,
                });
                if (battleMemberTrainer) {
                    battleMembersTextArray.push(battleMemberTrainer.trainerName);
                }
            } else {
                const battleMemberDiscordUser = await hostDiscordGuild.members.fetch(
                    battleMember.discordId
                );
                battleMembersTextArray.push(
                    battleMemberDiscordUser.nickname ?? battleMemberDiscordUser.user.displayName
                );
            }
        }

        if (battleMembersTextArray.length > 0) {
            battleMembersText = battleMembersTextArray.join('\n');
        }

        //DrossDatabase.logger.debug(`typeColor = ${typeColor}`);

        //DrossDatabase.logger.debug(`Mark 1`);
        let embed = new EmbedBuilder()
            .setColor(typeColor)
            .setTitle(title)
            .setURL(link)
            //.setAuthor({ name: title, iconURL: thumbnail, url: link })
            .setDescription(description)
            .setThumbnail(thumbnail);

        //DrossDatabase.logger.debug(`Mark 2`);
        const pokedexId = masterPokemon.pokedexId || '?';
        embed = embed.addFields(
            { name: 'Pokémon Type', value: pokemonType || 'Unknown', inline: true },
            { name: 'Pokédex ID', value: pokedexId.toString(), inline: true },
            {
                name: 'Shiny',
                value: boss.isShinyable ? 'Can be Shiny' : 'Cannot be Shiny',
                inline: true,
            }
        );

        //DrossDatabase.logger.debug(`Mark 2`);
        embed = embed.addFields({ name: 'Description', value: pokemonDescription });

        // client
        //DrossDatabase.logger.debug(`Mark 4`);
        embed = embed.addFields(
            //{ name: '\u200B', value: '\u200B' },
            //{ name: 'CP Range', value: '10/10/10 - 15/15/15' },
            { name: 'CP L20', value: cpReg, inline: true },
            { name: 'CP L25 (WB)', value: cpWb, inline: true }
        );

        //DrossDatabase.logger.debug(`Mark 5`);
        embed = embed.addFields({ name: 'Battle Members', value: battleMembersText });

        //DrossDatabase.logger.debug(`Mark 5.5`);

        let battleStatusText;
        switch (this.status) {
            case BattleStatus.Started:
                battleStatusText = 'This raid has started.';
                break;
            case BattleStatus.Completed:
                battleStatusText = 'This raid has been completed.';
                break;
            case BattleStatus.Failed:
                battleStatusText = 'This raid has failed.';
                break;
            case BattleStatus.Cancelled:
                battleStatusText = 'This raid has been cancelled by the host.';
                break;
        }

        if (battleStatusText) {
            embed = embed.addFields({ name: 'Raid Status', value: battleStatusText });
        }

        //DrossDatabase.logger.debug(`Mark 6`);
        embed = embed.setTimestamp().setFooter({ text: `Raid hosted by ${raidHost}` });

        //DrossDatabase.logger.debug(`Mark 7`);
        return embed;
    }
}
