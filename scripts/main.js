// Main Application Controller
document.addEventListener('DOMContentLoaded', async () => {
    // Check for static data to load
    await new Promise(resolve => {
        const checkData = () => {
            if (GW2ProgressTracker.staticData) resolve();
            else setTimeout(checkData, 100);
        };
        checkData();
    });

    // Check if we should show the character tracker immediately
    if (GW2ProgressTracker.getApiKey()) {
        const characterTrackerSection = document.getElementById('progression-tracker-section');
        const apiTokenSection = document.getElementById('api-token-section')
        apiTokenSection.classList.add('hidden')
        characterTrackerSection.classList.remove('hidden');

        // If no tracked characters, open modal immediately
        if (GW2ProgressTracker.getTrackedCharacters().length === 0) {
            const event = new CustomEvent('openCharacterModal');
            document.dispatchEvent(event);
        } else {
            renderProgressionTable();
        }
    }

    function renderProgressionTable() {
        console.log('Rendering progression table...');
    }

});


