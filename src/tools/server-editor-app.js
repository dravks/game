(function bootstrapServerEditor() {
  const appRoot = document.getElementById("editor-app");
  const importInput = document.getElementById("editor-import-input");
  if (!appRoot || !window.GameState) {
    return;
  }

  const deepClone = (value) => JSON.parse(JSON.stringify(value));
  const mergeDeep = (base, override) => window.GameState.mergeDeep(base, override);

  const createRegistryAdapter = (model) => ({
    get(key) {
      if (key === "gameConfig") return model.gameConfig;
      if (key === "selectedDungeonDifficulty") return model.selectedDungeonDifficulty;
      return undefined;
    },
    set(key, value) {
      if (key === "gameConfig") model.gameConfig = value;
      if (key === "selectedDungeonDifficulty") model.selectedDungeonDifficulty = value;
    },
  });

  const defaultModel = () => ({
    selectedDungeonDifficulty: "normal",
    gameConfig: deepClone(window.GameState.DEFAULT_GAME_CONFIG),
  });

  const buildModelFromSnapshot = (snapshot) => ({
    selectedDungeonDifficulty: snapshot?.selectedDungeonDifficulty || "normal",
    gameConfig: mergeDeep(window.GameState.DEFAULT_GAME_CONFIG, snapshot?.gameConfig || {}),
  });

  const loadModel = () => buildModelFromSnapshot(window.GameState.loadEditorSnapshot?.() || defaultModel());

  let model = loadModel();
  let activeSection = "overview";
  let statusText = "Standalone editor ready. This schema is intended for future exe packaging.";

  const sectionDefs = [
    { key: "overview", title: "Overview", meta: "General tuning and profile controls" },
    { key: "dungeon", title: "Dungeon", meta: "Room budgets, thresholds, boss scaling" },
    { key: "difficulty", title: "Difficulty", meta: "Normal / Hard / Nightmare profiles" },
    { key: "transport", title: "Transport", meta: "Import, export, save sync, raw JSON" },
  ];

  function saveModel() {
    const registry = createRegistryAdapter(model);
    const snapshot = window.GameState.saveEditorSnapshot?.(registry);
    window.GameState.syncEditorSnapshotToSavedProgress?.(snapshot);
    statusText = "Editor profile saved and synced into the current save snapshot.";
    render();
  }

  function loadSavedModel() {
    const snapshot = window.GameState.loadEditorSnapshot?.();
    if (!snapshot) {
      statusText = "No saved editor profile found.";
      render();
      return;
    }
    model = buildModelFromSnapshot(snapshot);
    statusText = "Saved editor profile loaded.";
    render();
  }

  function resetDefaults() {
    model = defaultModel();
    statusText = "Editor fields reset to defaults. Save to persist them.";
    render();
  }

  function exportModel() {
    const registry = createRegistryAdapter(model);
    const snapshot = window.GameState.buildEditorSnapshot?.(registry);
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mmoisekai-editor-profile.json";
    link.click();
    URL.revokeObjectURL(url);
    statusText = "Editor profile exported as JSON.";
    render();
  }

  function syncToCurrentSave() {
    const registry = createRegistryAdapter(model);
    const snapshot = window.GameState.buildEditorSnapshot?.(registry);
    try {
      window.localStorage?.setItem(window.GameState.EDITOR_STORAGE_KEY, JSON.stringify(snapshot));
    } catch (error) {
      statusText = "Editor storage write failed.";
      render();
      return;
    }
    const ok = window.GameState.syncEditorSnapshotToSavedProgress?.(snapshot);
    statusText = ok
      ? "Editor snapshot pushed into the active save."
      : "Editor snapshot saved, but there was no current save payload to sync.";
    render();
  }

  function copyJsonToClipboard() {
    const registry = createRegistryAdapter(model);
    const snapshot = window.GameState.buildEditorSnapshot?.(registry);
    navigator.clipboard?.writeText(JSON.stringify(snapshot, null, 2))
      .then(() => {
        statusText = "Portable JSON schema copied to clipboard.";
        render();
      })
      .catch(() => {
        statusText = "Clipboard write failed in this environment.";
        render();
      });
  }

  function handleImportFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed?.gameConfig) {
          throw new Error("Missing gameConfig");
        }
        model = buildModelFromSnapshot(parsed);
        statusText = "Editor profile imported. Save it if you want to persist it.";
        render();
      } catch (error) {
        statusText = "Import failed. Invalid editor JSON.";
        render();
      }
    };
    reader.readAsText(file);
  }

  function updateByPath(path, value) {
    const segments = path.split(".");
    let current = model;
    while (segments.length > 1) {
      const key = segments.shift();
      current[key] = current[key] && typeof current[key] === "object" ? current[key] : {};
      current = current[key];
    }
    current[segments[0]] = value;
  }

  function renderOverviewSection() {
    return `
      <div class="section-header">
        <div>
          <h2>Standalone Server Editor</h2>
          <p class="section-subtitle">This is no longer an in-game menu. It is a separate admin app entry point designed to be packaged as a future external exe.</p>
        </div>
        <div class="status-pill"><strong>Current Default</strong> ${model.selectedDungeonDifficulty.toUpperCase()}</div>
      </div>
      <div class="section-grid">
        <section class="editor-card">
          <h3>Profile</h3>
          <p class="section-subtitle">Core global values that will affect future dungeon runs.</p>
          <div class="field-grid">
            <div class="field-row">
              <label for="selected-difficulty">Default Dungeon Difficulty</label>
              <select id="selected-difficulty" data-path="selectedDungeonDifficulty">
                ${["normal", "hard", "nightmare"].map((key) => `<option value="${key}" ${model.selectedDungeonDifficulty === key ? "selected" : ""}>${key.toUpperCase()}</option>`).join("")}
              </select>
              <p class="field-help">This acts like the server default when the player enters a dungeon route.</p>
            </div>
          </div>
        </section>
        <section class="editor-card">
          <h3>Persistence</h3>
          <p class="section-subtitle">Portable storage and packaging-friendly transport options.</p>
          <div class="field-grid">
            <button class="editor-button primary" data-action="save">Save Profile</button>
            <button class="editor-button" data-action="load">Load Saved Profile</button>
            <button class="editor-button" data-action="sync">Sync To Current Save</button>
            <button class="editor-button warn" data-action="reset">Reset Defaults</button>
          </div>
        </section>
        <section class="editor-card full-span">
          <h3>Packaging Direction</h3>
          <p class="section-subtitle">The editor schema is already decoupled from the Phaser scenes.</p>
          <div class="field-grid">
            <p class="app-footnote">Current storage keys: <strong>${window.GameState.EDITOR_STORAGE_KEY}</strong> and <strong>${window.GameState.SAVE_STORAGE_KEY}</strong>.</p>
            <p class="app-footnote">Next step for a real exe is packaging this page and script bundle with Electron or Tauri, then replacing localStorage transport with file-based profile packs and multiplayer admin endpoints.</p>
          </div>
        </section>
      </div>
    `;
  }

  function renderDungeonSection() {
    const dungeon = model.gameConfig.dungeon;
    return `
      <div class="section-header">
        <div>
          <h2>Dungeon Tuning</h2>
          <p class="section-subtitle">Room mob budgets, boss scaling, and chest quality thresholds live here.</p>
        </div>
        <div class="status-pill"><strong>Budget</strong> ${dungeon.roomMinMobs}-${dungeon.roomMaxMobs} per room</div>
      </div>
      <div class="section-grid">
        <section class="editor-card">
          <h3>Mob Budget</h3>
          <p class="section-subtitle">Every combat room uses this range.</p>
          <div class="field-grid">
            <div class="field-row inline-2">
              <div class="field-row">
                <label for="room-min">Room Min Mobs</label>
                <input id="room-min" type="number" min="1" max="10" step="1" value="${dungeon.roomMinMobs}" data-path="gameConfig.dungeon.roomMinMobs" />
              </div>
              <div class="field-row">
                <label for="room-max">Room Max Mobs</label>
                <input id="room-max" type="number" min="1" max="10" step="1" value="${dungeon.roomMaxMobs}" data-path="gameConfig.dungeon.roomMaxMobs" />
              </div>
            </div>
            <p class="field-help">With 3 combat phases, a max of 10 per room means a boss chest can grade against a 30-kill clear budget.</p>
          </div>
        </section>
        <section class="editor-card">
          <h3>Boss Scaling</h3>
          <p class="section-subtitle">Global multipliers before difficulty and level-adaptive scaling.</p>
          <div class="field-grid">
            <div class="field-row">
              <label for="boss-hp">Boss Base HP Multiplier</label>
              <input id="boss-hp" type="number" min="1" max="6" step="0.25" value="${dungeon.bossBaseHpMultiplier}" data-path="gameConfig.dungeon.bossBaseHpMultiplier" />
              <p class="field-help">Use this to keep bosses from dying too fast even on lower difficulties.</p>
            </div>
          </div>
        </section>
        <section class="editor-card full-span">
          <h3>Boss Chest Quality</h3>
          <p class="section-subtitle">The last chest reward depends on how many non-boss mobs were actually killed.</p>
          <div class="field-grid">
            <div class="field-row inline-2">
              <div class="field-row">
                <label for="quality-low">Low Threshold</label>
                <input id="quality-low" type="number" min="0.25" max="0.85" step="0.05" value="${dungeon.killQualityLow}" data-path="gameConfig.dungeon.killQualityLow" />
              </div>
              <div class="field-row">
                <label for="quality-high">High Threshold</label>
                <input id="quality-high" type="number" min="0.35" max="0.95" step="0.05" value="${dungeon.killQualityHigh}" data-path="gameConfig.dungeon.killQualityHigh" />
              </div>
            </div>
            <p class="field-help">Example: if max budget is 30 and the player kills 15 mobs, the final chest should land in a weaker reward band.</p>
          </div>
        </section>
      </div>
    `;
  }

  function renderDifficultySection() {
    const difficultyKeys = ["normal", "hard", "nightmare"];
    return `
      <div class="section-header">
        <div>
          <h2>Difficulty Profiles</h2>
          <p class="section-subtitle">These profiles are central server-side difficulty bands. Add future ones here, not inside scenes.</p>
        </div>
      </div>
      <div class="section-grid">
        ${difficultyKeys.map((key) => {
          const def = model.gameConfig.difficulty[key];
          return `
            <section class="editor-card">
              <h3>${def.label}</h3>
              <p class="section-subtitle">Editable multipliers for ${key} mode.</p>
              <div class="field-grid">
                <div class="field-row inline-2">
                  <div class="field-row"><label>HP</label><input type="number" min="0.5" max="4" step="0.05" value="${def.hpMultiplier}" data-path="gameConfig.difficulty.${key}.hpMultiplier" /></div>
                  <div class="field-row"><label>Damage</label><input type="number" min="0.5" max="4" step="0.05" value="${def.damageMultiplier}" data-path="gameConfig.difficulty.${key}.damageMultiplier" /></div>
                </div>
                <div class="field-row inline-2">
                  <div class="field-row"><label>Defense</label><input type="number" min="0.5" max="3" step="0.05" value="${def.defenseMultiplier}" data-path="gameConfig.difficulty.${key}.defenseMultiplier" /></div>
                  <div class="field-row"><label>Resist Bonus</label><input type="number" min="0" max="0.25" step="0.01" value="${def.resistBonus}" data-path="gameConfig.difficulty.${key}.resistBonus" /></div>
                </div>
                <div class="field-row inline-2">
                  <div class="field-row"><label>Gold</label><input type="number" min="0.5" max="4" step="0.05" value="${def.goldMultiplier}" data-path="gameConfig.difficulty.${key}.goldMultiplier" /></div>
                  <div class="field-row"><label>EXP</label><input type="number" min="0.5" max="4" step="0.05" value="${def.expMultiplier}" data-path="gameConfig.difficulty.${key}.expMultiplier" /></div>
                </div>
                <div class="field-row inline-2">
                  <div class="field-row"><label>Drop</label><input type="number" min="0.5" max="4" step="0.05" value="${def.dropMultiplier}" data-path="gameConfig.difficulty.${key}.dropMultiplier" /></div>
                  <div class="field-row"><label>Spawn Bonus</label><input type="number" min="0" max="4" step="1" value="${def.spawnBonus}" data-path="gameConfig.difficulty.${key}.spawnBonus" /></div>
                </div>
                <div class="field-row inline-2">
                  <div class="field-row"><label>Boss HP</label><input type="number" min="1" max="6" step="0.1" value="${def.bossHpMultiplier}" data-path="gameConfig.difficulty.${key}.bossHpMultiplier" /></div>
                  <div class="field-row"><label>Chest Quality Bonus</label><input type="number" min="0" max="0.3" step="0.01" value="${def.chestQualityBonus}" data-path="gameConfig.difficulty.${key}.chestQualityBonus" /></div>
                </div>
              </div>
            </section>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderTransportSection() {
    const registry = createRegistryAdapter(model);
    const snapshot = window.GameState.buildEditorSnapshot?.(registry);
    return `
      <div class="section-header">
        <div>
          <h2>Transport</h2>
          <p class="section-subtitle">Import/export and raw JSON preview for future exe packaging or server admin workflows.</p>
        </div>
      </div>
      <div class="section-grid">
        <section class="editor-card">
          <h3>External Workflow</h3>
          <p class="section-subtitle">These controls are the bridge to a future desktop admin build.</p>
          <div class="field-grid">
            <button class="editor-button primary" data-action="export">Export JSON</button>
            <button class="editor-button" data-action="copy-json">Copy JSON</button>
            <button class="editor-button" data-action="import">Import JSON</button>
            <button class="editor-button" data-action="sync">Sync To Current Save</button>
            <a class="editor-button" href="./index.html">Open Game</a>
          </div>
        </section>
        <section class="editor-card full-span">
          <h3>Raw Snapshot</h3>
          <p class="section-subtitle">This is the portable schema that the future exe should read and write.</p>
          <textarea class="editor-json" readonly>${JSON.stringify(snapshot, null, 2)}</textarea>
        </section>
      </div>
    `;
  }

  function renderMainSection() {
    if (activeSection === "dungeon") return renderDungeonSection();
    if (activeSection === "difficulty") return renderDifficultySection();
    if (activeSection === "transport") return renderTransportSection();
    return renderOverviewSection();
  }

  function bindEvents() {
    appRoot.querySelectorAll("[data-nav]").forEach((button) => {
      button.addEventListener("click", () => {
        activeSection = button.dataset.nav;
        render();
      });
    });

    appRoot.querySelectorAll("[data-action='save']").forEach((button) => button.addEventListener("click", saveModel));
    appRoot.querySelectorAll("[data-action='load']").forEach((button) => button.addEventListener("click", loadSavedModel));
    appRoot.querySelectorAll("[data-action='reset']").forEach((button) => button.addEventListener("click", resetDefaults));
    appRoot.querySelectorAll("[data-action='export']").forEach((button) => button.addEventListener("click", exportModel));
    appRoot.querySelectorAll("[data-action='sync']").forEach((button) => button.addEventListener("click", syncToCurrentSave));
    appRoot.querySelectorAll("[data-action='copy-json']").forEach((button) => button.addEventListener("click", copyJsonToClipboard));
    appRoot.querySelectorAll("[data-action='import']").forEach((button) => button.addEventListener("click", () => importInput.click()));

    appRoot.querySelectorAll("[data-path]").forEach((input) => {
      const handler = () => {
        const path = input.dataset.path;
        const isNumeric = input.type === "number" || input.type === "range";
        const value = isNumeric ? Number(input.value) : input.value;
        updateByPath(path, value);

        const min = Number(model.gameConfig.dungeon.roomMinMobs);
        const max = Number(model.gameConfig.dungeon.roomMaxMobs);
        if (min > max) {
          model.gameConfig.dungeon.roomMaxMobs = min;
        }
        if (model.gameConfig.dungeon.killQualityLow >= model.gameConfig.dungeon.killQualityHigh) {
          model.gameConfig.dungeon.killQualityHigh = Number((model.gameConfig.dungeon.killQualityLow + 0.1).toFixed(2));
        }
        statusText = "Editor model updated. Save to persist changes.";
        render();
      };

      input.addEventListener("change", handler);
      input.addEventListener("input", () => {
        if (input.tagName === "SELECT") return;
        handler();
      });
    });
  }

  importInput.addEventListener("change", (event) => {
    handleImportFile(event.target.files?.[0]);
    event.target.value = "";
  });

  function render() {
    appRoot.innerHTML = `
      <div class="editor-shell">
        <div class="editor-window">
          <header class="editor-titlebar">
            <div class="editor-brand">
              <div class="editor-brand-mark"></div>
              <div>
                <h1>MMO Isekai Server Editor</h1>
                <p>Standalone admin tool entry point. Package this later as the real external exe.</p>
              </div>
            </div>
            <div class="editor-actions">
              <button class="editor-button primary" data-action="save">Save</button>
              <button class="editor-button" data-action="load">Load</button>
              <button class="editor-button" data-action="export">Export</button>
              <button class="editor-button" data-action="import">Import</button>
            </div>
          </header>
          <div class="editor-layout">
            <aside class="editor-sidebar">
              <h2>Sections</h2>
              <div class="nav-stack">
                ${sectionDefs.map((section) => `
                  <button class="nav-button ${activeSection === section.key ? "active" : ""}" data-nav="${section.key}">
                    <strong>${section.title}</strong>
                    <span>${section.meta}</span>
                  </button>
                `).join("")}
              </div>
              <div class="sidebar-card">
                <p class="editor-status"><strong>Status</strong></p>
                <p class="editor-status">${statusText}</p>
              </div>
              <div class="sidebar-card">
                <p class="editor-status"><strong>Current Profile</strong></p>
                <p class="editor-status">Difficulty ${model.selectedDungeonDifficulty.toUpperCase()}</p>
                <p class="editor-status">Room Budget ${model.gameConfig.dungeon.roomMinMobs}-${model.gameConfig.dungeon.roomMaxMobs}</p>
              </div>
            </aside>
            <main class="editor-main">
              ${renderMainSection()}
            </main>
          </div>
          <footer class="editor-footer">
            <div class="status-pill"><strong>Storage</strong> ${window.GameState.EDITOR_STORAGE_KEY}</div>
            <div class="status-pill"><strong>Save Sync</strong> ${window.GameState.SAVE_STORAGE_KEY}</div>
          </footer>
        </div>
      </div>
    `;
    bindEvents();
  }

  render();
})();
