class PrototypeScene extends Phaser.Scene {
  constructor() {
    super("PrototypeScene");
    
    // Core properties
    this.activeInteractable = null;
    this.actionKeys = null;
    this.moveKeys = null;
    this.attackCooldownMs = 250;
    this.attackReadyAt = 0;
    this.cityBannerText = null;
    this.cityBannerHideEvent = null;
    this.cityFeedLines = [];
    this.cityProgressState = null;
    this.dialogElements = null;
    this.dialogOpen = false;
    this.hpValueText = null;
    this.goldValueText = null;
    this.hpBarFill = null;
    this.mpBarFill = null;
    this.interactables = [];
    this.interactionPrompt = null;
    this.obstacles = null;
    this.player = null;
    this.playerFacing = new Phaser.Math.Vector2(0, -1);
    this.playerSpeed = 180;
    this.potionValueText = null;
    this.powerValueText = null;
    this.mpValueText = null;
    this.questPanelLines = [];
    this.rewardPanelLines = [];
    this.rewardPanelElements = [];
    this.questTrackerElements = [];
    this.hotbarSlotVisuals = [];
    
    // UI Panel states
    this.inventoryOpen = false;
    this.inventoryElements = null;
    this.inventoryGridSlots = [];
    this.inventoryGridIcons = [];
    this.inventoryGridCounts = [];
    this.inventoryDisplayEntries = [];
    this.inventoryHoverState = null;
    this.inventoryCompareState = false;
    this.inventoryEquipSlots = [];
    this.inventoryEquipIcons = [];
    this.inventoryEquipLabels = [];
    this.inventoryEquipItemTexts = [];
    
    this.characterOpen = false;
    this.characterElements = null;
    this.characterStatButtons = [];
    this.characterEquipSlots = [];
    this.characterStaticTexts = null;
    this.characterBonusEntries = [];
    this.characterBonusScrollIndex = 0;
    this.characterWheelBound = false;
    
    this.skillPanelOpen = false;
    this.skillPanelElements = null;
    
    // Service panels
    this.servicePanelOpen = false;
    this.servicePanelElements = null;
    this.serviceEntryRows = [];
    this.currentServiceType = null;
    this.currentServiceInteractable = null;
    this.currentServiceEntries = [];
    this.selectedServiceIndex = 0;
    
    this.anvilPanelOpen = false;
    this.anvilPanelElements = null;
    this.anvilWeaponRows = [];
    this.anvilSlotVisuals = [];
    this.anvilButtonVisuals = {};
    this.currentAnvilWeapons = [];
    this.selectedAnvilWeaponKey = null;
    this.anvilScrollLoaded = false;
    
    // Quest system
    this.questListOpen = false;
    this.questListElements = null;
    this.questListEntryRows = [];
    this.currentQuestEntries = [];
    this.selectedQuestIndex = 0;
    
    // Other
    this.domHotkeyHandler = null;
    this.sceneHotkeyHandlers = null;
    this.hotkeyHandledUntil = 0;
    this.inventoryTooltipElements = null;
    this.cityDragDropBound = false;
    this.cityDragGhost = null;
    this.rightPanelHideEvent = null;
    this.upgradeRitualActive = false;
    this.upgradeRitualElements = [];
    
    // Module references
    this.uiManager = null;
    this.npcManager = null;
    this.inputManager = null;
    this.cityLayout = null;
    this.playerManager = null;
    this.questManager = null;
    this.serviceManager = null;
  }

  preload() {
    // Load core assets
    this.load.image("panel_main", "assets/ui/kenney/panel_main.png");
    this.load.image("panel_line", "assets/ui/kenney/panel_line.png");
    this.load.image("panel_alt", "assets/ui/kenney/panel_alt.png");
    this.load.image("panel_dark", "assets/ui/tiny-swords/panel_dark.png");
    this.load.image("panel_light", "assets/ui/tiny-swords/panel_light.png");
    this.load.image("slot_normal", "assets/ui/tiny-swords/slot_normal.png");
    this.load.image("slot_active", "assets/ui/tiny-swords/slot_active.png");
    this.load.image("icon_01", "assets/ui/tiny-swords/icon_01.png");
    this.load.image("icon_02", "assets/ui/tiny-swords/icon_02.png");
    this.load.image("icon_03", "assets/ui/tiny-swords/icon_03.png");
    this.load.image("icon_04", "assets/ui/tiny-swords/icon_04.png");
    this.load.image("icon_05", "assets/ui/tiny-swords/icon_05.png");
    this.load.image("icon_06", "assets/ui/tiny-swords/icon_06.png");
    this.load.image("icon_08", "assets/ui/tiny-swords/icon_08.png");
    this.load.image("icon_10", "assets/ui/tiny-swords/icon_10.png");
    this.load.image("icon_11", "assets/ui/tiny-swords/icon_11.png");
    this.load.image("icon_12", "assets/ui/tiny-swords/icon_12.png");
    
    this.load.spritesheet("ribbons_small_sheet", "assets/ui/tiny-swords/ribbons_small.png", {
      frameWidth: 320,
      frameHeight: 64,
    });
    this.load.spritesheet("player_idle_sheet", "assets/sprites/units/player_idle.png", {
      frameWidth: 192,
      frameHeight: 192,
    });
    this.load.spritesheet("player_run_sheet", "assets/sprites/units/player_run.png", {
      frameWidth: 192,
      frameHeight: 192,
    });
    
    // Load building assets
    this.load.image("bld_blacksmith", "assets/buildings/city_blacksmith.png");
    this.load.image("bld_potion", "assets/buildings/city_house_potion.png");
    this.load.image("bld_quest", "assets/buildings/city_quest.png");
    this.load.image("bld_upgrader", "assets/buildings/city_upgrader.png");
    this.load.image("bld_gate", "assets/buildings/city_gate.png");
  }

  create(data) {
    const { width, height } = this.scale;
    const spawnPoint = data?.spawn ?? { x: width / 2, y: height - 120 };
    const returnState = data?.dungeonReturn ?? null;
    this.returnSpawn = data?.returnSpawn ?? { x: width / 2, y: height - 120 };

    // Reset states
    this.activeInteractable = null;
    this.dialogOpen = false;
    this.interactables = [];
    this.attackReadyAt = 0;
    this.servicePanelOpen = false;
    this.servicePanelElements = null;
    this.serviceEntryRows = [];
    this.currentServiceType = null;
    this.currentServiceInteractable = null;
    this.currentServiceEntries = [];
    this.selectedServiceIndex = 0;
    this.anvilPanelOpen = false;
    this.anvilPanelElements = null;
    this.anvilWeaponRows = [];
    this.anvilSlotVisuals = [];
    this.anvilButtonVisuals = {};
    this.currentAnvilWeapons = [];
    this.selectedAnvilWeaponKey = null;
    this.anvilScrollLoaded = false;
    this.questListOpen = false;
    this.questListElements = null;
    this.questListEntryRows = [];
    this.currentQuestEntries = [];
    this.selectedQuestIndex = 0;
    this.cityFeedLines = [];
    this.questPanelLines = [];
    this.rewardPanelLines = [];
    this.rewardPanelElements = [];
    this.questTrackerElements = [];
    this.hotbarSlotVisuals = [];
    this.inventoryOpen = false;
    this.inventoryElements = null;
    this.inventoryGridSlots = [];
    this.inventoryGridIcons = [];
    this.inventoryGridCounts = [];
    this.inventoryEquipSlots = [];
    this.inventoryEquipIcons = [];
    this.inventoryEquipLabels = [];
    this.inventoryEquipItemTexts = [];
    this.inventoryTooltipElements = null;
    this.cityDragGhost = null;
    this.inventoryDisplayEntries = [];
    this.inventoryHoverState = null;
    this.inventoryCompareState = false;
    this.upgradeRitualActive = false;
    this.upgradeRitualElements = [];

    // Initialize modules
    this.initModules();
    
    // Initialize game state
    this.initSharedState();
    GameState.attachAutoSave?.(this, this.registry);
    this.playerSpeed = this.getPlayerSpeed();
    this.cityProgressState = this.buildCityProgressState(returnState);

    // Setup scene
    this.cameras.main.setBackgroundColor("#182430");
    this.physics.world.setBounds(48, 48, width - 96, height - 96);

    // Create city layout
    this.cityLayout.drawGround(width, height);
    this.cityLayout.drawRoads(width, height);
    this.cityLayout.createCollisionBlocks();
    this.cityLayout.drawServiceAreas();
    this.cityLayout.drawProps();
    
    // Create animations
    this.createAnimations();
    
    // Create NPCs
    this.npcManager.createNpcLayer();
    
    // Create player
    this.playerManager.createPlayer(spawnPoint.x, spawnPoint.y);
    
    // Setup input
    this.inputManager.createInput();
    this.input.mouse.disableContextMenu();
    
    // Create UI
    this.uiManager.drawCityHeader(width);
    this.uiManager.drawUiLayer(width, height);
    this.uiManager.createInteractionUi(width, height);
    
    // Apply return state
    this.applyCityReturnState(returnState);
    
    // Setup wheel event for character panel
    if (!this.characterWheelBound) {
      this.input.on("wheel", this.handleCharacterBonusWheel, this);
      this.characterWheelBound = true;
    }
    
    // Setup drag and drop
    this.setupCityInventoryDragDrop();
  }

  update() {
    if (!this.player || !this.moveKeys) return;

    // Handle upgrade ritual
    if (this.upgradeRitualActive) {
      this.player.body.setVelocity(0, 0);
      this.setPlayerAnimation(false);
      return;
    }

    // Handle dialog
    if (this.dialogOpen) {
      this.player.body.setVelocity(0, 0);

      if (this.activeInteractable?.onConfirm && Phaser.Input.Keyboard.JustDown(this.actionKeys.confirm)) {
        this.activeInteractable.onConfirm();
        return;
      }
      if (Phaser.Input.Keyboard.JustDown(this.actionKeys.interact) || Phaser.Input.Keyboard.JustDown(this.actionKeys.close)) {
        this.closeDialog();
      }
      return;
    }

    // Handle service panel
    if (this.servicePanelOpen) {
      this.player.body.setVelocity(0, 0);
      this.setPlayerAnimation(false);
      if (this.currentServiceType === "anvil" && Phaser.Input.Keyboard.JustDown(this.actionKeys.confirm)) {
        this.handleAnvilUpgradeConfirm();
      } else if (Phaser.Input.Keyboard.JustDown(this.actionKeys.confirm)) {
        this.confirmSelectedServiceEntry();
      }
      if (Phaser.Input.Keyboard.JustDown(this.actionKeys.interact) || Phaser.Input.Keyboard.JustDown(this.actionKeys.close)) {
        this.closeServicePanel();
      }
      return;
    }

    // Handle global panel close
    if (Phaser.Input.Keyboard.JustDown(this.actionKeys.close) && this.handleGlobalPanelClose()) {
      return;
    }

    // Handle movement
    this.handleMovement();
    this.handleHotbarKeys();

    // Handle UI hotkeys
    if (Phaser.Input.Keyboard.JustDown(this.actionKeys.inventory)) {
      this.tryTriggerUiHotkey("i");
    }
    if (Phaser.Input.Keyboard.JustDown(this.actionKeys.character)) {
      this.tryTriggerUiHotkey("c");
    }
    if (Phaser.Input.Keyboard.JustDown(this.actionKeys.skills)) {
      this.tryTriggerUiHotkey("k");
    }
    if (Phaser.Input.Keyboard.JustDown(this.actionKeys.questList)) {
      this.tryTriggerUiHotkey("q");
    }

    // Update UI
    this.refreshHoveredInventoryTooltip();
    this.updateInteractionPrompt();
    this.updateMinimapPlayerMarker();

    // Handle interactions
    if (this.activeInteractable && Phaser.Input.Keyboard.JustDown(this.actionKeys.confirm)) {
      if (this.activeInteractable.serviceType) {
        this.openServicePanel(this.activeInteractable);
      } else if (this.activeInteractable.quickConfirm && this.activeInteractable.onConfirm) {
        this.activeInteractable.onConfirm();
      } else {
        this.openDialog(this.activeInteractable);
      }
      return;
    }

    if (this.activeInteractable && Phaser.Input.Keyboard.JustDown(this.actionKeys.interact)) {
      this.openDialog(this.activeInteractable);
    }
  }

  // ==================== MODULE INITIALIZATION ====================
  
  initModules() {
    // Initialize modules
    this.uiManager = new UIManager(this);
    this.npcManager = new NpcManager(this);
    this.inputManager = new InputManager(this);
    this.cityLayout = new CityLayout(this);
    this.playerManager = new PlayerManager(this);
    this.questManager = new QuestManager(this);
    this.serviceManager = new ServiceManager(this);
  }

  // ==================== CORE METHODS ====================
  
  initSharedState() {
    if (this.registry.get("gold") === undefined) this.registry.set("gold", 25);
    if (this.registry.get("dungeonCycles") === undefined) this.registry.set("dungeonCycles", 0);
    if (this.registry.get("questState") === undefined) this.registry.set("questState", "not_accepted");
    if (this.registry.get("healthPotionCount") === undefined) this.registry.set("healthPotionCount", 0);
    if (this.registry.get("mpPotionCount") === undefined) this.registry.set("mpPotionCount", 0);
    if (this.registry.get("citySpendResult") === undefined) this.registry.set("citySpendResult", "No city spending yet.");
    if (this.registry.get("playerPowerTier") === undefined) this.registry.set("playerPowerTier", 1);
    if (this.registry.get("repeatObjectiveState") === undefined) this.registry.set("repeatObjectiveState", "inactive");
    if (this.registry.get("repeatObjectiveCompletions") === undefined) this.registry.set("repeatObjectiveCompletions", 0);
    if (this.registry.get("totalEnemyDefeats") === undefined) this.registry.set("totalEnemyDefeats", 0);
    if (this.registry.get("repeatObjectiveProgress") === undefined) this.registry.set("repeatObjectiveProgress", 0);
    if (this.registry.get("maxHpBonus") === undefined) this.registry.set("maxHpBonus", 0);
    if (this.registry.get("cycleObjectiveState") === undefined) this.registry.set("cycleObjectiveState", "inactive");
    if (this.registry.get("cycleObjectiveProgress") === undefined) this.registry.set("cycleObjectiveProgress", 0);
    if (this.registry.get("cycleObjectiveCompletions") === undefined) this.registry.set("cycleObjectiveCompletions", 0);
    if (this.registry.get("classTrainingLevel") === undefined) this.registry.set("classTrainingLevel", 0);
    if (this.registry.get("weaponUpgradePaperCount") === undefined) this.registry.set("weaponUpgradePaperCount", 0);

    GameState.smoothTransitionToNewSystem?.(this.registry);

    if (!this.registry.get("characterName")) {
      const defaultClass = GameState.DEFAULT_CLASS;
      const defaultStats = GameState.generateRandomStats();
      const defaultEquipment = {};
      GameState.EQUIP_SLOTS.forEach((slot) => {
        defaultEquipment[slot] = GameState.pickRandomEquipment(defaultClass, slot);
      });
      GameState.createCharacter(this.registry, "Hero", defaultClass, defaultStats, defaultEquipment);
    }

    GameState.initHotbarSlots?.(this.registry);
    GameState.ensureCoreStats?.(this.registry);
    GameState.initInventory?.(this.registry);
    GameState.ensureGameConfig?.(this.registry);
  }

  getCurrentMaxHp() { return GameState.getMaxHp(this.registry); }
  getCurrentMaxMp() { return GameState.getMaxMp(this.registry); }
  getWeaponAp() { return GameState.getWeaponAp(this.registry); }
  getPlayerSpeed() { return GameState.getPlayerSpeed(this.registry); }

  getRepeatObjectiveTarget() { return 8; }
  getCycleObjectiveTarget() { return 2; }
  getQuestRewardGold() { return 18; }
  getRepeatObjectiveRewardGold() { return 14; }
  getCycleObjectiveRewardGold() { return 22; }
  getPotionCost() { return 20; }
  getMpPotionCost() { return 30; }

  getUpgradeCost() {
    return 30 + (this.registry.get("playerPowerTier") - 1) * 15;
  }

  getBlacksmithCost() {
    return 24 + (this.registry.get("maxHpBonus") / 20) * 12;
  }

  calculatePreparationBonus({ potionDelta = 0, powerDelta = 0, hpBonusDelta = 0 } = {}) {
    const powerTier = this.registry.get("playerPowerTier") + powerDelta;
    const potionCount = Math.max(0, this.registry.get("healthPotionCount") + potionDelta);
    const maxHpBonus = this.registry.get("maxHpBonus") + hpBonusDelta;
    return Math.max(0, powerTier - 1) * 2 + Math.floor(maxHpBonus / 20) * 2 + Math.min(2, potionCount);
  }

  tryAllocateStat(statKey) {
    if (!GameState.allocateStatPoint(this.registry, statKey)) return;
    this.playerSpeed = this.getPlayerSpeed();
    this.refreshCityUi();
    if (this.characterOpen) this.refreshCharacterPanel();
  }

  // ==================== ANIMATIONS ====================
  
  createAnimations() {
    // Player animations
    this.anims.create({
      key: "player-idle",
      frames: this.anims.generateFrameNumbers("player_idle_sheet", { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1,
    });
    
    this.anims.create({
      key: "player-run",
      frames: this.anims.generateFrameNumbers("player_run_sheet", { start: 0, end: 5 }),
      frameRate: 12,
      repeat: -1,
    });
  }

  setPlayerAnimation(isRunning, directionX = 0) {
    if (!this.player) return;
    
    if (isRunning) {
      this.player.play("player-run", true);
      if (directionX !== 0) {
        this.player.setFlipX(directionX < 0);
      }
    } else {
      this.player.play("player-idle", true);
    }
  }

  // ==================== MOVEMENT ====================
  
  handleMovement() {
    let horizontal = 0;
    let vertical = 0;

    if (this.moveKeys.left.isDown || this.moveKeys.a.isDown) horizontal -= 1;
    if (this.moveKeys.right.isDown || this.moveKeys.d.isDown) horizontal += 1;
    if (this.moveKeys.up.isDown || this.moveKeys.w.isDown) vertical -= 1;
    if (this.moveKeys.down.isDown || this.moveKeys.s.isDown) vertical += 1;

    const direction = new Phaser.Math.Vector2(horizontal, vertical);

    if (direction.lengthSq() > 0) {
      this.playerFacing = direction.clone().normalize();
      direction.normalize().scale(this.playerSpeed);
      this.player.body.setVelocity(direction.x, direction.y);
      this.setPlayerAnimation(true, direction.x);
    } else {
      this.player.body.setVelocity(0, 0);
      this.setPlayerAnimation(false);
    }
  }

  // ==================== HOTBAR ====================
  
  handleHotbarKeys() {
    // Handle hotbar keys 1-6
    for (let i = 0; i < 6; i++) {
      const keyCode = Phaser.Input.Keyboard.KeyCodes[`${i + 1}`];
      if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey(keyCode))) {
        this.useHotbarSlot(i);
      }
    }
  }

  useHotbarSlot(index) {
    // Implement hotbar slot usage
    console.log(`Using hotbar slot ${index}`);
  }

  // ==================== UI HOTKEYS ====================
  
  tryTriggerUiHotkey(key) {
    switch (key) {
      case "i":
        this.toggleInventoryPanel();
        break;
      case "c":
        this.toggleCharacterPanel();
        break;
      case "k":
        this.toggleSkillPanel();
        break;
      case "q":
        this.toggleQuestList();
        break;
    }
  }

  // ==================== PANEL MANAGEMENT ====================
  
  handleGlobalPanelClose() {
    if (this.questListOpen) {
      this.questListOpen = false;
      this.setQuestListVisible(false);
      return true;
    }
    if (this.skillPanelOpen) {
      this.skillPanelOpen = false;
      this.hideSkillPanel?.();
      return true;
    }
    if (this.characterOpen) {
      this.characterOpen = false;
      this.hideCharacterPanel?.();
      return true;
    }
    if (this.inventoryOpen) {
      this.hideInventoryPanel?.();
      return true;
    }
    return false;
  }

  // ==================== CITY RETURN STATE ====================
  
  applyCityReturnState(returnState) {
    if (!returnState) return;
    
    if (returnState.cleared) {
      this.showCityBanner("Dungeon Cleared", `+${returnState.goldGained || 0} Gold`, 3000);
    }
  }

  showCityBanner(title, subtitle, duration = 2000) {
    // Implement banner display
    console.log(`Showing banner: ${title} - ${subtitle}`);
  }

  // ==================== DIALOG MANAGEMENT ====================
  
  openDialog(interactable) {
    this.dialogOpen = true;
    this.activeInteractable = interactable;
    
    // Implement dialog opening
    console.log(`Opening dialog for ${interactable.name}`);
  }

  closeDialog() {
    this.dialogOpen = false;
    this.activeInteractable = null;
    
    // Implement dialog closing
    console.log("Closing dialog");
  }

  // ==================== SERVICE PANEL ====================
  
  openServicePanel(interactable) {
    this.servicePanelOpen = true;
    this.currentServiceInteractable = interactable;
    this.currentServiceType = interactable.serviceType;
    
    // Implement service panel opening
    console.log(`Opening service panel for ${interactable.name}`);
  }

  closeServicePanel() {
    this.servicePanelOpen = false;
    this.currentServiceInteractable = null;
    this.currentServiceType = null;
    this.currentServiceEntries = [];
    this.selectedServiceIndex = 0;
    
    // Implement service panel closing
    console.log("Closing service panel");
  }

  confirmSelectedServiceEntry() {
    // Implement service entry confirmation
    console.log("Confirming service entry");
  }

  handleAnvilUpgradeConfirm() {
    // Implement anvil upgrade confirmation
    console.log("Confirming anvil upgrade");
  }

  // ==================== INVENTORY DRAG & DROP ====================
  
  setupCityInventoryDragDrop() {
    // Implement drag and drop setup
    console.log("Setting up inventory drag and drop");
  }

  // ==================== EDITOR TOOL ====================
  
  openEditorTool() {
    window.open("editor.html", "_blank");
  }

  // ==================== HELPER METHODS ====================
  
  refreshHoveredInventoryTooltip() {
    // Implement tooltip refresh
  }

  updateInteractionPrompt() {
    // Implement interaction prompt update
  }

  updateMinimapPlayerMarker() {
    // Implement minimap update
  }

  refreshCityUi() {
    // Implement UI refresh
  }

  // ==================== CITY PROGRESS / QUEST STATE BUILDERS ====================
  
  buildCityProgressState(returnState) {
    const cycleCount = returnState?.cycleCount ?? this.registry.get("dungeonCycles");
    const prepBonus = this.calculatePreparationBonus();
    const baseState = {
      cleared: false, goldGained: 0, materials: [], cycleCount,
      statusText: "No recent clear",
      progressText: `Cycle ${cycleCount}: complete a dungeon run to update progression.`,
      serviceHint: prepBonus > 0 ? `Prepared run bonus is now +${prepBonus} on clear.` : "City services will start shaping dungeon rewards after upgrades.",
      nextActionText: this.buildNextActionText(returnState),
    };
    
    if (!returnState) return baseState;
    
    if (!returnState.cleared) {
      return { 
        ...baseState, 
        statusText: "Run Incomplete", 
        progressText: `Cycle ${cycleCount}: no completion rewards recorded yet.`, 
        serviceHint: prepBonus > 0 ? `Prepared run bonus remains +${prepBonus} for the next clear.` : "Clear the full dungeon route to unlock city follow-up.", 
        nextActionText: this.buildNextActionText(returnState) 
      };
    }
    
    return { 
      cleared: true, 
      goldGained: returnState.goldGained ?? 0, 
      materials: returnState.materials ?? [], 
      cycleCount, 
      statusText: "Dungeon Cleared", 
      progressText: cycleCount > 1 ? `Cycle ${cycleCount}: repeatable loop active.` : "Cycle 1: run completed. Progress updated.", 
      serviceHint: prepBonus > 0 ? `Prepared run bonus is now +${prepBonus} on clear.` : "Rewards can now be used at future city services.", 
      nextActionText: this.buildNextActionText(returnState) 
    };
  }

  buildNextActionText(returnState = null) {
    const qs = this.registry.get("questState");
    const ros = this.registry.get("repeatObjectiveState");
    const cos = this.registry.get("cycleObjectiveState");
    const gold = this.registry.get("gold");
    const canUseService = gold >= this.getPotionCost() || gold >= this.getBlacksmithCost() || gold >= this.getUpgradeCost();
    
    if (qs === "not_accepted") return "Next: Talk to the Quest Giver.";
    if (qs === "ready_to_turn_in" || ros === "ready_to_turn_in" || cos === "ready_to_turn_in") return "Next: Turn in the objective at the Quest Giver.";
    if (qs === "active") return "Next: Enter the dungeon and clear the route.";
    if (returnState?.cleared && canUseService) return "Next: Spend gold in the city or re-enter the dungeon.";
    if (qs === "completed") return "Next: Re-enter the dungeon and grow the loop.";
    
    return "Next: Explore the city hub.";
  }

  // ==================== CHARACTER PANEL WHEEL ====================
  
  handleCharacterBonusWheel(pointer, gameObjects, deltaX, deltaY) {
    if (!this.characterOpen) return;
    
    this.characterBonusScrollIndex = Math.max(0, Math.min(
      this.characterBonusEntries.length - 1,
      this.characterBonusScrollIndex + (deltaY > 0 ? 1 : -1)
    ));
    
    this.refreshCharacterPanel();
  }
}

// Export the scene
export { PrototypeScene };
window.PrototypeScene = PrototypeScene;