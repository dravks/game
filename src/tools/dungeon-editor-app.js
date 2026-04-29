(() => {
  const STORAGE_KEY = "mmoisekai-dungeon-editor-map-v1";
  const RECENTS_KEY = "mmoisekai-dungeon-editor-recents-v1";
  const PLAYTEST_KEY = "mmoisekai-playtest-dungeon";
  const root = document.getElementById("dungeon-editor-root");
  const importInput = document.getElementById("dungeon-import-input");
  if (!root) return;

  const SHEETS = {
    walls_floor: "assets/dungeon_pack/PNG/walls_floor.png",
    objects: "assets/dungeon_pack/PNG/Objects.png",
    doors: "assets/dungeon_pack/PNG/doors_lever_chest_animation.png",
    trap: "assets/dungeon_pack/PNG/trap_animation.png",
    fire: "assets/dungeon_pack/PNG/fire_animation.png",
    water: "assets/dungeon_pack/PNG/Water_coasts_animation.png",
    cracks_floor: "assets/dungeon_pack/PNG/decorative_cracks_floor.png",
    cracks_walls: "assets/dungeon_pack/PNG/decorative_cracks_walls.png",
  };

  const asset = (id, label, category, sheet, sx, sy, sw = 16, sh = 16, opts = {}) => ({
    id, label, category, sheet, sx, sy, sw, sh,
    type: opts.type || "tile",
    layer: opts.layer || category,
    collision: !!opts.collision,
    metadata: opts.metadata || {},
    scale: opts.scale || 1,
  });

  const ASSETS = [
    asset("stone_floor_a", "Floor A", "floor", "walls_floor", 0, 0),
    asset("stone_floor_b", "Floor B", "floor", "walls_floor", 16, 0),
    asset("stone_floor_c", "Floor C", "floor", "walls_floor", 32, 0),
    asset("stone_floor_d", "Floor D", "floor", "walls_floor", 48, 0),
    asset("stone_floor_e", "Floor E", "floor", "walls_floor", 64, 0),
    asset("stone_floor_f", "Floor F", "floor", "walls_floor", 80, 0),
    asset("stone_floor_g", "Floor G", "floor", "walls_floor", 96, 0),
    asset("stone_floor_h", "Floor H", "floor", "walls_floor", 112, 0),
    asset("wall_top_a", "Wall Top", "wall", "walls_floor", 0, 64, 16, 16, { collision: true, layer: "wall" }),
    asset("wall_top_b", "Wall Top B", "wall", "walls_floor", 16, 64, 16, 16, { collision: true, layer: "wall" }),
    asset("wall_side_l", "Wall L", "wall", "walls_floor", 0, 80, 16, 16, { collision: true, layer: "wall" }),
    asset("wall_side_r", "Wall R", "wall", "walls_floor", 16, 80, 16, 16, { collision: true, layer: "wall" }),
    asset("wall_dark", "Dark Wall", "wall", "walls_floor", 32, 80, 16, 16, { collision: true, layer: "wall" }),
    asset("water_a", "Water", "decoration", "water", 0, 0, 16, 16, { layer: "decoration" }),
    asset("water_edge", "Water Edge", "decoration", "water", 16, 0, 16, 16, { layer: "decoration" }),
    asset("crack_floor_a", "Crack A", "decoration", "cracks_floor", 0, 0, 16, 16, { layer: "decoration" }),
    asset("crack_floor_b", "Crack B", "decoration", "cracks_floor", 16, 0, 16, 16, { layer: "decoration" }),
    asset("crack_wall", "Wall Crack", "decoration", "cracks_walls", 0, 0, 16, 16, { layer: "decoration" }),
    asset("barrel", "Barrel", "prop", "objects", 0, 0, 16, 16, { layer: "prop", collision: true }),
    asset("box", "Box", "prop", "objects", 16, 0, 16, 16, { layer: "prop", collision: true }),
    asset("crate", "Crate", "prop", "objects", 32, 0, 16, 16, { layer: "prop", collision: true }),
    asset("bones", "Bones", "prop", "objects", 48, 0, 16, 16, { layer: "prop" }),
    asset("skull", "Skull", "prop", "objects", 64, 0, 16, 16, { layer: "prop" }),
    asset("stairs", "Stairs", "exit", "objects", 80, 0, 16, 16, { layer: "exit", type: "exit", metadata: { targetScene: "PrototypeScene" } }),
    asset("chest_closed", "Chest", "chest", "doors", 0, 0, 16, 16, { layer: "chest", type: "chest", metadata: { rewardProfile: "balanced", lockedUntilBossDead: true } }),
    asset("door_closed", "Door", "interactable", "doors", 16, 0, 16, 16, { layer: "trigger", type: "door", collision: true }),
    asset("lever", "Lever", "interactable", "doors", 32, 0, 16, 16, { layer: "trigger", type: "lever" }),
    asset("spikes", "Spikes", "trap", "trap", 0, 0, 16, 16, { layer: "trigger", type: "trap", metadata: { damage: 10 } }),
    asset("fire", "Fire", "decoration", "fire", 0, 0, 16, 16, { layer: "decoration", type: "animatedDecoration" }),
  ];

  const ENEMIES = [
    { id: "kekon", label: "Kekon", color: "#84d46b", hp: 30, damage: 8, speed: 60 },
    { id: "kekon_warrior", label: "Kekon Warrior", color: "#d9a45d", hp: 48, damage: 12, speed: 52 },
    { id: "kekon_shaman", label: "Kekon Shaman", color: "#7aa7ff", hp: 38, damage: 13, speed: 54 },
    { id: "kekon_brute", label: "Kekon Brute", color: "#dc6d64", hp: 78, damage: 18, speed: 44 },
    { id: "spider", label: "Spider", color: "#bb78e8", hp: 26, damage: 9, speed: 82 },
    { id: "skeleton", label: "Skeleton", color: "#d9d5c7", hp: 42, damage: 11, speed: 50 },
    { id: "bandit", label: "Bandit", color: "#d6bf78", hp: 45, damage: 14, speed: 64 },
    { id: "abyss_imp", label: "Abyss Imp", color: "#ff5b5b", hp: 55, damage: 18, speed: 78 },
  ];

  const BOSSES = [
    { id: "kekon_chief", label: "Kekon Chief", color: "#d97757" },
    { id: "burned_captain", label: "Burned Captain", color: "#e06b3c" },
    { id: "sunken_priest", label: "Sunken Priest", color: "#4fb5d8" },
    { id: "brood_mother", label: "Brood Mother", color: "#b15ee0" },
    { id: "frost_lich", label: "Frost Lich", color: "#90d8ff" },
    { id: "ember_golem", label: "Ember Golem", color: "#ff873c" },
    { id: "bandit_warlord", label: "Bandit Warlord", color: "#d0a846" },
    { id: "graveborn_king", label: "Graveborn King", color: "#8bdd74" },
    { id: "crystal_guardian", label: "Crystal Guardian", color: "#93e2ff" },
    { id: "abyss_herald", label: "Abyss Herald", color: "#f04c69" },
  ];

  const TEMPLATE_FILES = [
    ["forgotten_halls", "Forgotten Halls"],
    ["ashen_barracks", "Ashen Barracks"],
    ["sunken_sanctum", "Sunken Sanctum"],
    ["shadow_silk_cave", "Shadow Silk Cave"],
    ["frostbite_crypt", "Frostbite Crypt"],
    ["emberforge_depths", "Emberforge Depths"],
    ["bandit_quarry", "Bandit Quarry"],
    ["necrotic_catacombs", "Necrotic Catacombs"],
    ["crystal_hollow", "Crystal Hollow"],
    ["abyss_gate", "Abyss Gate"],
  ];

  const state = {
    gridSize: 32,
    map: null,
    tool: "paint",
    selectedAssetId: "stone_floor_a",
    selectedEnemyId: "kekon",
    selectedBossId: "kekon_chief",
    selectedObjectId: null,
    camera: { x: -160, y: -120, zoom: 1 },
    drag: null,
    mouse: { x: 0, y: 0, gridX: 0, gridY: 0 },
    showGrid: true,
    status: "Dungeon Editor ready.",
    undo: [],
    redo: [],
    images: {},
    keys: {},
  };

  const layerOrder = ["floor", "decoration", "wall", "prop", "collision", "enemy_spawn", "boss_spawn", "player_spawn", "chest", "exit", "trigger"];

  function defaultMap() {
    return {
      schemaVersion: 1,
      editorVersion: "1.0.0",
      id: "custom_dungeon_001",
      name: "Custom Dungeon",
      description: "Created in the MMO Isekai visual dungeon editor.",
      recommendedLevel: 1,
      recommendedPower: 100,
      unlockLevel: 1,
      gridSize: 32,
      width: 3200,
      height: 1920,
      theme: {
        backgroundColor: "#10131a",
        floorTint: "0x334455",
        wallTint: "0x0a0c10",
        ambientTint: "0x223344",
      },
      rewardFocus: "balanced starter gear",
      allowedDifficulties: ["normal", "hard", "very_hard"],
      playerSpawn: { x: 320, y: 320 },
      layers: Object.fromEntries(layerOrder.map((l) => [l, []])),
    };
  }

  function ensureLayers(map) {
    map.layers = map.layers || {};
    layerOrder.forEach((layer) => { if (!Array.isArray(map.layers[layer])) map.layers[layer] = []; });
    map.gridSize = map.gridSize || 32;
    return map;
  }

  function uid(prefix = "obj") { return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`; }
  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function getAsset() { return ASSETS.find((a) => a.id === state.selectedAssetId) || ASSETS[0]; }
  function getEnemy() { return ENEMIES.find((e) => e.id === state.selectedEnemyId) || ENEMIES[0]; }
  function getBoss() { return BOSSES.find((b) => b.id === state.selectedBossId) || BOSSES[0]; }
  function gridToWorld(gx, gy) { return { x: gx * state.map.gridSize + state.map.gridSize / 2, y: gy * state.map.gridSize + state.map.gridSize / 2 }; }
  function worldToGrid(x, y) { return { gridX: Math.floor(x / state.map.gridSize), gridY: Math.floor(y / state.map.gridSize) }; }
  function screenToWorld(x, y) { return { x: x / state.camera.zoom + state.camera.x, y: y / state.camera.zoom + state.camera.y }; }
  function worldToScreen(x, y) { return { x: (x - state.camera.x) * state.camera.zoom, y: (y - state.camera.y) * state.camera.zoom }; }

  root.innerHTML = `
    <div class="editor-topbar">
      <div class="editor-title">MMO Isekai Dungeon Editor</div>
      <div class="toolbar-group" id="tool-buttons"></div>
      <div class="toolbar-group">
        <button id="new-map">New</button><button id="save-map" class="primary">Save</button><button id="load-map">Load</button><button id="export-map">Export JSON</button><button id="import-map">Import JSON</button><button id="validate-map">Validate</button><button id="playtest-map" class="warn">Save Playtest</button>
      </div>
      <div class="toolbar-group">
        <label class="muted">Template</label><select id="template-select"><option value="">Load 10 DG template...</option>${TEMPLATE_FILES.map(([id, name]) => `<option value="${id}">${name}</option>`).join("")}</select>
      </div>
    </div>
    <aside class="editor-left"><div class="panel-title">Assets</div><div class="muted">Paint tiles, props, mobs, boss, chest and exits.</div><div id="asset-palette"></div></aside>
    <main class="editor-center"><canvas id="editor-canvas"></canvas></main>
    <aside class="editor-right"><div class="panel-title">Properties</div><div id="properties-panel"></div></aside>
    <div id="statusbar"></div>
  `;

  const canvas = document.getElementById("editor-canvas");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  function setStatus(text) { state.status = text; renderStatus(); }
  function renderStatus() {
    const s = document.getElementById("statusbar");
    if (!s) return;
    s.textContent = `Tool: ${state.tool} | Grid: ${state.mouse.gridX},${state.mouse.gridY} | Zoom: ${state.camera.zoom.toFixed(2)} | Objects: ${countObjects()} | ${state.status}`;
  }
  function countObjects() { return layerOrder.reduce((sum, l) => sum + (state.map.layers[l]?.length || 0), 0); }

  function snapshot() {
    state.undo.push(JSON.stringify(state.map));
    if (state.undo.length > 80) state.undo.shift();
    state.redo = [];
  }
  function undo() { if (!state.undo.length) return; state.redo.push(JSON.stringify(state.map)); state.map = ensureLayers(JSON.parse(state.undo.pop())); renderProperties(); draw(); }
  function redo() { if (!state.redo.length) return; state.undo.push(JSON.stringify(state.map)); state.map = ensureLayers(JSON.parse(state.redo.pop())); renderProperties(); draw(); }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(320, Math.floor(rect.width * devicePixelRatio));
    canvas.height = Math.max(240, Math.floor(rect.height * devicePixelRatio));
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    ctx.imageSmoothingEnabled = false;
    draw();
  }
  window.addEventListener("resize", resizeCanvas);

  function loadImages() {
    return Promise.all(Object.entries(SHEETS).map(([key, src]) => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => { state.images[key] = img; resolve(); };
      img.onerror = () => { console.warn("Missing editor sheet", src); resolve(); };
      img.src = src;
    })));
  }

  function drawAssetTo(ctx2, a, x, y, size = 32) {
    const img = state.images[a.sheet];
    if (!img) {
      ctx2.fillStyle = "#555"; ctx2.fillRect(x, y, size, size); return;
    }
    ctx2.drawImage(img, a.sx, a.sy, a.sw, a.sh, x, y, size * (a.sw / 16), size * (a.sh / 16));
  }

  function draw() {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = state.map.theme?.backgroundColor || "#10131a";
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.save();
    ctx.scale(state.camera.zoom, state.camera.zoom);
    ctx.translate(-state.camera.x, -state.camera.y);

    ctx.fillStyle = "#0b0f15";
    ctx.fillRect(0, 0, state.map.width, state.map.height);

    for (const layer of layerOrder) {
      for (const obj of state.map.layers[layer] || []) drawObject(obj);
    }

    if (state.showGrid) drawGrid();
    drawCursor();
    ctx.restore();
    renderStatus();
  }

  function drawGrid() {
    const gs = state.map.gridSize;
    const viewW = canvas.getBoundingClientRect().width / state.camera.zoom;
    const viewH = canvas.getBoundingClientRect().height / state.camera.zoom;
    const startX = Math.floor(state.camera.x / gs) * gs;
    const startY = Math.floor(state.camera.y / gs) * gs;
    const endX = state.camera.x + viewW + gs;
    const endY = state.camera.y + viewH + gs;
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1 / state.camera.zoom;
    for (let x = startX; x < endX; x += gs) { ctx.beginPath(); ctx.moveTo(x, state.camera.y); ctx.lineTo(x, endY); ctx.stroke(); }
    for (let y = startY; y < endY; y += gs) { ctx.beginPath(); ctx.moveTo(state.camera.x, y); ctx.lineTo(endX, y); ctx.stroke(); }
  }

  function drawObject(obj) {
    const gs = state.map.gridSize;
    const sx = obj.x - gs / 2;
    const sy = obj.y - gs / 2;
    const a = ASSETS.find((x) => x.id === obj.assetKey);
    if (a) drawAssetTo(ctx, a, sx, sy, gs * (obj.scale || 1));
    else drawMarker(obj);

    if (obj.collision && (obj.layer === "collision" || obj.collision === true)) {
      ctx.fillStyle = "rgba(255,80,80,0.20)";
      ctx.fillRect(sx, sy, gs, gs);
      ctx.strokeStyle = "rgba(255,120,120,0.8)"; ctx.strokeRect(sx, sy, gs, gs);
    }
    if (obj.id === state.selectedObjectId) {
      ctx.strokeStyle = "#ffd36b"; ctx.lineWidth = 2 / state.camera.zoom;
      ctx.strokeRect(sx - 2, sy - 2, gs + 4, gs + 4);
    }
  }

  function drawMarker(obj) {
    const gs = state.map.gridSize;
    const x = obj.x, y = obj.y;
    const colors = { enemy_spawn: "#ffcc55", boss_spawn: "#ff5555", player_spawn: "#66ddff", chest: "#e8c46a", exit: "#85ff89", trigger: "#b88cff" };
    ctx.fillStyle = colors[obj.layer] || "#fff";
    ctx.beginPath(); ctx.arc(x, y, gs * 0.38, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#071018";
    ctx.font = `${Math.floor(gs * 0.38)}px Arial`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const label = obj.layer === "enemy_spawn" ? "M" : obj.layer === "boss_spawn" ? "B" : obj.layer === "player_spawn" ? "P" : obj.layer === "chest" ? "C" : obj.layer === "exit" ? "E" : "T";
    ctx.fillText(label, x, y + 1);
  }

  function drawCursor() {
    const gs = state.map.gridSize;
    ctx.strokeStyle = state.tool === "erase" ? "#ff6767" : "#87e28d";
    ctx.lineWidth = 2 / state.camera.zoom;
    ctx.strokeRect(state.mouse.gridX * gs, state.mouse.gridY * gs, gs, gs);
  }

  function renderToolbar() {
    const tools = [["select", "Select"], ["paint", "Paint"], ["erase", "Erase"], ["collision", "Collision"], ["enemy", "Mob"], ["boss", "Boss"], ["player", "Player"], ["chest", "Chest"], ["exit", "Exit"]];
    const wrap = document.getElementById("tool-buttons");
    wrap.innerHTML = tools.map(([id, label]) => `<button data-tool="${id}" class="${state.tool === id ? "active" : ""}">${label}</button>`).join("");
    wrap.querySelectorAll("button[data-tool]").forEach((btn) => btn.addEventListener("click", () => { state.tool = btn.dataset.tool; renderToolbar(); setStatus(`${btn.textContent} tool selected.`); }));
  }

  function renderPalette() {
    const palette = document.getElementById("asset-palette");
    const groups = ["floor", "wall", "prop", "decoration", "interactable", "trap", "chest", "exit"];
    const html = groups.map((g) => {
      const items = ASSETS.filter((a) => a.category === g);
      if (!items.length) return "";
      return `<div class="asset-category"><div class="category-header"><span>${g.toUpperCase()}</span><span>${items.length}</span></div><div class="asset-grid">${items.map((a) => `<div class="asset-tile ${state.selectedAssetId === a.id ? "selected" : ""}" data-asset="${a.id}"><canvas width="32" height="32"></canvas><div class="asset-label">${a.label}</div></div>`).join("")}</div></div>`;
    }).join("") + `
      <div class="asset-category"><div class="category-header"><span>ENEMY SPAWNS</span><span>${ENEMIES.length}</span></div><select id="enemy-select">${ENEMIES.map((e) => `<option value="${e.id}" ${state.selectedEnemyId === e.id ? "selected" : ""}>${e.label}</option>`).join("")}</select></div>
      <div class="asset-category"><div class="category-header"><span>BOSSES</span><span>${BOSSES.length}</span></div><select id="boss-select">${BOSSES.map((b) => `<option value="${b.id}" ${state.selectedBossId === b.id ? "selected" : ""}>${b.label}</option>`).join("")}</select></div>
      <div class="divider"></div><div class="small-help">Controls: left click paint/select, right click erase, middle drag pan, wheel zoom, Shift drag paint, Ctrl+Z/Y undo/redo, G grid, S save, E export, I import.</div>`;
    palette.innerHTML = html;
    palette.querySelectorAll(".asset-tile").forEach((tile) => {
      const a = ASSETS.find((x) => x.id === tile.dataset.asset);
      const c = tile.querySelector("canvas");
      const cctx = c.getContext("2d");
      cctx.imageSmoothingEnabled = false;
      drawAssetTo(cctx, a, 0, 0, 32);
      tile.addEventListener("click", () => { state.selectedAssetId = a.id; state.tool = a.type === "chest" ? "chest" : a.type === "exit" ? "exit" : "paint"; renderToolbar(); renderPalette(); setStatus(`${a.label} selected.`); });
    });
    document.getElementById("enemy-select")?.addEventListener("change", (e) => { state.selectedEnemyId = e.target.value; state.tool = "enemy"; renderToolbar(); });
    document.getElementById("boss-select")?.addEventListener("change", (e) => { state.selectedBossId = e.target.value; state.tool = "boss"; renderToolbar(); });
  }

  function renderProperties() {
    const panel = document.getElementById("properties-panel");
    const obj = findObject(state.selectedObjectId);
    const map = state.map;
    if (!obj) {
      panel.innerHTML = `
        <div class="form-section"><h3>Dungeon Metadata</h3>
          <div class="field"><label>ID</label><input data-map="id" value="${escapeHtml(map.id)}" /></div>
          <div class="field"><label>Name</label><input data-map="name" value="${escapeHtml(map.name)}" /></div>
          <div class="field"><label>Description</label><textarea data-map="description" rows="3">${escapeHtml(map.description || "")}</textarea></div>
          <div class="field-row"><div class="field"><label>Recommended Level</label><input type="number" data-map="recommendedLevel" value="${map.recommendedLevel || 1}" /></div><div class="field"><label>Unlock Level</label><input type="number" data-map="unlockLevel" value="${map.unlockLevel || 1}" /></div></div>
          <div class="field"><label>Reward Focus</label><input data-map="rewardFocus" value="${escapeHtml(map.rewardFocus || "")}" /></div>
          <div class="field-row"><div class="field"><label>Width</label><input type="number" data-map="width" value="${map.width}" /></div><div class="field"><label>Height</label><input type="number" data-map="height" value="${map.height}" /></div></div>
        </div>
        <div class="form-section"><h3>Map Stats</h3><div class="small-help">Objects: ${countObjects()}<br>Player spawn: ${map.playerSpawn?.x || 0}, ${map.playerSpawn?.y || 0}<br>Selected: none</div></div>
        <div class="form-section"><h3>10 Example DG</h3><div class="template-list">${TEMPLATE_FILES.map(([id, name]) => `<button class="template-button" data-template="${id}">${name}</button>`).join("")}</div></div>
      `;
      panel.querySelectorAll("[data-map]").forEach((input) => input.addEventListener("change", () => {
        snapshot(); const key = input.dataset.map; map[key] = input.type === "number" ? Number(input.value) : input.value; draw(); renderProperties();
      }));
      panel.querySelectorAll("[data-template]").forEach((btn) => btn.addEventListener("click", () => loadTemplate(btn.dataset.template)));
      return;
    }
    panel.innerHTML = `
      <div class="form-section"><h3>Selected Object</h3>
        <div class="field"><label>ID</label><input value="${obj.id}" disabled /></div>
        <div class="field-row"><div class="field"><label>Layer</label><input data-obj="layer" value="${obj.layer}" /></div><div class="field"><label>Type</label><input data-obj="type" value="${obj.type}" /></div></div>
        <div class="field-row"><div class="field"><label>Grid X</label><input type="number" data-obj="gridX" value="${obj.gridX}" /></div><div class="field"><label>Grid Y</label><input type="number" data-obj="gridY" value="${obj.gridY}" /></div></div>
        <div class="field-row"><div class="field"><label>Scale</label><input type="number" step="0.1" data-obj="scale" value="${obj.scale || 1}" /></div><div class="field"><label>Rotation</label><input type="number" step="0.1" data-obj="rotation" value="${obj.rotation || 0}" /></div></div>
        <div class="field"><label>Collision</label><select data-obj="collision"><option value="false" ${!obj.collision ? "selected" : ""}>false</option><option value="true" ${obj.collision ? "selected" : ""}>true</option></select></div>
        <div class="field"><label>Metadata JSON</label><textarea data-metadata rows="7">${escapeHtml(JSON.stringify(obj.metadata || {}, null, 2))}</textarea></div>
        <button class="danger" id="delete-selected">Delete Selected</button>
      </div>`;
    panel.querySelectorAll("[data-obj]").forEach((input) => input.addEventListener("change", () => {
      snapshot(); const key = input.dataset.obj; let value = input.value;
      if (["gridX", "gridY"].includes(key)) value = Number(value);
      if (["scale", "rotation"].includes(key)) value = Number(value);
      if (key === "collision") value = value === "true";
      obj[key] = value;
      if (key === "gridX" || key === "gridY") { const p = gridToWorld(obj.gridX, obj.gridY); obj.x = p.x; obj.y = p.y; }
      draw(); renderProperties();
    }));
    panel.querySelector("[data-metadata]")?.addEventListener("change", (e) => {
      try { snapshot(); obj.metadata = JSON.parse(e.target.value || "{}"); setStatus("Metadata updated."); } catch { setStatus("Invalid metadata JSON."); }
      draw(); renderProperties();
    });
    document.getElementById("delete-selected")?.addEventListener("click", () => { snapshot(); deleteObject(obj.id); state.selectedObjectId = null; draw(); renderProperties(); });
  }

  function escapeHtml(s) { return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

  function findObject(id) { if (!id) return null; for (const l of layerOrder) { const o = state.map.layers[l]?.find((x) => x.id === id); if (o) return o; } return null; }
  function deleteObject(id) { for (const l of layerOrder) state.map.layers[l] = (state.map.layers[l] || []).filter((x) => x.id !== id); }
  function findTopObjectAt(gx, gy) {
    for (const layer of [...layerOrder].reverse()) {
      const hit = (state.map.layers[layer] || []).find((o) => o.gridX === gx && o.gridY === gy);
      if (hit) return hit;
    }
    return null;
  }
  function removeAt(gx, gy) {
    let removed = false;
    for (const l of layerOrder) {
      const before = state.map.layers[l].length;
      state.map.layers[l] = state.map.layers[l].filter((o) => !(o.gridX === gx && o.gridY === gy));
      removed = removed || before !== state.map.layers[l].length;
    }
    return removed;
  }
  function removeLayerAt(layer, gx, gy) { state.map.layers[layer] = state.map.layers[layer].filter((o) => !(o.gridX === gx && o.gridY === gy)); }

  function placeAt(gx, gy) {
    const p = gridToWorld(gx, gy);
    if (gx < 0 || gy < 0 || p.x > state.map.width || p.y > state.map.height) return;
    if (state.tool === "erase") { if (removeAt(gx, gy)) draw(); return; }
    if (state.tool === "select") { const hit = findTopObjectAt(gx, gy); state.selectedObjectId = hit?.id || null; renderProperties(); draw(); return; }
    snapshot();
    let obj = null;
    if (state.tool === "collision") {
      removeLayerAt("collision", gx, gy);
      obj = { id: uid("col"), type: "collision", layer: "collision", assetKey: null, x: p.x, y: p.y, gridX: gx, gridY: gy, rotation: 0, scale: 1, flipX: false, flipY: false, depth: 50, collision: true, metadata: {} };
    } else if (state.tool === "enemy") {
      const e = getEnemy();
      obj = { id: uid("mob"), type: "enemySpawn", layer: "enemy_spawn", assetKey: null, x: p.x, y: p.y, gridX: gx, gridY: gy, rotation: 0, scale: 1, flipX: false, flipY: false, depth: 80, collision: false, metadata: { enemyId: e.id, label: e.label, count: 1, phaseId: 1, patrolRadius: 120, difficultyWeight: 1 } };
    } else if (state.tool === "boss") {
      state.map.layers.boss_spawn = [];
      const b = getBoss();
      obj = { id: uid("boss"), type: "bossSpawn", layer: "boss_spawn", assetKey: null, x: p.x, y: p.y, gridX: gx, gridY: gy, rotation: 0, scale: 1, flipX: false, flipY: false, depth: 90, collision: false, metadata: { bossId: b.id, bossName: b.label, phaseId: 4, chestAfterDeath: true } };
    } else if (state.tool === "player") {
      state.map.layers.player_spawn = [];
      state.map.playerSpawn = { x: p.x, y: p.y };
      obj = { id: uid("player"), type: "playerSpawn", layer: "player_spawn", assetKey: null, x: p.x, y: p.y, gridX: gx, gridY: gy, rotation: 0, scale: 1, flipX: false, flipY: false, depth: 90, collision: false, metadata: {} };
    } else if (state.tool === "chest") {
      const a = ASSETS.find((x) => x.id === "chest_closed") || getAsset();
      obj = makeAssetObject(a, gx, gy);
      obj.type = "chest"; obj.layer = "chest"; obj.metadata = { chestId: uid("chest"), rewardProfile: state.map.rewardFocus || "balanced", lockedUntilBossDead: true };
    } else if (state.tool === "exit") {
      const a = ASSETS.find((x) => x.id === "stairs") || getAsset();
      obj = makeAssetObject(a, gx, gy);
      obj.type = "exit"; obj.layer = "exit"; obj.metadata = { targetScene: "PrototypeScene", targetSpawn: "town_gate" };
    } else {
      const a = getAsset();
      obj = makeAssetObject(a, gx, gy);
      if (["floor", "wall", "collision"].includes(obj.layer)) removeLayerAt(obj.layer, gx, gy);
    }
    state.map.layers[obj.layer].push(obj);
    state.selectedObjectId = obj.id;
    draw(); renderProperties();
  }

  function makeAssetObject(a, gx, gy) {
    const p = gridToWorld(gx, gy);
    return { id: uid("obj"), type: a.type || "tile", layer: a.layer || a.category, assetKey: a.id, sheet: a.sheet, x: p.x, y: p.y, gridX: gx, gridY: gy, rotation: 0, scale: a.scale || 1, flipX: false, flipY: false, depth: layerOrder.indexOf(a.layer || a.category), collision: !!a.collision, metadata: clone(a.metadata || {}) };
  }

  function onPointer(e) {
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    const w = screenToWorld(sx, sy);
    const g = worldToGrid(w.x, w.y);
    state.mouse = { x: w.x, y: w.y, gridX: g.gridX, gridY: g.gridY };
    if (e.buttons === 4 || state.drag?.mode === "pan") {
      if (!state.drag) state.drag = { mode: "pan", x: e.clientX, y: e.clientY, cx: state.camera.x, cy: state.camera.y };
      state.camera.x = state.drag.cx - (e.clientX - state.drag.x) / state.camera.zoom;
      state.camera.y = state.drag.cy - (e.clientY - state.drag.y) / state.camera.zoom;
      draw(); return;
    }
    if ((e.buttons & 1) && (state.drag?.painting || e.shiftKey)) {
      state.drag = state.drag || { painting: true };
      placeAt(g.gridX, g.gridY);
    }
    draw();
  }
  canvas.addEventListener("mousemove", onPointer);
  canvas.addEventListener("mousedown", (e) => {
    canvas.focus(); e.preventDefault();
    if (e.button === 1) { state.drag = { mode: "pan", x: e.clientX, y: e.clientY, cx: state.camera.x, cy: state.camera.y }; return; }
    const rect = canvas.getBoundingClientRect(); const w = screenToWorld(e.clientX - rect.left, e.clientY - rect.top); const g = worldToGrid(w.x, w.y);
    state.mouse.gridX = g.gridX; state.mouse.gridY = g.gridY;
    if (e.button === 2) { snapshot(); removeAt(g.gridX, g.gridY); draw(); renderProperties(); return; }
    state.drag = { painting: e.shiftKey };
    placeAt(g.gridX, g.gridY);
  });
  window.addEventListener("mouseup", () => { state.drag = null; });
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const oldZoom = state.camera.zoom;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const before = screenToWorld(mx, my);
    state.camera.zoom = Math.max(0.25, Math.min(3, state.camera.zoom * (e.deltaY < 0 ? 1.1 : 0.9)));
    const after = screenToWorld(mx, my);
    state.camera.x += before.x - after.x;
    state.camera.y += before.y - after.y;
    if (oldZoom !== state.camera.zoom) draw();
  }, { passive: false });

  window.addEventListener("keydown", (e) => {
    if (e.target && ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
    if (e.ctrlKey && e.key.toLowerCase() === "z") { e.preventDefault(); undo(); }
    else if (e.ctrlKey && e.key.toLowerCase() === "y") { e.preventDefault(); redo(); }
    else if (e.key === "Delete") { const obj = findObject(state.selectedObjectId); if (obj) { snapshot(); deleteObject(obj.id); state.selectedObjectId = null; renderProperties(); draw(); } }
    else if (e.key.toLowerCase() === "g") { state.showGrid = !state.showGrid; draw(); }
    else if (e.key.toLowerCase() === "s") { e.preventDefault(); saveMap(); }
    else if (e.key.toLowerCase() === "e") { e.preventDefault(); exportMap(); }
    else if (e.key.toLowerCase() === "i") { e.preventDefault(); importInput.click(); }
    else if (e.key === "Escape") { state.selectedObjectId = null; renderProperties(); draw(); }
    const step = 32 / state.camera.zoom;
    if (e.key.toLowerCase() === "w") state.camera.y -= step;
    if (e.key.toLowerCase() === "s" && !e.ctrlKey) state.camera.y += step;
    if (e.key.toLowerCase() === "a") state.camera.x -= step;
    if (e.key.toLowerCase() === "d") state.camera.x += step;
    draw();
  });

  function saveMap() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.map));
    const recents = JSON.parse(localStorage.getItem(RECENTS_KEY) || "[]").filter((x) => x.id !== state.map.id);
    recents.unshift({ id: state.map.id, name: state.map.name, savedAt: Date.now() });
    localStorage.setItem(RECENTS_KEY, JSON.stringify(recents.slice(0, 10)));
    setStatus("Map saved to localStorage.");
  }
  function loadMap() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) { setStatus("No saved map found."); return; }
    state.map = ensureLayers(JSON.parse(raw)); state.selectedObjectId = null; renderProperties(); draw(); setStatus("Saved map loaded.");
  }
  function exportMap() {
    const blob = new Blob([JSON.stringify(state.map, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${state.map.id || "dungeon"}.json`; a.click(); URL.revokeObjectURL(a.href);
    setStatus("Dungeon JSON exported.");
  }
  function validateMap(show = true) {
    const warnings = [];
    if (!state.map.layers.floor.length) warnings.push("No floor tiles placed.");
    if (!state.map.layers.player_spawn.length && !state.map.playerSpawn) warnings.push("No player spawn placed.");
    if (!state.map.layers.enemy_spawn.length) warnings.push("No enemy spawns placed.");
    if (!state.map.layers.boss_spawn.length) warnings.push("No boss spawn placed.");
    if (!state.map.layers.chest.length) warnings.push("No chest placed.");
    if (!state.map.layers.exit.length) warnings.push("No exit placed.");
    const unknownAssets = [];
    for (const l of layerOrder) for (const o of state.map.layers[l]) if (o.assetKey && !ASSETS.some((a) => a.id === o.assetKey)) unknownAssets.push(o.assetKey);
    if (unknownAssets.length) warnings.push(`Unknown asset keys: ${[...new Set(unknownAssets)].join(", ")}`);
    if (show) setStatus(warnings.length ? `Validation warnings: ${warnings.join(" | ")}` : "Validation OK. Map has all key gameplay markers.");
    return warnings;
  }
  function savePlaytest() {
    const warnings = validateMap(false);
    localStorage.setItem(PLAYTEST_KEY, JSON.stringify(state.map));
    setStatus(warnings.length ? `Playtest JSON saved with warnings: ${warnings.join(" | ")}` : "Playtest JSON saved to localStorage. Key: mmoisekai-playtest-dungeon");
  }
  function importFile(file) {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => { try { state.map = ensureLayers(JSON.parse(r.result)); state.selectedObjectId = null; renderProperties(); draw(); setStatus("Imported JSON map."); } catch { setStatus("Import failed: invalid JSON."); } };
    r.readAsText(file);
  }
  importInput?.addEventListener("change", (e) => importFile(e.target.files?.[0]));

  function loadTemplate(id) {
    if (!id) return;
    fetch(`assets/dungeon_pack/custom_dungeons/${id}.json`).then((r) => {
      if (!r.ok) throw new Error("not found");
      return r.json();
    }).then((json) => { snapshot(); state.map = ensureLayers(json); state.selectedObjectId = null; renderProperties(); draw(); setStatus(`${json.name} template loaded.`); }).catch(() => setStatus(`Template ${id} could not be loaded. Run through local server, not file://.`));
  }

  document.getElementById("new-map").addEventListener("click", () => { snapshot(); state.map = defaultMap(); state.selectedObjectId = null; renderProperties(); draw(); setStatus("New empty map created."); });
  document.getElementById("save-map").addEventListener("click", saveMap);
  document.getElementById("load-map").addEventListener("click", loadMap);
  document.getElementById("export-map").addEventListener("click", exportMap);
  document.getElementById("import-map").addEventListener("click", () => importInput.click());
  document.getElementById("validate-map").addEventListener("click", () => validateMap(true));
  document.getElementById("playtest-map").addEventListener("click", savePlaytest);
  document.getElementById("template-select").addEventListener("change", (e) => loadTemplate(e.target.value));

  function initMap() {
    state.map = defaultMap();
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { state.map = ensureLayers(JSON.parse(saved)); setStatus("Saved editor map restored."); } catch { setStatus("Saved editor map was invalid; started new map."); }
    }
  }

  loadImages().then(() => { initMap(); renderToolbar(); renderPalette(); renderProperties(); resizeCanvas(); renderStatus(); });
})();
