# AmuletRealm Journal Enhancements

**Current release:** v0.3.3b
**Next planned release:** v0.3.4
**Verified environment:** Foundry VTT v14 Build 370, D&D 5e
**Status:** Scene navigation and camera synchronisation tested successfully in Heroes of the Borderlands. Macallan whisky functionality requires further testing before release.

## Features

- **Universal journal compatibility:** Supports standard D&D 5e
  journals and custom journal sheets, including Heroes of the
  Borderlands, through JournalEntry document detection.
- **Foundry link compatibility:** Ordinary Scene UUID links retain
  their normal Foundry behaviour.
- **Backwards compatibility:** Existing saved camera views and
  legacy camera bookmark links remain supported.
- **Macallan Reserve:** Adds Pour a Dram and Offer a Dram activities,
  dram tracking, Constitution saving throws, Tipsy and Drunk effects,
  and short/long rest recovery.

## Installation or update

In Foundry Setup → Add-on Modules, install or update with:

`https://github.com/Amulet23/amuletrealm-journal-enhancements/releases/latest/download/module.json`

New releases are published through GitHub Releases. The existing
GitHub Actions workflow generates the module.json and module.zip
release assets.

The next planned feature release is v0.3.4.

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

Ordinary Scene UUID links are handled by Foundry normally.
AmuletRealm only intercepts links with recognised action prefixes,
or legacy camera links matching an existing saved camera bookmark.

Existing saved camera positions are retained without migration.

Existing saved positions are retained in the `cameraViews` world setting, without migration or deletion.

## Technical notes

- Module ID: `amuletrealm-journal-enhancements`
- Socket communication enabled; camera messages are accepted only from connected GM users.
- Scene activation uses Foundry V14's `scene.activate({pullUsers: true})`.
- GM API includes `saveCurrentView(name)`, `getViews()`, `showView(name)`, `removeView(name)`, and `makeSceneLink(action, sceneId)`.
- Scene-link actions are determined from an explicit label prefix. This is compatible with Foundry's `@UUID` journal enrichment but remains a convention, not a custom UUID metadata field.
