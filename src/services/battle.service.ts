import { EmbedBuilder, bold } from 'discord.js';

import { client } from '@/client';
import { emoji } from '@/utils/emoji';
import { BattleStatus } from '@/constants';
import { battleConfig } from '@/config/battle.config';

import { StringUtils } from '@/utils/string.utils';
import { TranslationUtils } from '@/utils/translation.utils';

import { Battle, type BattleUpdate, type BattleDelete } from '@/database/entities/battle.entity';
import { battleRepository } from '@/database/repositories';

import { BattleMemberService } from '@/services/battle-member.service';
import { BossService } from '@/services/boss.service';
import { MasterPokemonService } from '@/services/master-pokemon.service';
import { TrainerService } from '@/services/trainer.service';
import { WikiLinkService } from '@/services/wiki-link.service';
import { PogoHubLinkService } from '@/services/pogo-hub-link.service';

import { EntityNotFoundError } from '@/types/errors/entity-not-found.error';

/**
 * Service layer for battle-related business logic
 */
export const BattleService = {
    // ===== GET METHODS =====

    /**
     * Get battle by ID
     * @param id The battle ID
     * @returns Battle entity or null if not found
     */
    async get(id: string): Promise<Battle | null> {
        return await battleRepository.findOneBy({ id });
    },

    /**
     * Get battle by Discord message ID
     * @param messageId The Discord message ID for a battle
     * @returns Battle entity or null if not found
     */
    async getByMessageId(messageId: string): Promise<Battle | null> {
        return await battleRepository.findOneBy({ messageId });
    },

    /**
     * Get battle with all related data
     * @param battleId The battle ID
     * @returns Battle with related entities or null if not found
     */
    async getBattleDetails(battleId: string) {
        const battle = await battleRepository.findOneBy({ id: battleId });
        if (!battle) return null;

        const boss = await BossService.get(battle.bossId);
        const hostTrainer = await TrainerService.get(battle.hostDiscordId);
        const battleMembers = await BattleMemberService.getByBattleId(battle.id);

        return {
            battle,
            boss,
            hostTrainer,
            battleMembers,
        };
    },

    // ===== CREATE, UPDATE, DELETE METHODS =====

    /**
     * Create a new battle entity
     * @param battle The full battle entity to create
     * @returns The created battle entity
     */
    async create(battle: Battle): Promise<Battle> {
        return await battleRepository.save(battle);
    },

    /**
     * Update an existing battle entity
     * @param battle Either a full entity or partial entity with updates
     * @returns The updated battle entity
     */
    async update(battle: Battle | BattleUpdate): Promise<Battle | null> {
        if (battle instanceof Battle) {
            return await battleRepository.save(battle);
        }

        const battleEntity = await this.get(battle.id);

        if (!battleEntity) {
            throw new EntityNotFoundError('Battle', battle.id);
        }

        // Update only the fields that exist in the partial (excluding primary keys and timestamps)
        if (battle.bossId !== undefined) {
            battleEntity.bossId = battle.bossId;
        }
        if (battle.hostDiscordId !== undefined) {
            battleEntity.hostDiscordId = battle.hostDiscordId;
        }
        if (battle.guildId !== undefined) {
            battleEntity.guildId = battle.guildId;
        }
        if (battle.status !== undefined) {
            battleEntity.status = battle.status;
        }
        if (battle.messageId !== undefined) {
            battleEntity.messageId = battle.messageId;
        }

        return await battleRepository.save(battleEntity);
    },

    /**
     * Delete a battle entity
     * @param battle Either a full entity or an object with primary keys
     */
    async delete(battle: Battle | BattleDelete): Promise<void> {
        const battleEntity = battle instanceof Battle ? battle : await this.get(battle.id);

        if (!battleEntity) {
            throw new EntityNotFoundError('Battle', battle.id);
        }

        await battleRepository.remove(battleEntity);
    },

    /**
     * Update battle status
     * @param battleId The battle ID
     * @param status The new status
     */
    async updateStatus(battleId: string, status: string): Promise<void> {
        await battleRepository.update({ id: battleId }, { status });
    },

    // ===== BUILD EMBED METHODS =====

    /**
     * Build a Discord embed for a battle
     * @param battle The battle entity
     * @returns Discord embed builder
     */
    async buildEmbed(battle: Battle): Promise<EmbedBuilder> {
        // Fetch related entities
        const boss = await BossService.get(battle.bossId);
        if (!boss) {
            throw new Error(`Boss not found: ${battle.bossId}`);
        }

        // TODO: Convert to TypeORM when MasterPokemon is migrated
        const masterPokemon = await MasterPokemonService.get(boss.templateId);
        if (!masterPokemon) {
            throw new Error(`Master Pokémon not found for templateId: ${boss.templateId}`);
        }

        const hostTrainer = await TrainerService.get(battle.hostDiscordId);
        if (!hostTrainer) {
            throw new Error(`Host Trainer not found: ${battle.hostDiscordId}`);
        }

        const battleMembers = await BattleMemberService.getByBattleId(battle.id);

        // Get Discord objects
        const hostDiscordGuild = await client.getGuild(battle.guildId);
        if (!hostDiscordGuild) {
            throw new Error(`Host Discord Guild not found: ${battle.guildId}`);
        }

        const hostDiscordMember = await hostDiscordGuild.members.fetch(hostTrainer.discordId);

        // Get localized names
        const bossTypeName = BossService.getBossTypeName(boss);
        const battleTypeName = BossService.getBattleTypeName(boss);
        const pokemonName = await MasterPokemonService.getName(masterPokemon);
        const pokemonDescription =
            (await MasterPokemonService.getDescription(masterPokemon)) ??
            'Description not available';

        // Build title
        let title = `${bossTypeName}: `;

        // TODO: Handle Primal Groudon and Kyogre
        if (boss.isMega) {
            title += `${TranslationUtils.getMegaName()} `;
        }

        if (boss.isShadow) {
            title += `${TranslationUtils.getShadowName()} `;
        }

        title += pokemonName;

        if (masterPokemon.form !== null) {
            title += ` (${StringUtils.titleCase(masterPokemon.form)})`;
        }
        title += ` ${emoji.shiny}`;

        // Add status to title
        switch (battle.status) {
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

        const typeColor = MasterPokemonService.getTypeColor(masterPokemon);

        // Get links using service methods
        const wikiLink = await WikiLinkService.getForBoss(boss);
        const pogoHubLink = await PogoHubLinkService.getForBoss(boss);

        let link = null;
        let thumbnail = null;

        if (wikiLink) {
            link = wikiLink.page;
            thumbnail = wikiLink.image;
        }

        if (pogoHubLink) {
            link = pogoHubLink.page;
        }

        // Build description
        const hostTrainerCode = TrainerService.formatTrainerCode(hostTrainer.code) || 'N/A';
        const description =
            `To join this ${battleTypeName.toLowerCase()}, please click join below. ` +
            `If the ${battleTypeName.toLowerCase()} host is not yet on your friends list, please send a friend request to them with the code. ${bold(hostTrainerCode)}.`;

        // Get Pokemon type info
        let pokemonType = await MasterPokemonService.getTypeName(masterPokemon);
        if (masterPokemon.type2 != null) {
            pokemonType += ` / ${await MasterPokemonService.getType2Name(masterPokemon)}`;
        }

        const raidHost = hostDiscordMember.nickname ?? hostDiscordMember.user.displayName;

        // Get CP ranges
        const cpL20Min = await MasterPokemonService.getCombatPower(masterPokemon, 10, 10, 10, 20);
        const cpL20Max = await MasterPokemonService.getCombatPower(masterPokemon, 15, 15, 15, 20);
        const cpL25Min = await MasterPokemonService.getCombatPower(masterPokemon, 10, 10, 10, 25);
        const cpL25Max = await MasterPokemonService.getCombatPower(masterPokemon, 15, 15, 15, 25);

        const cpReg = `${cpL20Min} - ${cpL20Max}`;
        const cpWb = `${cpL25Min} - ${cpL25Max}`;

        // Build battle members list
        let battleMembersText = 'No Battle Members Yet';
        const battleMembersTextArray = [];

        for (const battleMember of battleMembers) {
            if (battleConfig.useTrainerNames) {
                const battleMemberTrainer = await TrainerService.get(battleMember.discordId);
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

        // Build embed
        let embed = new EmbedBuilder()
            .setColor(typeColor)
            .setTitle(title)
            .setURL(link)
            .setDescription(description)
            .setThumbnail(thumbnail);

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

        embed = embed.addFields({ name: 'Description', value: pokemonDescription });

        embed = embed.addFields(
            { name: 'CP L20', value: cpReg, inline: true },
            { name: 'CP L25 (WB)', value: cpWb, inline: true }
        );

        embed = embed.addFields({ name: 'Battle Members', value: battleMembersText });

        // Add battle status field
        let battleStatusText;
        switch (battle.status) {
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

        embed = embed.setTimestamp().setFooter({ text: `Raid hosted by ${raidHost}` });

        return embed;
    },
};
