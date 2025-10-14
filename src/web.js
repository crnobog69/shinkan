const express = require('express');
const path = require('path');

function createWebServer(storage, port, rssChecker) {
    const app = express();

    app.use(express.json());
    app.use(express.static(path.join(__dirname, '../public')));

    app.get('/api/mangas', (req, res) => {
        res.json(storage.getMangas());
    });

    app.post('/api/mangas', (req, res) => {
        let { name, rssUrl, anilistUrl } = req.body;
        if (!name || !rssUrl) {
            return res.status(400).json({ error: 'Name and RSS URL required' });
        }

        // Auto-append /rss if not present
        if (!rssUrl.endsWith('/rss')) {
            rssUrl = rssUrl.replace(/\/$/, '') + '/rss';
        }

        const manga = storage.addManga({ name, rssUrl, anilistUrl });
        res.json(manga);
    });

    app.delete('/api/mangas/:id', (req, res) => {
        storage.deleteManga(req.params.id);
        res.json({ success: true });
    });

    app.put('/api/mangas/:id', (req, res) => {
        let { name, rssUrl, anilistUrl } = req.body;
        if (!name || !rssUrl) {
            return res.status(400).json({ error: 'Name and RSS URL required' });
        }

        // Auto-append /rss if not present
        if (!rssUrl.endsWith('/rss')) {
            rssUrl = rssUrl.replace(/\/$/, '') + '/rss';
        }

        const manga = storage.updateManga(req.params.id, { name, rssUrl, anilistUrl });
        if (!manga) {
            return res.status(404).json({ error: 'Manga not found' });
        }
        res.json(manga);
    });

    app.post('/api/mangas/:id/test', async (req, res) => {
        const Parser = require('rss-parser');
        const parser = new Parser();
        const manga = storage.getMangas().find(m => m.id === req.params.id);

        if (!manga) {
            return res.status(404).json({ error: 'Manga not found' });
        }

        try {
            const feed = await parser.parseURL(manga.rssUrl);
            if (!feed.items || feed.items.length === 0) {
                return res.json({ error: 'No chapters found in RSS feed' });
            }

            const latestItem = feed.items[0];

            // Send test notification to Discord
            await rssChecker.sendNotification(
                `🧪 TEST: ${manga.name}`,
                latestItem.title,
                latestItem.link,
                feed.image?.url,
                manga.anilistUrl
            );

            res.json({
                title: latestItem.title,
                link: latestItem.link,
                date: latestItem.pubDate,
                image: feed.image?.url,
                sent: true
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/api/mangas/:id/realtest', async (req, res) => {
        const Parser = require('rss-parser');
        const parser = new Parser();
        const manga = storage.getMangas().find(m => m.id === req.params.id);

        if (!manga) {
            return res.status(404).json({ error: 'Manga not found' });
        }

        try {
            const feed = await parser.parseURL(manga.rssUrl);
            if (!feed.items || feed.items.length === 0) {
                return res.json({ error: 'No chapters found in RSS feed' });
            }

            const latestItem = feed.items[0];

            // Send real-style notification (without TEST prefix)
            await rssChecker.sendNotification(
                manga.name,
                latestItem.title,
                latestItem.link,
                feed.image?.url,
                manga.anilistUrl
            );

            res.json({
                title: latestItem.title,
                link: latestItem.link,
                date: latestItem.pubDate,
                image: feed.image?.url,
                sent: true
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/api/mangas/:id/check', async (req, res) => {
        const manga = storage.getMangas().find(m => m.id === req.params.id);

        if (!manga) {
            return res.status(404).json({ error: 'Manga not found' });
        }

        try {
            await rssChecker.checkManga(manga);
            const updatedManga = storage.getMangas().find(m => m.id === req.params.id);
            res.json({
                success: true,
                lastChapter: updatedManga.lastChapter,
                lastChecked: updatedManga.lastChecked
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/export', (req, res) => {
        const mangas = storage.getMangas();
        const exportData = {
            exported: new Date().toISOString(),
            count: mangas.length,
            mangas: mangas.map(m => ({
                name: m.name,
                rssUrl: m.rssUrl,
                anilistUrl: m.anilistUrl,
                lastChapter: m.lastChapter
            }))
        };

        res.setHeader('Content-Disposition', 'attachment; filename=shinkan-export.json');
        res.setHeader('Content-Type', 'application/json');
        res.json(exportData);
    });

    app.listen(port, () => {
        console.log(`Web UI running at http://192.168.1.8:${port}`);
        console.log(`Web UI running at http://localhost:${port}`);
    });

    return app;
}

module.exports = createWebServer;
