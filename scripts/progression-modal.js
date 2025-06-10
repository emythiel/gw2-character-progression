/*
    Progression selection modal
*/

document.addEventListener('DOMContentLoaded', () => {
    let currentCharacter = '';
    let currentContentKey = '';

    // Reference to progression trackers render function
    let renderProgressionTable = null;

    // Get render function from tracker if available
    if (window.GW2ProgressionTracker) {
        renderProgressionTable = window.GW2ProgressionTracker.renderProgressionTable;
    }

    // Listen for open editor event from progression tracker
    document.addEventListener('openProgressionEditor', (event) => {
        const { character, contentKey } = event.detail;
        openProgressionEditor(character, contentKey);
    });

    // Open progression editor modal
    function openProgressionEditor(character, contentKey) {
        currentCharacter = character;
        currentContentKey = contentKey;

        const progressionModal = document.getElementById('progression-modal');
        const modalTitle = document.getElementById('progression-modal-title');
        const storyList = document.getElementById('story-list');
        const mapsList = document.getElementById('maps-list');

        // Set modal title
        const staticData = GW2ProgressTracker.getStaticData();
        const contentName = staticData?.progression?.[contentKey]?.name || contentKey;
        modalTitle.textContent = `${character} - ${contentName}`;

        // Clear existing lists
        storyList.replaceChildren();
        mapsList.replaceChildren();

        // Get progression data
        const progression = GW2ProgressTracker.getProgression(character);
        const contentProgression = progression?.[contentKey] || {
            story: [],
            maps: []
        };

        // Populate story chapter list
        const storyChapters = staticData?.progression?.[contentKey]?.story || [];
        storyChapters.forEach((chapter, index) => {
            const li = document.createElement('li');
            const isChecked = contentProgression.story[index] || false;

            const label = document.createElement('label');
            label.className = 'checkbox-item';

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = isChecked;
            input.dataset.type = 'story';
            input.dataset.index = index;

            const span = document.createElement('span');
            span.textContent = chapter;

            label.append(input, span);
            li.appendChild(label);
            storyList.appendChild(li);
        });

        // Populate maps list
        const maps = staticData?.progression?.[contentKey]?.maps || [];
        maps.forEach((map, index) => {
            const li = document.createElement('li');
            const isChecked = contentProgression.maps[index] || false;

            const label = document.createElement('label');
            label.className = 'checkbox-item';

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = isChecked;
            input.dataset.type = 'maps';
            input.dataset.index = index;

            const span = document.createElement('span');
            span.textContent = map;

            label.append(input, span);
            li.appendChild(label);
            mapsList.appendChild(li);
        });

        // Show modal
        progressionModal.classList.add('visible');
    }

    // Setup progression modal
    function setupProgressionModal() {
        const progressionModal = document.getElementById('progression-modal');
        const closeProgression = document.querySelector('.close-progression');
        const saveProgressionBtn = document.getElementById('save-progression');

        // Close modal handlers
        closeProgression.addEventListener('click', () => {
            progressionModal.classList.remove('visible');
        });

        window.addEventListener('click', (event) => {
            if (event.target === progressionModal) {
                progressionModal.classList.remove('visible');
            }
        });

        // Save progression button
        saveProgressionBtn.addEventListener('click', saveProgressionChanges);

        // Add check all button handlers
        document.querySelectorAll('.check-all-btn').forEach(button => {
            button.addEventListener('click', handleCheckAll);
        });
    }

    // Save progression changes
    function saveProgressionChanges() {
        const progressionModal = document.getElementById('progression-modal');
        const storyCheckboxes = document.querySelectorAll('#story-list input[type="checkbox"]');
        const mapsCheckboxes = document.querySelectorAll('#maps-list input[type="checkbox"]');

        // Get current progression data
        const progression = GW2ProgressTracker.getProgression(currentCharacter);
        const contentProgression = progression?.[currentContentKey] || {
            story: [],
            maps: []
        };

        // Update story progression
        contentProgression.story = Array.from(storyCheckboxes).map(checkbox => checkbox.checked);

        // Update map progression
        contentProgression.maps = Array.from(mapsCheckboxes).map(checkbox => checkbox.checked);

        // Save updated progression
        progression[currentContentKey] = contentProgression;
        GW2ProgressTracker.setProgression(currentCharacter, progression);

        // Close the modal
        progressionModal.classList.remove('visible');

        // Update the table to reflect changes
        if (renderProgressionTable) {
            renderProgressionTable();
        }
    }

    // Function to handle toggle (check / uncheck all) button
    function handleCheckAll(e) {
        const type = e.target.dataset.type;
        const listId = `${type}-list`;
        const list = document.getElementById(listId);

        if (!list) return;

        const checkboxes = list.querySelectorAll('input[type="checkbox"]');
        if (checkboxes.length === 0) return;

        // Check if all are currently checked
        const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);

        // Toggle all checkboxes
        checkboxes.forEach(checkbox => {
            checkbox.checked = !allChecked;
        });
    }

    // Initialize the modal
    setupProgressionModal();
})
