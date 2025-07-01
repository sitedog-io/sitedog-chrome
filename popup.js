// SiteDog GitHub Integration Popup Script

console.log('SiteDog Popup loaded');

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing popup');

    try {
        // Load current settings
        const settings = await chrome.storage.sync.get(['enabled', 'showInPrivateRepos', 'autoCheck']);
        console.log('Loaded settings:', settings);

        // Set checkbox states
        const enabledCheckbox = document.getElementById('enabled');
        const privateReposCheckbox = document.getElementById('showInPrivateRepos');
        const autoCheckCheckbox = document.getElementById('autoCheck');

        if (enabledCheckbox) enabledCheckbox.checked = settings.enabled !== false;
        if (privateReposCheckbox) privateReposCheckbox.checked = settings.showInPrivateRepos === true;
        if (autoCheckCheckbox) autoCheckCheckbox.checked = settings.autoCheck !== false;

        // Save settings
        const saveButton = document.getElementById('saveSettings');
        if (saveButton) {
            saveButton.addEventListener('click', async () => {
                console.log('Saving settings...');

                try {
                    const newSettings = {
                        enabled: enabledCheckbox ? enabledCheckbox.checked : true,
                        showInPrivateRepos: privateReposCheckbox ? privateReposCheckbox.checked : false,
                        autoCheck: autoCheckCheckbox ? autoCheckCheckbox.checked : true
                    };

                    await chrome.storage.sync.set(newSettings);
                    console.log('Settings saved:', newSettings);
                    showStatus('Settings saved! Refresh GitHub pages to apply changes.', 'success');
                } catch (error) {
                    console.error('Error saving settings:', error);
                    showStatus('Error saving settings', 'error');
                }
            });
        }
    } catch (error) {
        console.error('Error initializing popup:', error);
        showStatus('Error loading settings', 'error');
    }
});

function showStatus(message, type) {
    console.log('Showing status:', message, type);

    const statusEl = document.getElementById('status');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = `status ${type}`;
        statusEl.style.display = 'block';

        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 4000);
    }
}