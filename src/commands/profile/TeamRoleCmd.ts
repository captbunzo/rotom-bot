import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    roleMention
} from 'discord.js';

import { Team } from '#src/Constants.js';
import GuildTeamRole from '#src/models/GuildTeamRole.js';

const TeamRoleCmd = {
    global: true,
	data: new SlashCommandBuilder()
		.setName('team-role')
		.setDescription('Configure team roles')
        .addSubcommand(subCommand => subCommand
            .setName('set')
            .setDescription('Set a team role')
            .addStringOption(option => option
                .setName('team')
                .setDescription('Pokémon Team')
                .setRequired(true)
                .addChoices(
                    { name: Team.Instinct, value: Team.Instinct },
                    { name: Team.Mystic, value: Team.Mystic },
                    { name: Team.Valor, value: Team.Valor }
                )
            )
            .addRoleOption(option => option
                .setName('role')
                .setDescription('Discord role')
                .setRequired(true)
            )
        )
        .addSubcommand(subCommand => subCommand
            .setName('clear')
            .setDescription('Clear a team role')
            .addStringOption(option => option
                .setName('team')
                .setDescription('Pokémon Team')
                .setRequired(true)
                .addChoices(
                    { name: Team.Instinct, value: Team.Instinct },
                    { name: Team.Mystic, value: Team.Mystic },
                    { name: Team.Valor, value: Team.Valor }
                )
            )
        )
        .addSubcommand(subCommand => subCommand
            .setName('clear-all')
            .setDescription('Clear all team roles')
        )
        .addSubcommand(subCommand => subCommand
            .setName('list')
            .setDescription('List all team roles')
        ),

	async execute(interaction: ChatInputCommandInteraction) {
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'set'       : this.executeSet(interaction); break;
            case 'clear'     : this.executeClear(interaction); break;
            case 'clear-all' : this.executeClearAll(interaction); break;
            case 'list'      : this.executeList(interaction); break;
            default :
                await interaction.reply({
                    content: `Pokémon team role management execution not yet implemented for subcommand -- ${subCommand}`
                }); 
        }
	},

    /*******************************
     * Subcommand :: Set team role *
     *******************************/

    async executeSet(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            throw new Error('interaction.guild is undefined');
        }

        const guildId = interaction.guild.id;
        const role = interaction.options.getRole('role');
        const team = interaction.options.getString('team');

        if (!role) {
            throw new Error('Required option role does not have a value');
        }

        if (!team) {
            throw new Error('Required option team does not have a value');
        }

        // Check if the team role already exists
        const guildTeamRole = await GuildTeamRole.getUnique({ guildId: guildId, team: team });

        if (!guildTeamRole) {
            // Create a new team role
            const newGuildTeamRole = new GuildTeamRole({
                guildId: guildId,
                team: team,
                roleId: role.id
            });
            await newGuildTeamRole.create();
        } else {
            // Update the existing team role
            guildTeamRole.roleId = role.id;
            await guildTeamRole.update();
        }

        await interaction.reply({
            content: `Set team role for ${team} to ${roleMention(role.id)}`
        }); 
    },

    /*********************************
     * Subcommand :: Clear team role *
     *********************************/

    async executeClear(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            throw new Error('interaction.guild is undefined');
        }

        const guildId = interaction.guild.id;
        const team = interaction.options.getString('team');

        if (!team) {
            throw new Error('Required option team does not have a value');
        }

        // Check if the team role exists
        const guildTeamRole = await GuildTeamRole.getUnique({ guildId: guildId, team: team });

        if (guildTeamRole) {
            // Delete the existing team role
            await guildTeamRole.delete();
            await interaction.reply({
                content: `Cleared team role for ${team}`
            });
        } else {
            await interaction.reply({
                content: `Role is not set for ${team}`
            });
        }
    },

    /**************************************
     * Subcommand :: Clear all team roles *
     **************************************/

    async executeClearAll(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            throw new Error('interaction.guild is undefined');
        }
        const guildId = interaction.guild.id;

        // Get all team roles for the guild
        const guildTeamRoles = await GuildTeamRole.get({ guildId: guildId });

        if (guildTeamRoles.length > 0) {
            // Delete all team roles
            for (const guildTeamRole of guildTeamRoles) {
                await guildTeamRole.delete();
            }
            await interaction.reply({
                content: `Cleared all team roles`
            });
        } else {
            await interaction.reply({
                content: `No team roles are set`
            });
        }
    },

    /*********************************
     * Subcommand :: List team roles *
     *********************************/

    async executeList(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            throw new Error('interaction.guild is undefined');
        }
        const guildId = interaction.guild.id;

        // Get all team roles for the guild
        const guildTeamRoles = await GuildTeamRole.get({ guildId: guildId });

        if (guildTeamRoles.length > 0) {
            // List all team roles
            let response = `Team roles:\n`;

            for (const guildTeamRole of guildTeamRoles) {
                response += `- ${guildTeamRole.team}: ${roleMention(guildTeamRole.roleId)}\n`;
            }
            await interaction.reply({
                content: response
            });
        } else {
            await interaction.reply({
                content: `No team roles are set`
            });
        }
    }
};

export default TeamRoleCmd;