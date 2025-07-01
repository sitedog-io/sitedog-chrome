
# SiteDog GitHub Integration

🐶 **Chrome extension** that shows SiteDog project cards directly in GitHub repository UI.

## 🚀 Features

- ✅ **Automatic Detection** - Detects `sitedog.yml` in any GitHub repository
- ✅ **BorderGrid Integration** - Cards appear as native BorderGrid-row in sidebar
- ✅ **Native GitHub Styling** - Matches GitHub's design system perfectly
- ✅ **Project Cards** - Beautiful cards showing project info and services
- ✅ **Dark Mode Support** - Follows GitHub's theme automatically
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Live Detection** - Automatically loads when sitedog.yml is found

## 📦 Installation

### Development Mode
1. Clone or download this extension
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked" and select the extension folder
5. Visit any GitHub repository with `sitedog.yml`

### Production (Future)
Will be available on Chrome Web Store.

## 🎯 How It Works

1. **Page Detection** - Extension runs on all `github.com/*/*` repository pages
2. **Config Discovery** - Checks for `sitedog.yml` in repository root via GitHub's raw API
3. **YAML Parsing** - Parses the configuration file using built-in parser
4. **BorderGrid Integration** - Creates new BorderGrid-row in repository sidebar
5. **Card Rendering** - Renders beautiful project cards with GitHub's native styling
6. **Seamless Integration** - Cards appear between "About" and "Releases" sections

## ⚙️ Configuration

The extension works automatically with no configuration needed:

- **Automatic detection** - Detects `sitedog.yml` files automatically
- **Live updates** - Refreshes when navigating between repositories
- **Error handling** - Gracefully handles missing or invalid config files

## 🔧 Technical Details

### Files Structure
```
sitedog-chrome/
├── manifest.json          # Extension manifest
├── content.js             # Main content script (runs on GitHub)
├── background.js          # Background service worker
├── styles.css             # GitHub-integrated styles
├── popup.html             # Settings popup UI
├── popup.js               # Settings popup logic
└── README.md              # This file
```

### How Cards Are Rendered

1. Content script detects repository info from URL
2. Fetches `sitedog.yml` from `raw.githubusercontent.com`
3. Parses YAML configuration using built-in parser
4. Creates new `BorderGrid-row` element with proper GitHub classes
5. Generates project cards with native GitHub Box components
6. Inserts BorderGrid-row into sidebar between About and Releases sections
7. Applies GitHub's native CSS variables for theming

### GitHub API Integration

- Uses `raw.githubusercontent.com` for config fetching
- No authentication required for public repos
- Respects GitHub's rate limiting
- Works with any branch (defaults to `main`)

## 🎨 Design Integration

The extension seamlessly integrates with GitHub's design system:

- Uses GitHub's CSS variables for theming
- Supports both light and dark modes
- Matches GitHub's spacing and typography
- Responsive design for mobile/tablet
- Native GitHub component styling

## 🔒 Privacy & Security

- **No data collection** - Extension works entirely locally
- **Read-only access** - Only reads public repository files
- **No external tracking** - Does not send data to third parties
- **Minimal permissions** - Only requests necessary Chrome permissions

## 🛠️ Development

### Debugging
1. Open Chrome DevTools on any GitHub page
2. Check Console for `SiteDog:` prefixed logs
3. Use "Inspect popup" on extension icon for popup debugging

### Testing
- Test on repositories with `sitedog.yml` files
- Verify dark/light mode switching
- Check responsive behavior
- Test settings persistence

## 🎯 Supported Repositories

The extension works with any GitHub repository containing:
- `sitedog.yml` file in the root directory
- Valid YAML syntax
- SiteDog-compatible configuration format

## 📝 Example Configuration

```yaml
frontend:
  description: "Главный фронтенд проект SiteDog"
  url: "https://sitedog.io"
  services:
    - "Web Interface"
    - "API Client"
    - "Authentication"

backend:
  description: "Backend API для SiteDog платформы"
  url: "https://api.sitedog.io"
  services:
    - "REST API"
    - "Database"
    - "Queue System"

cli:
  description: "Инструмент командной строки SiteDog"
  url: "https://github.com/sitedog-io/sitedog-cli"
  services:
    - "CLI Tool"
    - "Configuration Manager"
    - "Project Generator"
```

### Card Display

Each project in your `sitedog.yml` becomes a beautiful card showing:
- **Project name** as the card title
- **Description** if provided
- **Services** as labeled tags
- **URL** as a clickable "Open Project" link

## 🔄 Updates

The extension automatically:
- Checks for config changes when navigating
- Refreshes cards when settings change
- Updates rendering when SiteDog renderer updates

---

🐶 **SiteDog** - Making GitHub repositories more discoverable!