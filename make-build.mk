# Build commands for SiteDog Chrome Extension

# Dependencies URLs
JS_YAML_URL = https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js
RENDER_CARDS_URL = https://sitedog.io/js/renderCards.js
PREVIEW_CSS_URL = https://sitedog.io/css/preview.css

# Dependencies list
DEPENDENCIES = js-yaml.min.js renderCards.js preview.css

.PHONY: deps clean build install

# Download all dependencies
deps:
	@echo "📥 Downloading dependencies..."
	@curl -sSL $(JS_YAML_URL) -o js-yaml.min.js
	@curl -sSL $(RENDER_CARDS_URL) -o renderCards.js
	@curl -sSL $(PREVIEW_CSS_URL) -o preview.css
	@echo "✅ Dependencies downloaded"

# Clean dependencies
clean:
	@echo "🧹 Cleaning dependencies..."
	@rm -f $(DEPENDENCIES)
	@echo "✅ Dependencies cleaned"

# Build extension (download deps first)
build: deps
	@echo "🏗️  Building SiteDog Chrome Extension..."
	@echo "✅ Extension ready for installation"

# Install in Chrome (requires manual loading)
install: build
	@echo "🚀 Extension built successfully!"
	@echo "📋 To install:"
	@echo "   1. Open Chrome and go to chrome://extensions/"
	@echo "   2. Enable 'Developer mode'"
	@echo "   3. Click 'Load unpacked'"
	@echo "   4. Select this folder: $(PWD)"

# Check if dependencies exist
check-deps:
	@echo "🔍 Checking dependencies..."
	@for dep in $(DEPENDENCIES); do \
		if [ -f "$$dep" ]; then \
			echo "✅ $$dep"; \
		else \
			echo "❌ $$dep (missing)"; \
		fi; \
	done

# Force rebuild (clean + build)
rebuild: clean build