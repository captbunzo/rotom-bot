import {
    ButtonInteraction,
    ModalSubmitInteraction,
    ChatInputCommandInteraction,
    StringSelectMenuInteraction,
    InteractionResponse,
} from 'discord.js';

/**
 * Component Module Interface
 */
export interface ComponentModule {
    component: Component;
}

/**
 * Component Interfaces
 *
 * @property {string} name - The name of the component
 * @property {string} id - The custom ID of the component
 * @property {string} [description] - An optional description of the component
 */
interface Component {
    name: string;
    id: string;
    description?: string;
}

export interface ButtonsComponent extends Component {
    show(
        interaction: ChatInputCommandInteraction | ModalSubmitInteraction,
        messageType?: string
    ): Promise<void>;
    handleButton(interaction: ButtonInteraction): Promise<void>;
}

export interface ModalComponent extends Component {
    handleModalSubmit(
        interaction: ModalSubmitInteraction
    ): Promise<void> | Promise<InteractionResponse>;
}

export interface SelectComponent extends Component {
    handleStringSelectMenu(
        interaction: StringSelectMenuInteraction
    ): Promise<void> | Promise<InteractionResponse>;
}
