import {
    ActionRowBuilder,
    BaseInteraction,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    MessageFlags,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    StringSelectMenuOptionBuilder
} from 'discord.js';

import {
    PokedexEntry,
    MaxPokedexId
} from '#src/Constants.js';

import Client from '#src/Client.js';
import MasterPokemon from '#src/models/MasterPokemon.js';
import PokedexPokemon from '#src/models/PokedexPokemon.js';

interface PokedexRegisterCustomId {
    name: string;
    type: string;
    pokedexId: number;
}

const Done        = 'Done';
const NextPokemon = 'Next';
const PrevPokemon = 'Previous';
const AllAndNext  = 'All & Next';
const NoneAndNext = 'None & Next';

const PokedexRegisterComponent = {
    name: 'PokedexRegisterComponent',

    // ChatInputCommandInteraction
    async show(interaction: BaseInteraction, masterPokemon: MasterPokemon) {
        let pokedexPokemon = await PokedexPokemon.getUnique({ discordId: interaction.user.id, pokedexId: masterPokemon.pokedexId });
        
        if (!pokedexPokemon) {
            pokedexPokemon = new PokedexPokemon({
                discordId: interaction.user.id,
                pokedexId: masterPokemon.pokedexId
            })
        }

        const embed = await pokedexPokemon.buildEmbed(masterPokemon);
        const dexEntriesRow = this.buildSelectMenu(pokedexPokemon);
        const actionsRow = this.buildButtons(masterPokemon);

        if (interaction instanceof ChatInputCommandInteraction) {
            if (!interaction.replied) {
                return await interaction.reply({
                    embeds: [embed],
                    components: [...dexEntriesRow, ...actionsRow],
                    flags: MessageFlags.Ephemeral
                });
            } else {
                return await interaction.followUp({
                    embeds: [embed],
                    components: [...dexEntriesRow, ...actionsRow],
                    flags: MessageFlags.Ephemeral
                });
            }
        
        } else if (interaction instanceof StringSelectMenuInteraction) {
            const stringSelectMenuInteraction = interaction satisfies StringSelectMenuInteraction;
            stringSelectMenuInteraction.update({
                embeds: [embed],
                components: [...dexEntriesRow, ...actionsRow]
            });

        } else if (interaction instanceof ButtonInteraction) {
            const buttonInteraction = interaction satisfies ButtonInteraction;
            buttonInteraction.update({
                embeds: [embed],
                components: [...dexEntriesRow, ...actionsRow]
            });
        }

        return;
    },

    buildSelectMenu(pokedexPokemon: PokedexPokemon) {
        const customId: PokedexRegisterCustomId = {
            name: this.name,
            type: 'select',
            pokedexId: pokedexPokemon.pokedexId
        }

        const selectDexEntries = new StringSelectMenuBuilder()
            .setCustomId(JSON.stringify(customId))
            .setPlaceholder('Select Dex Entries')
            .setMinValues(0)
            .setMaxValues(8)
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(PokedexEntry.Caught)
                    .setValue(PokedexEntry.Caught)
                    .setDefault(pokedexPokemon.caught ? true : false),
                new StringSelectMenuOptionBuilder()
                    .setLabel(PokedexEntry.Shiny)
                    .setValue(PokedexEntry.Shiny)
                    .setDefault(pokedexPokemon.shiny ? true : false),
                new StringSelectMenuOptionBuilder()
                    .setLabel(PokedexEntry.Hundo)
                    .setValue(PokedexEntry.Hundo)
                    .setDefault(pokedexPokemon.hundo ? true : false),
                new StringSelectMenuOptionBuilder()
                    .setLabel(PokedexEntry.Lucky)
                    .setValue(PokedexEntry.Lucky)
                    .setDefault(pokedexPokemon.lucky ? true : false),
                new StringSelectMenuOptionBuilder()
                    .setLabel(PokedexEntry.XXL)
                    .setValue(PokedexEntry.XXL)
                    .setDefault(pokedexPokemon.xxl ? true : false),
                new StringSelectMenuOptionBuilder()
                    .setLabel(PokedexEntry.XXS)
                    .setValue(PokedexEntry.XXS)
                    .setDefault(pokedexPokemon.xxs ? true : false),
                new StringSelectMenuOptionBuilder()
                    .setLabel(PokedexEntry.Shadow)
                    .setValue(PokedexEntry.Shadow)
                    .setDefault(pokedexPokemon.shadow ? true : false),
                new StringSelectMenuOptionBuilder()
                    .setLabel(PokedexEntry.Purified)
                    .setValue(PokedexEntry.Purified)
                    .setDefault(pokedexPokemon.purified ? true : false)
            );

        const dexEntriesRow = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(selectDexEntries);
        
        return [dexEntriesRow];
    },

    async handleStringSelectMenu(interaction: StringSelectMenuInteraction) {
        const client = interaction.client as Client;
        const customId: PokedexRegisterCustomId = JSON.parse(interaction.customId);

        const discordId = interaction.user.id;
        const pokedexId = customId.pokedexId;
        const selectedEntries = interaction.values;

        client.logger.dump(customId);
        client.logger.dump({
            discordId: discordId,
            pokedexId: pokedexId,
            values: selectedEntries
        });

        const masterPokemon = await MasterPokemon.getUnique({ pokedexId: pokedexId, form: null });
        if (!masterPokemon) {
            throw new Error(`Master Pokemon not found for pokedex id ${pokedexId}`);
        }

        let pokedexPokemon = await PokedexPokemon.getUnique({ discordId: discordId, pokedexId: pokedexId });

        if (!pokedexPokemon) {
            pokedexPokemon = new PokedexPokemon({
                discordId: discordId,
                pokedexId: pokedexId
            });
            await pokedexPokemon.create();
        }

        const allEntries: string[] = Object.values(PokedexEntry);
        allEntries.forEach((entry) => {
            pokedexPokemon.setEntry(entry as PokedexEntry, selectedEntries.includes(entry));
        });

        if (selectedEntries.length > 0) {
            pokedexPokemon.setEntry(PokedexEntry.Caught, true);
        }

        await pokedexPokemon.update();
        return this.show(interaction, masterPokemon);
    },

    buildButtons(masterPokemon: MasterPokemon) {
        const prevButton = new ButtonBuilder()
            .setCustomId(`${this.name}.${PrevPokemon}.${masterPokemon.pokedexId}`)
            .setLabel(PrevPokemon)
            .setStyle(ButtonStyle.Primary)
            .setEmoji('⬅️');

        const nextButton = new ButtonBuilder()
            .setCustomId(`${this.name}.${NextPokemon}.${masterPokemon.pokedexId}`)
            .setLabel(NextPokemon)
            .setStyle(ButtonStyle.Primary)
            .setEmoji('➡️');
        
        const allAndNextButton = new ButtonBuilder()
            .setCustomId(`${this.name}.${AllAndNext}.${masterPokemon.pokedexId}`)
            .setLabel(AllAndNext)
            .setStyle(ButtonStyle.Danger);

        const noneAndNextButton = new ButtonBuilder()
            .setCustomId(`${this.name}.${NoneAndNext}.${masterPokemon.pokedexId}`)
            .setLabel(NoneAndNext)
            .setStyle(ButtonStyle.Danger);

        const doneButton = new ButtonBuilder()
            .setCustomId(`${this.name}.${Done}.${masterPokemon.pokedexId}`)
            .setLabel(Done)
            .setStyle(ButtonStyle.Success)
            .setEmoji('✅');

        if (masterPokemon.pokedexId === 1) {
            return [ new ActionRowBuilder<ButtonBuilder>()
                .addComponents(nextButton, allAndNextButton, noneAndNextButton, doneButton) ];
        }

        if (masterPokemon.pokedexId === MaxPokedexId) {
            return [ new ActionRowBuilder<ButtonBuilder>()
                .addComponents(prevButton, allAndNextButton, noneAndNextButton, doneButton) ];
        }

        return [ new ActionRowBuilder<ButtonBuilder>()
            .addComponents(prevButton, nextButton, allAndNextButton, noneAndNextButton, doneButton) ];
    },

    async handleButton(interaction: ButtonInteraction) {
        const [_name, type, pokedexId] = interaction.customId.split('.');

        if (!pokedexId) {
            return await interaction.reply({
                content: 'Could not get the current Pokédex ID',
                ephemeral: true
            });
        }

        let pokedexPokemon =await PokedexPokemon.getUnique({ discordId: interaction.user.id, pokedexId: parseInt(pokedexId) });
        if (!pokedexPokemon) {
            pokedexPokemon = new PokedexPokemon({ discordId: interaction.user.id, pokedexId: parseInt(pokedexId) });
            await pokedexPokemon.create();
        }

        if (type === AllAndNext) {
            pokedexPokemon.setAllEntries();
            await pokedexPokemon.update();
        }

        if (type === NoneAndNext) {
            pokedexPokemon.clearAllEntries();
            await pokedexPokemon.update();
        }
        
        if (type == NextPokemon || type === AllAndNext || type === NoneAndNext) {
            if (parseInt(pokedexId) === MaxPokedexId) {
                return await interaction.reply({
                    content: 'You are at the last Pokémon',
                    ephemeral: true
                });
            }

            const masterPokemon = await MasterPokemon.getUnique({ pokedexId: parseInt(pokedexId) + 1, form: null });
            if (!masterPokemon) {
                return await interaction.reply({
                    content: `Could not get Pokémon for Pokédex ID ${parseInt(pokedexId) + 1}`,
                    ephemeral: true
                });
            }

            return this.show(interaction, masterPokemon);
        }

        if (type == PrevPokemon) {
            if (parseInt(pokedexId) === 1) {
                return await interaction.reply({
                    content: 'You are at the first Pokémon',
                    ephemeral: true
                });
            }

            const masterPokemon = await MasterPokemon.getUnique({ pokedexId: parseInt(pokedexId) - 1, form: null });
            if (!masterPokemon) {
                return await interaction.reply({
                    content: `Could not get Pokémon for Pokédex ID ${parseInt(pokedexId) - 1}`,
                    ephemeral: true
                });
            }

            return this.show(interaction, masterPokemon);
        }

        if (type === Done) {
            return await interaction.update({
                embeds: [await pokedexPokemon.buildEmbed()],
                components: []
            });
        }

        return;
    }
}

export default PokedexRegisterComponent;