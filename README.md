# AmuletRealm Journal Enhancements

**Current release:** v0.3.3 (release candidate)  
**Verified environment:** Foundry VTT v14 Build 370, D&D 5e  
**Status:** JavaScript syntax checked; new v0.3.2 link actions require in-world testing.

## Features

- **Save Current View** bookmark button in Token Controls saves map centre and zoom, then offers a Copy Link button.
- **Create Scene Link** chain-link button in Token Controls offers two distinct actions: **Activate Scene** (GM and players) or **View Scene** (GM only), then Copy Link.
- GM-controlled camera bookmarks synchronise pan and zoom with connected players when the scene is active.
- Standard D&D 5e Journal Entry Sheet supported; Heroes of the Borderlands sheet not required.
- Existing v0.3.x saved views and original journal links remain supported.

## Installation or update

In Foundry Setup → Add-on Modules, install or update with:

`https://github.com/Amulet23/amuletrealm-journal-enhancements/releases/latest/download/module.json`

Enable in your D&D 5e world. To publish a release, commit these files to `main` and create a `v0.3.2` GitHub release/tag. The existing release workflow creates `module.json` and `module.zip` assets.

## Journal links: three separate actions

For the existing Faerûn Atlas Scene (`BrX6ZY7hyx72ADIC`):

**Activate for all players:**

`@UUID[Scene.BrX6ZY7hyx72ADIC]{Activate Scene: Faerûn Atlas}`

**View on the GM canvas only:**

`@UUID[Scene.BrX6ZY7hyx72ADIC]{View Scene: Faerûn Atlas}`

**Show a previously saved camera bookmark (the name must match):**

`@UUID[Scene.BrX6ZY7hyx72ADIC]{Camera View: Baldur's Gate}`

The action prefixes are deliberately visible in the link text and unambiguous to the module. You can also use the two toolbar buttons to generate links automatically.

### Recommended presentation order

1. Activate the Atlas scene for the GM and players using **Activate Scene**.
2. Click **Camera View: Entire Faerûn** to show the whole continent.
3. Continue to **Camera View: Sword Coast**, **Camera View: Baldur's Gate**, etc.

**Important:** A camera bookmark does not activate the scene for other players. Activate it first. The module does not automatically change the active scene when a camera view is selected.

### Backwards compatibility

Old links such as `@UUID[Scene.BrX6ZY7hyx72ADIC]{Baldur's Gate}` still resolve to their saved camera positions. Old unlabeled scene links continue to **View Scene** unless their displayed label matches an existing saved bookmark. To eliminate name collisions, replace these with explicit **Activate Scene:** or **View Scene:** links using the toolbar.

Existing saved positions are retained in the `cameraViews` world setting, without migration or deletion.

## Technical notes

- Module ID: `amuletrealm-journal-enhancements`
- Socket communication enabled; camera messages are accepted only from connected GM users.
- Scene activation uses Foundry V14's `scene.activate({pullUsers: true})`.
- GM API includes `saveCurrentView(name)`, `getViews()`, `showView(name)`, `removeView(name)`, and `makeSceneLink(action, sceneId)`.
- Scene-link actions are determined from an explicit label prefix. This is compatible with Foundry's `@UUID` journal enrichment but remains a convention, not a custom UUID metadata field.
