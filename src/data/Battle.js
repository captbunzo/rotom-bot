
import client from '../Client.js';

import {
    bold,
    EmbedBuilder,
    SnowflakeUtil
} from 'discord.js';

import {
    BattleStatus
} from '../Constants.js';

import StringFunctions from '../functions/StringFunctions.js';

import DatabaseTable from '../DatabaseTable.js';
import BattleMember  from './BattleMember.js';
import Boss          from './Boss.js';
import MasterPokemon from './MasterPokemon.js';
import Trainer       from './Trainer.js';
import Translation   from './Translation.js';
import WikiLink      from './WikiLink.js';

export default class Battle extends DatabaseTable {
    static schema = this.parseSchema({
        tableName: 'battle',
        orderBy: ['id'],
        fields: {
            'id':              { type: 'snowflake', nullable: false },
            'boss_id':         { type: 'string',    nullable: false, length: 100 },
            'host_trainer_id': { type: 'snowflake', nullable: false },
            'guild_id':        { type: 'snowflake', nullable: false },
            'status':          { type: 'string',    nullable: false,  length: 20 },
            'message_id':      { type: 'snowflake', nullable: true }
        },
        primaryKey: ['id']
    });
    
    constructor(data) {
        super(data);
    }
    
    // *********** //
    // * Getters * //
    // *********** //
    
    get id            () { return this.getField('id'); }
    get bossId        () { return this.getField('bossId'); }
    get hostTrainerId () { return this.getField('hostTrainerId'); }
    get guildId       () { return this.getField('guildId'); }
    get status        () { return this.getField('status'); }
    get messageId     () { return this.getField('messageId'); }

    // *********** //
    // * Setters * //
    // *********** //
    
    set id            (value) { this.setField('id', value); }
    set bossId        (value) { this.setField('bossId', value); }
    set hostTrainerId (value) { this.setField('hostTrainerId', value); }
    set guildId       (value) { this.setField('guildId', value); }
    set status        (value) { this.setField('status', value); }
    set messageId     (value) { this.setField('messageId', value); }
    
    // ***************** //
    // * Class Methods * //
    // ***************** //
        
    /**
     * Get Battle(s) based on a given set of conditions in an optional order.
     * @param {object} [conditions] The criteria for the Battle(s) to retrieve
     * @param {object} [orderBy] The order in which the Battle(s) will be returned
     * @returns {Promise<Battle|Battle[]>} The Battle(s) retrieved
     */
    static async get(conditions = {}, orderBy = this.schema.orderBy) {
        if (typeof conditions == 'object' && conditions.id && conditions.unique) {
            return await super.get(conditions, orderBy);
        }
        
        return await super.get(conditions, orderBy);
    }
    
    // ******************** //
    // * Instance Methods * //
    // ******************** //
    
    async create() {  
        if (!this.id) {
            this.id = SnowflakeUtil.generate();
        }
        
        await DatabaseTable.prototype.create.call(this);
    }
    
    async buildEmbed() {
        const boss          = await Boss.get({ id: this.bossId, unique: true });
        const masterPokemon = await MasterPokemon.get({ templateId: boss.templateId, unique: true });
        const hostTrainer   = await Trainer.get({ id: this.hostTrainerId, unique: true });
        const battleMembers = await BattleMember.get({ battleId: this.id });

        // Get some discord objects
        let hostDiscordGuild  = await client.guilds.fetch(this.guildId);

        if (typeof hostDiscordGuild == 'object' && hostDiscordGuild.constructor.name == 'Collection') {
            hostDiscordGuild = await hostDiscordGuild.first().fetch();
        }

        //client.logger.debug(`Host Discord Guild =`);
        //client.logger.dump(hostDiscordGuild);
        //client.logger.debug(`hostDiscordGuild.name = ${hostDiscordGuild.name}`);
        //client.logger.dump(hostDiscordGuild.members);

        const hostDiscordMember = await hostDiscordGuild.members.fetch(hostTrainer.id);

        // Log records for debugging
        //client.logger.debug(`Battle Record =`);
        //client.logger.dump(this);
        //client.logger.debug(`Boss Record =`);
        //client.logger.dump(boss);
        //client.logger.debug(`Master Pokémon Record =`);
        //client.logger.dump(masterPokemon);
        //client.logger.debug(`Host Trainer =`);
        //client.logger.dump(hostTrainer);
        //client.logger.debug(`Battle Member Array`);
        //client.logger.dump(battleMemberArray);
        //client.logger.debug(`hostDiscordUser =`);
        //client.logger.dump(hostDiscordMember);
        //client.logger.debug(`hostDiscordMember.nickname = ${hostDiscordMember.nickname}`);

        let bossTypeName       = await boss.getBossTypeName();
        let battleTypeName     = await boss.getBattleTypeName();
        let pokemonName        = await masterPokemon.getName();
        let pokemonDescription = await masterPokemon.getDescription() ?? 'Description not available';

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

        switch (this.status) {
            case BattleStatus.Started:   title += ' -- Started'; break;
            case BattleStatus.Completed: title += ' -- Completed'; break;
            case BattleStatus.Failed:    title += ' -- Failed'; break;
            case BattleStatus.Cancelled: title += ' -- Cancelled'; break;
        }

        const wikiLink = await WikiLink.get(boss);
        client.logger.debug(`Wiki Link Record =`);
        client.logger.dump(wikiLink);

        let typeColor = masterPokemon.getTypeColor(masterPokemon.type);
        let link = wikiLink.page;
        let thumbnail = wikiLink.image;

        let hostTrainerCode = hostTrainer.formattedCode;
        let description =
            `To join this ${battleTypeName.toLowerCase()}, please click join below. `
          + `If the ${battleTypeName.toLowerCase()} host is not yet on your friends list, please send a friend request to them with the code. ${bold(hostTrainerCode)}.`;

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
        let cpWb  = `${cpL25Min} - ${cpL25Max}`;

        let battleMembersText = 'No Battle Members Yet';
        let battleMembersTextArray = [];

        for (const battleMember of battleMembers) {
            if (client.config.options.showBattleMemberTrainerNames) {
                const battleMemberTrainer = await Trainer.get({ id: battleMember.trainerId, unique: true }); 
                battleMembersTextArray.push(battleMemberTrainer.name);
            } else {
                const battleMemberDiscordUser = await hostDiscordGuild.members.fetch(battleMember.trainerId);
                battleMembersTextArray.push(battleMemberDiscordUser.nickname ?? battleMemberDiscordUser.user.displayName);
            }
        }
            
        if (battleMembersTextArray.length > 0) {
            battleMembersText = battleMembersTextArray.join('\n');
        }

        //client.logger.debug(`typeColor = ${typeColor}`);

        //client.logger.debug(`Mark 1`);
        let embed = new EmbedBuilder()
            .setColor(typeColor)
            .setTitle(title)
            .setURL(link)
          //.setAuthor({ name: title, iconURL: thumbnail, url: link })
            .setDescription(description)
            .setThumbnail(thumbnail);

        //client.logger.debug(`Mark 2`);
        embed = embed
            .addFields(
                { name: 'Pokémon Type', value: pokemonType, inline: true },
                { name: 'Pokédex ID', value: `${masterPokemon.pokedexId}`, inline: true },
                { name: 'Shiny', value: boss.isShinyable ? 'Can be Shiny' : 'Cannot be Shiny', inline: true }
            );
        
        //client.logger.debug(`Mark 2`);
        embed = embed
            .addFields(
                { name: 'Description', value: pokemonDescription }
            );
        
        // client 
        //client.logger.debug(`Mark 4`);
        embed = embed
            .addFields(
              //{ name: '\u200B', value: '\u200B' },
              //{ name: 'CP Range', value: '10/10/10 - 15/15/15' },
                { name: 'CP L20', value: cpReg, inline: true },
                { name: 'CP L25 (WB)', value: cpWb, inline: true },
            );
        
        //client.logger.debug(`Mark 5`);
        embed = embed
            .addFields(
                { name: 'Battle Members', value: battleMembersText }
            );
        
        //client.logger.debug(`Mark 5.5`);

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
                embed = embed
                .addFields(
                    { name: 'Raid Status', value: battleStatusText }
                );
        }

        //client.logger.debug(`Mark 6`);
        embed = embed
            .setTimestamp()
            .setFooter({ text: `Raid hosted by ${raidHost}` });
        
        //client.logger.debug(`Mark 7`);
        return embed;
    }    
}
