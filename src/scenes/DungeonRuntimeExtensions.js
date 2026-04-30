(function () {
  const Cls = window.DungeonPrototypeScene;
  if (!Cls) return;
  const proto = Cls.prototype;

  proto.resolveDungeonTemplateData = function (data = {}) {
    const requestedId = data?.dungeonId || "forgotten_halls";
    const def = window.DungeonTemplates?.get?.(requestedId) || window.DungeonTemplates?.get?.("forgotten_halls") || null;
    const key = def?.id ? `dungeon_template_${def.id}` : null;
    const template = key ? this.cache.json.get(key) : null;
    if (!template && def?.jsonPath) console.warn("[Dungeon] Missing template JSON:", def.jsonPath);
    return { id: def?.id || requestedId, template: template || null };
  };

  proto.buildTemplateDungeonLayout = function (template) {
    const spawn = template.playerSpawn || { x: 300, y: 600 };
    const bossObj = (template.layers?.boss_spawn || [])[0] || { x: (template.width || 3200) - 360, y: spawn.y };
    return { entrySpawn: { x: spawn.x, y: spawn.y }, rooms: [{ x: bossObj.x, y: bossObj.y, w: 500, h: 400, type: "boss", phaseId: 4 }], corridors: [] };
  };

  proto.parseTemplateTint = function (value, fallback = 0x334455) {
    if (typeof value === "number") return value;
    if (typeof value === "string") return Number(value.replace("#", "0x")) || fallback;
    return fallback;
  };

  proto.drawTemplateDungeonEnvironment = function (template) {
    const floorTint = this.parseTemplateTint(template.theme?.floorTint, 0x334455);
    const wallTint = this.parseTemplateTint(template.theme?.wallTint, 0x0a0c10);
    const propTint = this.parseTemplateTint(template.theme?.ambientTint, 0x223344);
    const width = template.width || 3200;
    const height = template.height || 1600;
    this.add.rectangle(width / 2, height / 2, width, height, 0x030507, 1).setDepth(-2);
    this.add.rectangle(width / 2, height / 2, width, height, propTint, 0.28).setDepth(-1);
    const drawLayer = (layerName, color, alpha, depth, size = 32) => {
      (template.layers?.[layerName] || []).forEach((obj) => {
        const w = obj.width || obj.metadata?.width || size;
        const h = obj.height || obj.metadata?.height || size;
        if (layerName === "floor") {
          this.add.rectangle(obj.x, obj.y + 5, w + 8, h + 8, 0x000000, 0.25).setDepth((obj.depth ?? depth) - 0.2);
          this.add.rectangle(obj.x, obj.y, w, h, color, alpha).setStrokeStyle(1, 0x526266, 0.22).setDepth(obj.depth ?? depth);
          if ((obj.x + obj.y) % 5 === 0) this.add.rectangle(obj.x, obj.y, Math.max(4, w - 10), 2, 0xffffff, 0.035).setDepth((obj.depth ?? depth) + 0.1);
          return;
        }
        if (layerName === "wall") {
          this.add.rectangle(obj.x, obj.y + 8, w + 4, h + 4, 0x000000, 0.44).setDepth((obj.depth ?? depth) - 0.1);
          this.add.rectangle(obj.x, obj.y, w, h, color, alpha).setStrokeStyle(1, 0x87928b, 0.18).setDepth(obj.depth ?? depth);
          return;
        }
        this.add.rectangle(obj.x, obj.y, w, h, color, alpha).setDepth(obj.depth ?? depth);
      });
    };
    drawLayer("floor", floorTint, 0.82, 1, template.gridSize || 32);
    drawLayer("wall", wallTint, 0.92, 4, template.gridSize || 32);
    drawLayer("prop", propTint, 0.78, 5, template.gridSize || 32);
    drawLayer("decoration", propTint, 0.48, 6, template.gridSize || 32);
    (template.layers?.boss_spawn || []).forEach((boss) => {
      this.add.circle(boss.x, boss.y, 150, 0x5a211b, 0.15).setDepth(1.5);
      this.add.circle(boss.x, boss.y, 82, 0xff6b35, 0.08).setDepth(1.6);
    });
    (template.layers?.chest || []).forEach((chest) => {
      this.add.circle(chest.x, chest.y, 46, 0xffd84a, 0.11).setDepth(1.6);
    });
    for (let i = 0; i < 16; i++) {
      const x = Phaser.Math.Between(180, width - 180);
      const y = Phaser.Math.Between(120, height - 120);
      this.add.circle(x, y, Phaser.Math.Between(2, 5), 0xffb35c, 0.12).setDepth(7);
    }
  };

  proto.createTemplateCollisionBlocks = function (template) {
    this.obstacles = this.physics.add.staticGroup();
    const addBlock = (obj) => {
      const size = template.gridSize || 32;
      const w = obj.width || obj.metadata?.width || size;
      const h = obj.height || obj.metadata?.height || size;
      const block = this.add.rectangle(obj.x, obj.y, w, h, 0x000000, 0).setDepth(8);
      this.physics.add.existing(block, true);
      this.obstacles.add(block);
    };
    (template.layers?.collision || []).forEach(addBlock);
    (template.layers?.wall || []).filter((obj) => obj.collision).forEach(addBlock);
  };

  proto.createTemplateEnemyPlaceholders = function (template) {
    const spawns = template.layers?.enemy_spawn || [];
    if (!spawns.length) {
      for (let i = 0; i < 8; i++) this.createScaledTemplateEnemy(650 + i * 120, (template.playerSpawn?.y || 600) + Phaser.Math.Between(-140, 140), "kekon", 1, false);
      this.createScaledTemplateEnemy((template.width || 3200) - 420, template.playerSpawn?.y || 600, "kekon_boss", 4, true, template.layers?.boss_spawn?.[0]?.metadata?.bossName || "Dungeon Boss");
      return;
    }
    spawns.forEach((spawn) => {
      const meta = spawn.metadata || {};
      const count = Math.max(1, meta.count || 1);
      for (let i = 0; i < count; i++) this.createScaledTemplateEnemy(spawn.x + Phaser.Math.Between(-35, 35), spawn.y + Phaser.Math.Between(-35, 35), meta.enemyId || "kekon", meta.phaseId || 1, false);
    });
    (template.layers?.boss_spawn || []).forEach((boss) => this.createScaledTemplateEnemy(boss.x, boss.y, boss.metadata?.bossId || "kekon_boss", boss.metadata?.phaseId || 4, true, boss.metadata?.bossName || template.bossName || "Dungeon Boss"));
  };

  proto.createScaledTemplateEnemy = function (x, y, enemyId = "kekon", phaseId = 1, isBoss = false, displayName = null) {
    const archetypeKey = isBoss ? "kekon_boss" : (GameState.ENEMY_ARCHETYPES?.[enemyId] ? enemyId : "kekon");
    const base = GameState.ENEMY_ARCHETYPES?.[archetypeKey] || GameState.ENEMY_ARCHETYPES.kekon;
    const diff = this.selectedDifficulty || { enemyHp: 1, enemyDamage: 1, bossHp: 1 };
    const spriteKey = isBoss ? "enemy_kekon_boss_idle" : "enemy_kekon_idle";
    const runAnim = isBoss ? "enemy-kekon-boss-run" : "enemy-kekon-run";
    const idleAnim = isBoss ? "enemy-kekon-boss-idle" : "enemy-kekon-idle";
    const sprite = this.add.sprite(x, y, spriteKey).setScale(isBoss ? 0.55 : 0.3).setDepth(9);
    const shadow = this.add.ellipse(x, y + (isBoss ? 44 : 22), isBoss ? 80 : 38, isBoss ? 30 : 14, 0x000000, 0.28).setDepth(8);
    sprite.play(idleAnim);
    const hpMult = isBoss ? (diff.bossHp || 1) : (diff.enemyHp || 1);
    this.enemyPlaceholders.push({ x, y, hp: Math.floor(base.hp * hpMult), maxHp: Math.floor(base.hp * hpMult), speed: base.speed || 56, damage: Math.floor((base.damage || 8) * (diff.enemyDamage || 1)), sprite, visuals: [sprite, shadow], idleAnim, runAnim, phaseId, isBoss, enemyId: archetypeKey, displayName: displayName || (isBoss ? "Dungeon Boss" : archetypeKey) });
  };

  proto.createTemplateReturnGate = function (template) {
    const exit = (template.layers?.exit || [])[0] || { x: template.playerSpawn?.x || 300, y: (template.playerSpawn?.y || 600) - 120 };
    this.add.rectangle(exit.x, exit.y, 70, 70, 0x4488ff, 0.25).setDepth(6);
    this.add.text(exit.x, exit.y - 50, "CITY EXIT", { fontSize: "14px", color: "#88c7ff" }).setOrigin(0.5).setDepth(7);
    this.interactables.push({ x: exit.x, y: exit.y, name: "Return to City", promptRadius: 90, onConfirm: () => this.scene.start("PrototypeScene", { dungeonReturn: { cleared: false } }) });
  };

  proto.createTemplateCompletionExit = function (template) {
    const chest = (template.layers?.chest || [])[0] || (template.layers?.boss_spawn || [])[0] || { x: (template.width || 3200) - 300, y: template.playerSpawn?.y || 600 };
    this.completionText = this.add.text(chest.x, chest.y - 60, "VICTORY CHEST", { fontSize: "18px", color: "#ffff00" }).setOrigin(0.5).setDepth(7).setVisible(false);
    this.interactables.push({ x: chest.x, y: chest.y, name: "Claim Victory", promptRadius: 100, active: false, onConfirm: () => {
      if (this.canOpenVictoryChest && !this.canOpenVictoryChest()) return;
      this.isTransitioningOut = true;
      const diff = this.selectedDifficulty || { gold: 1 };
      const goldGained = Math.floor((this.runRewards.gold || 0) * (diff.gold || 1));
      GameState.updateQuestProgress?.(this.registry, { type: "clear", dungeonId: this.selectedDungeonId, difficulty: this.selectedDifficultyKey, amount: 1 });
      this.scene.start("PrototypeScene", { dungeonReturn: { cleared: true, goldGained, dungeonId: this.selectedDungeonId } });
    }});
  };

  const originalDefeatEnemy = proto.defeatEnemy;
  proto.defeatEnemy = function (enemy) {
    if (enemy.__defeated) return;
    enemy.__defeated = true;
    if (enemy.isBoss) {
      enemy.hp = 0;
      this.spawnAnimatedEffect("fx_explosion_01", "fx-explosion-01", enemy.x, enemy.y, { scale: 0.8 });
      enemy.visuals.forEach((v) => v.destroy());
      this.runRewards.gold += 75;
      GameState.updateQuestProgress?.(this.registry, { type: "boss", dungeonId: this.selectedDungeonId, target: enemy.displayName || enemy.enemyId || "boss", amount: 1 });
      this.dungeonCleared = true;
      if (this.completionText) this.completionText.setVisible(true);
      if (this.victoryChestVisual) this.victoryChestVisual.setVisible(true).setAlpha(1).setFillStyle(0x8b5a2b, 0.95).setStrokeStyle(3, 0xffd84a, 0.98);
      const exit = this.interactables.find((i) => i.name === "Open Victory Chest" || i.name === "Claim Victory");
      if (exit) exit.active = true;
      return;
    }
    GameState.updateQuestProgress?.(this.registry, { type: "kill", dungeonId: this.selectedDungeonId, target: enemy.enemyId || enemy.displayName || "enemy", amount: 1 });
    if (originalDefeatEnemy) return originalDefeatEnemy.call(this, enemy);
  };
})();
