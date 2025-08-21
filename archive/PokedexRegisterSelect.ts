import {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    StringSelectMenuOptionBuilder
} from 'discord.js';

import {
    PokedexEntry
} from '#src/Constants.js';

import Client from '#src/Client.js';
import MasterPokemon from '#src/models/MasterPokemon.js';
import PokedexPokemon from '#src/models/PokedexPokemon.js';
import PokedexRegister from '#src/components/compound/PokedexRegisterComponent.js';

interface PokedexRegisterCustomId {
    name: string;
    type: string;
    pokedexId: number;
}

const PokedexRegisterSelect = {
    data: {
        name: 'PokedexRegister'
    },

    //.setCustomId(`${this.data.name}.select.${masterPokemon.pokedexId}`)
    build(pokedexPokemon: PokedexPokemon) {
        const customId: PokedexRegisterCustomId = {
            name: 'PokedexRegister',
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

    async handle(interaction: StringSelectMenuInteraction) {
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
        return PokedexRegister.show(interaction, masterPokemon);
    }
}

export default PokedexRegisterSelect;