class DungeonPrototypeScene extends Phaser.Scene {
  constructor() {
    super("DungeonPrototypeScene");
    this.actionKeys = null;
    this.activeInteractable = null;
    this.attackCooldownMs = 300;
    this.attackReadyAt = 0;
    this.classSkillReadyAt = 0;
    this.skillReadyAtById = {};
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
    this.petSummoned = false;
    this.pet = null;
    this.mercenary = null;
    this.mercenary = null;
    this.dungeonEventNodes = [];
    this.runRewards = { gold: 0, materials: [], cycleBonus: 0, preparationBonus: 0, statPoints: 0 };
    this.chatLines = [];
    this.chatHistory = [];
    this.combatLogLines = [];
    this.combatLogHistory = [];
    this.hotbarSlotVisuals = [];
    this.phaseProgress = 0;
    this.maxPhases = 4;
    this.enemyAttackRange = 76;
    
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
    this.loadClassAndCatImages();
    this.loadPetImages();
    
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

    // Editor-made dungeon template JSON files
    if (window.DungeonTemplates?.list) {
      window.DungeonTemplates.list().forEach((def) => {
        if (def?.id && def?.jsonPath && !this.cache.json.exists(`dungeon_template_${def.id}`)) {
          this.load.json(`dungeon_template_${def.id}`, def.jsonPath);
        }
      });
    }
  }

  create(data = {}) {
    const resolvedTemplate = this.resolveDungeonTemplateData(data);
    this.selectedDungeonId = resolvedTemplate.id;
    this.selectedDifficultyKey = window.DungeonTemplates?.normalizeDifficulty?.(data?.difficulty || data?.difficultyKey || "normal") || (data?.difficulty || "normal");
    this.selectedDifficulty = window.DungeonTemplates?.getDifficulty?.(this.selectedDifficultyKey) || { key: "normal", label: "Normal", enemyHp: 1, enemyDamage: 1, bossHp: 1, gold: 1, drop: 1 };
    this.dungeonTemplate = resolvedTemplate.template;
    this.usingTemplateDungeon = !!this.dungeonTemplate;
    this.__bossGoldGranted = false;
    this.__bossEquipmentRewardGranted = null;
    this.__bossMaterialsGranted = null;
    this.enemyDefeatCount = 0;
    this.dungeonCleared = false;
    this.rewardPanelOpen = false;
    this.pendingTownReturn = null;
    this.lootDrops = [];
    this.petSummoned = false;
    this.pet = null;

    const worldWidth = this.dungeonTemplate?.width || 4000;
    const worldHeight = this.dungeonTemplate?.height || 1200;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBackgroundColor(this.dungeonTemplate?.theme?.backgroundColor || "#10131a");

    // Init State
    this.currentHp = GameState.getMaxHp(this.registry);
    this.currentMp = GameState.getMaxMp(this.registry);
    this.playerSpeed = GameState.getPlayerSpeed(this.registry);
    GameState.attachAutoSave?.(this, this.registry);

    this.initUiManager();

    if (this.usingTemplateDungeon) {
      this.dungeonLayoutData = this.buildTemplateDungeonLayout(this.dungeonTemplate);
      this.drawTemplateDungeonEnvironment(this.dungeonTemplate);
      this.createTemplateCollisionBlocks(this.dungeonTemplate);
    } else {
      this.dungeonLayoutData = this.generateDungeonLayout(worldWidth, worldHeight);
      this.drawDungeonEnvironment(worldWidth, worldHeight);
      this.createCollisionBlocks();
    }

    this.playerRespawnPoint = { ...this.dungeonLayoutData.entrySpawn };

    // Animations
    this.createAnimations();

    // Player
    const spawnX = data?.spawn?.x ?? this.dungeonLayoutData.entrySpawn.x;
    const spawnY = data?.spawn?.y ?? this.dungeonLayoutData.entrySpawn.y;
    this.createPlayer(spawnX, spawnY);
    this.createMercenaryCompanion();
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // Enemies
    if (this.usingTemplateDungeon) this.createTemplateEnemyPlaceholders(this.dungeonTemplate);
    else this.createEnemyPlaceholders();

    // Goals & Interaction
    if (this.usingTemplateDungeon) {
      this.createTemplateReturnGate(this.dungeonTemplate);
      this.createTemplateCompletionExit(this.dungeonTemplate);
    } else {
      this.createReturnGate();
      this.createCompletionExit();
    }
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

    // Phase Gates: generated dungeons still use them; template dungeons are open layouts.
    this.phaseGates = [];
    if (!this.usingTemplateDungeon) this.createPhaseGates();

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

      this.handleInputActions();

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
      this.updateEnemyAi();
      this.updatePet();
      this.updateMercenaryCompanion();
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
    this.add.rectangle(w / 2, h / 2, w, h, 0x05070a, 1).setDepth(-2);
    this.add.tileSprite(w/2, h/2, w, h, "dungeon_tile_a").setTint(0x151922).setAlpha(0.92).setDepth(0);
    
    this.dungeonLayoutData.rooms.forEach(room => {
      const isBoss = room.type === "boss";
      this.add.rectangle(room.x, room.y + 14, room.w + 56, room.h + 56, 0x000000, 0.52).setDepth(0.4);
      this.add.rectangle(room.x, room.y, room.w + 28, room.h + 28, isBoss ? 0x331816 : 0x141b22, 0.98)
        .setStrokeStyle(4, isBoss ? 0x8b4f2e : 0x4d5d5f, 0.8).setDepth(0.8);
      const floor = this.add.tileSprite(room.x, room.y, room.w, room.h, "dungeon_tile_b").setDepth(1).setAlpha(0.92);
      floor.setTint(isBoss ? 0x46322e : 0x303c42);

      this.add.rectangle(room.x, room.y - room.h / 2 + 10, room.w, 20, 0x090b10, 0.65).setDepth(3);
      this.add.rectangle(room.x, room.y + room.h / 2 - 10, room.w, 20, 0x090b10, 0.35).setDepth(3);
      this.add.rectangle(room.x - room.w / 2 + 10, room.y, 20, room.h, 0x090b10, 0.45).setDepth(3);
      this.add.rectangle(room.x + room.w / 2 - 10, room.y, 20, room.h, 0x090b10, 0.45).setDepth(3);

      const torchCount = Math.max(2, Math.floor(room.w / 260));
      for (let i = 0; i < torchCount; i++) {
        const tx = room.x - room.w / 2 + 90 + i * ((room.w - 180) / Math.max(1, torchCount - 1));
        const ty = room.y - room.h / 2 + 34;
        this.add.circle(tx, ty, 8, 0xff9f35, 0.95).setDepth(6);
        this.add.circle(tx, ty, isBoss ? 58 : 42, 0xff8a22, isBoss ? 0.12 : 0.08).setDepth(2);
      }

      for(let i=0; i<Math.floor(room.w * room.h / 42000); i++) {
        const dx = Phaser.Math.Between(-room.w/2 + 40, room.w/2 - 40);
        const dy = Phaser.Math.Between(-room.h/2 + 40, room.h/2 - 40);
        const asset = Phaser.Utils.Array.GetRandom(["dungeon_rock_a", "dungeon_rock_b", "dungeon_bush_dead", "dungeon_tree_01"]);
        this.add.image(room.x + dx, room.y + dy, asset).setScale(Phaser.Math.FloatBetween(0.55, 1.0)).setTint(isBoss ? 0x7a5140 : 0x526367).setAlpha(0.86).setDepth(2);
      }
    });

    this.dungeonLayoutData.corridors.forEach(c => {
      const cx = (c.x1 + c.x2) / 2;
      const cy = (c.y1 + c.y2) / 2;
      const cw = Math.abs(c.x2 - c.x1) + 100;
      const ch = Math.abs(c.y2 - c.y1) + 120;
      this.add.rectangle(cx, cy + 10, cw + 34, ch + 34, 0x000000, 0.42).setDepth(0.6);
      this.add.tileSprite(cx, cy, cw, ch, "dungeon_tile_b").setTint(0x222d34).setAlpha(0.88).setDepth(1);
      this.add.rectangle(cx, cy - ch / 2 + 8, cw, 16, 0x080b10, 0.55).setDepth(3);
      this.add.rectangle(cx, cy + ch / 2 - 8, cw, 16, 0x080b10, 0.38).setDepth(3);
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
      inventory: 'I', skills: 'K', questList: 'Q', classSkill: 'F', character: 'C', pet: 'P'
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
    if (Phaser.Input.Keyboard.JustDown(this.actionKeys.pet)) this.togglePet();
    
    if (
      this.activeInteractable
      && (Phaser.Input.Keyboard.JustDown(this.actionKeys.interact) || Phaser.Input.Keyboard.JustDown(this.actionKeys.confirm))
    ) {
      this.activeInteractable.onConfirm?.();
    }
  }

  // --- Combat ---
  handleBasicAttack() {
    if (this.time.now < this.attackReadyAt) return;
    const profile = this.getClassCombatProfile();
    this.attackReadyAt = this.time.now + profile.cooldownMs;

    const pointer = this.input?.activePointer;
    let worldPoint = null;
    if (pointer) {
      worldPoint = pointer.positionToCamera(this.cameras.main);
      const aim = new Phaser.Math.Vector2(worldPoint.x - this.player.x, worldPoint.y - this.player.y);
      if (aim.lengthSq() > 4) {
        this.playerFacing = aim.normalize();
      }
    }

    const hitX = worldPoint?.x ?? (this.player.x + this.playerFacing.x * profile.hitOffset);
    const hitY = worldPoint?.y ?? (this.player.y + this.playerFacing.y * profile.hitOffset);
    
    this.spawnAnimatedEffect(profile.projectile ? "fx_explosion_01" : "fx_dust_01", profile.projectile ? "fx-explosion-01" : "fx-dust-01", this.player.x + this.playerFacing.x * Math.min(profile.hitOffset, 90), this.player.y + this.playerFacing.y * Math.min(profile.hitOffset, 90), { scale: profile.effectScale });
    
    const target = this.enemyPlaceholders
      .filter(enemy => enemy.hp > 0 && Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y) <= profile.range && Phaser.Math.Distance.Between(hitX, hitY, enemy.x, enemy.y) <= profile.targetRadius)
      .sort((a, b) => Phaser.Math.Distance.Between(hitX, hitY, a.x, a.y) - Phaser.Math.Distance.Between(hitX, hitY, b.x, b.y))[0];

    if (target) {
      if (profile.projectile) this.spawnRangedTrace(this.player.x, this.player.y - 12, target.x, target.y, profile.tint);
      this.damageEnemy(target, GameState.getWeaponAp(this.registry) * profile.damageMultiplier, profile.damageType);
      GameState.applyDurabilityWear?.(this.registry, ["weapon"], 1, "dungeon attack");
    } else {
      this.showDamageText(hitX, hitY - 20, "MISS", "#dddddd");
    }
  }

  getClassCombatProfile() {
    const playerClass = String(this.registry.get("playerClass") || GameState.DEFAULT_CLASS || "warrior").toLowerCase();
    return GameState.getBasicAttackProfile?.(playerClass) || window.ClassBalanceConfig?.getBasicAttackProfile?.(playerClass) || {};
  }

  spawnRangedTrace(fromX, fromY, toX, toY, tint = 0xf4df9c) {
    const line = this.add.line(0, 0, fromX, fromY, toX, toY, tint, 0.5).setOrigin(0, 0).setDepth(80);
    const shot = this.add.circle(fromX, fromY, 4, tint, 0.95).setDepth(81);
    this.tweens?.add?.({
      targets: shot,
      x: toX,
      y: toY,
      duration: 120,
      onComplete: () => {
        shot.destroy();
        line.destroy();
      }
    });
  }

  useClassSkill() {
    const playerClass = (this.registry.get("playerClass") || GameState.DEFAULT_CLASS || "warrior").toLowerCase();
    const skill = GameState.getClassSkillForClass?.(playerClass) || GameState.CLASS_SKILL_DEFS[playerClass];
    if (!skill) {
      this.showDamageText(this.player.x, this.player.y - 50, "NO SKILL", "#dddddd");
      return;
    }
    if (this.currentMp < skill.mpCost) {
      this.showDamageText(this.player.x, this.player.y - 50, "NO MP", "#77a9ff");
      return;
    }
    const readyAt = this.getSkillReadyAt(skill.id);
    if (this.time.now < readyAt) {
      this.showDamageText(this.player.x, this.player.y - 50, `${Math.ceil((readyAt - this.time.now) / 1000)}s`, "#dddddd");
      return;
    }

    this.currentMp -= skill.mpCost;
    this.setSkillReadyAt(skill.id, this.time.now + skill.cooldownMs);

    const pointer = this.input?.activePointer;
    if (pointer) {
      const worldPoint = pointer.positionToCamera(this.cameras.main);
      const aim = new Phaser.Math.Vector2(worldPoint.x - this.player.x, worldPoint.y - this.player.y);
      if (aim.lengthSq() > 4) {
        this.playerFacing = aim.normalize();
      }
    }
    
    const hitX = this.player.x + this.playerFacing.x * 100;
    const hitY = this.player.y + this.playerFacing.y * 100;
    
    this.spawnAnimatedEffect("fx_explosion_01", "fx-explosion-01", hitX, hitY, { scale: 1.2 });
    
    this.enemyPlaceholders.forEach(enemy => {
      if (enemy.hp > 0 && Phaser.Math.Distance.Between(hitX, hitY, enemy.x, enemy.y) < 120) {
        this.damageEnemy(enemy, GameState.getWeaponAp(this.registry) * skill.damageScale);
        GameState.applyDurabilityWear?.(this.registry, ["weapon"], 1, "dungeon skill");
      }
    });
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
    
    // Dungeon gold is now a real world pickup so the loot cat can collect it.
    this.spawnDungeonDrop?.(enemy.x + Phaser.Math.Between(-14, 14), enemy.y + Phaser.Math.Between(-10, 14), { type: "gold", amount: 15 });
    this.updatePhaseProgression();
  }

  damagePlayer(amount) {
    if (this.isRespawning) return;
    this.currentHp -= amount;
    if (this.currentHp < 0) this.currentHp = 0;
    this.cameras.main.shake(100, 0.01);
    this.showDamageText(this.player.x, this.player.y - 40, `-${amount}`, "#ff0000");
    this.refreshHudPanel();
    
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
      
      const attackRange = enemy.attackRange || (enemy.isBoss ? 118 : this.enemyAttackRange);
      if (dist < attackRange) {
        this.tryEnemyAttack(enemy);
      } else if (dist < 360) {
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
    if (this.time.now < (enemy.lastAttackAt || 0) + 1200) return;
    enemy.lastAttackAt = this.time.now;
    this.showDamageText(enemy.x, enemy.y - 56, "ATK", "#ffbb66");
    const liveDistance = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    if (liveDistance <= (enemy.attackRange || this.enemyAttackRange) + 10) {
      this.damagePlayer(Math.max(1, enemy.damage || 1));
    }
  }

  // --- Factories ---
  createPlayer(x, y) {
    const classTexture = this.getClassPlayerTextureKey(new Phaser.Math.Vector2(0, 1));
    this.player = this.physics.add.sprite(x, y, classTexture || "player_idle_sheet").setScale(classTexture ? 1 : 0.35).setDepth(10);
    if (classTexture) {
      this.player.setDisplaySize(46, 46);
      this.player.body.setSize(30, 30).setOffset(8, 8);
    } else {
      this.player.body.setSize(40, 40).setOffset(76, 120);
      this.player.play("player-idle");
    }
    this.physics.add.collider(this.player, this.obstacles);
  }

  setPlayerAnimation(moving = false, directionX = 0) {
    if (!this.player) return;
    const classTexture = this.getClassPlayerTextureKey(this.playerFacing);
    if (this.safeSetTexture(this.player, classTexture)) {
      this.player.anims?.stop?.();
      this.player.setDisplaySize(46, 46);
      this.player.setFlipX(false);
      this.player.body?.setSize?.(30, 30);
      this.player.body?.setOffset?.(8, 8);
      this.player.setAngle(moving ? Math.sin(this.time.now / 90) * 1.8 : 0);
      return;
    }
    if (directionX !== 0) this.player.setFlipX(directionX < 0);
    const animKey = moving ? "player-run" : "player-idle";
    if (this.anims.exists(animKey)) this.player.play(animKey, true);
  }

  loadClassAndCatImages() {
    const base = "class%20and%20cat/";
    const dirs = ["south", "south-east", "east", "north-east", "north", "north-west", "west", "south-west"];
    const folders = {
      warrior: "A_32px_low_top-down_pixel_art_fantasy_MMORPG_warri",
      mage: "A_32px_low_top-down_pixel_art_fantasy_MMORPG_mage",
      rogue: "A_32px_low_top-down_pixel_art_fantasy_MMORPG_rogue",
      archer: "A_32px_low_top-down_pixel_art_fantasy_MMORPG_arche",
    };
    Object.entries(folders).forEach(([className, folder]) => {
      dirs.forEach((dir) => this.load.image(`dungeon_class_${className}_${dir}`, `${base}${folder}/rotations/${dir}.png`));
    });
  }

  getDirectionName(vec) {
    const angle = Phaser.Math.RadToDeg(Math.atan2(vec?.y || 0, vec?.x || 0));
    if (angle >= -22.5 && angle < 22.5) return "east";
    if (angle >= 22.5 && angle < 67.5) return "south-east";
    if (angle >= 67.5 && angle < 112.5) return "south";
    if (angle >= 112.5 && angle < 157.5) return "south-west";
    if (angle >= 157.5 || angle < -157.5) return "west";
    if (angle >= -157.5 && angle < -112.5) return "north-west";
    if (angle >= -112.5 && angle < -67.5) return "north";
    return "north-east";
  }

  getClassPlayerTextureKey(direction = null) {
    const className = String(this.registry.get("playerClass") || GameState.DEFAULT_CLASS || "warrior").toLowerCase();
    const dir = this.getDirectionName(direction || this.playerFacing || new Phaser.Math.Vector2(0, 1));
    const key = `dungeon_class_${className}_${dir}`;
    return this.textures.exists(key) ? key : null;
  }

  safeSetTexture(target, key) {
    if (!target?.setTexture || !key || !this.textures?.exists?.(key)) return false;
    try {
      target.setTexture(key);
      return true;
    } catch (error) {
      console.warn("[DungeonPrototypeScene] Texture swap skipped:", key, error);
      return false;
    }
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
      x, y, hp: 30, speed: 60, damage: 8, attackRange: 92,
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
      x, y, hp: 300, speed: 40, damage: 20, attackRange: 128, isBoss: true,
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
      quests: { open: false, elements: [] },
      character: { open: false, elements: [] }
    };
    this.dungeonPanels = {
      inventory: window.InventoryPanel ? new InventoryPanel(this, this.registry, window.GameState) : null,
      skills: window.SkillPanel ? new SkillPanel(this, this.registry, window.GameState) : null,
      quests: window.QuestPanel ? new QuestPanel(this, this.registry, window.GameState) : null,
      character: window.CharacterPanel ? new CharacterPanel(this, this.registry, window.GameState) : null,
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
    if (this.dungeonPanels?.[type]) {
      this.dungeonPanels[type].show();
      return;
    }
    if (this.uiPanels[type].elements.length === 0) this.createPanelUi(type);
    this.uiPanels[type].elements.forEach(el => el.setVisible(true));
  }

  hidePanel(type) {
    this.uiPanels[type].open = false;
    this.dungeonPanels?.[type]?.hide?.();
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
    const { width } = this.scale;
    this.add.rectangle(20, 82, 220, 20, 0x1a2833, 0.9).setStrokeStyle(2, 0x415260, 0.8).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);
    this.hpBar = this.add.rectangle(22, 82, 216, 16, 0xff5555, 0.95).setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);
    this.add.rectangle(20, 110, 220, 14, 0x1a2833, 0.9).setStrokeStyle(2, 0x415260, 0.8).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);
    this.mpBar = this.add.rectangle(22, 110, 216, 10, 0x5588ff, 0.95).setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);
    this.add.rectangle(20, 133, 220, 12, 0x1a2833, 0.9).setStrokeStyle(1, 0x415260, 0.8).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);
    this.xpBar = this.add.rectangle(22, 133, 0, 8, 0xffd34f, 0.95).setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);
    this.xpText = this.add.text(246, 133, "", { fontSize: "10px", color: "#ffdf78", stroke: "#000", strokeThickness: 2 }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(102);
    this.add.rectangle(width - 105, 82, 170, 126, 0x101820, 0.82).setStrokeStyle(2, 0x60767b, 0.8).setScrollFactor(0).setDepth(100);
    this.add.text(width - 178, 28, "Mini Map", { fontSize: "12px", color: "#f8f1dc", stroke: "#000", strokeThickness: 2 }).setScrollFactor(0).setDepth(101);
    this.dungeonMinimapBounds = { x: width - 178, y: 48, width: 146, height: 84 };
    this.add.rectangle(this.dungeonMinimapBounds.x + 73, this.dungeonMinimapBounds.y + 42, 146, 84, 0x1e2630, 0.92).setStrokeStyle(1, 0x314554, 0.8).setScrollFactor(0).setDepth(101);
    this.dungeonMinimapDot = this.add.circle(this.dungeonMinimapBounds.x + 73, this.dungeonMinimapBounds.y + 42, 4, 0xf8f1dc).setScrollFactor(0).setDepth(102);
  }

  refreshHudPanel() {
    const hpRatio = Math.max(0, this.currentHp / GameState.getMaxHp(this.registry));
    const mpRatio = Math.max(0, this.currentMp / GameState.getMaxMp(this.registry));
    const xpState = GameState.getPlayerXpState?.(this.registry) || { level: this.registry.get("playerLevel") || 1, xp: this.registry.get("playerXp") || 0, next: 145 };
    const xpRatio = Math.max(0, Math.min(1, xpState.xp / Math.max(1, xpState.next)));
    this.hpBar.width = 216 * hpRatio;
    this.mpBar.width = 216 * mpRatio;
    if (this.xpBar) this.xpBar.width = 216 * xpRatio;
    if (this.xpText) this.xpText.setText(`Lv ${xpState.level} ${xpState.xp}/${xpState.next}`);
    if (this.dungeonMinimapDot && this.player && this.dungeonMinimapBounds) {
      const bounds = this.physics.world.bounds;
      const rx = Math.max(0, Math.min(1, this.player.x / Math.max(1, bounds.width)));
      const ry = Math.max(0, Math.min(1, this.player.y / Math.max(1, bounds.height)));
      this.dungeonMinimapDot.setPosition(this.dungeonMinimapBounds.x + rx * this.dungeonMinimapBounds.width, this.dungeonMinimapBounds.y + ry * this.dungeonMinimapBounds.height);
    }
  }

  drawDungeonHeader() {
    const { width } = this.scale;
    const templateName = this.dungeonTemplate?.name || (window.DungeonTemplates?.get?.(this.selectedDungeonId)?.name) || "Forgotten Halls";
    const diffLabel = this.selectedDifficulty?.label || "Normal";
    this.add.rectangle(width/2, 30, 460, 42, 0x000000, 0.68).setScrollFactor(0).setDepth(100);
    this.dungeonTitle = this.add.text(width/2, 30, templateName.toUpperCase() + "  -  " + diffLabel.toUpperCase(), { fontSize: "18px", color: "#f4df9c" }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
  }

  // --- Helpers ---
  createAnimations() {
    const configs = [
      { key: "player-idle", tex: "player_idle_sheet", end: 7 },
      { key: "player-run", tex: "player_run_sheet", end: 5 },
      { key: "enemy-kekon-idle", tex: "enemy_kekon_idle", end: 6 },
      { key: "enemy-kekon-run", tex: "enemy_kekon_run", end: 5 },
      { key: "enemy-kekon-warrior-idle", tex: "enemy_kekon_warrior_idle", end: 6 },
      { key: "enemy-kekon-warrior-run", tex: "enemy_kekon_warrior_run", end: 5 },
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
    s.play(anim);
    s.once("animationcomplete", () => s.destroy());
    this.time.delayedCall(360, () => s?.destroy?.());
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
        if (!this.canOpenVictoryChest?.()) return;
        this.isTransitioningOut = true;
        this.scene.start("PrototypeScene", { dungeonReturn: { cleared: true, goldGained: this.runRewards.gold } });
      }
    });
  }

  createInteractionUi() {
    this.interactionPrompt = this.add.container(0, 0).setDepth(1000).setScrollFactor(0).setVisible(false);
    const bg = this.add.rectangle(0, 0, 220, 40, 0x000000, 0.8).setOrigin(0.5);
    const txt = this.add.text(0, 0, "[E / ENTER] INTERACT", { fontSize: "16px", color: "#ffffff" }).setOrigin(0.5);
    this.interactionPrompt.add([bg, txt]);
  }

  updateInteractionPrompt() {
    let nearest = null;
    let minDist = 100;
    
    this.interactables.forEach(i => {
      if (i.active === false) return;
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

  loadPetImages() {
    const base = "class%20and%20cat/kedi%20pet/rotations/";
    ["south", "south-east", "east", "north-east", "north", "north-west", "west", "south-west"]
      .forEach((dir) => this.load.image(`dungeon_pet_cat_${dir}`, `${base}${dir}.png`));
  }

  canOpenVictoryChest() {
    if (!this.dungeonCleared) return false;
    const chest = (this.interactables || []).find((entry) => (entry.name === "Open Victory Chest" || entry.name === "Claim Victory") && entry.active !== false);
    if (!chest || !this.player) return false;
    return Phaser.Math.Distance.Between(this.player.x, this.player.y, chest.x, chest.y) <= (chest.promptRadius || 120);
  }

  togglePet() {
    if (this.petSummoned) {
      this.petSummoned = false;
      this.pet?.body?.destroy?.();
      this.pet?.label?.destroy?.();
      this.pet = null;
      this.showDamageText(this.player.x, this.player.y - 70, "PET OFF", "#f8dfb0");
      return;
    }
    this.petSummoned = true;
    const key = this.textures.exists("dungeon_pet_cat_south") ? "dungeon_pet_cat_south" : "__MISSING";
    const body = this.textures.exists(key)
      ? this.add.image(this.player.x - 42, this.player.y + 30, key).setDisplaySize(34, 34).setDepth(45)
      : this.add.circle(this.player.x - 42, this.player.y + 30, 15, 0xf0c48a, 0.98).setStrokeStyle(3, 0x4b2f1b, 0.9).setDepth(45);
    const label = this.add.text(body.x, body.y - 24, "Loot Cat", {
      fontSize: "10px", color: "#f8dfb0", stroke: "#000", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(46);
    this.pet = { body, label, x: body.x, y: body.y };
    this.showDamageText(this.player.x, this.player.y - 70, "PET ON", "#f8dfb0");
  }

  updatePet() {
    if (!this.petSummoned || !this.pet?.body || !this.player) return;
    const drops = (this.lootDrops || []).filter((drop) => drop && !drop.collected);
    const targetDrop = drops
      .sort((a, b) => Phaser.Math.Distance.Between(this.pet.x, this.pet.y, a.x, a.y) - Phaser.Math.Distance.Between(this.pet.x, this.pet.y, b.x, b.y))[0];
    const targetX = targetDrop?.x ?? (this.player.x - this.playerFacing.x * 46);
    const targetY = targetDrop?.y ?? (this.player.y - this.playerFacing.y * 46 + 18);
    const delta = Math.min(0.05, (this.game?.loop?.delta || 16) / 1000);
    const dir = new Phaser.Math.Vector2(targetX - this.pet.x, targetY - this.pet.y);
    if (dir.lengthSq() > 9) {
      dir.normalize();
      this.pet.x += dir.x * (targetDrop ? 210 : 135) * delta;
      this.pet.y += dir.y * (targetDrop ? 210 : 135) * delta;
      const key = `dungeon_pet_cat_${this.getDirectionName?.(dir) || "south"}`;
      this.safeSetTexture(this.pet.body, key);
    }
    this.pet.body.setPosition(this.pet.x, this.pet.y);
    this.pet.label.setPosition(this.pet.x, this.pet.y - 24);
    if (targetDrop && Phaser.Math.Distance.Between(this.pet.x, this.pet.y, targetDrop.x, targetDrop.y) <= 30) {
      this.collectDungeonDrop?.(targetDrop);
    }
  }

  spawnDungeonDrop(x, y, dropData) {
    const isGold = dropData.type === "gold";
    const tint = isGold ? 0xffd35a : (dropData.item?.color || 0xb5ffad);
    const body = this.add.circle(x, y, isGold ? 8 : 10, tint, 0.95).setStrokeStyle(2, 0x1b1510, 0.75).setDepth(32).setInteractive({ useHandCursor: true });
    const label = this.add.text(x, y - 23, isGold ? `${dropData.amount} Gold` : dropData.item?.name || "Loot", {
      fontSize: "10px", color: isGold ? "#ffdf73" : "#b5ffad", stroke: "#000", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(33);
    const drop = { ...dropData, x, y, body, label, collected: false };
    body.on("pointerdown", () => this.collectDungeonDrop(drop));
    this.lootDrops.push(drop);
    this.tweens?.add?.({ targets: [body, label], y: "-=5", yoyo: true, repeat: -1, duration: 720 });
    return drop;
  }

  collectDungeonDrop(drop) {
    if (!drop || drop.collected) return false;
    if (drop.type === "gold") {
      const cut = GameState.applyMercenaryLootCut?.(this.registry, drop.amount || 0, "Gold") || { playerAmount: drop.amount || 0, mercenaryAmount: 0 };
      this.runRewards.gold = (this.runRewards.gold || 0) + (cut.playerAmount || 0);
      this.showDamageText(drop.x, drop.y - 20, `+${cut.playerAmount || 0} Gold${cut.mercenaryAmount ? ` | M-${cut.mercenaryAmount}` : ""}`, "#ffdf73");
    } else if (drop.type === "item" && drop.item) {
      if (GameState.shouldMercenaryClaimDrop?.(this.registry)) {
        GameState.pushActivityEvent?.(this.registry, `Mercenary claimed: ${drop.item?.name || "item"}`, "social");
        this.showDamageText(drop.x, drop.y - 20, "MERC CLAIM", "#f4df9c");
        drop.collected = true;
        drop.body?.destroy?.();
        drop.label?.destroy?.();
        this.lootDrops = (this.lootDrops || []).filter((entry) => entry !== drop);
        GameState.saveProgress?.(this.registry);
        return true;
      }
      const index = GameState.addToInventory?.(this.registry, drop.item);
      if (index === undefined || index < 0) {
        this.showDamageText(drop.x, drop.y - 20, "BAG FULL", "#ff7777");
        return false;
      }
      this.showDamageText(drop.x, drop.y - 20, drop.item.name || "Loot", "#b5ffad");
    }
    drop.collected = true;
    drop.body?.destroy?.();
    drop.label?.destroy?.();
    this.lootDrops = (this.lootDrops || []).filter((entry) => entry !== drop);
    GameState.saveProgress?.(this.registry);
    return true;
  }

  createMercenaryCompanion() {
    const state = GameState.getMercenaryState?.(this.registry);
    if (!state || !this.player) return;
    this.destroyMercenaryCompanion();
    const dir = this.getDirectionName?.(this.playerFacing) || "south";
    const key = `dungeon_class_${state.className}_${dir}`;
    const tint = GameState.MERCENARY_CONFIG?.classes?.[state.className]?.tint || 0xf4df9c;
    const body = this.textures.exists(key)
      ? this.add.image(this.player.x - 46, this.player.y + 34, key).setDisplaySize(40, 40).setDepth(82)
      : this.add.circle(this.player.x - 46, this.player.y + 34, 15, tint, 0.95).setDepth(82);
    const label = this.add.text(body.x, body.y - 28, state.label || "Mercenary", {
      fontSize: "10px",
      color: "#f4df9c",
      stroke: "#000",
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(83);
    this.mercenary = { ...state, body, label, x: body.x, y: body.y, nextAttackAt: 0 };
  }

  destroyMercenaryCompanion() {
    this.mercenary?.body?.destroy?.();
    this.mercenary?.label?.destroy?.();
    this.mercenary = null;
  }

  updateMercenaryCompanion() {
    const state = GameState.getMercenaryState?.(this.registry);
    if (!state) {
      if (this.mercenary) this.destroyMercenaryCompanion();
      return;
    }
    if (!this.mercenary) this.createMercenaryCompanion();
    if (!this.mercenary?.body || !this.player) return;
    const delta = Math.min(0.05, (this.game?.loop?.delta || 16) / 1000);
    const target = this.findMercenaryDungeonTarget(state);
    const anchor = target || this.player;
    const followDist = target ? 125 : 66;
    const dist = Phaser.Math.Distance.Between(this.mercenary.x, this.mercenary.y, anchor.x, anchor.y);
    if (dist > followDist) {
      const dir = new Phaser.Math.Vector2(anchor.x - this.mercenary.x, anchor.y - this.mercenary.y).normalize();
      const speed = target ? 165 : 205;
      this.mercenary.x += dir.x * speed * delta;
      this.mercenary.y += dir.y * speed * delta;
      const tex = `dungeon_class_${state.className}_${this.getDirectionName?.(dir) || "south"}`;
      this.safeSetTexture(this.mercenary.body, tex);
    }
    this.mercenary.body.setPosition(this.mercenary.x, this.mercenary.y);
    this.mercenary.label?.setPosition(this.mercenary.x, this.mercenary.y - 28);
    if (target) this.tryMercenaryDungeonAttack(target, state);
  }

  findMercenaryDungeonTarget(state) {
    const profile = GameState.getBasicAttackProfile?.(state.className) || {};
    const aggroRange = Math.max(260, (profile.range || 140) + 90);
    return (this.enemyPlaceholders || [])
      .filter((enemy) => enemy && enemy.hp > 0 && Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y) <= aggroRange)
      .sort((a, b) => Phaser.Math.Distance.Between(this.mercenary?.x || this.player.x, this.mercenary?.y || this.player.y, a.x, a.y) - Phaser.Math.Distance.Between(this.mercenary?.x || this.player.x, this.mercenary?.y || this.player.y, b.x, b.y))[0] || null;
  }

  tryMercenaryDungeonAttack(target, state) {
    const profile = GameState.getBasicAttackProfile?.(state.className) || {};
    const range = profile.range || 140;
    if (Phaser.Math.Distance.Between(this.mercenary.x, this.mercenary.y, target.x, target.y) > range) return;
    const cooldown = Math.floor((profile.cooldownMs || 850) * (state.attackSlow || 1.45));
    if (this.time.now < (this.mercenary.nextAttackAt || 0)) return;
    this.mercenary.nextAttackAt = this.time.now + cooldown;
    const dir = new Phaser.Math.Vector2(target.x - this.mercenary.x, target.y - this.mercenary.y).normalize();
    const tex = `dungeon_class_${state.className}_${this.getDirectionName?.(dir) || "south"}`;
    this.safeSetTexture(this.mercenary.body, tex);
    const tint = GameState.MERCENARY_CONFIG?.classes?.[state.className]?.tint || profile.tint || 0xf4df9c;
    if (profile.projectile) this.spawnRangedTrace?.(this.mercenary.x, this.mercenary.y - 12, target.x, target.y, tint);
    else this.spawnAnimatedEffect?.("fx_dust_01", "fx-dust-01", this.mercenary.x + dir.x * 34, this.mercenary.y + dir.y * 34, { scale: 0.85 });
    const damage = (GameState.getWeaponAp?.(this.registry) || 18) * (state.damageScale || 0.7);
    this.damageEnemy(target, damage, profile.damageType || "physical");
  }
}

window.DungeonPrototypeScene = DungeonPrototypeScene;
