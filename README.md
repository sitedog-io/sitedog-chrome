
# SiteDog GitHub Integration

🐶 **Chrome extension** that shows SiteDog project cards directly in GitHub repository UI.

## 🚀 Features

- ✅ **Automatic Detection** - Detects `sitedog.yml` in any GitHub repository
- ✅ **Native Integration** - Cards render seamlessly in GitHub's UI
- ✅ **Live Rendering** - Uses SiteDog's official card renderer
- ✅ **Dark Mode Support** - Follows GitHub's theme automatically
- ✅ **Configurable** - Settings popup for customization
- ✅ **Context Menu** - Right-click to refresh cards

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

1. **Page Detection** - Extension runs on all `github.com/*/*` pages
2. **Config Discovery** - Checks for `sitedog.yml` in repository root
3. **YAML Parsing** - Parses the configuration file
4. **Card Rendering** - Uses SiteDog's official renderer to create cards
5. **UI Integration** - Inserts cards into GitHub's native layout

## ⚙️ Settings

Access settings by clicking the extension icon in Chrome toolbar:

- **Enable SiteDog cards** - Master toggle for the extension
- **Show in private repos** - Display cards in private repositories
- **Auto-detect configs** - Automatically check for configs on page load

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
3. Parses YAML configuration
4. Loads SiteDog's official renderer (`https://sitedog.io/js/renderCards.js`)
5. Creates GitHub-styled container and renders cards
6. Inserts into DOM after repo description or file list

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
my-project:
  name: "My Awesome Project"
  description: "A cool web application"
  repository: "https://github.com/user/my-project"
  services:
    - react
    - nodejs
    - postgresql
```

## 🔄 Updates

The extension automatically:
- Checks for config changes when navigating
- Refreshes cards when settings change
- Updates rendering when SiteDog renderer updates

---

🐶 **SiteDog** - Making GitHub repositories more discoverable!