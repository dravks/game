class DungeonEditorScene extends Phaser.Scene {
  constructor() {
    super("DungeonEditorScene");
    this.gridSize = 48;
    this.currentLayer = "floor";
    this.selectedAsset = null;
    this.selectedObject = null;
    this.currentTool = "paint"; // paint, erase, select
    this.zoomLevel = 1;
    this.isPanning = false;
    this.panStart = new Phaser.Math.Vector2();
    
    this.mapData = {
      id: "custom_dungeon_" + Date.now(),
      name: "New Custom Dungeon",
      description: "A custom dungeon created in the editor.",
      width: 3000,
      height: 1600,
      gridSize: 48,
      theme: {
        backgroundColor: "#10131a",
        floorTint: "0x334455",
        wallTint: "0x0a0c10",
        ambientTint: "0x223344"
      },
      playerSpawn: { x: 300, y: 600 },
      layers: {
        floor: [],
        wall: [],
        prop: [],
        decoration: [],
        collision: [],
        enemy_spawn: [],
        boss_spawn: [],
        chest: [],
        exit: [],
        trigger: []
      }
    };
    
    this.objectPool = [];
    this.history = [];
    this.redoStack = [];
  }

  preload() {
    // Load UI Assets
    this.load.image("editor_grid", "assets/ui/kenney/panel_main.png"); // placeholder
    
    // Preload assets from catalog
    // Note: We'll assume the catalog is globally available via script tag
    if (window.EDITOR_ASSET_CATALOG) {
      const catalog = window.EDITOR_ASSET_CATALOG;
      Object.values(catalog).forEach(category => {
        category.forEach(asset => {
          if (asset.assetPath) {
            this.load.image(asset.key, asset.assetPath);
          }
        });
      });
    }
  }

  create() {
    const { width, height } = this.scale;
    
    // Set World Bounds
    this.cameras.main.setBounds(-5000, -5000, 10000, 10000);
    this.cameras.main.setZoom(this.zoomLevel);
    this.cameras.main.centerOn(300, 600);

    // Create Grid
    this.gridGraphics = this.add.graphics();
    this.drawGrid();

    // Layers containers
    this.layerContainers = {};
    const layerNames = ["floor", "wall", "prop", "decoration", "collision", "enemy_spawn", "boss_spawn", "player_spawn", "chest", "exit", "trigger"];
    layerNames.forEach((name, index) => {
      this.layerContainers[name] = this.add.container(0, 0).setDepth(index);
    });

    // Preview cursor
    this.cursorPreview = this.add.image(0, 0, "").setAlpha(0.5).setVisible(false);
    
    // Selection Rect
    this.selectionRect = this.add.rectangle(0, 0, this.gridSize, this.gridSize, 0xffffff, 0)
      .setStrokeStyle(2, 0xffff00)
      .setVisible(false)
      .setDepth(100);

    // Input Handling
    this.createInput();
    
    // UI (DOM-based overlay is easier for editors)
    this.createUI();
    
    // Load from localStorage if exists
    this.loadFromLocalStorage();
  }

  drawGrid() {
    this.gridGraphics.clear();
    this.gridGraphics.lineStyle(1, 0x333333, 0.5);
    
    const worldW = 5000;
    const worldH = 5000;
    const grid = this.gridSize;

    for (let x = -worldW; x <= worldW; x += grid) {
      this.gridGraphics.moveTo(x, -worldH);
      this.gridGraphics.lineTo(x, worldH);
    }
    for (let y = -worldH; y <= worldH; y += grid) {
      this.gridGraphics.moveTo(-worldW, y);
      this.gridGraphics.lineTo(worldW, y);
    }
    this.gridGraphics.strokePath();
    this.gridGraphics.setDepth(-1);
  }

  createInput() {
    // Camera Pan (Middle Mouse or WASD)
    this.input.on("pointerdown", (pointer) => {
      if (pointer.middleButtonDown()) {
        this.isPanning = true;
        this.panStart.set(pointer.x, pointer.y);
      } else if (pointer.leftButtonDown()) {
        if (this.currentTool === "paint" && this.selectedAsset) {
          this.placeObjectAtCursor();
        } else if (this.currentTool === "select") {
          this.selectObjectAtCursor();
        } else if (this.currentTool === "erase") {
          this.eraseObjectAtCursor();
        }
      } else if (pointer.rightButtonDown()) {
        this.eraseObjectAtCursor();
      }
    });

    this.input.on("pointermove", (pointer) => {
      if (this.isPanning) {
        const dx = (this.panStart.x - pointer.x) / this.zoomLevel;
        const dy = (this.panStart.y - pointer.y) / this.zoomLevel;
        this.cameras.main.scrollX += dx;
        this.cameras.main.scrollY += dy;
        this.panStart.set(pointer.x, pointer.y);
      }

      // Update cursor preview
      if (this.selectedAsset) {
        const worldPos = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        const snapped = this.snapToGrid(worldPos.x, worldPos.y);
        this.cursorPreview.setPosition(snapped.x, snapped.y);
        this.cursorPreview.setVisible(true);
        if (this.cursorPreview.texture.key !== this.selectedAsset.key) {
           this.cursorPreview.setTexture(this.selectedAsset.key);
        }
      } else {
        this.cursorPreview.setVisible(false);
      }
      
      // Paint continuously if Shift is held
      if (pointer.leftButtonDown() && this.selectedAsset && this.input.keyboard.addKey("SHIFT").isDown) {
        this.placeObjectAtCursor();
      }
    });

    this.input.on("pointerup", (pointer) => {
      if (pointer.middleButtonReleased()) {
        this.isPanning = false;
      }
    });

    // Zoom
    this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      if (deltaY > 0) {
        this.zoomLevel = Math.max(0.2, this.zoomLevel - 0.1);
      } else {
        this.zoomLevel = Math.min(3, this.zoomLevel + 0.1);
      }
      this.cameras.main.setZoom(this.zoomLevel);
    });

    // Keybindings
    this.input.keyboard.on("keydown-G", () => {
      this.gridGraphics.setVisible(!this.gridGraphics.visible);
    });
    
    this.input.keyboard.on("keydown-S", () => this.saveToLocalStorage());
    this.input.keyboard.on("keydown-E", () => this.exportJSON());
    this.input.keyboard.on("keydown-I", () => document.getElementById("editor-import-input").click());
    
    // WASD Panning
    this.wasd = this.input.keyboard.addKeys("W,A,S,D");
  }

  update() {
    const panSpeed = 10 / this.zoomLevel;
    if (this.wasd.W.isDown) this.cameras.main.scrollY -= panSpeed;
    if (this.wasd.S.isDown) this.cameras.main.scrollY += panSpeed;
    if (this.wasd.A.isDown) this.cameras.main.scrollX -= panSpeed;
    if (this.wasd.D.isDown) this.cameras.main.scrollX += panSpeed;
  }

  snapToGrid(x, y) {
    const gs = this.gridSize;
    return {
      x: Math.round(x / gs) * gs,
      y: Math.round(y / gs) * gs,
      gridX: Math.round(x / gs),
      gridY: Math.round(y / gs)
    };
  }

  placeObjectAtCursor() {
    if (!this.selectedAsset) return;
    
    const pointer = this.input.activePointer;
    const worldPos = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const snapped = this.snapToGrid(worldPos.x, worldPos.y);
    
    // Check if object already exists at this spot on this layer (prevent duplicates)
    const layer = this.currentLayer;
    const existing = this.mapData.layers[layer].find(obj => obj.gridX === snapped.gridX && obj.gridY === snapped.gridY);
    if (existing) return;

    const newObj = {
      id: "obj_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      type: this.selectedAsset.type,
      layer: layer,
      assetKey: this.selectedAsset.key,
      x: snapped.x,
      y: snapped.y,
      gridX: snapped.gridX,
      gridY: snapped.gridY,
      rotation: 0,
      scale: 1,
      flipX: false,
      flipY: false,
      depth: this.layerContainers[layer].depth,
      collision: this.selectedAsset.isWall || false,
      metadata: this.selectedAsset.enemyId ? { enemyId: this.selectedAsset.enemyId, count: 3, phaseId: 1 } : {}
    };

    this.mapData.layers[layer].push(newObj);
    this.addObjectToScene(newObj);
    
    if (layer === "player_spawn") {
      this.mapData.playerSpawn = { x: snapped.x, y: snapped.y };
      // Remove other player spawns
      this.mapData.layers.player_spawn = [newObj];
      this.objectPool.filter(img => img.data.get("layer") === "player_spawn" && img.data.get("id") !== newObj.id).forEach(img => img.destroy());
      this.objectPool = this.objectPool.filter(img => !(img.data.get("layer") === "player_spawn" && img.data.get("id") !== newObj.id));
    }

    this.history.push({ type: "place", object: newObj });
    this.redoStack = [];
    this.updatePropertiesPanel();
  }

  selectObjectAtCursor() {
    const pointer = this.input.activePointer;
    const worldPos = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const snapped = this.snapToGrid(worldPos.x, worldPos.y);
    
    // Find object at this spot (top-most layer first)
    const layerOrder = ["exit", "chest", "boss_spawn", "enemy_spawn", "decoration", "prop", "wall", "floor"];
    let found = null;
    for (const layer of layerOrder) {
      found = this.mapData.layers[layer].find(obj => obj.gridX === snapped.gridX && obj.gridY === snapped.gridY);
      if (found) break;
    }

    this.selectedObject = found;
    if (found) {
      this.selectionRect.setPosition(found.x, found.y).setVisible(true);
    } else {
      this.selectionRect.setVisible(false);
    }
    this.updatePropertiesPanel();
  }

  addObjectToScene(objData) {
    const img = this.add.image(objData.x, objData.y, objData.assetKey);
    img.setScale(objData.scale);
    img.setRotation(objData.rotation);
    img.setFlipX(objData.flipX);
    img.setFlipY(objData.flipY);
    img.setData("id", objData.id);
    img.setData("layer", objData.layer);
    
    this.layerContainers[objData.layer].add(img);
    this.objectPool.push(img);
  }

  eraseObjectAtCursor() {
    const pointer = this.input.activePointer;
    const worldPos = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const snapped = this.snapToGrid(worldPos.x, worldPos.y);
    const layer = this.currentLayer;
    
    const index = this.mapData.layers[layer].findIndex(obj => obj.gridX === snapped.gridX && obj.gridY === snapped.gridY);
    if (index !== -1) {
      const removed = this.mapData.layers[layer].splice(index, 1)[0];
      const visual = this.objectPool.find(img => img.getData("id") === removed.id);
      if (visual) {
        visual.destroy();
        this.objectPool = this.objectPool.filter(v => v !== visual);
      }
      this.history.push({ type: "erase", object: removed });
    }
  }

  createUI() {
    // We'll use DOM for the UI overlay as it's much easier to build complex editor UIs
    const uiContainer = document.createElement("div");
    uiContainer.id = "editor-ui-overlay";
    uiContainer.style.position = "absolute";
    uiContainer.style.top = "0";
    uiContainer.style.left = "0";
    uiContainer.style.width = "100%";
    uiContainer.style.height = "100%";
    uiContainer.style.pointerEvents = "none";
    uiContainer.innerHTML = `
      <div style="position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.85); color: white; padding: 15px; pointer-events: auto; border: 1px solid #555; border-radius: 8px; width: 220px;">
        <h2 style="margin: 0 0 10px 0; color: #f4df9c;">Dungeon Editor</h2>
        
        <div style="margin-bottom: 10px;">
          <button id="tool-paint" class="tool-btn active">Paint</button>
          <button id="tool-select" class="tool-btn">Select</button>
          <button id="tool-erase" class="tool-btn">Erase</button>
        </div>

        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; color: #aaa;">LAYER</label><br/>
          <select id="layer-select" style="width: 100%; background: #222; color: white; border: 1px solid #444; padding: 4px;">
            <option value="floor">Floor</option>
            <option value="wall">Wall</option>
            <option value="prop">Prop</option>
            <option value="decoration">Decoration</option>
            <option value="collision">Collision</option>
            <option value="enemy_spawn">Enemy Spawn</option>
            <option value="boss_spawn">Boss Spawn</option>
            <option value="player_spawn">Player Spawn</option>
            <option value="chest">Chest</option>
            <option value="exit">Exit</option>
          </select>
        </div>

        <div id="asset-palette" style="margin-top: 10px; max-height: 250px; overflow-y: auto; background: #111; padding: 5px; border: 1px solid #333;">
          <!-- Assets will be populated here -->
        </div>

        <hr style="border: 0; border-top: 1px solid #444; margin: 15px 0;"/>
        
        <div class="footer-actions" style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
          <button id="settings-btn" style="background: #34495e; color: white; border: none; padding: 8px; grid-column: span 2;">Dungeon Settings</button>
          <button id="save-btn" style="background: #34495e; color: white; border: none; padding: 8px;">Save</button>
          <button id="export-btn" style="background: #34495e; color: white; border: none; padding: 8px;">Export</button>
          <button id="import-btn" style="background: #34495e; color: white; border: none; padding: 8px;">Import</button>
          <button id="playtest-btn" style="background: #27ae60; color: white; border: none; padding: 8px; font-weight: bold;">PLAY</button>
        </div>
      </div>

      <div id="settings-panel" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.85); color: white; padding: 15px; pointer-events: auto; border: 1px solid #555; border-radius: 8px; width: 250px; display: none;">
        <h3 style="margin: 0 0 10px 0; color: #f4df9c;">Dungeon Settings</h3>
        <div style="font-size: 11px;">
          <label>Dungeon ID:</label><br/>
          <input type="text" id="set-id" style="width: 100%; background: #222; color: white; border: 1px solid #444; margin-bottom: 8px;">
          <label>Display Name:</label><br/>
          <input type="text" id="set-name" style="width: 100%; background: #222; color: white; border: 1px solid #444; margin-bottom: 8px;">
          <label>Description:</label><br/>
          <textarea id="set-desc" style="width: 100%; background: #222; color: white; border: 1px solid #444; height: 60px; margin-bottom: 8px;"></textarea>
          <label>Grid Size:</label><br/>
          <input type="number" id="set-grid" style="width: 100%; background: #222; color: white; border: 1px solid #444; margin-bottom: 8px;">
          <button id="set-apply-btn" style="width: 100%; background: #2c3e50; color: white; border: 1px solid #444; padding: 5px; margin-top: 5px;">Update Metadata</button>
          <button id="set-close-btn" style="width: 100%; background: #555; color: white; border: none; padding: 5px; margin-top: 5px;">Close</button>
        </div>
      </div>

      <div id="properties-panel" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.85); color: white; padding: 15px; pointer-events: auto; border: 1px solid #555; border-radius: 8px; width: 220px; display: none;">
        <h3 style="margin: 0 0 10px 0; color: #f4df9c;">Properties</h3>
        <div id="prop-content"></div>
      </div>

      <style>
        .tool-btn { background: #2c3e50; color: white; border: 1px solid #444; padding: 5px 8px; cursor: pointer; font-size: 12px; }
        .tool-btn.active { background: #d4af37; color: black; border-color: #f4df9c; }
        .tool-btn:hover { background: #34495e; }
        h4 { margin: 10px 0 5px 0; font-size: 12px; color: #888; text-transform: uppercase; }
        #asset-palette button { background: #222; color: #ddd; border: 1px solid #333; padding: 6px; text-align: left; font-size: 11px; margin-bottom: 2px; }
        #asset-palette button:hover { background: #333; }
        #asset-palette button.selected { background: #34495e; border-color: #5dade2; color: white; }
      </style>

      <div id="status-bar" style="position: absolute; bottom: 10px; left: 10px; background: rgba(0,0,0,0.8); color: white; padding: 8px; border-radius: 4px; font-size: 12px; border: 1px solid #444;">
        Layer: floor | Zoom: 1.0 | Grid: 48
      </div>
    `;
    document.body.appendChild(uiContainer);

    // Populate Palette
    const palette = document.getElementById("asset-palette");
    if (window.EDITOR_ASSET_CATALOG) {
      Object.entries(window.EDITOR_ASSET_CATALOG).forEach(([cat, assets]) => {
        const catTitle = document.createElement("h4");
        catTitle.innerText = cat.charAt(0).toUpperCase() + cat.slice(1);
        palette.appendChild(catTitle);
        
        assets.forEach(asset => {
          const btn = document.createElement("button");
          btn.innerText = asset.label;
          btn.style.display = "block";
          btn.style.width = "100%";
          btn.style.marginBottom = "2px";
          btn.style.cursor = "pointer";
          btn.onclick = () => {
             this.selectedAsset = asset;
             palette.querySelectorAll("button").forEach(b => b.style.background = "");
             btn.style.background = "#555";
          };
          palette.appendChild(btn);
        });
      });
    }

    document.getElementById("layer-select").onchange = (e) => {
      this.currentLayer = e.target.value;
      this.updateStatus();
    };

    const setTool = (tool) => {
      this.currentTool = tool;
      document.querySelectorAll(".tool-btn").forEach(b => b.classList.remove("active"));
      document.getElementById("tool-" + tool).classList.add("active");
    };

    document.getElementById("tool-paint").onclick = () => setTool("paint");
    document.getElementById("tool-select").onclick = () => setTool("select");
    document.getElementById("tool-erase").onclick = () => setTool("erase");
    
    document.getElementById("settings-btn").onclick = () => this.toggleSettingsPanel();
    document.getElementById("save-btn").onclick = () => this.saveToLocalStorage();
    document.getElementById("export-btn").onclick = () => this.exportJSON();
    document.getElementById("import-btn").onclick = () => document.getElementById("editor-import-input").click();
    document.getElementById("playtest-btn").onclick = () => this.playtestDungeon();
    
    document.getElementById("set-close-btn").onclick = () => this.toggleSettingsPanel(false);
    document.getElementById("set-apply-btn").onclick = () => {
      this.mapData.id = document.getElementById("set-id").value;
      this.mapData.name = document.getElementById("set-name").value;
      this.mapData.description = document.getElementById("set-desc").value;
      this.mapData.gridSize = parseInt(document.getElementById("set-grid").value);
      this.flashBanner("Dungeon metadata updated.");
    };
  }

  toggleSettingsPanel(force) {
    const panel = document.getElementById("settings-panel");
    const isVisible = force !== undefined ? force : (panel.style.display === "none");
    panel.style.display = isVisible ? "block" : "none";
    
    if (isVisible) {
      document.getElementById("properties-panel").style.display = "none";
      document.getElementById("set-id").value = this.mapData.id;
      document.getElementById("set-name").value = this.mapData.name;
      document.getElementById("set-desc").value = this.mapData.description;
      document.getElementById("set-grid").value = this.mapData.gridSize;
    }
  }

  updatePropertiesPanel() {
    const panel = document.getElementById("properties-panel");
    const content = document.getElementById("prop-content");
    
    if (!this.selectedObject) {
      panel.style.display = "none";
      return;
    }

    panel.style.display = "block";
    const obj = this.selectedObject;
    
    content.innerHTML = `
      <div style="font-size: 11px;">
        <p><strong>ID:</strong> ${obj.id}</p>
        <p><strong>Asset:</strong> ${obj.assetKey}</p>
        <p><strong>Grid:</strong> ${obj.gridX}, ${obj.gridY}</p>
        <div style="margin-top:10px;">
          <label>Scale:</label>
          <input type="number" step="0.1" value="${obj.scale}" id="prop-scale" style="width: 50px; background: #222; color: white; border: 1px solid #444;">
        </div>
        <div style="margin-top:5px;">
          <label>Rotation:</label>
          <input type="number" step="1" value="${Math.round(Phaser.Math.RadToDeg(obj.rotation))}" id="prop-rotation" style="width: 50px; background: #222; color: white; border: 1px solid #444;">
        </div>
        <div style="margin-top:5px;">
          <label><input type="checkbox" ${obj.flipX ? "checked" : ""} id="prop-flipx"> Flip X</label>
        </div>
        <div style="margin-top:5px;">
          <label><input type="checkbox" ${obj.collision ? "checked" : ""} id="prop-collision"> Collision</label>
        </div>
        ${obj.type === "enemySpawn" ? `
          <div style="margin-top:10px; border-top: 1px solid #333; padding-top: 5px;">
            <label>Enemy ID:</label>
            <input type="text" value="${obj.metadata.enemyId || ""}" id="prop-enemy-id" style="width: 80px; background: #222; color: white; border: 1px solid #444;">
            <br/>
            <label>Count:</label>
            <input type="number" value="${obj.metadata.count || 1}" id="prop-enemy-count" style="width: 40px; background: #222; color: white; border: 1px solid #444;">
            <br/>
            <label>Phase:</label>
            <input type="number" value="${obj.metadata.phaseId || 1}" id="prop-phase" style="width: 40px; background: #222; color: white; border: 1px solid #444;">
          </div>
        ` : ""}
        <button id="prop-update-btn" style="margin-top: 15px; width: 100%; background: #2c3e50; color: white; border: 1px solid #444; padding: 5px;">Apply Changes</button>
        <button id="prop-delete-btn" style="margin-top: 5px; width: 100%; background: #922b21; color: white; border: none; padding: 5px;">Delete Object</button>
      </div>
    `;

    document.getElementById("prop-update-btn").onclick = () => {
      obj.scale = parseFloat(document.getElementById("prop-scale").value);
      obj.rotation = Phaser.Math.DegToRad(parseFloat(document.getElementById("prop-rotation").value));
      obj.flipX = document.getElementById("prop-flipx").checked;
      obj.collision = document.getElementById("prop-collision").checked;
      
      if (obj.type === "enemySpawn") {
        obj.metadata.enemyId = document.getElementById("prop-enemy-id").value;
        obj.metadata.count = parseInt(document.getElementById("prop-enemy-count").value);
        obj.metadata.phaseId = parseInt(document.getElementById("prop-phase").value);
      }
      
      this.refreshVisual(obj);
      this.flashBanner("Object updated.");
    };

    document.getElementById("prop-delete-btn").onclick = () => {
      this.deleteObject(obj);
      this.selectedObject = null;
      this.selectionRect.setVisible(false);
      this.updatePropertiesPanel();
    };
  }

  refreshVisual(objData) {
    const visual = this.objectPool.find(img => img.getData("id") === objData.id);
    if (visual) {
      visual.setScale(objData.scale);
      visual.setRotation(objData.rotation);
      visual.setFlipX(objData.flipX);
    }
  }

  deleteObject(objData) {
    const layer = objData.layer;
    this.mapData.layers[layer] = this.mapData.layers[layer].filter(o => o.id !== objData.id);
    const visual = this.objectPool.find(img => img.getData("id") === objData.id);
    if (visual) {
      visual.destroy();
      this.objectPool = this.objectPool.filter(v => v !== visual);
    }
  }

  flashBanner(msg) {
    const status = document.getElementById("status-bar");
    const original = status.innerText;
    status.innerText = msg;
    status.style.background = "#27ae60";
    setTimeout(() => {
      status.innerText = original;
      status.style.background = "rgba(0,0,0,0.8)";
    }, 2000);
  }

  updateStatus() {
    const status = document.getElementById("status-bar");
    if (status) {
      status.innerText = `Layer: ${this.currentLayer} | Zoom: ${this.zoomLevel.toFixed(1)} | Grid: ${this.gridSize}`;
    }
  }

  saveToLocalStorage() {
    localStorage.setItem(GameState.EDITOR_STORAGE_KEY + "-map", JSON.stringify(this.mapData));
    alert("Map saved to localStorage!");
  }

  loadFromLocalStorage() {
    const saved = localStorage.getItem(GameState.EDITOR_STORAGE_KEY + "-map");
    if (saved) {
      this.loadMapData(JSON.parse(saved));
    }
  }

  loadMapData(data) {
    // Clear current scene
    this.objectPool.forEach(obj => obj.destroy());
    this.objectPool = [];
    
    this.mapData = data;
    Object.values(this.mapData.layers).forEach(layer => {
      layer.forEach(obj => this.addObjectToScene(obj));
    });
  }

  exportJSON() {
    const blob = new Blob([JSON.stringify(this.mapData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${this.mapData.id}.json`;
    link.click();
  }

  playtestDungeon() {
    const validation = this.validateMap();
    if (!validation.ok) {
      alert("Validation Warnings:\n" + validation.warnings.join("\n"));
      if (validation.critical) return;
    }
    
    localStorage.setItem("mmoisekai-playtest-dungeon", JSON.stringify(this.mapData));
    window.location.href = "index.html?playtest=true";
  }

  validateMap() {
    const warnings = [];
    let ok = true;
    let critical = false;

    if (this.mapData.layers.player_spawn.length === 0) {
      warnings.push("- Missing Player Spawn!");
      ok = false;
      critical = true;
    }
    if (this.mapData.layers.boss_spawn.length === 0) {
      warnings.push("- No Boss Spawn placed.");
      ok = false;
    }
    if (this.mapData.layers.exit.length === 0) {
      warnings.push("- No Exit Portal placed.");
      ok = false;
    }
    if (this.mapData.layers.floor.length === 0) {
      warnings.push("- No floor tiles placed.");
    }

    return { ok, critical, warnings };
  }
}

window.DungeonEditorScene = DungeonEditorScene;
