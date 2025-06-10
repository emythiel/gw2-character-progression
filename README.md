# GW2 Character Progression
A super simple way to track some progress for Guild Wars 2 characters.

Link:  
**https://emythiel.github.io/gw2-character-progression/**

I was too lazy to make a spreadsheet, so I logically spent more time and effort making this.

## Usage

Input your API Key (make sure it has Account, Characters, Builds and Inventories permissions).  
Wait for it to fetch your character details. This may take a little while, depending on how many characters you have and such. Thankfully you don't have to do this step often.

Next, start selecting which characters you want to keep track of in the table. 

- The bag slots show how many bags are equipped, and how many slots you currently have unlocked for that character. The (xx) number below shows the max slots you can unlock.
- Jade Bot shows the currently equipped Jade Bot Core Tier.
- Template Tabs show the amount of build (top) and equipment (bottom) tabs that character has unlocked, out of the max.

Maps completion currently cannot be tracked via the API, and Story completion is a bit iffy (eg. might not track properly if you replay a story step), so you have to mark those off manually.
- Click on relevant cell, and check off whatever you need to, then save.  
  Your changes will be reflected in the progress bars.


### *Everything is stored locally!*
This uses the browsers local storage, so nothing is shared. It does mean that you'll lose all your stored information if you reset your browser or something.  
You can export / import a `.json` file in case you want to.
