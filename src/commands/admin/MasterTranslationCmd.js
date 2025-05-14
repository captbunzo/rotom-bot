
import path from 'node:path';
import { readFile } from 'fs/promises';

import {
    MessageFlags,
    SlashCommandBuilder
} from 'discord.js';

import {
    InterimLoadUpdates
} from '../../Constants.js';

import Translation from '../../data/Translation.js';

const MasterTranslationCmd = {
    global: false,
    data: new SlashCommandBuilder()
        .setName('master-translation')
        .setDescription('Manage Master Translation data')
        .addSubcommand(subCommand => subCommand
            .setName('load')
            .setDescription('Load Master Translation data file')
            .addStringOption(option => option
                .setName('language')
                .setDescription('Language to load')
                .setRequired(true)
                .setChoices(Translation.LanguageChoices)
            )
        ),
    
    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'load' : this.executeLoad(interaction); break;
            default :
                await interaction.reply(
                    { content: `Master Translation management command execution not yet implemented for subcommand -- ${subCommand}`, flags: MessageFlags.Ephemeral }
                ); 
        }
    },

    async autocomplete(interaction) {
        const client  = interaction.client;
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'load' : this.autocompleteLoad(interaction); break;
            default :
                client.logger.error(`Master Pokémon Translation command autocomplete not yet implemented for subcommand -- ${subCommand}`);
        }
    },

    /**********************/
    /* Subcommand :: Load */
    /**********************/

    async executeLoad(interaction) {
        const client   = interaction.client;
        const table    = 'translation';
        const language = interaction.options.getString('language') ?? Translation.Language.English;
        const file     = path.join(client.config.data_directory, 'master_translation', `${language}.json`);

      //const file     = interaction.options.getString('file')  ?? 'No file provided';
      //const filename = file.replace(/^.*[\\\/]/, '');
      //const language = filename.replace(/\..*$/, '');

        await interaction.reply({ content: `Starting load of ${table} table` });

        let json;
        try {
            json = JSON.parse(
                await readFile(
                    new URL(file, import.meta.url)
                )
            );
        } catch (error) {
            await interaction.followUp({ content: `Error reading file` });
        }

        let processedCount = 0;
        let loadedCount    = 0;
        
        let followUpMsg = await interaction.followUp({
            content: `Processed ${processedCount} ${table} records, loaded ${loadedCount} records`
        });

        for (let code in json) {
            let name  = null;
            let value = json[code];
            processedCount++;

            if (value.trim().length == 0) {
                value = Translation.ValueBlank;
            }

            let codePartsArray = code.split('_');
            if (codePartsArray.length > 1) {
                const testName = `${codePartsArray[0]}_${codePartsArray[1]}`;

                switch (testName) {
                    case 'gender_icon':
                    case 'max_battle':
                    case 'poke_type':
                    case 'pokemon_category':
                    case 'team_a':
                  //case 'weather_icon':
                        name = testName;
                }
            }
            
            if (name == null) {
                const testName = codePartsArray[0];

                switch (testName) {
                    case 'alola':
                    case 'costume':
                    case 'desc':
                    case 'egg':
                    case 'evo':
                    case 'form':
                    case 'gender':
                    case 'generation':
                    case 'legendary':
                    case 'move':
                    case 'mythical':
                    case 'poke':
                    case 'raid':
                    case 'shadow':
                    case 'team':
                  //case 'weather':
                        name = testName;
                }
            }

          //if (code != 'desc_19_46') {
          //    name = null;
          //}
            
            if (name != null) {
                loadedCount++;

                let keyVariant = code.slice(name.length + 1);
                client.logger.debug(`keyVariant <1> = ${keyVariant}`);

                let translationObj = {
                    code: code,
                    name: name,
                    key: 0,
                    variant: Translation.VariantNull,
                    variantId: null,
                    isPlural: code.endsWith('_plural'),
                    language: language,
                    value: value
                }

                if (translationObj.isPlural) {
                    keyVariant = keyVariant.replace(/_plural%/, '');
                    client.logger.debug(`keyVariant <2> = ${keyVariant}`);
                }

                const keyVariantPartsArray = keyVariant.split('_');

                /*
                client.logger.debug(`Translation Object <1> =`);
                client.logger.dump(translationObj);
                client.logger.debug(`keyVariant.length = ${keyVariant.length}`);
                client.logger.debug(`keyVariantPartsArray = ${keyVariantPartsArray}`);
                client.logger.debug(`keyVariantPartsArray.length = ${keyVariantPartsArray.length}`);
                */

                if ( (keyVariant.length > 0) && (keyVariantPartsArray.length > 0) ) {
                    translationObj.key = keyVariantPartsArray[0];

                    if (keyVariantPartsArray.length > 1) {
                        const variant        = keyVariantPartsArray[1]
                        const variantId      = parseInt(variant);
                        const variantIdFloat = parseFloat(variant);

                        translationObj.variant = variant;
                        if (Number.isInteger(variantId) && variantId == variantIdFloat) {
                            translationObj.variantId = variantId;
                        }
                    }
                }

                client.logger.debug(`Translation Name = ${code}`);
                client.logger.debug(`Translation Value = ${value}`);    
                client.logger.debug(`Translation Object <2> =`);
                client.logger.dump(translationObj);

                let translationSearch = {
                    name: translationObj.name,
                    key: translationObj.key,
                    variant: translationObj.variant,
                    isPlural: translationObj.isPlural,
                    language: translationObj.language,
                    unique: true
                };

                /*
                client.logger.debug(`Translation Search =`);
                client.logger.dump(translationSearch);
                */

                let translationRec = await Translation.get(translationSearch);
                if (!translationRec) {
                    translationRec = new Translation(translationObj);
                    await translationRec.create();
                } else {
                    translationRec.value = translationObj.value;
                    await translationRec.update();
                }
            }

            if (processedCount % InterimLoadUpdates == 0) {
                interaction.editReply({
                    message: followUpMsg,
                    content: `Processed ${processedCount} ${table} records, loaded ${loadedCount} records`
                });
            }
        }

        interaction.editReply({
            message: followUpMsg,
            content: `Processed ${processedCount} ${table} records, loaded ${loadedCount} records`
        });

        interaction.followUp({
            content: `Load of ${table} table complete`
        });
    },

    async autocompletLoad(interaction) {
        const client  = interaction.client;
        const focusedOption = interaction.options.getFocused(true);
        client.logger.error(
            `Master Translation management command autocomplete not yet implemented for load -- ${this.data.name} :: ${focusedOption.name} :: '${focusedOption.value}'`
        );
        await interaction.respond([]);
    }
};

export default MasterTranslationCmd;
