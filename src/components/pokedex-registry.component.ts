import {
    ActionRowBuilder,
    BaseInteraction,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    MessageFlags,
    ModalBuilder,
    ModalSubmitInteraction,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    StringSelectMenuOptionBuilder,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';

import { PokedexEntry, MaxPokedexId } from '@/constants.js';

import type { ButtonsComponent, SelectComponent, ModalComponent } from '@/types/component';

import { ComponentIndex, type ComponentIndexData } from '@/types/component-index.js';

// TODO: Update imports when TypeORM migration is complete
import MasterPokemon from '@/models/MasterPokemon.js';
import PokedexPokemon from '@/models/PokedexPokemon.js';

import { emoji } from '@/utils/emoji';

interface PokedexRegistryIndexData extends ComponentIndexData {
    pokedexId: number;
}

export class PokedexRegistryIndex extends ComponentIndex {
    public pokedexId: number;

    constructor(data: PokedexRegistryIndexData) {
        super(data);
        this.pokedexId = data.pokedexId;
    }

    static override parse(data: string): PokedexRegistryIndex {
        return super.parse(data) as PokedexRegistryIndex;
    }
}

const PokedexRegistryButton = {
    PrevPokemon: 'Previous',
    AllAndNext: 'All & Next',
    AllAndPrev: 'All & Prev',
    NextPokemon: 'Next',
    Notes: 'Notes',
    Exit: 'Exit',
};

export class PokedexRegistryComponent implements ButtonsComponent, ModalComponent, SelectComponent {
    name = 'PokedexRegistryComponent';
    id = 'component';
    description = 'Pokédex entry registration component with buttons, modals, and select menus';

    async show(
        interaction: ChatInputCommandInteraction | ModalSubmitInteraction,
        masterPokemon?: MasterPokemon
    ): Promise<void> {
        if (!masterPokemon) {
            throw new Error('MasterPokemon is required for PokedexRegistryComponent.show()');
        }

        await this.displayPokemon(interaction, masterPokemon);
    }

    async displayPokemon(
        interaction: BaseInteraction,
        masterPokemon: MasterPokemon
    ): Promise<void> {
        let pokedexPokemon = await PokedexPokemon.getUnique({
            discordId: interaction.user.id,
            pokedexId: masterPokemon.pokedexId,
        });

        if (!pokedexPokemon) {
            pokedexPokemon = new PokedexPokemon({
                discordId: interaction.user.id,
                pokedexId: masterPokemon.pokedexId,
            });
        }

        const embed = await pokedexPokemon.buildEmbed(masterPokemon);
        const dexEntriesRow = this.buildSelectMenu(pokedexPokemon);
        const actionsRow = this.buildButtons(masterPokemon);

        if (interaction instanceof ChatInputCommandInteraction) {
            if (!interaction.replied) {
                return await interaction.reply({
                    embeds: [embed],
                    components: [...dexEntriesRow, ...actionsRow],
                    flags: MessageFlags.Ephemeral,
                });
            } else {
                return await interaction.followUp({
                    embeds: [embed],
                    components: [...dexEntriesRow, ...actionsRow],
                    flags: MessageFlags.Ephemeral,
                });
            }
        } else if (interaction instanceof StringSelectMenuInteraction) {
            return interaction.update({
                embeds: [embed],
                components: [...dexEntriesRow, ...actionsRow],
            });
        } else if (interaction instanceof ButtonInteraction) {
            return interaction.update({
                embeds: [embed],
                components: [...dexEntriesRow, ...actionsRow],
            });
        } else if (interaction instanceof ModalSubmitInteraction) {
            if (interaction.isFromMessage() && interaction.message) {
                return interaction.update({
                    embeds: [embed],
                    components: [...dexEntriesRow, ...actionsRow],
                });
            } else {
                if (!interaction.replied) {
                    return interaction.reply({
                        embeds: [embed],
                        components: [...dexEntriesRow, ...actionsRow],
                        flags: MessageFlags.Ephemeral,
                    });
                } else {
                    return interaction.followUp({
                        embeds: [embed],
                        components: [...dexEntriesRow, ...actionsRow],
                        flags: MessageFlags.Ephemeral,
                    });
                }
            }
        }
    }

    buildSelectMenu(pokedexPokemon: PokedexPokemon) {
        const componentIndex: PokedexRegistryIndex = new PokedexRegistryIndex({
            name: this.name,
            id: 'select',
            pokedexId: pokedexPokemon.pokedexId,
        });

        const options = [
            new StringSelectMenuOptionBuilder()
                .setLabel(PokedexEntry.Caught)
                .setValue(PokedexEntry.Caught)
                .setEmoji(emoji.done)
                .setDefault(pokedexPokemon.caught ? true : false),

            new StringSelectMenuOptionBuilder()
                .setLabel(PokedexEntry.Shiny)
                .setValue(PokedexEntry.Shiny)
                .setEmoji(emoji.shiny)
                .setDefault(pokedexPokemon.shiny ? true : false),

            new StringSelectMenuOptionBuilder()
                .setLabel(PokedexEntry.Hundo)
                .setValue(PokedexEntry.Hundo)
                .setEmoji(emoji.hundo)
                .setDefault(pokedexPokemon.hundo ? true : false),

            new StringSelectMenuOptionBuilder()
                .setLabel(PokedexEntry.Lucky)
                .setValue(PokedexEntry.Lucky)
                .setEmoji(emoji.lucky.shamrock)
                .setDefault(pokedexPokemon.lucky ? true : false),

            new StringSelectMenuOptionBuilder()
                .setLabel(PokedexEntry.XXL)
                .setValue(PokedexEntry.XXL)
                .setEmoji(emoji.xxl.platinum)
                .setDefault(pokedexPokemon.xxl ? true : false),

            new StringSelectMenuOptionBuilder()
                .setLabel(PokedexEntry.XXS)
                .setValue(PokedexEntry.XXS)
                .setEmoji(emoji.xxs.platinum)
                .setDefault(pokedexPokemon.xxs ? true : false),

            new StringSelectMenuOptionBuilder()
                .setLabel(PokedexEntry.Shadow)
                .setValue(PokedexEntry.Shadow)
                .setEmoji(emoji.shadow)
                .setDefault(pokedexPokemon.shadow ? true : false),

            new StringSelectMenuOptionBuilder()
                .setLabel(PokedexEntry.Purified)
                .setValue(PokedexEntry.Purified)
                .setEmoji(emoji.purified)
                .setDefault(pokedexPokemon.purified ? true : false),
        ];

        const selectDexEntries = new StringSelectMenuBuilder()
            .setCustomId(componentIndex.toString())
            .setPlaceholder('Select Dex Entries')
            .setMinValues(0)
            .setMaxValues(options.length)
            .addOptions(options);

        const dexEntriesRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            selectDexEntries
        );

        return [dexEntriesRow];
    }

    async handleStringSelectMenu(interaction: StringSelectMenuInteraction): Promise<void> {
        const customId: PokedexRegistryIndexData = JSON.parse(interaction.customId);

        const discordId = interaction.user.id;
        const pokedexId = customId.pokedexId;
        const selectedEntries = interaction.values;

        const masterPokemon = await MasterPokemon.getUnique({
            pokedexId: pokedexId,
            form: null,
        });
        if (!masterPokemon) {
            throw new Error(`Master Pokemon not found for pokedex id ${pokedexId}`);
        }

        let pokedexPokemon = await PokedexPokemon.getUnique({
            discordId: discordId,
            pokedexId: pokedexId,
        });

        if (!pokedexPokemon) {
            pokedexPokemon = new PokedexPokemon({
                discordId: discordId,
                pokedexId: pokedexId,
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
        return this.displayPokemon(interaction, masterPokemon);
    }

    buildButtons(masterPokemon: MasterPokemon) {
        let buttonIndex = new PokedexRegistryIndex({
            name: this.name,
            id: '',
            pokedexId: masterPokemon.pokedexId,
        });

        // Create the buttons
        buttonIndex.id = PokedexRegistryButton.PrevPokemon;
        const prevButton = new ButtonBuilder()
            .setCustomId(buttonIndex.toString())
            .setLabel(PokedexRegistryButton.PrevPokemon)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emoji.previous);

        buttonIndex.id = PokedexRegistryButton.NextPokemon;
        const nextButton = new ButtonBuilder()
            .setCustomId(buttonIndex.toString())
            .setLabel(PokedexRegistryButton.NextPokemon)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emoji.next);

        buttonIndex.id = PokedexRegistryButton.AllAndNext;
        const allAndNextButton = new ButtonBuilder()
            .setCustomId(buttonIndex.toString())
            .setLabel(PokedexRegistryButton.AllAndNext)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emoji.all);

        buttonIndex.id = PokedexRegistryButton.AllAndPrev;
        const allAndPrevButton = new ButtonBuilder()
            .setCustomId(buttonIndex.toString())
            .setLabel(PokedexRegistryButton.AllAndPrev)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emoji.all);

        buttonIndex.id = PokedexRegistryButton.Notes;
        const notesButton = new ButtonBuilder()
            .setCustomId(buttonIndex.toString())
            .setLabel(PokedexRegistryButton.Notes)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emoji.note);

        buttonIndex.id = PokedexRegistryButton.Exit;
        const exitButton = new ButtonBuilder()
            .setCustomId(buttonIndex.toString())
            .setLabel(PokedexRegistryButton.Exit)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emoji.exit);

        if (masterPokemon.pokedexId === 1) {
            return [
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    notesButton,
                    allAndNextButton,
                    nextButton,
                    exitButton
                ),
            ];
        }

        if (masterPokemon.pokedexId === MaxPokedexId) {
            return [
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    prevButton,
                    allAndPrevButton,
                    notesButton,
                    exitButton
                ),
            ];
        }

        return [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                prevButton,
                notesButton,
                allAndNextButton,
                nextButton,
                exitButton
            ),
        ];
    }

    async handleButton(interaction: ButtonInteraction): Promise<void> {
        const buttonIndex = PokedexRegistryIndex.parse(interaction.customId);
        const pokedexId = buttonIndex.pokedexId;

        if (!buttonIndex.pokedexId) {
            await interaction.reply({
                content: 'Could not get the current Pokédex ID',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        let pokedexPokemon = await PokedexPokemon.getUnique({
            discordId: interaction.user.id,
            pokedexId: pokedexId,
        });
        if (!pokedexPokemon) {
            pokedexPokemon = new PokedexPokemon({
                discordId: interaction.user.id,
                pokedexId: pokedexId,
            });
            await pokedexPokemon.create();
        }

        if (buttonIndex.id === PokedexRegistryButton.Notes) {
            const modal = this.buildNotesModal(pokedexPokemon);
            await interaction.showModal(modal);
            return;
        }

        if (
            buttonIndex.id === PokedexRegistryButton.AllAndNext ||
            buttonIndex.id === PokedexRegistryButton.AllAndPrev
        ) {
            pokedexPokemon.setAllEntries();
            await pokedexPokemon.update();
        }

        if (
            buttonIndex.id === PokedexRegistryButton.NextPokemon ||
            buttonIndex.id === PokedexRegistryButton.AllAndNext
        ) {
            if (pokedexId === MaxPokedexId) {
                await interaction.reply({
                    content: 'You are at the last Pokémon',
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }

            const masterPokemon = await MasterPokemon.getUnique({
                pokedexId: pokedexId + 1,
                form: null,
            });
            if (!masterPokemon) {
                await interaction.reply({
                    content: `Could not get Pokémon for Pokédex ID ${pokedexId + 1}`,
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }

            return this.displayPokemon(interaction, masterPokemon);
        }

        if (
            buttonIndex.id === PokedexRegistryButton.PrevPokemon ||
            buttonIndex.id === PokedexRegistryButton.AllAndPrev
        ) {
            if (pokedexId === 1) {
                await interaction.reply({
                    content: 'You are at the first Pokémon',
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }

            const masterPokemon = await MasterPokemon.getUnique({
                pokedexId: pokedexId - 1,
                form: null,
            });
            if (!masterPokemon) {
                await interaction.reply({
                    content: `Could not get Pokémon for Pokédex ID ${pokedexId - 1}`,
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }

            return this.displayPokemon(interaction, masterPokemon);
        }

        if (buttonIndex.id === PokedexRegistryButton.Exit) {
            await interaction.update({
                embeds: [await pokedexPokemon.buildEmbed()],
                components: [],
            });
            return;
        }
    }

    buildNotesModal(pokedexPokemon: PokedexPokemon) {
        const modalIndex = new PokedexRegistryIndex({
            name: this.name,
            id: 'modal',
            pokedexId: pokedexPokemon.pokedexId,
        });

        const modal = new ModalBuilder()
            .setCustomId(modalIndex.toString())
            .setTitle('Pokédex Notes');

        const notesInput = new TextInputBuilder()
            .setCustomId('notes')
            .setLabel('Notes')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false);

        if (pokedexPokemon.notes) {
            notesInput.setValue(pokedexPokemon.notes);
        }

        modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(notesInput));

        return modal;
    }

    async handleModalSubmit(interaction: ModalSubmitInteraction): Promise<void> {
        const notes = interaction.fields.getTextInputValue('notes');
        const modalIndex = PokedexRegistryIndex.parse(interaction.customId);
        const pokedexId = modalIndex.pokedexId;

        const pokedexPokemon = await PokedexPokemon.getUnique({
            discordId: interaction.user.id,
            pokedexId: pokedexId,
        });

        if (!pokedexPokemon) {
            await interaction.reply({
                content: `Could not find Pokédex entry for Pokédex ID ${pokedexId}`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        pokedexPokemon.notes = notes;
        await pokedexPokemon.update();

        const masterPokemon = await MasterPokemon.getUnique({
            pokedexId: pokedexId,
            form: null,
        });
        if (!masterPokemon) {
            await interaction.reply({
                content: `Could not find Master Pokémon for Pokédex ID ${pokedexId}`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        void this.displayPokemon(interaction, masterPokemon);
    }
}

export const component = new PokedexRegistryComponent();
