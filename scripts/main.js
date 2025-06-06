// Main Application Controller
document.addEventListener('DOMContentLoaded', () => {
    // Check if we should show the character tracker immediately
    if (GW2ProgressTracker.getApiKey()) {
        const characterTrackerSection = document.getElementById('character-tracker-section');
        characterTrackerSection.classList.remove('hidden');

        // If no tracked characters, open modal immediately
        if (GW2ProgressTracker.getTrackedCharacters().length === 0) {
            const event = new CustomEvent('openCharacterModal');
            document.dispatchEvent(event);
        }
    }
});
