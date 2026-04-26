# Asset Philosophy

- Early implementation should prefer simple placeholders and readable visual clarity over polished final art.
- The first goal is functional consistency, not final production art.
- Asset decisions should support fast testing, fast replacement, and clear gameplay feedback.

## Early Asset Categories

- `Player` - player visuals, class look markers, and movement-facing assets.
- `NPCs` - city service characters such as merchants, upgrader, and quest giver.
- `Enemies` - regular dungeon mobs and their readable type variations.
- `Bosses` - larger or more distinct enemies used for dungeon phase endings.
- `City Props` - buildings, signs, stalls, decorations, and navigation-supporting objects.
- `Dungeon Props` - walls, floors, gates, obstacles, and atmosphere-supporting objects.
- `UI` - menus, frames, icons, bars, panels, and readable interface elements.
- `Effects` - hit flashes, damage feedback, simple spell effects, and interaction feedback.
- `Items` - loot icons, consumables, equipment icons, and drop visuals.

## Player and NPC Asset Direction

- Early versions can use simple readable placeholder sprites or basic shapes.
- Player class identity should eventually be distinguishable through silhouette, color, or equipment cues.
- Important NPC roles should be visually distinct so players can quickly identify their function in the city.

## Enemy and Boss Asset Direction

- Normal mobs should be readable and easy to distinguish by type.
- Stronger variants should look visually related to base mobs.
- Bosses should stand out clearly from normal enemies through size, color, shape, animation, or effects.

## City and Dungeon Prop Direction

- City props should support clear navigation.
- Dungeon props should support combat readability and atmosphere.
- Collision-related objects should remain visually readable.

## UI Asset Direction

- UI should prioritize clarity.
- City menus, stats, inventory, skill bar, and dungeon feedback should be readable first.
- Early UI can use simple frames and placeholders.

## Early Asset Rules

- Prefer placeholders over blocking implementation.
- Do not wait for final art before building systems.
- Keep naming and organization simple.
- Avoid unnecessary asset sprawl in the prototype phase.
