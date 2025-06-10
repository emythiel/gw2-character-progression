/*
    Character selection modal
*/
document.addEventListener('DOMContentLoaded', () => {
    const characterModal = document.getElementById('character-modal');
    const closeModal = document.querySelector('.close');
    const trackedModalList = document.getElementById('tracked-characters-modal-list');
    const availableModalList = document.getElementById('available-characters-modal-list');

    // Close modal handlers
    closeModal.addEventListener('click', () => {
        characterModal.classList.remove('visible');
    });

    window.addEventListener('click', (event) => {
        if (event.target === characterModal) {
            characterModal.classList.remove('visible');
        }
    });

    // Listen for open modal event
    document.addEventListener('openCharacterModal', () => {
        openCharacterModal();
    });

    function openCharacterModal() {
        // Clear previous lists
        trackedModalList.replaceChildren();
        availableModalList.replaceChildren();

        const allCharacters = Object.keys(GW2ProgressTracker.getCharacters());
        const trackedCharacters = GW2ProgressTracker.getTrackedCharacters();

        // Create tracked characters list
        if (trackedCharacters.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No characters being tracked';
            trackedModalList.appendChild(li);
        } else {
            trackedCharacters.forEach(character => {
                const li = document.createElement('li');

                const span = document.createElement('span');
                span.textContent = character;
                li.appendChild(span);

                const button = document.createElement('button');
                button.className = 'remove-character-btn';
                button.dataset.character = character;
                button.textContent = 'Untrack';
                li.appendChild(button);

                trackedModalList.appendChild(li);
            });
        }

        // Create available characters list
        const availableCharacters = allCharacters.filter(char =>
            !trackedCharacters.includes(char)
        );

        if (availableCharacters.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'All characters are being tracked';
            availableModalList.appendChild(li);
        } else {
            availableCharacters.forEach(character => {
               const li = document.createElement('li');

               const span = document.createElement('span');
               span.textContent = character;
               li.appendChild(span);

               const button = document.createElement('button');
               button.className = 'add-character-btn';
               button.dataset.character = character;
               button.textContent = 'Track';
               li.appendChild(button);

               availableModalList.appendChild(li);
            });
        }

        // Add event listeners
        document.querySelectorAll('.add-character-btn').forEach(button => {
            button.addEventListener('click', handleAddCharacter);
        });

        document.querySelectorAll('.remove-character-btn').forEach(button => {
            button.addEventListener('click', handleRemoveCharacter);
        });

        // Show modal
        characterModal.classList.add('visible');
    }

    function handleAddCharacter(e) {
        const character = e.target.dataset.character;
        if (GW2ProgressTracker.addTrackedCharacter(character)) {
            // Init progression data
            const staticData = GW2ProgressTracker.getStaticData();
            initializeProgression(character, staticData);

            // Dispatch event to notify about change
            const event = new CustomEvent('trackedCharactersChanged');
            document.dispatchEvent(event);

            // Refresh modal to show updated lists
            openCharacterModal();
        }
    }

    function handleRemoveCharacter(e) {
        const character = e.target.dataset.character;
        if (GW2ProgressTracker.removeTrackedCharacter(character)) {
            // Dispatch event to notify about the change
            const event = new CustomEvent('trackedCharactersChanged');
            document.dispatchEvent(event);

            // Refresh modal to show updated lists
            openCharacterModal();
        }
    }

    function initializeProgression(character, staticData) {
        const progression = {};

        for (const [key, content] of Object.entries(staticData.progression)) {
            progression[key] = {
                story: Array(content.story.length).fill(false),
                maps: Array(content.maps.length).fill(false)
            };
        }

        GW2ProgressTracker.setProgression(character, progression);
    }
});
