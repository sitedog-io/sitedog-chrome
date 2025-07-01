// SiteDog GitHub Integration Background Script v2.0

console.log('SiteDog Background Script v2.0 loaded');

// Install/update listener
chrome.runtime.onInstalled.addListener((details) => {
    console.log('SiteDog: Extension installed/updated -', details.reason);

    // Set default settings
    try {
        chrome.storage.sync.set({
            enabled: true,
            showInPrivateRepos: false,
            autoCheck: true
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('SiteDog: Storage error:', chrome.runtime.lastError);
            } else {
                console.log('SiteDog: Default settings saved');
            }
        });
    } catch (error) {
        console.error('SiteDog: Error setting default storage:', error);
    }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('SiteDog: Background received message:', request);

    if (request.action === 'fetchConfig') {
        // Fetch config and respond
        fetchSiteDogConfig(request.url)
            .then(response => {
                console.log('SiteDog: Config fetch result:', response);
                sendResponse(response);
            })
            .catch(error => {
                console.error('SiteDog: Config fetch error:', error);
                sendResponse({ success: false, error: error.message });
            });

        // Keep message channel open for async response
        return true;
    }

    // Unknown action
    console.log('SiteDog: Unknown action:', request.action);
    sendResponse({ success: false, error: 'Unknown action' });
});

// Function to fetch sitedog.yml from GitHub
async function fetchSiteDogConfig(url) {
    console.log('SiteDog: Fetching config from:', url);

    try {
        const response = await fetch(url);

        if (response.ok) {
            const content = await response.text();
            console.log('SiteDog: Config fetched successfully, length:', content.length);
            return { success: true, content };
        } else {
            console.log('SiteDog: Config file not found, status:', response.status);
            return { success: false, error: `File not found (${response.status})` };
        }
    } catch (error) {
        console.error('SiteDog: Fetch error:', error);
        return { success: false, error: error.message };
    }
}

console.log('SiteDog: Background script setup complete');