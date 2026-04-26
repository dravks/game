# Dungeon + Class Item Pass

## Added
- 10 data-driven dungeon routes:
  - Forgotten Halls
  - Ashen Barracks
  - Sunken Sanctum
  - Shadow Silk Cave
  - Frostbite Crypt
  - Emberforge Depths
  - Bandit Quarry
  - Necrotic Catacombs
  - Crystal Hollow
  - Abyss Gate
- Normal / Hard / Very Hard dungeon difficulty flow.
- Dungeon Gate service panel now lists all 10 dungeon routes.
- DungeonPrototypeScene now reads selected dungeonId + difficultyKey and changes:
  - title
  - theme tint
  - room layout bias
  - enemy pool
  - boss name
  - gold reward scaling
  - clear reward summary
- Added higher-tier class-specific items for Warrior, Mage, Rogue, and Archer.
- Dungeon clear can grant class-biased equipment into inventory.
- Item tooltip now colors unsuitable/off-class/bad stats red, KO-style.

## Notes
- Very Hard still uses the internal key `nightmare` for backwards compatibility.
- The new dungeon system is data-driven, so adding more routes later only needs new DUNGEON_DEFS data.
