/*
 * DungeonTemplates - manifest for the 10 editor-made dungeon JSON maps.
 * The actual map layouts live under assets/dungeon_pack/custom_dungeons/*.json.
 * This file is intentionally lightweight so the game can preload maps via Phaser.
 */
(function () {
  const defs = {
    forgotten_halls: {
      id: "forgotten_halls",
      name: "Forgotten Halls",
      description: "A beginner dark stone dungeon with balanced enemy spacing.",
      recommendedLevel: 1,
      recommendedPower: 100,
      unlockLevel: 1,
      rewardFocus: "balanced starter gear",
      jsonPath: "assets/dungeon_pack/custom_dungeons/forgotten_halls.json",
    },
    ashen_barracks: {
      id: "ashen_barracks",
      name: "Ashen Barracks",
      description: "Burned military halls guarded by aggressive melee enemies.",
      recommendedLevel: 2,
      recommendedPower: 150,
      unlockLevel: 1,
      rewardFocus: "warrior / HP / defense gear",
      jsonPath: "assets/dungeon_pack/custom_dungeons/ashen_barracks.json",
    },
    sunken_sanctum: {
      id: "sunken_sanctum",
      name: "Sunken Sanctum",
      description: "A flooded blue-green temple with mana and magic pressure.",
      recommendedLevel: 3,
      recommendedPower: 200,
      unlockLevel: 1,
      rewardFocus: "mage / MP / magic gear",
      jsonPath: "assets/dungeon_pack/custom_dungeons/sunken_sanctum.json",
    },
    shadow_silk_cave: {
      id: "shadow_silk_cave",
      name: "Shadow Silk Cave",
      description: "A dark spider cave built around speed, venom and rogue rewards.",
      recommendedLevel: 4,
      recommendedPower: 260,
      unlockLevel: 1,
      rewardFocus: "rogue / DEX / speed gear",
      jsonPath: "assets/dungeon_pack/custom_dungeons/shadow_silk_cave.json",
    },
    frostbite_crypt: {
      id: "frostbite_crypt",
      name: "Frostbite Crypt",
      description: "A frozen ancient tomb with defensive undead encounters.",
      recommendedLevel: 5,
      recommendedPower: 330,
      unlockLevel: 1,
      rewardFocus: "defense / MP / rare armor",
      jsonPath: "assets/dungeon_pack/custom_dungeons/frostbite_crypt.json",
    },
    emberforge_depths: {
      id: "emberforge_depths",
      name: "Emberforge Depths",
      description: "A lava mine and underground forge full of high-HP enemies.",
      recommendedLevel: 6,
      recommendedPower: 410,
      unlockLevel: 1,
      rewardFocus: "weapon upgrades / upgrade materials",
      jsonPath: "assets/dungeon_pack/custom_dungeons/emberforge_depths.json",
    },
    bandit_quarry: {
      id: "bandit_quarry",
      name: "Bandit Quarry",
      description: "A rocky quarry camp controlled by bandits and ranged attackers.",
      recommendedLevel: 7,
      recommendedPower: 500,
      unlockLevel: 1,
      rewardFocus: "gold / archer gear",
      jsonPath: "assets/dungeon_pack/custom_dungeons/bandit_quarry.json",
    },
    necrotic_catacombs: {
      id: "necrotic_catacombs",
      name: "Necrotic Catacombs",
      description: "Green-purple undead catacombs with cursed-style loot.",
      recommendedLevel: 8,
      recommendedPower: 600,
      unlockLevel: 1,
      rewardFocus: "rare armor / cursed-style loot",
      jsonPath: "assets/dungeon_pack/custom_dungeons/necrotic_catacombs.json",
    },
    crystal_hollow: {
      id: "crystal_hollow",
      name: "Crystal Hollow",
      description: "A glowing crystal cave with high-value rare and epic materials.",
      recommendedLevel: 9,
      recommendedPower: 720,
      unlockLevel: 1,
      rewardFocus: "rare/epic materials and high-value loot",
      jsonPath: "assets/dungeon_pack/custom_dungeons/crystal_hollow.json",
    },
    abyss_gate: {
      id: "abyss_gate",
      name: "Abyss Gate",
      description: "A red-black endgame portal dungeon guarded by abyss creatures.",
      recommendedLevel: 10,
      recommendedPower: 850,
      unlockLevel: 1,
      rewardFocus: "legendary fragments / endgame loot",
      jsonPath: "assets/dungeon_pack/custom_dungeons/abyss_gate.json",
    },
  };

  const order = [
    "forgotten_halls",
    "ashen_barracks",
    "sunken_sanctum",
    "shadow_silk_cave",
    "frostbite_crypt",
    "emberforge_depths",
    "bandit_quarry",
    "necrotic_catacombs",
    "crystal_hollow",
    "abyss_gate",
  ];

  const difficulties = {
    normal: {
      key: "normal",
      label: "Normal",
      enemyHp: 1,
      enemyDamage: 1,
      bossHp: 1,
      gold: 1,
      drop: 1,
      color: 0xbfc9d6,
    },
    hard: {
      key: "hard",
      label: "Hard",
      enemyHp: 1.3,
      enemyDamage: 1.2,
      bossHp: 1.5,
      gold: 1.3,
      drop: 1.25,
      color: 0xe0a16f,
    },
    very_hard: {
      key: "very_hard",
      label: "Very Hard",
      enemyHp: 1.75,
      enemyDamage: 1.45,
      bossHp: 2.25,
      gold: 1.75,
      drop: 1.6,
      color: 0xe07a7a,
    },
  };

  function normalizeDifficulty(key) {
    if (key === "nightmare") return "very_hard";
    return difficulties[key] ? key : "normal";
  }

  function get(id) {
    return defs[id] || defs.forgotten_halls;
  }

  function list() {
    return order.map((id) => defs[id]).filter(Boolean);
  }

  function getDifficulty(key) {
    return difficulties[normalizeDifficulty(key)];
  }

  window.DungeonTemplates = {
    defs,
    order,
    difficulties,
    get,
    list,
    getDifficulty,
    normalizeDifficulty,
  };
})();
