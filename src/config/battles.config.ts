import { rawConfig } from './types/raw.config.js';

export interface BattlesConfig {
    showMemberTrainerNames: boolean;
    blockHostSelfJoin: boolean;
}

export const battlesConfig: BattlesConfig = {
    showMemberTrainerNames: rawConfig.getBooleanParameter('battles', 'showMemberTrainerNames'),
    blockHostSelfJoin: rawConfig.getBooleanParameter('battles', 'blockHostSelfJoin'),
};
