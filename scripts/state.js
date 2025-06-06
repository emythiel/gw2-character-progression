const GW2ProgressTracker = {
    data: null,

    init() {
        this.loadData();
    },

    loadData() {
        const saved = localStorage.getItem('gw2_progression_data');
        this.data = saved ? JSON.parse(saved) : {
            api_key: null,
            characters: [],
            tracked_characters: []
        };
        return this.data;
    },

    saveData() {
        localStorage.setItem('gw2_progression_data', JSON.stringify(this.data));
    },

    getApiKey() {
        return this.data.api_key;
    },

    setApiKey(apiKey) {
        this.data.api_key = apiKey;
        this.saveData();
    },

    getCharacters() {
        return this.data.characters;
    },

    setCharacters(characters) {
        this.data.characters = characters;
        this.saveData();
    },

    getTrackedCharacters() {
        return this.data.tracked_characters;
    },

    addTrackedCharacter(character) {
        if (!this.data.tracked_characters.includes(character)) {
            this.data.tracked_characters.push(character);
            this.saveData();
            return true;
        }
        return false;
    },

    removeTrackedCharacter(character) {
        const index = this.data.tracked_characters.indexOf(character);
        if (index !== -1) {
            this.data.tracked_characters.splice(index, 1);
            this.saveData();
            return true;
        }
        return false;
    }
};

// Initialize state on load
document.addEventListener('DOMContentLoaded', () => {
    GW2ProgressTracker.init();
});
