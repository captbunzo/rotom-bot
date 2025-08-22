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
    TextInputStyle
} from 'discord.js';

import {
    PokedexEntry,
    MaxPokedexId
} from '#src/Constants.js';

import Client from '#src/Client.js';

import { ComponentIndex, type ComponentIndexData } from '#src/types/ComponentIndex.js';
import MasterPokemon from '#src/models/MasterPokemon.js';
import PokedexPokemon from '#src/models/PokedexPokemon.js';

interface PokedexRegisteryIndexData extends ComponentIndexData {
    pokedexId: number;
}

export class PokedexRegisteryIndex extends ComponentIndex {
    public pokedexId: number;

    constructor(data: PokedexRegisteryIndexData) {
        super(data);
        this.pokedexId = data.pokedexId;
    }

    static override parse(data: string): PokedexRegisteryIndex {
        return super.parse(data) as PokedexRegisteryIndex;
    }
}

const PokedexRegistryButton = {
    PrevPokemon: 'Previous',
    AllAndNext: 'All & Next',
    AllAndPrev: 'All & Prev',
    NextPokemon: 'Next',
    Notes: 'Notes',
    Exit: 'Exit'
}

const PokedexRegisteryComponent = {
    name: 'PokedexRegisteryComponent',

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
            return stringSelectMenuInteraction.update({
                embeds: [embed],
                components: [...dexEntriesRow, ...actionsRow]
            });

        } else if (interaction instanceof ButtonInteraction) {
            const buttonInteraction = interaction satisfies ButtonInteraction;
            return buttonInteraction.update({
                embeds: [embed],
                components: [...dexEntriesRow, ...actionsRow]
            });

        } else if (interaction instanceof ModalSubmitInteraction) {
            if (interaction.isFromMessage() && interaction.message) {
                const messageComponentInteraction = interaction satisfies ModalSubmitInteraction;
                return messageComponentInteraction.update({
                    embeds: [embed],
                    components: [...dexEntriesRow, ...actionsRow]
                });

            } else { 
                const modalInteraction = interaction satisfies ModalSubmitInteraction;

                if (!modalInteraction.replied) {
                    return modalInteraction.reply({
                        embeds: [embed],
                        components: [...dexEntriesRow, ...actionsRow]
                    });
                } else {
                    return modalInteraction.followUp({
                        embeds: [embed],
                        components: [...dexEntriesRow, ...actionsRow]
                    });
                }
            }
        }

        return;
    },

    buildSelectMenu(pokedexPokemon: PokedexPokemon) {
        const client = Client.getInstance();
        const emoji = client.config.emoji;

        const componentIndex: PokedexRegisteryIndex = new PokedexRegisteryIndex({
            name: this.name,
            id: 'select',
            pokedexId: pokedexPokemon.pokedexId
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
                .setDefault(pokedexPokemon.purified ? true : false)
        ];

        const selectDexEntries = new StringSelectMenuBuilder()
            .setCustomId(componentIndex.toString())
            .setPlaceholder('Select Dex Entries')
            .setMinValues(0)
            .setMaxValues(options.length)
            .addOptions(options);

        const dexEntriesRow = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(selectDexEntries);
        
        return [dexEntriesRow];
    },

    async handleStringSelectMenu(interaction: StringSelectMenuInteraction) {
        const client = Client.getInstance();
        const customId: PokedexRegisteryIndexData = JSON.parse(interaction.customId);

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
        const client = Client.getInstance();
        const emoji = client.config.emoji;

        let buttonIndex = new PokedexRegisteryIndex({
            name: this.name,
            id: '',
            pokedexId: masterPokemon.pokedexId
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
            return [ new ActionRowBuilder<ButtonBuilder>()
                .addComponents(notesButton, allAndNextButton, nextButton, exitButton) ];
        }

        if (masterPokemon.pokedexId === MaxPokedexId) {
            return [ new ActionRowBuilder<ButtonBuilder>()
                .addComponents(prevButton, allAndPrevButton, notesButton, exitButton) ];
        }

        return [ new ActionRowBuilder<ButtonBuilder>()
            .addComponents(prevButton, notesButton, allAndNextButton, nextButton, exitButton) ];
    },

    async handleButton(interaction: ButtonInteraction) {
        const buttonIndex = PokedexRegisteryIndex.parse(interaction.customId);
        const pokedexId = buttonIndex.pokedexId;

        if (!buttonIndex.pokedexId) {
            return await interaction.reply({
                content: 'Could not get the current Pokédex ID',
                ephemeral: true
            });
        }

        let pokedexPokemon =await PokedexPokemon.getUnique({ discordId: interaction.user.id, pokedexId: pokedexId });
        if (!pokedexPokemon) {
            pokedexPokemon = new PokedexPokemon({ discordId: interaction.user.id, pokedexId: pokedexId });
            await pokedexPokemon.create();
        }

        if (buttonIndex.id === PokedexRegistryButton.Notes) {
            const modal = this.buildNotesModal(pokedexPokemon);
            return await interaction.showModal(modal);
        }

        if (buttonIndex.id === PokedexRegistryButton.AllAndNext || buttonIndex.id === PokedexRegistryButton.AllAndPrev) {
            pokedexPokemon.setAllEntries();
            await pokedexPokemon.update();
        }

        if (buttonIndex.id === PokedexRegistryButton.NextPokemon || buttonIndex.id === PokedexRegistryButton.AllAndNext) {
            if (pokedexId === MaxPokedexId) {
                return await interaction.reply({
                    content: 'You are at the last Pokémon',
                    ephemeral: true
                });
            }

            const masterPokemon = await MasterPokemon.getUnique({ pokedexId: pokedexId + 1, form: null });
            if (!masterPokemon) {
                return await interaction.reply({
                    content: `Could not get Pokémon for Pokédex ID ${pokedexId + 1}`,
                    ephemeral: true
                });
            }

            return this.show(interaction, masterPokemon);
        }

        if (buttonIndex.id === PokedexRegistryButton.PrevPokemon || buttonIndex.id === PokedexRegistryButton.AllAndPrev) {
            if (pokedexId === 1) {
                return await interaction.reply({
                    content: 'You are at the first Pokémon',
                    ephemeral: true
                });
            }

            const masterPokemon = await MasterPokemon.getUnique({ pokedexId: pokedexId - 1, form: null });
            if (!masterPokemon) {
                return await interaction.reply({
                    content: `Could not get Pokémon for Pokédex ID ${pokedexId - 1}`,
                    ephemeral: true
                });
            }

            return this.show(interaction, masterPokemon);
        }

        if (buttonIndex.id === PokedexRegistryButton.Exit) {
            return await interaction.update({
                embeds: [await pokedexPokemon.buildEmbed()],
                components: []
            });
        }

        return;
    },

    buildNotesModal(pokedexPokemon: PokedexPokemon) {
        const modalIndex = new PokedexRegisteryIndex({
            name: this.name,
            id: 'modal',
            pokedexId: pokedexPokemon.pokedexId
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

        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(notesInput)
        );

        return modal;
    },

    async handleModalSubmit(interaction: ModalSubmitInteraction) {
        const notes = interaction.fields.getTextInputValue('notes');
        const modalIndex = PokedexRegisteryIndex.parse(interaction.customId);
        const pokedexId = modalIndex.pokedexId;

        const pokedexPokemon = await PokedexPokemon.getUnique({
            discordId: interaction.user.id,
            pokedexId: pokedexId
        });

        if (!pokedexPokemon) {
            return await interaction.reply({
                content: `Could not find Pokédex entry for Pokédex ID ${pokedexId}`,
                ephemeral: true
            });
        }

        pokedexPokemon.notes = notes;
        await pokedexPokemon.update();

        const masterPokemon = await MasterPokemon.getUnique({ pokedexId: pokedexId, form: null });
        if (!masterPokemon) {
            return await interaction.reply({
                content: `Could not find Master Pokémon for Pokédex ID ${pokedexId}`,
                ephemeral: true
            });
        }

        return this.show(interaction, masterPokemon);
    }
}

export default PokedexRegisteryComponent;