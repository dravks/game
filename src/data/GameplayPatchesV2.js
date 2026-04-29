(function () {
  const GS = window.GameState;
  if (!GS) return;

  // Keep the current item prices, but split NPC responsibilities:
  // Potion Merchant = HP/MP potions. Anvil = upgrade paper. Sundries = buy/sell utility/basic gear.
  GS.SHOP_ITEMS = GS.SHOP_ITEMS || {};
  GS.SHOP_ITEMS.hpPotion = Object.assign({ id: "hpPotion", name: "HP Potion", price: 20, type: "potion", countKey: "healthPotionCount", icon: "icon_08", baseIcon: "icon_08", color: 0xd67272, rarity: "common", count: 1 }, GS.SHOP_ITEMS.hpPotion || {});
  GS.SHOP_ITEMS.mpPotion = Object.assign({ id: "mpPotion", name: "MP Potion", price: 30, type: "potion", countKey: "mpPotionCount", icon: "icon_10", baseIcon: "icon_10", color: 0x5588ff, rarity: "common", count: 1 }, GS.SHOP_ITEMS.mpPotion || {});
  GS.SHOP_ITEMS.upgradePaper = Object.assign({ id: "upgradePaper", name: "Upgrade Paper", price: 25, type: "upgradePaper", countKey: "weaponUpgradePaperCount", icon: "icon_11", baseIcon: "icon_11", color: 0xf4df9c, rarity: "common", count: 1 }, GS.SHOP_ITEMS.upgradePaper || {});
  GS.SHOP_ITEMS.returnScroll = { id: "returnScroll", name: "Town Scroll", price: 35, type: "material", icon: "icon_11", baseIcon: "icon_11", color: 0xd7c58f, rarity: "common", count: 1 };

  GS.getHotbarSlot = function (registry, index) {
    const slots = registry.get("hotbarSlots") || new Array(this.HOTBAR_SIZE || 6).fill(null);
    return slots[index] || null;
  };
  GS.setHotbarSlot = function (registry, index, itemId) {
    const size = this.HOTBAR_SIZE || 6;
    if (index < 0 || index >= size) return { ok: false, reason: "bad_slot" };
    const slots = [...(registry.get("hotbarSlots") || new Array(size).fill(null))];
    slots[index] = itemId || null;
    registry.set("hotbarSlots", slots);
    return { ok: true, index, itemId };
  };
  GS.assignToHotbar = function (registry, itemId, index) { return this.setHotbarSlot(registry, index, itemId); };

  GS.getSkillDefById = function (skillId, playerClass = null) {
    const classes = this.CLASS_LEVEL_SKILLS || {};
    const classKeys = playerClass ? [String(playerClass).toLowerCase()] : Object.keys(classes);
    for (const key of classKeys) {
      const found = (classes[key] || []).find((skill) => skill.id === skillId);
      if (found) return found;
    }
    const basicClass = playerClass || this.DEFAULT_CLASS || "warrior";
    const classSkill = this.CLASS_SKILL_DEFS?.[basicClass];
    return classSkill?.id === skillId ? classSkill : null;
  };
  GS.isSkillUnlocked = function (registry, skill) {
    const level = registry.get("playerLevel") || 1;
    return level >= (skill?.unlockLevel || 1);
  };

  GS.useHotbarEntry = function (registry, entryId, scene = null) {
    if (!entryId) return { ok: false, reason: "empty" };
    const consumable = this.getConsumableDef?.(entryId) || this.CONSUMABLE_DEFS?.[entryId] || null;
    if (consumable) {
      const count = registry.get(consumable.countKey) || 0;
      if (count <= 0) return { ok: false, reason: "no_count" };
      if (consumable.type === "healHp") {
        if (scene && typeof scene.currentHp === "number") scene.currentHp = Math.min((scene.currentHp || 0) + (consumable.healAmount || this.HP_POTION_HEAL || 50), this.getMaxHp(registry));
        else registry.set("hp", Math.min((registry.get("hp") || 0) + (consumable.healAmount || 50), registry.get("maxHp") || this.getMaxHp(registry)));
      } else if (consumable.type === "restoreMp") {
        if (scene && typeof scene.currentMp === "number") scene.currentMp = Math.min((scene.currentMp || 0) + (consumable.restoreAmount || this.MP_POTION_RESTORE || 30), this.getMaxMp(registry));
        else registry.set("mp", Math.min((registry.get("mp") || 0) + (consumable.restoreAmount || 30), registry.get("maxMp") || this.getMaxMp(registry)));
      }
      registry.set(consumable.countKey, Math.max(0, count - 1));
      return { ok: true, type: "consumable", entryId, def: consumable };
    }
    const skill = this.getSkillDefById(entryId, registry.get("playerClass") || this.DEFAULT_CLASS || "warrior");
    if (skill) return { ok: true, type: "skill", entryId, skill };
    return { ok: false, reason: "unknown" };
  };

  GS.getEnemyDefenseValue = function (enemy) { return enemy?.defense || enemy?.stats?.defense || 0; };
  GS.getEnemyResistValue = function (enemy, damageType = "physical") {
    if (!enemy) return 0;
    if (damageType === "magic") return enemy.magicResist || 0;
    if (damageType === "ranged") return enemy.rangedResist || 0;
    return enemy.physicalResist || enemy.resist || 0;
  };
})();
