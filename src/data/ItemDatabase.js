(function () {
  const EQUIP_SLOTS = ["head", "body", "hands", "legs", "weapon"];

  const RARITY_NAMES = {
    common: { name: "Common", star: 1, color: 0xc0c0c0 },
    uncommon: { name: "Uncommon", star: 2, color: 0x00ff00 },
    rare: { name: "Rare", star: 3, color: 0x0088ff },
    epic: { name: "Epic", star: 4, color: 0xffc857 },
    legendary: { name: "Legendary", star: 5, color: 0xff8a2a },
  };

  const ITEM_RARITY_DISTRIBUTION = {
    common: 60,
    uncommon: 25,
    rare: 10,
    epic: 4,
    legendary: 1,
  };

  const SET_BONUSES = {
    IronWill: {
      name: "Iron Will",
      pieces: { head: true, body: true, hands: true, legs: true },
      bonuses: [
        { pieces: 2, effect: "HP +20" },
        { pieces: 4, effect: "HP +40, Damage Reduction 5%" },
      ],
    },
    ArcaneFocus: {
      name: "Arcane Focus",
      pieces: { head: true, body: true, hands: true, legs: true },
      bonuses: [
        { pieces: 2, effect: "MP +15" },
        { pieces: 4, effect: "MP +30, Spell Damage +8%" },
      ],
    },
    ShadowStep: {
      name: "Shadow Step",
      pieces: { head: true, body: true, hands: true, legs: true },
      bonuses: [
        { pieces: 2, effect: "Speed +5%" },
        { pieces: 4, effect: "Speed +10%, Crit Chance +8%" },
      ],
    },
    Marksman: {
      name: "Marksman",
      pieces: { head: true, body: true, hands: true, legs: true },
      bonuses: [
        { pieces: 2, effect: "AP +3" },
        { pieces: 4, effect: "AP +6, Attack Speed +7%" },
      ],
    },
  };

  const QUALITY_TIERS = [
    { rarity: "common", armorLabel: "Cotton", weaponLabel: "Low Class", color: 0xd8d8d8, statReq: 0 },
    { rarity: "common", armorLabel: "Reinforced", weaponLabel: "Middle Class", color: 0xe6e6e6, statReq: 3 },
    { rarity: "rare", armorLabel: "Full Plate", weaponLabel: "High Class", color: 0x4aa3ff, statReq: 6 },
    { rarity: "rare", armorLabel: "Chitin", weaponLabel: "Exceptional", color: 0x2f78ff, statReq: 9 },
    { rarity: "epic", armorLabel: "Shell", weaponLabel: "Shellforged", color: 0xffd15c, statReq: 12 },
    { rarity: "epic", armorLabel: "Gold Shell", weaponLabel: "Goldforged", color: 0xffc039, statReq: 15 },
    { rarity: "legendary", armorLabel: "Krowaz", weaponLabel: "Krowaz", color: 0xff8a2a, statReq: 18 },
    { rarity: "legendary", armorLabel: "Mythril Krowaz", weaponLabel: "Mythril", color: 0xff7a1a, statReq: 21 },
    { rarity: "legendary", armorLabel: "Dragon Krowaz", weaponLabel: "Dragon", color: 0xff5c19, statReq: 24 },
    { rarity: "legendary", armorLabel: "Isekai Relic", weaponLabel: "Isekai Relic", color: 0xffaa00, statReq: 28 },
  ];

  const CLASS_GEAR_CONFIG = {
    warrior: {
      prefix: "war",
      setId: "IronWill",
      primary: "str",
      secondary: "hp",
      labels: { head: "Helm", body: "Armor", hands: "Gauntlets", legs: "Greaves", weapon: "Sword" },
      icons: { head: "icon_01", body: "icon_02", hands: "icon_03", legs: "icon_04", weapon: "icon_05" },
    },
    mage: {
      prefix: "mge",
      setId: "ArcaneFocus",
      primary: "mp",
      secondary: "mpBonus",
      labels: { head: "Hood", body: "Robe", hands: "Gloves", legs: "Boots", weapon: "Staff" },
      icons: { head: "icon_01", body: "icon_02", hands: "icon_03", legs: "icon_04", weapon: "icon_12" },
    },
    rogue: {
      prefix: "rog",
      setId: "ShadowStep",
      primary: "dex",
      secondary: "str",
      labels: { head: "Mask", body: "Garb", hands: "Grips", legs: "Treads", weapon: "Dagger" },
      icons: { head: "icon_01", body: "icon_02", hands: "icon_03", legs: "icon_04", weapon: "icon_08" },
    },
    archer: {
      prefix: "arc",
      setId: "Marksman",
      primary: "dex",
      secondary: "ap",
      labels: { head: "Cowl", body: "Vest", hands: "Gloves", legs: "Boots", weapon: "Bow" },
      icons: { head: "icon_01", body: "icon_02", hands: "icon_03", legs: "icon_04", weapon: "icon_06" },
    },
  };

  function clone(value) {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  }

  function createStats(className, slot, tier, cfg) {
    const isWeapon = slot === "weapon";
    const primaryValue = isWeapon ? Math.ceil(tier * 1.65) : Math.ceil(tier * 1.25);
    const stats = isWeapon
      ? { ap: 8 + tier * 5, [cfg.primary]: primaryValue }
      : {
          [cfg.primary]: primaryValue,
          hp: className === "warrior" ? 8 + tier * 5 : 4 + tier * 3,
          mp: className === "mage" ? 8 + tier * 4 : Math.ceil(tier * 0.8),
        };

    if (!isWeapon && cfg.secondary && cfg.secondary !== cfg.primary) {
      stats[cfg.secondary] = Math.ceil(tier * 0.6);
    }
    if (isWeapon && className === "mage") stats.mpBonus = 4 + tier * 3;
    if (isWeapon && className === "rogue") stats.dex += Math.ceil(tier * 0.45);
    if (isWeapon && className === "archer") stats.dex += Math.ceil(tier * 0.35);
    if (isWeapon && className === "warrior") stats.str += Math.ceil(tier * 0.35);
    return stats;
  }

  function generateClassEquipment() {
    const result = {};
    Object.entries(CLASS_GEAR_CONFIG).forEach(([className, cfg]) => {
      result[className] = {};
      EQUIP_SLOTS.forEach((slot) => {
        const isWeapon = slot === "weapon";
        result[className][slot] = QUALITY_TIERS.map((quality, index) => {
          const tier = index + 1;
          const baseIcon = cfg.icons[slot] || "icon_11";
          return {
            id: `${cfg.prefix}_${slot}_${String(tier).padStart(2, "0")}`,
            name: `${isWeapon ? quality.weaponLabel : quality.armorLabel} ${cfg.labels[slot]}`,
            className,
            tier,
            requiredLevel: tier,
            requiredStatValue: quality.statReq,
            slot,
            type: isWeapon ? "weapon" : "armor",
            stats: createStats(className, slot, tier, cfg),
            rarity: quality.rarity,
            icon: baseIcon,
            baseIcon,
            color: quality.color,
            baseColor: quality.color,
            qualityLabel: isWeapon ? quality.weaponLabel : quality.armorLabel,
            setId: !isWeapon && tier >= 7 ? cfg.setId : undefined,
          };
        });
      });
    });
    return result;
  }

  function getEquipmentTemplateById(itemId) {
    const equipment = generateClassEquipment();
    for (const className of Object.keys(equipment)) {
      for (const slot of Object.keys(equipment[className])) {
        const found = equipment[className][slot].find((item) => item.id === itemId);
        if (found) return clone(found);
      }
    }
    return null;
  }

  function pickClassEquipmentByTier(className, slot, tier = 1) {
    const equipment = generateClassEquipment();
    const classGear = equipment[className] || equipment.warrior;
    const list = classGear?.[slot] || equipment.warrior?.[slot] || [];
    if (!list.length) return null;
    return clone(list[Math.max(0, Math.min(list.length - 1, tier - 1))]);
  }

  window.ItemDatabase = {
    EQUIP_SLOTS,
    RARITY_NAMES,
    ITEM_RARITY_DISTRIBUTION,
    SET_BONUSES,
    QUALITY_TIERS,
    CLASS_GEAR_CONFIG,
    generateClassEquipment,
    getEquipmentTemplateById,
    pickClassEquipmentByTier,
    clone,
  };
})();
