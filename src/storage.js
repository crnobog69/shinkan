const fs = require('fs');
const path = require('path');

class Storage {
    constructor(filePath) {
        this.filePath = filePath;
        this.ensureDataFile();
    }

    ensureDataFile() {
        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, JSON.stringify({ mangas: [] }, null, 2));
        }
    }

    read() {
        const data = fs.readFileSync(this.filePath, 'utf8');
        return JSON.parse(data);
    }

    write(data) {
        fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    }

    getMangas() {
        return this.read().mangas;
    }

    addManga(manga) {
        const data = this.read();
        manga.id = Date.now().toString();
        manga.lastChecked = null;
        manga.lastChapter = null;
        manga.anilistUrl = manga.anilistUrl || null;
        manga.category = manga.category || 'Uncategorized';
        manga.lastError = null;
        manga.failCount = 0;
        manga.addedAt = new Date().toISOString();
        data.mangas.push(manga);
        this.write(data);
        return manga;
    }

    importMangas(mangasToImport) {
        const data = this.read();
        let imported = 0;
        let skipped = 0;

        for (const manga of mangasToImport) {
            // Check if manga already exists by RSS URL
            const exists = data.mangas.some(m => m.rssUrl === manga.rssUrl);
            if (exists) {
                skipped++;
                continue;
            }

            const newManga = {
                id: Date.now().toString() + imported,
                name: manga.name,
                rssUrl: manga.rssUrl,
                anilistUrl: manga.anilistUrl || null,
                category: manga.category || 'Uncategorized',
                lastChecked: null,
                lastChapter: null,
                lastError: null,
                failCount: 0,
                addedAt: new Date().toISOString()
            };
            data.mangas.push(newManga);
            imported++;
        }

        this.write(data);
        return { imported, skipped };
    }

    getCategories() {
        const mangas = this.getMangas();
        const categories = new Set(mangas.map(m => m.category || 'Uncategorized'));
        return Array.from(categories).sort();
    }

    searchMangas(query) {
        const mangas = this.getMangas();
        const lowerQuery = query.toLowerCase();
        return mangas.filter(m => 
            m.name.toLowerCase().includes(lowerQuery) ||
            m.rssUrl.toLowerCase().includes(lowerQuery) ||
            (m.lastChapter && m.lastChapter.toLowerCase().includes(lowerQuery))
        );
    }

    deleteManga(id) {
        const data = this.read();
        data.mangas = data.mangas.filter(m => m.id !== id);
        this.write(data);
    }

    updateManga(id, updates) {
        const data = this.read();
        const manga = data.mangas.find(m => m.id === id);
        if (manga) {
            Object.assign(manga, updates);
            this.write(data);
        }
        return manga;
    }
}

module.exports = Storage;
