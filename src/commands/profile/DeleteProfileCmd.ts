import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

import DeleteProfileButtons from '@/components/buttons/DeleteProfileButtons.js';

const DeleteProfileCmd = {
    global: true,
    data: new SlashCommandBuilder()
        .setName('delete-profile')
        .setDescription('Delete your trainer profile'),

    async execute(interaction: ChatInputCommandInteraction) {
        await DeleteProfileButtons.show(interaction);
    },
};

export default DeleteProfileCmd;
