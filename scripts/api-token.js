document.addEventListener('DOMContentLoaded', () => {
    const apiTokenSection = document.getElementById('api-token-section');
    const apiTokenInput = document.getElementById('api-token');
    const saveTokenBtn = document.getElementById('save-api-token');
    const messageDiv = document.getElementById('api-message');
    const apiFetchMessage = document.getElementById('api-fetch-message')
    const importBtn = document.getElementById('import-data');

    // Save token button event
    saveTokenBtn.addEventListener('click', handleSaveToken);

    // Save token function
    async function handleSaveToken() {
        const apiModal = document.getElementById('api-modal')
        const apiToken = apiTokenInput.value.trim();

        // Check if a token was entered, show error if not
        if (!apiToken) {
            showMessage('Please enter an API Key');
            return;
        }

        // Attempt to fetch from GW2 API
        try {
            apiModal.classList.add('visible')
            //showMessage('Fetching characters...');
            const characters = await fetchCharacters(apiToken);

            // Show progress message
            //showMessage('Fetching character details...');

            // Fetch additional information for each character
            const characterDetails = await fetchCharacterDetails(apiToken, characters);

            // Preserve existing progression during update
            const existingProgression = {...GW2ProgressTracker.data.progression};

            // Update state
            GW2ProgressTracker.setApiKey(apiToken);
            GW2ProgressTracker.setCharacters(characterDetails);

            // Restore progression data
            GW2ProgressTracker.data.progression = {...existingProgression};
            GW2ProgressTracker.upgradeProgressionData(); // Ensure data matches new structure

            // Initialize progression data for new characters
            const staticData = GW2ProgressTracker.getStaticData();
            const trackedCharacters = GW2ProgressTracker.getTrackedCharacters();

            for (const character of trackedCharacters) {
                // Only initialize if no progression exists
                if (!GW2ProgressTracker.getProgression(character)) {
                    initializeProgression(character, staticData);
                }
            }

            //showMessage('API token and character details saved successfully!');
            console.log(`Saved API Token: ${apiToken}`)

            // Hide token section and show character tracker
            apiModal.classList.remove('visible')
            apiTokenSection.classList.add('hidden');
            document.getElementById('progression-tracker-section').classList.remove('hidden');
        } catch (error) {
            showMessage(`Error: ${error.message}`);
            apiModal.classList.remove('visible')
        }
    }

    // Import data from user .json file
    importBtn.addEventListener('click', handleImportData);

    function handleImportData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);

                    // Basic validation
                    if (!data || typeof data !== 'object' || !('api_key' in data) || !('characters' in data) || !('tracked_characters' in data) || !('progression' in data)) {
                            throw new Error('Invalid data format');
                    }

                    // Save imported data
                    localStorage.setItem('gw2_progression_data', JSON.stringify(data));
                    alert('Data imported successfully! Page will reload.');
                    location.reload();
                } catch (error) {
                    alert(`Import failed: ${error.message}`);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    // Expose handleImportData for
    window.handleImportData = handleImportData;

    // Refresh API data
    async function refreshCharacters() {
        const apiToken = GW2ProgressTracker.getApiKey();

        showApiMessage('');

        if (!apiToken) {
            alert('No API Key found?');
            return;
        }

        try {
            // Fetch current characters
            const characters = await fetchCharacters(apiToken);

            // Fetch character details
            const characterDetails = await fetchCharacterDetails(apiToken, characters);

            // Preserve existing progression data
            const existingProgression = {...GW2ProgressTracker.data.progression};
            const existingCharacters = {...GW2ProgressTracker.getCharacters()};

            // Merge characters - update existing and add new
            const mergedCharacters = {...existingCharacters};
            for (const [name, details] of Object.entries(characterDetails)) {
                // If character exists, update details but keep name and progression
                if (existingCharacters[name]) {
                    mergedCharacters[name] = {
                        ...existingCharacters[name],
                        ...details,
                        name // Ensure name doesn't change
                    };
                } else {
                    // New character
                    mergedCharacters[name] = details;
                }
            }

            // Update state
            GW2ProgressTracker.setCharacters(mergedCharacters);
            GW2ProgressTracker.data.progresion = existingProgression;
            GW2ProgressTracker.upgradeProgressionData();

            alert('Characters refreshed successfully!');
            return true;
        } catch (error) {
            console.error('Refresh failed:', error);
            alert(`Refresh failed: ${error.message}`);
            return false;
        }
    }
    // Expose for progression tracker
    window.refreshCharacters = refreshCharacters;

    // Info message function
    function showMessage(msg) {
        messageDiv.textContent = msg;
    }

    // Fetch message function
    function showApiMessage(msg) {
        apiFetchMessage.textContent = msg;
    }

    // Fetch characters from GW2 API
    async function fetchCharacters(token) {
        const response = await fetch(`https://api.guildwars2.com/v2/characters?access_token=${token}`);

        showApiMessage('Fetching characters...')

        if (!response.ok) {
            throw new Error('Failed to fetch characters. Check your API Key or Scope permissions.');
        }

        return await response.json();
    }

    // Fetch detailed character information using character names
    async function fetchCharacterDetails(token, characters) {
        const details = {};

        for (const name of characters) {
            try {
                showApiMessage(`Fetching character details for ${name}`);

                // Fetch character details from gw2 api
                const charResponse = await fetch(`https://api.guildwars2.com/v2/characters/${encodeURIComponent(name)}?access_token=${token}`);
                if (!charResponse.ok) continue;
                const charData = await charResponse.json();

                showApiMessage(`Fetching character equipment tabs for ${name}`);

                // Fetch equipment tabs from gw2 api
                const equipmentResponse = await fetch (`https://api.guildwars2.com/v2/characters/${encodeURIComponent(name)}/equipmenttabs?access_token=${token}`);
                const equipmentTabs = equipmentResponse.ok ? await equipmentResponse.json() : [];

                showApiMessage(`Fetching character build tabs for ${name}`);

                // Fetch build tabs from gw2 api
                const buildResponse = await fetch (`https://api.guildwars2.com/v2/characters/${encodeURIComponent(name)}/buildtabs?access_token=${token}`);
                const buildTabs = buildResponse.ok ? await buildResponse.json() : [];

                showApiMessage(`Finishing character details for ${name}`);

                // Get Jade Bot Power Core id, set as null if no power core equipped
                let powerCoreId = null;
                if (charData.equipment) {
                    const powerCoreItem = charData.equipment.find(item =>
                        item.slot === "PowerCore"
                    );
                    if (powerCoreItem) {
                        powerCoreId = powerCoreItem.id;
                    }
                }

                // Get needed information
                details[name] = {
                    name, // Character name
                    profession: charData.profession, // Character profession
                    bags: charData.bags ? charData.bags.map(bag => bag ? { size: bag.size } : null) : [], // Bags and their size, as well as total bag slots unlocked
                    equipmentTabCount : equipmentTabs.length, // Equipment tabs unlocked
                    buildTabCount: buildTabs.length, // Build tabs unlocked
                    powerCore: powerCoreId // Jade Bot Power Core ID
                };

                showApiMessage('');
            } catch (error) {
                console.error(`Failed to fetch details for ${name}:`, error);
            }
        }

        return details;
    }

    // Initialize progression
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
