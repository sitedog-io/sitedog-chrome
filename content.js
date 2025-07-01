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
        console.log('SiteDog: Starting content script');

        // Check if we're on a GitHub repository page
        if (!this.isRepositoryPage()) {
            console.log('SiteDog: Not a repository page, skipping');
            return;
        }

        this.repoInfo = this.extractRepoInfo();
        if (!this.repoInfo) {
            console.log('SiteDog: Could not extract repo info');
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
            console.log('SiteDog: Checking for config at:', configUrl);

            const response = await fetch(configUrl);
            console.log('SiteDog: Config fetch response status:', response.status);

            if (response.ok) {
                const yamlContent = await response.text();
                console.log('SiteDog: Found sitedog.yml, content length:', yamlContent.length);

                this.sitedogConfig = this.parseYaml(yamlContent);
                console.log('SiteDog: Parsed config:', this.sitedogConfig);

                if (this.sitedogConfig && Object.keys(this.sitedogConfig).length > 0) {
                    console.log('SiteDog: Rendering cards for projects:', Object.keys(this.sitedogConfig));
                    this.renderSiteDogCard();
                } else {
                    console.log('SiteDog: Config is empty or invalid');
                }
            } else {
                console.log('SiteDog: No sitedog.yml found in repository (status:', response.status, ')');
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

        // Render cards immediately
        this.renderCards(cardContainer);
    }

    findInsertionPoint() {
        // Look for the BorderGrid container in the sidebar
        const borderGrid = document.querySelector('.BorderGrid.about-margin');
        if (!borderGrid) {
            console.log('SiteDog: BorderGrid not found');
            return null;
        }

        // Find the About section (first BorderGrid-row)
        const aboutRow = borderGrid.querySelector('.BorderGrid-row');
        if (aboutRow) {
            console.log('SiteDog: Found About section for insertion');
            return aboutRow;
        }

        return null;
    }

    createCardContainer() {
        const container = document.createElement('div');
        container.className = 'BorderGrid-row';
        container.innerHTML = `
            <div class="BorderGrid-cell">
                <h2 class="h4 mb-3">
                    🐶 SiteDog Project Overview
                </h2>
                <div class="sitedog-cards" id="sitedog-cards">
                    <div class="text-small color-fg-muted">
                        Loading SiteDog configuration...
                    </div>
                </div>
            </div>
        `;
        return container;
    }



    renderCards(container) {
        const cardsElement = container.querySelector('#sitedog-cards');
        if (!cardsElement) {
            console.error('SiteDog: Could not find cards element');
            return;
        }

        // Clear loading message
        cardsElement.innerHTML = '';

        // Create cards for each project in the config
        const projects = Object.keys(this.sitedogConfig);

        if (projects.length === 0) {
            cardsElement.innerHTML = `
                <div class="text-small color-fg-muted">
                    No projects configured in sitedog.yml
                </div>
            `;
            return;
        }

        // Create project cards
        projects.forEach(projectName => {
            const projectConfig = this.sitedogConfig[projectName];
            const card = this.createProjectCard(projectName, projectConfig);
            cardsElement.appendChild(card);
        });
    }

    createProjectCard(projectName, config) {
        const card = document.createElement('div');
        card.className = 'Box mb-3';

        let servicesHtml = '';
        if (config.services && config.services.length > 0) {
            servicesHtml = `
                <div class="mt-2">
                    <div class="text-small color-fg-muted mb-1">Services:</div>
                    <div class="d-flex flex-wrap">
                        ${config.services.map(service => `
                            <span class="Label mr-1 mb-1">${service}</span>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="Box-body">
                <div class="d-flex flex-items-center">
                    <div class="flex-1">
                        <h3 class="text-normal mb-1">
                            <strong>${projectName}</strong>
                        </h3>
                        ${config.description ? `
                            <p class="text-small color-fg-muted mb-2">
                                ${config.description}
                            </p>
                        ` : ''}
                        ${servicesHtml}
                        ${config.url ? `
                            <div class="mt-2">
                                <a href="${config.url}" target="_blank" rel="noopener noreferrer" class="Link--primary text-small">
                                    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" class="octicon octicon-link mr-1">
                                        <path d="m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z"></path>
                                    </svg>
                                    Open Project
                                </a>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        return card;
    }


}

// Initialize the extension
new SiteDogGitHubIntegration();