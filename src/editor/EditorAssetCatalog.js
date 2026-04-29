window.EDITOR_ASSET_CATALOG = {
  floors: [
    { key: "dungeon_tile_a", label: "Stone Floor (Dark)", type: "tile", assetPath: "assets/terrain/dungeon/tilemap_color1.png" },
    { key: "dungeon_tile_b", label: "Stone Floor (Blue)", type: "tile", assetPath: "assets/terrain/dungeon/tilemap_color2.png" },
    { key: "grass_tile", label: "Grass Field", type: "tile", assetPath: "assets/terrain/tilemap.png" }
  ],
  walls: [
    { key: "dungeon_wall_a", label: "Stone Wall (Solid)", type: "collision", assetPath: "assets/terrain/dungeon/tilemap_color1.png", isWall: true },
    { key: "dungeon_shadow", label: "Wall Shadow", type: "decoration", assetPath: "assets/terrain/dungeon/shadow_01.png" }
  ],
  buildings: [
    { key: "city_gate", label: "Castle Gate", type: "prop", assetPath: "assets/buildings/city_gate.png" },
    { key: "city_blacksmith", label: "Blacksmith Shop", type: "prop", assetPath: "assets/buildings/city_blacksmith.png" },
    { key: "city_house_potion", label: "Alchemy Shop", type: "prop", assetPath: "assets/buildings/city_house_potion.png" },
    { key: "tiny_house", label: "Small House", type: "prop", assetPath: "assets/buildings/tiny-swords/house1.png" },
    { key: "tiny_tower", label: "Guard Tower", type: "prop", assetPath: "assets/buildings/tiny-swords/tower.png" },
    { key: "tiny_archery", label: "Archery Range", type: "prop", assetPath: "assets/buildings/tiny-swords/archery.png" },
    { key: "tiny_barracks", label: "Barracks", type: "prop", assetPath: "assets/buildings/tiny-swords/barracks.png" },
    { key: "tiny_monastery", label: "Monastery", type: "prop", assetPath: "assets/buildings/tiny-swords/monastery.png" }
  ],
  props: [
    { key: "dungeon_rock_a", label: "Large Rock", type: "prop", assetPath: "assets/terrain/dungeon/rock_a.png" },
    { key: "dungeon_rock_b", label: "Small Rock", type: "prop", assetPath: "assets/terrain/dungeon/rock_b.png" },
    { key: "dungeon_bush_dead", label: "Dead Bush", type: "prop", assetPath: "assets/terrain/dungeon/bush_dead.png" },
    { key: "green_bush", label: "Green Bush", type: "prop", assetPath: "assets/props/tiny-swords/bush1.png" },
    { key: "forest_tree_1", label: "Large Oak Tree", type: "prop", assetPath: "assets/terrain/tree1.png" },
    { key: "forest_tree_2", label: "Tall Pine Tree", type: "prop", assetPath: "assets/terrain/tree2.png" },
    { key: "dungeon_tree", label: "Dead Tree", type: "prop", assetPath: "assets/props/dungeon/tree_01.png" }
  ],
  resources: [
    { key: "gold_ore", label: "Gold Ore Node", type: "prop", assetPath: "assets/props/loot/gold_stone_01.png" },
    { key: "gold_pile", label: "Gold Pile", type: "prop", assetPath: "assets/props/loot/gold_resource.png" }
  ],
  markers: [
    { key: "player_spawn_marker", label: "[!] Player Spawn", type: "marker", color: 0x00ff00 },
    { key: "boss_spawn_marker", label: "[!] Boss Spawn", type: "marker", color: 0xff0000 },
    { key: "enemy_spawn_marker", label: "[!] Enemy Spawn", type: "marker", color: 0xffff00 },
    { key: "chest_marker", label: "[!] Chest / Loot", type: "marker", color: 0xffa500 },
    { key: "exit_marker", label: "[!] Exit Portal", type: "marker", color: 0x00ffff }
  ],
  enemies: [
    { key: "enemy_kekon_idle", label: "Mob: Kekon (Goblin)", type: "enemySpawn", enemyId: "kekon", assetPath: "assets/sprites/enemies/kekon_idle.png" },
    { key: "enemy_kekon_warrior_idle", label: "Mob: Kekon Warrior", type: "enemySpawn", enemyId: "kekon_warrior", assetPath: "assets/sprites/enemies/kekon_warrior_idle.png" },
    { key: "enemy_kekon_shaman_idle", label: "Mob: Kekon Shaman", type: "enemySpawn", enemyId: "kekon_shaman", assetPath: "assets/sprites/enemies/kekon_shaman_idle.png" },
    { key: "enemy_kekon_boss_idle", label: "BOSS: Giant Kekon", type: "enemySpawn", enemyId: "kekon_boss", assetPath: "assets/sprites/enemies/kekon_boss_idle.png" }
  ]
};
