import DrossDatabase from '@drossjs/dross-database';

// Import the database tables
import Battle           from '#src/models/Battle.js';
import BattleMember     from '#src/models/BattleMember.js';
import Boss             from '#src/models/Boss.js';
import GuildBattleAlert from '#src/models/GuildBattleAlert.js';
import GuildTeamRole    from '#src/models/GuildTeamRole.js';
import MasterCPM        from '#src/models/MasterCPM.js';
import MasterPokemon    from '#src/models/MasterPokemon.js';
import PogoHubLink      from '#src/models/PogoHubLink.js';
import Pokedex          from './models/Pokedex.js';
import PokedexPokemon   from './models/PokedexPokemon.js';
import Translation      from '#src/models/Translation.js';
import Trainer          from '#src/models/Trainer.js';
import WikiLink         from '#src/models/WikiLink.js';

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
    WikiLink
];

export default class DatabaseConnection {
    /*********************
     * Singleton Members *
     *********************/
    private static instance: DatabaseConnection;

    // Private constructor to prevent direct instantiation
    private constructor() {
        
    }

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