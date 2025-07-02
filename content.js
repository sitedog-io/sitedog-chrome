// SiteDog Chrome Extension - GitHub Integration v3.0
// Uses official SiteDog rendering engine

console.log('🐕 SiteDog: Content script loaded v3.0');

// Wait for libraries to load
let librariesLoaded = false;
let checkInterval = setInterval(() => {
  if (typeof jsyaml !== 'undefined' && typeof renderCards !== 'undefined') {
    librariesLoaded = true;
    clearInterval(checkInterval);
    console.log('🐕 SiteDog: Libraries loaded, initializing...');
    init();
  }
}, 100);

// Timeout after 5 seconds
setTimeout(() => {
  if (!librariesLoaded) {
    clearInterval(checkInterval);
    console.error('🐕 SiteDog: Failed to load libraries (jsyaml or renderCards)');
  }
}, 5000);

function init() {
  // Check if we're on a GitHub repository page
  if (!isGitHubRepo()) {
    console.log('🐕 SiteDog: Not a GitHub repo page, skipping');
    return;
  }

  console.log('🐕 SiteDog: GitHub repo detected, checking for sitedog.yml...');
  checkForSitedogYml();
}

function isGitHubRepo() {
  // Check if we're on github.com and on a repo page (has owner/repo pattern)
  const isGitHub = window.location.hostname === 'github.com';
  const pathParts = window.location.pathname.split('/').filter(p => p);
  const isRepoPage = pathParts.length >= 2 &&
                     !pathParts[0].startsWith('@') &&
                     pathParts[1] !== 'settings' &&
                     pathParts[1] !== 'notifications';

  return isGitHub && isRepoPage;
}

function getRepoPath() {
  const pathParts = window.location.pathname.split('/').filter(p => p);
  if (pathParts.length >= 2) {
    return `${pathParts[0]}/${pathParts[1]}`;
  }
  return null;
}

async function checkForSitedogYml() {
  const repoPath = getRepoPath();
  if (!repoPath) {
    console.log('🐕 SiteDog: Could not determine repo path');
    return;
  }

  // Try to fetch sitedog.yml from main branch (with cache busting)
  const timestamp = Date.now();
  const sitedogUrl = `https://raw.githubusercontent.com/${repoPath}/main/sitedog.yml?t=${timestamp}`;

  try {
    console.log(`🐕 SiteDog: Fetching ${sitedogUrl}`);
    const response = await fetch(sitedogUrl);

    if (response.ok) {
      const yamlContent = await response.text();
      console.log('🐕 SiteDog: Found sitedog.yml, rendering cards...');
      console.log('🐕 SiteDog: YAML content:', yamlContent.substring(0, 200) + '...');

      renderSiteDogCards(yamlContent);
    } else {
      console.log(`🐕 SiteDog: No sitedog.yml found (${response.status})`);
    }
  } catch (error) {
    console.log('🐕 SiteDog: Error checking for sitedog.yml:', error.message);
  }
}

function renderSiteDogCards(yamlContent) {
  // Find GitHub sidebar
  const sidebar = findGitHubSidebar();
  if (!sidebar) {
    console.log('🐕 SiteDog: Could not find GitHub sidebar');
    return;
  }

  // Remove existing SiteDog section
  const existingRow = sidebar.querySelector('.sitedog-border-row');
  if (existingRow) {
    existingRow.remove();
  }

  // Create BorderGrid-row for SiteDog section
  const sitedogRow = document.createElement('div');
  sitedogRow.className = 'BorderGrid-row sitedog-border-row';
  sitedogRow.innerHTML = `
    <div class="BorderGrid-cell">
      <div class="sitedog-section">
        <h2 class="h4 mb-3">
          Project Stack
        </h2>
        <div id="sitedog-cards" class="sitedog-cards-container"></div>
      </div>
    </div>
  `;

  // Insert before the Releases section or at the end
  const releasesSection = sidebar.querySelector('[data-hpc="true"]');
  if (releasesSection) {
    sidebar.insertBefore(sitedogRow, releasesSection);
  } else {
    sidebar.appendChild(sitedogRow);
  }

  const cardContainer = sitedogRow.querySelector('#sitedog-cards');

  // Use official renderCards function
  renderCards(yamlContent, cardContainer, (config, result, error) => {
    if (result) {
      console.log('🐕 SiteDog: Cards rendered successfully');
      console.log('🐕 SiteDog: Parsed config:', config);
    } else {
      console.error('🐕 SiteDog: Rendering error:', error);
      cardContainer.innerHTML = `
        <div class="flash flash-error">
          <strong>SiteDog YAML Error:</strong><br>
          ${error}
        </div>
      `;
    }
  });
}

function findGitHubSidebar() {
  // Try different selectors for GitHub sidebar
  const selectors = [
    '[data-testid="repo-sidebar"]',
    '.Layout-sidebar',
    '.repository-content .BorderGrid-cell:last-child',
    '.js-repo-nav ~ .BorderGrid .BorderGrid-cell:last-child'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      console.log(`🐕 SiteDog: Found sidebar with selector: ${selector}`);
      return element;
    }
  }

  console.log('🐕 SiteDog: Could not find sidebar, trying manual search...');

  // Manual search for BorderGrid with About section
  const borderGrids = document.querySelectorAll('.BorderGrid');
  for (const grid of borderGrids) {
    const aboutSection = grid.querySelector('h2');
    if (aboutSection && aboutSection.textContent.trim() === 'About') {
      console.log('🐕 SiteDog: Found sidebar via About section');
      return grid;
    }
  }

  return null;
}

// Re-run when page content changes (for SPA navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('🐕 SiteDog: Page changed, re-checking...');
    setTimeout(init, 1000); // Small delay for page to stabilize
  }
}).observe(document, { subtree: true, childList: true });

console.log('🐕 SiteDog: Content script initialized');