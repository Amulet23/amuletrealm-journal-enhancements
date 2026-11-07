# AmuletRealm Journal Enhancements

**Current release:** v0.2.1

**Compatibility:** Foundry VTT 13 · D&D 5e

For Foundry VTT V13 and D&D 5e. The GM can use ordinary journal Scene links to open scenes or animate **saved named camera positions** on the GM and all connected player screens.

## Install / update

Install using the release manifest from GitHub after publishing the release:

`https://github.com/Amulet23/amuletrealm-journal-enhancements/releases/latest/download/module.json`

Enable under **Game Settings → Manage Modules** in the world, and refresh all clients after updating. Existing module ID is unchanged.

## Save a camera position

1. As GM, **activate Faerûn Atlas** (so players are viewing it) and position the canvas where you want.
2. Run this in a Foundry **Script Macro** (or browser Console) with your chosen name:

   `await game.amuletrealmJournal.saveCurrentView("Sword Coast")`

3. The console returns an ordinary journal UUID link, for example:

   `@UUID[Scene.BrX6ZY7hyx72ADIC]{Sword Coast}`

4. Insert that link **as regular paragraph text** (not within `<pre>` or `<code>`) in your standard D&D 5e journal page.
5. Repeat for additional places: Entire Faerûn, Baldur's Gate, Dalelands, Borderlands.

## Present

With the Atlas scene activated for players, click a named journal scene link. All clients currently on that scene animate to its saved camera position. Same zoom number may frame differently on displays of different sizes.

If the scene isn't active for players, only the GM view moves and a warning is shown. The module does **not** change scene activation or force-open a different scene. Normal scene links without a saved view still open that scene on the GM canvas.

## Useful commands

- List: `game.amuletrealmJournal.getViews()`
- Show: `await game.amuletrealmJournal.showView("Sword Coast")`
- Delete: `await game.amuletrealmJournal.removeView("Sword Coast")`

**Security & limits:** Only a GM can save or broadcast views; player clients only accept packets attributed to a GM. This is presentation camera control, not a persistent camera lock. A player can move/zoom away afterwards. Client camera scales are clamped by Foundry and can vary with viewport size.

## Maintenance

This module is independent of the Heroes of the Borderlands module. Source is written for V13; verify compatibility before updating to V14. It is not an official Foundry or Wizards of the Coast product.
