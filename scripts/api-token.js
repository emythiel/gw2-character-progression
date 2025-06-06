document.addEventListener('DOMContentLoaded', () => {
    const apiTokenSection = document.getElementById('api-token-section');
    const apiTokenInput = document.getElementById('api-token');
    const saveTokenBtn = document.getElementById('save-api-token');
    const messageDiv = document.getElementById('api-message');

    // Show API token esection if no token exists
    if (!GW2ProgressTracker.getApiKey()) {
        apiTokenSection.classList.remove('hidden');
    }

    // Save token button event
    saveTokenBtn.addEventListener('click', handleSaveToken);

    // Save token function
    async function handleSaveToken() {
        const apiToken = apiTokenInput.value.trim();

        // Check if a token was entered
        if (!apiToken) {
            showMessage('Please enter an API Key');
            return;
        }

        try {
            showMessage('Fetching characters...');
            const characters = await fetchCharacters(apiToken);

            // Update state
            GW2ProgressTracker.setApiKey(apiToken);
            GW2ProgressTracker.setCharacters(characters);

            showMessage('API token saved successfully!');
            console.log(`Saved API Token: ${apiToken}`)

            // Hide toekn section and show character tracker
            apiTokenSection.classList.add('hidden');
            document.getElementById('character-tracker-section').classList.remove('hidden');
        } catch (error) {
            showMessage(`Error: ${error.message}`);
        }
    }

    // Info message function
    function showMessage(msg) {
        messageDiv.textContent = msg;

        // Clear message after 3 seconds
        if (msg) {
            setTimeout(() => {
                messageDiv.textContent = '';
            }, 3000);
        }
    }

    // Fetch characters from API
    async function fetchCharacters(token) {
        const response = await fetch(`https://api.guildwars2.com/v2/characters?access_token=${token}`);

        if (!response.ok) {
            throw new Error('Failed to fetch characters. Check your API Key or Scope permissions.');
        }

        return await response.json();
    }
});
