// Character Tracker Module
document.addEventListener('DOMContentLoaded', () => {
    const characterTrackerSection = document.getElementById('character-tracker-section');
    const trackedCharactersList = document.getElementById('tracked-characters-list');
    const characterBtn = document.getElementById('modify-character-tracking');

    // Show character tracker if API key exists
    if (GW2ProgressTracker.getApiKey()) {
        characterTrackerSection.classList.remove('hidden');
        renderTrackedCharacters();
    }

    characterBtn.addEventListener('click', () => {
        // This will be handled by the character-modal module
        const event = new CustomEvent('openCharacterModal');
        document.dispatchEvent(event);
    });

    function renderTrackedCharacters() {
        trackedCharactersList.innerHTML = '';
        const trackedCharacters = GW2ProgressTracker.getTrackedCharacters();

        if (trackedCharacters.length === 0) {
            trackedCharactersList.innerHTML = '<li>No characters being tracked</li>';
            return;
        }

        trackedCharacters.forEach(character => {
            const li = document.createElement('li');
            li.textContent = character;
            trackedCharactersList.appendChild(li);
        });
    }

    // Listen for changes to tracked characters
    document.addEventListener('trackedCharactersChanged', renderTrackedCharacters);
});
