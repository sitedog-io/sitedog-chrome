// SiteDog GitHub Integration Popup Script

document.addEventListener('DOMContentLoaded', async () => {
    // Load current settings
    const settings = await chrome.storage.sync.get(['enabled', 'showInPrivateRepos', 'autoCheck']);

    // Set checkbox states
    document.getElementById('enabled').checked = settings.enabled !== false;
    document.getElementById('showInPrivateRepos').checked = settings.showInPrivateRepos === true;
    document.getElementById('autoCheck').checked = settings.autoCheck !== false;

    // Save settings
    document.getElementById('saveSettings').addEventListener('click', async () => {
        const newSettings = {
            enabled: document.getElementById('enabled').checked,
            showInPrivateRepos: document.getElementById('showInPrivateRepos').checked,
            autoCheck: document.getElementById('autoCheck').checked
        };

        await chrome.storage.sync.set(newSettings);
        showStatus('Settings saved!', 'success');

        // Refresh all GitHub tabs
        const tabs = await chrome.tabs.query({ url: 'https://github.com/*/*' });
        tabs.forEach(tab => {
            chrome.tabs.reload(tab.id);
        });
    });

    // Refresh current page
    document.getElementById('refreshPage').addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url.includes('github.com')) {
            chrome.tabs.reload(tab.id);
            showStatus('Page refreshed!', 'info');
        }
    });
});

function showStatus(message, type) {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
    statusEl.style.display = 'block';

    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 3000);
}