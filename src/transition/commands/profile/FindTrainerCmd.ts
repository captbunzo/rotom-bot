import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    MessageFlags,
    SlashCommandBuilder,
    userMention,
} from 'discord.js';

import Client from '@/client.js';
const client = Client.getInstance();

import { MaxAutoCompleteChoices } from '@/constants.js';
import Trainer from '@/models/Trainer.js';

const FindProfileOption = {
    DiscordUsername: 'discord-username',
    TrainerName: 'trainer-name',
    FirstName: 'first-name',
};

const FindTrainerCmd = {
    global: true,
    data: new SlashCommandBuilder()
        .setName('find-trainer')
        .setDescription('Find a trainer profile')
        .addUserOption((option) =>
            option
                .setName(FindProfileOption.DiscordUsername)
                .setDescription('Trainer discord user')
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName(FindProfileOption.TrainerName)
                .setDescription('Trainer name')
                .setAutocomplete(true)
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName(FindProfileOption.FirstName)
                .setDescription('First name')
                .setAutocomplete(true)
                .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        let discordUser = interaction.options.getUser(FindProfileOption.DiscordUsername);
        let trainerName = interaction.options.getString(FindProfileOption.TrainerName);
        let firstName = interaction.options.getString(FindProfileOption.FirstName);

        let optionsCount = 0;

        if (discordUser) ++optionsCount;
        if (trainerName) ++optionsCount;
        if (firstName) ++optionsCount;

        if (optionsCount > 1) {
            return await interaction.reply({
                content: `Please provide only one search option (discord-user, trainer-name, or first-name)`,
                flags: MessageFlags.Ephemeral,
            });
        }

        let trainers: Trainer[] = [];
        let reference;

        if (discordUser) {
            trainers = await Trainer.get({ discordId: discordUser.id });
            reference = userMention(discordUser.id);
        } else if (trainerName) {
            trainers = await Trainer.get({ trainerName: trainerName });
            reference = trainerName;
        } else if (firstName) {
            trainers = await Trainer.get({ firstName: firstName });
            reference = firstName;
        }

        if (trainers.length === 0) {
            return await interaction.reply({
                content: `Trainer ${reference} not found or has not yet setup a profile`,
                flags: MessageFlags.Ephemeral,
            });
        }

        // Defer reply so we can use interaction.followUp()
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral,
        });
        const limit: number = 5;

        if (trainers.length > limit) {
            await interaction.followUp({
                content: `Found ${trainers.length} trainers matching ${reference}. Showing first 5 results:`,
                flags: MessageFlags.Ephemeral,
            });
        }

        trainers = trainers.slice(0, limit);
        if (interaction.commandName === 'find-trainer') {
            for (const trainer of trainers) {
                const embed = await trainer.buildEmbed();
                await interaction.followUp({
                    embeds: [embed],
                    flags: MessageFlags.Ephemeral,
                });
            }
            return;
        }

        if (interaction.commandName === 'get-trainer-code') {
            if (trainers.length === 1) {
                const trainer = trainers[0];
                if (!trainer) throw new Error(`trainers[0] is undefined`);

                reference = userMention(trainer.discordId) + ' - ';
                reference += trainer.trainerName || 'Trainer Name not Set';
                if (trainer.firstName) {
                    reference += ` (${trainer.firstName})`;
                }

                if (trainer.code) {
                    await interaction.followUp({
                        content: `Trainer code for ${reference}`,
                        flags: MessageFlags.Ephemeral,
                    });
                    await interaction.followUp({
                        content: trainer.code,
                        flags: MessageFlags.Ephemeral,
                    });
                } else {
                    await interaction.followUp({
                        content: `${reference} has not set their trainer code`,
                        flags: MessageFlags.Ephemeral,
                    });
                }

                return;
            }

            // Multiple trainers found
            let trainerCodeContents: string[] = [];

            for (const trainer of trainers) {
                reference = userMention(trainer.discordId) + ' - ';
                reference += trainer.trainerName || 'Trainer Name not Set';
                if (trainer.firstName) {
                    reference += ` (${trainer.firstName})`;
                }

                if (trainer.code) {
                    trainerCodeContents.push(`${reference}: ${trainer.code}`);
                } else {
                    trainerCodeContents.push(`${reference}: Has not set their trainer code`);
                }
            }

            let content: string = '';
            if (trainerName) {
                content = `Trainer codes matching trainer name: ${trainerName}`;
            } else if (firstName) {
                content = `Trainer codes matching first name: ${firstName}`;
            }
            content += '```' + trainerCodeContents.join('\n') + '```';

            return await interaction.followUp({
                content: content,
                flags: MessageFlags.Ephemeral,
            });
        }

        return;
    },

    async autocomplete(interaction: AutocompleteInteraction) {
        const focusedOption = interaction.options.getFocused(true);
        let choices: string[] = [];

        if (focusedOption.name == FindProfileOption.TrainerName) {
            choices = await Trainer.getTrainerNameChoices(focusedOption.value);
        } else if (focusedOption.name == FindProfileOption.FirstName) {
            choices = await Trainer.getFirstNameChoices(focusedOption.value);
        }

        client.logger.debug('FindTrainerCmd.autocomplete()');
        client.logger.debug('focusedOption');
        client.logger.dump(focusedOption);
        client.logger.debug('choices');
        client.logger.dump(choices);

        if (choices.length <= MaxAutoCompleteChoices) {
            await interaction.respond(choices.map((choice) => ({ name: choice, value: choice })));
            return;
        }

        await interaction.respond([]);
    },
};
