// Character Modal Module - Updated for dual lists
document.addEventListener('DOMContentLoaded', () => {
    const characterModal = document.getElementById('character-modal');
    const closeModal = document.querySelector('.close');
    const trackedModalList = document.getElementById('tracked-characters-modal-list');
    const availableModalList = document.getElementById('available-characters-modal-list');

    // Close modal handlers
    closeModal.addEventListener('click', () => {
        characterModal.classList.add('hidden');
    });

    window.addEventListener('click', (event) => {
        if (event.target === characterModal) {
            characterModal.classList.add('hidden');
        }
    });

    // Listen for open modal event
    document.addEventListener('openCharacterModal', () => {
        openCharacterModal();
    });

    function openCharacterModal() {
        // Clear previous lists
        trackedModalList.innerHTML = '';
        availableModalList.innerHTML = '';

        const allCharacters = GW2ProgressTracker.getCharacters();
        const trackedCharacters = GW2ProgressTracker.getTrackedCharacters();

        // Create tracked characters list
        if (trackedCharacters.length === 0) {
            trackedModalList.innerHTML = '<li>No characters being tracked</li>';
        } else {
            trackedCharacters.forEach(character => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${character}</span>
                    <button class="remove-character-btn" data-character="${character}">Remove</button>
                `;
                trackedModalList.appendChild(li);
            });
        }

        // Create available characters list
        const availableCharacters = allCharacters.filter(char =>
            !trackedCharacters.includes(char)
        );

        if (availableCharacters.length === 0) {
            availableModalList.innerHTML = '<li>All characters are being tracked</li>';
        } else {
            availableCharacters.forEach(character => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${character}</span>
                    <button class="add-character-btn" data-character="${character}">Add</button>
                `;
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
        characterModal.classList.remove('hidden');
    }

    function handleAddCharacter(e) {
        const character = e.target.dataset.character;
        if (GW2ProgressTracker.addTrackedCharacter(character)) {
            // Dispatch event to notify about the change
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
});
