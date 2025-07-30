
// Import the database tables
import Battle           from '#src/data/Battle.js';
import BattleMember     from '#src/data/BattleMember.js';
import Boss             from '#src/data/Boss.js';
import GuildBattleAlert from '#src/data/GuildBattleAlert.js';
import GuildTeamRole    from '#src/data/GuildTeamRole.js';
import MasterCPM        from '#src/data/MasterCPM.js';
import MasterPokemon    from '#src/data/MasterPokemon.js';
import Translation      from '#src/data/Translation.js';
import Trainer          from '#src/data/Trainer.js';
import WikiLink         from '#src/data/WikiLink.js';

const tables = [
    Battle,
    BattleMember,
    Boss,
    GuildBattleAlert,
    GuildTeamRole,
    MasterCPM,
    MasterPokemon,
    Trainer,
    Translation,
    WikiLink
];

import DrossDatabase from '@drossjs/dross-database';
const drossDatabase = new DrossDatabase(tables);

// TODO - Figure out if we really need to freeze the object
// I am suspicious this is no needed since we are using ES6 modules
//Object.freeze(drossDatabase);

export default drossDatabase;
