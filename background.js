// SiteDog GitHub Integration Background Script

console.log('SiteDog Background Script loaded');

// Install/update listener
chrome.runtime.onInstalled.addListener((details) => {
    console.log('SiteDog GitHub Integration installed/updated', details.reason);

    // Set default settings
    try {
        chrome.storage.sync.set({
            enabled: true,
            showInPrivateRepos: false,
            autoCheck: true
        });
        console.log('Default settings saved');
    } catch (error) {
        console.error('Error setting default storage:', error);
    }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background received message:', request);

    if (request.action === 'fetchConfig') {
        fetchSiteDogConfig(request.url)
            .then(response => {
                console.log('Config fetch result:', response);
                sendResponse(response);
            })
            .catch(error => {
                console.error('Config fetch error:', error);
                sendResponse({ error: error.message });
            });
        return true; // Will respond asynchronously
    }
});

// Function to fetch sitedog.yml from GitHub
async function fetchSiteDogConfig(url) {
    console.log('Fetching config from:', url);

    try {
        const response = await fetch(url);
        if (response.ok) {
            const content = await response.text();
            console.log('Config fetched successfully');
            return { success: true, content };
        } else {
            console.log('Config file not found:', response.status);
            return { success: false, error: 'File not found' };
        }
    } catch (error) {
        console.error('Fetch error:', error);
        return { success: false, error: error.message };
    }
}