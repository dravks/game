# Project Status

- The project is now in the early playable prototype phase.
- Initial scene, movement, collision, UI, interaction, dungeon transition, dungeon structure, enemy placeholder, phase progression, and combat placeholder work have started.

## Completed

- `SKILL.md` has been created.
- `WORKFLOW.md` has been created.
- `PROGRESS.md` has been created.
- `DESIGN-DOCUMENT.md` has been created.
- `GAME-ENGINE.md` has been created.
- `ASSETS.md` has been created.
- `TESTING.md` has been created.
- The initial Phaser browser project structure has been created.
- The first playable city prototype layout has been created.
- Player movement and basic collision have been completed.
- The first UI layer has been completed.
- The first basic NPC interaction layer has been completed.
- The first dungeon transition entry flow has been completed.
- The first dungeon prototype structure has been completed.
- The first dungeon enemy placeholder setup has been completed.
- The first dungeon phase progression flow has been completed.
- The first dungeon combat placeholder layer has been completed.
- The first dungeon reward placeholder layer has been completed.
- The first dungeon clear-state placeholder flow has been completed.
- The first dungeon completion return flow has been completed.
- The first city-side post-dungeon return placeholder state has been completed.
- The first city-side progression and reward expansion layer has been completed.
- The first quest-linked dungeon completion placeholder flow has been completed.
- The first city-side upgrade and spending placeholder expansion has been completed.
- The first broader long-loop progression expansion has been completed.
- The deeper repeatable objective and city service expansion pass has been completed.
- The larger repeatable progression and city service expansion pass has been completed.
- The second lightweight dungeon-side progression and city loop refinement pass has been completed.
- The first concrete consumable use (HP Potion, MP Potion) has been completed.
- The lightweight inventory foundation has been completed.
- The first equipment bridge (4 starter class weapons, equipped weapon state) has been completed.
- The first item-based upgrade loop (weapon AP upgrade via Upgrader) has been completed.
- Combat has been connected to equipped weapon AP.
- The hotbar/inventory drag-drop consumable flow has been completed.
- Potions now work through hotbar slots (drag from inventory, press 1-6 to use).
- The first Tiny Swords visual asset integration pass has been completed.
- The first widescreen UI cleanup pass has been completed.
- The UI alignment and panel readability refinement pass has been completed.
- The city and dungeon UI readability/game-feel cleanup pass has been completed.
- The KO-style top panel and left/right log layout refinement pass has been completed.
- The first allocatable MMORPG-style stat layer and KO-like character inventory panel pass has been completed.
- The character inventory grid visual refinement pass has been completed.
- The 5x4 inventory grid tightening and city service item-card preview pass has been completed.
- The class selection and character creation system (CharacterCreateScene with random name/class/stats/equipment, reroll, confirm) is complete.
- The 5-slot equipment system (head, body, hands, legs, weapon) with class-specific item pools (10+ items per class) is complete.
- Item stat bonuses are fully integrated into all derived stats (HP, MP, AP, Speed) across city and dungeon.
- The inventory/character panel now displays all 5 equipment slots with icons, names, and class-specific visuals.
- The full character creation → city → dungeon loop is fully functional with randomized class-based loadouts.
- The MP Potion Merchant has been completed: dual-shop (Health 20g / Mana 30g), preview cards, 1/2 key selection, purchase flow integrated.
- The Loot Table System is complete: 3-tier enemy drops with rarity (common/uncommon/rare/epic/legendary), gold/exp tables, dungeon key, legendary fragments, and integrated reward summary.
- The Item Rarity system is in place: 5 rarity tiers with color-coded items (white/green/blue/purple/orange), weighted distribution, and visual feedback.
- The Set Bonus system is active: 4 class-themed sets (Iron Will, Arcane Focus, Shadow Step, Marksman) with 2-piece and 4-piece bonuses displayed in character panel.
- CharacterCreateScene now includes full UI helper methods (createUiPanel, createUiText) synced with PrototypeScene styling.
- PrototypeScene update loop refactored: dialog handling separated, movement extracted to handleMovement(), and potion merchant selection (1/2 keys) integrated cleanly.
- All scenes share consistent helper methods and state initialization patterns.
- The city scene UI recovery pass has been completed: Tiny Swords-style panel helpers, stronger HUD bars, minimap marker, cleaner service plots, and NPC focus indicators have been restored.
- The city-side C/I panel separation pass has been completed: `C` is now stats-focused, while `I` contains equipment slots, bag grid, and hover item tooltips.
- The hero creation layout rebuild and MMORPG-style Character `(C)` window readability pass have been completed: centered stable creation layout, non-zero class stat rerolls, solid dark character panel sections, separated resources, and scrollable active bonuses.
- The dungeon clear return bug has been fixed: the completion exit is now positioned inside the boss room walkable space so cleared runs can return to the city reliably.
- The first dungeon danger loop pass has been completed: enemies now use lightweight chase/attack behavior, the player can take damage, and dungeon death now triggers a controlled respawn at the entry point.
- The dungeon phase/boss flow reinforcement pass has been completed: phase gates now open after clearing each phase, enemy groups are tied to phase progress, and the boss now enters an enraged state mid-fight.
- The first class identity combat pass has been completed: each class now has a usable active dungeon skill on `F` with MP cost, cooldown, and distinct behavior tied to the current class.
- The skill panel readability pass has been completed: `K` now opens card-based city/dungeon skill windows with icons, clearer spacing, and non-overlapping active/passive/future skill presentation.
- The class-specific visual and active-skill integration pass has been completed: each class now uses different Tiny Swords player visuals, the active class skill is injected into the hotbar, and dungeon class skills now trigger Tiny Swords-based effect feedback.
- The dungeon return/hero creation correction pass has been completed: dungeon completion exits now support direct `Enter` confirmation again, and hero creation has been simplified back toward the intended isekai flow where the player mainly enters a name while class, stats, and starting loadout are randomized by fate.
- The hero creation simplification and exit reliability follow-up has been completed: the explicit Random Fate button has been removed so class/stat/loadout roll automatically on arrival, and dungeon return gates now use a safer transition path with larger prompt zones.
- The first combat realism pass has been completed: dungeon class skills now aim toward the mouse cursor instead of auto-targeting, enemies now apply defense/resist/variance against incoming damage, Tiny Swords enemy/loot visuals are integrated into the dungeon, and defeated enemies now drop manual world loot that must be picked up by moving to it.
- The horizontal dungeon combat/readability pass has been completed: the first dungeon now progresses to the right instead of only upward, enemies now show HP bars and use more distinct attack behavior by type, and manual loot drops now show clearer rarity/pickup feedback.
- The dungeon auto-return and visual dressing follow-up has been completed: cleared dungeon runs now auto-return to the city after 5 seconds, and the first horizontal dungeon now uses a stronger Tiny Swords tile/rock/shadow dressing pass so rooms and corridors feel less placeholder-heavy.
- The first item comparison/readability follow-up has been completed: city inventory tooltips now compare hovered gear against the equipped slot, dungeon loot dialogs preview reward contents with upgrade/sidegrade cues, and item dex bonuses now correctly affect movement speed.
- The first KO-style city service and quest readability pass has been completed: Potion Merchant, Blacksmith, Upgrader, and Quest Giver now open right-bottom service panels with real item/service entries instead of text-only dialogs; blacksmith entries show actual gear with damage/stat/buy/sell info, the upgrader now includes weapon enhancement plus class passive training, and city+dungeon quest lists now open with `Q`, support click selection, and show detailed quest content.
- The dungeon-to-city return stability pass has been completed: stale city UI references are now rebuilt safely on scene restart, so post-clear auto-return no longer crashes while refreshing right-bottom summaries or hotbar visuals.
- The quest-list visibility/layer cleanup pass has been completed: city and dungeon quest panels now initialize hidden reliably, no longer leak row cards into the HUD when closed, and the city quest list now behaves as a separate layer instead of fighting the right-bottom summary cards.
- The city readability/event-HUD pass has been completed: the right-bottom city status cards now stay hidden while idle and only flash when a meaningful event happens, while city service and quest menus now render higher and in the upper UI layer for cleaner readability.
- The first persistence and KO-style upgrade pass has been completed: browser save/continue now persists hero progress through local storage with a Continue Journey entry on hero creation, and the upgrader now supports blessed paper purchases plus KO-like weapon enhancement attempts with staged success rates and ritual feedback.
- The first true KO-style anvil pass has been completed: a physical Blessed Anvil now exists beside the upgrader, the upgrader service links into a dedicated forge screen, upgrade targets can be chosen from equipped or bag weapons, the forge tray now shows 6 ritual slots with paper loading and seal visuals, and upgrades still resolve through the staged paper-based KO percentage table.
- The first multi-dungeon Tiny Swords expansion pass has been completed: the city gate now opens a route-selection service with Forgotten Halls, Ashen Barracks, and Sunken Sanctum; the dungeon scene now supports multiple themed layout variants through one reusable pipeline; extra Tiny Swords visuals are now used in dungeon headers, parchment-style loot presentation, and environment dressing; and the return summary now reports the specific dungeon that was cleared or abandoned.
- The first route-loot and equipment economy follow-up has been completed: dungeon loot tables now react to the selected route, boss variants now gain lightweight stat/visual identity by dungeon, the blacksmith can now buy back bag equipment through service entries, and the Blessed Anvil can now upgrade all equipment slots instead of only weapons.
- The city inventory, class-scaling, and loot-identity pass has been completed: HP/MP potions now surface inside the city inventory as hotbar-assignable entries, upgraded gear now shows its `+` level in UI labels, Shift-gated item comparison and stat requirements now gate higher-tier equips, class AP scaling now respects Warrior STR / Rogue DEX / Mage MP / Archer DEX, inventory icons now prefer real Tiny Swords item icons, and dungeon boss attacks plus loot drops now carry stronger route-specific visual identity.
- The dungeon readability and completion-flow pass has been completed: city inventory hover state is now refreshed safely so Shift-compare updates live and stale inventory UI state is reset on scene recreation, the dungeon hotbar now renders MMO-style cooldown overlays and numeric countdowns for class skills, horizontal routes are now larger and denser with more mobs and broader chambers, and boss clears now route their final reward into a visible Victory Chest that returns the player to the city only after the chest is opened.
- The dungeon atmosphere and combat-readability follow-up pass has been completed: city-side consumable drag-drop groundwork is now active, dungeon runs now include Kekon Shaman and Kekon Brute archetypes plus route event nodes, the dungeon shell uses darker stone-room silhouettes with a slimmer overlay HUD and stronger bottom action bar, and dungeon objective/phase info now sits in a more compact top-right presentation instead of the older bulky panels.
- The first admin-editor and dungeon tuning foundation pass has been completed: a city-side Server Editor now controls shared game config values such as default dungeon difficulty, room mob min/max, boss HP tuning, and boss-chest quality thresholds; dungeon entry now supports Normal/Hard/Nightmare selection; combat rooms now roll dynamic 1-10 mob budgets and track total non-boss kills for boss-chest grading; enemy stats now scale from shared archetypes plus difficulty; bosses now shift through multiple power phases instead of only one enrage; and `Esc` now closes more open city/dungeon panels consistently.
- The editor has been separated into a dedicated tool-style scene instead of only living as a city service list: the new Server Editor window now has its own scene registration, portable JSON snapshot schema, save/load/export hooks, and a clean path toward a future standalone external multiplayer-admin executable.
- The editor has now been pushed one step further out of the game itself: a separate standalone `editor.html` admin app plus launcher script now exist, the game no longer exposes the editor through city interaction, and the editor profile can save/load/export/import and sync directly into the current game-save config so the same schema can later be packaged as a real external exe for multiplayer administration.
- The dungeon route recovery follow-up has been completed: the runtime spawn crash caused by the new dynamic spawn budget path has been fixed, enemy animations now initialize before dungeon enemies are created, and the city dungeon gate now exposes direct `Normal`, `Hard`, and `Nightmare` entries instead of a less obvious single difficulty-cycle row.
- The dungeon gate input polish pass has been completed: `Enter` now opens service-type interactables directly from proximity prompts, route entries now preserve their dungeon metadata so the right-side difficulty selector can render correctly, opening the gate panel now reveals the difficulty controls instead of hiding them again during panel visibility setup, and gate route confirms now close the city panel cleanly before starting the dungeon scene.
- The dungeon input follow-up has been completed: the basic attack trigger now comes from left mouse click instead of `Space`, the melee swipe now re-aims from the active cursor direction at click time, and the click-to-attack path is ignored while dialog, inventory, skill, or quest panels are open.
- The city inventory stability follow-up has been completed: opening inventory now force-closes conflicting city overlays first, hidden bag/equipment widgets now disable their input state instead of remaining invisibly clickable, inventory tooltips are cleared when the panel closes, and the class-combat pass has started with class-specific left-click basic attacks for warrior, rogue, mage, and archer.
- The dungeon/anvil recovery follow-up has been completed: dungeon interactables now accept `Enter` as a direct confirm path for chest and city-return actions, class skills now resolve through the current class definition with cursor-facing support and clearer no-MP feedback, enemy melee pressure now uses a more reliable attack range/cadence, the dungeon character panel no longer points at a missing UI bucket, and the KO-style anvil board no longer places its `Upgrade` button on top of the paper purchase/use rows.
- The second dungeon/anvil recovery follow-up has been completed: upgrade paper purchases now still succeed even when only the registry paper counter can be used, the KO anvil board refreshes city/inventory state immediately after paper buys, boss defeats now explicitly activate either legacy or patched victory-chest interactables, and the dungeon scene now has an extra scene-level `F` fallback plus wider enemy attack ranges so class skills and melee pressure remain responsive after recent user-side changes.
- The third dungeon/anvil recovery follow-up has been completed: dungeon hotbar slots now self-repair on entry so old malformed saves still get the current class skill in slot 1, number keys use a direct scene-level path into the dungeon hotbar executor, enemy AI now runs from the final patch layer with wider chase/attack ranges, boss victory chests are moved beside the defeated boss before activation, and the anvil board now has a visible close button in addition to ESC.
- The fourth dungeon recovery follow-up has been completed: the final dungeon patch layer now manually polls `1-6`, listens to slot keydown events, and adds a DOM fallback so hotbar skills trigger even when Phaser focus misses a key event; boss-clear runs can open the reward chest from `E` or `Enter` after the boss dies; enemies now patrol around their spawn area, chase the player, and attack from the final runtime layer instead of relying on older AI overrides.
- The first loot-progression expansion pass has been completed: class equipment pools now self-extend to 10 tiers for every class and every equipment slot, boss clears now grant a class-appropriate equipment item based on player level, dungeon route, and difficulty, and dungeon enemies now have spawn-area leash limits so patrol/chase behavior stays local instead of drifting across the map.
- The overworld/class-combat stabilization pass has been completed: Amasra field mobs now leash to their spawn area, normal slimes respawn after death, field gold/materials drop as world pickups instead of silently mutating inventory state, missing overworld loot now uses the real `addToInventory` path, and left-click basic attacks now respect class identity with Warrior/Rogue melee and Mage/Archer ranged behavior. Dungeon left-click combat and hotbar skills now use the same class range/type profile, while the old `F` class-skill trigger is no longer the primary dungeon activation path.
- The class identity, dungeon readability, and UI polish follow-up has been completed: class balance now applies distinct HP/MP/defense/speed/AP multipliers, generated and editor-template dungeons have stronger floor/wall/shadow/torch/boss-area dressing, the dungeon hotbar is larger with labels and cooldown overlays, and the skill panel now presents class role plus a cleaner two-column upgrade/hotbar assignment grid.
- The input/UI correction follow-up has been completed: Warrior/Rogue basic melee ranges were tightened, clicking a skill in the skill window now updates the main detail card to that skill, overworld hotbar skills now render and trigger as skills instead of only consumables, overworld activity feed now receives loot/hotbar/combat messages, and dungeon panel hotkeys are processed before panel-blocking movement logic so Inventory/Character/Skills/Quest can open and close inside dungeons.
- The dungeon error and panel cleanup pass has been completed: missing dungeon player animation helpers were restored, the victory reward panel no longer references an out-of-scope text helper, dungeon `I/C/K/Q` now open the real KO-style Inventory/Character/Skill/Quest panels instead of placeholder test panels, and overworld hotbar skills now use a nearest-target fallback inside skill range.
- The overworld hotbar/cooldown correction pass has been completed: skill slots now execute directly through scene skill handlers instead of generic consumable handling, overworld number keys are polled explicitly, skill cooldowns now draw a circular clock overlay with remaining seconds, and the old always-visible Quest Tracker HUD block has been removed.

## Next Suggested Steps

1. Deepen class identity further with secondary skills, passive progression, or class-specific resource hooks.
2. Continue UI cleanup and tooltip/comparison polish after validating the horizontal dungeon and new enemy HP/loot readability pass.
3. Expand manual loot presentation further with stronger item comparison, pickup messaging, and equipment preview polish.
4. Add the next dungeon variant after the current repeatable loop feels stable.
5. Revisit boss readability and telegraphing if the new ranged/melee boss attack mix needs more clarity.

## Rejected Approaches

- Building the whole game in one step.
- Heavy planning without implementation value.
- Unnecessary rewrites.
- Premature polish before core systems work.
