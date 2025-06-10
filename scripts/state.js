const GW2ProgressTracker = {
    data: null,
    staticData: GW2StaticData,

    init() {
        this.loadData();
    },

    loadData() {
        const saved = localStorage.getItem('gw2_progression_data');
        this.data = saved ? JSON.parse(saved) : {
            api_key: null,
            characters: {},
            tracked_characters: [],
            progression: {}
        };

        // Upgrade progression data to match current static data
        this.upgradeProgressionData();

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

    getCharacterDetails(name) {
        return this.data.characters[name];
    },

    getStaticData() {
        return this.staticData;
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
    },

    getProgression(character) {
        return this.data.progression[character] || {};
    },

    setProgression(character, progression) {
        this.data.progression[character] = progression;
        this.saveData();
    },

    upgradeProgressionData() {
        const staticData = this.staticData;
        if (!staticData || !staticData.progression) return;

        // For each character with progression data
        Object.keys(this.data.progression).forEach(character => {
            const charProgression = this.data.progression[character];

            // For each content key in static data
            Object.keys(staticData.progression).forEach(contentKey => {
                const contentData = staticData.progression[contentKey];

                // Initialize if missing
                if (!charProgression[contentKey]) {
                    charProgression[contentKey] = {
                        story: Array(contentData.story.length).fill(false),
                        maps: Array(contentData.maps.length).fill(false)
                    };
                } else {
                    // Extend story array if needed
                    const currentStory = charProgression[contentKey].story;
                    if (currentStory.length < contentData.story.length) {
                        const newLength = contentData.story.length - currentStory.length;
                        charProgression[contentKey].story = [
                            ...currentStory,
                            ...Array(newLength).fill(false)
                        ];
                    }

                    // Exend maps array if needed
                    const currentMaps = charProgression[contentKey].maps;
                    if (currentMaps.length < contentData.maps.length) {
                        const newLength = contentData.maps.length - currentMaps.length;
                        charProgression[contentKey].maps = [
                            ...currentMaps,
                            ...Array(newLength).fill(false)
                        ];
                    }
                }
            });
        });

        this.saveData();
    }
};

// Initialize state on load
document.addEventListener('DOMContentLoaded', () => {
    GW2ProgressTracker.init();
});
