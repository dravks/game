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
  }

  preload() {
    this.load.spritesheet("player_idle_sheet", "assets/sprites/units/player_idle.png", { frameWidth: 192, frameHeight: 192 });
    this.load.spritesheet("player_run_sheet", "assets/sprites/units/player_run.png", { frameWidth: 192, frameHeight: 192 });
    this.loadClassAndPetImages();

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
    const width = 2600;
    const height = 1600;
    this.physics.world.setBounds(0, 0, width, height);
    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.setBackgroundColor("#183926");
    window.GameState?.attachAutoSave?.(this, this.registry);
    window.GameState?.initHotbarSlots?.(this.registry);
    this.currentHp = window.GameState?.getMaxHp?.(this.registry) || 100;
    this.currentMp = window.GameState?.getMaxMp?.(this.registry) || 40;

    this.createAnimations();
    this.drawField(width, height);
    this.createPlayer(180, height / 2);
    this.createInput();

    this.uiManager = new UIManager(this);
    this.uiManager.init();
    this.uiManager.drawUiLayer(this.scale.width, this.scale.height);
    this.createHud();
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
    this.player = this.physics.add.sprite(x, y, "player_idle_sheet", 0).setScale(0.32).setDepth(20);
    this.player.body.setSize(42, 42).setOffset(76, 120);
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
    this.__domOverworldKeyHandler = (event) => {
      if (!this.scene?.isActive?.("OverworldScene")) return;
      if (document.activeElement === this.game?.canvas) return;
      const key = event.key?.toLowerCase?.();
      if (/^[1-6]$/.test(event.key)) {
        this.useHotbarSlot(Number(event.key) - 1);
        event.preventDefault();
      }
      if (["i", "c", "k", "q"].includes(key)) {
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

  drawField(width, height) {
    this.add.rectangle(width / 2, height / 2, width, height, 0x2f5a35).setDepth(0);

    // Soft grass patches.
    for (let x = 120; x < width; x += 180) {
      for (let y = 120; y < height; y += 160) {
        const tint = (x + y) % 3 === 0 ? 0x244b2f : 0x3d6c38;
        this.add.circle(x + Phaser.Math.Between(-30, 30), y + Phaser.Math.Between(-25, 25), Phaser.Math.Between(18, 42), tint, 0.45).setDepth(1);
      }
    }

    // Zone hints: safer grass near the gate, darker slime nest further away.
    this.add.rectangle(590, height / 2, 650, height - 180, 0x3e6f3a, 0.11).setDepth(1);
    this.add.rectangle(1360, height / 2, 700, height - 150, 0x2b633f, 0.12).setDepth(1);
    this.add.rectangle(2180, height / 2, 560, height - 120, 0x1f4d3c, 0.2).setDepth(1);

    this.decorationColliders = this.physics.add.staticGroup();
    this.drawFieldDecorations(width, height);
    this.drawCityReturnGate(height);
  }

  drawFieldDecorations(width, height) {
    const decor = [
      { x: 360, y: 190, r: 38, c: 0x23452d }, { x: 430, y: 1380, r: 44, c: 0x23452d },
      { x: 790, y: 260, r: 32, c: 0x1f4029 }, { x: 900, y: 1260, r: 46, c: 0x244b2f },
      { x: 1340, y: 170, r: 40, c: 0x1f4029 }, { x: 1590, y: 1440, r: 52, c: 0x244b2f },
      { x: 2110, y: 240, r: 48, c: 0x1c3b2b }, { x: 2390, y: 1320, r: 58, c: 0x1c3b2b },
    ];
    decor.forEach((d) => {
      const tree = this.add.circle(d.x, d.y, d.r, d.c, 0.95).setDepth(4);
      this.add.circle(d.x - 10, d.y - 8, d.r * 0.55, 0x315f35, 0.55).setDepth(5);
      const blocker = this.add.circle(d.x, d.y, Math.max(16, d.r * 0.45), 0x000000, 0);
      this.physics.add.existing(blocker, true);
      this.decorationColliders.add(blocker);
      tree.setData("blocker", blocker);
    });

    for (let i = 0; i < 24; i++) {
      const x = Phaser.Math.Between(290, width - 140);
      const y = Phaser.Math.Between(110, height - 110);
      const rock = this.add.ellipse(x, y, Phaser.Math.Between(18, 34), Phaser.Math.Between(12, 24), 0x3f4c45, 0.72).setDepth(3);
      if (i % 4 === 0) {
        const blocker = this.add.ellipse(x, y, 22, 14, 0x000000, 0);
        this.physics.add.existing(blocker, true);
        this.decorationColliders.add(blocker);
        rock.setData("blocker", blocker);
      }
    }

    // Slime nest / mini-boss arena visual.
    this.add.circle(2320, 800, 145, 0x153a34, 0.54).setDepth(2);
    this.add.circle(2320, 800, 92, 0x3a6d58, 0.24).setDepth(2);
    this.add.text(2320, 642, "King Slime Nest", { fontSize: "15px", color: "#d7ffc9", stroke: "#000", strokeThickness: 3 }).setOrigin(0.5).setDepth(4);
  }

  drawCityReturnGate(height) {
    this.add.rectangle(70, height / 2, 90, 190, 0x5a4530, 0.92).setStrokeStyle(3, 0xf4df9c, 0.8).setDepth(8);
    this.add.text(72, height / 2 - 118, "AMASRA GATE\n[E] Return", { fontSize: "16px", color: "#f8f1dc", align: "center", stroke: "#000", strokeThickness: 3 }).setOrigin(0.5).setDepth(9);
  }

  createHud() {
    const { width } = this.scale;
    this.hudText = this.add.text(20, 22, "Amasra - Slime Field Lv 1-7", { fontSize: "17px", color: "#f8f1dc", stroke: "#000", strokeThickness: 3 }).setScrollFactor(0).setDepth(100);
    this.feedText = this.add.text(width - 24, 22, "", { fontSize: "12px", color: "#f8d36b", align: "right", stroke: "#000", strokeThickness: 2, wordWrap: { width: 320 } }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);
  }

  spawnFieldMobs() {
    this.mobs = [];
    const zones = [
      {
        name: "Gate Grass",
        count: 10,
        x: [420, 980],
        y: [170, 1430],
        variants: [
          { name: "Tiny Slime", level: 1, spriteVariant: 1, hp: 42, attack: 4, defense: 1, speed: 44, xp: 10, gold: [2, 5], scale: 0.62, tint: 0x9dff95 },
          { name: "Green Slime", level: 2, spriteVariant: 1, hp: 58, attack: 6, defense: 2, speed: 47, xp: 16, gold: [4, 8], scale: 0.7, tint: 0x78e56a },
        ],
      },
      {
        name: "Wet Meadow",
        count: 9,
        x: [1040, 1740],
        y: [150, 1450],
        variants: [
          { name: "Blue Slime", level: 3, spriteVariant: 2, hp: 82, attack: 8, defense: 3, speed: 50, xp: 24, gold: [6, 12], scale: 0.76, tint: 0x73c9ff, magicResist: 0.08 },
          { name: "Big Slime", level: 4, spriteVariant: 2, hp: 118, attack: 11, defense: 5, speed: 42, xp: 35, gold: [9, 17], scale: 0.9, tint: 0x57b6e8, physicalResist: 0.05 },
        ],
      },
      {
        name: "Slime Nest",
        count: 7,
        x: [1800, 2460],
        y: [170, 1430],
        variants: [
          { name: "Forest Slime", level: 5, spriteVariant: 3, hp: 154, attack: 14, defense: 7, speed: 45, xp: 48, gold: [12, 24], scale: 0.92, tint: 0x65d36d, physicalResist: 0.08, magicResist: 0.04 },
          { name: "Mud Slime", level: 5, spriteVariant: 3, hp: 168, attack: 13, defense: 9, speed: 38, xp: 52, gold: [13, 26], scale: 0.95, tint: 0xa2784a, physicalResist: 0.1 },
        ],
      },
    ];

    zones.forEach((zone) => {
      for (let i = 0; i < zone.count; i++) {
        const def = Phaser.Utils.Array.GetRandom(zone.variants);
        const x = Phaser.Math.Between(zone.x[0], zone.x[1]);
        const y = Phaser.Math.Between(zone.y[0], zone.y[1]);
        this.createSlimeMob(x, y, { ...def, zone: zone.name });
      }
    });

    this.createSlimeMob(2320, 800, {
      name: "King Slime",
      id: "king_slime",
      level: 7,
      spriteVariant: 3,
      hp: 520,
      attack: 24,
      defense: 12,
      speed: 36,
      xp: 180,
      gold: [70, 130],
      scale: 1.45,
      tint: 0xffd35a,
      physicalResist: 0.12,
      magicResist: 0.08,
      rank: "mini_boss",
      zone: "King Slime Nest",
      isMiniBoss: true,
    });
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
      family: "slime",
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

    this.mobs.push(mob);
    return mob;
  }

  update() {
    if (!this.player) return;

    if (Phaser.Input.Keyboard.JustDown(this.keys.close) && this.closeTopPanel()) return;

    // ESC should close panels only. Return to town is handled by E at the gate.
    if (Phaser.Input.Keyboard.JustDown(this.keys.returnCity) && this.player.x < 170) {
      this.scene.start("PrototypeScene", { returnSpawn: { x: 640, y: 90 } });
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.inventory)) this.uiManager.toggleInventoryPanel();
    if (Phaser.Input.Keyboard.JustDown(this.keys.skills)) this.uiManager.toggleSkillPanel();
    if (Phaser.Input.Keyboard.JustDown(this.keys.character)) this.uiManager.toggleCharacterPanel();
    if (Phaser.Input.Keyboard.JustDown(this.keys.questList)) this.uiManager.toggleQuestList();
    for (let i = 0; i < 6; i++) {
      const key = this.keys[`slot${i + 1}`];
      if (key && Phaser.Input.Keyboard.JustDown(key)) this.useHotbarSlot(i);
    }

    if (this.isAnyPanelOpen()) {
      this.player.body.setVelocity(0, 0);
      this.setClassPlayerTexture(this.playerFacing);
      return;
    }

    this.handleMovement();
    this.updateMobs();
    this.updateGroundDrops();
    this.updatePet();
    if (Phaser.Input.Keyboard.JustDown(this.keys.attack)) this.basicAttack();
    if (Phaser.Input.Keyboard.JustDown(this.keys.pet)) this.togglePet();
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
    const className = String(this.registry.get("playerClass") || "warrior").toLowerCase();
    const key = `class_${className}_${this.getDirectionName(direction || this.playerFacing)}`;
    if (this.textures.exists(key)) {
      this.player.setTexture(key).setDisplaySize(44, 44);
      this.player.body?.setSize?.(30, 30);
      this.player.body?.setOffset?.(7, 7);
      return;
    }
    this.player.play("overworld-player-idle", true);
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
    mob.hpBarBg?.setPosition(mob.x - 22, mob.y - 28 * scale);
    const ratio = Math.max(0, Math.min(1, mob.hp / Math.max(1, mob.maxHp || 1)));
    mob.hpBarFill?.setPosition(mob.x - 21, mob.y - 28 * scale);
    mob.hpBarFill?.setDisplaySize(42 * ratio, 3);
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
  }

  getClassCombatProfile() {
    const playerClass = String(this.registry.get("playerClass") || window.GameState?.DEFAULT_CLASS || "warrior").toLowerCase();
    const profiles = {
      warrior: { range: 72, hitOffset: 46, targetRadius: 52, cooldownMs: 620, damageMultiplier: 1.12, critChance: 0.06, critMultiplier: 1.55, damageType: "physical", projectile: false, tint: 0xf4df9c, effectScale: 0.95, textColor: "#ffdddd" },
      rogue: { range: 86, hitOffset: 54, targetRadius: 58, cooldownMs: 470, damageMultiplier: 0.98, critChance: 0.18, critMultiplier: 1.75, damageType: "physical", projectile: false, tint: 0xae7cff, effectScale: 0.9, textColor: "#ffd4ff" },
      mage: { range: 285, hitOffset: 150, targetRadius: 92, cooldownMs: 760, damageMultiplier: 0.92, critChance: 0.08, critMultiplier: 1.6, damageType: "magic", projectile: true, tint: 0x77a9ff, effectScale: 1.15, textColor: "#cfe2ff" },
      archer: { range: 325, hitOffset: 175, targetRadius: 82, cooldownMs: 560, damageMultiplier: 1.0, critChance: 0.13, critMultiplier: 1.7, damageType: "ranged", projectile: true, tint: 0xd8b15c, effectScale: 0.9, textColor: "#ffeeaa" },
    };
    return profiles[playerClass] || profiles.warrior;
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
      this.player.setPosition(180, this.physics.world.bounds.height / 2);
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
    const feedLines = [`${mob.name} killed`, `+${xp?.amount || mob.xp || 0} XP`, `${gold} Gold dropped`];
    if (mob.isMiniBoss) feedLines.unshift("Mini Boss defeated!");
    this.feedText.setText(feedLines.join("\n"));
    this.spawnGroundDrop(mob.x + Phaser.Math.Between(-16, 16), mob.y + Phaser.Math.Between(-10, 18), { type: "gold", amount: gold });

    this.time.delayedCall(mob.sprite ? 420 : 90, () => {
      mob.sprite?.destroy();
      mob.fallbackBody?.destroy();
      mob.shadow?.destroy();
      mob.label?.destroy();
      mob.hpBarBg?.destroy();
      mob.hpBarFill?.destroy();
    });

    this.rollFieldLoot(mob);
    this.scheduleMobRespawn(mob);
    window.GameState?.saveProgress?.(this.registry);
  }

  rollFieldLoot(mob) {
    const chance = mob.isMiniBoss ? 0.75 : 0.12;
    if (Math.random() > chance) return;

    const reward = mob.isMiniBoss
      ? { id: "kingSlimeGel", name: "King Slime Gel", type: "material", rarity: "rare", count: 1, color: 0xffd35a }
      : { id: "slimeGel", name: "Slime Gel", type: "material", rarity: "common", count: 1, color: 0x78e56a };

    this.spawnGroundDrop(mob.x + Phaser.Math.Between(-24, 24), mob.y + Phaser.Math.Between(-16, 22), { type: "item", item: reward });
  }

  spawnGroundDrop(x, y, dropData) {
    const isGold = dropData.type === "gold";
    const tint = isGold ? 0xffd35a : (dropData.item?.color || 0xb5ffad);
    const body = this.add.circle(x, y, isGold ? 8 : 10, tint, 0.95).setStrokeStyle(2, 0x1b1510, 0.75).setDepth(14).setInteractive({ useHandCursor: true });
    const label = this.add.text(x, y - 24, isGold ? `${dropData.amount} Gold` : dropData.item.name, {
      fontSize: "10px",
      color: isGold ? "#ffdf73" : "#b5ffad",
      stroke: "#000",
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(15);
    const drop = { ...dropData, x, y, body, label, createdAt: this.time.now };
    body.on("pointerdown", () => this.collectGroundDrop(drop));
    this.fieldDrops.push(drop);
    this.tweens?.add?.({ targets: [body, label], y: "-=5", yoyo: true, repeat: -1, duration: 720 });
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
      this.registry.set("gold", (this.registry.get("gold") || 0) + (drop.amount || 0));
      this.showCityBanner("Loot", `+${drop.amount || 0} Gold`);
    } else if (drop.type === "item") {
      const index = window.GameState?.addToInventory?.(this.registry, drop.item);
      if (index === undefined || index < 0) {
        this.showFloatingText(drop.x, drop.y - 18, "Bag Full", "#ff7777");
        return false;
      }
      this.showCityBanner("Loot", drop.item?.name || "Item");
    }
    drop.collected = true;
    drop.body?.destroy();
    drop.label?.destroy();
    this.fieldDrops = this.fieldDrops.filter((entry) => entry !== drop);
    window.GameState?.saveProgress?.(this.registry);
    this.refreshCityUi();
    return true;
  }

  togglePet() {
    if (this.petSummoned) {
      this.petSummoned = false;
      this.pet?.body?.destroy?.();
      this.pet?.label?.destroy?.();
      this.pet = null;
      this.showCityBanner("Pet", "Loot Cat dismissed");
      return;
    }
    this.petSummoned = true;
    const key = this.textures.exists("pet_cat_south") ? "pet_cat_south" : "__MISSING";
    const body = this.add.image(this.player.x - 42, this.player.y + 28, key).setDisplaySize(30, 30).setDepth(19);
    const label = this.add.text(body.x, body.y - 24, "Loot Cat", {
      fontSize: "10px", color: "#f8dfb0", stroke: "#000", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20);
    this.pet = { body, label, x: body.x, y: body.y };
    this.showCityBanner("Pet", "Loot Cat summoned");
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
      if (this.textures.exists(key)) this.pet.body.setTexture(key);
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
