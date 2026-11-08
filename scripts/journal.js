/** AmuletRealm Journal Enhancements for Foundry VTT v13 / dnd5e. */
const MODULE_ID = "amuletrealm-journal-enhancements";
const SOCKET_NAME = `module.${MODULE_ID}`;
const SELECTOR = 'a[data-type="Scene"]';
const attachedRoots = new WeakSet();

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "cameraViews", {
    name: "Saved Atlas camera views",
    hint: "Named scene camera positions for GM-directed presentations.",
    scope: "world", config: false, type: Object, default: {}
  });
});

function sceneForLink(link) {
  const uuid = link.dataset.uuid;
  const id = link.dataset.id || (uuid?.startsWith("Scene.") ? uuid.slice(6) : null);
  return id ? game.scenes.get(id) : null;
}

function allViews() { return game.settings.get(MODULE_ID, "cameraViews") || {}; }
function keyFor(sceneId, name) { return `${sceneId}::${name.trim().toLocaleLowerCase()}`; }
function viewFor(sceneId, name) { return allViews()[keyFor(sceneId, name)]; }
function isValidView(view) {
  return view && Number.isFinite(view.x) && Number.isFinite(view.y) &&
    Number.isFinite(view.scale) && view.scale > 0;
}
function currentPosition() {
  if (!canvas?.ready || !canvas.scene) return null;
  return { x: canvas.stage.pivot.x, y: canvas.stage.pivot.y, scale: canvas.stage.scale.x };
}
async function showPosition(view) {
  if (!isValidView(view)) return;
  if (!canvas?.ready || canvas.scene?.id !== view.sceneId) return;
  await canvas.animatePan({ x: view.x, y: view.y, scale: view.scale, duration: 1300 });
}

Hooks.once("ready", () => {
  game.socket.on(SOCKET_NAME, async (payload) => {
    if (game.user.isGM || payload?.action !== "camera") return;
    const sender = game.users.get(payload.senderId);
    if (!sender?.isGM || !isValidView(payload)) return;
    if (canvas.scene?.id !== payload.sceneId) return;
    await showPosition(payload);
  });

  // GM convenience API. Also works when called from a Foundry Script Macro.
  game.amuletrealmJournal = {
    async saveCurrentView(name) {
      if (!game.user.isGM) throw new Error("GM only.");
      if (typeof name !== "string" || !name.trim()) throw new Error("Give the view a name.");
      if (!canvas?.ready || !canvas.scene) throw new Error("Open the target scene first.");
      const position = currentPosition();
      const sceneId = canvas.scene.id;
      const views = foundry.utils.deepClone(allViews());
      views[keyFor(sceneId, name)] = { sceneId, name: name.trim(), ...position };
      await game.settings.set(MODULE_ID, "cameraViews", views);
      const link = `@UUID[Scene.${sceneId}]{${name.trim()}}`;
      console.log(`${MODULE_ID} | Saved: ${link}`);
      ui.notifications.info(`Saved camera view “${name.trim()}”.`);
      return link;
    },
    getViews() { return foundry.utils.deepClone(allViews()); },
    async showView(name) {
      if (!game.user.isGM) throw new Error("GM only.");
      if (!canvas?.ready || !canvas.scene) throw new Error("Open the scene first.");
      const view = viewFor(canvas.scene.id, name);
      if (!view) throw new Error(`No saved view named: ${name}`);
      await presentView(view);
    },
    async removeView(name) {
      if (!game.user.isGM || !canvas?.scene) throw new Error("GM with scene required.");
      const views = foundry.utils.deepClone(allViews());
      delete views[keyFor(canvas.scene.id, name)];
      await game.settings.set(MODULE_ID, "cameraViews", views);
    }
  };
});

async function presentView(view) {
  if (!game.user.isGM || !isValidView(view)) return;
  if (!canvas?.ready || canvas.scene?.id !== view.sceneId) {
    ui.notifications.warn("View the relevant scene first. Activate it for players before presenting.");
    return;
  }
  const active = game.scenes.active?.id === view.sceneId;
  await showPosition(view);
  if (!active) {
    ui.notifications.warn("Only your camera moved. Activate this scene to share views with players.");
    return;
  }
  game.socket.emit(SOCKET_NAME, { action: "camera", senderId: game.user.id, ...view });
}

Hooks.on("renderApplicationV2", (app, element) => {
  if (!game.user?.isGM || game.system?.id !== "dnd5e") return;
  if (app.constructor?.name !== "JournalEntrySheet5e") return;
  if (!(element instanceof HTMLElement)) return;

  for (const link of element.querySelectorAll(SELECTOR)) {
    const scene = sceneForLink(link);
    if (!scene) continue;
    const view = viewFor(scene.id, link.textContent || "");
    link.dataset.tooltip = view ? `Show ${view.name} to players` : "Click to view scene";
  }
  if (attachedRoots.has(element)) return;
  attachedRoots.add(element);
  element.addEventListener("click", event => {
    if (event.defaultPrevented || event.button !== 0 || event.altKey ||
        event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest(SELECTOR);
    if (!link || !element.contains(link)) return;
    const scene = sceneForLink(link);
    if (!scene) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const view = viewFor(scene.id, link.textContent || "");
    if (view) {
      presentView(view).catch(error => console.error(`${MODULE_ID} | Camera view failed`, error));
    } else {
      Promise.resolve(scene.view()).catch(error => console.error(`${MODULE_ID} | Scene view failed`, error));
    }
  }, { capture: true });
});


// GM-only scene-control button. Avoids opening Developer Tools, which resizes the canvas.
Hooks.on("getSceneControlButtons", (controls) => {
  if (!game.user?.isGM || !controls.tokens?.tools) return;
  controls.tokens.tools.amuletrealmSaveView = {
    name: "amuletrealmSaveView",
    title: "AmuletRealm: Save Current View",
    icon: "fa-solid fa-bookmark",
    order: Object.keys(controls.tokens.tools).length,
    button: true,
    visible: true,
    onChange: () => {
      promptAndSaveView().catch(error => {
        console.error(`${MODULE_ID} | Save dialog failed`, error);
        ui.notifications.error("Unable to save Atlas view. See the Console for details.");
      });
    }
  };
});

// Escape the link for presentation in HTML; the stored link stays unchanged.
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

async function promptAndSaveView() {
  if (!game.user?.isGM) return;
  if (!canvas?.ready || !canvas.scene) {
    ui.notifications.warn("Open and position a scene before saving its camera view.");
    return;
  }
  const DialogV2 = foundry.applications.api.DialogV2;
  const name = await DialogV2.prompt({
    window: { title: "AmuletRealm — Save Current View" },
    content: `<p>Save the current centre and zoom for <strong>${escapeHtml(canvas.scene.name)}</strong>.</p>
      <div class="form-group"><label for="amuletrealm-view-name">View name</label>
      <input id="amuletrealm-view-name" type="text" name="viewName"
        placeholder="e.g. Baldur's Gate" maxlength="100" required autofocus></div>`,
    ok: {
      label: "Save View",
      callback: (_event, button) => button.form.elements.viewName.value.trim()
    },
    rejectClose: false
  });
  if (!name) return;
  // Existing API persists to world settings. It preserves the link-label matching contract.
  const link = await game.amuletrealmJournal.saveCurrentView(name);
  await DialogV2.wait({
    window: { title: "AmuletRealm — Journal Link" },
    content: `<p>The view <strong>${escapeHtml(name)}</strong> has been saved.</p>
      <p>Copy this link into your Journal Entry:</p>
      <input type="text" name="journalLink" value="${escapeHtml(link)}" readonly
        style="width:100%;" aria-label="Journal link">`,
    buttons: [{
      action: "copy", label: "Copy Link", icon: "fa-solid fa-copy", default: true,
      callback: async (_event, button) => {
        const value = button.form.elements.journalLink.value;
        try {
          await navigator.clipboard.writeText(value);
          ui.notifications.info("Journal link copied to clipboard.");
        } catch (error) {
          console.warn(`${MODULE_ID} | Clipboard unavailable`, error);
          ui.notifications.warn("Clipboard access denied. Select and copy the link from the dialog, or from the Console.");
          throw error; // Keep the dialog open when a copy fails.
        }
      }
    }, { action: "close", label: "Close" }],
    rejectClose: false
  });
}
