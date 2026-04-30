(function () {
  const GS = window.GameState;
  if (!GS) return;

  const balanceConfig = window.BalanceConfig || {};
  GS.UPGRADE_SUCCESS_BY_LEVEL = { ...(balanceConfig.UPGRADE_SUCCESS_BY_LEVEL || GS.UPGRADE_SUCCESS_BY_LEVEL || {}) };
  Object.entries(balanceConfig.DIFFICULTY_OVERRIDES || {}).forEach(([difficultyKey, override]) => {
    if (GS.DEFAULT_GAME_CONFIG?.difficulty?.[difficultyKey]) {
      Object.assign(GS.DEFAULT_GAME_CONFIG.difficulty[difficultyKey], override);
    }
  });

  GS.SHOP_ITEMS = {
    hpPotion: { id: "hpPotion", name: "HP Potion", price: 20, type: "potion", countKey: "healthPotionCount", icon: "icon_08", baseIcon: "icon_08", color: 0xd67272, rarity: "common", count: 1 },
    mpPotion: { id: "mpPotion", name: "MP Potion", price: 30, type: "potion", countKey: "mpPotionCount", icon: "icon_10", baseIcon: "icon_10", color: 0x5588ff, rarity: "common", count: 1 },
    upgradePaper: { id: "upgradePaper", name: "Upgrade Paper", price: 25, type: "upgradePaper", countKey: "weaponUpgradePaperCount", icon: "icon_11", baseIcon: "icon_11", color: 0xf4df9c, rarity: "common", count: 1 },
  };

  GS.BALANCE = Object.assign({}, GS.BALANCE || {}, balanceConfig.BALANCE || {});
  GS.ECONOMY_CONFIG = window.EconomyConfig || {};
  GS.DUNGEON_REWARD_CONFIG = window.DungeonRewardConfig || {};
  GS.SOCIAL_PVP_CONFIG = window.SocialPvpConfig || {};

  GS.syncItemDatabase = function () {
    const db = window.ItemDatabase;
    if (!db?.generateClassEquipment) {
      this.CLASS_EQUIPMENT = {};
      console.error("[ItemDatabase] Missing or invalid. Equipment lookup is disabled.");
      return false;
    }
    this.EQUIP_SLOTS = [...(db.EQUIP_SLOTS || this.EQUIP_SLOTS || [])];
    this.RARITY_NAMES = this.deepClone ? this.deepClone(db.RARITY_NAMES) : JSON.parse(JSON.stringify(db.RARITY_NAMES));
    this.ITEM_RARITY_DISTRIBUTION = this.deepClone ? this.deepClone(db.ITEM_RARITY_DISTRIBUTION) : JSON.parse(JSON.stringify(db.ITEM_RARITY_DISTRIBUTION));
    this.SET_BONUSES = this.deepClone ? this.deepClone(db.SET_BONUSES) : JSON.parse(JSON.stringify(db.SET_BONUSES));
    this.CLASS_EQUIPMENT = db.generateClassEquipment();
    return true;
  };

  GS.getItemTemplateById = function (itemId) {
    return window.ItemDatabase?.getEquipmentTemplateById?.(itemId) || null;
  };

  GS.getEquipmentTemplateById = function (itemId) {
    return this.getItemTemplateById(itemId);
  };

  GS.CLASS_LEVEL_SKILLS = window.SkillDatabase?.CLASS_LEVEL_SKILLS || {};
  GS.CLASS_SKILL_DEFS = window.SkillDatabase?.CLASS_SKILL_DEFS || {};
  GS.CLASS_COMBAT_BALANCE = window.ClassBalanceConfig?.CLASS_COMBAT_BALANCE || {};
  GS.BASIC_ATTACK_PROFILES = window.ClassBalanceConfig?.BASIC_ATTACK_PROFILES || {};

  GS.getClassCombatBalance = function (registryOrClass = null) {
    const className = typeof registryOrClass === "string"
      ? registryOrClass
      : registryOrClass?.get?.("playerClass") || this.DEFAULT_CLASS || "warrior";
    return window.ClassBalanceConfig?.getCombatBalance?.(className) || this.CLASS_COMBAT_BALANCE[String(className).toLowerCase()] || this.CLASS_COMBAT_BALANCE.warrior;
  };

  GS.getBasicAttackProfile = function (registryOrClass = null) {
    const className = typeof registryOrClass === "string"
      ? registryOrClass
      : registryOrClass?.get?.("playerClass") || this.DEFAULT_CLASS || "warrior";
    return window.ClassBalanceConfig?.getBasicAttackProfile?.(className) || this.BASIC_ATTACK_PROFILES[String(className).toLowerCase()] || this.BASIC_ATTACK_PROFILES.warrior;
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

  GS.QUEST_DEFS = window.QuestDatabase?.QUEST_DEFS || {};

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
  GS.getUnlockedClassSkills = function (registry, className = null) { const c = (className || registry.get("playerClass") || this.DEFAULT_CLASS).toLowerCase(); const level = registry.get("playerLevel") || 1; return (window.SkillDatabase?.getClassSkills?.(c) || this.CLASS_LEVEL_SKILLS[c] || this.CLASS_LEVEL_SKILLS[this.DEFAULT_CLASS] || []).map((skill) => ({ ...skill, unlocked: level >= skill.unlockLevel })); };
  GS.getClassSkillForClass = function (className) { const c = (className || this.DEFAULT_CLASS).toLowerCase(); return window.SkillDatabase?.getPrimarySkill?.(c) || (this.CLASS_LEVEL_SKILLS[c] || [])[0] || this.CLASS_SKILL_DEFS[c] || this.CLASS_SKILL_DEFS[this.DEFAULT_CLASS]; };

  GS.getQuestDefinitionsList = function () { return Object.values(this.QUEST_DEFS || {}); };
  GS.getQuestStates = function (registry) { const states = registry.get("questStates"); return states && typeof states === "object" ? { ...states } : {}; };
  GS.migrateLegacyQuestState = function (registry) {
    const legacy = registry.get("questState");
    if (!legacy || legacy === "not_accepted") return false;
    const states = this.getQuestStates(registry);
    if (Object.keys(states).length > 0) return false;
    const questId = "forgotten_kekon";
    if (!this.QUEST_DEFS?.[questId]) return false;
    states[questId] = {
      state: legacy === "completed" ? "completed" : legacy === "ready_to_turn_in" ? "ready_to_turn_in" : "active",
      progress: legacy === "completed" || legacy === "ready_to_turn_in" ? this.QUEST_DEFS[questId].required || 1 : 0,
    };
    registry.set("questStates", states);
    return true;
  };
  GS.acceptQuest = function (registry, questId) { const def = this.QUEST_DEFS?.[questId]; if (!def) return { ok: false, reason: "missing" }; const states = this.getQuestStates(registry); if (["active", "ready_to_turn_in", "completed"].includes(states[questId]?.state)) return { ok: false, reason: "already" }; states[questId] = { state: "active", progress: 0 }; registry.set("questStates", states); return { ok: true, quest: def }; };
  GS.getActiveQuests = function (registry) { const states = this.getQuestStates(registry); return Object.entries(states).map(([id, data]) => { const def = this.QUEST_DEFS?.[id]; if (!def || !["active", "ready_to_turn_in"].includes(data.state)) return null; const required = def.required || 1; return { ...def, state: data.state, progress: data.progress || 0, objectiveText: `${data.progress || 0}/${required} - ${def.description || def.title}` }; }).filter(Boolean); };
  GS.getAvailableQuests = function (registry) { const states = this.getQuestStates(registry); return this.getQuestDefinitionsList().filter((q) => !states[q.id] || states[q.id].state === "not_accepted"); };
  GS.updateQuestProgress = function (registry, event = {}) { const states = this.getQuestStates(registry); let changed = false; Object.entries(states).forEach(([id, data]) => { if (data.state !== "active") return; const def = this.QUEST_DEFS?.[id]; if (!def) return; if (def.dungeonId && event.dungeonId && def.dungeonId !== event.dungeonId) return; if (def.difficulty && event.difficulty && def.difficulty !== event.difficulty) return; const targetMatch = !def.target || !event.target || String(event.target).toLowerCase().includes(String(def.target).toLowerCase()) || String(def.target).toLowerCase().includes(String(event.target).toLowerCase()); if (def.objectiveType !== event.type || !targetMatch) return; const next = Math.min((data.progress || 0) + (event.amount || 1), def.required || 1); states[id] = { ...data, progress: next, state: next >= (def.required || 1) ? "ready_to_turn_in" : "active" }; changed = true; }); if (changed) registry.set("questStates", states); return changed; };
  GS.turnInQuest = function (registry, questId) { const states = this.getQuestStates(registry); const data = states[questId]; const def = this.QUEST_DEFS?.[questId]; if (!def || data?.state !== "ready_to_turn_in") return { ok: false, reason: "not_ready" }; states[questId] = { ...data, state: "completed" }; registry.set("questStates", states); registry.set("gold", (registry.get("gold") || 0) + (def.rewardGold || 0)); if (def.rewardPaper) registry.set("weaponUpgradePaperCount", (registry.get("weaponUpgradePaperCount") || 0) + def.rewardPaper); if (def.rewardStatPoints) registry.set("statPoints", (registry.get("statPoints") || 0) + def.rewardStatPoints); registry.set("playerLevel", Math.max(registry.get("playerLevel") || 1, Math.min(10, 1 + Object.values(states).filter((q) => q.state === "completed").length))); return { ok: true, quest: def }; };
  GS.upgradeItemAtSource = function (registry, source) { const current = this.getItemFromSource(registry, source); if (!current?.slot) return { ok: false, reason: "not_equipment" }; const level = current.upgradeLevel || 0; const targetLevel = level + 1; if (targetLevel > 10) return { ok: false, reason: "max_level" }; const paper = registry.get("weaponUpgradePaperCount") || 0; if (paper <= 0) return { ok: false, reason: "no_paper" }; const cost = 20 + targetLevel * 10; const gold = registry.get("gold") || 0; if (gold < cost) return { ok: false, reason: "gold", cost }; registry.set("gold", gold - cost); registry.set("weaponUpgradePaperCount", paper - 1); const successRate = this.getUpgradeSuccessRate(targetLevel); const roll = Phaser?.Math?.Between ? Phaser.Math.Between(1, 100) : Math.ceil(Math.random() * 100); if (roll > successRate) return { ok: true, success: false, item: current, targetLevel, successRate, roll, cost }; const delta = this.getUpgradePreviewDelta(current); const upgraded = this.applyUpgradeDeltaToItem(current, delta); upgraded.upgradeLevel = targetLevel; upgraded.name = (current.name || "Item").replace(/ \+\d+$/, ""); this.setItemAtSource(registry, source, upgraded); return { ok: true, success: true, item: upgraded, targetLevel, successRate, roll, cost, statDelta: delta }; };

  GS.getActivityLog = function (registry) {
    const value = registry.get("activityLog");
    return Array.isArray(value) ? [...value] : [];
  };

  GS.pushActivityEvent = function (registry, message, type = "system") {
    if (!message) return [];
    const entry = { type, message: String(message), at: Date.now() };
    const next = [entry, ...this.getActivityLog(registry)].slice(0, 20);
    registry.set("activityLog", next);
    return next;
  };

  GS.spendGold = function (registry, amount = 0, reason = "sink") {
    const cost = Math.max(0, Math.floor(amount || 0));
    const gold = registry.get("gold") || 0;
    if (gold < cost) return { ok: false, reason: "gold", cost, gold };
    registry.set("gold", gold - cost);
    this.pushActivityEvent?.(registry, `Gold sink: -${cost} (${reason})`, "economy");
    return { ok: true, cost, reason, gold: gold - cost };
  };

  GS.getDungeonEntryCost = function (difficultyKey = "normal") {
    return window.EconomyConfig?.getDungeonEntryCost?.(difficultyKey) || 0;
  };

  GS.chargeDungeonEntry = function (registry, dungeonId = "forgotten_halls", difficultyKey = "normal") {
    const cost = this.getDungeonEntryCost(difficultyKey);
    const result = this.spendGold(registry, cost, `dungeon:${dungeonId}:${difficultyKey}`);
    if (result.ok) registry.set("lastDungeonEntryFee", { dungeonId, difficultyKey, cost });
    return result;
  };

  GS.getRepairCost = function (item) {
    if (!item?.slot) return 0;
    const normalized = this.normalizeItemDurability?.(item) || item;
    const maxDurability = normalized.maxDurability || this.getItemMaxDurability?.(normalized) || 100;
    const durability = normalized.durability ?? maxDurability;
    const missing = Math.max(0, maxDurability - durability);
    if (missing <= 0) return 0;
    const fullCost = window.EconomyConfig?.getRepairCost?.(normalized) || 0;
    return Math.max(1, Math.ceil(fullCost * (missing / Math.max(1, maxDurability))));
  };

  GS.getItemMaxDurability = function (item) {
    if (!item?.slot) return null;
    const tier = Math.max(1, item.tier || item.requiredLevel || 1);
    return Math.max(40, 80 + tier * 6 + (item.upgradeLevel || 0) * 4);
  };

  GS.normalizeItemDurability = function (item) {
    if (!item || !item.slot) return item;
    const maxDurability = item.maxDurability || this.getItemMaxDurability(item) || 100;
    const durability = item.durability === undefined ? maxDurability : Math.max(0, Math.min(maxDurability, item.durability));
    return { ...item, durability, maxDurability };
  };

  GS.getItemDurabilityText = function (item) {
    if (!item?.slot) return "";
    const normalized = this.normalizeItemDurability(item);
    return `${normalized.durability}/${normalized.maxDurability}`;
  };

  GS.applyDurabilityWear = function (registry, slots = ["weapon"], amount = 1, reason = "use") {
    const changed = [];
    slots.forEach((slot) => {
      const current = this.normalizeItemDurability(this.getEquippedItem(registry, slot));
      if (!current?.slot || current.durability <= 0) return;
      const next = { ...current, durability: Math.max(0, current.durability - Math.max(1, amount || 1)) };
      registry.set(`equipped_${slot}`, next);
      changed.push({ slot, item: next });
      if (next.durability === 0) this.pushActivityEvent?.(registry, `${next.name || slot} broken (${reason})`, "durability");
    });
    return changed;
  };

  GS.repairEquipmentAtSource = function (registry, source) {
    const item = this.getItemFromSource?.(registry, source);
    if (!item?.slot) return { ok: false, reason: "not_equipment" };
    const cost = this.getRepairCost(item);
    if (cost <= 0) return { ok: true, item: this.normalizeItemDurability(item), cost: 0, alreadyFull: true };
    const paid = this.spendGold(registry, cost, `repair:${item.id || item.name || item.slot}`);
    if (!paid.ok) return paid;
    const normalized = this.normalizeItemDurability(item);
    const repaired = { ...normalized, durability: normalized.maxDurability || window.EconomyConfig?.GOLD_SINKS?.repair?.durabilityRestore || 100 };
    this.setItemAtSource?.(registry, source, repaired);
    return { ok: true, item: repaired, cost };
  };

  GS.getAllRepairPlan = function (registry) {
    const equippedSources = (this.EQUIP_SLOTS || [])
      .map((slot) => ({ sourceType: "equipped", slot, label: slot, item: this.getEquippedItem(registry, slot) }))
      .filter((source) => source.item?.slot);
    const inventorySources = (this.getInventoryItems(registry) || [])
      .map((item, index) => ({ sourceType: "inventory", index, label: `Bag ${index + 1}`, item }))
      .filter((source) => source.item?.slot);
    const sources = [...equippedSources, ...inventorySources]
      .map((source) => {
        const item = this.normalizeItemDurability?.(source.item) || source.item;
        return { ...source, item, cost: this.getRepairCost(item) };
      });
    return {
      sources,
      damaged: sources.filter((source) => source.cost > 0),
      totalCost: sources.reduce((sum, source) => sum + (source.cost || 0), 0),
    };
  };

  GS.getEquippedRepairPlan = function (registry) {
    const sources = (this.EQUIP_SLOTS || [])
      .map((slot) => ({ sourceType: "equipped", slot, label: slot, item: this.getEquippedItem(registry, slot) }))
      .filter((source) => source.item?.slot)
      .map((source) => {
        const item = this.normalizeItemDurability?.(source.item) || source.item;
        return { ...source, item, cost: this.getRepairCost(item) };
      });
    return {
      sources,
      damaged: sources.filter((source) => source.cost > 0),
      totalCost: sources.reduce((sum, source) => sum + (source.cost || 0), 0),
    };
  };

  GS.repairEquippedGear = function (registry) {
    const plan = this.getEquippedRepairPlan?.(registry) || { damaged: [], totalCost: 0 };
    if (!plan.sources?.length) return { ok: false, reason: "no_equipment", cost: 0 };
    if (!plan.damaged.length || plan.totalCost <= 0) return { ok: true, reason: "already_full", cost: 0, repaired: 0 };
    const paid = this.spendGold(registry, plan.totalCost, "repair:equipped");
    if (!paid.ok) return paid;
    plan.damaged.forEach((source) => {
      const normalized = this.normalizeItemDurability?.(source.item) || source.item;
      this.setItemAtSource?.(registry, source, { ...normalized, durability: normalized.maxDurability || 100 });
    });
    return { ok: true, cost: plan.totalCost, repaired: plan.damaged.length };
  };

  GS.repairAllGear = function (registry) {
    const plan = this.getAllRepairPlan?.(registry) || { sources: [], damaged: [], totalCost: 0 };
    if (!plan.sources?.length) return { ok: false, reason: "no_equipment", cost: 0 };
    if (!plan.damaged.length || plan.totalCost <= 0) return { ok: true, reason: "already_full", cost: 0, repaired: 0, total: plan.sources.length };
    const paid = this.spendGold(registry, plan.totalCost, "repair:all_gear");
    if (!paid.ok) return paid;
    plan.damaged.forEach((source) => {
      const normalized = this.normalizeItemDurability?.(source.item) || source.item;
      this.setItemAtSource?.(registry, source, { ...normalized, durability: normalized.maxDurability || 100 });
    });
    return { ok: true, cost: plan.totalCost, repaired: plan.damaged.length, total: plan.sources.length };
  };

  GS.setPartyLootMode = function (registry, lootMode = "round_robin") {
    const state = this.getPartyState(registry);
    if (!state.members?.length) return { ok: false, reason: "no_party" };
    state.lootMode = lootMode;
    registry.set("partyState", state);
    this.pushActivityEvent?.(registry, `Party loot mode: ${lootMode}`, "social");
    return { ok: true, party: state };
  };

  GS.addLocalPartyMember = function (registry, member = {}) {
    const state = this.getPartyState(registry);
    if (!state.members?.length) this.createLocalParty(registry);
    const next = this.getPartyState(registry);
    const max = window.SocialPvpConfig?.PARTY?.maxSize || 5;
    if ((next.members || []).length >= max) return { ok: false, reason: "full", party: next };
    const index = next.members.length + 1;
    const classes = ["warrior", "rogue", "mage", "archer"];
    next.members.push({
      name: member.name || `Companion${index}`,
      className: member.className || classes[(index - 1) % classes.length],
    });
    registry.set("partyState", next);
    this.pushActivityEvent?.(registry, `Party member joined: ${next.members[next.members.length - 1].name}`, "social");
    return { ok: true, party: next };
  };

  GS.depositGuildGold = function (registry, amount = 50) {
    const guild = registry.get("guildState");
    if (!guild) return { ok: false, reason: "no_guild" };
    const paid = this.spendGold(registry, amount, "guild_bank");
    if (!paid.ok) return paid;
    const next = { ...guild, bankGold: (guild.bankGold || 0) + amount };
    registry.set("guildState", next);
    this.pushActivityEvent?.(registry, `Guild bank deposit: ${amount}g`, "guild");
    return { ok: true, guild: next, amount };
  };

  GS.setGuildNotice = function (registry, notice = "Prepare for dungeon runs.") {
    const guild = registry.get("guildState");
    if (!guild) return { ok: false, reason: "no_guild" };
    const next = { ...guild, notice };
    registry.set("guildState", next);
    this.pushActivityEvent?.(registry, `Guild notice: ${notice}`, "guild");
    return { ok: true, guild: next };
  };

  GS.setPvpQueueState = function (registry, queued = true) {
    const state = this.getPvpState(registry);
    state.queued = !!queued;
    state.queueType = queued ? "solo" : null;
    registry.set("pvpState", state);
    this.pushActivityEvent?.(registry, queued ? "PvP queue joined" : "PvP queue left", "pvp");
    return { ok: true, pvp: state };
  };

  GS.claimPvpReward = function (registry) {
    const state = this.getPvpState(registry);
    const unclaimedWins = Math.max(0, (state.wins || 0) - (state.claimedWins || 0));
    if (unclaimedWins <= 0) return { ok: false, reason: "no_reward", pvp: state };
    const reward = unclaimedWins * 12 + Math.max(0, state.rating - 1000);
    registry.set("gold", (registry.get("gold") || 0) + reward);
    state.claimedWins = state.wins || 0;
    registry.set("pvpState", state);
    this.pushActivityEvent?.(registry, `PvP reward claimed: +${reward}g`, "pvp");
    return { ok: true, gold: reward, pvp: state };
  };

  GS.getMarketTax = function (amount = 0) {
    return window.EconomyConfig?.getMarketTax?.(amount) || 0;
  };

  GS.getDungeonClearScore = function ({ kills = 0, total = 1 } = {}) {
    return window.DungeonRewardConfig?.getClearScore?.(kills, total) || { grade: "C", killRatio: 0, chestTierBonus: 0, goldMultiplier: 1, xpMultiplier: 1 };
  };

  GS.getDungeonChestRewardPlan = function ({ kills = 0, total = 1, difficultyKey = "normal", baseTier = 1 } = {}) {
    const score = this.getDungeonClearScore({ kills, total });
    const difficulty = window.DungeonRewardConfig?.getDifficultyBonus?.(difficultyKey) || { tierBonus: 0, materialBonus: 0 };
    return {
      score,
      difficulty,
      tier: Math.max(1, Math.min(10, Math.floor(baseTier + (score.chestTierBonus || 0) + (difficulty.tierBonus || 0)))),
      materialBonus: difficulty.materialBonus || 0,
      goldMultiplier: score.goldMultiplier || 1,
      xpMultiplier: score.xpMultiplier || 1,
    };
  };

  GS.getBossPhasePlan = function (dungeonId = "default") {
    return window.DungeonRewardConfig?.getBossPhases?.(dungeonId) || [];
  };

  GS.getPartyState = function (registry) {
    const state = registry.get("partyState");
    return state && typeof state === "object" ? { ...state } : { members: [], lootMode: window.SocialPvpConfig?.PARTY?.defaultLootMode || "round_robin" };
  };

  GS.createLocalParty = function (registry, leaderName = null) {
    const playerName = leaderName || registry.get("characterName") || "Player";
    const state = { leader: playerName, members: [{ name: playerName, className: registry.get("playerClass") || this.DEFAULT_CLASS }], lootMode: window.SocialPvpConfig?.PARTY?.defaultLootMode || "round_robin" };
    registry.set("partyState", state);
    this.pushActivityEvent?.(registry, `Party created: ${playerName}`, "social");
    return { ok: true, party: state };
  };

  GS.MERCENARY_CONFIG = {
    lootCut: 0.35,
    attackSlow: 1.45,
    durationHours: [1, 3, 6],
    classes: {
      warrior: { label: "Warrior Mercenary", hourlyCost: 90, tint: 0xd98852, role: "Melee guard", damageScale: 0.7 },
      rogue: { label: "Rogue Mercenary", hourlyCost: 105, tint: 0xae7cff, role: "Fast melee", damageScale: 0.72 },
      mage: { label: "Mage Mercenary", hourlyCost: 120, tint: 0x77a9ff, role: "Ranged magic", damageScale: 0.68 },
      archer: { label: "Archer Mercenary", hourlyCost: 110, tint: 0xd8b15c, role: "Ranged physical", damageScale: 0.7 },
    },
  };

  GS.getMercenaryState = function (registry) {
    const state = registry.get("mercenaryState");
    if (!state || !state.className || !state.expiresAt) return null;
    if (Date.now() >= state.expiresAt) {
      registry.set("mercenaryState", null);
      this.pushActivityEvent?.(registry, "Mercenary contract expired", "social");
      return null;
    }
    return { ...state };
  };

  GS.getMercenaryHireCost = function (className = "warrior", hours = 1) {
    const def = this.MERCENARY_CONFIG.classes[String(className).toLowerCase()] || this.MERCENARY_CONFIG.classes.warrior;
    return Math.max(1, Math.floor((def.hourlyCost || 90) * Math.max(1, hours || 1)));
  };

  GS.hireMercenary = function (registry, className = "warrior", hours = 1) {
    const resolvedClass = String(className || "warrior").toLowerCase();
    const def = this.MERCENARY_CONFIG.classes[resolvedClass];
    if (!def) return { ok: false, reason: "class" };
    const durationHours = Math.max(1, hours || 1);
    const cost = this.getMercenaryHireCost(resolvedClass, durationHours);
    const paid = this.spendGold(registry, cost, `mercenary:${resolvedClass}:${durationHours}h`);
    if (!paid.ok) return paid;
    const now = Date.now();
    const state = {
      className: resolvedClass,
      label: def.label,
      hiredAt: now,
      expiresAt: now + durationHours * 60 * 60 * 1000,
      durationHours,
      lootCut: this.MERCENARY_CONFIG.lootCut,
      attackSlow: this.MERCENARY_CONFIG.attackSlow,
      damageScale: def.damageScale || 0.7,
    };
    registry.set("mercenaryState", state);
    this.pushActivityEvent?.(registry, `${def.label} hired for ${durationHours}h`, "social");
    return { ok: true, mercenary: state, cost };
  };

  GS.dismissMercenary = function (registry) {
    registry.set("mercenaryState", null);
    this.pushActivityEvent?.(registry, "Mercenary dismissed", "social");
    return { ok: true };
  };

  GS.getMercenaryRemainingText = function (registry) {
    const state = this.getMercenaryState(registry);
    if (!state) return "None";
    const remainingMs = Math.max(0, state.expiresAt - Date.now());
    const minutes = Math.ceil(remainingMs / 60000);
    if (minutes >= 60) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  GS.applyMercenaryLootCut = function (registry, amount = 0, source = "loot") {
    const value = Math.max(0, Math.floor(amount || 0));
    const state = this.getMercenaryState(registry);
    if (!state || value <= 0) return { playerAmount: value, mercenaryAmount: 0, active: false };
    const mercenaryAmount = Math.floor(value * (state.lootCut ?? this.MERCENARY_CONFIG.lootCut));
    const playerAmount = Math.max(0, value - mercenaryAmount);
    if (mercenaryAmount > 0) this.pushActivityEvent?.(registry, `${state.label || "Mercenary"} cut: ${mercenaryAmount} ${source}`, "social");
    return { playerAmount, mercenaryAmount, active: true };
  };

  GS.shouldMercenaryClaimDrop = function (registry) {
    const state = this.getMercenaryState(registry);
    if (!state) return false;
    return Math.random() < (state.lootCut ?? this.MERCENARY_CONFIG.lootCut);
  };

  GS.clearLocalParty = function (registry) {
    registry.set("partyState", null);
    this.pushActivityEvent?.(registry, "Party disbanded", "social");
    return { ok: true };
  };

  GS.getGuildCreationCost = function () {
    return window.SocialPvpConfig?.GUILD?.creationCost || 0;
  };

  GS.createLocalGuild = function (registry, guildName) {
    const name = String(guildName || "").trim();
    if (!name) return { ok: false, reason: "name" };
    const max = window.SocialPvpConfig?.GUILD?.maxNameLength || 18;
    if (name.length > max) return { ok: false, reason: "long_name", max };
    const paid = this.spendGold(registry, this.getGuildCreationCost(), `guild:${name}`);
    if (!paid.ok) return paid;
    const guild = { name, rank: "Leader", members: 1, capacity: window.SocialPvpConfig?.GUILD?.starterCapacity || 30 };
    registry.set("guildState", guild);
    this.pushActivityEvent?.(registry, `Guild created: ${name}`, "social");
    return { ok: true, guild };
  };

  GS.getPvpState = function (registry) {
    const state = registry.get("pvpState");
    return state && typeof state === "object" ? { ...state } : { rating: window.SocialPvpConfig?.PVP?.rating?.defaultRating || 1000, wins: 0, losses: 0, streak: 0 };
  };

  GS.recordPvpResult = function (registry, won = false) {
    const cfg = window.SocialPvpConfig?.PVP?.rating || {};
    const state = this.getPvpState(registry);
    if (won) {
      state.wins += 1;
      state.streak = Math.max(1, (state.streak || 0) + 1);
      state.rating += (cfg.winGain || 18) + Math.max(0, state.streak - 1) * (cfg.streakBonus || 0);
    } else {
      state.losses += 1;
      state.streak = 0;
      state.rating = Math.max(0, state.rating - (cfg.lossPenalty || 12));
    }
    registry.set("pvpState", state);
    this.updateQuestProgress?.(registry, { type: "pvp", target: "arena", amount: 1 });
    this.pushActivityEvent?.(registry, `PvP ${won ? "win" : "loss"} | Rating ${state.rating}`, "pvp");
    return { ok: true, pvp: state };
  };

  GS.extendClassEquipmentProgression = function () {
    return this.syncItemDatabase?.() || false;
  };

  const previousGetEquipRequirement = GS.getEquipRequirement;
  GS.getEquipRequirement = function (item, className = null) {
    const requirement = previousGetEquipRequirement.call(this, item, className);
    if (!item?.requiredStatValue) return requirement;
    const itemClass = this.getItemFamilyClass(item, className || this.DEFAULT_CLASS);
    const statKey = this.getPrimaryStatKeyForClass(itemClass);
    return {
      className: itemClass,
      statKey,
      label: this.getStatLabel(statKey),
      value: Math.max(requirement?.value || 0, item.requiredStatValue || 0),
    };
  };

  GS.getActiveSetBonusStats = function (registry) {
    const counts = {};
    (this.EQUIP_SLOTS || []).forEach((slot) => {
      const item = this.getEquippedItem(registry, slot);
      if (item?.setId) counts[item.setId] = (counts[item.setId] || 0) + 1;
    });
    const stats = { hp: 0, mp: 0, ap: 0, speed: 0, damageReduction: 0, spellDamage: 0, critChance: 0, attackSpeed: 0 };
    Object.entries(counts).forEach(([setId, count]) => {
      if (setId === "IronWill") {
        if (count >= 2) stats.hp += 20;
        if (count >= 4) { stats.hp += 40; stats.damageReduction += 0.05; }
      } else if (setId === "ArcaneFocus") {
        if (count >= 2) stats.mp += 15;
        if (count >= 4) { stats.mp += 30; stats.spellDamage += 0.08; }
      } else if (setId === "ShadowStep") {
        if (count >= 2) stats.speed += 9;
        if (count >= 4) { stats.speed += 18; stats.critChance += 0.08; }
      } else if (setId === "Marksman") {
        if (count >= 2) stats.ap += 3;
        if (count >= 4) { stats.ap += 6; stats.attackSpeed += 0.07; }
      }
    });
    return stats;
  };

  const setBonusGetMaxHp = GS.getMaxHp;
  GS.getMaxHp = function (registry) {
    return setBonusGetMaxHp.call(this, registry) + (this.getActiveSetBonusStats?.(registry).hp || 0);
  };

  const setBonusGetMaxMp = GS.getMaxMp;
  GS.getMaxMp = function (registry) {
    return setBonusGetMaxMp.call(this, registry) + (this.getActiveSetBonusStats?.(registry).mp || 0);
  };

  const setBonusGetWeaponAp = GS.getWeaponAp;
  GS.getWeaponAp = function (registry) {
    const ap = setBonusGetWeaponAp.call(this, registry) + (this.getActiveSetBonusStats?.(registry).ap || 0);
    const weapon = this.normalizeItemDurability?.(this.getEquippedItem(registry, "weapon"));
    if (!weapon?.slot || !weapon.maxDurability) return ap;
    const ratio = weapon.durability / weapon.maxDurability;
    if (ratio <= 0) return Math.max(1, Math.floor(ap * 0.35));
    if (ratio < 0.2) return Math.max(1, Math.floor(ap * 0.75));
    return ap;
  };

  const setBonusGetPlayerSpeed = GS.getPlayerSpeed;
  GS.getPlayerSpeed = function (registry) {
    return setBonusGetPlayerSpeed.call(this, registry) + (this.getActiveSetBonusStats?.(registry).speed || 0);
  };

  GS.pickRandomEquipment = function (className, slot) {
    this.extendClassEquipmentProgression?.();
    const tier = window.Phaser?.Math?.Between ? window.Phaser.Math.Between(1, 2) : 1;
    const template = window.ItemDatabase?.pickClassEquipmentByTier?.(className || this.DEFAULT_CLASS, slot, tier);
    if (!template) return null;
    return this.createInventoryItemFromTemplate(template, template?.rarity || "common");
  };

  GS.pickClassEquipmentByTier = function (registry, slot = "weapon", tier = 1, className = null) {
    this.extendClassEquipmentProgression?.();
    const playerClass = className || registry.get("playerClass") || this.DEFAULT_CLASS || "warrior";
    return window.ItemDatabase?.pickClassEquipmentByTier?.(playerClass, slot, tier) || null;
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

  const durabilityCreateInventoryItemFromTemplate = GS.createInventoryItemFromTemplate;
  GS.createInventoryItemFromTemplate = function (template, rarityOverride = null) {
    return this.normalizeItemDurability?.(durabilityCreateInventoryItemFromTemplate.call(this, template, rarityOverride));
  };

  const durabilityAddToInventoryBase = GS.addToInventory;
  GS.addToInventory = function (registry, item) {
    return durabilityAddToInventoryBase.call(this, registry, this.normalizeItemDurability?.(item));
  };

  const durabilityEquipFromInventory = GS.equipFromInventory;
  GS.equipFromInventory = function (registry, index) {
    const result = durabilityEquipFromInventory.call(this, registry, index);
    if (result?.ok && result.item?.slot) {
      registry.set(`equipped_${result.item.slot}`, this.normalizeItemDurability?.(registry.get(`equipped_${result.item.slot}`)));
    }
    return result;
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
    const balance = this.BALANCE || {};
    return Math.floor((balance.xpBase || 90) + safeLevel * safeLevel * (balance.xpQuadratic || 55) + safeLevel * (balance.xpLinear || 35));
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
    while (xp >= this.getXpForNextLevel(level) && level < (this.BALANCE?.levelCap || 60)) {
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
    items[firstEmpty] = { ...(this.normalizeItemDurability?.(item) || item) };
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
    if (result?.ok) {
      this.updateQuestProgress?.(registry, { type: "upgrade", target: "equipment", amount: 1 });
      this.pushActivityEvent?.(registry, result.success ? `Upgrade success: +${result.targetLevel}` : `Upgrade failed: +${result.targetLevel}`, "upgrade");
      this.saveProgress?.(registry);
    }
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
      "activityLog",
      "partyState",
      "guildState",
      "pvpState",
      "lastDungeonEntryFee",
    ])];
  };

  const previousSmoothTransitionToNewSystem = GS.smoothTransitionToNewSystem;
  GS.smoothTransitionToNewSystem = function (registry) {
    previousSmoothTransitionToNewSystem.call(this, registry);
    this.migrateLegacyQuestState?.(registry);
    if (!registry.get("questStates")) registry.set("questStates", {});
    if (!registry.get("hotbarSlots")) registry.set("hotbarSlots", new Array(this.HOTBAR_SIZE || 6).fill(null));
    if (!registry.get("activityLog")) registry.set("activityLog", []);
    if (!registry.get("pvpState")) registry.set("pvpState", this.getPvpState(registry));
  };

  GS.getHotbarItems = function (registry) {
    const slots = registry.get("hotbarSlots") || new Array(this.HOTBAR_SIZE || 6).fill(null);
    return slots.map((id) => {
      if (!id) return null;
      const skill = this.getSkillDefById?.(id, registry.get("playerClass") || this.DEFAULT_CLASS);
      const consumable = this.getConsumableDef?.(id) || this.CONSUMABLE_DEFS?.[id];
      return skill || consumable || { id, name: id };
    });
  };

  GS.useHotbarItem = function (registry, index, scene = null) {
    const entryId = this.getHotbarSlot?.(registry, index);
    if (!entryId) return { ok: false, reason: "empty" };
    return this.useHotbarEntry?.(registry, entryId, scene) || { ok: false, reason: "unsupported" };
  };

  GS.getDefense = function (registry) {
    return this.getTotalDefense?.(registry) || 0;
  };

  GS.getActiveSetBonuses = function (registry) {
    return this.getSetBonusesForEquipped?.(registry) || [];
  };

  GS.getSetBonusSummary = function (registry) {
    return (this.getSetBonusesForEquipped?.(registry) || []).map((bonus) => `${bonus.name}: ${bonus.effect}`);
  };

  GS.extendClassEquipmentProgression();
})();
