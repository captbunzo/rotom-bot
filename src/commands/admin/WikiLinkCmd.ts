import path from 'node:path';
import { readFileSync } from 'fs';

import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';

import Client from '@root/src/client.js';
import { InterimLoadUpdates } from '@root/src/constants.js';

import MasterPokemon from '@/models/MasterPokemon.js';
import WikiLink from '@/models/WikiLink.js';

const CodePrefixForms = [
    { prefix: 'alolan-', form: 'ALOLA' },
    { prefix: 'galarian-', form: 'GALARIAN' },
    { prefix: 'hisuian-', form: 'HISUIAN' },
    { prefix: 'paldean-', form: 'PALDEA' },
    { prefix: 'armored-', form: 'A' },
    { prefix: 'black-', form: 'BLACK' },
    { prefix: 'white-', form: 'WHITE' },
    { prefix: 'dawn-wings-', form: 'DAWN_WINGS' },
    { prefix: 'dusk-mane-', form: 'DUSK_MANE' },
    { prefix: 'ultra-', form: 'ULTRA' },
    { prefix: 'eternamax-', form: 'ETERNAMAX' },
];

const CodeSuffixForms = [
    { suffix: '-female', form: 'FEMALE' },
    { suffix: '-male', form: 'MALE' },
    { suffix: '-rainy', form: 'RAINY' },
    { suffix: '-snowy', form: 'SNOWY' },
    { suffix: '-sunny', form: 'SUNNY' },
    { suffix: '-normal-forme', form: 'NORMAL' },
    { suffix: '-speed-forme', form: 'SPEED' },
    { suffix: '-attack-forme', form: 'ATTACK' },
    { suffix: '-defense-forme', form: 'DEFENSE' },
    { suffix: '-sandy-cloak', form: 'SANDY' },
    { suffix: '-trash-cloak', form: 'TRASH' },
    { suffix: '-plant-cloak', form: 'PLANT' },
    { suffix: '-sunshine-form', form: 'SUNNY' },
    { suffix: '-overcast-form', form: 'OVERCAST' },
    { suffix: '-east-sea', form: 'EAST_SEA' },
    { suffix: '-west-sea', form: 'WEST_SEA' },
    { suffix: '-heat', form: 'HEAT' },
    { suffix: '-wash', form: 'WASH' },
    { suffix: '-mow', form: 'MOW' },
    { suffix: '-fan', form: 'FAN' },
    { suffix: '-frost', form: 'FROST' },
    { suffix: '-origin-forme', form: 'ORIGIN' },
    { suffix: '-altered-forme', form: 'ALTERED' },
    { suffix: '-land-forme', form: 'LAND' },
    { suffix: '-sky-forme', form: 'SKY' },
    { suffix: '-zen-mode', form: 'ZEN' },
    { suffix: '-therian-forme', form: 'THERIAN' },
    { suffix: '-incarnate-forme', form: 'INCARNATE' },
    { suffix: '-pirouette-forme', form: 'PIROUETTE' },
    { suffix: '-aria-forme', form: 'ARIA' },
    { suffix: '-shock-drive', form: 'SHOCK' },
    { suffix: '-chill-drive', form: 'CHILL' },
    { suffix: '-burn-drive', form: 'BURN' },
    { suffix: '-douse-drive', form: 'DOUSE' },
    { suffix: '-small-size', form: 'SMALL' },
    { suffix: '-average-size', form: 'AVERAGE' },
    { suffix: '-large-size', form: 'LARGE' },
    { suffix: '-super-size', form: 'SUPER' },
    { suffix: '-10-forme', form: 'TEN_PERCENT' },
    { suffix: '-50-forme', form: 'FIFTY_PERCENT' },
    { suffix: '-complete-forme', form: 'COMPLETE' },
    { suffix: '-confined', form: 'CONFINED' },
    { suffix: '-unbound', form: 'UNBOUND' },
    { suffix: '-baile-style', form: 'BAILE' },
    { suffix: '-pau-style', form: 'PAU' },
    { suffix: '-pom-pom-style', form: 'POMPOM' },
    { suffix: '-sensu-style', form: 'SENSU' },
    { suffix: '-dusk-form', form: 'DUSK' },
    { suffix: '-midday-form', form: 'MIDDAY' },
    { suffix: '-midnight-form', form: 'MIDNIGHT' },
    { suffix: '-solo-form', form: 'SOLO' },
    { suffix: '-school-form', form: 'SCHOOL' },
    { suffix: '-ice-face', form: 'ICE' },
    { suffix: '-noice-face', form: 'NOICE' },
    { suffix: '-crowned-sword', form: 'CROWNED_SWORD' },
    { suffix: '-crowned-shield', form: 'CROWNED_SHIELD' },
    { suffix: '-hero-of-many-battles', form: 'HERO' },
    { suffix: '-rapid-strike-style', form: 'RAPID_STRIKE' },
    { suffix: '-single-strike-style', form: 'SINGLE_STRIKE' },
    { suffix: '-rapid-strike', form: 'RAPID_STRIKE' },
    { suffix: '-single-strike', form: 'SINGLE_STRIKE' },
    { suffix: '-ice-rider', form: 'ICE_RIDER' },
    { suffix: '-shadow-rider', form: 'SHADOW_RIDER' },
    { suffix: '-hero-form', form: 'HERO' },
    { suffix: '-zero-form', form: 'ZERO' },
    { suffix: '-y', form: null },
    { suffix: '-x', form: null },
    { suffix: '-chest-form', form: null },
    { suffix: '-roaming-form', form: null },
    { suffix: '-blade', form: null },
    { suffix: '-shield', form: null },
];

const CodePrefixSuffixForms = [
    { prefix: 'paldean-', suffix: '-aqua-breed', form: 'PALDEA_AQUA' },
    { prefix: 'paldean-', suffix: '-blaze-breed', form: 'PALDEA_BLAZE' },
    { prefix: 'paldean-', suffix: '-combat-breed', form: 'PALDEA_COMBAT' },
    { prefix: 'galarian-', suffix: '-zen-mode', form: 'GALARIAN_ZEN' },
];

const CodeDirectMappings = [
    { code: 'oinkologne-male', pokemon: 'oinkologne', form: 'NORMAL' },
    { code: 'galarian-darmanitan', pokemon: 'darmanitan', form: 'GALARIAN_STANDARD' },
    { code: 'meowstic-male', pokemon: 'meowstic', form: 'NORMAL' },
    { code: 'espartha', pokemon: 'espathra', form: null },
    { code: 'pikachu-libre', pokemon: 'pikachu', form: null },
    { code: 'captain-pikachu', pokemon: 'pikachu', form: null },
    { code: 'pop-star-pikachu', pokemon: 'pikachu', form: null },
    { code: 'flying-pikachu', pokemon: 'pikachu', form: null },
    { code: 'rock-star-pikachu', pokemon: 'pikachu', form: null },
    { code: '5th-anniversary-pikachu', pokemon: 'pikachu', form: null },
    { code: 'shaymin-scarf-pikachu', pokemon: 'pikachu', form: null },
];

const WikiLinkCmd = {
    global: false,
    data: new SlashCommandBuilder()
        .setName('wiki-link')
        .setDescription('Manage Wiki Link data')
        .addSubcommand((subCommand) =>
            subCommand.setName('load').setDescription('Load Wiki Link data file')
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'load':
                this.executeLoad(interaction);
                break;
            default:
                await interaction.reply({
                    content: `Wiki Link management command execution not yet implemented for subcommand -- ${subCommand}`,
                    flags: MessageFlags.Ephemeral,
                });
        }
    },

    /**********************/
    /* Subcommand :: Load */
    /**********************/

    async executeLoad(interaction: ChatInputCommandInteraction) {
        const client = interaction.client as Client;
        const table = 'wiki_link';
        const file = path.join(client.config.data_directory, 'wiki_links.txt');

        await interaction.reply({ content: `Starting load of ${table} table` });
        let wikiLinkFile = readFileSync(file).toString();

        //client.logger.debug(`wikiLinkFile`);
        //client.logger.dump(wikiLinkFile);

        const wikiLinkLines = wikiLinkFile.split('\n');
        const codesNotProcessed = [];

        let processedCount = 0;
        let loadedCount = 0;

        let followUpMsg = await interaction.followUp({
            content: `Processed ${processedCount} ${table} records, loaded ${loadedCount} records, skipped ${processedCount - loadedCount} records`,
        });

        for (const wikiLinkLine of wikiLinkLines) {
            if (wikiLinkLine.length === 0) {
                continue;
            }

            processedCount++;

            const wikiLinkParts = wikiLinkLine.split('|');
            if (wikiLinkParts.length != 2 || !wikiLinkParts[0] || !wikiLinkParts[1]) {
                continue;
            }

            let code = wikiLinkParts[0].trim();
            let image = wikiLinkParts[1].trim();
            let pokemon = code.replace('-039-', '');
            let form = null;

            let isMega = false;
            let isShadow = false;
            let isDynamax = false;
            let isGigantamax = false;

            if (pokemon.startsWith('shadow-')) {
                pokemon = pokemon.slice(7);
                isShadow = true;
            } else if (pokemon.startsWith('mega-')) {
                pokemon = pokemon.slice(5);
                isMega = true;
            } else if (pokemon.startsWith('primal-')) {
                pokemon = pokemon.slice(7);
                isMega = true;
            } else if (pokemon.startsWith('dynamax-')) {
                pokemon = pokemon.slice(8);
                isDynamax = true;
            } else if (pokemon.startsWith('gigantamax-')) {
                pokemon = pokemon.slice(11);
                isGigantamax = true;
            }

            // Only match one special case
            let keepCheckingTransforms = true;

            // Check for direct mappings
            for (const codeTransform of CodeDirectMappings) {
                if (code === codeTransform.code) {
                    pokemon = codeTransform.pokemon;
                    form = codeTransform.form;
                    keepCheckingTransforms = false;
                    break;
                }
            }

            // Check the prefix and suffix forms
            if (keepCheckingTransforms) {
                for (const formTransform of CodePrefixSuffixForms) {
                    if (
                        pokemon.startsWith(formTransform.prefix) &&
                        pokemon.endsWith(formTransform.suffix)
                    ) {
                        form = formTransform.form;
                        pokemon = pokemon.slice(
                            formTransform.prefix.length,
                            -formTransform.suffix.length
                        );
                        break;
                    }
                }
            }

            // Check the prefix forms
            if (keepCheckingTransforms) {
                for (const formTransform of CodePrefixForms) {
                    if (pokemon.startsWith(formTransform.prefix)) {
                        form = formTransform.form;
                        pokemon = pokemon.slice(formTransform.prefix.length);
                        break;
                    }
                }
            }

            // Check the suffix forms
            if (keepCheckingTransforms) {
                for (const formTransform of CodeSuffixForms) {
                    if (pokemon.endsWith(formTransform.suffix)) {
                        form = formTransform.form;
                        pokemon = pokemon.slice(0, -formTransform.suffix.length);
                        break;
                    }
                }
            }

            if (pokemon.endsWith('female')) {
                pokemon = pokemon.slice(0, -6) + '_female';
            } else if (pokemon.endsWith('male')) {
                pokemon = pokemon.slice(0, -4) + '_male';
            }

            client.logger.debug(`Code  :: ${code}`);
            client.logger.debug(`Image :: ${image}`);
            client.logger.debug(`Pokemon      :: ${pokemon}`);
            client.logger.debug(`isMega       :: ${isMega}`);
            client.logger.debug(`isShadow     :: ${isShadow}`);
            client.logger.debug(`isDynamax    :: ${isDynamax}`);
            client.logger.debug(`isGigantamax :: ${isGigantamax}`);

            // See if we can find the master pokemon record
            let masterPokemon = await MasterPokemon.getUnique({
                pokemonId: pokemon.toUpperCase(),
                form: form,
            });

            // See if we can find it by removing dashes
            if (!masterPokemon) {
                const pokemonAltCheck = pokemon.replace('-', '');
                masterPokemon = await MasterPokemon.getUnique({
                    pokemonId: pokemonAltCheck.toUpperCase(),
                    form: form,
                });
                if (masterPokemon) {
                    pokemon = pokemonAltCheck;
                }
            }

            // See if we can find it by replacing dashes with underscores
            if (!masterPokemon) {
                const pokemonAltCheck = pokemon.replace('-', '_');
                masterPokemon = await MasterPokemon.getUnique({
                    pokemonId: pokemonAltCheck.toUpperCase(),
                    form: form,
                });

                if (masterPokemon) {
                    pokemon = pokemonAltCheck;
                }
            }

            if (masterPokemon === null) {
                codesNotProcessed.push(code);
            } else {
                loadedCount++;

                const wikiLinkObj = {
                    id: code,
                    pokemonId: masterPokemon.pokemonId,
                    pokedexId: masterPokemon.pokedexId,
                    isMega: isMega,
                    isShadow: isShadow,
                    isDynamax: isDynamax,
                    isGigantamax: isGigantamax,
                    page: `https://pokemongo.gamepress.gg/c/pokemon/${code}`,
                    image: image,
                    templateId: masterPokemon.templateId,
                    form: form,
                };

                client.logger.debug(`Wiki Link Object`);
                client.logger.dump(wikiLinkObj);

                let wikiLink = await WikiLink.getUnique({ id: wikiLinkObj.id });

                if (!wikiLink) {
                    wikiLink = new WikiLink(wikiLinkObj);
                    await wikiLink.create();
                } else {
                    wikiLink.pokemonId = wikiLinkObj.pokemonId;
                    wikiLink.pokedexId = wikiLinkObj.pokedexId;
                    wikiLink.isMega = wikiLinkObj.isMega;
                    wikiLink.isShadow = wikiLinkObj.isShadow;
                    wikiLink.isDynamax = wikiLinkObj.isDynamax;
                    wikiLink.isGigantamax = wikiLinkObj.isGigantamax;
                    wikiLink.page = wikiLinkObj.page;
                    wikiLink.image = wikiLinkObj.image;
                    wikiLink.templateId = wikiLinkObj.templateId;
                    wikiLink.form = wikiLinkObj.form;

                    await wikiLink.update();
                }
            }

            if (processedCount % InterimLoadUpdates == 0) {
                await interaction.editReply({
                    message: followUpMsg,
                    content: `Processed ${processedCount} ${table} records, loaded ${loadedCount} records, skipped ${processedCount - loadedCount} records`,
                });
            }
        }

        client.logger.debug(`Codes not found: ${codesNotProcessed.length}`);
        for (const codeNotFound of codesNotProcessed) {
            client.logger.dump(codeNotFound);
        }
        client.logger.dump('');

        interaction.editReply({
            message: followUpMsg,
            content: `Processed ${processedCount} ${table} records, loaded ${loadedCount} records, skipped ${processedCount - loadedCount} records`,
        });

        interaction.followUp({
            content: `Records skipped: ${codesNotProcessed.join(', ')}`,
        });

        interaction.followUp({
            content: `Load of ${table} table complete`,
        });
    },
};

export default WikiLinkCmd;
