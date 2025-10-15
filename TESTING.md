# Testing Checklist

After the improvements, test these features:

## ✅ Basic Functionality
- [ ] Bot starts without errors
- [ ] Web interface loads at http://localhost:11111
- [ ] Can add a new manga
- [ ] Can edit a manga
- [ ] Can delete a manga
- [ ] Test button sends Discord notification
- [ ] Real Test button sends Discord notification (without TEST prefix)
- [ ] Check button manually checks for updates

## ✅ New Features

### Statistics
- [ ] Stats panel displays correct manga count
- [ ] Stats show error count
- [ ] Stats show notifications sent
- [ ] Stats show last check time
- [ ] Stats auto-refresh every 30 seconds

### Categories
- [ ] Can add category when creating manga
- [ ] Can edit category
- [ ] Category filter dropdown shows all categories
- [ ] Filtering by category works
- [ ] Category badge displays on manga items

### Search
- [ ] Search box filters manga in real-time
- [ ] Search works for manga names
- [ ] Search works for URLs
- [ ] Clear search shows all manga again

### Import/Export
- [ ] Export button downloads JSON file
- [ ] Export file contains all manga data
- [ ] Import button opens modal
- [ ] Can paste JSON and import
- [ ] Duplicate detection works
- [ ] Import shows success message with counts

### Error Handling
- [ ] Manga with errors show error message
- [ ] Fail count displays for problematic manga
- [ ] Retry mechanism works (check logs)
- [ ] Bot doesn't crash on RSS errors

### Logging
- [ ] Log files created in logs/ directory
- [ ] app.log contains general logs
- [ ] error.log contains errors only
- [ ] manga.log contains manga-specific logs
- [ ] Timestamps are correct

## ✅ API Endpoints
- [ ] GET /api/mangas works
- [ ] GET /api/mangas?search=query works
- [ ] GET /api/mangas?category=name works
- [ ] GET /api/categories works
- [ ] GET /api/stats works
- [ ] GET /api/health works
- [ ] POST /api/import works
- [ ] GET /api/export works

## ✅ Configuration
- [ ] Bot validates DISCORD_TOKEN on startup
- [ ] Bot validates DISCORD_CHANNEL_ID on startup
- [ ] Bot exits with error if config missing
- [ ] WEB_PORT can be changed in .env
- [ ] CHECK_INTERVAL can be changed in .env

## ✅ Discord Integration
- [ ] Bot logs in successfully
- [ ] Bot sets presence status
- [ ] Notifications include manga name
- [ ] Notifications include chapter title
- [ ] Notifications include link
- [ ] Notifications include AniList link (if set)
- [ ] Notifications include cover image (if available)

## 🔧 Edge Cases
- [ ] Adding manga without RSS URL shows error
- [ ] Adding duplicate manga works
- [ ] Editing manga to invalid URL handled gracefully
- [ ] Import invalid JSON shows error
- [ ] Empty search returns all manga
- [ ] Non-existent category filter handled
- [ ] Missing manga image doesn't break notification

## 📊 Performance
- [ ] Web interface loads quickly
- [ ] Search is responsive (no lag)
- [ ] Stats update without page reload
- [ ] Multiple manga checks complete in reasonable time
- [ ] Memory usage is reasonable

## 🐛 Known Issues
Add any issues you find here:
- 

## 💡 Improvements Needed
Add any improvements you think of:
-
