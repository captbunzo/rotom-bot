import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle
} from 'discord.js';

import { MaxPokedexId } from '#src/Constants.js';

import PokedexRegister from '#src/components/compound/PokedexRegister.js';

import MasterPokemon from '#src/models/MasterPokemon.js';
import PokedexPokemon from '#src/models/PokedexPokemon.js';

const Done        = 'Done';
const NextPokemon = 'Next';
const PrevPokemon = 'Previous';
const AllAndNext  = 'All & Next';
const NoneAndNext = 'None & Next';

const PokedexRegisterButtons = {
    data: {
        name: 'PokedexRegister'
    },

    build(masterPokemon: MasterPokemon) {
        const prevButton = new ButtonBuilder()
            .setCustomId(`${this.data.name}.${PrevPokemon}.${masterPokemon.pokedexId}`)
            .setLabel(PrevPokemon)
            .setStyle(ButtonStyle.Primary)
            .setEmoji('⬅️');

        const nextButton = new ButtonBuilder()
            .setCustomId(`${this.data.name}.${NextPokemon}.${masterPokemon.pokedexId}`)
            .setLabel(NextPokemon)
            .setStyle(ButtonStyle.Primary)
            .setEmoji('➡️');
        
        const allAndNextButton = new ButtonBuilder()
            .setCustomId(`${this.data.name}.${AllAndNext}.${masterPokemon.pokedexId}`)
            .setLabel(AllAndNext)
            .setStyle(ButtonStyle.Danger);

        const noneAndNextButton = new ButtonBuilder()
            .setCustomId(`${this.data.name}.${NoneAndNext}.${masterPokemon.pokedexId}`)
            .setLabel(NoneAndNext)
            .setStyle(ButtonStyle.Danger);

        const doneButton = new ButtonBuilder()
            .setCustomId(`${this.data.name}.${Done}.${masterPokemon.pokedexId}`)
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

    async handle(interaction: ButtonInteraction) {
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

            return PokedexRegister.show(interaction, masterPokemon);
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

            return PokedexRegister.show(interaction, masterPokemon);
        }

        if (type === Done) {
            return await interaction.update({
                embeds: [await pokedexPokemon.buildEmbed()],
                components: []
            });
            
            /*
            return await interaction.followUp({
                content: 'You have finished registering Pokémon',
                ephemeral: true
            });
            */
        }

        return;
    }
}

export default PokedexRegisterButtons;