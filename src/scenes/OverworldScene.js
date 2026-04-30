class OverworldScene extends Phaser.Scene {
  constructor() {
    super("OverworldScene");
    this.mobs = [];
    this.decorationColliders = null;
    this.playerFacing = new Phaser.Math.Vector2(1, 0);
    this.currentHp = 100;
    this.currentMp = 40;
    this.classSkillReadyAt = 0;
    this.skillReadyAtById = {};
    this.fieldName = "Amasra";
    this.kingSlimeSpawned = false;
    this.fieldDrops = [];
    this.petSummoned = false;
    this.pet = null;
    this.lastPetToggleAt = 0;
    this.mercenary = null;
  }

  preload() {
    this.load.spritesheet("player_idle_sheet", "assets/sprites/units/player_idle.png", { frameWidth: 192, frameHeight: 192 });
    this.load.spritesheet("player_run_sheet", "assets/sprites/units/player_run.png", { frameWidth: 192, frameHeight: 192 });
    this.loadClassAndPetImages();
    this.loadOverworldTinySwordsAssets();

    // CraftPix-style top-down slime spritesheets. Each sheet is 384x256, 64x64 frames.
    // The folder name contains a space, so URLs are encoded with %20 for safer browser loading.
    const slimePath = "slime%20assets/Tiled_files/";
    [1, 2, 3].forEach((variant) => {
      ["Idle", "Walk", "Run", "Attack", "Hurt", "Death"].forEach((anim) => {
        this.load.spritesheet(
          `slime${variant}_${anim.toLowerCase()}`,
          `${slimePath}Slime${variant}_${anim}_full.png`,
          { frameWidth: 64, frameHeight: 64 }
        );
      });
    });
  }

  create() {
    const width = 4600;
    const height = 2400;
    this.physics.world.setBounds(0, 0, width, height);
    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.setBackgroundColor("#183926");
    window.GameState?.attachAutoSave?.(this, this.registry);
    window.GameState?.initHotbarSlots?.(this.registry);
    this.currentHp = window.GameState?.getMaxHp?.(this.registry) || 100;
    this.currentMp = window.GameState?.getMaxMp?.(this.registry) || 40;

    this.createAnimations();
    this.drawField(width, height);
    this.createPlayer(260, height / 2);
    this.createMercenaryCompanion();
    this.createInput();

    this.uiManager = new UIManager(this);
    this.uiManager.init();
    this.uiManager.drawUiLayer(this.scale.width, this.scale.height);
    this.createHud();
    this.drawOverworldMinimapZones();
    this.drawOverworldHotbarFrame();
    this.spawnFieldMobs();

    this.input.on("pointerdown", (pointer) => {
      if (pointer.button !== 0 || this.isAnyPanelOpen()) return;
      if (pointer.y > this.scale.height - 120) return;
      this.basicAttack(pointer);
    });

    this.refreshCityUi();
    this.showCityBanner("Amasra", "Slime field discovered");
  }

  createPlayer(x, y) {
    const classTexture = this.getClassPlayerTextureKey(this.playerFacing);
    this.player = classTexture
      ? this.physics.add.sprite(x, y, classTexture).setScale(1).setDepth(20)
      : this.physics.add.sprite(x, y, "player_idle_sheet", 0).setScale(0.32).setDepth(20);
    if (classTexture) {
      this.player.setDisplaySize(44, 44);
      this.player.body.setSize(30, 30).setOffset(7, 7);
    } else {
      this.player.body.setSize(42, 42).setOffset(76, 120);
    }
    this.player.body.setCollideWorldBounds(true);
    if (this.decorationColliders) this.physics.add.collider(this.player, this.decorationColliders);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.playerSpeed = window.GameState?.getPlayerSpeed?.(this.registry) || 180;
    this.setClassPlayerTexture(this.playerFacing);
  }

  createInput() {
    this.keys = this.input.keyboard.addKeys({
      up: "W", down: "S", left: "A", right: "D",
      w: "W", a: "A", s: "S", d: "D",
      returnCity: "E", attack: "SPACE", close: "ESC",
      inventory: "I", skills: "K", character: "C", questList: "Q", pet: "P",
      slot1: "ONE", slot2: "TWO", slot3: "THREE", slot4: "FOUR", slot5: "FIVE", slot6: "SIX",
    });
    [1, 2, 3, 4, 5, 6].forEach((slot) => {
      this.input.keyboard.on(`keydown-${slot}`, () => this.useHotbarSlot(slot - 1));
    });
    this.input.keyboard.on("keydown-P", () => this.togglePet());
    this.__domOverworldKeyHandler = (event) => {
      if (!this.scene?.isActive?.("OverworldScene")) return;
      const key = event.key?.toLowerCase?.();
      if (/^[1-6]$/.test(event.key)) {
        if (document.activeElement === this.game?.canvas) return;
        this.useHotbarSlot(Number(event.key) - 1);
        event.preventDefault();
      }
      if (["i", "c", "k", "q"].includes(key)) {
        if (document.activeElement === this.game?.canvas) return;
        const map = {
          i: () => this.uiManager?.toggleInventoryPanel?.(),
          c: () => this.uiManager?.toggleCharacterPanel?.(),
          k: () => this.uiManager?.toggleSkillPanel?.(),
          q: () => this.uiManager?.toggleQuestList?.(),
        };
        map[key]?.();
        event.preventDefault();
      }
      if (key === "p") {
        this.togglePet();
        event.preventDefault();
      }
    };
    window.addEventListener("keydown", this.__domOverworldKeyHandler);
    this.events.once("shutdown", () => {
      if (this.__domOverworldKeyHandler) window.removeEventListener("keydown", this.__domOverworldKeyHandler);
      this.__domOverworldKeyHandler = null;
    });
  }

  createAnimations() {
    if (!this.anims.exists("overworld-player-idle")) {
      this.anims.create({ key: "overworld-player-idle", frames: this.anims.generateFrameNumbers("player_idle_sheet", { start: 0, end: 7 }), frameRate: 8, repeat: -1 });
    }
    if (!this.anims.exists("overworld-player-run")) {
      this.anims.create({ key: "overworld-player-run", frames: this.anims.generateFrameNumbers("player_run_sheet", { start: 0, end: 5 }), frameRate: 10, repeat: -1 });
    }

    [1, 2, 3].forEach((variant) => {
      [
        { name: "idle", frames: [0, 5], rate: 6, repeat: -1 },
        { name: "walk", frames: [0, 5], rate: 8, repeat: -1 },
        { name: "run", frames: [0, 5], rate: 10, repeat: -1 },
        { name: "attack", frames: [0, 5], rate: 12, repeat: 0 },
        { name: "hurt", frames: [0, 5], rate: 12, repeat: 0 },
        { name: "death", frames: [0, 5], rate: 10, repeat: 0 },
      ].forEach((cfg) => {
        const textureKey = `slime${variant}_${cfg.name}`;
        const animKey = `amasra-slime${variant}-${cfg.name}`;
        if (!this.anims.exists(animKey) && this.textures.exists(textureKey)) {
          this.anims.create({
            key: animKey,
            frames: this.anims.generateFrameNumbers(textureKey, { start: cfg.frames[0], end: cfg.frames[1] }),
            frameRate: cfg.rate,
            repeat: cfg.repeat,
          });
        }
      });
    });
  }

  loadClassAndPetImages() {
    const base = "class%20and%20cat/";
    const dirs = ["south", "south-east", "east", "north-east", "north", "north-west", "west", "south-west"];
    const folders = {
      warrior: "A_32px_low_top-down_pixel_art_fantasy_MMORPG_warri",
      mage: "A_32px_low_top-down_pixel_art_fantasy_MMORPG_mage",
      rogue: "A_32px_low_top-down_pixel_art_fantasy_MMORPG_rogue",
      archer: "A_32px_low_top-down_pixel_art_fantasy_MMORPG_arche",
    };
    Object.entries(folders).forEach(([className, folder]) => {
      dirs.forEach((dir) => this.load.image(`class_${className}_${dir}`, `${base}${folder}/rotations/${dir}.png`));
    });
    dirs.forEach((dir) => this.load.image(`pet_cat_${dir}`, `${base}kedi%20pet/rotations/${dir}.png`));
  }

  loadOverworldTinySwordsAssets() {
    const root = "Tiny%20Swords%20(Free%20Pack)/Tiny%20Swords%20(Free%20Pack)/";
    this.load.image("ow_tile_grass", `${root}Terrain/Tileset/Tilemap_color1.png`);
    this.load.image("ow_tile_meadow", `${root}Terrain/Tileset/Tilemap_color2.png`);
    this.load.image("ow_tile_dark", `${root}Terrain/Tileset/Tilemap_color3.png`);
    this.load.image("ow_water", `${root}Terrain/Tileset/Water%20Background%20color.png`);
    this.load.image("ow_water_foam", `${root}Terrain/Tileset/Water%20Foam.png`);
    this.load.image("ow_shadow", `${root}Terrain/Tileset/Shadow.png`);
    ["1", "2", "3", "4"].forEach((n) => {
      this.load.image(`ow_tree${n}`, `${root}Terrain/Resources/Wood/Trees/Tree${n}.png`);
      this.load.image(`ow_stump${n}`, `${root}Terrain/Resources/Wood/Trees/Stump%20${n}.png`);
      this.load.image(`ow_rock${n}`, `${root}Terrain/Decorations/Rocks/Rock${n}.png`);
      this.load.image(`ow_bush${n}`, `${root}Terrain/Decorations/Bushes/Bushe${n}.png`);
    });
    this.load.image("ow_wood", `${root}Terrain/Resources/Wood/Wood%20Resource/Wood%20Resource.png`);
    this.load.image("ow_gold", `${root}Terrain/Resources/Gold/Gold%20Resource/Gold_Resource.png`);
    this.load.image("ow_tool_axe", `${root}Terrain/Resources/Tools/Tool_01.png`);
    this.load.image("ow_tool_pick", `${root}Terrain/Resources/Tools/Tool_02.png`);
    this.load.image("ow_sheep", `${root}Terrain/Resources/Meat/Sheep/Sheep_Idle.png`);
    this.load.image("ow_house1", `${root}Buildings/Blue%20Buildings/House1.png`);
    this.load.image("ow_house2", `${root}Buildings/Blue%20Buildings/House2.png`);
    this.load.image("ow_tower", `${root}Buildings/Blue%20Buildings/Tower.png`);
    this.load.image("ow_barracks", `${root}Buildings/Blue%20Buildings/Barracks.png`);
    this.load.image("ow_archery", `${root}Buildings/Blue%20Buildings/Archery.png`);
  }

  drawField(width, height) {
    if (this.textures.exists("ow_tile_grass")) {
      this.add.tileSprite(width / 2, height / 2, width, height, "ow_tile_grass").setTint(0x5f8a4a).setAlpha(0.86).setDepth(0);
    } else {
      this.add.rectangle(width / 2, height / 2, width, height, 0x2f5a35).setDepth(0);
    }

    // Maradon dışı hissi: batı kapısından çıkan taş yol, güvenli kamp ve doğuya doğru tehlikeli ovalar.
    this.add.rectangle(650, height / 2, 980, height - 240, 0x436d38, 0.16).setDepth(1);
    this.add.rectangle(1830, height / 2, 1120, height - 220, 0x2d6542, 0.15).setDepth(1);
    this.add.rectangle(3260, height / 2, 1600, height - 160, 0x1e4d3c, 0.2).setDepth(1);
    this.decorationColliders = this.physics.add.staticGroup();
    this.drawRoadPath(width, height);
    this.drawRiverEdge(width, height);

    this.drawFieldDecorations(width, height);
    this.createMapBoundaryColliders(width, height);
    this.drawCityReturnGate(height);
  }

  drawRoadPath(width, height) {
    const centerY = height / 2;
    const points = [
      { x: 70, y: centerY },
      { x: 540, y: centerY - 8 },
      { x: 980, y: centerY - 130 },
      { x: 1450, y: centerY + 60 },
      { x: 2050, y: centerY - 20 },
      { x: 2750, y: centerY + 150 },
      { x: width - 540, y: centerY - 30 },
    ];
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      const len = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
      const angle = Phaser.Math.Angle.Between(a.x, a.y, b.x, b.y);
      this.add.rectangle(midX, midY + 8, len + 24, 118, 0x18120c, 0.18).setRotation(angle).setDepth(1.2);
      this.add.rectangle(midX, midY, len + 18, 86, 0xa98255, 0.56).setRotation(angle).setDepth(1.3);
      this.add.rectangle(midX, midY - 18, len + 10, 20, 0xd0b178, 0.2).setRotation(angle).setDepth(1.4);
    }
    for (let i = 0; i < 90; i++) {
      const p = Phaser.Utils.Array.GetRandom(points);
      const x = Phaser.Math.Between(Math.max(120, p.x - 320), Math.min(width - 120, p.x + 320));
      const y = p.y + Phaser.Math.Between(-58, 58);
      this.add.ellipse(x, y, Phaser.Math.Between(7, 18), Phaser.Math.Between(4, 10), 0x6d573f, 0.35).setDepth(1.5);
    }
  }

  drawRiverEdge(width, height) {
    const waterY = height - 230;
    this.add.rectangle(width / 2, waterY + 210, width, 430, 0x163f57, 0.82).setDepth(0.4);
    if (this.textures.exists("ow_water")) {
      this.add.tileSprite(width / 2, waterY + 210, width, 430, "ow_water").setTint(0x5b95a8).setAlpha(0.8).setDepth(0.5);
    }
    for (let x = 80; x < width; x += 180) {
      const y = waterY + Math.sin(x / 170) * 22;
      this.add.ellipse(x, y, 230, 56, 0x22361f, 0.42).setDepth(1.1);
      this.add.ellipse(x + 28, y + 24, 190, 38, 0x759d64, 0.2).setDepth(1.15);
      if (this.textures.exists("ow_water_foam")) {
        this.add.image(x + 40, y + 78, "ow_water_foam").setDisplaySize(120, 34).setAlpha(0.4).setDepth(1.2);
      }
    }
    this.addStaticBlock(width / 2 - 470, height - 90, width - 980, 250, "river-bank");
    this.addStaticBlock(520, height - 120, 960, 220, "river-west-bank");
    this.addStaticBlock(width - 320, height - 120, 640, 220, "river-east-bank");
    this.addStaticBlock(1850, height - 232, 620, 64, "river-left-rail");
    this.addStaticBlock(2880, height - 232, 720, 64, "river-right-rail");
  }

  drawFieldDecorations(width, height) {
    this.drawSafeZoneFences(width, height);
    this.drawOutpostCluster();
    this.drawBridgeCrossing(width, height);
    this.drawResourceCamps(width, height);
    this.drawForestBelts(width, height);
    this.drawZoneMarkers(width, height);
    this.drawSlimeNest(width, height);
  }

  drawSafeZoneFences(width, height) {
    const centerY = height / 2;
    this.add.rectangle(690, centerY, 1110, 690, 0x0b1410, 0.08).setStrokeStyle(4, 0xd2b56f, 0.26).setDepth(1.6);
    const fenceSegments = [
      { x: 410, y: 760, w: 540, h: 16, rot: 0 },
      { x: 980, y: 790, w: 430, h: 16, rot: 0.12 },
      { x: 410, y: 1660, w: 560, h: 16, rot: 0 },
      { x: 1000, y: 1635, w: 460, h: 16, rot: -0.12 },
      { x: 1220, y: 1210, w: 16, h: 500, rot: 0 },
    ];
    fenceSegments.forEach((f) => this.add.rectangle(f.x, f.y, f.w, f.h, 0x6f5031, 0.92).setRotation(f.rot).setDepth(7));
    for (let x = 185; x <= 1220; x += 86) {
      const topY = x < 900 ? 760 : 790 + (x - 900) * 0.08;
      const bottomY = x < 900 ? 1660 : 1635 - (x - 900) * 0.07;
      this.add.rectangle(x, topY, 18, 38, 0x4b351e, 0.98).setDepth(7.2);
      this.add.rectangle(x, bottomY, 18, 38, 0x4b351e, 0.98).setDepth(7.2);
    }
    this.add.text(1180, 720, "Safe Field Boundary", {
      fontSize: "12px", color: "#d7c58f", stroke: "#000", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(10);
    this.addStaticBlock(410, 760, 540, 30, "safe-fence-top-left");
    this.addStaticBlock(1000, 792, 430, 30, "safe-fence-top-right");
    this.addStaticBlock(410, 1660, 560, 30, "safe-fence-bottom-left");
    this.addStaticBlock(1000, 1635, 460, 30, "safe-fence-bottom-right");
    this.addStaticBlock(1220, 1005, 32, 230, "safe-fence-east-upper");
    this.addStaticBlock(1220, 1438, 32, 270, "safe-fence-east-lower");
  }

  drawBridgeCrossing(width, height) {
    const bridgeX = 2350;
    const bridgeY = height - 334;
    this.add.rectangle(bridgeX, bridgeY + 34, 420, 120, 0x15100b, 0.32).setDepth(2.8);
    this.add.rectangle(bridgeX, bridgeY, 420, 82, 0x7a5934, 0.96).setStrokeStyle(4, 0xd4b06a, 0.68).setDepth(3);
    for (let i = -5; i <= 5; i++) {
      this.add.rectangle(bridgeX + i * 38, bridgeY, 10, 84, 0x4e341d, 0.72).setDepth(3.2);
    }
    this.add.rectangle(bridgeX, bridgeY - 44, 440, 12, 0x3d2918, 0.96).setDepth(3.3);
    this.add.rectangle(bridgeX, bridgeY + 44, 440, 12, 0x3d2918, 0.96).setDepth(3.3);
    this.addStaticBlock(bridgeX, bridgeY - 56, 458, 18, "bridge-north-rail");
    this.addStaticBlock(bridgeX, bridgeY + 56, 458, 18, "bridge-south-rail");
    this.add.text(bridgeX, bridgeY - 86, "Old River Bridge", {
      fontSize: "13px", color: "#f0d28c", stroke: "#000", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(8);
  }

  drawOutpostCluster() {
    const buildings = [
      { key: "ow_tower", x: 340, y: 890, w: 118, h: 118, block: [80, 68] },
      { key: "ow_tower", x: 340, y: 1510, w: 118, h: 118, block: [80, 68] },
      { key: "ow_barracks", x: 640, y: 1010, w: 190, h: 132, block: [142, 76] },
      { key: "ow_archery", x: 860, y: 1435, w: 190, h: 132, block: [142, 76] },
      { key: "ow_house1", x: 1080, y: 950, w: 150, h: 112, block: [110, 64] },
      { key: "ow_house2", x: 1180, y: 1610, w: 155, h: 116, block: [112, 64] },
    ];
    buildings.forEach((b) => this.addOverworldImage(b.key, b.x, b.y, b.w, b.h, 8, true, b.block));
    this.add.rectangle(720, 1210, 1040, 620, 0x141a17, 0.08).setStrokeStyle(3, 0xb6a16a, 0.24).setDepth(1.2);
    this.add.text(780, 790, "AMASRA OUTSKIRTS", {
      fontSize: "18px", color: "#f8f1dc", stroke: "#000", strokeThickness: 4,
    }).setOrigin(0.5).setDepth(11);
    for (let i = 0; i < 10; i++) {
      this.add.rectangle(430 + i * 76, i % 2 ? 760 : 1670, 46, 16, 0x6f5031, 0.85).setDepth(7);
    }
    this.addStaticBlock(340, 890, 88, 74, "north-watchtower");
    this.addStaticBlock(340, 1510, 88, 74, "south-watchtower");
    this.addStaticBlock(640, 1038, 156, 68, "barracks-footprint");
    this.addStaticBlock(860, 1462, 156, 68, "archery-footprint");
    this.addStaticBlock(1080, 974, 124, 62, "house1-footprint");
    this.addStaticBlock(1180, 1635, 126, 62, "house2-footprint");
  }

  drawResourceCamps(width, height) {
    const campItems = [
      { key: "ow_wood", x: 1540, y: 840, w: 74, h: 58 },
      { key: "ow_tool_axe", x: 1600, y: 890, w: 38, h: 38 },
      { key: "ow_gold", x: 2850, y: 1540, w: 82, h: 70 },
      { key: "ow_tool_pick", x: 2920, y: 1592, w: 38, h: 38 },
      { key: "ow_sheep", x: 1300, y: 1510, w: 70, h: 58 },
      { key: "ow_sheep", x: 1400, y: 1570, w: 70, h: 58 },
    ];
    campItems.forEach((p) => this.addOverworldImage(p.key, p.x, p.y, p.w, p.h, 6, false));
    this.add.text(1540, 760, "Lumber Camp", { fontSize: "14px", color: "#e8d7a0", stroke: "#000", strokeThickness: 3 }).setOrigin(0.5).setDepth(9);
    this.add.text(2860, 1450, "Old Mine", { fontSize: "14px", color: "#e8d7a0", stroke: "#000", strokeThickness: 3 }).setOrigin(0.5).setDepth(9);
    this.drawMineMouth(3020, 1500);
    for (let i = 0; i < 18; i++) {
      const x = Phaser.Math.Between(1240, 1760);
      const y = Phaser.Math.Between(680, 1040);
      this.addOverworldImage(`ow_stump${Phaser.Math.Between(1, 4)}`, x, y, 34, 28, 5, false);
    }
    for (let i = 0; i < 14; i++) {
      const x = Phaser.Math.Between(2740, 3140);
      const y = Phaser.Math.Between(1430, 1710);
      this.addOverworldImage(`ow_rock${Phaser.Math.Between(1, 4)}`, x, y, 48, 42, 5, i % 4 === 0, [30, 22]);
    }
  }

  drawMineMouth(x, y) {
    this.add.ellipse(x, y + 30, 210, 80, 0x11100e, 0.42).setDepth(5.4);
    this.add.rectangle(x, y, 210, 118, 0x2c251f, 0.94).setStrokeStyle(4, 0x796044, 0.78).setDepth(5.5);
    this.add.ellipse(x, y + 24, 142, 94, 0x080807, 0.98).setDepth(5.7);
    this.add.rectangle(x - 72, y + 20, 16, 98, 0x5b3e22, 0.96).setDepth(5.9);
    this.add.rectangle(x + 72, y + 20, 16, 98, 0x5b3e22, 0.96).setDepth(5.9);
    this.add.rectangle(x, y - 28, 170, 16, 0x5b3e22, 0.96).setDepth(5.9);
    this.add.circle(x - 40, y + 22, 6, 0xffc857, 0.75).setDepth(6);
    this.add.circle(x + 36, y + 8, 4, 0xffc857, 0.45).setDepth(6);
    this.addStaticBlock(x, y + 30, 166, 92, "mine-mouth");
    this.addStaticBlock(x - 105, y + 12, 44, 100, "mine-left-rock");
    this.addStaticBlock(x + 105, y + 12, 44, 100, "mine-right-rock");
  }

  drawForestBelts(width, height) {
    const treeClusters = [
      { x: [1160, 2100], y: [160, 560], count: 34 },
      { x: [2100, 3600], y: [1850, 2190], count: 42 },
      { x: [3420, 4380], y: [170, 620], count: 34 },
      { x: [3900, 4460], y: [1380, 1840], count: 24 },
    ];
    treeClusters.forEach((cluster) => {
      for (let i = 0; i < cluster.count; i++) {
        const x = Phaser.Math.Between(cluster.x[0], cluster.x[1]);
        const y = Phaser.Math.Between(cluster.y[0], cluster.y[1]);
        const size = Phaser.Math.Between(70, 104);
        this.addOverworldImage(`ow_tree${Phaser.Math.Between(1, 4)}`, x, y, size, size, 7, i % 3 === 0, [34, 26]);
      }
    });
    for (let i = 0; i < 120; i++) {
      const x = Phaser.Math.Between(520, width - 160);
      const y = Phaser.Math.Between(180, height - 360);
      if (Phaser.Math.Distance.Between(x, y, 720, height / 2) < 430) continue;
      if (Math.abs(y - height / 2) < 95 && x < 3100) continue;
      this.addOverworldImage(`ow_bush${Phaser.Math.Between(1, 4)}`, x, y, Phaser.Math.Between(28, 46), Phaser.Math.Between(20, 34), 4, false);
    }
  }

  drawSlimeNest(width, height) {
    const nestX = width - 620;
    const nestY = height / 2;
    this.add.circle(nestX, nestY, 270, 0x153a34, 0.62).setDepth(2);
    this.add.circle(nestX, nestY, 174, 0x3a6d58, 0.3).setDepth(2.1);
    this.add.circle(nestX, nestY, 92, 0x88d273, 0.12).setDepth(2.2);
    for (let i = 0; i < 24; i++) {
      const angle = (Math.PI * 2 * i) / 24;
      const r = Phaser.Math.Between(190, 282);
      this.addOverworldImage(`ow_rock${Phaser.Math.Between(1, 4)}`, nestX + Math.cos(angle) * r, nestY + Math.sin(angle) * r, 44, 38, 5, i % 6 === 0, [28, 20]);
    }
    this.addStaticBlock(nestX - 285, nestY, 84, 360, "nest-west-rock-wall");
    this.addStaticBlock(nestX + 285, nestY, 84, 360, "nest-east-rock-wall");
    this.addStaticBlock(nestX, nestY - 285, 360, 74, "nest-north-rock-wall");
    this.add.text(nestX, nestY - 310, "KING SLIME NEST", { fontSize: "18px", color: "#d7ffc9", stroke: "#000", strokeThickness: 4 }).setOrigin(0.5).setDepth(8);
  }

  drawZoneMarkers(width, height) {
    const markers = [
      { x: 1060, y: 710, title: "Lv 1-2", subtitle: "Gate Grass", color: "#b9ff9d" },
      { x: 1640, y: 620, title: "Lv 3-4", subtitle: "Goblin Camp", color: "#9bd3ff" },
      { x: 2390, y: 520, title: "Lv 4-5", subtitle: "Wolf Woods", color: "#d7ffc9" },
      { x: 2920, y: 1410, title: "Lv 5-6", subtitle: "Mine Mouth", color: "#f0d28c" },
      { x: 3500, y: 650, title: "Lv 6-8", subtitle: "King Slime Nest", color: "#ffd36b" },
    ];
    markers.forEach((m) => {
      this.add.rectangle(m.x, m.y, 150, 48, 0x071017, 0.58).setStrokeStyle(2, 0xd7c58f, 0.45).setDepth(9);
      this.add.text(m.x, m.y - 10, m.title, { fontSize: "13px", color: m.color, stroke: "#000", strokeThickness: 3 }).setOrigin(0.5).setDepth(10);
      this.add.text(m.x, m.y + 10, m.subtitle, { fontSize: "11px", color: "#f8f1dc", stroke: "#000", strokeThickness: 2 }).setOrigin(0.5).setDepth(10);
    });
  }

  addOverworldImage(key, x, y, width, height, depth = 5, collider = false, blockSize = null) {
    if (!this.textures.exists(key)) return null;
    const shadow = this.textures.exists("ow_shadow")
      ? this.add.image(x, y + height * 0.34, "ow_shadow").setDisplaySize(width * 0.9, Math.max(18, height * 0.22)).setAlpha(0.24).setDepth(depth - 0.2)
      : this.add.ellipse(x, y + height * 0.32, width * 0.7, Math.max(16, height * 0.18), 0x000000, 0.18).setDepth(depth - 0.2);
    const img = this.add.image(x, y, key).setDisplaySize(width, height).setDepth(depth);
    if (collider) {
      const bw = blockSize?.[0] || width * 0.48;
      const bh = blockSize?.[1] || height * 0.32;
      const blocker = this.addStaticBlock(x, y + height * 0.28, bw, bh, `${key}-block`);
      img.setData("blocker", blocker);
      shadow.setData?.("blocker", blocker);
    }
    return img;
  }

  addStaticBlock(x, y, width, height, name = "block") {
    if (!this.decorationColliders) return null;
    const blocker = this.add.rectangle(x, y, width, height, 0x000000, 0).setData("blockName", name);
    this.physics.add.existing(blocker, true);
    this.decorationColliders.add(blocker);
    return blocker;
  }

  createMapBoundaryColliders(width, height) {
    this.addStaticBlock(width / 2, 24, width, 48, "north-map-edge");
    this.addStaticBlock(width / 2, height - 12, width, 24, "south-map-edge");
    this.addStaticBlock(18, height / 2 - 180, 36, height - 520, "west-edge-upper");
    this.addStaticBlock(18, height / 2 + 330, 36, height - 1040, "west-edge-lower");
    this.addStaticBlock(width - 18, height / 2, 36, height, "east-map-edge");
    this.addStaticBlock(1930, 310, 860, 170, "north-forest-mass");
    this.addStaticBlock(2840, 2050, 1280, 150, "south-forest-mass");
    this.addStaticBlock(4020, 360, 880, 160, "north-east-forest-mass");
  }

  drawCityReturnGate(height) {
    const y = height / 2;
    this.add.rectangle(78, y, 116, 260, 0x5a4530, 0.96).setStrokeStyle(4, 0xf4df9c, 0.9).setDepth(8);
    this.add.rectangle(132, y - 108, 80, 36, 0x263b50, 0.95).setStrokeStyle(2, 0xd9c883, 0.9).setDepth(9);
    this.add.rectangle(132, y + 108, 80, 36, 0x263b50, 0.95).setStrokeStyle(2, 0xd9c883, 0.9).setDepth(9);
    this.add.rectangle(162, y, 96, 168, 0x8a6a42, 0.28).setStrokeStyle(2, 0xd9c883, 0.55).setDepth(8.5);
    this.add.text(190, y - 158, "MARADON ROAD\n[E] Return", { fontSize: "16px", color: "#f8f1dc", align: "center", stroke: "#000", strokeThickness: 3 }).setOrigin(0.5).setDepth(10);
    this.addStaticBlock(78, y - 106, 116, 54, "gate-upper-wall");
    this.addStaticBlock(78, y + 106, 116, 54, "gate-lower-wall");
    this.addStaticBlock(76, y, 34, 150, "gate-west-post");
  }

  createHud() {
    const { width } = this.scale;
    this.hudText = this.add.text(20, 22, "Amasra Outskirts - Maradon Road Lv 1-8", { fontSize: "17px", color: "#f8f1dc", stroke: "#000", strokeThickness: 3 }).setScrollFactor(0).setDepth(100);
    this.feedText = this.add.text(width - 24, 22, "", { fontSize: "12px", color: "#f8d36b", align: "right", stroke: "#000", strokeThickness: 2, wordWrap: { width: 320 } }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);
    this.petButtonBg = this.add.rectangle(92, 58, 144, 30, 0x1d2d25, 0.88)
      .setStrokeStyle(2, 0xf0c48a, 0.85)
      .setScrollFactor(0)
      .setDepth(101)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.togglePet());
    this.petButtonText = this.add.text(92, 58, "[P] Loot Cat: OFF", {
      fontSize: "12px",
      color: "#f8dfb0",
      stroke: "#000",
      strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(102);
  }

  drawOverworldHotbarFrame() {
    const { width, height } = this.scale;
    const y = height - 58;
    const panelW = 404;
    this.add.rectangle(width / 2, y + 1, panelW, 82, 0x05080c, 0.48)
      .setStrokeStyle(2, 0xb49a5f, 0.36)
      .setScrollFactor(0)
      .setDepth(57);
    this.add.text(width / 2, y - 45, "Field Action Slots", {
      fontSize: "11px",
      color: "#d7c58f",
      stroke: "#000",
      strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(58);
    this.add.text(width / 2, y + 44, "Left click attack   |   1-6 skills/potions   |   right click clears slot", {
      fontSize: "10px",
      color: "#b8c5c9",
      stroke: "#000",
      strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(58);
  }

  drawOverworldMinimapZones() {
    const b = this.minimapInnerBounds;
    if (!b) return;
    const zones = [
      { x: b.x, w: b.width * 0.24, color: 0x436d38, alpha: 0.42 },
      { x: b.x + b.width * 0.24, w: b.width * 0.17, color: 0x6a7f3a, alpha: 0.44 },
      { x: b.x + b.width * 0.41, w: b.width * 0.2, color: 0x2d6542, alpha: 0.44 },
      { x: b.x + b.width * 0.61, w: b.width * 0.14, color: 0x5a4b38, alpha: 0.48 },
      { x: b.x + b.width * 0.75, w: b.width * 0.25, color: 0x1e4d3c, alpha: 0.5 },
    ];
    zones.forEach((z) => {
      this.add.rectangle(z.x + z.w / 2, b.y + b.height / 2, z.w, b.height, z.color, z.alpha)
        .setScrollFactor(0)
        .setDepth(16.2);
    });
    const roadY = b.y + b.height * 0.52;
    this.add.line(0, 0, b.x + 8, roadY, b.x + b.width - 8, roadY + 6, 0xd0b178, 0.72)
      .setOrigin(0, 0)
      .setLineWidth(3)
      .setScrollFactor(0)
      .setDepth(16.4);
    this.add.circle(b.x + b.width * 0.87, b.y + b.height * 0.5, 8, 0x88d273, 0.42)
      .setStrokeStyle(1, 0xd7ffc9, 0.55)
      .setScrollFactor(0)
      .setDepth(16.5);
  }

  spawnFieldMobs() {
    this.mobs = [];
    const zones = this.getFieldSlotDefinitions();

    zones.forEach((zone) => {
      for (let i = 0; i < zone.count; i++) {
        const def = Phaser.Utils.Array.GetRandom(zone.variants);
        const x = Phaser.Math.Between(zone.x[0], zone.x[1]);
        const y = Phaser.Math.Between(zone.y[0], zone.y[1]);
        this.createSlimeMob(x, y, { ...def, zone: zone.name, slotId: zone.id, dropTier: zone.dropTier });
      }
    });

    this.createSlimeMob(3980, 1200, { ...(window.OverworldFieldData?.miniBoss || this.getFallbackMiniBossDefinition()) });
  }

  getFieldSlotDefinitions() {
    return window.OverworldFieldData?.zones || [
      {
        id: "gate_grass",
        name: "Gate Grass",
        count: 14,
        x: [780, 1540],
        y: [760, 1660],
        dropTier: 1,
        variants: [
          { name: "Tiny Slime", level: 1, spriteVariant: 1, hp: 42, attack: 4, defense: 1, speed: 44, xp: 10, gold: [2, 5], scale: 0.62, tint: 0x9dff95 },
          { name: "Green Slime", level: 2, spriteVariant: 1, hp: 58, attack: 6, defense: 2, speed: 47, xp: 16, gold: [4, 8], scale: 0.7, tint: 0x78e56a },
        ],
      },
      {
        id: "goblin_camp",
        name: "Goblin Camp",
        count: 12,
        x: [1380, 1980],
        y: [620, 1180],
        dropTier: 3,
        variants: [
          { name: "Goblin Scout", level: 3, spriteVariant: 2, hp: 86, attack: 9, defense: 3, speed: 54, xp: 28, gold: [7, 13], scale: 0.76, tint: 0xa8d35f, rangedResist: 0.04 },
          { name: "Goblin Cutter", level: 4, spriteVariant: 2, hp: 116, attack: 12, defense: 5, speed: 48, xp: 38, gold: [10, 18], scale: 0.86, tint: 0x83b447, physicalResist: 0.06 },
        ],
      },
      {
        id: "wolf_woods",
        name: "Wolf Woods",
        count: 13,
        x: [2140, 2820],
        y: [470, 1150],
        dropTier: 4,
        variants: [
          { name: "Young Wolf", level: 4, spriteVariant: 2, hp: 126, attack: 13, defense: 5, speed: 64, xp: 42, gold: [10, 20], scale: 0.82, tint: 0xb9c5c8, rangedResist: 0.08 },
          { name: "Grey Wolf", level: 5, spriteVariant: 3, hp: 158, attack: 16, defense: 7, speed: 62, xp: 54, gold: [14, 26], scale: 0.9, tint: 0x9aa4a6, physicalResist: 0.08 },
        ],
      },
      {
        id: "mine_mouth",
        name: "Mine Mouth",
        count: 12,
        x: [2700, 3260],
        y: [1260, 1760],
        dropTier: 5,
        variants: [
          { name: "Cave Imp", level: 5, spriteVariant: 3, hp: 168, attack: 17, defense: 8, speed: 46, xp: 60, gold: [16, 31], scale: 0.9, tint: 0xc38c5a, physicalResist: 0.1 },
          { name: "Stone Imp", level: 6, spriteVariant: 3, hp: 212, attack: 19, defense: 11, speed: 40, xp: 74, gold: [20, 38], scale: 1, tint: 0x9d8a75, physicalResist: 0.16, magicResist: 0.04 },
        ],
      },
      {
        id: "king_slime_nest",
        name: "King Slime Nest",
        count: 16,
        x: [3400, 4300],
        y: [680, 1640],
        dropTier: 6,
        variants: [
          { name: "Forest Slime", level: 6, spriteVariant: 3, hp: 190, attack: 19, defense: 9, speed: 45, xp: 72, gold: [18, 34], scale: 0.94, tint: 0x65d36d, physicalResist: 0.08, magicResist: 0.04 },
          { name: "Mud Slime", level: 7, spriteVariant: 3, hp: 228, attack: 21, defense: 12, speed: 38, xp: 90, gold: [22, 42], scale: 1.02, tint: 0xa2784a, physicalResist: 0.12 },
        ],
      },
    ];
  }

  getFallbackMiniBossDefinition() {
    return {
      name: "King Slime",
      id: "king_slime",
      family: "slime",
      level: 8,
      spriteVariant: 3,
      hp: 680,
      attack: 30,
      defense: 16,
      speed: 36,
      xp: 260,
      gold: [95, 170],
      scale: 1.45,
      tint: 0xffd35a,
      physicalResist: 0.14,
      magicResist: 0.1,
      rank: "mini_boss",
      zone: "King Slime Nest",
      slotId: "king_slime_nest",
      dropTier: 7,
      isMiniBoss: true,
    };
  }

  createSlimeMob(x, y, def) {
    const variant = def.spriteVariant || 1;
    const idleTexture = `slime${variant}_idle`;
    const hasSprite = this.textures.exists(idleTexture);
    const scale = def.scale || 0.75;
    const maxHp = Math.max(1, Math.floor(def.hp || 40));
    const depth = def.isMiniBoss ? 16 : 12;

    const shadow = this.add.ellipse(x, y + 18 * scale, 48 * scale, 18 * scale, 0x000000, 0.24).setDepth(depth - 2);
    let sprite = null;
    let fallbackBody = null;

    if (hasSprite) {
      sprite = this.add.sprite(x, y, idleTexture, 0).setScale(scale).setDepth(depth).setTint(def.tint || 0xffffff);
      sprite.play(`amasra-slime${variant}-idle`, true);
    } else {
      fallbackBody = this.add.circle(x, y, 20 * scale, def.tint || 0x66cc66, 0.95).setDepth(depth);
    }

    const nameColor = def.isMiniBoss ? "#ffdf73" : "#f8f1dc";
    const label = this.add.text(x, y - 42 * scale, `${def.name} Lv${def.level || 1}`, {
      fontSize: def.isMiniBoss ? "12px" : "10px",
      color: nameColor,
      stroke: "#000",
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(depth + 2);

    const hpBarBg = this.add.rectangle(x - 22, y - 28 * scale, 44, 5, 0x000000, 0.72)
      .setOrigin(0, 0.5)
      .setDepth(depth + 1);
    const hpBarFill = this.add.rectangle(x - 21, y - 28 * scale, 42, 3, def.isMiniBoss ? 0xffd35a : 0x6df06c, 1)
      .setOrigin(0, 0.5)
      .setDepth(depth + 2);

    const mob = {
      ...def,
      id: def.id || String(def.name || "slime").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""),
      family: def.family || "slime",
      x,
      y,
      hp: maxHp,
      maxHp,
      attack: def.attack || 4,
      defense: def.defense || 0,
      physicalResist: def.physicalResist || 0,
      magicResist: def.magicResist || 0,
      speed: def.speed || 45,
      xp: def.xp || 10,
      gold: def.gold || [2, 5],
      rangedResist: def.rangedResist || 0,
      spriteVariant: variant,
      sprite,
      body: sprite || fallbackBody,
      fallbackBody,
      shadow,
      label,
      hpBarBg,
      hpBarFill,
      homeX: x,
      homeY: y,
      spawnDef: { ...def },
      aggroRadius: def.isMiniBoss ? 380 : 260,
      attackRange: def.isMiniBoss ? 64 : 48,
      leashRadius: def.isMiniBoss ? 460 : 230,
      lastHitAt: 0,
      lastAttackAt: 0,
      dead: false,
      isMoving: false,
    };
    mob.accessories = this.createMobFamilyAccessories(mob, depth, scale);

    this.mobs.push(mob);
    return mob;
  }

  createMobFamilyAccessories(mob, depth, scale) {
    const parts = [];
    if (mob.family === "goblin") {
      parts.push(this.add.triangle(mob.x - 17 * scale, mob.y - 18 * scale, 0, 14, 10, 0, 20, 14, 0xb8d46a, 0.95).setDepth(depth + 1));
      parts.push(this.add.triangle(mob.x + 17 * scale, mob.y - 18 * scale, 0, 14, 10, 0, 20, 14, 0xb8d46a, 0.95).setDepth(depth + 1));
    } else if (mob.family === "wolf") {
      parts.push(this.add.triangle(mob.x - 13 * scale, mob.y - 24 * scale, 0, 18, 10, 0, 20, 18, 0xd9dde0, 0.95).setDepth(depth + 1));
      parts.push(this.add.triangle(mob.x + 13 * scale, mob.y - 24 * scale, 0, 18, 10, 0, 20, 18, 0xd9dde0, 0.95).setDepth(depth + 1));
    } else if (mob.family === "imp") {
      parts.push(this.add.triangle(mob.x - 14 * scale, mob.y - 24 * scale, 0, 18, 10, 0, 20, 18, 0xd96b45, 0.95).setDepth(depth + 1));
      parts.push(this.add.triangle(mob.x + 14 * scale, mob.y - 24 * scale, 0, 18, 10, 0, 20, 18, 0xd96b45, 0.95).setDepth(depth + 1));
    }
    return parts;
  }

  update() {
    if (!this.player) return;

    if (Phaser.Input.Keyboard.JustDown(this.keys.close) && this.closeTopPanel()) return;

    // ESC should close panels only. Return to town is handled by E at the gate.
    if (Phaser.Input.Keyboard.JustDown(this.keys.returnCity) && this.player.x < 230) {
      this.scene.start("PrototypeScene", { returnSpawn: { x: 640, y: 90 } });
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.inventory)) this.uiManager.toggleInventoryPanel();
    if (Phaser.Input.Keyboard.JustDown(this.keys.skills)) this.uiManager.toggleSkillPanel();
    if (Phaser.Input.Keyboard.JustDown(this.keys.character)) this.uiManager.toggleCharacterPanel();
    if (Phaser.Input.Keyboard.JustDown(this.keys.questList)) this.uiManager.toggleQuestList();
    if (Phaser.Input.Keyboard.JustDown(this.keys.pet)) this.togglePet();
    for (let i = 0; i < 6; i++) {
      const key = this.keys[`slot${i + 1}`];
      if (key && Phaser.Input.Keyboard.JustDown(key)) this.useHotbarSlot(i);
    }
    this.updatePet();
    this.updateMercenaryCompanion();

    if (this.isAnyPanelOpen()) {
      this.player.body.setVelocity(0, 0);
      this.setClassPlayerTexture(this.playerFacing);
      return;
    }

    this.handleMovement();
    this.updateMobs();
    this.updateGroundDrops();
    this.updateMercenaryCompanion();
    if (Phaser.Input.Keyboard.JustDown(this.keys.attack)) this.basicAttack();
    this.refreshCityUi();
  }

  isAnyPanelOpen() {
    return !!this.uiManager?.panelManager?.isAnyBlockingOpen?.();
  }

  closeTopPanel() {
    const panels = this.uiManager?.panelManager?.panels;
    if (panels instanceof Map) return this.uiManager.panelManager.closeActive();
    for (const key of ["inventory", "character", "skills", "quests"]) {
      const panel = panels?.[key]?.panel || panels?.[key];
      if (panel?.isVisible?.()) {
        panel.hide();
        return true;
      }
    }
    return false;
  }

  handleMovement() {
    let horizontal = 0;
    let vertical = 0;
    if (this.keys.left.isDown || this.keys.a.isDown) horizontal -= 1;
    if (this.keys.right.isDown || this.keys.d.isDown) horizontal += 1;
    if (this.keys.up.isDown || this.keys.w.isDown) vertical -= 1;
    if (this.keys.down.isDown || this.keys.s.isDown) vertical += 1;
    const direction = new Phaser.Math.Vector2(horizontal, vertical);
    if (direction.lengthSq() > 0) {
      this.playerFacing = direction.clone().normalize();
      direction.normalize().scale(this.playerSpeed);
      this.player.body.setVelocity(direction.x, direction.y);
      this.player.setFlipX(direction.x < 0);
      this.setClassPlayerTexture(this.playerFacing);
    } else {
      this.player.body.setVelocity(0, 0);
      this.setClassPlayerTexture(this.playerFacing);
    }
  }

  getDirectionName(vec) {
    const angle = Phaser.Math.RadToDeg(Math.atan2(vec?.y || 0, vec?.x || 1));
    if (angle >= -22.5 && angle < 22.5) return "east";
    if (angle >= 22.5 && angle < 67.5) return "south-east";
    if (angle >= 67.5 && angle < 112.5) return "south";
    if (angle >= 112.5 && angle < 157.5) return "south-west";
    if (angle >= 157.5 || angle < -157.5) return "west";
    if (angle >= -157.5 && angle < -112.5) return "north-west";
    if (angle >= -112.5 && angle < -67.5) return "north";
    return "north-east";
  }

  setClassPlayerTexture(direction) {
    const key = this.getClassPlayerTextureKey(direction || this.playerFacing);
    if (this.safeSetTexture(this.player, key)) {
      this.player.setDisplaySize(44, 44);
      this.player.body?.setSize?.(30, 30);
      this.player.body?.setOffset?.(7, 7);
      return;
    }
    this.player.play("overworld-player-idle", true);
  }

  getClassPlayerTextureKey(direction = null) {
    const className = String(this.registry.get("playerClass") || "warrior").toLowerCase();
    return `class_${className}_${this.getDirectionName(direction || this.playerFacing)}`;
  }

  safeSetTexture(target, key) {
    if (!target?.setTexture || !key || !this.textures?.exists?.(key)) return false;
    try {
      target.setTexture(key);
      return true;
    } catch (error) {
      console.warn("[OverworldScene] Texture swap skipped:", key, error);
      return false;
    }
  }

  updateMobs() {
    const delta = Math.min(0.05, (this.game.loop.delta || 16) / 1000);
    this.mobs.forEach((mob) => {
      if (!mob || mob.dead || mob.hp <= 0) return;
      const dist = Phaser.Math.Distance.Between(mob.x, mob.y, this.player.x, this.player.y);
      const homeDist = Phaser.Math.Distance.Between(mob.x, mob.y, mob.homeX, mob.homeY);
      let moving = false;

      if (homeDist > (mob.leashRadius || 230)) {
        const dir = new Phaser.Math.Vector2(mob.homeX - mob.x, mob.homeY - mob.y).normalize();
        mob.x += dir.x * (mob.speed || 45) * 1.25 * delta;
        mob.y += dir.y * (mob.speed || 45) * 1.25 * delta;
        moving = true;
      } else if (dist < (mob.aggroRadius || 260)) {
        const dir = new Phaser.Math.Vector2(this.player.x - mob.x, this.player.y - mob.y).normalize();
        mob.x += dir.x * (mob.speed || 45) * delta;
        mob.y += dir.y * (mob.speed || 45) * delta;
        moving = true;
        if (dist < (mob.attackRange || 48)) this.mobAttackPlayer(mob);
      } else {
        const patrolX = mob.homeX + Math.sin(this.time.now / 900 + (mob.level || 1)) * (mob.isMiniBoss ? 32 : 22);
        const patrolY = mob.homeY + Math.cos(this.time.now / 1100 + (mob.level || 1)) * (mob.isMiniBoss ? 22 : 14);
        const dir = new Phaser.Math.Vector2(patrolX - mob.x, patrolY - mob.y);
        if (dir.lengthSq() > 4) {
          dir.normalize();
          mob.x += dir.x * (mob.speed || 45) * 0.35 * delta;
          mob.y += dir.y * (mob.speed || 45) * 0.35 * delta;
          moving = true;
        }
      }

      this.updateMobVisual(mob, moving);
    });
  }

  updateMobVisual(mob, moving = false) {
    const scale = mob.scale || 0.75;
    if (mob.body) {
      mob.body.setPosition(mob.x, mob.y);
      if (mob.sprite) {
        mob.sprite.setFlipX(this.player && this.player.x < mob.x);
        if (this.time.now >= (mob.hurtUntil || 0) && this.time.now >= (mob.attackUntil || 0)) {
          const anim = moving ? `amasra-slime${mob.spriteVariant || 1}-walk` : `amasra-slime${mob.spriteVariant || 1}-idle`;
          if (!mob.sprite.anims.isPlaying || !mob.sprite.anims.currentAnim || mob.sprite.anims.currentAnim.key !== anim) {
            mob.sprite.play(anim, true);
          }
        }
      }
    }
    mob.shadow?.setPosition(mob.x, mob.y + 18 * scale);
    mob.label?.setPosition(mob.x, mob.y - 42 * scale);
    this.updateMobFamilyAccessories(mob, scale);
    mob.hpBarBg?.setPosition(mob.x - 22, mob.y - 28 * scale);
    const ratio = Math.max(0, Math.min(1, mob.hp / Math.max(1, mob.maxHp || 1)));
    mob.hpBarFill?.setPosition(mob.x - 21, mob.y - 28 * scale);
    mob.hpBarFill?.setDisplaySize(42 * ratio, 3);
  }

  updateMobFamilyAccessories(mob, scale) {
    if (!mob.accessories?.length) return;
    const offsets = {
      goblin: [[-17, -18], [17, -18]],
      wolf: [[-13, -24], [13, -24]],
      imp: [[-14, -24], [14, -24]],
    }[mob.family] || [];
    mob.accessories.forEach((part, index) => {
      const [ox, oy] = offsets[index] || [0, 0];
      part.setPosition(mob.x + ox * scale, mob.y + oy * scale);
    });
  }

  basicAttack(pointer = null) {
    if (this.time.now < (this.attackReadyAt || 0)) return;
    const profile = this.getClassCombatProfile();
    this.attackReadyAt = this.time.now + profile.cooldownMs;
    const worldPoint = pointer?.positionToCamera ? pointer.positionToCamera(this.cameras.main) : null;
    if (worldPoint) {
      const aim = new Phaser.Math.Vector2(worldPoint.x - this.player.x, worldPoint.y - this.player.y);
      if (aim.lengthSq() > 4) this.playerFacing = aim.normalize();
    }
    const hitX = worldPoint?.x ?? (this.player.x + this.playerFacing.x * profile.hitOffset);
    const hitY = worldPoint?.y ?? (this.player.y + this.playerFacing.y * profile.hitOffset);
    const ap = (window.GameState?.getWeaponAp?.(this.registry) || 18) * profile.damageMultiplier;
    const target = this.findAttackTarget(hitX, hitY, profile.range, profile.targetRadius);
    if (profile.projectile && target) this.spawnProjectile(this.player.x, this.player.y - 16, target.x, target.y, profile.tint);
    else this.spawnSwingEffect(this.player.x + this.playerFacing.x * profile.hitOffset, this.player.y + this.playerFacing.y * profile.hitOffset, profile.tint, profile.effectScale);
    if (!target) {
      this.showFloatingText(hitX, hitY - 18, "MISS", "#dfe8ea");
      return;
    }
    const damage = this.calculateDamage(ap, target, profile.damageType, profile);
    this.damageMob(target, damage, profile.textColor, profile.tint, profile.damageType);
    window.GameState?.applyDurabilityWear?.(this.registry, ["weapon"], 1, "field attack");
  }

  getClassCombatProfile() {
    const playerClass = String(this.registry.get("playerClass") || window.GameState?.DEFAULT_CLASS || "warrior").toLowerCase();
    return window.GameState?.getBasicAttackProfile?.(playerClass) || window.ClassBalanceConfig?.getBasicAttackProfile?.(playerClass) || {};
  }

  findAttackTarget(hitX, hitY, range = 150, targetRadius = 90) {
    return this.mobs
      .filter((mob) => {
        if (!mob || mob.dead || mob.hp <= 0) return false;
        const playerDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, mob.x, mob.y);
        const aimDist = Phaser.Math.Distance.Between(hitX, hitY, mob.x, mob.y);
        return playerDist <= range && aimDist <= Math.max(targetRadius, 42);
      })
      .sort((a, b) => Phaser.Math.Distance.Between(hitX, hitY, a.x, a.y) - Phaser.Math.Distance.Between(hitX, hitY, b.x, b.y))[0];
  }

  calculateDamage(amount, mob, type = "physical", profile = null) {
    const defense = mob.defense || 0;
    const resist = type === "magic" ? (mob.magicResist || 0) : type === "ranged" ? (mob.rangedResist || mob.physicalResist || 0) : (mob.physicalResist || 0);
    const defenseFactor = type === "magic" ? 0.25 : type === "ranged" ? 0.32 : 0.42;
    const reduced = amount - defense * defenseFactor;
    const crit = profile && Math.random() < (profile.critChance || 0);
    const critScale = crit ? (profile.critMultiplier || 1.5) : 1;
    return Math.max(1, Math.floor(reduced * (1 - resist) * critScale * Phaser.Math.FloatBetween(0.92, 1.08)));
  }

  damageMob(mob, damage, textColor = "#ffdddd", flashTint = 0xff5555, damageType = "physical") {
    if (!mob || mob.dead || mob.hp <= 0) return;
    mob.hp = Math.max(0, mob.hp - Math.max(1, Math.floor(damage || 1)));
    this.showFloatingText(mob.x, mob.y - 54, `-${Math.floor(damage)}`, textColor);
    this.spawnHitEffect(mob.x, mob.y, flashTint);

    if (mob.sprite) {
      mob.sprite.setTint(flashTint);
      mob.hurtUntil = this.time.now + 170;
      const hurtAnim = `amasra-slime${mob.spriteVariant || 1}-hurt`;
      if (this.anims.exists(hurtAnim)) mob.sprite.play(hurtAnim, true);
      this.time.delayedCall(120, () => {
        if (!mob.dead && mob.sprite) {
          mob.sprite.setTint(mob.tint || 0xffffff);
          mob.sprite.play(`amasra-slime${mob.spriteVariant || 1}-idle`, true);
        }
      });
    } else if (mob.fallbackBody) {
      mob.fallbackBody.setFillStyle?.(flashTint, 1);
      this.time.delayedCall(90, () => mob.fallbackBody?.setFillStyle?.(mob.tint || 0x66cc66, 0.95));
    }

    this.updateMobVisual(mob);
    if (mob.hp <= 0) this.killMob(mob, damageType);
  }

  useHotbarSlot(index) {
    const GS = window.GameState;
    const entryId = GS?.getHotbarSlot?.(this.registry, index);
    if (!entryId) {
      this.showCityBanner("Hotbar", `Slot ${index + 1} empty`);
      return false;
    }
    const skill = GS.getSkillDefById?.(entryId, this.registry.get("playerClass"));
    const consumable = GS.getConsumableDef?.(entryId) || GS.CONSUMABLE_DEFS?.[entryId];
    if (skill) return this.useSkillById(entryId);
    if (consumable) {
      const result = GS.useHotbarEntry?.(this.registry, entryId, this) || { ok: GS.useConsumable?.(this.registry, entryId, this), type: "consumable" };
      this.uiManager?.hotbarPanel?.refresh?.();
      this.refreshCityUi();
      if (result?.ok) this.showCityBanner("Hotbar", `${consumable.name || entryId} used`);
      return !!result?.ok;
    }
    return false;
  }

  useSkillById(skillId) {
    const GS = window.GameState;
    const skill = GS.getSkillDefById?.(skillId, this.registry.get("playerClass"));
    if (!skill) return false;
    if (this.currentMp < (skill.mpCost || 0)) {
      this.showCityBanner("Skill", "Not enough MP");
      return false;
    }
    const readyAt = this.getSkillReadyAt(skillId);
    if (this.time.now < readyAt) {
      this.showCityBanner("Skill", `Cooldown ${Math.ceil((readyAt - this.time.now) / 1000)}s`);
      return false;
    }

    this.currentMp -= skill.mpCost || 0;
    const skillLevel = GS.getSkillLevel?.(this.registry, skillId) || 1;
    const cooldownScale = Math.max(0.72, 1 - (skillLevel - 1) * 0.035);
    const powerScale = GS.getSkillPowerScale?.(this.registry, skillId) || 1;
    this.setSkillReadyAt(skillId, this.time.now + Math.floor((skill.cooldownMs || 3000) * cooldownScale));

    const profile = this.getClassCombatProfile();
    const skillType = this.getSkillDamageType(skill, profile);
    const skillRange = skill.range || (profile.projectile ? profile.range + 45 : 175);
    const hitX = this.player.x + this.playerFacing.x * Math.min(skillRange, profile.projectile ? skillRange : 145);
    const hitY = this.player.y + this.playerFacing.y * Math.min(skillRange, profile.projectile ? skillRange : 145);
    const target = this.findAttackTarget(hitX, hitY, skillRange, profile.projectile ? 120 : 100)
      || this.findNearestTargetInRange(skillRange);
    if (profile.projectile && target) this.spawnProjectile(this.player.x, this.player.y - 16, target.x, target.y, skill.tint || profile.tint);
    else this.spawnSwingEffect(hitX, hitY, skill.tint || profile.tint, skill.damageScale > 1.5 ? 1.45 : 1.15);
    if (target) {
      const base = (GS.getWeaponAp?.(this.registry) || 18) * (skill.damageScale || 1.25) * powerScale;
      const damage = this.calculateDamage(base, target, skillType, profile);
      this.damageMob(target, damage, "#ffeeaa", skill.tint || profile.tint, skillType);
      GS.applyDurabilityWear?.(this.registry, ["weapon"], 1, "field skill");
    } else {
      this.showFloatingText(hitX, hitY - 18, "NO TARGET", "#dfe8ea");
    }
    this.uiManager?.hotbarPanel?.refresh?.();
    this.refreshCityUi();
    return true;
  }

  getSkillReadyAt(skillId) {
    return this.skillReadyAtById?.[skillId] || 0;
  }

  setSkillReadyAt(skillId, readyAt) {
    this.skillReadyAtById = { ...(this.skillReadyAtById || {}), [skillId]: readyAt };
    this.classSkillReadyAt = readyAt;
  }

  getSkillCooldownRemaining(skillId) {
    return Math.max(0, this.getSkillReadyAt(skillId) - this.time.now);
  }

  findNearestTargetInRange(range = 160) {
    return this.mobs
      .filter((mob) => mob && !mob.dead && mob.hp > 0 && Phaser.Math.Distance.Between(this.player.x, this.player.y, mob.x, mob.y) <= range)
      .sort((a, b) => Phaser.Math.Distance.Between(this.player.x, this.player.y, a.x, a.y) - Phaser.Math.Distance.Between(this.player.x, this.player.y, b.x, b.y))[0] || null;
  }

  getSkillDamageType(skill, profile = null) {
    if (skill.damageType) return skill.damageType;
    const id = String(skill.id || "");
    if (skill.type === "magic" || id.includes("arcane") || id.includes("fire") || id.includes("frost") || id.includes("meteor")) return "magic";
    if (id.includes("shot") || id.includes("arrow") || profile?.damageType === "ranged") return "ranged";
    return "physical";
  }

  mobAttackPlayer(mob) {
    if (!mob || mob.hp <= 0 || mob.dead) return;
    if (this.time.now < (mob.lastAttackAt || 0) + (mob.isMiniBoss ? 950 : 1200)) return;
    mob.lastAttackAt = this.time.now;

    if (mob.sprite) {
      const attackAnim = `amasra-slime${mob.spriteVariant || 1}-attack`;
      if (this.anims.exists(attackAnim)) {
        mob.attackUntil = this.time.now + 260;
        mob.sprite.play(attackAnim, true);
      }
    }

    this.spawnHitEffect(this.player.x, this.player.y, mob.isMiniBoss ? 0xffd35a : 0x8cff82, mob.isMiniBoss ? 1.25 : 0.85);
    const damage = Math.max(1, Math.floor((mob.attack || 4) - (window.GameState?.getTotalDefense?.(this.registry) || 0) * 0.15));
    this.currentHp = Math.max(0, this.currentHp - damage);
    this.showFloatingText(this.player.x, this.player.y - 72, `-${damage}`, "#ff7777");
    this.player.setTint?.(0xff6666);
    this.time.delayedCall(120, () => this.player?.clearTint?.());
    this.refreshCityUi();
    if (this.currentHp <= 0) {
      this.currentHp = window.GameState?.getMaxHp?.(this.registry) || 100;
      this.player.setPosition(260, this.physics.world.bounds.height / 2);
      this.showCityBanner("Respawn", "Returned to Amasra gate");
    }
  }

  spawnSwingEffect(x, y, tint = 0xf4df9c, scale = 1) {
    const ring = this.add.circle(x, y, 24 * scale, tint, 0.18).setStrokeStyle(2, tint, 0.6).setDepth(25);
    this.tweens?.add?.({ targets: ring, scale: 1.8, alpha: 0, duration: 240, onComplete: () => ring.destroy() });
  }

  spawnProjectile(fromX, fromY, toX, toY, tint = 0xf4df9c) {
    const shot = this.add.circle(fromX, fromY, 5, tint, 0.95).setDepth(30);
    const trail = this.add.line(0, 0, fromX, fromY, toX, toY, tint, 0.35).setOrigin(0, 0).setDepth(29);
    this.tweens?.add?.({
      targets: shot,
      x: toX,
      y: toY,
      duration: 130,
      ease: "Quad.easeOut",
      onComplete: () => {
        shot.destroy();
        trail.destroy();
        this.spawnHitEffect(toX, toY, tint, 0.85);
      },
    });
  }

  spawnHitEffect(x, y, tint = 0x88ff88, scale = 1) {
    for (let i = 0; i < 5; i++) {
      const dot = this.add.circle(x + Phaser.Math.Between(-8, 8), y + Phaser.Math.Between(-8, 8), Phaser.Math.Between(2, 5) * scale, tint, 0.72).setDepth(26);
      this.tweens?.add?.({
        targets: dot,
        x: dot.x + Phaser.Math.Between(-18, 18),
        y: dot.y + Phaser.Math.Between(-18, 8),
        alpha: 0,
        duration: 320,
        onComplete: () => dot.destroy(),
      });
    }
  }

  spawnDeathSplash(x, y, tint = 0x66cc66, scale = 1) {
    const splash = this.add.circle(x, y + 8, 20 * scale, tint, 0.24).setDepth(15);
    this.tweens?.add?.({ targets: splash, scaleX: 2.2, scaleY: 0.45, alpha: 0, duration: 420, onComplete: () => splash.destroy() });
    for (let i = 0; i < 12; i++) {
      const goo = this.add.circle(x, y, Phaser.Math.Between(3, 7) * scale, tint, 0.68).setDepth(27);
      this.tweens?.add?.({
        targets: goo,
        x: x + Phaser.Math.Between(-42, 42) * scale,
        y: y + Phaser.Math.Between(-28, 34) * scale,
        alpha: 0,
        duration: Phaser.Math.Between(360, 620),
        onComplete: () => goo.destroy(),
      });
    }
  }

  showFloatingText(x, y, text, color = "#ffffff") {
    const label = this.add.text(x, y, text, { fontSize: "15px", color, stroke: "#000", strokeThickness: 3 }).setOrigin(0.5).setDepth(40);
    this.tweens?.add?.({
      targets: label,
      y: y - 28,
      alpha: 0,
      duration: 650,
      onComplete: () => label.destroy(),
    });
    return label;
  }

  refreshCityUi() {
    const GS = window.GameState;
    const maxHp = GS?.getMaxHp?.(this.registry) || 100;
    const maxMp = GS?.getMaxMp?.(this.registry) || 40;
    const hpRatio = Math.max(0, Math.min(1, this.currentHp / Math.max(1, maxHp)));
    const mpRatio = Math.max(0, Math.min(1, this.currentMp / Math.max(1, maxMp)));
    if (this.hpBarFill) this.hpBarFill.width = 216 * hpRatio;
    if (this.mpBarFill) this.mpBarFill.width = 216 * mpRatio;
    if (this.hpValueText) this.hpValueText.setText(`${this.currentHp}/${maxHp}`);
    if (this.mpValueText) this.mpValueText.setText(`${this.currentMp}/${maxMp}`);
    const xpState = GS?.getPlayerXpState?.(this.registry) || { level: this.registry.get("playerLevel") || 1, xp: this.registry.get("playerXp") || 0, next: 145 };
    if (this.xpBarFill) this.xpBarFill.width = 216 * Math.max(0, Math.min(1, xpState.xp / Math.max(1, xpState.next)));
    if (this.xpValueText) this.xpValueText.setText(`Lv ${xpState.level}  ${xpState.xp}/${xpState.next} XP`);
    this.uiManager?.hotbarPanel?.refresh?.();
  }

  showCityBanner(title, subtitle = "") {
    const line = subtitle ? `${title}: ${subtitle}` : title;
    this.feedText?.setText(line);
    this.pushActivityFeed(line);
  }

  pushActivityFeed(message) {
    if (!message) return;
    this.activityFeed = [String(message), ...(this.activityFeed || [])].slice(0, 5);
    (this.activityFeedTexts || []).forEach((text, index) => {
      const line = this.activityFeed[index] || "";
      text.setText(line);
      text.setAlpha(line ? 1 : 0.18);
    });
  }

  killMob(mob, damageType = "physical") {
    if (!mob || mob.dead) return;
    mob.dead = true;
    mob.hp = 0;
    this.updateMobVisual(mob);
    this.spawnDeathSplash(mob.x, mob.y, mob.tint || 0x66cc66, mob.isMiniBoss ? 1.5 : 1);

    if (mob.sprite) {
      const deathAnim = `amasra-slime${mob.spriteVariant || 1}-death`;
      if (this.anims.exists(deathAnim)) mob.sprite.play(deathAnim, true);
      mob.sprite.setTint(mob.tint || 0xffffff);
    }

    const gold = Phaser.Math.Between(mob.gold?.[0] || 1, mob.gold?.[1] || 3);
    const xp = window.GameState?.grantXp?.(this.registry, mob.xp || 10, "field") || null;
    window.GameState?.updateQuestProgress?.(this.registry, { type: "kill", target: mob.enemyId || mob.family || mob.name || "slime", amount: 1 });
    window.GameState?.pushActivityEvent?.(this.registry, `${mob.name} killed | +${xp?.amount || mob.xp || 0} XP`, "combat");
    const feedLines = [`${mob.name} killed`, `+${xp?.amount || mob.xp || 0} XP`, `${gold} Gold dropped`];
    if (mob.isMiniBoss) feedLines.unshift("Mini Boss defeated!");
    this.feedText.setText(feedLines.join("\n"));
    this.spawnGroundDrop(mob.x + Phaser.Math.Between(-16, 16), mob.y + Phaser.Math.Between(-10, 18), { type: "gold", amount: gold });

    this.time.delayedCall(mob.sprite ? 420 : 90, () => {
      mob.sprite?.destroy();
      mob.fallbackBody?.destroy();
      mob.shadow?.destroy();
      mob.accessories?.forEach((part) => part.destroy?.());
      mob.label?.destroy();
      mob.hpBarBg?.destroy();
      mob.hpBarFill?.destroy();
    });

    this.rollFieldLoot(mob);
    this.scheduleMobRespawn(mob);
    window.GameState?.saveProgress?.(this.registry);
  }

  rollFieldLoot(mob) {
    if (mob.isMiniBoss) {
      const material = { id: "kingSlimeGel", name: "King Slime Gel", type: "material", rarity: "rare", count: 1, color: 0xffd35a };
      this.spawnGroundDrop(mob.x + Phaser.Math.Between(-24, 24), mob.y + Phaser.Math.Between(-16, 22), { type: "item", item: material });
    }

    const balance = window.GameState?.BALANCE || {};
    const gearChance = mob.isMiniBoss
      ? (balance.fieldMiniBossGearChance || 0.82)
      : Math.min(balance.fieldGearDropCap || 0.34, (balance.fieldGearDropBase || 0.06) + (mob.dropTier || 1) * (balance.fieldGearDropPerTier || 0.035));
    if (Math.random() > gearChance) return;
    const gear = this.createFieldGearDrop(mob);
    if (gear) {
      this.spawnGroundDrop(mob.x + Phaser.Math.Between(-28, 28), mob.y + Phaser.Math.Between(-22, 26), { type: "item", item: gear });
    }
  }

  createFieldGearDrop(mob) {
    const GS = window.GameState;
    if (!GS?.pickClassEquipmentByTier || !GS?.createInventoryItemFromTemplate) return null;
    const slotRoll = Phaser.Math.Between(1, 100);
    const slot = slotRoll <= 42 ? "weapon" : slotRoll <= 60 ? "body" : slotRoll <= 74 ? "head" : slotRoll <= 87 ? "hands" : "legs";
    const levelBonus = Math.max(0, Math.floor(((this.registry.get("playerLevel") || 1) - 1) / 4));
    const tier = Math.max(1, Math.min(10, (mob.dropTier || 1) + (mob.isMiniBoss ? 2 : 0) + levelBonus));
    const template = GS.pickClassEquipmentByTier(this.registry, slot, tier);
    return GS.createInventoryItemFromTemplate(template, template?.rarity || null);
  }

  spawnGroundDrop(x, y, dropData) {
    const isGold = dropData.type === "gold";
    const tint = isGold ? 0xffd35a : (dropData.item?.color || 0xb5ffad);
    const body = this.add.circle(x, y, isGold ? 8 : 10, tint, 0.95).setStrokeStyle(2, 0x1b1510, 0.75).setDepth(14).setInteractive({ useHandCursor: true });
    const labelColor = isGold ? "#ffdf73" : this.getDropLabelColor(dropData.item);
    const label = this.add.text(x, y - 24, isGold ? `${dropData.amount} Gold` : dropData.item.name, {
      fontSize: dropData.item?.slot ? "11px" : "10px",
      color: labelColor,
      stroke: "#000",
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(15);
    const drop = { ...dropData, x, y, body, label, createdAt: this.time.now };
    body.on("pointerdown", () => this.collectGroundDrop(drop));
    this.fieldDrops.push(drop);
    this.tweens?.add?.({ targets: [body, label], y: "-=5", yoyo: true, repeat: -1, duration: 720 });
  }

  getDropLabelColor(item) {
    const colors = {
      common: "#f1f1f1",
      uncommon: "#f1f1f1",
      rare: "#65b8ff",
      epic: "#ffd36b",
      legendary: "#ff9a3d",
    };
    return colors[item?.rarity] || "#b5ffad";
  }

  updateGroundDrops() {
    this.fieldDrops.slice().forEach((drop) => {
      if (!drop?.body || !this.player) return;
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, drop.x, drop.y) <= 46) {
        this.collectGroundDrop(drop);
      }
    });
  }

  collectGroundDrop(drop) {
    if (!drop || drop.collected) return false;
    if (drop.type === "gold") {
      const cut = window.GameState?.applyMercenaryLootCut?.(this.registry, drop.amount || 0, "Gold") || { playerAmount: drop.amount || 0, mercenaryAmount: 0 };
      this.registry.set("gold", (this.registry.get("gold") || 0) + (cut.playerAmount || 0));
      this.showCityBanner("Loot", `+${cut.playerAmount || 0} Gold${cut.mercenaryAmount ? ` | Merc -${cut.mercenaryAmount}` : ""}`);
    } else if (drop.type === "item") {
      if (window.GameState?.shouldMercenaryClaimDrop?.(this.registry)) {
        window.GameState?.pushActivityEvent?.(this.registry, `Mercenary claimed: ${drop.item?.name || "item"}`, "social");
        this.showCityBanner("Mercenary Loot", `${drop.item?.name || "Item"} claimed`);
        drop.collected = true;
        drop.body?.destroy();
        drop.label?.destroy();
        this.fieldDrops = this.fieldDrops.filter((entry) => entry !== drop);
        window.GameState?.saveProgress?.(this.registry);
        this.refreshCityUi();
        return true;
      }
      const index = window.GameState?.addToInventory?.(this.registry, drop.item);
      if (index === undefined || index < 0) {
        this.showFloatingText(drop.x, drop.y - 18, "Bag Full", "#ff7777");
        return false;
      }
      const prefix = drop.item?.slot ? "Gear" : "Loot";
      this.showCityBanner(prefix, drop.item?.name || "Item");
    }
    drop.collected = true;
    drop.body?.destroy();
    drop.label?.destroy();
    this.fieldDrops = this.fieldDrops.filter((entry) => entry !== drop);
    window.GameState?.saveProgress?.(this.registry);
    this.refreshCityUi();
    return true;
  }

  createMercenaryCompanion() {
    const state = window.GameState?.getMercenaryState?.(this.registry);
    if (!state || !this.player) return;
    this.destroyMercenaryCompanion();
    const dir = this.getDirectionName?.(this.playerFacing) || "south";
    const key = `class_${state.className}_${dir}`;
    const tint = window.GameState?.MERCENARY_CONFIG?.classes?.[state.className]?.tint || 0xf4df9c;
    const body = this.textures.exists(key)
      ? this.add.image(this.player.x - 52, this.player.y + 34, key).setDisplaySize(40, 40).setDepth(34)
      : this.add.circle(this.player.x - 52, this.player.y + 34, 15, tint, 0.95).setDepth(34);
    const label = this.add.text(body.x, body.y - 28, state.label || "Mercenary", {
      fontSize: "10px",
      color: "#f4df9c",
      stroke: "#000",
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(35);
    this.mercenary = { ...state, body, label, x: body.x, y: body.y, nextAttackAt: 0 };
  }

  destroyMercenaryCompanion() {
    this.mercenary?.body?.destroy?.();
    this.mercenary?.label?.destroy?.();
    this.mercenary = null;
  }

  updateMercenaryCompanion() {
    const state = window.GameState?.getMercenaryState?.(this.registry);
    if (!state) {
      if (this.mercenary) this.destroyMercenaryCompanion();
      return;
    }
    if (!this.mercenary) this.createMercenaryCompanion();
    if (!this.mercenary?.body || !this.player) return;
    const delta = Math.min(0.05, (this.game?.loop?.delta || 16) / 1000);
    const target = this.findMercenaryTarget(state);
    const anchor = target || this.player;
    const followDist = target ? 130 : 68;
    const dist = Phaser.Math.Distance.Between(this.mercenary.x, this.mercenary.y, anchor.x, anchor.y);
    if (dist > followDist) {
      const dir = new Phaser.Math.Vector2(anchor.x - this.mercenary.x, anchor.y - this.mercenary.y).normalize();
      const speed = target ? 165 : 205;
      this.mercenary.x += dir.x * speed * delta;
      this.mercenary.y += dir.y * speed * delta;
      const tex = `class_${state.className}_${this.getDirectionName(dir)}`;
      this.safeSetTexture(this.mercenary.body, tex);
    }
    this.mercenary.body.setPosition(this.mercenary.x, this.mercenary.y);
    this.mercenary.label?.setPosition(this.mercenary.x, this.mercenary.y - 28);
    if (target) this.tryMercenaryAttack(target, state);
  }

  findMercenaryTarget(state) {
    const profile = window.GameState?.getBasicAttackProfile?.(state.className) || {};
    const aggroRange = Math.max(260, (profile.range || 140) + 90);
    return (this.mobs || [])
      .filter((mob) => mob && !mob.dead && mob.hp > 0 && Phaser.Math.Distance.Between(this.player.x, this.player.y, mob.x, mob.y) <= aggroRange)
      .sort((a, b) => Phaser.Math.Distance.Between(this.mercenary?.x || this.player.x, this.mercenary?.y || this.player.y, a.x, a.y) - Phaser.Math.Distance.Between(this.mercenary?.x || this.player.x, this.mercenary?.y || this.player.y, b.x, b.y))[0] || null;
  }

  tryMercenaryAttack(target, state) {
    const profile = window.GameState?.getBasicAttackProfile?.(state.className) || {};
    const range = profile.range || 140;
    const dist = Phaser.Math.Distance.Between(this.mercenary.x, this.mercenary.y, target.x, target.y);
    if (dist > range) return;
    const cooldown = Math.floor((profile.cooldownMs || 850) * (state.attackSlow || 1.45));
    if (this.time.now < (this.mercenary.nextAttackAt || 0)) return;
    this.mercenary.nextAttackAt = this.time.now + cooldown;
    const dir = new Phaser.Math.Vector2(target.x - this.mercenary.x, target.y - this.mercenary.y).normalize();
    const tex = `class_${state.className}_${this.getDirectionName(dir)}`;
    this.safeSetTexture(this.mercenary.body, tex);
    const tint = window.GameState?.MERCENARY_CONFIG?.classes?.[state.className]?.tint || profile.tint || 0xf4df9c;
    if (profile.projectile) this.spawnProjectile(this.mercenary.x, this.mercenary.y - 12, target.x, target.y, tint);
    else this.spawnSwingEffect(this.mercenary.x + dir.x * 34, this.mercenary.y + dir.y * 34, tint, 0.85);
    const base = (window.GameState?.getWeaponAp?.(this.registry) || 18) * (state.damageScale || 0.7);
    const damage = this.calculateDamage(base, target, profile.damageType || "physical", profile);
    this.damageMob(target, damage, "#c6f0ff", tint, profile.damageType || "physical");
  }

  togglePet() {
    const now = this.time?.now || 0;
    if (now - (this.lastPetToggleAt || 0) < 140) return;
    this.lastPetToggleAt = now;
    if (this.petSummoned) {
      this.petSummoned = false;
      this.pet?.body?.destroy?.();
      this.pet?.label?.destroy?.();
      this.pet = null;
      this.updatePetHud();
      this.showCityBanner("Pet", "Loot Cat dismissed");
      return;
    }
    this.petSummoned = true;
    const key = this.textures.exists("pet_cat_south") ? "pet_cat_south" : "__MISSING";
    const body = this.textures.exists(key)
      ? this.add.image(this.player.x - 42, this.player.y + 28, key).setDisplaySize(34, 34).setDepth(35)
      : this.add.circle(this.player.x - 42, this.player.y + 28, 15, 0xf0c48a, 0.98).setStrokeStyle(3, 0x4b2f1b, 0.9).setDepth(35);
    const label = this.add.text(body.x, body.y - 24, "Loot Cat", {
      fontSize: "10px", color: "#f8dfb0", stroke: "#000", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(36);
    this.pet = { body, label, x: body.x, y: body.y };
    this.updatePetHud();
    this.showCityBanner("Pet", "Loot Cat summoned");
  }

  updatePetHud() {
    if (this.petButtonText) this.petButtonText.setText(`[P] Loot Cat: ${this.petSummoned ? "ON" : "OFF"}`);
    if (this.petButtonBg) this.petButtonBg.setFillStyle(this.petSummoned ? 0x3a2f18 : 0x1d2d25, 0.9);
  }

  updatePet() {
    if (!this.petSummoned || !this.pet?.body || !this.player) return;
    const targetDrop = this.fieldDrops
      .filter((drop) => drop && !drop.collected)
      .sort((a, b) => Phaser.Math.Distance.Between(this.pet.x, this.pet.y, a.x, a.y) - Phaser.Math.Distance.Between(this.pet.x, this.pet.y, b.x, b.y))[0];
    const targetX = targetDrop?.x ?? (this.player.x - this.playerFacing.x * 46);
    const targetY = targetDrop?.y ?? (this.player.y - this.playerFacing.y * 46 + 18);
    const dist = Phaser.Math.Distance.Between(this.pet.x, this.pet.y, targetX, targetY);
    if (dist > 4) {
      const delta = Math.min(0.05, (this.game.loop.delta || 16) / 1000);
      const dir = new Phaser.Math.Vector2(targetX - this.pet.x, targetY - this.pet.y).normalize();
      this.pet.x += dir.x * (targetDrop ? 190 : 135) * delta;
      this.pet.y += dir.y * (targetDrop ? 190 : 135) * delta;
      const key = `pet_cat_${this.getDirectionName(dir)}`;
      this.safeSetTexture(this.pet.body, key);
    }
    this.pet.body.setPosition(this.pet.x, this.pet.y);
    this.pet.label.setPosition(this.pet.x, this.pet.y - 24);
    if (targetDrop && Phaser.Math.Distance.Between(this.pet.x, this.pet.y, targetDrop.x, targetDrop.y) <= 28) {
      this.collectGroundDrop(targetDrop);
    }
  }

  scheduleMobRespawn(mob) {
    if (mob.isMiniBoss) return;
    const def = { ...(mob.spawnDef || mob) };
    const x = mob.homeX;
    const y = mob.homeY;
    this.time.delayedCall(Phaser.Math.Between(8000, 12000), () => {
      if (!this.scene.isActive("OverworldScene")) return;
      this.createSlimeMob(x, y, def);
    });
  }
}

window.OverworldScene = OverworldScene;
