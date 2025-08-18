import path from 'node:path';
import { readFileSync } from 'fs';

import {
    ChatInputCommandInteraction,
    MessageFlags,
    SlashCommandBuilder
} from 'discord.js';

import Client from '#src/Client.js';
import { InterimLoadUpdates } from '#src/Constants.js';

import MasterPokemon from '#src/models/MasterPokemon.js';
import PogoHubLink   from '#src/models/PogoHubLink.js';

const FormDirectMappings = [
    { rawForm: 'Paldean_Aqua_Breed', pokemonId: 128, form: 'PALDEA_AQUA' }, // Paldean Tauros (Aqua Breed)
    { rawForm: 'Paldean_Blaze_Breed', pokemonId: 128, form: 'PALDEA_BLAZE' }, // Paldean Tauros (Blaze Breed)
    { rawForm: 'Paldean_Combat_Breed', pokemonId: 128, form: 'PALDEA_COMBAT' }, // Paldean Tauros (Combat Breed)
    { rawForm: 'Armored', pokemonId: 150, form: 'A' }, // Armored Mewtwo
    { rawForm: 'Shield_Form', pokemonId: 681, form: 'SHIELD' }, // Aegislash Shield Forme
    { rawForm: 'Sword_Form', pokemonId: 681, form: 'BLADE' }, // Aegislash Sword Forme
    { rawForm: 'Pa\'u', pokemonId: 741, form: 'PAU' }, // Oricorio (Pa'u)
    { rawForm: 'Pom-Pom', pokemonId: 741, form: 'POMPOM' }, // Oricorio (Pom-Pom)
    { rawForm: 'Meteor', pokemonId: 774, form: null }, // Minior (Meteor Form)
    { rawForm: 'Male', pokemonId: 916, form: 'NORMAL' }, // Oinkologne (Male)
    { rawForm: 'Blue_Plumage', pokemonId: 931, form: 'BLUE' }, // Squawkabilly (Blue Plumage)
    { rawForm: 'Green_Plumage', pokemonId: 931, form: 'GREEN' }, // Squawkabilly (Green Plumage)
    { rawForm: 'White_Plumage', pokemonId: 931, form: 'WHITE' }, // Squawkabilly (White Plumage)
    { rawForm: 'Yellow_Plumage', pokemonId: 931, form: 'YELLOW' }, // Squawkabilly (Yellow Plumage)
    { rawForm: 'Curly_Form', pokemonId: 978, form: 'CURLY' }, // Tatsugiri (Curly Form)
    { rawForm: 'Droopy_Form', pokemonId: 978, form: 'DROOPY' }, // Tatsugiri (Droopy Form)
    { rawForm: 'Stretchy_Form', pokemonId: 978, form: 'STRETCHY' }, // Tatsugiri (Stretchy Form)
    { rawForm: 'Three-Segment_Form', pokemonId: 982, form: 'THREE' }, // Dudunsparce (Three-Segment Form)
    { rawForm: 'Two-Segment_Form', pokemonId: 982, form: 'TWO' }, // Dudunsparce (Two-Segment Form)
    { rawForm: 'Chest', pokemonId: 999, form: null }, // Chest Form Gimmighoul
    { rawForm: 'Roaming', pokemonId: 999, form: null } // Roaming Form Gimmighoul
];

// TODO - Figure out how to scrape the image URLs

const PogoHubLinkCmd = {
    global: false,
	data: new SlashCommandBuilder()
		.setName('pogo-hub-link')
		.setDescription('Manage Pogo Hub Link data')
        .addSubcommand(subCommand => subCommand
            .setName('load')
            .setDescription('Load Pogo Hub Link data file')
        ),

	async execute(interaction: ChatInputCommandInteraction) {
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'load' : this.executeLoad(interaction); break;
            default :
                await interaction.reply({
                    content: `Pogo Hub Link management command execution not yet implemented for subcommand -- ${subCommand}`,
                    flags: MessageFlags.Ephemeral
                }); 
        }
	},

    /**********************/
    /* Subcommand :: Load */
    /**********************/

    async executeLoad(interaction: ChatInputCommandInteraction) {
        const client = interaction.client as Client;
        const table  = 'pogo_hub_link';
        const file   = path.join(client.config.data_directory, 'pogo_hub_links.txt');

        await interaction.reply({ content: `Starting load of ${table} table` });
        let pogoHubLinkFile = readFileSync(file).toString()

        //client.logger.debug(`wikiLinkFile`);
        //client.logger.dump(pogoHubLinkFile);

        const pogoHubLinkLines = pogoHubLinkFile.split('\n');

        const descNotProcessed = [];
        const idNotProcessed = [];

        let processedCount = 0;
        let loadedCount    = 0;

        let followUpMsg = await interaction.followUp({
            content: `Processed ${processedCount} ${table} records, loaded ${loadedCount} records, skipped ${processedCount - loadedCount} records`
        });

        for (const pogoHubLinkLine of pogoHubLinkLines) {
            if (pogoHubLinkLine.length === 0) {
                continue;
            }

            processedCount++;
            //if (processedCount > 500) {
            //    break;
            //}

            const pogoHubLinkParts = pogoHubLinkLine.split('|');
            let pokedexId = pogoHubLinkParts[0].trim();
            let id        = pogoHubLinkParts[1].trim();
            let page      = pogoHubLinkParts[2].trim();
            let rawForm   = pogoHubLinkParts[3].trim();
            let form      = rawForm.toUpperCase();

            if (rawForm.length === 0) {
                rawForm = null;
                form = null;
            }

            let isMega = false;
            let isShadow = false;
            let isDynamax = false;
            let isGigantamax = false;

            switch (rawForm) {
                case 'Mega':
                case 'Mega_X':
                case 'Mega_Y':
                case 'Primal':
                    isMega = true;
                    form = null;
                    break;
                
                case 'Gigantamax':
                    isGigantamax = true;
                    form = null;
                    break;
            }
            
            // Only match one special case
            let keepCheckingTransforms = true;

            // Check for direct mappings
            for (const formTransform of FormDirectMappings) {
                if (rawForm === formTransform.rawForm && pokedexId == formTransform.pokemonId) {
                    form = formTransform.form;
                    keepCheckingTransforms = false;
                    break;
                }
            }

            client.logger.debug(`ID :: ${id}`);
            client.logger.debug(`Pokedex ID   :: ${pokedexId}`);
            client.logger.debug(`Page         :: ${page}`);
            client.logger.debug(`Raw Form     :: ${rawForm}`);
            client.logger.debug(`Form         :: ${form}`);
            client.logger.debug(`isMega       :: ${isMega}`);
            client.logger.debug(`isGigantamax :: ${isGigantamax}`);

            // See if we can find the master pokemon record
            let masterPokemon = await MasterPokemon.getUnique({ pokedexId: pokedexId, form: form });
            client.logger.debug(`Master Pokemon`);
            client.logger.dump(masterPokemon);

            let templateId = null;
            if (masterPokemon === null) {
                descNotProcessed.push(`${pokedexId} = ${id} [${rawForm}]`);
                idNotProcessed.push(pokedexId);
            } else {
                loadedCount++;
            
                const pogoHubLinkObj = {
                    id:           id,
                    pokemonId:    masterPokemon.pokemonId,
                    pokedexId:    masterPokemon.pokedexId,
                    isMega:       isMega,
                    isGigantamax: isGigantamax,
                    page:         page,
                    image:        null,
                    templateId:   masterPokemon.templateId,
                    form:         masterPokemon.form
                };
            
                client.logger.debug(`Wiki Link Object`);
                client.logger.dump(pogoHubLinkObj);
            
                let wikiLink = await PogoHubLink.getUnique({ id: pogoHubLinkObj.id });
            
                if (!wikiLink) {
                    wikiLink = new PogoHubLink(pogoHubLinkObj);
                    await wikiLink.create();
                } else {
                    wikiLink.pokemonId    = pogoHubLinkObj.pokemonId;
                    wikiLink.pokedexId    = pogoHubLinkObj.pokedexId;
                    wikiLink.isMega       = pogoHubLinkObj.isMega;
                    wikiLink.isGigantamax = pogoHubLinkObj.isGigantamax;
                    wikiLink.page         = pogoHubLinkObj.page;
                    wikiLink.image        = pogoHubLinkObj.image;
                    wikiLink.templateId   = pogoHubLinkObj.templateId;
                    wikiLink.form         = pogoHubLinkObj.form;
            
                    await wikiLink.update();
                }
            }

            if (processedCount % InterimLoadUpdates == 0) {
                await interaction.editReply({
                    message: followUpMsg,
                    content: `Processed ${processedCount} ${table} records, loaded ${loadedCount} records, skipped ${processedCount - loadedCount} records`
                });
            }
        }
        
        interaction.editReply({
            message: followUpMsg,
            content: `Processed ${processedCount} ${table} records, loaded ${loadedCount} records, skipped ${processedCount - loadedCount} records`
        });

        if (descNotProcessed.length > 0) {
            const uniqueIdNotProcessed = [...new Set(idNotProcessed)];

            interaction.followUp({
                content: `Records skipped:\n\`\`\`${descNotProcessed.join('\n')}\`\`\``
            });
            interaction.followUp({
                content: `IDs: ${uniqueIdNotProcessed.join(', ')}`
            });

            client.logger.debug(`IDs not found: ${descNotProcessed.length}`);

            const indent = '\t';
            for (const descNotFound of descNotProcessed) {
                client.logger.dump(`${indent}${descNotFound}`);
            }

            client.logger.debug(`ID List: ${uniqueIdNotProcessed.join(', ')}`);
            client.logger.dump('');
        }
        
        interaction.followUp({
            content: `Load of ${table} table complete`
        });
    }
};

export default PogoHubLinkCmd;