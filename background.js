// SiteDog GitHub Integration Background Script

// Install/update listener
chrome.runtime.onInstalled.addListener((details) => {
    console.log('SiteDog GitHub Integration installed/updated');

    // Set default settings
    chrome.storage.sync.set({
        enabled: true,
        showInPrivateRepos: false,
        autoCheck: true
    });
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetchConfig') {
        fetchSiteDogConfig(request.url)
            .then(response => sendResponse(response))
            .catch(error => sendResponse({ error: error.message }));
        return true; // Will respond asynchronously
    }
});

// Function to fetch sitedog.yml from GitHub
async function fetchSiteDogConfig(url) {
    try {
        const response = await fetch(url);
        if (response.ok) {
            const content = await response.text();
            return { success: true, content };
        } else {
            return { success: false, error: 'File not found' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Handle tab updates to check for GitHub pages
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        const isGitHub = tab.url.includes('github.com');
        if (isGitHub) {
            // Check if extension is enabled
            const settings = await chrome.storage.sync.get(['enabled']);
            if (settings.enabled) {
                // Enable page action for GitHub tabs
                chrome.action.enable(tabId);
            }
        }
    }
});

// Set up context menu (optional)
chrome.contextMenus.create({
    id: 'sitedog-refresh',
    title: 'Refresh SiteDog Cards',
    contexts: ['page'],
    documentUrlPatterns: ['https://github.com/*/*']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'sitedog-refresh') {
        chrome.tabs.sendMessage(tab.id, { action: 'refresh' });
    }
});