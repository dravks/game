# Game Vision

- The game should feel like a focused 2D isekai action RPG with light MMORPG structure.
- The core identity is randomness at the start, dungeon-centered progression, and repeated growth through loot, stats, and build improvement.
- The early version should aim for a clear gameplay loop instead of broad content volume.

## Initial Scope

- The first version is a single-player prototype.
- It should be structured so it can later expand, but it is not trying to be a full MMORPG yet.
- The goal is a playable vertical slice with one city flow, one early dungeon flow, basic progression, and repeatable advancement.

## Core Gameplay Loop

- Start in the main city.
- Prepare through city NPC systems.
- Enter a dungeon.
- Clear enemy phases in order.
- Defeat the boss.
- Gain loot, gold, and progression rewards.
- Return to the city.
- Improve the character build and repeat.

## Player Start

- At the start of a new run or character, the player receives a random class from a small starter pool.
- Each class should have a simple identity early, such as melee, ranged, or magic focus.
- The player also receives random starting stats within a controlled range.
- Early implementation should keep this system simple, readable, and easy to balance.

## City Systems

- `Potion Merchant` - sells consumables for sustain and dungeon preparation.
- `Blacksmith` - provides basic equipment purchase or replacement.
- `Upgrader` - improves existing equipment or core stats using gold or materials.
- `Quest Giver` - provides simple progression goals tied to dungeon runs or enemy clears.
- `Dungeon Gate / Dungeon Access` - acts as the main entry point for available dungeon content.

## Dungeon Structure

- Each dungeon should follow a reusable 4-phase structure.
- Phase 1: weaker mobs.
- Phase 2: weaker mobs plus stronger variants.
- Phase 3: stronger variants only.
- Phase 4: boss phase.
- Example template:
- `Phase 1` - Kekon
- `Phase 2` - Kekon + Kekon Warrior
- `Phase 3` - Kekon Warrior
- `Phase 4` - Kekon Boss
- This structure is a template that can be reused for future dungeons with different enemy sets.

## Progression Systems

- `Item Drops` - enemies and bosses can drop gear, materials, or consumables.
- `Gold` - used for city preparation, equipment access, and upgrades.
- `Stat Growth` - player power increases through level-ups, rewards, or permanent progression values.
- `Equipment Improvement` - gear can be upgraded to support stronger dungeon runs.
- `Class Identity Growth` - the chosen random class should become more distinct through equipment, stats, and combat direction.

## First Implementation Priorities

- Project setup.
- Engine setup.
- City prototype.
- Player movement.
- Basic UI.
- NPC interaction.
- Dungeon prototype.
- Enemies and combat.
- Progression loop.

## Out of Scope for Early Version

- Multiplayer networking.
- Guild systems.
- Trading systems.
- Chat moderation systems.
- Account systems.
- Large content volume across many cities, dungeons, and classes.
