import { dataSource } from '@/database/data-source';

import { Battle } from '@/database/entities/battle.entity';
import { BattleMember } from '@/database/entities/battle-member.entity';
import { Boss } from '@/database/entities/boss.entity';
import { GuildBattleAlert } from '@/database/entities/guild-battle-alert.entity';
import { GuildTeamRole } from '@/database/entities/guild-team-role.entity';
import { MasterCPM } from '@/database/entities/master-cpm.entity';
import { MasterPokemon } from '@/database/entities/master-pokemon.entity';
import { PogoHubLink } from '@/database/entities/pogo-hub-link.entity';
import { PokedexPokemon } from '@/database/entities/pokedex-pokemon.entity';
import { Pokedex } from '@/database/entities/pokedex.entity';
import { Trainer } from '@/database/entities/trainer.entity';
import { Translation } from '@/database/entities/translation.entity';
import { WikiLink } from '@/database/entities/wiki-link.entity';

export const battleRepository = dataSource.getRepository(Battle);
export const battleMemberRepository = dataSource.getRepository(BattleMember);
export const bossRepository = dataSource.getRepository(Boss);
export const guildBattleAlertRepository = dataSource.getRepository(GuildBattleAlert);
export const guildTeamRoleRepository = dataSource.getRepository(GuildTeamRole);
export const masterCPMRepository = dataSource.getRepository(MasterCPM);
export const masterPokemonRepository = dataSource.getRepository(MasterPokemon);
export const pogoHubLinkRepository = dataSource.getRepository(PogoHubLink);
export const pokedexPokemonRepository = dataSource.getRepository(PokedexPokemon);
export const pokedexRepository = dataSource.getRepository(Pokedex);
export const trainerRepository = dataSource.getRepository(Trainer);
export const translationRepository = dataSource.getRepository(Translation);
export const wikiLinkRepository = dataSource.getRepository(WikiLink);
