require('dotenv').config();

module.exports = {
    discordToken: process.env.DISCORD_TOKEN,
    channelId: process.env.DISCORD_CHANNEL_ID,
    webPort: parseInt(process.env.WEB_PORT) || 11111,
    checkInterval: process.env.CHECK_INTERVAL || '0 * * * *', // Every hour (at minute 0)
    dataFile: './data/mangas.json'
};
