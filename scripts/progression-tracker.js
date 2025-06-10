/*
    Progression Tracker section
*/

document.addEventListener('DOMContentLoaded', () => {
    const progressionTrackerSection = document.getElementById('progression-tracker-section');
    const characterBtn = document.getElementById('modify-character-tracking');
    const refreshBtn = document.getElementById('refresh-characters');
    const professionIcons = {
        Guardian: "https://wiki.guildwars2.com/images/c/cc/Guardian_icon.png",
        Revenant: "https://wiki.guildwars2.com/images/8/89/Revenant_icon.png",
        Warrior: "https://wiki.guildwars2.com/images/c/c8/Warrior_icon.png",
        Engineer: "https://wiki.guildwars2.com/images/4/41/Engineer_icon.png",
        Ranger: "https://wiki.guildwars2.com/images/9/9c/Ranger_icon.png",
        Thief: "https://wiki.guildwars2.com/images/d/d8/Thief_icon.png",
        Elementalist: "https://wiki.guildwars2.com/images/a/a2/Elementalist_icon.png",
        Mesmer: "https://wiki.guildwars2.com/images/3/3a/Mesmer_icon.png",
        Necromancer: "https://wiki.guildwars2.com/images/6/62/Necromancer_icon.png"
    };
    const bagIcon = "https://wiki.guildwars2.com/images/0/06/Universal_Multitool_Pack.png"
    const jadeBotTiers = {
        97339: ["1", "https://wiki.guildwars2.com/images/8/87/Jade_Bot_Core-_Tier_1.png"],
        97041: ["2", "https://wiki.guildwars2.com/images/c/c6/Jade_Bot_Core-_Tier_2.png"],
        97284: ["3", "https://wiki.guildwars2.com/images/a/ad/Jade_Bot_Core-_Tier_3.png"],
        96628: ["4", "https://wiki.guildwars2.com/images/d/db/Jade_Bot_Core-_Tier_4.png"],
        95864: ["5", "https://wiki.guildwars2.com/images/3/30/Jade_Bot_Core-_Tier_5.png"],
        96467: ["6", "https://wiki.guildwars2.com/images/7/72/Jade_Bot_Core-_Tier_6.png"],
        97020: ["7", "https://wiki.guildwars2.com/images/1/14/Jade_Bot_Core-_Tier_7.png"],
        96299: ["8", "https://wiki.guildwars2.com/images/2/2a/Jade_Bot_Core-_Tier_8.png"],
        96070: ["9", "https://wiki.guildwars2.com/images/3/3a/Jade_Bot_Core-_Tier_9.png"],
        96613: ["10", "https://wiki.guildwars2.com/images/0/0e/Jade_Bot_Core-_Tier_10.png"],
        null: ["", "https://wiki.guildwars2.com/images/9/99/Power_Core_slot.png"]
    };
    const templateIcons = {
        buildTemplate: "https://wiki.guildwars2.com/images/6/65/Hero_panel_skills_and_traits_icon.png",
        equipmentTemplate: "https://wiki.guildwars2.com/images/f/f9/Hero_panel_equipment_icon.png"
    }

    // Show progression tracker if API key exists
    if (GW2ProgressTracker.getApiKey()) {
        progressionTrackerSection.classList.remove('hidden');
        renderProgressionTable();
    }

    // Expose functions to global scope for modal access
    window.GW2ProgressionTracker = window.GW2ProgressionTracker || {};
    window.GW2ProgressionTracker.renderProgressionTable = renderProgressionTable;
    window.GW2ProgressionTracker.openProgressionEditor = openProgressionEditor;

    // Open character selection modal
    characterBtn.addEventListener('click', () => {
        const event = new CustomEvent('openCharacterModal');
        document.dispatchEvent(event);
    });

    // Open progression editor modal
    function openProgressionEditor(character, contentKey) {
        const event = new CustomEvent('openProgressionEditor', {
            detail: { character, contentKey }
        });
        document.dispatchEvent(event);
    }

    // Refresh button
    refreshBtn.addEventListener('click', async () => {
        const apiModal = document.getElementById('api-modal')
        apiModal.classList.add('visible')
        const success = await window.refreshCharacters();
        if (success) {
            renderProgressionTable();
        }
        apiModal.classList.remove('visible')
    });

    // Render the progression table
    function renderProgressionTable() {
        const tbody = document.querySelector('#progression-table tbody');
        const staticData = GW2ProgressTracker.getStaticData();
        const trackedCharacters = GW2ProgressTracker.getTrackedCharacters();

        // Clear existing rows (except header)
        tbody.replaceChildren();

        // Add rows for each character
        trackedCharacters.forEach(character => {
            const charDetails = GW2ProgressTracker.getCharacterDetails(character);
            const progression = GW2ProgressTracker.getProgression(character);
            const row = document.createElement('tr');

            // Create cells using dedicated functions
            row.appendChild(createCharacterCell(character, charDetails));
            row.appendChild(createBagsCell(charDetails, staticData));
            row.appendChild(createJadeBotCell(charDetails));
            row.appendChild(createTemplateTabsCell(charDetails, staticData));
            createContentCells(row, character, progression, staticData);

            tbody.appendChild(row);
        });
    }

    // Character cell function
    function createCharacterCell(character, charDetails) {
        const cell = document.createElement('td');
        cell.classList.add('character-cell');

        const display = document.createElement('div');
        display.classList.add('character-display');


        // Add profession icon
        const profession = charDetails.profession;
        const iconUrl = professionIcons[profession];
        if (iconUrl) {
            const icon = document.createElement('img');
            icon.src = iconUrl;
            icon.alt = profession;
            display.appendChild(icon);
        }

        // Add character name
        const nameSpan = document.createElement('span');
        nameSpan.textContent = character;

        cell.appendChild(display);
        display.appendChild(nameSpan);

        return cell;
    }

    // Bags cell function
    function createBagsCell(charDetails, staticData) {
        const cell = document.createElement('td');
        if (!charDetails) return cell;

        const bags = charDetails.bags;
        const equipped = bags.filter(bag => bag !== null).length;
        const totalSlots = bags.length;
        const maxSlots = staticData.bagSlots;

        const bagDisplay = document.createElement('div');
        bagDisplay.classList.add('bag-display');

        const imageContainer = document.createElement('div');
        imageContainer.classList.add('bag-image-container');

        // Bag icon
        const bagIconElement = createIconElement(bagIcon, `${equipped} bags equipped. ${totalSlots}/${maxSlots} unlocked.`, 'bag-icon');

        // Bag text
        const bagText = document.createElement('span');
        bagText.textContent = `${equipped}/${totalSlots}\n(${maxSlots})`;
        bagText.classList.add('bag-progress-text');

        cell.appendChild(bagDisplay);
        bagDisplay.appendChild(imageContainer);
        imageContainer.append(bagIconElement, bagText)

        return cell;
    }

    // Jade Bot Core Tier cell function
    function createJadeBotCell(charDetails) {
        const cell = document.createElement('td');
        if (!charDetails) return cell;

        const powerCoreId = charDetails.powerCore;
        const jadeBotInfo = jadeBotTiers[powerCoreId] || jadeBotTiers.null;
        const [tierNumber, imageUrl] = jadeBotInfo;

        const jadeDisplay = document.createElement('div');
        jadeDisplay.classList.add('jade-bot-display');

        const imageContainer = document.createElement('div');
        imageContainer.classList.add('jade-bot-image-container');

        // Jade bot icon
        const jadeIcon = createIconElement(imageUrl, `Jade Bot Core: Tier ${tierNumber}`, 'jade-bot-icon');
        imageContainer.appendChild(jadeIcon);

        // Tier number
        if (tierNumber) {
            const tierText = document.createElement('span');
            tierText.textContent = tierNumber;
            tierText.classList.add('jade-tier-number');
            imageContainer.appendChild(tierText);
        }

        jadeDisplay.appendChild(imageContainer);
        cell.appendChild(jadeDisplay);

        return cell;
    }

    // Template tabs cell function
    function createTemplateTabsCell(charDetails, staticData) {
        const cell = document.createElement('td');
        if (!charDetails) return cell;

        const buildCurrent = charDetails.buildTabCount;
        const buildMax = staticData.buildTabs;
        const equipCurrent = charDetails.equipmentTabCount;
        const equipMax = staticData.equipmentTabs;

        const container = document.createElement('div');
        container.classList.add('template-tabs-container');
        cell.appendChild(container);

        // Build templates
        container.appendChild(createTemplateProgressBar(
            templateIcons.buildTemplate,
            'Build Templates',
            buildCurrent,
            buildMax,
            'build-progress'
        ));

        // Equipment Templates
        container.appendChild(createTemplateProgressBar(
            templateIcons.equipmentTemplate,
            'Equipment Template',
            equipCurrent,
            equipMax,
            'equip-progress'
        ));

        return cell;
    }

    // Maps and Story progression cells
    function createContentCells(row, character, progression, staticData) {
        const contentKeys = staticData?.progression ? Object.keys(staticData.progression) : [];

        for (const key of contentKeys) {
            const cell = document.createElement('td');
            cell.classList.add('content-progress-cell')
            const content = staticData.progression[key];

            if (progression?.[key]) {
                const mapsProgress = progression[key].maps;
                const storyProgress = progression[key].story;

                const mapsPercent = calculatePercentage(mapsProgress);
                const storyPercent = calculatePercentage(storyProgress);

                const container = document.createElement('div');
                container.classList.add('content-progress-container');
                cell.appendChild(container);

                // Maps progress bar
                container.appendChild(createContentProgressBar(
                    `Maps: ${mapsPercent}%`,
                    mapsPercent,
                    'maps-progress'
                ));

                // Story progress bar
                container.appendChild(createContentProgressBar(
                    `Story: ${storyPercent}%`,
                    storyPercent,
                    'story-progress'
                ));

                // Add click handler for editing
                cell.addEventListener('click', () => {
                    openProgressionEditor(character, key);
                });
            }

            row.appendChild(cell);
        }
    }

    // HELPER: Create template tab progress bar
    function createTemplateProgressBar(iconSrc, altText, current, max, progressClass) {
        const progressBar = document.createElement('div');
        progressBar.classList.add('progress-bar');

        const content = document.createElement('div');
        content.classList.add('progress-bar-content');
        progressBar.appendChild(content);

        // Icon
        const icon = createIconElement(iconSrc, altText, 'template-icon');

        // Text
        const text = document.createElement('span');
        text.textContent = `${current}/${max}`;

        content.append(icon, text);

        // Progress bar
        const progress = document.createElement('div');
        progress.classList.add('tabs-progress', progressClass);
        progress.style.width = `${(current/max)*100}%`;
        progressBar.appendChild(progress);

        return progressBar;
    }

    // HELPER: Create icon element
    function createIconElement(src, alt, className) {
        const icon = document.createElement('img');
        icon.src = src;
        icon.alt = alt;
        if (className) icon.classList.add(className);
        return icon;
    }

    // HELPER: function to calculate percentage for maps and story progress
    function calculatePercentage(arr) {
        if (!arr || arr.length === 0) return 0;
        const completed = arr.filter(item => item).length;
        return Math.round((completed / arr.length) * 100);
    }

    // HELPER: Create content progress bar
    function createContentProgressBar(label, percent, progressClass) {
        const bar = document.createElement('div');
        bar.classList.add('progress-bar');

        const content = document.createElement('div');
        content.classList.add('progress-bar-content');
        content.textContent = label;

        const progress = document.createElement('div');
        progress.classList.add(progressClass);
        progress.style.width = `${percent}%`;

        bar.append(content, progress);

        return bar;
    }

    // Listen for changes to tracked characters
    document.addEventListener('trackedCharactersChanged', renderProgressionTable);
});
