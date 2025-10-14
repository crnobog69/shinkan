const Parser = require('rss-parser');
const parser = new Parser();

class RSSChecker {
    constructor(storage, discordClient, channelId) {
        this.storage = storage;
        this.client = discordClient;
        this.channelId = channelId;
    }

    async checkManga(manga) {
        try {
            const feed = await parser.parseURL(manga.rssUrl);

            if (!feed.items || feed.items.length === 0) return;

            const latestItem = feed.items[0];
            const latestChapter = latestItem.title;

            // If this is first check (no lastChapter), just store it without notifying
            // Otherwise, notify if chapter changed
            if (manga.lastChapter === null) {
                console.log(`✓ [${manga.name}] First check - storing: ${latestChapter}`);
            } else if (manga.lastChapter !== latestChapter) {
                console.log(`🆕 [${manga.name}] NEW CHAPTER FOUND!`);
                console.log(`   Old: ${manga.lastChapter}`);
                console.log(`   New: ${latestChapter}`);
                await this.sendNotification(manga.name, latestChapter, latestItem.link, feed.image?.url, manga.anilistUrl);
            } else {
                console.log(`✓ [${manga.name}] No new chapter (still: ${latestChapter})`);
            }

            this.storage.updateManga(manga.id, {
                lastChecked: new Date().toISOString(),
                lastChapter: latestChapter
            });
        } catch (error) {
            console.error(`✗ [${manga.name}] Error: ${error.message}`);
        }
    }

    async sendNotification(mangaName, chapter, link, imageUrl, anilistUrl) {
        try {
            const channel = await this.client.channels.fetch(this.channelId);
            const embed = {
                title: '📖 New Chapter Released!',
                description: `**${mangaName}**\n${chapter}${anilistUrl ? `\n\n[📺 View on AniList](${anilistUrl})` : ''}`,
                url: link,
                color: 0x00ff00,
                timestamp: new Date()
            };

            if (imageUrl) {
                embed.image = { url: imageUrl };
            }

            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error sending notification:', error.message);
        }
    }

    async checkAll() {
        const mangas = this.storage.getMangas();
        console.log(`\n${'='.repeat(50)}`);
        console.log(`🔍 Checking ${mangas.length} manga(s) at ${new Date().toLocaleString()}`);
        console.log('='.repeat(50));

        for (const manga of mangas) {
            await this.checkManga(manga);
        }

        console.log('='.repeat(50) + '\n');
    }
}

module.exports = RSSChecker;
