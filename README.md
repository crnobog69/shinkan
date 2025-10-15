# Shinkan - 新刊

A Discord bot that monitors manga RSS feeds and sends notifications when new chapters are released.

## Features

**Core Features:**
- Automatic manga chapter notifications to Discord
- Web-based management interface
- Real-time statistics dashboard
- Search and filter manga by category
- Import/Export manga lists
- Automatic retry mechanism for failed checks
- Error tracking and reporting
- Beautiful terminal UI with colored output

## Setup

### 1. Install Dependencies

Using Bun (recommended):
```bash
bun install
```

Using npm:
```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your Discord bot token and channel ID:
```bash
cp .env.example .env
```

Edit `.env`:
```env
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CHANNEL_ID=your_discord_channel_id_here
WEB_PORT=11111
```

### 3. Run the Bot

Using Bun:
```bash
bun start
```

Using npm:
```bash
npm start
```

### 4. Access Web UI

Open your browser and navigate to:
```
http://localhost:11111
```

## Running with PM2 (Recommended for Production)

PM2 keeps your bot running in the background and restarts it automatically if it crashes.

### Install PM2
```bash
npm install -g pm2
# or
bun install -g pm2
```

### Start with PM2
```bash
pm2 start src/index.js --name shinkan
```

### Useful PM2 Commands
```bash
pm2 status              # Check bot status
pm2 logs shinkan        # View logs
pm2 restart shinkan     # Restart bot
pm2 stop shinkan        # Stop bot
pm2 delete shinkan      # Remove from PM2
pm2 monit              # Monitor in real-time
```

### Make PM2 Start on System Boot
```bash
pm2 startup
pm2 save
```

## Web Interface Features

- **Add Manga**: Add manga by RSS URL with optional AniList integration
- **Categories**: Organize manga into custom categories
- **Search**: Quick search through your manga list
- **Filter**: Filter by category
- **Test**: Send test notifications to Discord
- **Check**: Manually check for new chapters
- **Statistics**: View total mangas, errors, and notifications sent
- **Import/Export**: Backup and restore your manga list

## API Endpoints

### Manga Management
- `GET /api/mangas` - Get all manga (supports ?category= and ?search= params)
- `POST /api/mangas` - Add new manga
- `PUT /api/mangas/:id` - Update manga
- `DELETE /api/mangas/:id` - Delete manga
- `POST /api/mangas/:id/check` - Manually check for updates
- `POST /api/mangas/:id/test` - Send test notification
- `POST /api/mangas/:id/realtest` - Send real-style notification

### Data Management
- `GET /api/categories` - Get all categories
- `GET /api/stats` - Get statistics
- `GET /api/export` - Export manga list
- `POST /api/import` - Import manga list
- `GET /api/health` - Health check endpoint

## Configuration

### Check Interval

By default, the bot checks every hour. To change this, modify `CHECK_INTERVAL` in `.env`:

```env
# Every 30 minutes
CHECK_INTERVAL=*/30 * * * *

# Every 2 hours
CHECK_INTERVAL=0 */2 * * *

# Every day at 8 AM
CHECK_INTERVAL=0 8 * * *
```

Format: [Cron expression](https://crontab.guru/)

### Retry Mechanism

The bot automatically retries failed RSS checks 3 times with exponential backoff. Failed manga are tracked and displayed in the web interface.

## Troubleshooting

### Bot won't start
- Check that `DISCORD_TOKEN` and `DISCORD_CHANNEL_ID` are set correctly in `.env`
- Verify your bot token is valid
- Ensure the bot has permissions to send messages in the specified channel

### RSS feed not working
- Verify the RSS URL is correct and accessible
- The bot auto-appends `/rss` if not present
- Check error messages in the web interface

### Notifications not appearing
- Verify the channel ID is correct
- Check bot permissions in Discord
- Use the "Test" button in web interface to diagnose

## Project Structure

```
shinkan/
├── src/
│   ├── index.js          # Main bot entry point
│   ├── config.js         # Configuration loader
│   ├── rssChecker.js     # RSS feed checking logic
│   ├── storage.js        # Data persistence
│   ├── web.js            # Web server and API
│   └── logger.js         # Logging utility
├── public/
│   └── index.html        # Web interface
├── data/
│   └── mangas.json       # Stored manga data
├── logs/                 # Application logs
├── .env                  # Environment variables
└── ecosystem.config.js   # PM2 configuration
```

## License

See [LICENSE](LICENSE) file for details.

## Credits

Made with ♥ by [crnobog](https://github.com/crnobog69)

---

_"A cage went in search of a bird."_ - Franz Kafka
