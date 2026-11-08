# AmuletRealm Journal Enhancements

Current release: v0.3.0
Compatibility: Foundry VTT 14, D&D 5e
Tested on: Foundry VTT 14 Build 369

Status: Successfully tested in Foundry.

Verified features:
- Save Current View toolbar button
- Named camera positions and zoom levels
- Copy Journal Link dialog
- Scene navigation from standard D&D 5e journals
- Synchronised camera movement on GM and player screens

## Features

- GM-only scene links in standard D&D 5e journals open the associated scene.
- Save and recall named camera positions and zoom scales from journal scene links.
- Synchronise GM camera presentations with connected players on the activated scene.
- **New:** Token Controls → **AmuletRealm: Save Current View** button. Enter a name, save, and copy the generated journal link without opening Chrome Developer Tools.

## Installation

Install via Foundry Setup → Add-on Modules → Install Module with this manifest:

`https://github.com/Amulet23/amuletrealm-journal-enhancements/releases/latest/download/module.json`

Enable the module in the D&D 5e world. Keep the old installed module enabled only once (update rather than installing another copy).

## How to use

1. Open the scene and adjust the zoom/pan as desired.
2. Select **Token Controls** on the left. Choose **AmuletRealm: Save Current View** (bookmark icon).
3. Enter a unique view name such as `Baldur's Gate` and save.
4. Click **Copy Link** and paste the resulting `@UUID[Scene.<sceneId>]{<name>}` in the journal text editor (not in a `<pre>` or `<code>` block).
5. Activate the Atlas for players. Clicking the link as GM will synchronise the saved camera view.

Existing saved views in world settings remain intact across updates. Saving again with the same scene and name updates the position.

### Compatibility badge

Foundry uses manifest `compatibility.verified` to determine compatibility badge colours. This module declares version 13 verified because the prior navigation and socket features were tested on the user's V13 world. The new UI control requires its own Foundry V13 verification after installation. A green badge is not an arbitrary colour setting.

## Technical notes

- Module ID: `amuletrealm-journal-enhancements`
- GM helper API: `game.amuletrealmJournal.saveCurrentView(name)`, `.getViews()`, `.showView(name)`, `.removeView(name)`
- Preserves Foundry V13 `getSceneControlButtons` registration and DialogV2 APIs.
- Does not automatically activate scenes for players.
