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
        data.mangas.push(manga);
        this.write(data);
        return manga;
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
