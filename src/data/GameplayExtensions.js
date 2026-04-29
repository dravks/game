(function () {
  const GS = window.GameState;
  if (!GS) return;

  GS.UPGRADE_SUCCESS_BY_LEVEL = { 1: 100, 2: 100, 3: 100, 4: 75, 5: 50, 6: 30, 7: 25, 8: 10, 9: 5, 10: 1 };
  if (GS.DEFAULT_GAME_CONFIG?.difficulty?.very_hard) {
    Object.assign(GS.DEFAULT_GAME_CONFIG.difficulty.very_hard, { label: "Very Hard", hpMultiplier: 1.75, damageMultiplier: 1.45, goldMultiplier: 1.75, expMultiplier: 1.7, dropMultiplier: 1.6, bossHpMultiplier: 2.25, spawnBonus: 3, chestQualityBonus: 0.24 });
  }
  if (GS.DEFAULT_GAME_CONFIG?.difficulty?.nightmare) GS.DEFAULT_GAME_CONFIG.difficulty.nightmare.label = "Very Hard";

  GS.SHOP_ITEMS = {
    hpPotion: { id: "hpPotion", name: "HP Potion", price: 20, type: "potion", countKey: "healthPotionCount", icon: "icon_08", baseIcon: "icon_08", color: 0xd67272, rarity: "common", count: 1 },
    mpPotion: { id: "mpPotion", name: "MP Potion", price: 30, type: "potion", countKey: "mpPotionCount", icon: "icon_10", baseIcon: "icon_10", color: 0x5588ff, rarity: "common", count: 1 },
    upgradePaper: { id: "upgradePaper", name: "Upgrade Paper", price: 25, type: "upgradePaper", countKey: "weaponUpgradePaperCount", icon: "icon_11", baseIcon: "icon_11", color: 0xf4df9c, rarity: "common", count: 1 },
  };

  GS.CLASS_LEVEL_SKILLS = {
    warrior: [
      { id: "skill_power_strike", name: "Power Strike", unlockLevel: 1, icon: "icon_05", tint: 0xd98852, mpCost: 10, cooldownMs: 3500, damageScale: 1.7, damageType: "physical", range: 145, description: "Heavy melee blow that crushes nearby enemies." },
      { id: "skill_shield_bash", name: "Shield Bash", unlockLevel: 3, icon: "icon_03", tint: 0xb0c4de, mpCost: 12, cooldownMs: 5200, damageScale: 1.2, damageType: "physical", range: 130, description: "Short defensive stun-style hit." },
      { id: "skill_cleave", name: "Cleave", unlockLevel: 5, icon: "icon_06", tint: 0xd98852, mpCost: 16, cooldownMs: 6000, damageScale: 1.35, damageType: "physical", range: 160, description: "Wide weapon swing for grouped enemies." },
      { id: "skill_battle_cry", name: "Battle Cry", unlockLevel: 8, icon: "icon_12", tint: 0xffc857, mpCost: 20, cooldownMs: 10000, damageScale: 1.0, damageType: "physical", range: 145, description: "Temporary battle focus." },
    ],
    mage: [
      { id: "skill_arcane_bolt", name: "Arcane Bolt", unlockLevel: 1, icon: "icon_06", tint: 0x77a9ff, mpCost: 14, cooldownMs: 3200, damageScale: 1.4, damageType: "magic", range: 330, description: "Focused ranged spell." },
      { id: "skill_fireball", name: "Fireball", unlockLevel: 3, icon: "icon_08", tint: 0xff7a45, mpCost: 18, cooldownMs: 5600, damageScale: 1.55, damageType: "magic", range: 310, description: "Explosive fire spell." },
      { id: "skill_frost_nova", name: "Frost Nova", unlockLevel: 5, icon: "icon_10", tint: 0x8fd3ff, mpCost: 22, cooldownMs: 8000, damageScale: 1.1, damageType: "magic", range: 180, description: "Cold burst around the caster." },
      { id: "skill_meteor_spark", name: "Meteor Spark", unlockLevel: 8, icon: "icon_12", tint: 0xffc857, mpCost: 30, cooldownMs: 12000, damageScale: 2.1, damageType: "magic", range: 340, description: "High-cost burst spell." },
    ],
    rogue: [
      { id: "skill_shadow_step", name: "Shadow Step", unlockLevel: 1, icon: "icon_08", tint: 0xae7cff, mpCost: 12, cooldownMs: 4200, damageScale: 1.5, damageType: "physical", range: 165, description: "Blink forward and cut enemies." },
      { id: "skill_backstab", name: "Backstab", unlockLevel: 3, icon: "icon_07", tint: 0xd68cff, mpCost: 14, cooldownMs: 5200, damageScale: 1.85, damageType: "physical", range: 120, description: "High burst strike." },
      { id: "skill_poison_blade", name: "Poison Blade", unlockLevel: 5, icon: "icon_10", tint: 0x70d66f, mpCost: 18, cooldownMs: 7000, damageScale: 1.25, damageType: "physical", range: 140, description: "Poison-flavored extra damage." },
      { id: "skill_evasion", name: "Evasion", unlockLevel: 8, icon: "icon_12", tint: 0x9bd3ff, mpCost: 22, cooldownMs: 10000, damageScale: 1.0, damageType: "physical", range: 120, description: "Defensive agility burst." },
    ],
    archer: [
      { id: "skill_power_shot", name: "Power Shot", unlockLevel: 1, icon: "icon_12", tint: 0xd8b15c, mpCost: 11, cooldownMs: 3000, damageScale: 1.35, damageType: "ranged", range: 360, description: "Long-range empowered arrow." },
      { id: "skill_multi_shot", name: "Multi Shot", unlockLevel: 3, icon: "icon_06", tint: 0x9fd66f, mpCost: 16, cooldownMs: 6000, damageScale: 1.2, damageType: "ranged", range: 310, description: "Several arrows in a cone." },
      { id: "skill_piercing_arrow", name: "Piercing Arrow", unlockLevel: 5, icon: "icon_05", tint: 0xf4df9c, mpCost: 18, cooldownMs: 7500, damageScale: 1.6, damageType: "ranged", range: 380, description: "Piercing line shot." },
      { id: "skill_eagle_eye", name: "Eagle Eye", unlockLevel: 8, icon: "icon_01", tint: 0xffc857, mpCost: 20, cooldownMs: 10000, damageScale: 1.0, damageType: "ranged", range: 340, description: "Ranged focus buff." },
    ],
  };

  GS.CLASS_COMBAT_BALANCE = {
    warrior: { hpMultiplier: 1.16, mpMultiplier: 0.92, defenseMultiplier: 1.18, speedBonus: -6, apMultiplier: 1.08, role: "Melee Tank" },
    rogue: { hpMultiplier: 0.96, mpMultiplier: 1.0, defenseMultiplier: 0.92, speedBonus: 18, apMultiplier: 1.03, role: "Melee Crit" },
    mage: { hpMultiplier: 0.86, mpMultiplier: 1.28, defenseMultiplier: 0.78, speedBonus: -2, apMultiplier: 0.94, role: "Ranged Magic" },
    archer: { hpMultiplier: 1.0, mpMultiplier: 1.04, defenseMultiplier: 0.94, speedBonus: 8, apMultiplier: 1.0, role: "Ranged Physical" },
  };

  GS.getClassCombatBalance = function (registryOrClass = null) {
    const className = typeof registryOrClass === "string"
      ? registryOrClass
      : registryOrClass?.get?.("playerClass") || this.DEFAULT_CLASS || "warrior";
    return this.CLASS_COMBAT_BALANCE[String(className).toLowerCase()] || this.CLASS_COMBAT_BALANCE.warrior;
  };

  const previousGetMaxHp = GS.getMaxHp;
  GS.getMaxHp = function (registry) {
    const balance = this.getClassCombatBalance(registry);
    return Math.max(1, Math.floor(previousGetMaxHp.call(this, registry) * (balance.hpMultiplier || 1)));
  };

  const previousGetMaxMp = GS.getMaxMp;
  GS.getMaxMp = function (registry) {
    const balance = this.getClassCombatBalance(registry);
    return Math.max(1, Math.floor(previousGetMaxMp.call(this, registry) * (balance.mpMultiplier || 1)));
  };

  const previousGetPlayerSpeed = GS.getPlayerSpeed;
  GS.getPlayerSpeed = function (registry) {
    const balance = this.getClassCombatBalance(registry);
    return Math.max(95, Math.floor(previousGetPlayerSpeed.call(this, registry) + (balance.speedBonus || 0)));
  };

  const previousGetWeaponAp = GS.getWeaponAp;
  GS.getWeaponAp = function (registry) {
    const balance = this.getClassCombatBalance(registry);
    return Math.max(1, Math.floor(previousGetWeaponAp.call(this, registry) * (balance.apMultiplier || 1)));
  };

  const previousGetTotalDefense = GS.getTotalDefense;
  GS.getTotalDefense = function (registry) {
    const balance = this.getClassCombatBalance(registry);
    return Math.max(0, Math.floor(previousGetTotalDefense.call(this, registry) * (balance.defenseMultiplier || 1)));
  };

  GS.QUEST_DEFS = {
    forgotten_kekon: { id: "forgotten_kekon", title: "Forgotten Halls Hunt", dungeonId: "forgotten_halls", objectiveType: "kill", target: "kekon", required: 10, rewardGold: 40, rewardPaper: 1, description: "Kill 10 Kekon inside Forgotten Halls." },
    forgotten_boss: { id: "forgotten_boss", title: "Kekon Chief", dungeonId: "forgotten_halls", objectiveType: "boss", target: "Kekon Chief", required: 1, rewardGold: 65, rewardPaper: 1, description: "Defeat the Kekon Chief." },
    ashen_boss: { id: "ashen_boss", title: "Burned Captain", dungeonId: "ashen_barracks", objectiveType: "boss", target: "Burned Captain", required: 1, rewardGold: 90, rewardPaper: 2, description: "Defeat the Burned Captain." },
    sunken_boss: { id: "sunken_boss", title: "Sunken Priest", dungeonId: "sunken_sanctum", objectiveType: "boss", target: "Sunken Priest", required: 1, rewardGold: 105, rewardPaper: 2, description: "Defeat the Sunken Priest." },
    shadow_boss: { id: "shadow_boss", title: "Brood Mother", dungeonId: "shadow_silk_cave", objectiveType: "boss", target: "Brood Mother", required: 1, rewardGold: 120, rewardPaper: 2, description: "Defeat the Brood Mother." },
    frost_boss: { id: "frost_boss", title: "Frost Lich", dungeonId: "frostbite_crypt", objectiveType: "boss", target: "Frost Lich", required: 1, rewardGold: 140, rewardPaper: 3, description: "Defeat the Frost Lich." },
    ember_boss: { id: "ember_boss", title: "Ember Golem", dungeonId: "emberforge_depths", objectiveType: "boss", target: "Ember Golem", required: 1, rewardGold: 160, rewardPaper: 3, description: "Defeat the Ember Golem." },
    bandit_boss: { id: "bandit_boss", title: "Bandit Warlord", dungeonId: "bandit_quarry", objectiveType: "boss", target: "Bandit Warlord", required: 1, rewardGold: 180, rewardPaper: 3, description: "Defeat the Bandit Warlord." },
    necrotic_boss: { id: "necrotic_boss", title: "Graveborn King", dungeonId: "necrotic_catacombs", objectiveType: "boss", target: "Graveborn King", required: 1, rewardGold: 210, rewardPaper: 4, description: "Defeat the Graveborn King." },
    crystal_boss: { id: "crystal_boss", title: "Crystal Guardian", dungeonId: "crystal_hollow", objectiveType: "boss", target: "Crystal Guardian", required: 1, rewardGold: 240, rewardPaper: 4, description: "Defeat the Crystal Guardian." },
    abyss_clear: { id: "abyss_clear", title: "Abyss Gate: Very Hard", dungeonId: "abyss_gate", objectiveType: "clear", difficulty: "very_hard", required: 1, rewardGold: 400, rewardPaper: 5, rewardStatPoints: 1, description: "Clear Abyss Gate on Very Hard." },
  };

  GS.getShopItem = (itemId) => GS.SHOP_ITEMS[itemId] || null;
  GS.addStackableToInventory = function (registry, item, quantity = 1) {
    const items = [...this.getInventoryItems(registry)];
    const stackIndex = items.findIndex((slot) => slot && slot.id === item.id && (slot.type === item.type || item.type === "potion" || item.type === "upgradePaper"));
    if (stackIndex >= 0) { items[stackIndex] = { ...items[stackIndex], count: (items[stackIndex].count || 1) + quantity }; registry.set("inventoryItems", items); return stackIndex; }
    const firstEmpty = items.findIndex((slot) => slot === null); if (firstEmpty < 0) return -1;
    items[firstEmpty] = { ...item, count: quantity }; registry.set("inventoryItems", items); return firstEmpty;
  };
  GS.buyShopItem = function (registry, itemId, quantity = 1) {
    const def = this.getShopItem(itemId); if (!def) return { ok: false, reason: "missing_item" };
    const cost = (def.price || 0) * quantity; const gold = registry.get("gold") || 0; if (gold < cost) return { ok: false, reason: "gold", cost, gold };
    if (def.type === "potion" || def.type === "upgradePaper") {
      const inventoryIndex = this.addStackableToInventory(registry, def, quantity);
      if (inventoryIndex < 0 && def.type !== "upgradePaper") return { ok: false, reason: "bag_full" };
    }
    registry.set("gold", gold - cost); if (def.countKey) registry.set(def.countKey, (registry.get(def.countKey) || 0) + quantity);
    return { ok: true, item: def, quantity, cost };
  };
  GS.sellInventoryItem = function (registry, index) {
    const items = [...this.getInventoryItems(registry)]; const item = items[index]; if (!item) return { ok: false, reason: "no_item" };
    const value = item.type === "potion" ? 5 : item.type === "upgradePaper" ? 12 : ({ common: 8, uncommon: 16, rare: 32, epic: 60, legendary: 100 }[item.rarity || "common"] || 8) + (item.upgradeLevel || 0) * 8;
    if ((item.count || 1) > 1 && (item.type === "potion" || item.type === "upgradePaper")) items[index] = { ...item, count: item.count - 1 }; else items[index] = null;
    registry.set("inventoryItems", items); registry.set("gold", (registry.get("gold") || 0) + value); return { ok: true, value, item };
  };
  GS.assignConsumableToHotbar = function (registry, itemId, preferredIndex = null) {
    const def = this.getConsumableDef(itemId); if (!def) return { ok: false, reason: "not_consumable" };
    let slots = [...(registry.get("hotbarSlots") || new Array(this.HOTBAR_SIZE).fill(null))]; let index = preferredIndex;
    if (index === null || index === undefined || index < 0 || index >= this.HOTBAR_SIZE) { index = slots.findIndex((slot) => slot === itemId || slot === null); if (index < 0) index = 0; }
    slots[index] = itemId; registry.set("hotbarSlots", slots); return { ok: true, index, itemId };
  };
  GS.decrementInventoryStack = function (registry, itemId, amount = 1) { const items = [...this.getInventoryItems(registry)]; const index = items.findIndex((slot) => slot?.id === itemId); if (index >= 0) { const count = (items[index].count || 1) - amount; items[index] = count > 0 ? { ...items[index], count } : null; registry.set("inventoryItems", items); } };
  GS.useConsumable = function (registry, itemId, scene = null) { const def = this.getConsumableDef(itemId); if (!def) return false; const count = registry.get(def.countKey) || 0; if (count <= 0) return false; registry.set(def.countKey, count - 1); this.decrementInventoryStack(registry, itemId, 1); if (def.type === "healHp" && scene?.currentHp !== undefined) scene.currentHp = Math.min((scene.currentHp || 0) + (def.healAmount || this.HP_POTION_HEAL), this.getMaxHp(registry)); if (def.type === "restoreMp" && scene?.currentMp !== undefined) scene.currentMp = Math.min((scene.currentMp || 0) + (def.restoreAmount || this.MP_POTION_RESTORE), this.getMaxMp(registry)); return true; };
  GS.getUnlockedClassSkills = function (registry, className = null) { const c = (className || registry.get("playerClass") || this.DEFAULT_CLASS).toLowerCase(); const level = registry.get("playerLevel") || 1; return (this.CLASS_LEVEL_SKILLS[c] || this.CLASS_LEVEL_SKILLS[this.DEFAULT_CLASS] || []).map((skill) => ({ ...skill, unlocked: level >= skill.unlockLevel })); };
  GS.getClassSkillForClass = function (className) { const c = (className || this.DEFAULT_CLASS).toLowerCase(); return (this.CLASS_LEVEL_SKILLS[c] || [])[0] || this.CLASS_SKILL_DEFS[c] || this.CLASS_SKILL_DEFS[this.DEFAULT_CLASS]; };

  GS.getQuestDefinitionsList = function () { return Object.values(this.QUEST_DEFS || {}); };
  GS.getQuestStates = function (registry) { const states = registry.get("questStates"); return states && typeof states === "object" ? { ...states } : {}; };
  GS.acceptQuest = function (registry, questId) { const def = this.QUEST_DEFS?.[questId]; if (!def) return { ok: false, reason: "missing" }; const states = this.getQuestStates(registry); if (["active", "ready_to_turn_in", "completed"].includes(states[questId]?.state)) return { ok: false, reason: "already" }; states[questId] = { state: "active", progress: 0 }; registry.set("questStates", states); return { ok: true, quest: def }; };
  GS.getActiveQuests = function (registry) { const states = this.getQuestStates(registry); return Object.entries(states).map(([id, data]) => { const def = this.QUEST_DEFS?.[id]; if (!def || !["active", "ready_to_turn_in"].includes(data.state)) return null; const required = def.required || 1; return { ...def, state: data.state, progress: data.progress || 0, objectiveText: `${data.progress || 0}/${required} - ${def.description || def.title}` }; }).filter(Boolean); };
  GS.getAvailableQuests = function (registry) { const states = this.getQuestStates(registry); return this.getQuestDefinitionsList().filter((q) => !states[q.id] || states[q.id].state === "not_accepted"); };
  GS.updateQuestProgress = function (registry, event = {}) { const states = this.getQuestStates(registry); let changed = false; Object.entries(states).forEach(([id, data]) => { if (data.state !== "active") return; const def = this.QUEST_DEFS?.[id]; if (!def) return; if (def.dungeonId && event.dungeonId && def.dungeonId !== event.dungeonId) return; if (def.difficulty && event.difficulty && def.difficulty !== event.difficulty) return; const targetMatch = !def.target || !event.target || String(event.target).toLowerCase().includes(String(def.target).toLowerCase()) || String(def.target).toLowerCase().includes(String(event.target).toLowerCase()); if (def.objectiveType !== event.type || !targetMatch) return; const next = Math.min((data.progress || 0) + (event.amount || 1), def.required || 1); states[id] = { ...data, progress: next, state: next >= (def.required || 1) ? "ready_to_turn_in" : "active" }; changed = true; }); if (changed) registry.set("questStates", states); return changed; };
  GS.turnInQuest = function (registry, questId) { const states = this.getQuestStates(registry); const data = states[questId]; const def = this.QUEST_DEFS?.[questId]; if (!def || data?.state !== "ready_to_turn_in") return { ok: false, reason: "not_ready" }; states[questId] = { ...data, state: "completed" }; registry.set("questStates", states); registry.set("gold", (registry.get("gold") || 0) + (def.rewardGold || 0)); if (def.rewardPaper) registry.set("weaponUpgradePaperCount", (registry.get("weaponUpgradePaperCount") || 0) + def.rewardPaper); if (def.rewardStatPoints) registry.set("statPoints", (registry.get("statPoints") || 0) + def.rewardStatPoints); registry.set("playerLevel", Math.max(registry.get("playerLevel") || 1, Math.min(10, 1 + Object.values(states).filter((q) => q.state === "completed").length))); return { ok: true, quest: def }; };
  GS.upgradeItemAtSource = function (registry, source) { const current = this.getItemFromSource(registry, source); if (!current?.slot) return { ok: false, reason: "not_equipment" }; const level = current.upgradeLevel || 0; const targetLevel = level + 1; if (targetLevel > 10) return { ok: false, reason: "max_level" }; const paper = registry.get("weaponUpgradePaperCount") || 0; if (paper <= 0) return { ok: false, reason: "no_paper" }; const cost = 20 + targetLevel * 10; const gold = registry.get("gold") || 0; if (gold < cost) return { ok: false, reason: "gold", cost }; registry.set("gold", gold - cost); registry.set("weaponUpgradePaperCount", paper - 1); const successRate = this.getUpgradeSuccessRate(targetLevel); const roll = Phaser?.Math?.Between ? Phaser.Math.Between(1, 100) : Math.ceil(Math.random() * 100); if (roll > successRate) return { ok: true, success: false, item: current, targetLevel, successRate, roll, cost }; const delta = this.getUpgradePreviewDelta(current); const upgraded = this.applyUpgradeDeltaToItem(current, delta); upgraded.upgradeLevel = targetLevel; upgraded.name = (current.name || "Item").replace(/ \+\d+$/, ""); this.setItemAtSource(registry, source, upgraded); return { ok: true, success: true, item: upgraded, targetLevel, successRate, roll, cost, statDelta: delta }; };

  GS.extendClassEquipmentProgression = function () {
    const rarityByTier = ["common", "common", "uncommon", "uncommon", "rare", "rare", "epic", "epic", "legendary", "legendary"];
    const iconBySlot = { head: "icon_01", body: "icon_02", hands: "icon_03", legs: "icon_04", weapon: "icon_05" };
    const setByClass = { warrior: "IronWill", mage: "ArcaneFocus", rogue: "ShadowStep", archer: "Marksman" };
    const labels = {
      warrior: { head: "War Helm", body: "War Plate", hands: "War Gauntlets", legs: "War Greaves", weapon: "War Blade", primary: "str" },
      mage: { head: "Arcane Hood", body: "Arcane Robe", hands: "Arcane Gloves", legs: "Arcane Boots", weapon: "Arcane Staff", primary: "mp" },
      rogue: { head: "Shadow Hood", body: "Shadow Garb", hands: "Shadow Grips", legs: "Shadow Treads", weapon: "Shadow Dagger", primary: "dex" },
      archer: { head: "Ranger Cowl", body: "Ranger Vest", hands: "Ranger Gloves", legs: "Ranger Boots", weapon: "Ranger Bow", primary: "dex" },
    };

    Object.entries(this.CLASS_EQUIPMENT || {}).forEach(([className, slots]) => {
      Object.keys(slots).forEach((slot) => {
        const list = slots[slot] || [];
        const base = list[0] || { id: `${className}_${slot}_01`, name: `${className} ${slot}`, slot, stats: {}, rarity: "common" };
        const cfg = labels[className] || labels.warrior;
        for (let tier = list.length + 1; tier <= 10; tier++) {
          const isWeapon = slot === "weapon";
          const primaryValue = isWeapon ? Math.floor(tier * 1.8) : Math.ceil(tier * 1.35);
          const stats = isWeapon
            ? { ap: 8 + tier * 5, [cfg.primary]: primaryValue }
            : {
                [cfg.primary]: primaryValue,
                hp: className === "warrior" ? 6 + tier * 5 : 3 + tier * 2,
                mp: className === "mage" ? 6 + tier * 4 : tier,
              };
          list.push({
            id: `${className.slice(0, 3)}_${slot}_${String(tier).padStart(2, "0")}`,
            name: `${cfg[slot]} ${tier}`,
            slot,
            type: isWeapon ? "weapon" : "armor",
            stats,
            rarity: rarityByTier[tier - 1],
            icon: base.icon || base.baseIcon || iconBySlot[slot] || "icon_11",
            baseIcon: base.baseIcon || base.icon || iconBySlot[slot] || "icon_11",
            color: this.RARITY_NAMES?.[rarityByTier[tier - 1]]?.color || base.color || base.baseColor || 0xffffff,
            baseColor: base.baseColor || base.color || 0x8fa0aa,
            setId: slot === "weapon" ? undefined : (base.setId || setByClass[className]),
            requiredLevel: tier,
          });
        }
        slots[slot] = list.slice(0, 10);
      });
    });
  };

  GS.pickClassEquipmentByTier = function (registry, slot = "weapon", tier = 1, className = null) {
    this.extendClassEquipmentProgression?.();
    const playerClass = className || registry.get("playerClass") || this.DEFAULT_CLASS || "warrior";
    const list = this.CLASS_EQUIPMENT?.[playerClass]?.[slot] || this.CLASS_EQUIPMENT?.[this.DEFAULT_CLASS]?.[slot] || [];
    if (!list.length) return null;
    return list[Math.max(0, Math.min(list.length - 1, tier - 1))];
  };

  GS.createBossEquipmentReward = function (registry, variantKey = "forgotten_halls", difficultyKey = "normal") {
    this.extendClassEquipmentProgression?.();
    const difficulty = this.getDungeonDifficultyDef?.(registry, difficultyKey) || {};
    const level = this.getEffectivePlayerLevel?.(registry) || registry.get("playerLevel") || 1;
    const difficultyBonus = difficultyKey === "very_hard" ? 3 : difficultyKey === "hard" ? 2 : 1;
    const routeBonus = variantKey === "abyss_gate" ? 3 : variantKey === "crystal_hollow" ? 2 : variantKey === "forgotten_halls" ? 0 : 1;
    const tier = Math.max(1, Math.min(10, Math.ceil(level / 2) + difficultyBonus + routeBonus));
    const slotRoll = Phaser.Math.Between(1, 100);
    const slot = slotRoll <= 45 ? "weapon" : slotRoll <= 62 ? "body" : slotRoll <= 75 ? "head" : slotRoll <= 88 ? "hands" : "legs";
    const template = this.pickClassEquipmentByTier(registry, slot, tier);
    return this.createInventoryItemFromTemplate(template, template?.rarity || null);
  };

  GS.grantBossEquipmentReward = function (registry, variantKey = "forgotten_halls", difficultyKey = "normal") {
    const item = this.createBossEquipmentReward(registry, variantKey, difficultyKey);
    if (!item) return { ok: false, reason: "no_item" };
    const index = this.addToInventory(registry, item);
    if (index < 0) {
      registry.set("gold", (registry.get("gold") || 0) + this.getItemShopValue(item));
      return { ok: true, convertedToGold: true, item, value: this.getItemShopValue(item) };
    }
    return { ok: true, item, index };
  };

  GS.MATERIAL_DEFS = Object.assign({}, GS.MATERIAL_DEFS || {}, {
    ironShard: { id: "ironShard", name: "Iron Shard", routes: ["forgotten_halls", "bandit_quarry", "emberforge_depths"] },
    arcaneDust: { id: "arcaneDust", name: "Arcane Dust", routes: ["sunken_sanctum", "crystal_hollow", "abyss_gate"] },
    shadowSilk: { id: "shadowSilk", name: "Shadow Silk", routes: ["shadow_silk_cave", "necrotic_catacombs"] },
    frostCore: { id: "frostCore", name: "Frost Core", routes: ["frostbite_crypt"] },
    bossCore: { id: "bossCore", name: "Boss Core", routes: [] },
  });

  GS.getMaterials = function (registry) {
    const value = registry.get("materials");
    return value && typeof value === "object" ? { ...value } : {};
  };

  GS.addMaterial = function (registry, materialId, amount = 1) {
    const def = this.MATERIAL_DEFS?.[materialId];
    if (!def || amount <= 0) return { ok: false, reason: "missing_material" };
    const materials = this.getMaterials(registry);
    materials[materialId] = (materials[materialId] || 0) + amount;
    registry.set("materials", materials);
    return { ok: true, material: def, amount, total: materials[materialId] };
  };

  GS.getRouteMaterialId = function (variantKey = "forgotten_halls") {
    const match = Object.values(this.MATERIAL_DEFS || {}).find((def) => (def.routes || []).includes(variantKey));
    return match?.id || "ironShard";
  };

  GS.grantDungeonMaterials = function (registry, variantKey = "forgotten_halls", difficultyKey = "normal", killCount = 0) {
    const diffBonus = difficultyKey === "very_hard" ? 2 : difficultyKey === "hard" ? 1 : 0;
    const routeMaterialId = this.getRouteMaterialId(variantKey);
    const routeAmount = Math.max(1, Math.floor((killCount || 0) / 8) + diffBonus);
    const bossAmount = 1 + diffBonus;
    const route = this.addMaterial(registry, routeMaterialId, routeAmount);
    const boss = this.addMaterial(registry, "bossCore", bossAmount);
    return [route, boss].filter((entry) => entry.ok).map((entry) => ({ id: entry.material.id, name: entry.material.name, amount: entry.amount }));
  };

  GS.craftClassGearCache = function (registry) {
    const materials = this.getMaterials(registry);
    const playerClass = registry.get("playerClass") || this.DEFAULT_CLASS || "warrior";
    const level = this.getEffectivePlayerLevel?.(registry) || registry.get("playerLevel") || 1;
    const routeMaterialId = playerClass === "mage" ? "arcaneDust" : playerClass === "rogue" ? "shadowSilk" : playerClass === "archer" ? "ironShard" : "ironShard";
    const costGold = 75 + level * 10;
    if ((registry.get("gold") || 0) < costGold) return { ok: false, reason: "gold", costGold };
    if ((materials.bossCore || 0) < 2 || (materials[routeMaterialId] || 0) < 4) return { ok: false, reason: "materials", routeMaterialId };
    materials.bossCore -= 2;
    materials[routeMaterialId] -= 4;
    registry.set("materials", materials);
    registry.set("gold", (registry.get("gold") || 0) - costGold);
    const slotRoll = ["weapon", "body", "head", "hands", "legs"][Phaser.Math.Between(0, 4)];
    const tier = Math.max(1, Math.min(10, Math.ceil(level / 2) + 2));
    const template = this.pickClassEquipmentByTier(registry, slotRoll, tier, playerClass);
    const item = this.createInventoryItemFromTemplate(template, template?.rarity || null);
    const index = this.addToInventory(registry, item);
    if (index < 0) {
      registry.set("gold", (registry.get("gold") || 0) + this.getItemShopValue(item));
      return { ok: true, convertedToGold: true, item };
    }
    return { ok: true, item, index };
  };

  GS.getSkillLevels = function (registry) {
    const levels = registry.get("skillLevels");
    return levels && typeof levels === "object" ? { ...levels } : {};
  };

  GS.getSkillLevel = function (registry, skillId) {
    return Math.max(1, this.getSkillLevels(registry)[skillId] || 1);
  };

  GS.getSkillPointCount = function (registry) {
    return registry.get("skillPoints") ?? Math.max(1, Math.floor((registry.get("playerLevel") || 1) / 3));
  };

  GS.upgradeSkill = function (registry, skillId) {
    if (!skillId) return { ok: false, reason: "missing_skill" };
    const points = this.getSkillPointCount(registry);
    if (points <= 0) return { ok: false, reason: "points" };
    const levels = this.getSkillLevels(registry);
    const nextLevel = Math.min(10, (levels[skillId] || 1) + 1);
    if (nextLevel === (levels[skillId] || 1)) return { ok: false, reason: "max" };
    levels[skillId] = nextLevel;
    registry.set("skillLevels", levels);
    registry.set("skillPoints", points - 1);
    return { ok: true, level: nextLevel };
  };

  GS.getSkillPowerScale = function (registry, skillId) {
    return 1 + (this.getSkillLevel(registry, skillId) - 1) * 0.12;
  };

  GS.getXpForNextLevel = function (level = 1) {
    const safeLevel = Math.max(1, level || 1);
    return Math.floor(90 + safeLevel * safeLevel * 55 + safeLevel * 35);
  };

  GS.getPlayerXpState = function (registry) {
    const level = Math.max(1, registry.get("playerLevel") || 1);
    const xp = Math.max(0, registry.get("playerXp") || 0);
    return { level, xp, next: this.getXpForNextLevel(level) };
  };

  GS.grantXp = function (registry, amount = 0, reason = "combat") {
    let gained = Math.max(0, Math.floor(amount || 0));
    if (gained <= 0) return { ok: false, reason: "no_xp" };
    let level = Math.max(1, registry.get("playerLevel") || 1);
    let xp = Math.max(0, registry.get("playerXp") || 0) + gained;
    let levelsGained = 0;
    while (xp >= this.getXpForNextLevel(level) && level < 60) {
      xp -= this.getXpForNextLevel(level);
      level += 1;
      levelsGained += 1;
    }
    registry.set("playerLevel", level);
    registry.set("playerXp", xp);
    if (levelsGained > 0) {
      registry.set("skillPoints", (registry.get("skillPoints") || 0) + levelsGained);
      registry.set("statPoints", (registry.get("statPoints") || 0) + levelsGained);
    }
    return { ok: true, amount: gained, level, xp, next: this.getXpForNextLevel(level), levelsGained, reason };
  };

  const previousTurnInQuest = GS.turnInQuest;
  GS.turnInQuest = function (registry, questId) {
    const levelBefore = Math.max(1, registry.get("playerLevel") || 1);
    const result = previousTurnInQuest.call(this, registry, questId);
    if (result?.ok) {
      registry.set("playerLevel", levelBefore);
      const rewardXp = result.quest?.rewardXp || Math.max(35, (result.quest?.rewardGold || 40) * 2);
      result.xp = this.grantXp(registry, rewardXp, "quest");
    }
    return result;
  };

  const previousAddToInventory = GS.addToInventory;
  GS.addToInventory = function (registry, item) {
    const items = [...this.getInventoryItems(registry)];
    let firstEmpty = items.findIndex((slot) => slot == null);
    if (firstEmpty < 0 && items.length < 40) {
      firstEmpty = items.length;
      while (items.length <= firstEmpty) items.push(null);
    }
    if (firstEmpty < 0) return -1;
    items[firstEmpty] = { ...item };
    registry.set("inventoryItems", items);
    return firstEmpty;
  };

  const previousUpgradeItemAtSource = GS.upgradeItemAtSource;
  GS.upgradeItemAtSource = function (registry, source) {
    const beforePaper = registry.get("weaponUpgradePaperCount") || 0;
    const result = previousUpgradeItemAtSource.call(this, registry, source);
    const afterPaper = registry.get("weaponUpgradePaperCount") || 0;
    const usedPaper = result?.ok ? Math.max(0, beforePaper - afterPaper) : 0;
    if (usedPaper > 0) this.decrementInventoryStack?.(registry, "upgradePaper", usedPaper);
    if (result?.ok) this.saveProgress?.(registry);
    return result;
  };

  const previousGetSaveKeys = GS.getSaveKeys;
  GS.getSaveKeys = function () {
    return [...new Set([
      ...previousGetSaveKeys.call(this),
      "questStates",
      "questStateById",
      "playerXp",
      "skillPoints",
      "skillLevels",
      "materials",
      "currentHp",
      "currentMp",
    ])];
  };

  GS.extendClassEquipmentProgression();
})();
