const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const cron = require('node-cron');
const config = require('./config');
const Storage = require('./storage');
const RSSChecker = require('./rssChecker');
const createWebServer = require('./web');

console.log(`
===================================================
  _________.__    .__        __                   
 /   _____/|  |__ |__| ____ |  | _______    ____  
 \\_____  \\ |  |  \\|  |/    \\|  |/ /\\__  \\  /    \\ 
 /        \\|   Y  \\  |   |  \\    <  / __ \\|   |  \\
/_______  /|___|  /__|___|  /__|_ \\(____  /___|  /
        \\/      \\/        \\/     \\/     \\/     \\/ 
===================================================
`);

// Validate required configuration
if (!config.discordToken) {
    console.error('❌ ERROR: DISCORD_TOKEN is not set in .env file');
    process.exit(1);
}

if (!config.channelId) {
    console.error('❌ ERROR: DISCORD_CHANNEL_ID is not set in .env file');
    process.exit(1);
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const storage = new Storage(config.dataFile);
const rssChecker = new RSSChecker(storage, client, config.channelId);

client.once('clientReady', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`📺 Watching channel: ${config.channelId}`);

    // Set bot status
    client.user.setPresence({
        activities: [{
            name: 'manga chapters',
            type: ActivityType.Watching
        }],
        status: 'dnd' // 'online', 'idle', 'dnd', 'invisible'
    });

    // Initial check
    console.log('🔍 Starting initial manga check...');
    rssChecker.checkAll();

    // Schedule periodic checks
    cron.schedule(config.checkInterval, () => {
        console.log('⏰ Scheduled check triggered');
        rssChecker.checkAll();
    });

    console.log(`⏰ Scheduled checks: ${config.checkInterval}`);
});

client.on('error', (error) => {
    console.error('❌ Discord client error:', error);
});

client.login(config.discordToken).catch((error) => {
    console.error('❌ Failed to login to Discord:', error.message);
    process.exit(1);
});

// Start web server
createWebServer(storage, config.webPort, rssChecker);
