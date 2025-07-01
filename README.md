# SiteDog Chrome Extension

Chrome extension that seamlessly integrates SiteDog project cards into GitHub repository UI.

## Features

- **Automatic Detection** - Detects `sitedog.yml` files in GitHub repositories
- **Native Integration** - Adds "Project Stack" section to GitHub sidebar
- **Official Rendering** - Uses SiteDog's official rendering engine
- **Theme Support** - Supports both light and dark GitHub themes
- **Zero Configuration** - Works automatically, no setup required

## Installation

### Chrome Web Store (Recommended)
*Coming soon - will be available on Chrome Web Store*

### Development Mode
1. Download the extension files
2. Open `chrome://extensions/` in Chrome
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder
5. Visit any GitHub repository with `sitedog.yml`

## How It Works

1. **Repository Detection** - Automatically detects GitHub repository pages
2. **Config Discovery** - Checks for `sitedog.yml` in repository root
3. **YAML Parsing** - Parses configuration using js-yaml library
4. **Card Rendering** - Renders project cards using SiteDog's official engine
5. **Sidebar Integration** - Inserts "Project Stack" section in GitHub sidebar

## Supported Configuration

Works with standard SiteDog YAML configuration:

```yaml
frontend:
  description: "React frontend application"
  url: "https://app.example.com"
  services:
    - "Web Interface"
    - "API Client"

backend:
  description: "Node.js API server"
  url: "https://api.example.com"
  services:
    - "REST API"
    - "Database"

cli:
  description: "Command line tool"
  url: "https://github.com/user/project-cli"
  services:
    - "CLI Tool"
    - "Configuration"
```

## Development

### Build Commands

```bash
# Install dependencies and build
make build

# Package for Chrome Web Store
make package

# Clean dependencies
make clean

# Check dependencies
make check-deps
```

### File Structure

- `manifest.json` - Chrome extension manifest
- `content.js` - Main content script for GitHub integration
- `styles.css` - GitHub UI adaptation styles
- `background.js` - Service worker
- `popup.html/js` - Extension popup interface

## Privacy & Security

- **No Data Collection** - Extension works entirely locally
- **Read-Only Access** - Only reads public repository files
- **No Tracking** - Does not send data anywhere
- **Minimal Permissions** - Only requests necessary permissions

## Technical Details

- Uses GitHub's raw.githubusercontent.com API to fetch sitedog.yml
- Integrates with GitHub's BorderGrid component system
- Matches GitHub's design system using CSS variables
- Supports responsive design for all device sizes

## License

Part of the SiteDog ecosystem.