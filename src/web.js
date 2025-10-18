const express = require('express');
const path = require('path');

function createWebServer(storage, port, rssChecker, getStartTime) {
    const app = express();

    app.use(express.json());
    app.use(express.static(path.join(__dirname, '../public')));

    app.get('/api/mangas', (req, res) => {
        try {
            const { category, search } = req.query;
            let mangas = storage.getMangas();

            if (search) {
                mangas = storage.searchMangas(search);
            } else if (category && category !== 'all') {
                mangas = mangas.filter(m => (m.category || 'Uncategorized') === category);
            }

            res.json(mangas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/categories', (req, res) => {
        try {
            const categories = storage.getCategories();
            res.json(categories);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/stats', (req, res) => {
        try {
            const mangas = storage.getMangas();
            const checkerStats = rssChecker.getStats();
            const uptimeMs = Date.now() - getStartTime();
            const stats = {
                totalMangas: mangas.length,
                mangasWithErrors: mangas.filter(m => m.failCount > 0).length,
                mangasNeverChecked: mangas.filter(m => !m.lastChecked).length,
                categories: storage.getCategories().length,
                uptime: uptimeMs,
                ...checkerStats
            };
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/health', (req, res) => {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    });

    app.post('/api/mangas', (req, res) => {
        try {
            let { name, rssUrl, anilistUrl, category } = req.body;
            if (!name || !rssUrl) {
                return res.status(400).json({ error: 'Name and RSS URL required' });
            }

            // Auto-append /rss if not present
            if (!rssUrl.endsWith('/rss')) {
                rssUrl = rssUrl.replace(/\/$/, '') + '/rss';
            }

            const manga = storage.addManga({ name, rssUrl, anilistUrl, category });
            res.json(manga);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/api/import', (req, res) => {
        try {
            const { mangas } = req.body;
            if (!mangas || !Array.isArray(mangas)) {
                return res.status(400).json({ error: 'Invalid import data' });
            }

            const result = storage.importMangas(mangas);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.delete('/api/mangas/:id', (req, res) => {
        try {
            storage.deleteManga(req.params.id);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.put('/api/mangas/:id', (req, res) => {
        try {
            let { name, rssUrl, anilistUrl, category } = req.body;
            if (!name || !rssUrl) {
                return res.status(400).json({ error: 'Name and RSS URL required' });
            }

            // Auto-append /rss if not present
            if (!rssUrl.endsWith('/rss')) {
                rssUrl = rssUrl.replace(/\/$/, '') + '/rss';
            }

            const manga = storage.updateManga(req.params.id, { name, rssUrl, anilistUrl, category });
            if (!manga) {
                return res.status(404).json({ error: 'Manga not found' });
            }
            res.json(manga);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
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
        try {
            const mangas = storage.getMangas();
            const exportData = {
                exported: new Date().toISOString(),
                version: '1.0',
                count: mangas.length,
                mangas: mangas.map(m => ({
                    name: m.name,
                    rssUrl: m.rssUrl,
                    anilistUrl: m.anilistUrl,
                    category: m.category,
                    lastChapter: m.lastChapter
                }))
            };

            res.setHeader('Content-Disposition', 'attachment; filename=shinkan-export.json');
            res.setHeader('Content-Type', 'application/json');
            res.json(exportData);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.listen(port, () => {
        console.log(`🌐 Web UI running at http://localhost:${port}`);
    });

    return app;
}

module.exports = createWebServer;
