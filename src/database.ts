import { DrossDatabase } from '@drossjs/dross-database';

// Import the database tables
import Battle from '@/models/Battle.js';
import BattleMember from '@/models/BattleMember.js';
import Boss from '@/models/Boss.js';
import GuildBattleAlert from '@/models/GuildBattleAlert.js';
import GuildTeamRole from '@/models/GuildTeamRole.js';
import MasterCPM from '@/models/MasterCPM.js';
import MasterPokemon from '@/models/MasterPokemon.js';
import PogoHubLink from '@/models/PogoHubLink.js';
import Pokedex from './models/Pokedex.js';
import PokedexPokemon from './models/PokedexPokemon.js';
import Translation from '@/models/Translation.js';
import Trainer from '@/models/Trainer.js';
import WikiLink from '@/models/WikiLink.js';

const TableClasses = [
    Battle,
    BattleMember,
    Boss,
    GuildBattleAlert,
    GuildTeamRole,
    MasterCPM,
    MasterPokemon,
    PogoHubLink,
    Pokedex,
    PokedexPokemon,
    Trainer,
    Translation,
    WikiLink,
];

export default class DatabaseConnection {
    /*********************
     * Singleton Members *
     *********************/
    private static instance: DatabaseConnection;

    // Private constructor to prevent direct instantiation
    private constructor() {}

    // Static method to get the single instance
    public static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }

    /*****************************
     * Public Instance Variables *
     *****************************/

    public drossDatabase: DrossDatabase | null = null;

    /**********************************
     * Initialize Database Connection *
     **********************************/

    public async init(config: any) {
        this.drossDatabase = new DrossDatabase(TableClasses);
        await this.drossDatabase.init(config);
    }
}
