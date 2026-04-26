class DungeonPrototypeScene extends Phaser.Scene {
  constructor() {
    super("DungeonPrototypeScene");
    this.actionKeys = null;
    this.activeInteractable = null;
    this.attackCooldownMs = 300;
    this.attackReadyAt = 0;
    this.classSkillReadyAt = 0;
    this.completionExit = null;
    this.dungeonCleared = false;
    this.dialogOpen = false;
    this.enemyPlaceholders = [];
    this.interactables = [];
    this.interactionPrompt = null;
    this.obstacles = null;
    this.player = null;
    this.playerFacing = new Phaser.Math.Vector2(0, -1);
    this.playerSpeed = 180;
    this.currentHp = 0;
    this.currentMp = 0;
    this.isRespawning = false;
    this.inventoryOpen = false;
    this.skillPanelOpen = false;
    this.questListOpen = false;
    this.isTransitioningOut = false;
    this.lootDrops = [];
    this.dungeonEventNodes = [];
    this.runRewards = { gold: 0, materials: [], cycleBonus: 0, preparationBonus: 0, statPoints: 0 };
    this.chatLines = [];
    this.chatHistory = [];
    this.combatLogLines = [];
    this.combatLogHistory = [];
    this.hotbarSlotVisuals = [];
    this.phaseProgress = 0;
    this.maxPhases = 4;
    
    // UI Refs
    this.inventoryGridSlots = [];
    this.inventoryGridIcons = [];
    this.inventoryGridCounts = [];
    this.inventoryEquipSlots = [];
    this.inventoryEquipIcons = [];
    this.inventoryEquipLabels = [];
    this.inventoryEquipItemTexts = [];
    this.questListEntryTexts = [];
    this.questListEntryRows = [];
  }

  preload() {
    // UI Assets
    this.load.image("panel_main", "assets/ui/kenney/panel_main.png");
    this.load.image("panel_line", "assets/ui/kenney/panel_line.png");
    this.load.image("panel_alt", "assets/ui/kenney/panel_alt.png");
    this.load.image("panel_dark", "assets/ui/tiny-swords/panel_dark.png");
    this.load.image("panel_light", "assets/ui/tiny-swords/panel_light.png");
    this.load.image("slot_normal", "assets/ui/tiny-swords/slot_normal.png");
    this.load.image("slot_active", "assets/ui/tiny-swords/slot_active.png");
    
    // Icons
    for (let i = 1; i <= 12; i++) {
      const iconKey = `icon_${i.toString().padStart(2, "0")}`;
      this.load.image(iconKey, `assets/ui/tiny-swords/icon_${i.toString().padStart(2, "0")}.png`);
    }

    // Spritesheets
    this.load.spritesheet("player_idle_sheet", "assets/sprites/units/player_idle.png", { frameWidth: 192, frameHeight: 192 });
    this.load.spritesheet("player_run_sheet", "assets/sprites/units/player_run.png", { frameWidth: 192, frameHeight: 192 });
    
    // Enemy Sprites
    this.load.spritesheet("enemy_kekon_idle", "assets/sprites/enemies/kekon_idle.png", { frameWidth: 192, frameHeight: 192 });
    this.load.spritesheet("enemy_kekon_run", "assets/sprites/enemies/kekon_run.png", { frameWidth: 192, frameHeight: 192 });
    this.load.spritesheet("enemy_kekon_warrior_idle", "assets/sprites/enemies/kekon_warrior_idle.png", { frameWidth: 192, frameHeight: 192 });
    this.load.spritesheet("enemy_kekon_warrior_run", "assets/sprites/enemies/kekon_warrior_run.png", { frameWidth: 192, frameHeight: 192 });
    this.load.spritesheet("enemy_kekon_boss_idle", "assets/sprites/enemies/kekon_boss_idle.png", { frameWidth: 320, frameHeight: 320 });
    this.load.spritesheet("enemy_kekon_boss_run", "assets/sprites/enemies/kekon_boss_run.png", { frameWidth: 320, frameHeight: 320 });

    // Effects
    this.load.spritesheet("fx_dust_01", "assets/effects/dust_01.png", { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet("fx_explosion_01", "assets/effects/explosion_01.png", { frameWidth: 192, frameHeight: 192 });
    this.load.spritesheet("fx_fire_01", "assets/effects/fire_01.png", { frameWidth: 64, frameHeight: 64 });

    // Terrain
    this.load.image("dungeon_tile_a", "assets/terrain/dungeon/tilemap_color1.png");
    this.load.image("dungeon_tile_b", "assets/terrain/dungeon/tilemap_color2.png");
    this.load.image("dungeon_shadow_01", "assets/terrain/dungeon/shadow_01.png");
    this.load.image("dungeon_rock_a", "assets/terrain/dungeon/rock_a.png");
    this.load.image("dungeon_rock_b", "assets/terrain/dungeon/rock_b.png");
    this.load.image("dungeon_bush_dead", "assets/terrain/dungeon/bush_dead.png");
    this.load.image("dungeon_tree_01", "assets/props/dungeon/tree_01.png");
  }

  create(data) {
    const { width, height } = this.scale;
    
    // Set World Bounds
    const worldWidth = 4000;
    const worldHeight = 1200;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBackgroundColor("#10131a");

    // Init State
    this.currentHp = GameState.getMaxHp(this.registry);
    this.currentMp = GameState.getMaxMp(this.registry);
    this.playerSpeed = GameState.getPlayerSpeed(this.registry);
    this.playerRespawnPoint = { x: 300, y: 600 };

    this.initUiManager();
    
    // Build Layout
    this.dungeonLayoutData = this.generateDungeonLayout(worldWidth, worldHeight);
    
    // Draw Environment
    this.drawDungeonEnvironment(worldWidth, worldHeight);
    this.createCollisionBlocks();
    
    // Animations
    this.createAnimations();
    
    // Player
    const spawnX = data?.spawn?.x ?? this.dungeonLayoutData.entrySpawn.x;
    const spawnY = data?.spawn?.y ?? this.dungeonLayoutData.entrySpawn.y;
    this.createPlayer(spawnX, spawnY);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    
    // Enemies
    this.createEnemyPlaceholders();
    
    // Goals & Interaction
    this.createReturnGate();
    this.createCompletionExit();
    this.createInteractionUi();
    
    // Input & UI
    this.createInput();
    this.input.mouse.disableContextMenu();
    this.drawUiLayer();
    this.drawDungeonHeader();

    // Focus Fix
    if (this.game?.canvas) {
      this.game.canvas.focus();
      this.game.canvas.setAttribute("tabindex", "0");
    }

    // Phase Gates
    this.phaseGates = [];
    this.createPhaseGates();
    
    window.PROTOTYPE_SETUP_READY = true;
  }

  update() {
    try {
      if (!this.player || !this.actionKeys || this.isTransitioningOut) return;

      // Emergency Reset
      if (Phaser.Input.Keyboard.JustDown(this.actionKeys.close)) {
        if (this.handleGlobalPanelClose()) return;
        this.dialogOpen = false;
        Object.keys(this.uiPanels).forEach(k => this.hidePanel(k));
      }

      // Stability Check
      if (isNaN(this.player.x) || isNaN(this.player.y)) {
        this.player.setPosition(this.playerRespawnPoint.x, this.playerRespawnPoint.y);
      }

      // UI Check
      const anyPanelVisible = Object.values(this.uiPanels).some(p => p.open);
      if (this.dialogOpen || anyPanelVisible) {
        if (this.player.body) this.player.body.setVelocity(0, 0);
        this.setPlayerAnimation(false);
        if (this.dialogOpen) this.handleDialogInput();
        return;
      }

      if (this.isRespawning) {
        if (this.player.body) this.player.body.setVelocity(0, 0);
        return;
      }

      this.handleMovement();
      this.handleInputActions();
      this.updateEnemyAi();
      this.updatePhaseProgression();
      this.updateInteractionPrompt();
      this.refreshHudPanel();
    } catch (error) {
      console.error("Dungeon Scene Update Error:", error);
    }
  }

  // --- Generation ---
  generateDungeonLayout(w, h) {
    const centerY = h / 2;
    const rooms = [
      { x: 300, y: centerY, w: 400, h: 400, type: 'start', phaseId: 0 },
      { x: 1000, y: centerY - 100, w: 500, h: 400, type: 'combat', phaseId: 1 },
      { x: 1800, y: centerY + 100, w: 500, h: 500, type: 'combat', phaseId: 2 },
      { x: 2700, y: centerY, w: 600, h: 400, type: 'combat', phaseId: 3 },
      { x: 3600, y: centerY, w: 700, h: 600, type: 'boss', phaseId: 4 }
    ];
    return {
      entrySpawn: { x: 300, y: centerY },
      rooms,
      corridors: [
        { x1: 500, y1: centerY, x2: 750, y2: centerY },
        { x1: 1250, y1: centerY - 100, x2: 1550, y2: centerY + 100 },
        { x1: 2050, y1: centerY + 100, x2: 2400, y2: centerY },
        { x1: 3000, y1: centerY, x2: 3250, y2: centerY }
      ]
    };
  }

  drawDungeonEnvironment(w, h) {
    // Fill background with a very dark tint
    this.add.tileSprite(w/2, h/2, w, h, "dungeon_tile_a").setTint(0x1a1c22).setDepth(0);
    
    this.dungeonLayoutData.rooms.forEach(room => {
      // Draw Room Floor
      const floor = this.add.tileSprite(room.x, room.y, room.w, room.h, "dungeon_tile_b").setDepth(1).setAlpha(0.8);
      floor.setTint(0x334455);
      
      // Draw Room Border (Visual Shadow)
      const shadow = this.add.graphics();
      shadow.fillStyle(0x000000, 0.4);
      shadow.fillRect(room.x - room.w/2 - 10, room.y - room.h/2 - 10, room.w + 20, room.h + 20);
      shadow.setDepth(0.5);

      // Add random decor
      for(let i=0; i<Math.floor(room.w * room.h / 50000); i++) {
        const dx = Phaser.Math.Between(-room.w/2 + 40, room.w/2 - 40);
        const dy = Phaser.Math.Between(-room.h/2 + 40, room.h/2 - 40);
        const asset = Phaser.Utils.Array.GetRandom(["dungeon_rock_a", "dungeon_rock_b", "dungeon_bush_dead"]);
        this.add.image(room.x + dx, room.y + dy, asset).setScale(Phaser.Math.FloatBetween(0.7, 1.1)).setTint(0x445566).setDepth(2);
      }
    });

    // Draw Corridors
    this.dungeonLayoutData.corridors.forEach(c => {
      const cx = (c.x1 + c.x2) / 2;
      const cy = (c.y1 + c.y2) / 2;
      const cw = Math.abs(c.x2 - c.x1) + 100;
      const ch = Math.abs(c.y2 - c.y1) + 120;
      this.add.tileSprite(cx, cy, cw, ch, "dungeon_tile_b").setTint(0x223344).setDepth(1);
    });
  }

  createCollisionBlocks() {
    this.obstacles = this.physics.add.staticGroup();
    
    // Simple logic: walls are outside rooms
    this.dungeonLayoutData.rooms.forEach(room => {
      // Top wall
      this.addWall(room.x, room.y - room.h/2 - 20, room.w + 40, 40);
      // Bottom wall
      this.addWall(room.x, room.y + room.h/2 + 20, room.w + 40, 40);
      // Left wall
      this.addWall(room.x - room.w/2 - 20, room.y, 40, room.h + 40);
      // Right wall
      this.addWall(room.x + room.w/2 + 20, room.y, 40, room.h + 40);
    });
  }

  addWall(x, y, w, h) {
    const wall = this.add.rectangle(x, y, w, h, 0x000000, 0);
    this.physics.add.existing(wall, true);
    this.obstacles.add(wall);
    
    // Visual for wall
    this.add.tileSprite(x, y, w, h, "dungeon_tile_a").setTint(0x0a0c10).setDepth(5);
  }

  // --- Input & Movement ---
  createInput() {
    this.actionKeys = this.input.keyboard.addKeys({
      up: 'W', down: 'S', left: 'A', right: 'D',
      w: 'W', a: 'A', s: 'S', d: 'D',
      interact: 'E', close: 'ESC', confirm: 'ENTER',
      inventory: 'I', skills: 'K', questList: 'Q', classSkill: 'F', character: 'C'
    });

    this.input.on("pointerdown", (pointer) => {
      this.game?.canvas?.focus();
      if (pointer.button === 0) this.handleBasicAttack();
    });
  }

  handleMovement() {
    let horizontal = 0;
    let vertical = 0;
    if (this.actionKeys.left.isDown || this.actionKeys.a.isDown) horizontal -= 1;
    if (this.actionKeys.right.isDown || this.actionKeys.d.isDown) horizontal += 1;
    if (this.actionKeys.up.isDown || this.actionKeys.w.isDown) vertical -= 1;
    if (this.actionKeys.down.isDown || this.actionKeys.s.isDown) vertical += 1;

    if (horizontal !== 0 || vertical !== 0) {
      const dir = new Phaser.Math.Vector2(horizontal, vertical).normalize();
      this.playerFacing = dir.clone();
      this.player.body.setVelocity(dir.x * this.playerSpeed, dir.y * this.playerSpeed);
      this.setPlayerAnimation(true, dir.x);
    } else {
      this.player.body.setVelocity(0, 0);
      this.setPlayerAnimation(false);
    }
  }

  handleInputActions() {
    if (Phaser.Input.Keyboard.JustDown(this.actionKeys.inventory)) this.togglePanel('inventory');
    if (Phaser.Input.Keyboard.JustDown(this.actionKeys.skills)) this.togglePanel('skills');
    if (Phaser.Input.Keyboard.JustDown(this.actionKeys.questList)) this.togglePanel('quests');
    if (Phaser.Input.Keyboard.JustDown(this.actionKeys.character)) this.togglePanel('character');
    if (Phaser.Input.Keyboard.JustDown(this.actionKeys.classSkill)) this.useClassSkill();
    
    if (this.activeInteractable && Phaser.Input.Keyboard.JustDown(this.actionKeys.interact)) {
      this.openDialog(this.activeInteractable);
    }
  }

  // --- Combat ---
  handleBasicAttack() {
    if (this.time.now < this.attackReadyAt) return;
    this.attackReadyAt = this.time.now + this.attackCooldownMs;

    const hitX = this.player.x + this.playerFacing.x * 50;
    const hitY = this.player.y + this.playerFacing.y * 50;
    
    this.spawnAnimatedEffect("fx_dust_01", "fx-dust-01", hitX, hitY, { scale: 0.8 });
    
    this.enemyPlaceholders.forEach(enemy => {
      if (enemy.hp > 0 && Phaser.Math.Distance.Between(hitX, hitY, enemy.x, enemy.y) < 60) {
        this.damageEnemy(enemy, GameState.getWeaponAp(this.registry));
      }
    });
  }

  useClassSkill() {
    if (this.time.now < this.classSkillReadyAt) return;
    const skill = GameState.CLASS_SKILL_DEFS[this.registry.get("playerClass") || "warrior"];
    if (this.currentMp < skill.mpCost) return;

    this.currentMp -= skill.mpCost;
    this.classSkillReadyAt = this.time.now + skill.cooldownMs;
    
    const hitX = this.player.x + this.playerFacing.x * 100;
    const hitY = this.player.y + this.playerFacing.y * 100;
    
    this.spawnAnimatedEffect("fx_explosion_01", "fx-explosion-01", hitX, hitY, { scale: 1.2 });
    
    this.enemyPlaceholders.forEach(enemy => {
      if (enemy.hp > 0 && Phaser.Math.Distance.Between(hitX, hitY, enemy.x, enemy.y) < 120) {
        this.damageEnemy(enemy, GameState.getWeaponAp(this.registry) * skill.damageScale);
      }
    });
  }

  damageEnemy(enemy, amount) {
    const finalDamage = Math.floor(amount * Phaser.Math.FloatBetween(0.9, 1.1));
    enemy.hp -= finalDamage;
    this.showDamageText(enemy.x, enemy.y - 40, `-${finalDamage}`, "#ff4444");
    
    // Visual feedback
    enemy.sprite.setTint(0xff0000);
    this.time.delayedCall(100, () => enemy.sprite.clearTint());

    if (enemy.hp <= 0) this.defeatEnemy(enemy);
  }

  defeatEnemy(enemy) {
    enemy.hp = 0;
    this.spawnAnimatedEffect("fx_explosion_01", "fx-explosion-01", enemy.x, enemy.y, { scale: 0.6 });
    enemy.visuals.forEach(v => v.destroy());
    
    // Rewards
    this.runRewards.gold += 15;
    this.updatePhaseProgression();
  }

  damagePlayer(amount) {
    if (this.isRespawning) return;
    this.currentHp -= amount;
    this.cameras.main.shake(100, 0.01);
    this.showDamageText(this.player.x, this.player.y - 40, `-${amount}`, "#ff0000");
    
    if (this.currentHp <= 0) this.handlePlayerDeath();
  }

  handlePlayerDeath() {
    this.isRespawning = true;
    this.cameras.main.fadeOut(500);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.player.setPosition(this.playerRespawnPoint.x, this.playerRespawnPoint.y);
      this.currentHp = GameState.getMaxHp(this.registry);
      this.cameras.main.fadeIn(500);
      this.isRespawning = false;
    });
  }

  // --- AI ---
  updateEnemyAi() {
    const delta = this.game.loop.delta / 1000;
    this.enemyPlaceholders.forEach(enemy => {
      if (enemy.hp <= 0) return;

      const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      
      if (dist < 50) {
        this.tryEnemyAttack(enemy);
      } else if (dist < 300) {
        // Chase
        const dir = new Phaser.Math.Vector2(this.player.x - enemy.x, this.player.y - enemy.y).normalize();
        enemy.x += dir.x * enemy.speed * delta;
        enemy.y += dir.y * enemy.speed * delta;
        enemy.visuals.forEach(v => { v.x = enemy.x; v.y = enemy.y + (v === enemy.sprite ? 0 : 22); });
        enemy.sprite.setFlipX(dir.x < 0);
        enemy.sprite.play(enemy.runAnim, true);
      } else {
        // Return home or Idle
        enemy.sprite.play(enemy.idleAnim, true);
      }
    });
  }

  tryEnemyAttack(enemy) {
    if (this.time.now < (enemy.lastAttackAt || 0) + 1500) return;
    enemy.lastAttackAt = this.time.now;
    this.damagePlayer(enemy.damage);
  }

  // --- Factories ---
  createPlayer(x, y) {
    this.player = this.physics.add.sprite(x, y, "player_idle_sheet").setScale(0.35).setDepth(10);
    this.player.body.setSize(40, 40).setOffset(76, 120);
    this.player.play("player-idle");
    this.physics.add.collider(this.player, this.obstacles);
  }

  createEnemyPlaceholders() {
    this.dungeonLayoutData.rooms.forEach(room => {
      if (room.type === 'combat') {
        const count = Phaser.Math.Between(2, 4);
        for(let i=0; i<count; i++) {
          const rx = room.x + Phaser.Math.Between(-room.w/3, room.w/3);
          const ry = room.y + Phaser.Math.Between(-room.h/3, room.h/3);
          this.createKekon(rx, ry, room.phaseId);
        }
      } else if (room.type === 'boss') {
        this.createKekonBoss(room.x, room.y, room.phaseId);
      }
    });
  }

  createKekon(x, y, phaseId) {
    const sprite = this.add.sprite(x, y, "enemy_kekon_idle").setScale(0.3).setDepth(9);
    const shadow = this.add.ellipse(x, y + 22, 38, 14, 0x000000, 0.22).setDepth(8);
    sprite.play("enemy-kekon-idle");
    
    this.enemyPlaceholders.push({
      x, y, hp: 30, speed: 60, damage: 8,
      sprite, visuals: [sprite, shadow],
      idleAnim: "enemy-kekon-idle", runAnim: "enemy-kekon-run",
      phaseId
    });
  }

  createKekonBoss(x, y, phaseId) {
    const sprite = this.add.sprite(x, y, "enemy_kekon_boss_idle").setScale(0.6).setDepth(9);
    const shadow = this.add.ellipse(x, y + 44, 80, 30, 0x000000, 0.3).setDepth(8);
    sprite.play("enemy-kekon-boss-idle");
    
    this.enemyPlaceholders.push({
      x, y, hp: 300, speed: 40, damage: 20,
      sprite, visuals: [sprite, shadow],
      idleAnim: "enemy-kekon-boss-idle", runAnim: "enemy-kekon-boss-run",
      phaseId
    });
  }

  createPhaseGates() {
    // Create physical gates between phases
    this.dungeonLayoutData.corridors.forEach((c, idx) => {
      const cx = (c.x1 + c.x2) / 2;
      const cy = (c.y1 + c.y2) / 2;
      const gate = this.add.rectangle(cx, cy, 40, 120, 0x550000, 0.8).setDepth(6);
      this.physics.add.existing(gate, true);
      this.obstacles.add(gate);
      this.phaseGates.push({ gate, phaseId: idx + 1 });
    });
  }

  updatePhaseProgression() {
    // Check if current phase is clear
    const currentEnemies = this.enemyPlaceholders.filter(e => e.phaseId === this.phaseProgress + 1 && e.hp > 0);
    if (currentEnemies.length === 0) {
      this.phaseProgress++;
      // Open gate
      const gateObj = this.phaseGates.find(g => g.phaseId === this.phaseProgress);
      if (gateObj) {
        gateObj.gate.destroy();
        this.showDamageText(this.player.x, this.player.y - 80, "PHASE CLEAR - GATE OPEN", "#ffff00");
      }
    }
  }

  // --- UI ---
  initUiManager() {
    this.uiPanels = {
      inventory: { open: false, elements: [] },
      skills: { open: false, elements: [] },
      quests: { open: false, elements: [] }
    };
  }

  togglePanel(type) {
    const panel = this.uiPanels[type];
    if (panel.open) {
      this.hidePanel(type);
    } else {
      Object.keys(this.uiPanels).forEach(k => this.hidePanel(k));
      this.showPanel(type);
    }
  }

  showPanel(type) {
    this.uiPanels[type].open = true;
    if (this.uiPanels[type].elements.length === 0) this.createPanelUi(type);
    this.uiPanels[type].elements.forEach(el => el.setVisible(true));
  }

  hidePanel(type) {
    this.uiPanels[type].open = false;
    this.uiPanels[type].elements.forEach(el => el.setVisible(false));
    this.game?.canvas?.focus();
  }

  createPanelUi(type) {
    const { width, height } = this.scale;
    const bg = this.add.rectangle(width/2, height/2, 500, 400, 0x1a2028, 0.95).setScrollFactor(0).setDepth(200).setInteractive();
    const title = this.add.text(width/2, height/2 - 170, type.toUpperCase(), { fontSize: "24px", color: "#f4df9c" }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
    const closeTxt = this.add.text(width/2, height/2 + 170, "Press ESC to Close", { fontSize: "14px", color: "#888" }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
    
    this.uiPanels[type].elements.push(bg, title, closeTxt);
    
    if (type === 'inventory') {
      const info = this.add.text(width/2, height/2, "Manage your equipment and items here.", { fontSize: "18px", color: "#fff" }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
      this.uiPanels[type].elements.push(info);
    }
  }

  handleGlobalPanelClose() {
    const active = Object.keys(this.uiPanels).find(k => this.uiPanels[k].open);
    if (active) {
      this.hidePanel(active);
      return true;
    }
    return false;
  }

  drawUiLayer() {
    const { width, height } = this.scale;
    this.hpBar = this.add.rectangle(20, height - 40, 200, 20, 0xff0000).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);
    this.mpBar = this.add.rectangle(20, height - 15, 150, 10, 0x0000ff).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);
  }

  refreshHudPanel() {
    const hpRatio = Math.max(0, this.currentHp / GameState.getMaxHp(this.registry));
    const mpRatio = Math.max(0, this.currentMp / GameState.getMaxMp(this.registry));
    this.hpBar.width = 200 * hpRatio;
    this.mpBar.width = 150 * mpRatio;
  }

  drawDungeonHeader() {
    const { width } = this.scale;
    this.add.rectangle(width/2, 30, 300, 40, 0x000000, 0.6).setScrollFactor(0).setDepth(100);
    this.dungeonTitle = this.add.text(width/2, 30, "FORGOTTEN HALLS", { fontSize: "20px", color: "#f4df9c" }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
  }

  // --- Helpers ---
  createAnimations() {
    const configs = [
      { key: "player-idle", tex: "player_idle_sheet", end: 7 },
      { key: "player-run", tex: "player_run_sheet", end: 5 },
      { key: "enemy-kekon-idle", tex: "enemy_kekon_idle", end: 6 },
      { key: "enemy-kekon-run", tex: "enemy_kekon_run", end: 5 },
      { key: "enemy-kekon-boss-idle", tex: "enemy_kekon_boss_idle", end: 6 },
      { key: "enemy-kekon-boss-run", tex: "enemy_kekon_boss_run", end: 5 },
      { key: "fx-dust-01", tex: "fx_dust_01", end: 7, rate: 20 },
      { key: "fx-explosion-01", tex: "fx_explosion_01", end: 7, rate: 20 }
    ];
    configs.forEach(c => {
      if (!this.anims.exists(c.key)) {
        this.anims.create({
          key: c.key,
          frames: this.anims.generateFrameNumbers(c.tex, { start: 0, end: c.end }),
          frameRate: c.rate || 10,
          repeat: c.repeat ?? -1
        });
      }
    });
  }

  spawnAnimatedEffect(key, anim, x, y, { scale = 1 } = {}) {
    const s = this.add.sprite(x, y, key).setScale(scale).setDepth(50);
    s.play(anim).once("animationcomplete", () => s.destroy());
  }

  showDamageText(x, y, text, color) {
    const t = this.add.text(x, y, text, { fontSize: "24px", color, stroke: "#000", strokeThickness: 4 }).setOrigin(0.5).setDepth(100);
    this.tweens.add({ targets: t, y: y - 50, alpha: 0, duration: 800, onComplete: () => t.destroy() });
  }

  // --- Goals & Interaction ---
  createReturnGate() {
    const x = 150, y = this.dungeonLayoutData.entrySpawn.y;
    const gate = this.add.rectangle(x, y, 60, 100, 0x4488ff, 0.3).setDepth(6);
    this.add.text(x, y - 60, "CITY GATE", { fontSize: "14px", color: "#4488ff" }).setOrigin(0.5).setDepth(7);
    
    this.interactables.push({
      x, y, name: "Return to City",
      promptRadius: 80,
      onConfirm: () => {
        this.isTransitioningOut = true;
        this.scene.start("PrototypeScene", { dungeonReturn: { cleared: false } });
      }
    });
  }

  createCompletionExit() {
    const bossRoom = this.dungeonLayoutData.rooms.find(r => r.type === 'boss');
    const x = bossRoom.x + 250, y = bossRoom.y;
    
    this.completionExit = this.add.rectangle(x, y, 100, 100, 0xffff00, 0).setDepth(6);
    this.completionText = this.add.text(x, y - 70, "VICTORY CHEST", { fontSize: "18px", color: "#ffff00" }).setOrigin(0.5).setDepth(7).setVisible(false);
    
    this.interactables.push({
      x, y, name: "Claim Victory",
      promptRadius: 100,
      active: false,
      onConfirm: () => {
        this.isTransitioningOut = true;
        this.scene.start("PrototypeScene", { dungeonReturn: { cleared: true, goldGained: this.runRewards.gold } });
      }
    });
  }

  createInteractionUi() {
    this.interactionPrompt = this.add.container(0, 0).setDepth(1000).setScrollFactor(0).setVisible(false);
    const bg = this.add.rectangle(0, 0, 220, 40, 0x000000, 0.8).setOrigin(0.5);
    const txt = this.add.text(0, 0, "[E] INTERACT", { fontSize: "16px", color: "#ffffff" }).setOrigin(0.5);
    this.interactionPrompt.add([bg, txt]);
  }

  updateInteractionPrompt() {
    let nearest = null;
    let minDist = 100;
    
    this.interactables.forEach(i => {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, i.x, i.y);
      if (d < (i.promptRadius || 80) && d < minDist) {
        minDist = d;
        nearest = i;
      }
    });

    if (nearest) {
      this.activeInteractable = nearest;
      this.interactionPrompt.setPosition(this.scale.width / 2, this.scale.height - 120);
      this.interactionPrompt.setVisible(true);
    } else {
      this.activeInteractable = null;
      this.interactionPrompt.setVisible(false);
    }
  }

  openDialog(i) {
    this.dialogOpen = true;
    this.activeInteractable = i;
    
    const { width, height } = this.scale;
    this.dialogContainer = this.add.container(0, 0).setDepth(2000).setScrollFactor(0);
    const bg = this.add.rectangle(width/2, height - 100, 600, 100, 0x000000, 0.9).setOrigin(0.5);
    const name = this.add.text(width/2 - 280, height - 135, i.name, { fontSize: "18px", color: "#f4df9c", fontStyle: "bold" });
    const msg = this.add.text(width/2, height - 90, "Do you want to proceed?", { fontSize: "16px", color: "#ffffff" }).setOrigin(0.5);
    const hint = this.add.text(width/2, height - 65, "[ENTER] Confirm / [ESC] Close", { fontSize: "12px", color: "#888" }).setOrigin(0.5);
    
    this.dialogContainer.add([bg, name, msg, hint]);
  }

  handleDialogInput() {
    if (Phaser.Input.Keyboard.JustDown(this.actionKeys.confirm)) {
      if (this.activeInteractable?.onConfirm) this.activeInteractable.onConfirm();
      this.closeDialog();
    } else if (Phaser.Input.Keyboard.JustDown(this.actionKeys.close) || Phaser.Input.Keyboard.JustDown(this.actionKeys.interact)) {
      this.closeDialog();
    }
  }

  closeDialog() {
    this.dialogOpen = false;
    if (this.dialogContainer) this.dialogContainer.destroy();
  }

  updatePhaseProgression() {
    // Check if current phase is clear
    const currentEnemies = this.enemyPlaceholders.filter(e => e.phaseId === this.phaseProgress + 1 && e.hp > 0);
    
    if (currentEnemies.length === 0 && this.phaseProgress < this.maxPhases) {
      this.phaseProgress++;
      
      // Open gate
      const gateObj = this.phaseGates.find(g => g.phaseId === this.phaseProgress);
      if (gateObj) {
        gateObj.gate.destroy();
        this.showDamageText(this.player.x, this.player.y - 80, "PHASE CLEAR - GATE OPEN", "#ffff00");
      }
      
      // If boss cleared, enable victory chest
      if (this.phaseProgress === this.maxPhases) {
        this.dungeonCleared = true;
        this.completionText.setVisible(true);
        const exit = this.interactables.find(i => i.name === "Claim Victory");
        if (exit) exit.active = true;
      }
    }
  }
}

window.DungeonPrototypeScene = DungeonPrototypeScene;
