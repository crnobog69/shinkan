const { Client, GatewayIntentBits } = require('discord.js');
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

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const storage = new Storage(config.dataFile);
const rssChecker = new RSSChecker(storage, client, config.channelId);

client.once('clientReady', () => {
    console.log(`
        ✅ Logged in as ${client.user.tag}`);

    // Initial check
    rssChecker.checkAll();

    // Schedule periodic checks
    cron.schedule(config.checkInterval, () => {
        rssChecker.checkAll();
    });
});

client.login(config.discordToken);

// Start web server
createWebServer(storage, config.webPort, rssChecker);
