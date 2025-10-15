const Parser = require('rss-parser');
const parser = new Parser({
    timeout: 10000, // 10 second timeout
    maxRedirects: 5
});

class RSSChecker {
    constructor(storage, discordClient, channelId) {
        this.storage = storage;
        this.client = discordClient;
        this.channelId = channelId;
        this.stats = {
            totalChecks: 0,
            successfulChecks: 0,
            failedChecks: 0,
            notificationsSent: 0,
            lastCheckTime: null
        };
    }

    getStats() {
        return this.stats;
    }

    resetStats() {
        this.stats = {
            totalChecks: 0,
            successfulChecks: 0,
            failedChecks: 0,
            notificationsSent: 0,
            lastCheckTime: null
        };
    }

    async checkManga(manga, retries = 3) {
        this.stats.totalChecks++;
        
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const feed = await parser.parseURL(manga.rssUrl);

                if (!feed.items || feed.items.length === 0) {
                    console.log(`⚠️ [${manga.name}] No items found in RSS feed`);
                    this.stats.failedChecks++;
                    return;
                }

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
                    this.stats.notificationsSent++;
                } else {
                    console.log(`✓ [${manga.name}] No new chapter (still: ${latestChapter})`);
                }

                this.storage.updateManga(manga.id, {
                    lastChecked: new Date().toISOString(),
                    lastChapter: latestChapter,
                    lastError: null,
                    failCount: 0
                });
                
                this.stats.successfulChecks++;
                return;
            } catch (error) {
                console.error(`✗ [${manga.name}] Error (attempt ${attempt}/${retries}): ${error.message}`);
                
                if (attempt === retries) {
                    this.stats.failedChecks++;
                    const failCount = (manga.failCount || 0) + 1;
                    this.storage.updateManga(manga.id, {
                        lastChecked: new Date().toISOString(),
                        lastError: error.message,
                        failCount: failCount
                    });
                } else {
                    // Wait before retry (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                }
            }
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

        this.stats.lastCheckTime = new Date().toISOString();

        for (const manga of mangas) {
            await this.checkManga(manga);
            // Small delay between checks to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log('='.repeat(50));
        console.log(`📊 Check complete - Success: ${this.stats.successfulChecks}/${this.stats.totalChecks}, Notifications: ${this.stats.notificationsSent}`);
        console.log('='.repeat(50) + '\n');
    }
}

module.exports = RSSChecker;
