(function () {
  const Cls = window.DungeonPrototypeScene;
  const GS = window.GameState;
  if (!Cls || !GS) return;
  const proto = Cls.prototype;

  function makeText(scene, x, y, text, style = {}) {
    return scene.add.text(x, y, text, Object.assign({
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "12px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 3,
    }, style)).setOrigin(0.5).setDepth(101);
  }

  function normalizeDungeonHotbar(scene) {
    const size = GS.HOTBAR_SIZE || 6;
    const playerClass = scene.registry.get("playerClass") || GS.DEFAULT_CLASS || "warrior";
    const classSkill = GS.getClassSkillForClass?.(playerClass) || null;
    const slots = [...(scene.registry.get("hotbarSlots") || new Array(size).fill(null))].slice(0, size);
    while (slots.length < size) slots.push(null);

    const isValidEntry = (entryId) => {
      if (!entryId || typeof entryId !== "string") return false;
      return !!(GS.getSkillDefById?.(entryId, playerClass) || GS.getConsumableDef?.(entryId) || GS.CONSUMABLE_DEFS?.[entryId]);
    };

    for (let i = 0; i < size; i++) {
      if (!isValidEntry(slots[i])) slots[i] = null;
    }
    if (classSkill && !slots.some((entryId) => GS.getSkillDefById?.(entryId, playerClass))) {
      slots[0] = classSkill.id;
    }
    scene.registry.set("hotbarSlots", slots);
    return slots;
  }

  // Add number keys for dungeon hotbar.
  const originalCreateInput = proto.createInput;
  proto.createInput = function () {
    originalCreateInput.call(this);
    normalizeDungeonHotbar(this);
    this.actionKeys.slot1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.actionKeys.slot2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.actionKeys.slot3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
    this.actionKeys.slot4 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);
    this.actionKeys.slot5 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE);
    this.actionKeys.slot6 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SIX);
    [1, 2, 3, 4, 5, 6].forEach((slotNumber) => {
      this.input.keyboard.on(`keydown-${slotNumber}`, () => {
        const anyPanelVisible = Object.values(this.uiPanels || {}).some((panel) => panel?.open);
        if (this.dialogOpen || this.rewardPanelOpen || anyPanelVisible) return;
        this.useDungeonHotbarSlot(slotNumber - 1);
      });
    });
  };

  // Draw a stable dungeon hotbar so the skill bar does not vanish inside dungeons.
  const originalDrawUiLayer = proto.drawUiLayer;
  proto.drawUiLayer = function () {
    originalDrawUiLayer.call(this);
    this.createDungeonHotbar();
  };

  proto.createDungeonHotbar = function () {
    const { width, height } = this.scale;
    const slotSize = 52;
    const gap = 10;
    const slots = GS.HOTBAR_SIZE || 6;
    const totalWidth = slots * (slotSize + gap) - gap;
    const startX = width / 2 - totalWidth / 2;
    const y = height - 54;
    this.dungeonHotbarElements = [];
    this.dungeonHotbarSlots = [];
    normalizeDungeonHotbar(this);
    const bg = this.add.rectangle(width / 2, y, totalWidth + 46, slotSize + 30, 0x071018, 0.86)
      .setStrokeStyle(2, 0x4d6268, 0.9).setScrollFactor(0).setDepth(120);
    const label = this.add.text(width / 2, y - slotSize / 2 - 14, "1-6 SKILL BAR", {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "10px",
      color: "#d7c58f",
      stroke: "#000",
      strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(123);
    this.dungeonHotbarElements.push(bg, label);
    for (let i = 0; i < slots; i++) {
      const x = startX + i * (slotSize + gap) + slotSize / 2;
      const slotBg = this.add.rectangle(x, y, slotSize, slotSize, 0x22313a, 0.94)
        .setStrokeStyle(2, 0x5f767a, 0.78).setScrollFactor(0).setDepth(121).setInteractive({ useHandCursor: true });
      const icon = this.add.image(x, y - 2, this.safeDungeonTexture("icon_11")).setDisplaySize(31, 31).setAlpha(0.25).setScrollFactor(0).setDepth(122);
      const cooldown = this.add.rectangle(x, y, slotSize - 4, 0, 0x000000, 0.62).setOrigin(0.5, 1).setScrollFactor(0).setDepth(124).setVisible(false);
      const key = makeText(this, x - slotSize / 2 + 7, y - slotSize / 2 + 6, String(i + 1), { fontSize: "10px", color: "#d7c58f" }).setOrigin(0.5);
      key.setScrollFactor(0).setDepth(123);
      const count = this.add.text(x + slotSize / 2 - 5, y + slotSize / 2 - 15, "", { fontSize: "10px", color: "#f8f1dc", stroke: "#000", strokeThickness: 2 }).setOrigin(1, 0).setScrollFactor(0).setDepth(125);
      const name = this.add.text(x, y + slotSize / 2 + 4, "", { fontSize: "8px", color: "#c8d3d7", stroke: "#000", strokeThickness: 2 }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(123);
      slotBg.on("pointerdown", () => this.useDungeonHotbarSlot(i));
      this.dungeonHotbarSlots.push({ bg: slotBg, icon, cooldown, count, name, index: i });
      this.dungeonHotbarElements.push(slotBg, icon, cooldown, key, count, name);
    }
    this.refreshDungeonHotbar();
  };

  proto.safeDungeonTexture = function (key) {
    if (key && this.textures.exists(key)) return key;
    if (this.textures.exists("icon_11")) return "icon_11";
    if (this.textures.exists("icon_05")) return "icon_05";
    return key || "__MISSING";
  };

  proto.refreshDungeonHotbar = function () {
    if (!this.dungeonHotbarSlots) return;
    normalizeDungeonHotbar(this);
    this.dungeonHotbarSlots.forEach((slot) => {
      const entryId = GS.getHotbarSlot?.(this.registry, slot.index);
      const skill = entryId ? GS.getSkillDefById?.(entryId, this.registry.get("playerClass")) : null;
      const consumable = entryId ? (GS.getConsumableDef?.(entryId) || GS.CONSUMABLE_DEFS?.[entryId]) : null;
      if (skill) {
        const skillLevel = GS.getSkillLevel?.(this.registry, skill.id) || 1;
        slot.bg.setStrokeStyle(2, skill.tint || 0x6aa7ff, 0.95).setFillStyle(0x263142, 0.98);
        slot.icon.setTexture(this.safeDungeonTexture(skill.icon || "icon_05")).setTint(skill.tint || 0x6aa7ff).setAlpha(1);
        slot.count.setText(`Lv${skillLevel}`);
        slot.name.setText(String(skill.name || "Skill").slice(0, 8));
        const remaining = this.getSkillCooldownRemaining
          ? this.getSkillCooldownRemaining(skill.id)
          : Math.max(0, (this.classSkillReadyAt || 0) - this.time.now);
        if (remaining > 0) {
          const ratio = Math.max(0, Math.min(1, remaining / Math.max(1, skill.cooldownMs || 3000)));
          slot.cooldown.setVisible(true).setDisplaySize(48, 48 * ratio);
          slot.count.setText(`${Math.ceil(remaining / 1000)}s`);
        } else {
          slot.cooldown.setVisible(false);
        }
      } else if (consumable) {
        const ownedCount = this.registry.get(consumable.countKey) || 0;
        if (ownedCount <= 0) {
          GS.clearHotbarSlot?.(this.registry, slot.index);
          slot.bg.setStrokeStyle(2, 0x5f767a, 0.78).setFillStyle(0x22313a, 0.94);
          slot.icon.setTexture(this.safeDungeonTexture("icon_11")).clearTint().setAlpha(0.2);
          slot.count.setText("");
          slot.name.setText("");
          slot.cooldown.setVisible(false);
          return;
        }
        slot.bg.setStrokeStyle(2, consumable.color || 0xf4df9c, 0.95).setFillStyle(0x33434e, 0.98);
        slot.icon.setTexture(this.safeDungeonTexture(consumable.baseIcon || consumable.icon || "icon_11")).setTint(consumable.color || 0xffffff).setAlpha(1);
        slot.count.setText(String(ownedCount));
        slot.name.setText(String(consumable.label || consumable.name || "Pot").slice(0, 8));
        slot.cooldown.setVisible(false);
      } else {
        slot.bg.setStrokeStyle(2, 0x5f767a, 0.78).setFillStyle(0x22313a, 0.94);
        slot.icon.setTexture(this.safeDungeonTexture("icon_11")).clearTint().setAlpha(0.2);
        slot.count.setText("");
        slot.name.setText("");
        slot.cooldown.setVisible(false);
      }
    });
  };

  proto.useDungeonHotbarSlot = function (index) {
    normalizeDungeonHotbar(this);
    const entryId = GS.getHotbarSlot?.(this.registry, index);
    const playerClass = this.registry.get("playerClass") || GS.DEFAULT_CLASS || "warrior";
    const skill = entryId ? GS.getSkillDefById?.(entryId, playerClass) : null;
    const consumable = entryId ? (GS.getConsumableDef?.(entryId) || GS.CONSUMABLE_DEFS?.[entryId]) : null;
    let ok = false;
    let result = null;

    if (skill) {
      ok = this.useSkillById(entryId);
      result = { ok, type: "skill" };
    } else if (consumable) {
      result = GS.useHotbarEntry?.(this.registry, entryId, this);
      ok = !!result?.ok;
    } else {
      this.showDamageText(this.player.x, this.player.y - 72, "EMPTY", "#dddddd");
    }

    if (ok) this.showDamageText(this.player.x, this.player.y - 72, result?.type === "skill" ? `SLOT ${index + 1}` : "POT", "#f4df9c");
    this.refreshDungeonHotbar();
    this.refreshHudPanel();
    return ok;
  };

  proto.useSkillById = function (skillId) {
    const skill = GS.getSkillDefById?.(skillId, this.registry.get("playerClass"));
    if (!skill) return false;
    if (this.currentMp < (skill.mpCost || 0)) { this.showDamageText(this.player.x, this.player.y - 72, "NO MP", "#88aaff"); return false; }
    const readyAt = this.getSkillReadyAt?.(skillId) || 0;
    if (this.time.now < readyAt) { this.showDamageText(this.player.x, this.player.y - 72, `${Math.ceil((readyAt - this.time.now) / 1000)}s`, "#dddddd"); return false; }
    const skillLevel = GS.getSkillLevel?.(this.registry, skillId) || 1;
    const powerScale = GS.getSkillPowerScale?.(this.registry, skillId) || 1;
    const cooldownScale = Math.max(0.72, 1 - (skillLevel - 1) * 0.035);
    this.currentMp -= skill.mpCost || 0;
    this.setSkillReadyAt?.(skillId, this.time.now + Math.floor((skill.cooldownMs || 3000) * cooldownScale));
    const profile = this.getClassCombatProfile?.() || { range: 140, hitOffset: 105, targetRadius: 130, damageType: "physical", projectile: false, tint: skill.tint || 0x88ccff };
    const damageType = skill.damageType || (String(skill.id || "").match(/arcane|fire|frost|meteor/) ? "magic" : String(skill.id || "").match(/shot|arrow/) ? "ranged" : profile.damageType || "physical");
    const skillRange = skill.range || (profile.projectile ? profile.range + 45 : 170);
    const hitX = this.player.x + this.playerFacing.x * Math.min(skillRange, profile.projectile ? skillRange : 135);
    const hitY = this.player.y + this.playerFacing.y * Math.min(skillRange, profile.projectile ? skillRange : 135);
    this.spawnAnimatedEffect(profile.projectile ? "fx_explosion_01" : "fx_dust_01", profile.projectile ? "fx-explosion-01" : "fx-dust-01", hitX, hitY, { scale: skill.damageScale > 1.6 ? 1.35 : 1.0 });
    const target = this.enemyPlaceholders
      .filter((enemy) => enemy.hp > 0 && Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y) <= skillRange && Phaser.Math.Distance.Between(hitX, hitY, enemy.x, enemy.y) <= (profile.projectile ? 135 : 105))
      .sort((a, b) => Phaser.Math.Distance.Between(hitX, hitY, a.x, a.y) - Phaser.Math.Distance.Between(hitX, hitY, b.x, b.y))[0];
    if (target) {
      if (profile.projectile) this.spawnRangedTrace?.(this.player.x, this.player.y - 12, target.x, target.y, skill.tint || profile.tint);
      this.damageEnemy(target, GS.getWeaponAp(this.registry) * (skill.damageScale || 1.25) * powerScale, damageType);
      GS.applyDurabilityWear?.(this.registry, ["weapon"], 1, "dungeon skill");
    } else {
      this.showDamageText(this.player.x, this.player.y - 72, "MISS", "#dddddd");
    }
    this.refreshDungeonHotbar();
    this.refreshHudPanel();
    return true;
  };

  const originalHandleInputActions = proto.handleInputActions;
  proto.handleInputActions = function () {
    for (let i = 0; i < (GS.HOTBAR_SIZE || 6); i++) {
      const key = this.actionKeys[`slot${i + 1}`];
      if (key && Phaser.Input.Keyboard.JustDown(key)) this.useDungeonHotbarSlot(i);
    }
    return originalHandleInputActions.call(this);
  };

  // Enemy HP bars + defense/resistance stats.
  proto.createEnemyHpBar = function (enemy) {
    if (!enemy || enemy.hpBarBg) return;
    enemy.maxHp = enemy.maxHp || enemy.hp || 1;
    enemy.defense = enemy.defense ?? enemy.stats?.defense ?? (enemy.isBoss ? 10 : 2);
    enemy.physicalResist = enemy.physicalResist ?? (enemy.isBoss ? 0.12 : 0.02);
    enemy.magicResist = enemy.magicResist ?? (enemy.isBoss ? 0.1 : 0.0);
    enemy.rangedResist = enemy.rangedResist ?? (enemy.isBoss ? 0.1 : 0.0);
    enemy.hpBarBg = this.add.rectangle(enemy.x, enemy.y - (enemy.isBoss ? 88 : 46), enemy.isBoss ? 90 : 50, 7, 0x220000, 0.85).setDepth(30);
    enemy.hpBarFill = this.add.rectangle(enemy.x - (enemy.isBoss ? 45 : 25), enemy.y - (enemy.isBoss ? 88 : 46), enemy.isBoss ? 90 : 50, 7, enemy.isBoss ? 0xffc857 : 0xff4444, 0.95).setOrigin(0, 0.5).setDepth(31);
    enemy.hpName = this.add.text(enemy.x, enemy.y - (enemy.isBoss ? 104 : 60), enemy.displayName || enemy.enemyId || "Enemy", { fontSize: enemy.isBoss ? "12px" : "9px", color: "#f8f1dc", stroke: "#000", strokeThickness: 2 }).setOrigin(0.5).setDepth(31);
    enemy.visuals = enemy.visuals || [];
    enemy.visuals.push(enemy.hpBarBg, enemy.hpBarFill, enemy.hpName);
  };

  proto.updateEnemyHpBars = function () {
    (this.enemyPlaceholders || []).forEach((enemy) => {
      if (!enemy || enemy.hp <= 0) return;
      this.createEnemyHpBar(enemy);
      const width = enemy.isBoss ? 90 : 50;
      const y = enemy.y - (enemy.isBoss ? 88 : 46);
      const x0 = enemy.x - width / 2;
      const ratio = Phaser.Math.Clamp((enemy.hp || 0) / (enemy.maxHp || 1), 0, 1);
      enemy.hpBarBg?.setPosition(enemy.x, y);
      enemy.hpBarFill?.setPosition(x0, y);
      if (enemy.hpBarFill) enemy.hpBarFill.width = width * ratio;
      enemy.hpName?.setPosition(enemy.x, enemy.y - (enemy.isBoss ? 104 : 60));
    });
  };

  const originalUpdateEnemyAi = proto.updateEnemyAi;
  proto.updateEnemyAi = function () {
    const delta = Math.min(0.05, (this.game?.loop?.delta || 16) / 1000);
    (this.enemyPlaceholders || []).forEach((enemy) => {
      if (!enemy || enemy.hp <= 0 || !this.player) return;
      const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      const attackRange = enemy.attackRange || (enemy.isBoss ? 132 : 96);
      if (dist <= attackRange) {
        enemy.sprite?.play?.(enemy.idleAnim, true);
        this.tryEnemyAttack(enemy);
        return;
      }
      if (dist <= 420) {
        const dir = new Phaser.Math.Vector2(this.player.x - enemy.x, this.player.y - enemy.y).normalize();
        enemy.x += dir.x * (enemy.speed || 52) * delta;
        enemy.y += dir.y * (enemy.speed || 52) * delta;
        enemy.sprite?.setFlipX?.(dir.x < 0);
        enemy.sprite?.play?.(enemy.runAnim, true);
        (enemy.visuals || []).forEach((visual) => {
          if (!visual?.setPosition) return;
          if (visual === enemy.sprite) visual.setPosition(enemy.x, enemy.y);
          else if (visual === enemy.hpBarBg || visual === enemy.hpBarFill || visual === enemy.hpName) return;
          else visual.setPosition(enemy.x, enemy.y + (enemy.isBoss ? 44 : 22));
        });
      } else {
        enemy.sprite?.play?.(enemy.idleAnim, true);
      }
    });
    const result = undefined;
    this.updateEnemyHpBars();
    return result;
  };

  proto.tryEnemyAttack = function (enemy) {
    if (!enemy || enemy.hp <= 0 || !this.player) return;
    if (this.time.now < (enemy.lastAttackAt || 0) + (enemy.isBoss ? 1050 : 1250)) return;
    enemy.lastAttackAt = this.time.now;
    const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    const range = enemy.attackRange || (enemy.isBoss ? 140 : 108);
    if (dist > range + 14) return;
    enemy.sprite?.setTint?.(0xffaa44);
    this.time.delayedCall(120, () => enemy.sprite?.clearTint?.());
    this.showDamageText(enemy.x, enemy.y - (enemy.isBoss ? 96 : 56), "ATK", "#ffbb66");
    this.damagePlayer(Math.max(1, enemy.damage || 1));
  };

  const originalCreateScaledTemplateEnemy = proto.createScaledTemplateEnemy;
  proto.createScaledTemplateEnemy = function (...args) {
    const before = this.enemyPlaceholders.length;
    const result = originalCreateScaledTemplateEnemy.apply(this, args);
    for (let i = before; i < this.enemyPlaceholders.length; i++) {
      const enemy = this.enemyPlaceholders[i];
      if (enemy) enemy.attackRange = enemy.isBoss ? 140 : 108;
      if (enemy && !enemy.isBoss) this.totalDungeonMobCount = (this.totalDungeonMobCount || 0) + 1;
      if (enemy && enemy.isBoss) enemy.phasePlan = GS.getBossPhasePlan?.(this.selectedDungeonId || "default") || [];
      this.createEnemyHpBar(enemy);
    }
    return result;
  };
  const originalCreateKekon = proto.createKekon;
  proto.createKekon = function (...args) { const r = originalCreateKekon.apply(this, args); this.totalDungeonMobCount = (this.totalDungeonMobCount || 0) + 1; this.createEnemyHpBar(this.enemyPlaceholders[this.enemyPlaceholders.length - 1]); return r; };
  const originalCreateKekonBoss = proto.createKekonBoss;
  proto.createKekonBoss = function (...args) { const r = originalCreateKekonBoss.apply(this, args); const e = this.enemyPlaceholders[this.enemyPlaceholders.length - 1]; if (e) { e.isBoss = true; e.displayName = e.displayName || "Kekon Boss"; e.phasePlan = GS.getBossPhasePlan?.(this.selectedDungeonId || "default") || []; this.createEnemyHpBar(e); } return r; };

  proto.damageEnemy = function (enemy, amount, damageType = "physical") {
    const def = GS.getEnemyDefenseValue?.(enemy) || 0;
    const resist = GS.getEnemyResistValue?.(enemy, damageType) || 0;
    const afterDef = Math.max(1, amount - def * 0.65);
    const finalDamage = Math.max(1, Math.floor(afterDef * (1 - resist) * Phaser.Math.FloatBetween(0.9, 1.1)));
    enemy.hp -= finalDamage;
    this.showDamageText(enemy.x, enemy.y - 40, `-${finalDamage}`, "#ff4444");
    enemy.sprite?.setTint?.(0xff0000);
    this.time.delayedCall(100, () => enemy.sprite?.clearTint?.());
    this.updateEnemyHpBars();
    if (enemy.hp <= 0) {
      this.enemyDefeatCount = (this.enemyDefeatCount || 0) + (enemy.isBoss ? 0 : 1);
      this.defeatEnemy(enemy);
    }
  };

  // Victory chest panel: first E opens chest, then ENTER returns to town.
  proto.openDungeonRewardPanel = function (goldGained = 0) {
    if (this.rewardPanelOpen) return;
    this.rewardPanelOpen = true;
    this.dungeonCleared = true;
    this.isTransitioningOut = false;
    const { width, height } = this.scale;
    this.rewardPanelElements = [];
    const bg = this.add.rectangle(width / 2, height / 2, 430, 285, 0x101820, 0.96).setStrokeStyle(3, 0xffd84a, 0.98).setScrollFactor(0).setDepth(2000);
    const chest = this.add.rectangle(width / 2, height / 2 - 55, 86, 58, 0x8b5a2b, 0.98).setStrokeStyle(3, 0xffd84a, 0.98).setScrollFactor(0).setDepth(2001);
    const title = makeText(this, width / 2, height / 2 - 105, "VICTORY CHEST", { fontSize: "22px", color: "#ffdd66" }).setScrollFactor(0).setDepth(2002);
    const reward = makeText(this, width / 2, height / 2 + 8, `Gold Reward: ${goldGained}`, { fontSize: "16px", color: "#f8f1dc" }).setScrollFactor(0).setDepth(2002);
    const xpReward = makeText(this, width / 2, height / 2 + 30, `XP Gained: ${this.runRewards?.xp || 0}`, { fontSize: "13px", color: "#ffdf78" }).setScrollFactor(0).setDepth(2002);
    const hint = makeText(this, width / 2, height / 2 + 112, "Press ENTER to return to town", { fontSize: "14px", color: "#d7c58f" }).setScrollFactor(0).setDepth(2002);
    this.rewardPanelElements.push(bg, chest, title, reward, xpReward, hint);
    this.pendingTownReturn = { cleared: true, goldGained, xpGained: this.runRewards?.xp || 0, dungeonId: this.selectedDungeonId };
  };

  const originalUpdate = proto.update;
  proto.update = function () {
    if (this.rewardPanelOpen) {
      if (this.player?.body) this.player.body.setVelocity(0, 0);
      if (this.actionKeys && Phaser.Input.Keyboard.JustDown(this.actionKeys.confirm)) {
        this.rewardPanelOpen = false;
        this.rewardPanelElements?.forEach((el) => el.destroy?.());
        this.scene.start("PrototypeScene", { dungeonReturn: this.pendingTownReturn || { cleared: true } });
      }
      return;
    }
    return originalUpdate.call(this);
  };

  proto.createTemplateCompletionExit = function (template) {
    const chest = (template.layers?.chest || [])[0] || (template.layers?.boss_spawn || [])[0] || { x: (template.width || 3200) - 300, y: template.playerSpawn?.y || 600 };
    this.victoryChestVisual = this.add.rectangle(chest.x, chest.y, 72, 48, 0x8b5a2b, 0.0).setStrokeStyle(3, 0xffd84a, 0).setDepth(7).setVisible(false);
    this.completionText = this.add.text(chest.x, chest.y - 62, "VICTORY CHEST", { fontSize: "18px", color: "#ffff00", stroke: "#000", strokeThickness: 3 }).setOrigin(0.5).setDepth(8).setVisible(false);
    this.interactables.push({ x: chest.x, y: chest.y, name: "Open Victory Chest", promptRadius: 110, active: false, onConfirm: () => {
      if (this.canOpenVictoryChest && !this.canOpenVictoryChest()) return;
      const diff = this.selectedDifficulty || { gold: 1 };
      const goldGained = Math.floor((this.runRewards.gold || 0) * (diff.gold || 1));
      GS.updateQuestProgress?.(this.registry, { type: "clear", dungeonId: this.selectedDungeonId, difficulty: this.selectedDifficultyKey, amount: 1 });
      this.openDungeonRewardPanel(goldGained);
    }});
  };

  proto.createCompletionExit = function () {
    const bossRoom = this.dungeonLayoutData.rooms.find(r => r.type === "boss") || { x: 3600, y: 600 };
    const x = bossRoom.x + 250, y = bossRoom.y;
    this.victoryChestVisual = this.add.rectangle(x, y, 72, 48, 0x8b5a2b, 0.0).setStrokeStyle(3, 0xffd84a, 0).setDepth(7).setVisible(false);
    this.completionText = this.add.text(x, y - 70, "VICTORY CHEST", { fontSize: "18px", color: "#ffff00", stroke: "#000", strokeThickness: 3 }).setOrigin(0.5).setDepth(8).setVisible(false);
    this.interactables.push({ x, y, name: "Open Victory Chest", promptRadius: 100, active: false, onConfirm: () => {
      if (this.canOpenVictoryChest && !this.canOpenVictoryChest()) return;
      this.openDungeonRewardPanel(this.runRewards.gold || 0);
    }});
  };

  const originalDefeatEnemy = proto.defeatEnemy;
  proto.defeatEnemy = function (enemy) {
    const result = originalDefeatEnemy.call(this, enemy);
    if (enemy && !enemy.__xpGranted) {
      enemy.__xpGranted = true;
      const playerLevel = this.registry.get("playerLevel") || 1;
      const loot = GS.getLootForEnemy?.(enemy.enemyId || enemy.displayName || "kekon", playerLevel, this.selectedDungeonId || "forgotten_halls") || { exp: 0 };
      const diff = this.selectedDifficulty || {};
      const baseXp = enemy.isBoss ? Math.max(120, (loot.exp || 35) * 4) : Math.max(8, loot.exp || 18);
      const xpResult = GS.grantXp?.(this.registry, Math.floor(baseXp * (diff.exp || diff.expMultiplier || 1)), enemy.isBoss ? "boss" : "mob");
      if (xpResult?.ok) {
        this.runRewards.xp = (this.runRewards.xp || 0) + xpResult.amount;
        this.showDamageText(enemy.x, enemy.y - (enemy.isBoss ? 132 : 72), `+${xpResult.amount} XP`, xpResult.levelsGained ? "#ffdd66" : "#9bd3ff");
        if (xpResult.levelsGained) this.showDamageText(this.player.x, this.player.y - 94, `LEVEL ${xpResult.level}`, "#ffdd66");
      }
    }
    if (enemy?.isBoss) {
      const chestX = enemy.x + 70;
      const chestY = enemy.y;
      if (this.victoryChestVisual) {
        this.victoryChestVisual.setPosition(chestX, chestY).setVisible(true).setAlpha(1).setFillStyle(0x8b5a2b, 0.95).setStrokeStyle(3, 0xffd84a, 0.98);
      }
      if (this.completionText) this.completionText.setPosition(chestX, chestY - 62).setVisible(true);
      const exit = (this.interactables || []).find((i) => i.name === "Open Victory Chest" || i.name === "Claim Victory");
      if (exit) {
        exit.active = true;
        exit.x = chestX;
        exit.y = chestY;
        exit.promptRadius = 160;
      }
      this.showDamageText(chestX, chestY - 70, "CHEST READY", "#ffdd66");
    }
    return result;
  };
})();

(function () {
  const Cls = window.DungeonPrototypeScene;
  const GS = window.GameState;
  if (!Cls || !GS) return;
  const proto = Cls.prototype;

  function getSkillForSlot(scene, index) {
    const size = GS.HOTBAR_SIZE || 6;
    const playerClass = scene.registry.get("playerClass") || GS.DEFAULT_CLASS || "warrior";
    const slots = [...(scene.registry.get("hotbarSlots") || new Array(size).fill(null))].slice(0, size);
    while (slots.length < size) slots.push(null);
    let entryId = slots[index] || null;
    let skill = entryId ? GS.getSkillDefById?.(entryId, playerClass) : null;
    if (!skill && index === 0) {
      skill = GS.getClassSkillForClass?.(playerClass) || null;
      entryId = skill?.id || null;
      if (entryId) {
        slots[0] = entryId;
        scene.registry.set("hotbarSlots", slots);
      }
    }
    return { entryId, skill };
  }

  function runSlot(scene, index) {
    if (!scene?.player || scene.rewardPanelOpen || scene.dialogOpen) return false;
    const anyPanelVisible = Object.values(scene.uiPanels || {}).some((panel) => panel?.open);
    if (anyPanelVisible) return false;

    const { entryId, skill } = getSkillForSlot(scene, index);
    const consumable = entryId ? (GS.getConsumableDef?.(entryId) || GS.CONSUMABLE_DEFS?.[entryId]) : null;
    if (skill) {
      const ok = scene.useSkillById ? scene.useSkillById(entryId) : scene.useClassSkill?.();
      if (ok) scene.showDamageText(scene.player.x, scene.player.y - 78, `SLOT ${index + 1}`, "#f4df9c");
      return !!ok;
    }
    if (consumable) {
      const result = GS.useHotbarEntry?.(scene.registry, entryId, scene);
      if (result?.ok) {
        scene.showDamageText(scene.player.x, scene.player.y - 78, "POT", "#f4df9c");
        scene.refreshHudPanel?.();
        scene.refreshDungeonHotbar?.();
      }
      return !!result?.ok;
    }
    scene.showDamageText(scene.player.x, scene.player.y - 78, "EMPTY", "#dddddd");
    return false;
  }

  function updateEnemyRuntime(scene) {
    const delta = Math.min(0.05, (scene.game?.loop?.delta || 16) / 1000);
    (scene.enemyPlaceholders || []).forEach((enemy) => {
      if (!enemy || enemy.hp <= 0 || !scene.player) return;
      enemy.homeX ??= enemy.x;
      enemy.homeY ??= enemy.y;
      enemy.patrolAngle ??= Phaser.Math.FloatBetween(0, Math.PI * 2);
      enemy.patrolRadius ??= enemy.isBoss ? 38 : Phaser.Math.Between(28, 72);
      enemy.attackRange = enemy.attackRange || (enemy.isBoss ? 150 : 112);
      enemy.leashRadius ??= enemy.isBoss ? 260 : 150;
      if (enemy.isBoss) {
        enemy.baseDamage ??= enemy.damage || 8;
        enemy.baseSpeed ??= enemy.speed || 52;
        const hpRatio = Phaser.Math.Clamp((enemy.hp || 0) / Math.max(1, enemy.maxHp || enemy.hp || 1), 0, 1);
        const phase = hpRatio <= 0.33 ? 3 : hpRatio <= 0.66 ? 2 : 1;
        if (enemy.bossPhase !== phase) {
          enemy.bossPhase = phase;
          scene.showDamageText?.(enemy.x, enemy.y - 120, `PHASE ${phase}`, "#ffdd66");
          enemy.sprite?.setTint?.(phase === 3 ? 0xff5533 : 0xffaa44);
          scene.time.delayedCall(220, () => enemy.sprite?.clearTint?.());
        }
        enemy.damage = Math.floor(enemy.baseDamage * (1 + (phase - 1) * 0.35));
        enemy.speed = enemy.baseSpeed * (1 + (phase - 1) * 0.16);
      }

      const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, scene.player.x, scene.player.y);
      const homeDist = Phaser.Math.Distance.Between(enemy.x, enemy.y, enemy.homeX, enemy.homeY);
      const playerHomeDist = Phaser.Math.Distance.Between(scene.player.x, scene.player.y, enemy.homeX, enemy.homeY);
      if (homeDist > enemy.leashRadius || playerHomeDist > enemy.leashRadius + 90) {
        const dirHome = new Phaser.Math.Vector2(enemy.homeX - enemy.x, enemy.homeY - enemy.y);
        if (dirHome.lengthSq() > 9) {
          dirHome.normalize();
          enemy.x += dirHome.x * Math.max(44, enemy.speed || 54) * delta;
          enemy.y += dirHome.y * Math.max(44, enemy.speed || 54) * delta;
          enemy.sprite?.setFlipX?.(dirHome.x < 0);
          enemy.sprite?.play?.(enemy.runAnim, true);
        }
      } else if (dist <= enemy.attackRange) {
        scene.tryEnemyAttack(enemy);
      } else if (dist <= 520) {
        const dir = new Phaser.Math.Vector2(scene.player.x - enemy.x, scene.player.y - enemy.y).normalize();
        enemy.x += dir.x * (enemy.speed || 54) * delta;
        enemy.y += dir.y * (enemy.speed || 54) * delta;
        enemy.sprite?.setFlipX?.(dir.x < 0);
        enemy.sprite?.play?.(enemy.runAnim, true);
      } else {
        enemy.patrolAngle += delta * 0.9;
        const targetX = enemy.homeX + Math.cos(enemy.patrolAngle) * enemy.patrolRadius;
        const targetY = enemy.homeY + Math.sin(enemy.patrolAngle) * enemy.patrolRadius;
        const dir = new Phaser.Math.Vector2(targetX - enemy.x, targetY - enemy.y);
        if (dir.lengthSq() > 4) {
          dir.normalize();
          enemy.x += dir.x * Math.max(24, (enemy.speed || 54) * 0.45) * delta;
          enemy.y += dir.y * Math.max(24, (enemy.speed || 54) * 0.45) * delta;
          enemy.sprite?.setFlipX?.(dir.x < 0);
          enemy.sprite?.play?.(enemy.runAnim, true);
        } else {
          enemy.sprite?.play?.(enemy.idleAnim, true);
        }
      }

      const nextHomeDist = Phaser.Math.Distance.Between(enemy.x, enemy.y, enemy.homeX, enemy.homeY);
      if (nextHomeDist > enemy.leashRadius) {
        const clampDir = new Phaser.Math.Vector2(enemy.x - enemy.homeX, enemy.y - enemy.homeY).normalize();
        enemy.x = enemy.homeX + clampDir.x * enemy.leashRadius;
        enemy.y = enemy.homeY + clampDir.y * enemy.leashRadius;
      }

      (enemy.visuals || []).forEach((visual) => {
        if (!visual?.setPosition) return;
        if (visual === enemy.sprite) visual.setPosition(enemy.x, enemy.y);
        else if (visual === enemy.hpBarBg || visual === enemy.hpBarFill || visual === enemy.hpName) return;
        else visual.setPosition(enemy.x, enemy.y + (enemy.isBoss ? 44 : 22));
      });
    });
    scene.updateEnemyHpBars?.();
  }

  const previousCreateInput = proto.createInput;
  proto.createInput = function () {
    previousCreateInput.call(this);
    this.__disableLegacyFSkill = true;
    this.__slotKeys = [1, 2, 3, 4, 5, 6].map((num) => this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[`DIGIT_${num}`] || Phaser.Input.Keyboard.KeyCodes[String(num)] || (Phaser.Input.Keyboard.KeyCodes.ONE + num - 1)));
    this.__slotKeys.forEach((key, index) => {
      key.on("down", () => runSlot(this, index));
    });
    this.__domDungeonKeyHandler = (event) => {
      if (!this.scene?.isActive?.("DungeonPrototypeScene")) return;
      if (document.activeElement === this.game?.canvas) return;
      const key = event.key?.toLowerCase?.();
      if (/^[1-6]$/.test(event.key)) {
        runSlot(this, Number(event.key) - 1);
        event.preventDefault();
      }
      if (["i", "c", "k", "q"].includes(key)) {
        const map = { i: "inventory", c: "character", k: "skills", q: "quests" };
        this.togglePanel?.(map[key]);
        event.preventDefault();
      }
      if (key === "p") {
        this.togglePet?.();
        event.preventDefault();
      }
      if ((event.key === "Enter" || event.key?.toLowerCase?.() === "e") && this.canOpenVictoryChest?.() && !this.rewardPanelOpen) {
        const gold = Math.floor((this.runRewards?.gold || 0) * (this.selectedDifficulty?.gold || 1));
        this.openDungeonRewardPanel?.(gold);
        event.preventDefault();
      }
    };
    window.addEventListener("keydown", this.__domDungeonKeyHandler);
    this.events.once("shutdown", () => {
      if (this.__domDungeonKeyHandler) window.removeEventListener("keydown", this.__domDungeonKeyHandler);
      this.__domDungeonKeyHandler = null;
    });
  };

  const previousUseClassSkill = proto.useClassSkill;
  proto.useClassSkill = function () {
    if (this.__disableLegacyFSkill) {
      this.showDamageText?.(this.player.x, this.player.y - 72, "USE 1-6", "#d7c58f");
      return false;
    }
    return previousUseClassSkill?.call(this);
  };

  proto.tryEnemyAttack = function (enemy) {
    if (!enemy || enemy.hp <= 0 || !this.player) return;
    if (this.time.now < (enemy.lastAttackAt || 0) + (enemy.isBoss ? 950 : 1150)) return;
    const range = enemy.attackRange || (enemy.isBoss ? 150 : 112);
    const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    if (dist > range + 18) return;
    enemy.lastAttackAt = this.time.now;
    enemy.sprite?.setTint?.(0xffb14a);
    this.time.delayedCall(120, () => enemy.sprite?.clearTint?.());
    this.showDamageText(enemy.x, enemy.y - (enemy.isBoss ? 94 : 54), "ATK", "#ffbb66");
    this.damagePlayer(Math.max(1, enemy.damage || 1));
  };

  const previousUpdate = proto.update;
  proto.update = function () {
    if (this.rewardPanelOpen) {
      if (this.player?.body) this.player.body.setVelocity(0, 0);
      const enterPressed = this.actionKeys?.confirm && Phaser.Input.Keyboard.JustDown(this.actionKeys.confirm);
      if (enterPressed) {
        this.rewardPanelOpen = false;
        this.rewardPanelElements?.forEach((el) => el.destroy?.());
        this.scene.start("PrototypeScene", { dungeonReturn: this.pendingTownReturn || { cleared: true, goldGained: this.runRewards?.gold || 0 } });
      }
      return;
    }

    [0, 1, 2, 3, 4, 5].forEach((index) => {
      const key = this.__slotKeys?.[index] || this.actionKeys?.[`slot${index + 1}`];
      if (key && Phaser.Input.Keyboard.JustDown(key)) runSlot(this, index);
    });

    if (this.canOpenVictoryChest?.() && !this.rewardPanelOpen) {
      const openPressed = (this.actionKeys?.confirm && Phaser.Input.Keyboard.JustDown(this.actionKeys.confirm))
        || (this.actionKeys?.interact && Phaser.Input.Keyboard.JustDown(this.actionKeys.interact));
      if (openPressed) {
        const gold = Math.floor((this.runRewards?.gold || 0) * (this.selectedDifficulty?.gold || 1));
        this.openDungeonRewardPanel?.(gold);
        return;
      }
    }

    const result = previousUpdate.call(this);
    this.updatePet?.();
    this.updateMercenaryCompanion?.();
    updateEnemyRuntime(this);
    return result;
  };

  function makeRewardText(scene, x, y, text, style = {}) {
    return scene.add.text(x, y, text, Object.assign({
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "12px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 3,
    }, style)).setOrigin(0.5).setDepth(2002);
  }

  const previousOpenDungeonRewardPanel = proto.openDungeonRewardPanel;
  proto.openDungeonRewardPanel = function (goldGained = 0) {
    if (this.rewardPanelOpen) return previousOpenDungeonRewardPanel.call(this, goldGained);
    const rewardPlan = GS.getDungeonChestRewardPlan?.({
      kills: this.enemyDefeatCount || this.defeatedEnemyCount || 0,
      total: this.totalDungeonMobCount || Math.max(1, this.enemyPlaceholders?.filter?.((enemy) => !enemy.isBoss).length || 1),
      difficultyKey: this.selectedDifficultyKey || "normal",
      baseTier: Math.max(1, Math.ceil((this.registry.get("playerLevel") || 1) / 2)),
    }) || null;
    if (rewardPlan) {
      goldGained = Math.floor((goldGained || 0) * (rewardPlan.goldMultiplier || 1));
      this.__dungeonRewardPlan = rewardPlan;
    }
    if (!this.__bossGoldGranted) {
      const cut = GS.applyMercenaryLootCut?.(this.registry, Math.max(0, goldGained || 0), "Dungeon Gold") || { playerAmount: Math.max(0, goldGained || 0), mercenaryAmount: 0 };
      goldGained = cut.playerAmount || 0;
      this.__mercenaryGoldCut = cut.mercenaryAmount || 0;
      this.registry.set("gold", (this.registry.get("gold") || 0) + Math.max(0, goldGained || 0));
      this.__bossGoldGranted = true;
    }
    if (!this.__bossEquipmentRewardGranted) {
      this.__bossEquipmentRewardGranted = GS.grantBossEquipmentReward?.(this.registry, this.selectedDungeonId || "forgotten_halls", this.selectedDifficultyKey || "normal") || null;
    }
    if (!this.__bossMaterialsGranted) {
      this.__bossMaterialsGranted = GS.grantDungeonMaterials?.(
        this.registry,
        this.selectedDungeonId || "forgotten_halls",
        this.selectedDifficultyKey || "normal",
        this.enemyDefeatCount || this.defeatedEnemyCount || 0,
      ) || [];
    }
    previousOpenDungeonRewardPanel.call(this, goldGained);
    const item = this.__bossEquipmentRewardGranted?.item;
    const materialText = (this.__bossMaterialsGranted || []).map((mat) => `${mat.name} x${mat.amount}`).join(" | ");
    if (item && this.rewardPanelElements?.length) {
      const { width, height } = this.scale;
      const iconKey = this.safeDungeonTexture?.(item.baseIcon || item.icon || "icon_11") || item.baseIcon || item.icon || "icon_11";
      const icon = this.add.image(width / 2 - 155, height / 2 + 54, iconKey)
        .setDisplaySize(30, 30).setTint(item.color || item.baseColor || 0xffffff).setScrollFactor(0).setDepth(2002);
      const line = makeRewardText(
        this,
        width / 2 + 10,
        height / 2 + 50,
        this.__bossEquipmentRewardGranted.convertedToGold
          ? `${GS.getItemDisplayName?.(item) || item.name} sold: +${this.__bossEquipmentRewardGranted.value} Gold`
          : `Item: ${GS.getItemDisplayName?.(item) || item.name}`,
        { fontSize: "13px", color: item.color ? `#${item.color.toString(16).padStart(6, "0")}` : "#f8f1dc" },
      ).setScrollFactor(0).setDepth(2002);
      this.rewardPanelElements.push(icon, line);
    }
    if (materialText && this.rewardPanelElements?.length) {
      const { width, height } = this.scale;
      const materials = makeRewardText(this, width / 2, height / 2 + 76, materialText, { fontSize: "12px", color: "#8ad97a" })
        .setScrollFactor(0).setDepth(2002);
      this.rewardPanelElements.push(materials);
    }
    if (this.__dungeonRewardPlan && this.rewardPanelElements?.length) {
      const { width, height } = this.scale;
      const score = this.__dungeonRewardPlan.score || {};
      const scoreLine = makeRewardText(this, width / 2, height / 2 + 98, `Clear Grade ${score.grade || "C"} | Chest Tier +${this.__dungeonRewardPlan.tier || 1}`, { fontSize: "12px", color: "#ffdf78" })
        .setScrollFactor(0).setDepth(2002);
      this.rewardPanelElements.push(scoreLine);
      if (this.__mercenaryGoldCut) {
        const mercLine = makeRewardText(this, width / 2, height / 2 + 116, `Mercenary Cut: -${this.__mercenaryGoldCut} Gold`, { fontSize: "11px", color: "#f4df9c" })
          .setScrollFactor(0).setDepth(2002);
        this.rewardPanelElements.push(mercLine);
      }
    }
    this.pendingTownReturn = {
      ...(this.pendingTownReturn || {}),
      cleared: true,
      goldGained,
      dungeonId: this.selectedDungeonId,
      rewardItemName: item ? (GS.getItemDisplayName?.(item) || item.name) : "",
      materials: this.__bossMaterialsGranted || [],
      clearGrade: this.__dungeonRewardPlan?.score?.grade || "",
    };
    GS.saveProgress?.(this.registry);
  };
})();
