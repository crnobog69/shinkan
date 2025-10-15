const fs = require('fs');
const path = require('path');

class Logger {
    constructor(logDir = './logs') {
        this.logDir = logDir;
        this.ensureLogDir();
    }

    ensureLogDir() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    getTimestamp() {
        return new Date().toISOString();
    }

    formatMessage(level, message, data = null) {
        let logMessage = `[${this.getTimestamp()}] [${level}] ${message}`;
        if (data) {
            logMessage += ` ${JSON.stringify(data)}`;
        }
        return logMessage;
    }

    writeToFile(filename, message) {
        const filePath = path.join(this.logDir, filename);
        const logEntry = message + '\n';
        
        try {
            fs.appendFileSync(filePath, logEntry);
        } catch (error) {
            console.error('Failed to write to log file:', error.message);
        }
    }

    info(message, data = null) {
        const formattedMessage = this.formatMessage('INFO', message, data);
        console.log(formattedMessage);
        this.writeToFile('app.log', formattedMessage);
    }

    error(message, data = null) {
        const formattedMessage = this.formatMessage('ERROR', message, data);
        console.error(formattedMessage);
        this.writeToFile('error.log', formattedMessage);
        this.writeToFile('app.log', formattedMessage);
    }

    warn(message, data = null) {
        const formattedMessage = this.formatMessage('WARN', message, data);
        console.warn(formattedMessage);
        this.writeToFile('app.log', formattedMessage);
    }

    debug(message, data = null) {
        const formattedMessage = this.formatMessage('DEBUG', message, data);
        console.log(formattedMessage);
        this.writeToFile('debug.log', formattedMessage);
    }

    manga(mangaName, message, data = null) {
        const formattedMessage = this.formatMessage('MANGA', `[${mangaName}] ${message}`, data);
        console.log(formattedMessage);
        this.writeToFile('manga.log', formattedMessage);
    }

    // Clean old log files (keep last N days)
    cleanOldLogs(daysToKeep = 7) {
        const files = fs.readdirSync(this.logDir);
        const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

        files.forEach(file => {
            const filePath = path.join(this.logDir, file);
            const stats = fs.statSync(filePath);
            
            if (stats.mtimeMs < cutoffTime) {
                fs.unlinkSync(filePath);
                console.log(`Deleted old log file: ${file}`);
            }
        });
    }
}

module.exports = Logger;
