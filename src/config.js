require('dotenv').config();

module.exports = {
    discordToken: process.env.DISCORD_TOKEN,
    channelId: process.env.DISCORD_CHANNEL_ID,
    webPort: process.env.WEB_PORT || 3000,
    checkInterval: '0 * * * *', // Every hour (at minute 0)
    dataFile: './data/mangas.json'
};
