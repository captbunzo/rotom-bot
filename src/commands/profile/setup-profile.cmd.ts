import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

import type { Command } from '@/types/command';
import { TrainerProfileModal } from '@/components/modals/trainer-profile.modal';
import { t } from '@/i18n/index.js';

class SetupProfileCmd implements Command {
    global = true;

    data = new SlashCommandBuilder()
        .setName('setup-profile')
        .setDescription(t('commands.setupProfile.description'));

    async execute(interaction: ChatInputCommandInteraction) {
        await new TrainerProfileModal().show(interaction);
    }
}

export const command = new SetupProfileCmd();
