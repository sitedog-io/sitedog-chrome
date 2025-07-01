// SiteDog GitHub Integration Content Script

class SiteDogGitHubIntegration {
    constructor() {
        this.sitedogConfig = null;
        this.repoInfo = null;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }

    start() {
        // Check if we're on a GitHub repository page
        if (!this.isRepositoryPage()) {
            return;
        }

        this.repoInfo = this.extractRepoInfo();
        if (!this.repoInfo) {
            return;
        }

        console.log('SiteDog: Detected GitHub repo:', this.repoInfo);
        this.checkForSiteDogConfig();
    }

    isRepositoryPage() {
        // Check if we're on a repository main page (not issues, PRs, etc.)
        const path = window.location.pathname;
        const pathParts = path.split('/').filter(p => p);

        // Should be like: github.com/owner/repo or github.com/owner/repo/tree/branch
        return pathParts.length >= 2 &&
               !['issues', 'pulls', 'actions', 'settings', 'wiki'].includes(pathParts[2]);
    }

    extractRepoInfo() {
        const path = window.location.pathname;
        const pathParts = path.split('/').filter(p => p);

        if (pathParts.length < 2) {
            return null;
        }

        return {
            owner: pathParts[0],
            repo: pathParts[1],
            branch: this.getCurrentBranch() || 'main'
        };
    }

    getCurrentBranch() {
        // Try to get current branch from the branch selector
        const branchSelector = document.querySelector('[data-testid="anchor-button"] .Button-label');
        if (branchSelector) {
            return branchSelector.textContent.trim();
        }

        // Fallback: check if we're on a specific branch in URL
        const path = window.location.pathname;
        const treeMatch = path.match(/\/tree\/([^\/]+)/);
        if (treeMatch) {
            return treeMatch[1];
        }

        return 'main';
    }

    async checkForSiteDogConfig() {
        try {
            const { owner, repo, branch } = this.repoInfo;

            // Check if sitedog.yml exists in the repository
            const configUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/sitedog.yml`;

            const response = await fetch(configUrl);

            if (response.ok) {
                const yamlContent = await response.text();
                console.log('SiteDog: Found sitedog.yml:', yamlContent);

                this.sitedogConfig = this.parseYaml(yamlContent);
                if (this.sitedogConfig) {
                    this.renderSiteDogCard();
                }
            } else {
                console.log('SiteDog: No sitedog.yml found in repository');
            }
        } catch (error) {
            console.error('SiteDog: Error checking for config:', error);
        }
    }

    parseYaml(yamlString) {
        try {
            // Simple YAML parser for basic structures
            // In a real implementation, you'd want to use a proper YAML library
            const lines = yamlString.split('\n');
            const result = {};
            let currentProject = null;
            let currentIndent = 0;

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) continue;

                const indent = line.length - line.trimStart().length;

                if (indent === 0 && trimmed.endsWith(':')) {
                    // Top level project
                    currentProject = trimmed.slice(0, -1);
                    result[currentProject] = {};
                    currentIndent = 0;
                } else if (currentProject && indent > currentIndent) {
                    // Project properties
                    const [key, ...valueParts] = trimmed.split(':');
                    const value = valueParts.join(':').trim();

                    if (key && value) {
                        if (key === 'services') {
                            // Handle services array
                            result[currentProject][key] = [];
                        } else {
                            result[currentProject][key] = value.replace(/^["']|["']$/g, '');
                        }
                    } else if (key === 'services') {
                        result[currentProject]['services'] = [];
                    }
                } else if (currentProject && trimmed.startsWith('- ')) {
                    // Service item
                    const service = trimmed.slice(2).trim();
                    if (result[currentProject]['services']) {
                        result[currentProject]['services'].push(service);
                    }
                }
            }

            return result;
        } catch (error) {
            console.error('SiteDog: Error parsing YAML:', error);
            return null;
        }
    }

    renderSiteDogCard() {
        // Find the container where GitHub shows suggested workflows
        const insertionPoint = this.findInsertionPoint();
        if (!insertionPoint) {
            console.log('SiteDog: Could not find insertion point');
            return;
        }

        const cardContainer = this.createCardContainer();
        insertionPoint.insertAdjacentElement('afterend', cardContainer);

        // Load external resources and render cards
        this.loadExternalResources().then(() => {
            this.renderCards(cardContainer);
        });
    }

    findInsertionPoint() {
        // Look for common GitHub elements where we can insert our card
        const candidates = [
            // After the repo description
            'p[data-testid="repository-description"]',
            // After the about section
            '.BorderGrid-cell .BorderGrid-row:last-child',
            // Fallback: after file list
            '.js-navigation-container',
        ];

        for (const selector of candidates) {
            const element = document.querySelector(selector);
            if (element) {
                return element;
            }
        }

        return null;
    }

    createCardContainer() {
        const container = document.createElement('div');
        container.className = 'sitedog-card-container';
        container.innerHTML = `
            <div class="sitedog-header">
                <h3>🐶 SiteDog Project Overview</h3>
            </div>
            <div class="sitedog-cards" id="sitedog-cards"></div>
        `;
        return container;
    }

    async loadExternalResources() {
        // Load YAML parser
        if (!window.jsyaml) {
            await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js');
        }

        // Load SiteDog render script
        if (!window.renderCards) {
            await this.loadScript('https://sitedog.io/js/renderCards.js');
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    renderCards(container) {
        const cardsElement = container.querySelector('#sitedog-cards');
        if (!cardsElement || !window.renderCards) {
            console.error('SiteDog: Could not render cards');
            return;
        }

        // Convert our parsed config back to YAML for the render function
        const yamlString = this.configToYaml(this.sitedogConfig);

        try {
            window.renderCards(yamlString, cardsElement, (config, result, error) => {
                if (!result) {
                    cardsElement.innerHTML = `<div class="sitedog-error">Error rendering cards: ${error}</div>`;
                }
            });
        } catch (error) {
            console.error('SiteDog: Error rendering cards:', error);
            cardsElement.innerHTML = `<div class="sitedog-error">Error: ${error.message}</div>`;
        }
    }

    configToYaml(config) {
        // Simple conversion back to YAML format
        let yaml = '';
        for (const [projectName, projectConfig] of Object.entries(config)) {
            yaml += `${projectName}:\n`;
            for (const [key, value] of Object.entries(projectConfig)) {
                if (key === 'services' && Array.isArray(value)) {
                    yaml += `  ${key}:\n`;
                    for (const service of value) {
                        yaml += `    - ${service}\n`;
                    }
                } else {
                    yaml += `  ${key}: "${value}"\n`;
                }
            }
            yaml += '\n';
        }
        return yaml;
    }
}

// Initialize the extension
new SiteDogGitHubIntegration();