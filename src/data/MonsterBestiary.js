(function () {
  const names = [
    "Tiny Slime", "Green Slime", "Blue Slime", "Big Slime", "Forest Slime", "Mud Slime", "Horn Rabbit", "Wild Rat", "Cave Bat", "Young Goblin",
    "Goblin", "Goblin Scout", "Goblin Fighter", "Goblin Archer", "Goblin Shaman", "Dire Rat", "Grey Wolf", "Forest Wolf", "Boar", "Poison Wasp",
    "Kobold", "Kobold Spearman", "Kobold Hunter", "Bandit Thug", "Bandit Archer", "Bandit Rogue", "Skeleton", "Skeleton Guard", "Skeleton Archer", "Zombie",
    "Ghoul", "Cave Spider", "Venom Spider", "Lizardman", "Lizardman Guard", "Orc Grunt", "Orc Warrior", "Orc Archer", "Orc Shaman", "Hobgoblin",
    "Hobgoblin Captain", "Troll Cub", "Troll", "Ogre", "Ogre Brute", "Ogre Mage", "Minotaur", "Stone Gargoyle", "Living Boulder", "Stone Golem",
    "Iron Golem", "Crystal Golem", "Dark Elf Scout", "Dark Elf Blade", "Dark Elf Mage", "Werewolf", "Alpha Werewolf", "Vampire Thrall", "Vampire Knight", "Necromancer",
    "Wraith", "Banshee", "Dullahan", "Bone Drake", "Frost Wolf", "Ice Golem", "Frost Lich", "Fire Imp", "Lava Slime", "Hellhound",
    "Flame Warden", "Lava Golem", "Ifrit Acolyte", "Wyvern", "Storm Wyvern", "Young Dragon", "Red Dragon", "Blue Dragon", "Black Dragon", "Ancient Dragon",
    "Demon Grunt", "Demon Claw", "Demon Guard", "Demon Mage", "Demon Knight", "Abyss Hound", "Abyss Reaper", "Soul Eater", "Void Wraith", "Nightmare Stalker",
    "Chaos Ogre", "Bloodfiend", "Nethermancer", "Hell Baron", "Demon Lord", "Elder Lich", "Titan Golem", "Abyss Dragon", "World Devourer", "Rift Emperor",
  ];

  const families = ["slime", "beast", "goblin", "kobold", "bandit", "undead", "spider", "lizard", "orc", "giant", "golem", "darkelf", "werebeast", "vampire", "elemental", "dragon", "demon", "abyss"];
  const behaviorByFamily = {
    slime: "slow_chase",
    beast: "fast_chase",
    goblin: "pack_chase",
    kobold: "guard_chase",
    bandit: "flank",
    undead: "relentless",
    spider: "poison_lunge",
    lizard: "guard_chase",
    orc: "bruiser",
    giant: "heavy_slam",
    golem: "slow_tank",
    darkelf: "flank",
    werebeast: "fast_chase",
    vampire: "life_drain",
    elemental: "caster",
    dragon: "boss_ranged",
    demon: "aggressive",
    abyss: "elite_boss",
  };

  const MONSTER_BESTIARY = names.map((name, index) => {
    const level = index + 1;
    const family = families[Math.min(families.length - 1, Math.floor(index / 6))];
    const eliteStep = Math.floor(index / 10);
    const hp = Math.floor(28 + level * 18 + Math.pow(level, 1.45) * 5 + eliteStep * 45);
    const attack = Math.floor(4 + level * 2.2 + eliteStep * 5);
    const defense = Math.floor(level * 0.8 + eliteStep * 3);
    const resist = Math.min(0.55, 0.02 + eliteStep * 0.035);
    return {
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""),
      name,
      level,
      family,
      rank: level <= 20 ? "field" : level <= 45 ? "veteran" : level <= 70 ? "elite" : level <= 90 ? "mythic" : "raid",
      hp,
      attack,
      defense,
      physicalResist: Math.round(resist * 100) / 100,
      magicResist: Math.round((resist * (family === "golem" || family === "dragon" || family === "abyss" ? 1.25 : 0.75)) * 100) / 100,
      speed: Math.max(34, Math.floor(46 + level * 0.7 - (family === "golem" ? 18 : 0))),
      xp: Math.floor(10 + level * 6 + Math.pow(level, 1.28)),
      gold: [Math.floor(2 + level * 1.5), Math.floor(5 + level * 2.4)],
      behavior: behaviorByFamily[family] || "chase",
      icon: family === "dragon" ? "icon_12" : family === "undead" ? "icon_01" : family === "golem" ? "icon_04" : "icon_08",
    };
  });

  window.MonsterBestiary = {
    list: MONSTER_BESTIARY,
    getByLevel(level = 1) {
      const safeLevel = Math.max(1, Math.min(100, Math.floor(level || 1)));
      return MONSTER_BESTIARY[safeLevel - 1];
    },
    getRange(minLevel = 1, maxLevel = 5) {
      return MONSTER_BESTIARY.filter((mob) => mob.level >= minLevel && mob.level <= maxLevel);
    },
  };
})();
