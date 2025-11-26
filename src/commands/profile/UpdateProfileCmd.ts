import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

import TrainerProfileModal from '@/components/modals/TrainerProfileModal.js';

const UpdateProfileCmd = {
    global: true,
    data: new SlashCommandBuilder()
        .setName('update-profile')
        .setDescription('Update your trainer profile'),

    async execute(interaction: ChatInputCommandInteraction) {
        await TrainerProfileModal.show(interaction);
    },
};

export default UpdateProfileCmd;
