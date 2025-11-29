import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

import type { Command } from '@/types/command';
import { TrainerProfileModal } from '@/components/modals/trainer-profile.modal';

class SetupProfileCmd implements Command {
    global = true;

    data = new SlashCommandBuilder()
        .setName('setup-profile')
        .setDescription('Setup your trainer profile');

    async execute(interaction: ChatInputCommandInteraction) {
        await new TrainerProfileModal().show(interaction);
    }
}

export const command = new SetupProfileCmd();
