# Shinkan - 新刊

## Setup

1. Install dependencies:
   ```bash
   bun install
   ```

2. Copy `.env.example` to `.env` and fill in your Discord bot token and channel ID

3. Run the bot:
   ```bash
   bun start
   ```

4. Access web UI at `http://localhost:11111`

## Running with PM2 (Recommended for Production)

PM2 keeps your bot running in the background and restarts it automatically if it crashes.

1. Install PM2 globally:
   ```bash
   bun install -g pm2
   ```

2. Start the bot with PM2:
   ```bash
   pm2 start src/index.js --name shinkan
   ```

3. Useful PM2 commands:
   ```bash
   pm2 status              # Check bot status
   pm2 logs shinkan        # View logs
   pm2 restart shinkan     # Restart bot
   pm2 stop shinkan        # Stop bot
   pm2 delete shinkan      # Remove from PM2
   ```

4. Make PM2 start on system boot:
   ```bash
   pm2 startup
   pm2 save
   ```

## Usage

- Add manga RSS feeds through the web interface
- Bot checks every hour for new chapters (can be changed in rssChecker.js)
- Notifications are sent to the configured Discord channel
