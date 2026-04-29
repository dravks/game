// Main PrototypeScene class that imports all modules
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

    // Visible town NPC sprite. Used by NpcManager for service NPCs.
    this.load.spritesheet("npc_pawn_idle_sheet", "assets/sprites/units/npc_pawn_idle.png", {
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
    
    // Initialize UI Manager (create and register panels)
    if (this.uiManager) {
      this.uiManager.init();
      console.log("UIManager initialized and panels registered");
    }
    
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
    
    // Focus canvas for keyboard input
    if (this.game?.canvas) {
      this.game.canvas.focus();
      this.game.canvas.setAttribute("tabindex", "0");
    }
    
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
    this.createCityExitGate();
  }

  update() {
    if (!this.player || !this.moveKeys) return;

    // Handle upgrade ritual
    if (this.upgradeRitualActive) {
      this.player.body.setVelocity(0,0);
      this.setPlayerAnimation(false);
      return;
    }

    // Handle dialog
    if (this.dialogOpen) {
      this.player.body.setVelocity(0,0);

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
      this.player.body.setVelocity(0,0);
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
    if (this.actionKeys.map && Phaser.Input.Keyboard.JustDown(this.actionKeys.map)) {
      this.toggleWorldMap();
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
    try {
      this.npcManager = new NpcManager(this);
      console.log("NpcManager initialized");
    } catch (e) {
      console.error("Error initializing NpcManager:", e);
    }
    try {
      this.inputManager = new InputManager(this);
      console.log("InputManager initialized");
    } catch (e) {
      console.error("Error initializing InputManager:", e);
    }
    try {
      this.cityLayout = new CityLayout(this);
      console.log("CityLayout initialized");
    } catch (e) {
      console.error("Error initializing CityLayout:", e);
    }
    try {
      this.playerManager = new PlayerManager(this);
      console.log("PlayerManager initialized");
    } catch (e) {
      console.error("Error initializing PlayerManager:", e);
    }
    try {
      this.questManager = new QuestManager(this);
      console.log("QuestManager initialized");
    } catch (e) {
      console.error("Error initializing QuestManager:", e);
    }
    try {
      this.serviceManager = new ServiceManager(this);
      console.log("ServiceManager initialized");
    } catch (e) {
      console.error("Error initializing ServiceManager:", e);
    }
    try {
      this.uiManager = new UIManager(this);
      console.log("UIManager initialized");
    } catch (e) {
      console.error("Error initializing UIManager:", e);
    }
  }

  // ==================== CORE METHODS ====================  
  initSharedState() {
    if (this.registry.get("gold") === undefined) this.registry.set("gold", 25);
    if (this.registry.get("dungeonCycles") === undefined) this.registry.set("dungeonCycles",0);
    if (this.registry.get("questState") === undefined) this.registry.set("questState", "not_accepted");
    if (this.registry.get("healthPotionCount") === undefined) this.registry.set("healthPotionCount",0);
    if (this.registry.get("mpPotionCount") === undefined) this.registry.set("mpPotionCount",0);
    if (this.registry.get("citySpendResult") === undefined) this.registry.set("citySpendResult", "No city spending yet.");
    if (this.registry.get("playerPowerTier") === undefined) this.registry.set("playerPowerTier",1);
    if (this.registry.get("repeatObjectiveState") === undefined) this.registry.set("repeatObjectiveState", "inactive");
    if (this.registry.get("repeatObjectiveCompletions") === undefined) this.registry.set("repeatObjectiveCompletions",0);
    if (this.registry.get("totalEnemyDefeats") === undefined) this.registry.set("totalEnemyDefeats",0);
    if (this.registry.get("repeatObjectiveProgress") === undefined) this.registry.set("repeatObjectiveProgress",0);
    if (this.registry.get("maxHpBonus") === undefined) this.registry.set("maxHpBonus",0);
    if (this.registry.get("cycleObjectiveState") === undefined) this.registry.set("cycleObjectiveState", "inactive");
    if (this.registry.get("cycleObjectiveProgress") === undefined) this.registry.set("cycleObjectiveProgress",0);
    if (this.registry.get("cycleObjectiveCompletions") === undefined) this.registry.set("cycleObjectiveCompletions",0);
    if (this.registry.get("classTrainingLevel") === undefined) this.registry.set("classTrainingLevel",0);
    if (this.registry.get("weaponUpgradePaperCount") === undefined) this.registry.set("weaponUpgradePaperCount",0);

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
      this.player.body.setVelocity(0,0);
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
        this.uiManager.toggleInventoryPanel();
        break;
      case "c":
        this.uiManager.toggleCharacterPanel();
        break;
      case "k":
        this.uiManager.toggleSkillPanel();
        break;
      case "q":
        this.uiManager.toggleQuestList();
        break;
    }
  }

  // ==================== PANEL MANAGEMENT ====================  
  handleGlobalPanelClose() {
    if (this.questListOpen) {
      this.questListOpen = false;
      this.uiManager.setQuestListVisible(false);
      return true;
    }
    if (this.skillPanelOpen) {
      this.skillPanelOpen = false;
      this.uiManager.hideSkillPanel?.();
      return true;
    }
    if (this.characterOpen) {
      this.characterOpen = false;
      this.uiManager.hideCharacterPanel?.();
      return true;
    }
    if (this.inventoryOpen) {
      this.uiManager.hideInventoryPanel?.();
      return true;
    }
    return false;
  }

  // ==================== CITY RETURN STATE ====================  
  applyCityReturnState(returnState) {
    if (!returnState) return;
    
    if (returnState.cleared) {
      const itemText = returnState.rewardItemName ? ` | ${returnState.rewardItemName}` : "";
      this.showCityBanner("Dungeon Cleared", `+${returnState.goldGained || 0} Gold${itemText}`, 3000);
      if (returnState.rewardItemName) this.pushActivityFeed(`Loot: ${returnState.rewardItemName}`);
      (returnState.materials || []).forEach((mat) => this.pushActivityFeed(`Material: ${mat.name} x${mat.amount}`));
      if (returnState.xpGained) this.pushActivityFeed(`XP: +${returnState.xpGained}`);
    }
    this.refreshCityUi();
    window.GameState?.saveProgress?.(this.registry);
  }

  createCityExitGate() {
    const x = this.scale.width / 2;
    const y = 82;
    const gate = this.add.rectangle(x, y, 190, 44, 0x314554, 0.72)
      .setStrokeStyle(2, 0xf4df9c, 0.85)
      .setDepth(7);
    this.add.text(x, y, "Amasra Gate", {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "14px",
      color: "#f8f1dc",
      stroke: "#000",
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(8);
    this.interactables.push({
      x,
      y,
      name: "Amasra",
      serviceType: "field_gate",
      radius: 86,
      clickRadius: 100,
      onConfirm: () => this.scene.start("OverworldScene"),
    });
    gate.setInteractive({ useHandCursor: true }).on("pointerdown", () => this.scene.start("OverworldScene"));
  }

  showCityBanner(title, subtitle, duration = 2000) {
    console.log(`Showing banner: ${title} - ${subtitle}`);
    this.pushActivityFeed(`${title}${subtitle ? `: ${subtitle}` : ""}`);
  }

  pushActivityFeed(message) {
    if (!message) return;
    this.activityFeed = [String(message), ...(this.activityFeed || [])].slice(0, 5);
    (this.activityFeedTexts || []).forEach((text, index) => {
      text.setText(this.activityFeed[index] || "");
      text.setAlpha(this.activityFeed[index] ? 1 : 0.25);
    });
  }

  // ==================== DIALOG MANAGEMENT ====================  
  openDialog(interactable) {
    if (!interactable) return;

    if (this.npcManager?.openDialog) {
      this.npcManager.openDialog(interactable);
      return;
    }

    this.dialogOpen = true;
    this.activeInteractable = interactable;
    console.log(`Opening dialog for `);
  }

  closeDialog() {
    if (this.npcManager?.closeDialog) {
      this.npcManager.closeDialog();
      return;
    }

    this.dialogOpen = false;
    this.activeInteractable = null;
    console.log("Closing dialog");
  }

  // ==================== SERVICE PANEL ====================  
  openServicePanel(interactable) {
    this.serviceManager.openServicePanel(interactable);
  }

  closeServicePanel() {
    this.serviceManager.closeServicePanel();
  }

  confirmSelectedServiceEntry() {
    this.serviceManager.confirmSelectedServiceEntry();
  }

  handleAnvilUpgradeConfirm() {
    this.serviceManager?.confirmSelectedServiceEntry?.();
  }

  // ==================== INVENTORY DRAG & DROP (Knight Online Style) ====================  
  setupCityInventoryDragDrop() {
    // Knight Online-style drag and drop system
    this.input.on("dragstart", (pointer, gameObject) => {
      if (!this.inventoryOpen) return;
      
      // Create drag ghost
      if (this.cityDragGhost) this.cityDragGhost.destroy();
      
      const item = gameObject.getData("item");
      if (!item) return;
      
      this.cityDragGhost = this.add.image(pointer.x, pointer.y, gameObject.texture.key)
        .setScale(gameObject.scaleX)
        .setTint(gameObject.tintTopLeft)
        .setAlpha(0.8)
        .setDepth(1000000)
        .setScrollFactor(0);
      
      gameObject.setAlpha(0.3);
    });

    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      if (this.cityDragGhost) {
        this.cityDragGhost.setPosition(pointer.x, pointer.y);
      }
    });

    this.input.on("dragend", (pointer, gameObject) => {
      if (this.cityDragGhost) {
        this.cityDragGhost.destroy();
        this.cityDragGhost = null;
      }
      gameObject.setAlpha(1);
    });

    this.input.on("drop", (pointer, gameObject, dropZone) => {
      const sourceItem = gameObject.getData("item");
      const sourceIndex = gameObject.getData("inventoryIndex");
      const sourceSlot = gameObject.getData("equipmentSlot");
      
      if (!sourceItem) return;
      
      // Dropped on equipment slot
      if (dropZone?.getData("equipmentSlot")) {
        const targetSlot = dropZone.getData("equipmentSlot");
        this.handleInventoryItemDrop(sourceItem, sourceIndex, sourceSlot, targetSlot);
      }
      // Dropped on inventory grid
      else if (dropZone?.getData("inventoryIndex") !== undefined) {
        const targetIndex = dropZone.getData("inventoryIndex");
        this.handleInventoryItemDrop(sourceItem, sourceIndex, sourceSlot, null, targetIndex);
      }
    });

    console.log("[PrototypeScene] Knight Online-style drag and drop initialized");
  }

  handleInventoryItemDrop(sourceItem, sourceIndex, sourceSlot, targetSlot = null, targetIndex = null) {
    // Handle item drop logic (Knight Online style)
    console.log("[PrototypeScene] Item dropped:", sourceItem.name, "from", sourceSlot || sourceIndex, "to", targetSlot || targetIndex);
    
    // If dropping to equipment slot
    if (targetSlot && sourceItem.slot === targetSlot) {
      if (sourceSlot) {
        // Unequip from sourceSlot to inventory
        if (GameState.unequipToInventory(this.registry, sourceSlot)) {
          this.showCityBanner(`Unequipped ${sourceItem.name}`);
          this.refreshInventoryUI();
        }
      } else if (sourceIndex !== null && sourceIndex !== undefined) {
        // Equip from inventory to targetSlot
        const result = GameState.equipFromInventory(this.registry, sourceIndex);
        if (result.ok) {
          this.showCityBanner(`Equipped ${sourceItem.name}`);
          this.refreshInventoryUI();
        } else if (result.reason === "requirement") {
          this.showCityBanner(`Cannot equip: ${result.requirement.statLabel} ${result.requirement.value} needed`);
        }
      }
    } else if (targetIndex !== null && targetIndex !== undefined) {
      // Move within inventory (swap items)
      const inventory = [...GameState.getInventoryItems(this.registry)];
      const targetItem = inventory[targetIndex];
      
      inventory[targetIndex] = sourceItem;
      
      if (sourceIndex !== null && sourceIndex !== undefined) {
        inventory[sourceIndex] = targetItem;
      }
      
      this.registry.set("inventoryItems", inventory);
      this.refreshInventoryUI();
    }
  }

  refreshInventoryUI() {
    this.playerSpeed = this.getPlayerSpeed();
    if (this.uiManager) {
      this.uiManager.refreshInventoryEquipment();
      this.uiManager.refreshInventoryGrid();
      this.uiManager.refreshCityUi?.();
      if (this.characterOpen) {
        this.uiManager.refreshCharacterPanel();
      }
    }
  }

  // ==================== EDITOR TOOL ====================  
  openEditorTool() {
    window.open("editor.html", "_blank");
  }

  // ==================== HELPER METHODS ====================  
  
  buildInventoryDisplayEntries() {
    const inventory = GameState.getInventoryItems?.(this.registry) || [];
    const entries = [];
    
    // Add inventory items
    for (let i = 0; i < 20; i++) {
      if (i < inventory.length && inventory[i]) {
        entries.push({ item: inventory[i], index: i });
      } else {
        entries.push({ item: null, index: i });
      }
    }
    
    return entries;
  }
  
  refreshHoveredInventoryTooltip() {
    // Implement tooltip refresh
  }

  updateInteractionPrompt() {
    if (!this.player || !this.interactionPrompt) return;

    let nearest = null;
    let nearestDist = Infinity;
    const px = this.player.x;
    const py = this.player.y;

    (this.interactables || []).forEach((interactable) => {
      const radius = interactable.radius || 72;
      const dist = Phaser.Math.Distance.Between(px, py, interactable.x, interactable.y);
      if (dist <= radius && dist < nearestDist) {
        nearest = interactable;
        nearestDist = dist;
      }
    });

    this.activeInteractable = nearest;

    if (!nearest) {
      this.interactionPrompt.setVisible(false);
      return;
    }

    const screenX = nearest.x - this.cameras.main.scrollX;
    const screenY = nearest.y - this.cameras.main.scrollY;
    this.interactionPrompt.setPosition(screenX, screenY - 78);
    this.interactionPrompt.setVisible(true);

    const textObj = this.interactionPrompt.list?.find?.((child) => child.setText);
    if (textObj) {
      const action = nearest.serviceType === "quest" ? "Talk" : "Open";
      textObj.setText(`[E] : `);
    }
  }

  handlePointerInteraction(pointer) {
    if (!pointer || this.dialogOpen || this.servicePanelOpen) return false;
    if (this.uiManager?.panelManager?.isAnyBlockingOpen?.()) return false;

    const worldPoint = pointer.positionToCamera
      ? pointer.positionToCamera(this.cameras.main)
      : { x: pointer.worldX ?? pointer.x, y: pointer.worldY ?? pointer.y };

    let clicked = null;
    let bestDist = Infinity;
    (this.interactables || []).forEach((interactable) => {
      const clickRadius = interactable.clickRadius || interactable.radius || 88;
      const dist = Phaser.Math.Distance.Between(worldPoint.x, worldPoint.y, interactable.x, interactable.y);
      if (dist <= clickRadius && dist < bestDist) {
        clicked = interactable;
        bestDist = dist;
      }
    });

    if (!clicked) return false;
    this.activeInteractable = clicked;
    if (clicked.serviceType === "field_gate") {
      clicked.onConfirm?.();
    } else if (clicked.serviceType && ["potion", "blacksmith", "sundries", "upgrader", "anvil", "gate"].includes(clicked.serviceType)) {
      this.openServicePanel(clicked);
    } else if (clicked.onConfirm) {
      clicked.onConfirm();
    } else {
      this.openDialog(clicked);
    }
    return true;
  }

  updateMinimapPlayerMarker() {
    if (!this.player || !this.minimapInnerBounds || !this.minimapPlayerDot || !this.minimapPlayerGlow) return;
    const bounds = this.physics?.world?.bounds || { x: 0, y: 0, width: this.scale.width, height: this.scale.height };
    const ratioX = Math.max(0, Math.min(1, (this.player.x - bounds.x) / Math.max(1, bounds.width)));
    const ratioY = Math.max(0, Math.min(1, (this.player.y - bounds.y) / Math.max(1, bounds.height)));
    const dotX = this.minimapInnerBounds.x + ratioX * this.minimapInnerBounds.width;
    const dotY = this.minimapInnerBounds.y + ratioY * this.minimapInnerBounds.height;
    this.minimapPlayerGlow.setPosition(dotX, dotY);
    this.minimapPlayerDot.setPosition(dotX, dotY);
  }

  toggleWorldMap() {
    if (this.worldMapElements?.length) {
      this.worldMapElements.forEach((el) => el.destroy?.());
      this.worldMapElements = null;
      return;
    }
    const { width, height } = this.scale;
    const elements = [];
    elements.push(this.add.rectangle(width / 2, height / 2, Math.min(720, width - 80), Math.min(460, height - 80), 0x0b1118, 0.94)
      .setStrokeStyle(3, 0xf4df9c, 0.9).setScrollFactor(0).setDepth(90000));
    elements.push(this.add.text(width / 2, height / 2 - 190, "World Map", {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "24px",
      color: "#f8f1dc",
      stroke: "#000",
      strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(90001));
    elements.push(this.add.text(width / 2, height / 2 + 190, "M: close | City hub, NPCs and dungeon gate overview", {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "13px",
      color: "#d7c58f",
      stroke: "#000",
      strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(90001));
    const points = [
      ["Potion", -210, -70, 0x8ad97a],
      ["Anvil", -40, -110, 0xf4df9c],
      ["Quest", 140, -45, 0x88c7ff],
      ["Gate", 220, 80, 0xd97a7a],
      ["You", 0, 45, 0xffffff],
    ];
    points.forEach(([label, ox, oy, color]) => {
      elements.push(this.add.circle(width / 2 + ox, height / 2 + oy, 9, color, 0.95).setScrollFactor(0).setDepth(90001));
      elements.push(this.add.text(width / 2 + ox + 14, height / 2 + oy - 8, label, {
        fontFamily: "Trebuchet MS, Arial, sans-serif",
        fontSize: "12px",
        color: "#f8f1dc",
        stroke: "#000",
        strokeThickness: 2,
      }).setScrollFactor(0).setDepth(90001));
    });
    this.worldMapElements = elements;
  }

  refreshCityUi() {
    const GS = window.GameState;
    const maxHp = this.getCurrentMaxHp?.() || GS?.getMaxHp?.(this.registry) || 100;
    const maxMp = this.getCurrentMaxMp?.() || GS?.getMaxMp?.(this.registry) || 40;
    const hp = Math.min(maxHp, this.registry.get("currentHp") || maxHp);
    const mp = Math.min(maxMp, this.registry.get("currentMp") || maxMp);
    const hpRatio = Math.max(0, Math.min(1, hp / Math.max(1, maxHp)));
    const mpRatio = Math.max(0, Math.min(1, mp / Math.max(1, maxMp)));

    if (this.hpBarFill) this.hpBarFill.width = 216 * hpRatio;
    if (this.mpBarFill) this.mpBarFill.width = 216 * mpRatio;
    if (this.hpValueText) this.hpValueText.setText(`${hp}/${maxHp}`);
    if (this.mpValueText) this.mpValueText.setText(`${mp}/${maxMp}`);
    const xpState = GS?.getPlayerXpState?.(this.registry) || { level: this.registry.get("playerLevel") || 1, xp: this.registry.get("playerXp") || 0, next: 145 };
    const xpRatio = Math.max(0, Math.min(1, xpState.xp / Math.max(1, xpState.next)));
    if (this.xpBarFill) this.xpBarFill.width = 216 * xpRatio;
    if (this.xpValueText) this.xpValueText.setText(`Lv ${xpState.level}  ${xpState.xp}/${xpState.next} XP`);
    if (this.goldValueText) this.goldValueText.setText(`Gold: ${this.registry.get("gold") || 0}`);
    if (this.potionValueText) this.potionValueText.setText(`HP: ${this.registry.get("healthPotionCount") || 0} | MP: ${this.registry.get("mpPotionCount") || 0}`);
    if (this.powerValueText) this.powerValueText.setText(`Power Tier: ${this.registry.get("playerPowerTier") || 1}`);

    this.uiManager?.inventoryPanel?.refresh?.();
    this.uiManager?.hotbarPanel?.refresh?.();
    if (this.characterOpen) this.uiManager?.characterPanel?.refresh?.();
    if (this.skillPanelOpen) this.uiManager?.skillPanel?.refresh?.();
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
    
    this.uiManager.refreshCharacterPanel();
  }
}

// Export the scene
window.PrototypeScene = PrototypeScene;
