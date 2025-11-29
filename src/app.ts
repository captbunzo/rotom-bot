import { Bot } from '@/bot.js';

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

function showUsage() {
    console.error('Usage: node app.js [OPTIONS]');
    console.error('');
    console.error('OPTIONS:');
    console.error('  -s, --start             Start the bot (default)');
    console.error('  -d, --deploy-commands   Deploy slash commands');
    console.error('  -h, --help              Show this help message');
}

switch (command) {
    case undefined:
    case '-s':
    case '--start': {
        await Bot.start();
        break;
    }

    case '-d':
    case '--deploy-commands': {
        await Bot.deployCommands();
        break;
    }

    case '-h':
    case '--help': {
        showUsage();
        break;
    }

    default: {
        console.error(`Error: Unknown command '${command}'`);
        console.error('');
        showUsage();
        throw new Error(`Unknown command: ${command}`);
    }
}
