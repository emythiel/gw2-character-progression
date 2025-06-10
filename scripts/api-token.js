document.addEventListener('DOMContentLoaded', () => {
    const apiTokenSection = document.getElementById('api-token-section');
    const apiTokenInput = document.getElementById('api-token');
    const saveTokenBtn = document.getElementById('save-api-token');
    const messageDiv = document.getElementById('api-message');

    // Save token button event
    saveTokenBtn.addEventListener('click', handleSaveToken);

    // Save token function
    async function handleSaveToken() {
        const apiToken = apiTokenInput.value.trim();

        // Check if a token was entered, show error if not
        if (!apiToken) {
            showMessage('Please enter an API Key');
            return;
        }

        // Attempt to fetch from GW2 API
        try {
            showMessage('Fetching characters...');
            const characters = await fetchCharacters(apiToken);

            // Show progress message
            showMessage('Fetching character details...');

            // Fetch additional information for each character
            const characterDetails = await fetchCharacterDetails(apiToken, characters);

            // Update state
            GW2ProgressTracker.setApiKey(apiToken);
            GW2ProgressTracker.setCharacters(characterDetails);

            // Initialize progression data for new characters
            const staticData = GW2ProgressTracker.getStaticData();
            const trackedCharacters = GW2ProgressTracker.getTrackedCharacters();

            for (const character of trackedCharacters) {
                if (!GW2ProgressTracker.getProgression(character)) {
                    initializeProgression(character, staticData);
                }
            }

            showMessage('API token and character details saved successfully!');
            console.log(`Saved API Token: ${apiToken}`)

            // Hide token section and show character tracker
            apiTokenSection.classList.add('hidden');
            document.getElementById('progression-tracker-section').classList.remove('hidden');
        } catch (error) {
            showMessage(`Error: ${error.message}`);
        }
    }

    // Info message function
    function showMessage(msg) {
        messageDiv.textContent = msg;
    }

    // Fetch characters from GW2 API
    async function fetchCharacters(token) {
        const response = await fetch(`https://api.guildwars2.com/v2/characters?access_token=${token}`);

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
                // Fetch character details from gw2 api
                const charResponse = await fetch(`https://api.guildwars2.com/v2/characters/${encodeURIComponent(name)}?access_token=${token}`);
                if (!charResponse.ok) continue;
                const charData = await charResponse.json();

                // Fetch equipment tabs from gw2 api
                const equipmentResponse = await fetch (`https://api.guildwars2.com/v2/characters/${encodeURIComponent(name)}/equipmenttabs?access_token=${token}`);
                const equipmentTabs = equipmentResponse.ok ? await equipmentResponse.json() : [];

                // Fetch build tabs from gw2 api
                const buildResponse = await fetch (`https://api.guildwars2.com/v2/characters/${encodeURIComponent(name)}/buildtabs?access_token=${token}`);
                const buildTabs = buildResponse.ok ? await buildResponse.json() : [];

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
