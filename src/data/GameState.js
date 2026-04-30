window.GameState = {
  STARTER_WEAPONS: {
    warrior: { name: "Iron Sword", ap: 12, hpBonus: 0, mpBonus: 0 },
    mage: { name: "Mystic Staff", ap: 20, hpBonus: 0, mpBonus: 10 },
    rogue: { name: "Hunter Dagger", ap: 14, hpBonus: 0, mpBonus: 0 },
    archer: { name: "Short Bow", ap: 16, hpBonus: 0, mpBonus: 0 },
  },

  DEFAULT_CLASS: "warrior",

  HP_POTION_HEAL: 50,
  MP_POTION_RESTORE: 30,

  BASE_HP: 100,
  BASE_MP: 40,
  BASE_SPEED: 180,
  SAVE_STORAGE_KEY: "mmoisekai-save-v1",
  EDITOR_STORAGE_KEY: "mmoisekai-editor-v1",
  UPGRADE_SUCCESS_BY_LEVEL: {
    1: 100,
    2: 100,
    3: 85,
    4: 70,
    5: 50,
    6: 30,
    7: 10,
  },
  DEFAULT_GAME_CONFIG: {
    dungeon: {
      roomMinMobs: 1,
      roomMaxMobs: 10,
      bossBaseHpMultiplier: 1,
      killQualityLow: 0.45,
      killQualityHigh: 0.9,
    },
    difficulty: {
      normal: {
        label: "Normal",
        hpMultiplier: 1,
        damageMultiplier: 1,
        defenseMultiplier: 1,
        resistBonus: 0,
        goldMultiplier: 1,
        expMultiplier: 1,
        dropMultiplier: 1,
        spawnBonus: 0,
        bossHpMultiplier: 1,
        chestQualityBonus: 0,
        color: 0xbfc9d6,
      },
      hard: {
        label: "Hard",
        hpMultiplier: 1.26,
        damageMultiplier: 1.16,
        defenseMultiplier: 1.12,
        resistBonus: 0.03,
        goldMultiplier: 1.2,
        expMultiplier: 1.22,
        dropMultiplier: 1.12,
        spawnBonus: 1,
        bossHpMultiplier: 1.5,
        chestQualityBonus: 0.08,
        color: 0xe0a16f,
      },
      nightmare: {
        label: "Very Hard",
        hpMultiplier: 1.6,
        damageMultiplier: 1.34,
        defenseMultiplier: 1.22,
        resistBonus: 0.06,
        goldMultiplier: 1.45,
        expMultiplier: 1.5,
        dropMultiplier: 1.24,
        spawnBonus: 2,
        bossHpMultiplier: 2.2,
        chestQualityBonus: 0.16,
        color: 0xe07a7a,
      },
      very_hard: {
        label: "Very Hard",
        hpMultiplier: 1.6,
        damageMultiplier: 1.34,
        defenseMultiplier: 1.22,
        resistBonus: 0.06,
        goldMultiplier: 1.45,
        expMultiplier: 1.5,
        dropMultiplier: 1.24,
        spawnBonus: 2,
        bossHpMultiplier: 2.2,
        chestQualityBonus: 0.16,
        color: 0xe07a7a,
      },
    },
  },
  ENEMY_ARCHETYPES: {
    kekon: {
      hp: 22, speed: 56, damage: 7, defense: 2,
      physicalResist: 0.02, magicResist: 0, rangedResist: 0,
    },
    kekon_warrior: {
      hp: 40, speed: 52, damage: 12, defense: 5,
      physicalResist: 0.1, magicResist: 0.04, rangedResist: 0.04,
    },
    kekon_shaman: {
      hp: 34, speed: 54, damage: 11, defense: 3,
      physicalResist: 0.06, magicResist: 0.12, rangedResist: 0.05,
    },
    kekon_brute: {
      hp: 68, speed: 46, damage: 18, defense: 8,
      physicalResist: 0.18, magicResist: 0.06, rangedResist: 0.12,
    },
    kekon_boss: {
      hp: 120, speed: 44, damage: 18, defense: 9,
      physicalResist: 0.18, magicResist: 0.12, rangedResist: 0.15,
    },
  },

  deepClone(value) {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  },

  mergeDeep(base, override) {
    if (!override || typeof override !== "object" || Array.isArray(override)) {
      return override === undefined ? this.deepClone(base) : this.deepClone(override);
    }
    const result = this.deepClone(base) || {};
    Object.keys(override).forEach((key) => {
      const baseValue = result[key];
      const overrideValue = override[key];
      if (overrideValue && typeof overrideValue === "object" && !Array.isArray(overrideValue)) {
        result[key] = this.mergeDeep(baseValue || {}, overrideValue);
      } else {
        result[key] = this.deepClone(overrideValue);
      }
    });
    return result;
  },

  ensureGameConfig(registry) {
    const existingConfig = registry.get("gameConfig");
    const persistedEditorConfig = this.loadEditorSnapshot?.()?.gameConfig || {};
    const mergedConfig = this.mergeDeep(
      this.mergeDeep(this.DEFAULT_GAME_CONFIG, existingConfig || {}),
      persistedEditorConfig,
    );
    if (!existingConfig || JSON.stringify(existingConfig) !== JSON.stringify(mergedConfig)) {
      registry.set("gameConfig", mergedConfig);
    }
    const persistedDifficulty = this.loadEditorSnapshot?.()?.selectedDungeonDifficulty;
    const currentDifficulty = registry.get("selectedDungeonDifficulty");
    registry.set("selectedDungeonDifficulty", persistedDifficulty || currentDifficulty || "normal");
    if (registry.get("playerLevel") === undefined) {
      registry.set("playerLevel", 1);
    }
    return mergedConfig;
  },

  getGameConfig(registry) {
    return this.ensureGameConfig(registry);
  },

  getGameConfigValue(registry, path, fallback = null) {
    const config = this.getGameConfig(registry);
    const keys = Array.isArray(path) ? path : `${path}`.split(".");
    let current = config;
    for (const key of keys) {
      if (current == null || !Object.prototype.hasOwnProperty.call(current, key)) {
        return fallback;
      }
      current = current[key];
    }
    return current ?? fallback;
  },

  setGameConfigValue(registry, path, value) {
    const config = this.getGameConfig(registry);
    const keys = Array.isArray(path) ? [...path] : `${path}`.split(".");
    const nextConfig = this.deepClone(config);
    let current = nextConfig;
    while (keys.length > 1) {
      const key = keys.shift();
      current[key] = current[key] && typeof current[key] === "object" ? current[key] : {};
      current = current[key];
    }
    current[keys[0]] = value;
    registry.set("gameConfig", nextConfig);
    return nextConfig;
  },

  resetGameConfig(registry) {
    const resetConfig = this.deepClone(this.DEFAULT_GAME_CONFIG);
    registry.set("gameConfig", resetConfig);
    registry.set("selectedDungeonDifficulty", "normal");
    return resetConfig;
  },

  buildEditorSnapshot(registry) {
    return {
      version: 1,
      savedAt: Date.now(),
      selectedDungeonDifficulty: this.getSelectedDungeonDifficultyKey(registry),
      gameConfig: this.deepClone(this.getGameConfig(registry)),
    };
  },

  saveEditorSnapshot(registry) {
    try {
      const snapshot = this.buildEditorSnapshot(registry);
      window.localStorage?.setItem(this.EDITOR_STORAGE_KEY, JSON.stringify(snapshot));
      return snapshot;
    } catch (error) {
      console.warn("Editor save failed", error);
      return null;
    }
  },

  loadEditorSnapshot() {
    try {
      const raw = window.localStorage?.getItem(this.EDITOR_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      return parsed?.gameConfig ? parsed : null;
    } catch (error) {
      console.warn("Editor load failed", error);
      return null;
    }
  },

  applyEditorSnapshot(registry, snapshot = null) {
    const resolvedSnapshot = snapshot || this.loadEditorSnapshot();
    if (!resolvedSnapshot?.gameConfig) {
      return false;
    }
    const merged = this.mergeDeep(this.DEFAULT_GAME_CONFIG, resolvedSnapshot.gameConfig);
    registry.set("gameConfig", merged);
    registry.set("selectedDungeonDifficulty", resolvedSnapshot.selectedDungeonDifficulty || "normal");
    return true;
  },

  syncEditorSnapshotToSavedProgress(snapshot = null) {
    const resolvedSnapshot = snapshot || this.loadEditorSnapshot();
    if (!resolvedSnapshot?.gameConfig) {
      return false;
    }
    try {
      const raw = window.localStorage?.getItem(this.SAVE_STORAGE_KEY);
      if (!raw) {
        return false;
      }
      const parsed = JSON.parse(raw);
      if (!parsed?.data) {
        return false;
      }
      parsed.data.gameConfig = this.deepClone(resolvedSnapshot.gameConfig);
      parsed.data.selectedDungeonDifficulty = resolvedSnapshot.selectedDungeonDifficulty || "normal";
      window.localStorage?.setItem(this.SAVE_STORAGE_KEY, JSON.stringify(parsed));
      return true;
    } catch (error) {
      console.warn("Editor sync to save failed", error);
      return false;
    }
  },

  getDungeonDifficultyKeys(registry) {
    return Object.keys(this.getGameConfigValue(registry, "difficulty", this.DEFAULT_GAME_CONFIG.difficulty));
  },

  getSelectedDungeonDifficultyKey(registry) {
    this.ensureGameConfig(registry);
    const key = registry.get("selectedDungeonDifficulty") || "normal";
    return this.getDungeonDifficultyKeys(registry).includes(key) ? key : "normal";
  },

  setSelectedDungeonDifficulty(registry, difficultyKey) {
    const fallback = "normal";
    const resolved = this.getDungeonDifficultyKeys(registry).includes(difficultyKey) ? difficultyKey : fallback;
    registry.set("selectedDungeonDifficulty", resolved);
    return resolved;
  },

  cycleDungeonDifficulty(registry) {
    const keys = this.getDungeonDifficultyKeys(registry);
    const current = this.getSelectedDungeonDifficultyKey(registry);
    const nextIndex = (keys.indexOf(current) + 1) % keys.length;
    const next = keys[nextIndex];
    registry.set("selectedDungeonDifficulty", next);
    return next;
  },

  getDungeonDifficultyDef(registry, difficultyKey = null) {
    const key = difficultyKey || this.getSelectedDungeonDifficultyKey(registry);
    return this.getGameConfigValue(registry, ["difficulty", key], this.DEFAULT_GAME_CONFIG.difficulty.normal);
  },

  getEffectivePlayerLevel(registry) {
    const stored = registry.get("playerLevel") || 1;
    const cycleBonus = Math.floor((registry.get("dungeonCycles") || 0) / 2);
    const powerBonus = Math.max(0, (registry.get("playerPowerTier") || 1) - 1);
    return Math.max(stored, 1 + cycleBonus + powerBonus);
  },

  getScaledEnemyStats(registry, enemyKey, phaseId = 1, difficultyKey = null, variantKey = "forgotten_halls") {
    const archetype = this.ENEMY_ARCHETYPES[enemyKey] || this.ENEMY_ARCHETYPES.kekon;
    const difficulty = this.getDungeonDifficultyDef(registry, difficultyKey);
    const effectiveLevel = this.getEffectivePlayerLevel(registry);
    const variantBossBoost = variantKey === "ashen_barracks" ? 1.08 : variantKey === "sunken_sanctum" ? 1.05 : 1;
    const phaseMultiplier = 1 + Math.max(0, phaseId - 1) * 0.18;
    const levelMultiplier = 1 + Math.max(0, effectiveLevel - 1) * 0.04;
    const bossMultiplier = enemyKey === "kekon_boss"
      ? (this.getGameConfigValue(registry, "dungeon.bossBaseHpMultiplier", 1) * (difficulty.bossHpMultiplier || 1) * variantBossBoost)
      : 1;
    const resistBonus = difficulty.resistBonus || 0;

    return {
      hp: Math.floor(archetype.hp * phaseMultiplier * difficulty.hpMultiplier * levelMultiplier * bossMultiplier),
      maxHp: Math.floor(archetype.hp * phaseMultiplier * difficulty.hpMultiplier * levelMultiplier * bossMultiplier),
      speed: Math.max(36, Math.floor(archetype.speed * (1 + Math.max(0, effectiveLevel - 1) * 0.01))),
      damage: Math.floor(archetype.damage * phaseMultiplier * difficulty.damageMultiplier * (1 + Math.max(0, effectiveLevel - 1) * 0.03)),
      defense: Math.max(0, Math.floor(archetype.defense * difficulty.defenseMultiplier * (1 + Math.max(0, phaseId - 1) * 0.06))),
      physicalResist: Math.min(0.55, (archetype.physicalResist || 0) + resistBonus),
      magicResist: Math.min(0.55, (archetype.magicResist || 0) + resistBonus),
      rangedResist: Math.min(0.55, (archetype.rangedResist || 0) + resistBonus),
    };
  },

  buildBossChestLoot(registry, variantKey = "forgotten_halls", killRatio = 1, difficultyKey = null) {
    const difficulty = this.getDungeonDifficultyDef(registry, difficultyKey);
    const normalizedRatio = Phaser.Math.Clamp(killRatio + (difficulty.chestQualityBonus || 0), 0, 1.2);
    const playerClass = registry.get("playerClass") || this.DEFAULT_CLASS;
    const classGear = this.CLASS_EQUIPMENT[playerClass] || this.CLASS_EQUIPMENT[this.DEFAULT_CLASS];
    const tierIndex = normalizedRatio >= this.getGameConfigValue(registry, "dungeon.killQualityHigh", 0.9)
      ? 2
      : normalizedRatio >= this.getGameConfigValue(registry, "dungeon.killQualityLow", 0.45)
        ? 1
        : 0;
    const slotPick = normalizedRatio >= 0.85 ? "weapon" : normalizedRatio >= 0.6 ? "body" : Phaser.Utils.Array.GetRandom(["head", "hands", "legs"]);
    const template = classGear?.[slotPick]?.[Math.min(tierIndex, (classGear?.[slotPick]?.length || 1) - 1)];
    const itemReward = template ? this.createInventoryItemFromTemplate(template) : null;
    const baseLoot = this.getLootForEnemy("Kekon Boss", this.getEffectivePlayerLevel(registry), variantKey);
    const gold = Math.floor(baseLoot.gold * (difficulty.goldMultiplier || 1) * (0.7 + normalizedRatio * 0.6));
    const exp = Math.floor(baseLoot.exp * (difficulty.expMultiplier || 1) * (0.75 + normalizedRatio * 0.5));
    const items = [...(baseLoot.items || [])];

    if (tierIndex === 0) {
      while (items.length > 2) items.pop();
    }
    if (tierIndex >= 1 && itemReward) {
      items.unshift({ id: itemReward.id, rarity: itemReward.rarity || (tierIndex >= 2 ? "rare" : "uncommon"), chestGuaranteed: true });
    }
    if (tierIndex >= 2) {
      items.push({ id: "legendaryFragment", rarity: "legendary" });
    }

    return {
      gold,
      exp,
      items,
      qualityTier: tierIndex,
      qualityRatio: normalizedRatio,
    };
  },

  ensureCoreStats(registry) {
    const randomStat = () => Phaser.Math.Between(3, 6);

    if (registry.get("hpStat") === undefined) {
      registry.set("hpStat", randomStat());
    }
    if (registry.get("mpStat") === undefined) {
      registry.set("mpStat", randomStat());
    }
    if (registry.get("strStat") === undefined) {
      registry.set("strStat", randomStat());
    }
    if (registry.get("dexStat") === undefined) {
      registry.set("dexStat", randomStat());
    }
    if (registry.get("statPoints") === undefined) {
      registry.set("statPoints", 5);
    }
    if (registry.get("weaponUpgradePaperCount") === undefined) {
      registry.set("weaponUpgradePaperCount", 0);
    }
  },

  getStat(registry, key) {
    return registry.get(key) || 0;
  },

  getEquippedWeapon(registry) {
    return this.getEquippedItem(registry, "weapon");
  },

  getPlayerSpeed(registry) {
    return this.BASE_SPEED
      + (this.getStat(registry, "dexStat") + this.getItemStatBonus(registry, "dex")) * 2
      + this.getClassTrainingBonus(registry, "speed");
  },

  getItemFamilyClass(item, fallbackClass = null) {
    const itemId = item?.id || "";
    if (itemId.startsWith("war_")) return "warrior";
    if (itemId.startsWith("mge_")) return "mage";
    if (itemId.startsWith("rog_")) return "rogue";
    if (itemId.startsWith("arc_")) return "archer";
    return fallbackClass || this.DEFAULT_CLASS;
  },

  getPrimaryStatKeyForClass(className) {
    return {
      warrior: "strStat",
      mage: "mpStat",
      rogue: "dexStat",
      archer: "dexStat",
    }[className] || "strStat";
  },

  getPrimaryStatLabelForClass(className) {
    return this.getStatLabel(this.getPrimaryStatKeyForClass(className));
  },

  getItemDisplayName(item) {
    if (!item) {
      return "Unknown";
    }
    const upgradeLevel = item.upgradeLevel || 0;
    return upgradeLevel > 0 ? `${item.name} +${upgradeLevel}` : (item.name || "Unknown");
  },

  initWeaponState(registry) {
    if (registry.get("equipped_weapon") === undefined) {
      const starter = this.STARTER_WEAPONS[registry?.get("playerClass") || this.DEFAULT_CLASS] || this.STARTER_WEAPONS[this.DEFAULT_CLASS];
      registry.set("equipped_weapon", { ...starter, upgradeLevel: 0, slot: "weapon" });
    }
    if (registry.get("mpPotionCount") === undefined) {
      registry.set("mpPotionCount", 0);
    }
    if (registry.get("playerClass") === undefined) {
      registry.set("playerClass", this.DEFAULT_CLASS);
    }
    if (registry.get("weaponUpgradePaperCount") === undefined) {
      registry.set("weaponUpgradePaperCount", 0);
    }
    this.ensureCoreStats(registry);
  },

  upgradeWeapon(registry) {
    const slot = "weapon";
    const current = this.getEquippedItem(registry, slot);
    if (!current) {
      return null;
    }
    const currentAp = current.ap ?? current.stats?.ap ?? 10;
    const newAp = currentAp + 4;
    const upgraded = {
      ...current,
      ap: newAp,
      stats: current.stats ? { ...current.stats, ap: newAp } : { ap: newAp },
      upgradeLevel: (current.upgradeLevel || 0) + 1,
    };
    registry.set(`equipped_${slot}`, upgraded);
    return upgraded;
  },

  getUpgradeCost(registry, source = null) {
    const weapon = source ? this.getItemFromSource(registry, source) : this.getEquippedItem(registry, "weapon");
    const level = weapon ? weapon.upgradeLevel || 0 : 0;
    return 30 + level * 15;
  },

  getUpgradeSuccessRate(targetLevel) {
    return this.UPGRADE_SUCCESS_BY_LEVEL[targetLevel] ?? 0;
  },

  getUpgradePaperCost(registry, source = null) {
    const weapon = source ? this.getItemFromSource(registry, source) : this.getEquippedItem(registry, "weapon");
    const level = weapon ? weapon.upgradeLevel || 0 : 0;
    return 18 + level * 4;
  },

  getUpgradePaperCount(registry) {
    return registry.get("weaponUpgradePaperCount") || 0;
  },

  getItemFromSource(registry, source) {
    if (!source?.sourceType) {
      return null;
    }
    if (source.sourceType === "equipped") {
      return this.getEquippedItem(registry, source.slot || "weapon");
    }
    if (source.sourceType === "inventory") {
      const items = this.getInventoryItems(registry);
      return items[source.index] || null;
    }
    return null;
  },

  setItemAtSource(registry, source, item) {
    if (!source?.sourceType) {
      return false;
    }
    if (source.sourceType === "equipped") {
      registry.set(`equipped_${source.slot || "weapon"}`, item ? { ...item } : null);
      return true;
    }
    if (source.sourceType === "inventory") {
      const items = [...this.getInventoryItems(registry)];
      if (source.index < 0 || source.index >= items.length) {
        return false;
      }
      items[source.index] = item ? { ...item } : null;
      registry.set("inventoryItems", items);
      return true;
    }
    return false;
  },

  getUpgradeableEquipmentSources(registry) {
    const sources = [];
    this.EQUIP_SLOTS.forEach((slot) => {
      const equippedItem = this.getEquippedItem(registry, slot);
      if (!equippedItem) {
        return;
      }
      sources.push({
        key: `equipped_${slot}`,
        sourceType: "equipped",
        slot,
        label: "Equipped",
        item: { ...equippedItem },
      });
    });

    this.getInventoryItems(registry).forEach((item, index) => {
      if (item?.slot) {
        sources.push({
          key: `inventory_${index}`,
          sourceType: "inventory",
          index,
          label: `Bag ${index + 1}`,
          item: { ...item },
        });
      }
    });

    return sources;
  },

  getUpgradeableWeaponSources(registry) {
    return this.getUpgradeableEquipmentSources(registry).filter((entry) => entry.item?.slot === "weapon");
  },

  getUpgradePreviewDelta(item) {
    const slot = item?.slot || "weapon";
    if (slot === "weapon") {
      return {
        ap: 4,
      };
    }
    if (slot === "body") {
      return { hp: 8, hpBonus: 4 };
    }
    if (slot === "head") {
      return { hp: 4, mp: 4 };
    }
    if (slot === "hands") {
      return { str: 1, ap: 1 };
    }
    if (slot === "legs") {
      return { dex: 1, hp: 3 };
    }
    return { hp: 4 };
  },

  applyUpgradeDeltaToItem(current, deltaStats = {}) {
    const nextStats = current.stats ? { ...current.stats } : {};
    Object.entries(deltaStats).forEach(([key, value]) => {
      const currentValue = nextStats[key] ?? current[key] ?? 0;
      nextStats[key] = currentValue + value;
    });

    const upgraded = {
      ...current,
      stats: nextStats,
    };

    if (nextStats.ap !== undefined) upgraded.ap = nextStats.ap;
    if (nextStats.hpBonus !== undefined) upgraded.hpBonus = nextStats.hpBonus;
    if (nextStats.mpBonus !== undefined) upgraded.mpBonus = nextStats.mpBonus;

    return upgraded;
  },

  buildUpgradeStatSummary(item) {
    const summaryStats = ["ap", "hp", "mp", "str", "dex", "hpBonus", "mpBonus"]
      .map((key) => {
        const value = this.getItemStatValue(item, key);
        if (!value) return null;
        const label = this.ITEM_STAT_LABELS[key] || key.toUpperCase();
        return `${label} ${value >= 0 ? "+" : ""}${value}`;
      })
      .filter(Boolean);
    return summaryStats.slice(0, 3).join(" | ") || "No stats";
  },

  attemptEquipmentUpgradeAtSource(registry, source) {
    const current = this.getItemFromSource(registry, source);
    if (!current?.slot) {
      return { ok: false, reason: "no_item" };
    }

    const currentLevel = current.upgradeLevel || 0;
    const targetLevel = currentLevel + 1;
    if (targetLevel > 7) {
      return { ok: false, reason: "max_level", weapon: current, currentLevel };
    }

    const successRate = this.getUpgradeSuccessRate(targetLevel);
    const roll = Phaser.Math.FloatBetween(0, 100);
    const success = roll <= successRate;
    const beforeItem = { ...current, stats: current.stats ? { ...current.stats } : current.stats };
    const beforeSummary = this.buildUpgradeStatSummary(beforeItem);

    if (!success) {
      return {
        ok: true,
        success: false,
        item: current,
        currentLevel,
        targetLevel,
        successRate,
        roll,
        beforeItem,
        afterItem: beforeItem,
        beforeSummary,
        afterSummary: beforeSummary,
      };
    }

    const statDelta = this.getUpgradePreviewDelta(current);
    const upgraded = this.applyUpgradeDeltaToItem(current, statDelta);
    upgraded.upgradeLevel = targetLevel;
    this.setItemAtSource(registry, source, upgraded);
    return {
      ok: true,
      success: true,
      item: upgraded,
      currentLevel,
      targetLevel,
      successRate,
      roll,
      beforeItem,
      afterItem: upgraded,
      beforeSummary,
      afterSummary: this.buildUpgradeStatSummary(upgraded),
      statDelta,
    };
  },

  attemptWeaponUpgradeAtSource(registry, source) {
    return this.attemptEquipmentUpgradeAtSource(registry, source);
  },

  attemptWeaponUpgrade(registry) {
    return this.attemptEquipmentUpgradeAtSource(registry, {
      sourceType: "equipped",
      slot: "weapon",
    });
  },

  allocateStatPoint(registry, statKey) {
    const allowed = ["hpStat", "mpStat", "strStat", "dexStat"];
    if (!allowed.includes(statKey)) {
      return false;
    }
    const points = registry.get("statPoints") || 0;
    if (points <= 0) {
      return false;
    }
    registry.set(statKey, (registry.get(statKey) || 0) + 1);
    registry.set("statPoints", points - 1);
    return true;
  },

  HOTBAR_SIZE: 6,

  CONSUMABLE_DEFS: {
    hpPotion: {
      id: "hpPotion",
      name: "HP Potion",
      color: 0x4a8a5a,
      label: "HP",
      countKey: "healthPotionCount",
      healAmount: 50,
      type: "healHp",
    },
    mpPotion: {
      id: "mpPotion",
      name: "MP Potion",
      color: 0x4a5a8a,
      label: "MP",
      countKey: "mpPotionCount",
      restoreAmount: 30,
      type: "restoreMp",
    },
  },

  CLASS_SKILL_DEFS: {},

  CLASS_TRAINING_DEFS: {
    warrior: {
      name: "Battle Instinct",
      statLabel: "HP",
      perLevel: 12,
      description: "Permanent front-line conditioning that hardens the body for longer melee trading.",
    },
    mage: {
      name: "Mana Discipline",
      statLabel: "MP",
      perLevel: 10,
      description: "Permanent mana discipline that expands spellcasting endurance each run.",
    },
    rogue: {
      name: "Shadow Reflex",
      statLabel: "SPD",
      perLevel: 4,
      description: "Permanent reflex drills that sharpen movement speed and repositioning.",
    },
    archer: {
      name: "Keen Sight",
      statLabel: "AP",
      perLevel: 3,
      description: "Permanent ranged focus that improves shot power and target execution.",
    },
  },

  EQUIP_SLOTS: ["head", "body", "hands", "legs", "weapon"],

  CLASS_EQUIPMENT: {},

  RANDOM_NAMES: [
    "Aragorn", "Legolas", "Gimli", "Frodo", "Gandalf", "Aerith", "Cloud", "Tifa",
    "Zelda", "Link", "Samus", "Mario", "Lara", "Kratos", "Eliwood", "Hector",
    "Roy", "Ike", "Marth", "Lucina", "Robin", "Byleth", "Camilla", "Thorne",
    "Kael", "Rys", "Vega", "Nyx", "Zara", "Jin", "Rin", "Yuki", "Kira", "Sora",
  ],

  RARITY_NAMES: {},

  ITEM_RARITY_DISTRIBUTION: {},

  SET_BONUSES: {},

  generateItemRarity() {
    const roll = window.Phaser?.Math?.Between ? window.Phaser.Math.Between(1, 100) : Math.ceil(Math.random() * 100);
    const dist = window.ItemDatabase?.ITEM_RARITY_DISTRIBUTION || this.ITEM_RARITY_DISTRIBUTION || {};
    if (roll <= dist.legendary) return "legendary";
    if (roll <= dist.legendary + dist.epic) return "epic";
    if (roll <= dist.legendary + dist.epic + dist.rare) return "rare";
    if (roll <= dist.legendary + dist.epic + dist.rare + dist.uncommon) return "uncommon";
    return "common";
  },

  getRarityColor(rarity) {
    const rarityNames = window.ItemDatabase?.RARITY_NAMES || this.RARITY_NAMES || {};
    return rarityNames[rarity]?.color || 0xffffff;
  },

  ITEM_STAT_LABELS: {
    ap: "AP",
    hp: "HP",
    mp: "MP",
    str: "STR",
    dex: "DEX",
    hpBonus: "HP Bonus",
    mpBonus: "MP Bonus",
  },

  getTemplateRarity(item) {
    if (!item) {
      return "common";
    }

    if (item.rarity) {
      return item.rarity;
    }

    const itemId = item.id || "";
    if (itemId.endsWith("_03") || itemId.includes("legendary")) {
      return "rare";
    }
    if (itemId.endsWith("_02") || itemId.endsWith("_01") === false) {
      return "uncommon";
    }
    return "common";
  },

  getItemDisplayColor(item, rarity = null) {
    if (!item) {
      return 0xffffff;
    }

    if (item.color) {
      return item.color;
    }

    const resolvedRarity = rarity || this.getTemplateRarity(item);
    const rarityNames = window.ItemDatabase?.RARITY_NAMES || this.RARITY_NAMES || {};
    const rarityInfo = rarityNames[resolvedRarity] || rarityNames.common || { color: 0xc0c0c0 };
    return this.blendRarityColor(item.baseColor || 0xaaaaaa, rarityInfo.color, 0.3);
  },

  createInventoryItemFromTemplate(template, rarityOverride = null) {
    if (!template) {
      return null;
    }

    const rarity = rarityOverride || this.getTemplateRarity(template);
    const rarityNames = window.ItemDatabase?.RARITY_NAMES || this.RARITY_NAMES || {};
    const rarityInfo = rarityNames[rarity] || rarityNames.common || { star: 1, color: 0xc0c0c0 };

    return {
      ...template,
      rarity,
      starCount: rarityInfo.star || 1,
      color: this.getItemDisplayColor(template, rarity),
    };
  },

  getItemShopValue(item) {
    if (!item) {
      return 0;
    }

    const rarity = this.getTemplateRarity(item);
    const rarityFactor = {
      common: 1,
      uncommon: 1.45,
      rare: 2.1,
      epic: 3.4,
      legendary: 5.2,
    }[rarity] || 1;
    const slotFactor = {
      head: 1,
      body: 1.2,
      hands: 1,
      legs: 1,
      weapon: 1.45,
    }[item.slot] || 1;
    const statWeight = ["ap", "hp", "mp", "str", "dex", "hpBonus", "mpBonus"].reduce((total, key) => {
      return total + Math.abs(this.getItemStatValue(item, key));
    }, 0);

    return Math.max(10, Math.round((12 + statWeight * 3.4) * rarityFactor * slotFactor));
  },

  getItemBuyPrice(item) {
    return this.getItemShopValue(item);
  },

  getItemSellPrice(item) {
    return Math.max(4, Math.round(this.getItemShopValue(item) * 0.45));
  },

  sellInventoryItem(registry, index) {
    const items = [...this.getInventoryItems(registry)];
    const item = items[index];
    if (!item) {
      return { ok: false, reason: "no_item" };
    }

    const gold = this.getItemSellPrice(item);
    items[index] = null;
    registry.set("inventoryItems", items);
    registry.set("gold", (registry.get("gold") || 0) + gold);
    return { ok: true, item, gold, index };
  },

  getClassTrainingDef(className) {
    return this.CLASS_TRAINING_DEFS[className] || this.CLASS_TRAINING_DEFS[this.DEFAULT_CLASS];
  },

  getClassTrainingLevel(registry) {
    return registry.get("classTrainingLevel") || 0;
  },

  getClassTrainingCost(registry) {
    const level = this.getClassTrainingLevel(registry);
    return 45 + level * 25;
  },

  getSaveKeys() {
    return [
      "characterName",
      "playerClass",
      "playerLevel",
      "hpStat",
      "mpStat",
      "strStat",
      "dexStat",
      "statPoints",
      "gold",
      "dungeonCycles",
      "questState",
      "healthPotionCount",
      "mpPotionCount",
      "weaponUpgradePaperCount",
      "citySpendResult",
      "playerPowerTier",
      "repeatObjectiveState",
      "repeatObjectiveCompletions",
      "totalEnemyDefeats",
      "repeatObjectiveProgress",
      "maxHpBonus",
      "cycleObjectiveState",
      "cycleObjectiveProgress",
      "cycleObjectiveCompletions",
      "classTrainingLevel",
      "gameConfig",
      "selectedDungeonDifficulty",
      "inventoryItems",
      "hotbarSlots",
      ...this.EQUIP_SLOTS.map((slot) => `equipped_${slot}`),
    ];
  },

  cloneSaveValue(value) {
    if (value === undefined) {
      return undefined;
    }
    return value === null ? null : JSON.parse(JSON.stringify(value));
  },

  buildSaveSnapshot(registry) {
    const data = {};
    this.getSaveKeys().forEach((key) => {
      const value = registry.get(key);
      if (value !== undefined) {
        data[key] = this.cloneSaveValue(value);
      }
    });
    return {
      savedAt: Date.now(),
      data,
    };
  },

  saveProgress(registry) {
    try {
      const snapshot = this.buildSaveSnapshot(registry);
      window.localStorage?.setItem(this.SAVE_STORAGE_KEY, JSON.stringify(snapshot));
      return true;
    } catch (error) {
      console.warn("Save failed", error);
      return false;
    }
  },

  loadSavedProgress() {
    try {
      const raw = window.localStorage?.getItem(this.SAVE_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      return parsed?.data ? parsed : null;
    } catch (error) {
      console.warn("Load failed", error);
      return null;
    }
  },

  hasSavedProgress() {
    return !!this.loadSavedProgress();
  },

  applySavedProgress(registry) {
    const payload = this.loadSavedProgress();
    if (!payload?.data) {
      return false;
    }
    this.getSaveKeys().forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(payload.data, key)) {
        registry.set(key, this.cloneSaveValue(payload.data[key]));
      }
    });
    this.smoothTransitionToNewSystem(registry);
    this.ensureCoreStats(registry);
    this.initInventory(registry);
    this.initHotbarSlots?.(registry);
    return true;
  },

  clearSavedProgress() {
    try {
      window.localStorage?.removeItem(this.SAVE_STORAGE_KEY);
      return true;
    } catch (error) {
      console.warn("Clear save failed", error);
      return false;
    }
  },

  getSavedProgressSummary() {
    const payload = this.loadSavedProgress();
    if (!payload?.data) {
      return null;
    }
    const data = payload.data;
    return {
      savedAt: payload.savedAt || null,
      name: data.characterName || "Hero",
      playerClass: (data.playerClass || this.DEFAULT_CLASS).toUpperCase(),
      gold: data.gold || 0,
      cycles: data.dungeonCycles || 0,
      powerTier: data.playerPowerTier || 1,
      weaponName: data.equipped_weapon?.name || "No Weapon",
      weaponUpgradeLevel: data.equipped_weapon?.upgradeLevel || 0,
    };
  },

  attachAutoSave(scene, registry) {
    scene.__gameStateAutoSaveCleanup?.();

    let pendingEvent = null;
    const queueSave = () => {
      pendingEvent?.remove(false);
      pendingEvent = scene.time.delayedCall(160, () => {
        this.saveProgress(registry);
        pendingEvent = null;
      });
    };

    registry.events.on("changedata", queueSave);

    const cleanup = () => {
      pendingEvent?.remove(false);
      pendingEvent = null;
      registry.events.off("changedata", queueSave);
      scene.__gameStateAutoSaveCleanup = null;
    };

    scene.__gameStateAutoSaveCleanup = cleanup;
    scene.events.once("shutdown", cleanup);
    scene.events.once("destroy", cleanup);
    return cleanup;
  },

  getClassTrainingBonus(registry, bonusType = null) {
    const playerClass = registry.get("playerClass") || this.DEFAULT_CLASS;
    const def = this.getClassTrainingDef(playerClass);
    const level = this.getClassTrainingLevel(registry);
    const value = level * def.perLevel;

    if (!bonusType) {
      return value;
    }

    if (playerClass === "warrior" && bonusType === "hp") {
      return value;
    }
    if (playerClass === "mage" && bonusType === "mp") {
      return value;
    }
    if (playerClass === "rogue" && bonusType === "speed") {
      return value;
    }
    if (playerClass === "archer" && bonusType === "ap") {
      return value;
    }

    return 0;
  },

  getItemStatValue(item, statKey) {
    if (!item) {
      return 0;
    }

    return item.stats?.[statKey] ?? item[statKey] ?? 0;
  },

  getEquipmentComparison(registry, item) {
    if (!item?.slot) {
      return null;
    }

    const equippedItem = this.getEquippedItem(registry, item.slot);
    const compareTarget = equippedItem || null;
    const playerClass = registry.get("playerClass") || this.DEFAULT_CLASS;
    const statKeys = ["ap", "hp", "mp", "str", "dex", "hpBonus", "mpBonus"];

    const statDiffs = statKeys
      .map((key) => {
        const delta = this.getItemStatValue(item, key) - this.getItemStatValue(compareTarget, key);
        return {
          key,
          label: this.ITEM_STAT_LABELS[key] || key.toUpperCase(),
          delta,
        };
      })
      .filter((entry) => entry.delta !== 0);

    const apDelta = (this.getItemStatValue(item, "ap") - this.getItemStatValue(compareTarget, "ap"))
      + this.getAttackScalingDeltaForItems(item, compareTarget, playerClass);
    const hpDelta = (this.getItemStatValue(item, "hp") - this.getItemStatValue(compareTarget, "hp"))
      + (this.getItemStatValue(item, "hpBonus") - this.getItemStatValue(compareTarget, "hpBonus"));
    const mpDelta = (this.getItemStatValue(item, "mp") - this.getItemStatValue(compareTarget, "mp"))
      + (this.getItemStatValue(item, "mpBonus") - this.getItemStatValue(compareTarget, "mpBonus"));
    const speedDelta = (this.getItemStatValue(item, "dex") - this.getItemStatValue(compareTarget, "dex")) * 2;

    const derivedDiffs = [
      { key: "ap", label: "AP", delta: apDelta },
      { key: "hp", label: "HP", delta: hpDelta },
      { key: "mp", label: "MP", delta: mpDelta },
      { key: "speed", label: "SPD", delta: speedDelta },
    ].filter((entry) => entry.delta !== 0);

    const score = apDelta * 1.2 + hpDelta * 0.35 + mpDelta * 0.25 + speedDelta * 0.5;
    let verdict = "sidegrade";
    if (!equippedItem) {
      verdict = "empty";
    } else if (score > 1.5) {
      verdict = "upgrade";
    } else if (score < -1.5) {
      verdict = "downgrade";
    }

    return {
      equippedItem,
      statDiffs,
      derivedDiffs,
      verdict,
      requirement: this.getEquipRequirement(item, playerClass),
    };
  },

  getSetBonusesForEquipped(registry) {
    const equippedItems = [];
    this.EQUIP_SLOTS.forEach((slot) => {
      const item = this.getEquippedItem(registry, slot);
      if (item) equippedItems.push(item);
    });

    const setCounts = {};
    equippedItems.forEach((item) => {
      if (item.setId) {
        setCounts[item.setId] = (setCounts[item.setId] || 0) + 1;
      }
    });

    const activeBonuses = [];
    Object.entries(setCounts).forEach(([setId, count]) => {
      const setDef = (window.ItemDatabase?.SET_BONUSES || this.SET_BONUSES || {})[setId];
      if (!setDef) return;

      setDef.bonuses.forEach((bonus) => {
        if (count >= bonus.pieces) {
          activeBonuses.push({
            setId,
            name: setDef.name,
            pieces: count,
            requiredPieces: bonus.pieces,
            maxPieces: Object.keys(setDef.pieces).length,
            effect: bonus.effect,
          });
        }
      });
    });

    return activeBonuses;
  },

  RARITIES: {
    common: { name: "Common", color: 0xc0c0c0, fullColor: 0xcccccc },
    uncommon: { name: "Uncommon", color: 0x00ff00, fullColor: 0x33ff33 },
    rare: { name: "Rare", color: 0x0088ff, fullColor: 0x66aaff },
    epic: { name: "Epic", color: 0x9933ff, fullColor: 0xbb66ff },
    legendary: { name: "Legendary", color: 0xffaa00, fullColor: 0xffcc44 },
  },

  LOOT_TABLES: {
    kekon: {
      baseGold: [8, 15],
      baseExp: [12, 20],
      drops: [
        { id: "healthPotion", weight: 40, count: [1, 1] },
        { id: null, weight: 45 },
        { id: "war_head_01", weight: 5 },
        { id: "war_hands_01", weight: 5 },
        { id: "war_legs_01", weight: 5 },
      ],
    },
    kekon_warrior: {
      baseGold: [15, 28],
      baseExp: [25, 40],
      drops: [
        { id: "healthPotion", weight: 25, count: [1, 2] },
        { id: null, weight: 35 },
        { id: "war_body_01", weight: 10 },
        { id: "war_hands_02", weight: 10 },
        { id: "war_weapon_02", weight: 10 },
        { id: "arc_weapon_01", weight: 5 },
      ],
    },
    kekon_shaman: {
      baseGold: [16, 30],
      baseExp: [26, 42],
      drops: [
        { id: "mpPotion", weight: 26, count: [1, 2] },
        { id: null, weight: 30 },
        { id: "mge_head_02", weight: 9, rarity: "uncommon" },
        { id: "mge_weapon_02", weight: 8, rarity: "uncommon" },
        { id: "rog_weapon_02", weight: 6, rarity: "uncommon" },
      ],
    },
    kekon_brute: {
      baseGold: [26, 44],
      baseExp: [38, 58],
      drops: [
        { id: "healthPotion", weight: 30, count: [1, 2] },
        { id: null, weight: 18 },
        { id: "war_body_02", weight: 10, rarity: "uncommon" },
        { id: "war_weapon_03", weight: 10, rarity: "uncommon" },
        { id: "arc_weapon_03", weight: 6, rarity: "uncommon" },
      ],
    },
    kekon_boss: {
      baseGold: [50, 100],
      baseExp: [80, 120],
      guaranteed: [{ id: "dungeonKey", count: 1 }],
      drops: [
        { id: "healthPotion", weight: 10, count: [2, 3] },
        { id: null, weight: 10 },
        { id: "war_body_03", weight: 12, rarity: "rare" },
        { id: "war_weapon_03", weight: 12, rarity: "rare" },
        { id: "mge_weapon_03", weight: 12, rarity: "rare" },
        { id: "rog_weapon_03", weight: 12, rarity: "rare" },
        { id: "arc_weapon_03", weight: 12, rarity: "rare" },
        { id: "legendaryFragment", weight: 8, count: [1, 2] },
      ],
    },
  },

  getVariantLootOverrides(variantKey = "forgotten_halls") {
    const overrides = {
      ashen_barracks: {
        kekon: {
          baseGold: [10, 18],
          drops: [
            { id: "healthPotion", weight: 34, count: [1, 1] },
            { id: "war_hands_02", weight: 9 },
            { id: "rog_hands_02", weight: 7 },
          ],
        },
        kekon_warrior: {
          baseGold: [18, 32],
          drops: [
            { id: "war_body_02", weight: 9, rarity: "uncommon" },
            { id: "war_weapon_03", weight: 8, rarity: "uncommon" },
            { id: "arc_weapon_03", weight: 6, rarity: "uncommon" },
          ],
        },
        kekon_shaman: {
          baseGold: [20, 34],
          drops: [
            { id: "healthPotion", weight: 20, count: [1, 1] },
            { id: "war_weapon_03", weight: 7, rarity: "uncommon" },
            { id: "rog_hands_02", weight: 7, rarity: "uncommon" },
          ],
        },
        kekon_brute: {
          baseGold: [30, 50],
          drops: [
            { id: "war_body_03", weight: 10, rarity: "rare" },
            { id: "war_weapon_04", weight: 10, rarity: "rare" },
            { id: "legendaryFragment", weight: 6, count: [1, 1] },
          ],
        },
        kekon_boss: {
          baseGold: [70, 120],
          guaranteed: [{ id: "dungeonKey", count: [1, 1] }],
          drops: [
            { id: "war_body_03", weight: 16, rarity: "rare" },
            { id: "war_weapon_04", weight: 14, rarity: "rare" },
            { id: "rog_hands_03", weight: 12, rarity: "rare" },
            { id: "legendaryFragment", weight: 10, count: [1, 2] },
          ],
        },
      },
      sunken_sanctum: {
        kekon: {
          baseGold: [9, 16],
          drops: [
            { id: "mpPotion", weight: 28, count: [1, 1] },
            { id: "mge_legs_01", weight: 7 },
            { id: "arc_head_01", weight: 7 },
          ],
        },
        kekon_warrior: {
          baseGold: [18, 30],
          drops: [
            { id: "mge_weapon_02", weight: 8, rarity: "uncommon" },
            { id: "arc_weapon_02", weight: 8, rarity: "uncommon" },
            { id: "mge_body_02", weight: 8, rarity: "uncommon" },
          ],
        },
        kekon_shaman: {
          baseGold: [20, 34],
          drops: [
            { id: "mpPotion", weight: 32, count: [1, 2] },
            { id: "mge_body_02", weight: 8, rarity: "uncommon" },
            { id: "mge_weapon_02", weight: 8, rarity: "uncommon" },
          ],
        },
        kekon_brute: {
          baseGold: [28, 46],
          drops: [
            { id: "arc_weapon_02", weight: 9, rarity: "uncommon" },
            { id: "mge_body_03", weight: 7, rarity: "rare" },
            { id: "legendaryFragment", weight: 5, count: [1, 1] },
          ],
        },
        kekon_boss: {
          baseGold: [72, 124],
          guaranteed: [{ id: "dungeonKey", count: [1, 1] }],
          drops: [
            { id: "mge_weapon_03", weight: 15, rarity: "rare" },
            { id: "arc_weapon_03", weight: 15, rarity: "rare" },
            { id: "mge_body_03", weight: 13, rarity: "rare" },
            { id: "legendaryFragment", weight: 11, count: [1, 2] },
          ],
        },
      },
    };
    return overrides[variantKey] || {};
  },

  mergeLootTable(baseTable, overrideTable) {
    if (!overrideTable) {
      return baseTable;
    }
    return {
      ...baseTable,
      ...overrideTable,
      guaranteed: overrideTable.guaranteed || baseTable.guaranteed,
      drops: overrideTable.drops || baseTable.drops,
    };
  },

  getLootForEnemy(enemyType, playerLevel = 1, variantKey = "forgotten_halls") {
    const enemyKey = enemyType.toLowerCase().replace(" ", "_");
    const baseTable = this.LOOT_TABLES[enemyKey];
    const variantOverride = this.getVariantLootOverrides(variantKey)?.[enemyKey];
    const table = this.mergeLootTable(baseTable, variantOverride);
    if (!table) {
      return { gold: 0, exp: 0, items: [] };
    }

    const gold = Phaser.Math.Between(table.baseGold[0], table.baseGold[1]);
    const exp = Phaser.Math.Between(table.baseExp[0], table.baseExp[1]);
    const items = [];

    if (table.guaranteed) {
      table.guaranteed.forEach((g) => {
        const minCount = Array.isArray(g.count) ? g.count[0] : g.count;
        const maxCount = Array.isArray(g.count) ? g.count[1] : g.count;
        const count = Phaser.Math.Between(minCount, maxCount);
        for (let i = 0; i < count; i++) items.push({ id: g.id, rarity: "common" });
      });
    }

    table.drops.forEach((drop) => {
      const roll = Phaser.Math.Between(1, 100);
      if (roll <= drop.weight) {
        const minCount = drop.count ? drop.count[0] : 1;
        const maxCount = drop.count ? drop.count[1] : 1;
        const count = Phaser.Math.Between(minCount, maxCount);
        for (let i = 0; i < count; i++) {
          items.push({ id: drop.id, rarity: drop.rarity || "common" });
        }
      }
    });

    return { gold, exp, items };
  },

  initHotbarSlots(registry) {
    let slots = registry.get("hotbarSlots");
    if (slots === undefined) {
      slots = [null, null, null, null, null, null];
    } else {
      slots = [...slots];
    }

    const playerClass = registry.get("playerClass") || this.DEFAULT_CLASS;
    const currentSkill = this.getClassSkillForClass(playerClass);
    const classSkillIds = new Set(Object.values(window.SkillDatabase?.CLASS_SKILL_DEFS || this.CLASS_SKILL_DEFS || {}).map((skill) => skill.id));

    slots = slots.map((slotId) => (classSkillIds.has(slotId) && slotId !== currentSkill?.id ? null : slotId));

    if (currentSkill && !slots.includes(currentSkill.id)) {
      const preferredIndex = slots[0] === null ? 0 : slots.findIndex((slotId) => slotId === null);
      if (preferredIndex >= 0) {
        slots[preferredIndex] = currentSkill.id;
      } else {
        slots[0] = currentSkill.id;
      }
    }

    registry.set("hotbarSlots", slots);
  },

  getHotbarSlot(registry, index) {
    const slots = registry.get("hotbarSlots");
    if (!slots || index < 0 || index >= this.HOTBAR_SIZE) {
      return null;
    }
    return slots[index];
  },

  setHotbarSlot(registry, index, itemId) {
    const slots = registry.get("hotbarSlots");
    if (!slots || index < 0 || index >= this.HOTBAR_SIZE) {
      return;
    }
    slots[index] = itemId || null;
    registry.set("hotbarSlots", [...slots]);
  },

  clearHotbarSlot(registry, index) {
    this.setHotbarSlot(registry, index, null);
  },

  getConsumableDef(itemId) {
    return this.CONSUMABLE_DEFS[itemId] || null;
  },

  getClassSkillForClass(className) {
    return window.SkillDatabase?.getPrimarySkill?.(className || this.DEFAULT_CLASS) || this.CLASS_SKILL_DEFS[className] || this.CLASS_SKILL_DEFS[this.DEFAULT_CLASS] || null;
  },

  getClassSkillDef(itemId) {
    return window.SkillDatabase?.getSkillById?.(itemId) || Object.values(this.CLASS_SKILL_DEFS || {}).find((skill) => skill.id === itemId) || null;
  },

  isClassSkillItem(itemId) {
    return !!this.getClassSkillDef(itemId);
  },

  getAvailableConsumables(registry) {
    const result = [];
    const defs = this.CONSUMABLE_DEFS;
    Object.keys(defs).forEach((key) => {
      const count = registry.get(defs[key].countKey) || 0;
      if (count > 0) {
        result.push({ ...defs[key], count });
      }
    });
    return result;
  },

  getEquipmentTemplateById(itemId) {
    return window.ItemDatabase?.getEquipmentTemplateById?.(itemId) || null;
  },

  pickRandomEquipment(className, slot) {
    const tier = window.Phaser?.Math?.Between ? window.Phaser.Math.Between(1, 2) : 1;
    const baseItem = window.ItemDatabase?.pickClassEquipmentByTier?.(className, slot, tier);
    if (!baseItem) return null;
    return this.createInventoryItemFromTemplate(baseItem, baseItem.rarity || this.generateItemRarity());
  },

  blendRarityColor(baseColor, rarityColor, factor) {
    const baseR = (baseColor >> 16) & 0xff;
    const baseG = (baseColor >> 8) & 0xff;
    const baseB = baseColor & 0xff;
    const rareR = (rarityColor >> 16) & 0xff;
    const rareG = (rarityColor >> 8) & 0xff;
    const rareB = rarityColor & 0xff;

    const r = Math.round(baseR * (1 - factor) + rareR * factor);
    const g = Math.round(baseG * (1 - factor) + rareG * factor);
    const b = Math.round(baseB * (1 - factor) + rareB * factor);

    return (r << 16) | (g << 8) | b;
  },

  generateRandomClass() {
    const classes = ["warrior", "mage", "rogue", "archer"];
    return classes[Phaser.Math.Between(0, classes.length - 1)];
  },

  generateRandomName() {
    const names = this.RANDOM_NAMES;
    return names[Phaser.Math.Between(0, names.length - 1)];
  },

  generateRandomStats() {
    const randomStat = () => Phaser.Math.Between(3, 6);
    return {
      hpStat: randomStat(),
      mpStat: randomStat(),
      strStat: randomStat(),
      dexStat: randomStat(),
      statPoints: 5,
    };
  },

  createCharacter(registry, name, playerClass, stats, equipment) {
    registry.set("characterName", name);
    registry.set("playerClass", playerClass);
    registry.set("hpStat", stats.hpStat);
    registry.set("mpStat", stats.mpStat);
    registry.set("strStat", stats.strStat);
    registry.set("dexStat", stats.dexStat);
    registry.set("statPoints", stats.statPoints);
    registry.set("weaponUpgradePaperCount", 0);
    registry.set("gold", 25);
    registry.set("dungeonCycles", 0);
    registry.set("questState", "not_accepted");
    registry.set("questStates", {});
    registry.set("repeatObjectiveState", "inactive");
    registry.set("repeatObjectiveCompletions", 0);
    registry.set("repeatObjectiveProgress", 0);
    registry.set("cycleObjectiveState", "inactive");
    registry.set("cycleObjectiveProgress", 0);
    registry.set("cycleObjectiveCompletions", 0);
    registry.set("playerPowerTier", 1);
    registry.set("maxHpBonus", 0);
    registry.set("healthPotionCount", 0);
    registry.set("mpPotionCount", 0);
    registry.set("citySpendResult", "Fresh hero journey started.");
    registry.set("totalEnemyDefeats", 0);
    registry.set("classTrainingLevel", 0);
    registry.set("inventoryItems", new Array(this.INVENTORY_SIZE).fill(null));
    registry.set("hotbarSlots", new Array(this.HOTBAR_SIZE).fill(null));

    this.EQUIP_SLOTS.forEach((slot) => {
      const item = equipment[slot];
      if (item) {
        registry.set(`equipped_${slot}`, { ...item, upgradeLevel: 0, slot });
      } else {
        registry.set(`equipped_${slot}`, null);
      }
    });
  },

  getEquippedItem(registry, slot) {
    return registry.get(`equipped_${slot}`);
  },

  getItemStatBonus(registry, statKey) {
    let bonus = 0;
    this.EQUIP_SLOTS.forEach((slot) => {
      const item = this.getEquippedItem(registry, slot);
      if (item && item.stats && item.stats[statKey] !== undefined) {
        bonus += item.stats[statKey];
      }
    });
    return bonus;
  },

  getItemStatBonusExceptSlot(registry, statKey, excludedSlot = null) {
    let bonus = 0;
    this.EQUIP_SLOTS.forEach((slot) => {
      if (slot === excludedSlot) {
        return;
      }
      const item = this.getEquippedItem(registry, slot);
      if (item && item.stats && item.stats[statKey] !== undefined) {
        bonus += item.stats[statKey];
      }
    });
    return bonus;
  },

  getAttackScalingBonus(registry, playerClass = null) {
    const resolvedClass = playerClass || registry.get("playerClass") || this.DEFAULT_CLASS;
    const totalStr = this.getStat(registry, "strStat") + this.getItemStatBonus(registry, "str");
    const totalDex = this.getStat(registry, "dexStat") + this.getItemStatBonus(registry, "dex");
    const mpStat = this.getStat(registry, "mpStat");
    const mpFromGear = this.getItemStatBonus(registry, "mp");
    const mpBonusFromGear = this.getItemStatBonus(registry, "mpBonus");

    if (resolvedClass === "mage") {
      return mpStat * 2 + Math.round(mpFromGear * 0.35) + Math.round(mpBonusFromGear * 0.75);
    }
    if (resolvedClass === "rogue") {
      return totalDex * 2 + Math.round(totalStr * 0.5);
    }
    if (resolvedClass === "archer") {
      return totalDex * 2 + Math.round(totalStr * 0.35);
    }
    return totalStr * 2;
  },

  getAttackScalingDeltaForItems(item, compareTarget, playerClass = null) {
    const resolvedClass = playerClass || this.DEFAULT_CLASS;
    const strDelta = this.getItemStatValue(item, "str") - this.getItemStatValue(compareTarget, "str");
    const dexDelta = this.getItemStatValue(item, "dex") - this.getItemStatValue(compareTarget, "dex");
    const mpDelta = this.getItemStatValue(item, "mp") - this.getItemStatValue(compareTarget, "mp");
    const mpBonusDelta = this.getItemStatValue(item, "mpBonus") - this.getItemStatValue(compareTarget, "mpBonus");

    if (resolvedClass === "mage") {
      return Math.round(mpDelta * 0.35) + Math.round(mpBonusDelta * 0.75);
    }
    if (resolvedClass === "rogue") {
      return dexDelta * 2 + Math.round(strDelta * 0.5);
    }
    if (resolvedClass === "archer") {
      return dexDelta * 2 + Math.round(strDelta * 0.35);
    }
    return strDelta * 2;
  },

  getEquipRequirement(item, className = null) {
    if (!item?.slot) {
      return null;
    }

    const itemClass = this.getItemFamilyClass(item, className || this.DEFAULT_CLASS);
    const statKey = this.getPrimaryStatKeyForClass(itemClass);
    const rarity = this.getTemplateRarity(item);
    const baseRequirement = {
      common: 0,
      uncommon: 6,
      rare: 10,
      epic: 13,
      legendary: 16,
    }[rarity] || 0;
    const weaponBonus = item.slot === "weapon" && baseRequirement > 0 ? 1 : 0;
    const upgradeBonus = Math.max(0, (item.upgradeLevel || 0) - 3);
    const requiredValue = baseRequirement + weaponBonus + upgradeBonus;

    if (requiredValue <= 0) {
      return null;
    }

    return {
      className: itemClass,
      statKey,
      label: this.getStatLabel(statKey),
      value: requiredValue,
    };
  },

  canEquipItem(registry, item, className = null) {
    const requirement = this.getEquipRequirement(item, className || registry.get("playerClass") || this.DEFAULT_CLASS);
    if (!requirement) {
      return { ok: true, requirement: null };
    }

    const currentValue = this.getStat(registry, requirement.statKey);
    if (currentValue < requirement.value) {
      return {
        ok: false,
        reason: "requirement",
        requirement,
        currentValue,
      };
    }

    return {
      ok: true,
      requirement,
      currentValue,
    };
  },

  getWeaponAp(registry) {
    const weapon = this.getEquippedItem(registry, "weapon");
    const baseAp = weapon ? weapon.stats?.ap ?? weapon.ap ?? 10 : 10;
    const offWeaponApBonus = this.getItemStatBonusExceptSlot(registry, "ap", "weapon");
    const playerClass = registry.get("playerClass") || this.DEFAULT_CLASS;
    const scalingBonus = this.getAttackScalingBonus(registry, playerClass);
    return baseAp + offWeaponApBonus + scalingBonus + this.getClassTrainingBonus(registry, "ap");
  },

  getMaxHp(registry) {
    const baseHp = this.BASE_HP + this.getStat(registry, "hpStat") * 12;
    const bonusFromItems = this.getItemStatBonus(registry, "hp");
    const bonusFromWeapon = this.getEquippedItem(registry, "weapon")?.hpBonus || 0;
    const globalBonus = registry.get("maxHpBonus") || 0;
    return baseHp + bonusFromItems + bonusFromWeapon + globalBonus + this.getClassTrainingBonus(registry, "hp");
  },

  getMaxMp(registry) {
    const baseMp = this.BASE_MP + this.getStat(registry, "mpStat") * 8;
    const bonusFromItems = this.getItemStatBonus(registry, "mp");
    const bonusFromWeapon = this.getEquippedItem(registry, "weapon")?.mpBonus || 0;
    return baseMp + bonusFromItems + bonusFromWeapon + this.getClassTrainingBonus(registry, "mp");
  },

  INVENTORY_SIZE: 20,

  initInventory(registry) {
    if (registry.get("inventoryItems") === undefined) {
      // Create initial inventory with some test items (Knight Online style)
      const items = new Array(20).fill(null);
      
      items[0] = { id: "hpPotion", name: "Health Potion", type: "potion", count: 3, icon: "icon_08", baseIcon: "icon_08", color: 0xd67272, rarity: "common" };
      items[1] = { id: "mpPotion", name: "Mana Potion", type: "potion", count: 2, icon: "icon_10", baseIcon: "icon_10", color: 0x5588ff, rarity: "common" };
      items[2] = this.createInventoryItemFromTemplate(window.ItemDatabase?.getEquipmentTemplateById?.("war_head_01"), "common");
      items[3] = this.createInventoryItemFromTemplate(window.ItemDatabase?.getEquipmentTemplateById?.("war_weapon_01"), "common");
      
      registry.set("inventoryItems", items);
    }
  },

  getInventoryItems(registry) {
    return registry.get("inventoryItems") || new Array(20).fill(null);
  },

  addToInventory(registry, item) {
    const items = [...this.getInventoryItems(registry)];
    const firstEmpty = items.findIndex((slot) => slot === null);
    if (firstEmpty === -1) return -1;
    items[firstEmpty] = { ...item };
    registry.set("inventoryItems", items);
    return firstEmpty;
  },

  removeFromInventory(registry, index) {
    const items = [...this.getInventoryItems(registry)];
    if (index < 0 || index >= items.length) return null;
    const removed = items[index];
    items[index] = null;
    registry.set("inventoryItems", items);
    return removed;
  },

  equipFromInventory(registry, index) {
    const items = [...this.getInventoryItems(registry)];
    const item = items[index];
    if (!item || !item.slot) return { ok: false, reason: "no_item" };
    const canEquip = this.canEquipItem(registry, item);
    if (!canEquip.ok) {
      return canEquip;
    }
    const currentEquipped = this.getEquippedItem(registry, item.slot);
    items[index] = currentEquipped;
    registry.set(`equipped_${item.slot}`, { ...item });
    registry.set("inventoryItems", items);
    return { ok: true, item, previousItem: currentEquipped || null };
  },

  unequipToInventory(registry, slot) {
    const item = this.getEquippedItem(registry, slot);
    if (!item) return false;
    const items = [...this.getInventoryItems(registry)];
    const firstEmpty = items.findIndex((s) => s === null);
    if (firstEmpty === -1) return false;
    items[firstEmpty] = { ...item };
    registry.set(`equipped_${slot}`, null);
    registry.set("inventoryItems", items);
    return true;
  },

  getTotalDefense(registry) {
    let def = 0;
    ["head", "body", "hands", "legs"].forEach((slot) => {
      const item = this.getEquippedItem(registry, slot);
      if (item) def += Math.floor((item.stats?.hp || 0) * 0.3);
    });
    def += Math.floor(this.getStat(registry, "dexStat") * 0.5);
    return def;
  },

  getTotalAttack(registry) {
    return this.getWeaponAp(registry);
  },

  getStatLabel(key) {
    const labels = { hpStat: "HP", mpStat: "MP", strStat: "STR", dexStat: "DEX" };
    return labels[key] || key;
  },

  smoothTransitionToNewSystem(registry) {
    if (registry.get("equippedWeapon") !== undefined) {
      const oldWeapon = registry.get("equippedWeapon");
      if (oldWeapon && !registry.get("equipped_weapon")) {
        registry.set("equipped_weapon", { ...oldWeapon, slot: "weapon" });
      }
      registry.remove("equippedWeapon");
    }
    if (registry.get("weaponUpgradePaperCount") === undefined) {
      registry.set("weaponUpgradePaperCount", 0);
    }
  },
};
