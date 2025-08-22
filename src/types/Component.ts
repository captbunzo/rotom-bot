import {
    ButtonInteraction,
    ModalSubmitInteraction,
    StringSelectMenuInteraction
} from 'discord.js';

export default interface Component {
    name: string;
    id: string;
    description?: string;

    handleButton?(interaction: ButtonInteraction): Promise<void>;
    handleModalSubmit?(interaction: ModalSubmitInteraction): Promise<void>;
    handleStringSelectMenu?(interaction: StringSelectMenuInteraction): Promise<void>;
}