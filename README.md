# Shinkan - Discord Manga Notification Bot

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

## Usage

- Add manga RSS feeds through the web interface
- Bot checks every hour for new chapters (can be changed in rssChecker.js)
- Notifications are sent to the configured Discord channel
