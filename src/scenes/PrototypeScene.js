class PrototypeScene extends Phaser.Scene {
  constructor() {
    super("PrototypeScene");
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
    this.domHotkeyHandler = null;
    this.sceneHotkeyHandlers = null;
    this.hotkeyHandledUntil = 0;
    this.skillPanelElements = null;
    this.skillPanelOpen = false;
    this.inventoryTooltipElements = null;
    this.cityDragDropBound = false;
    this.cityDragGhost = null;
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
    this.rightPanelHideEvent = null;
    this.upgradeRitualActive = false;
    this.upgradeRitualElements = [];
  }

  preload() {
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
    this.initSharedState();
    GameState.attachAutoSave?.(this, this.registry);
    this.playerSpeed = this.getPlayerSpeed();
    this.cityProgressState = this.buildCityProgressState(returnState);

    this.cameras.main.setBackgroundColor("#182430");
    this.physics.world.setBounds(48, 48, width - 96, height - 96);

    this.drawGround(width, height);
    this.drawRoads(width, height);
    this.createCollisionBlocks();
    this.drawServiceAreas();
    this.drawProps();
    this.createAnimations();
    this.createNpcLayer();
    this.createPlayer(spawnPoint.x, spawnPoint.y);
    this.createInput();
    this.input.mouse.disableContextMenu();
    this.drawCityHeader(width);
    this.drawUiLayer(width, height);
    this.createInteractionUi(width, height);
    this.applyCityReturnState(returnState);
    if (!this.characterWheelBound) {
      this.input.on("wheel", this.handleCharacterBonusWheel, this);
      this.characterWheelBound = true;
    }
    this.setupCityInventoryDragDrop();
  }

  /* ══════════════════════════════════════════
     UPDATE
     ══════════════════════════════════════════ */

  update() {
    if (!this.player || !this.moveKeys) return;

    if (this.upgradeRitualActive) {
      this.player.body.setVelocity(0, 0);
      this.setPlayerAnimation(false);
      return;
    }

    // Universal ESC / Close handling
    if (Phaser.Input.Keyboard.JustDown(this.actionKeys.close)) {
      if (this.handleGlobalPanelClose()) return;
    }

    // Check if any UI is blocking movement
    if (GameState.isAnyPanelOpen(this)) {
      this.player.body.setVelocity(0, 0);
      this.setPlayerAnimation(false);

      if (this.dialogOpen) {
        if (this.activeInteractable?.onConfirm && Phaser.Input.Keyboard.JustDown(this.actionKeys.confirm)) {
          this.activeInteractable.onConfirm();
          return;
        }
        if (Phaser.Input.Keyboard.JustDown(this.actionKeys.interact)) {
          this.closeDialog();
        }
      } else if (this.servicePanelOpen) {
        if (this.currentServiceType === "anvil" && Phaser.Input.Keyboard.JustDown(this.actionKeys.confirm)) {
          this.handleAnvilUpgradeConfirm();
        } else if (Phaser.Input.Keyboard.JustDown(this.actionKeys.confirm)) {
          this.confirmSelectedServiceEntry();
        }
        if (Phaser.Input.Keyboard.JustDown(this.actionKeys.interact)) {
          this.closeServicePanel();
        }
      }
      return;
    }

    // Normal movement and hotkeys
    this.handleMovement();
    this.handleHotbarKeys();

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

    this.refreshHoveredInventoryTooltip();
    this.updateInteractionPrompt();
    this.updateMinimapPlayerMarker();

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

  handleGlobalPanelClose() {
    if (this.dialogOpen) {
      this.closeDialog();
      return true;
    }
    if (this.servicePanelOpen) {
      this.closeServicePanel();
      return true;
    }
    if (this.questListOpen) {
      this.toggleQuestList();
      return true;
    }
    if (this.skillPanelOpen) {
      this.toggleSkillPanel();
      return true;
    }
    if (this.characterOpen) {
      this.toggleCharacterPanel();
      return true;
    }
    if (this.inventoryOpen) {
      this.toggleInventoryPanel();
      return true;
    }
    return false;
  }

  openEditorTool() {
    window.open("editor.html", "_blank");
  }

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

  /* ══════════════════════════════════════════
     SHARED STATE / STATS
     ══════════════════════════════════════════ */

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

  /* ══════════════════════════════════════════
     CITY PROGRESS / QUEST STATE BUILDERS
     ══════════════════════════════════════════ */

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
      return { ...baseState, statusText: "Run Incomplete", progressText: `Cycle ${cycleCount}: no completion rewards recorded yet.`, serviceHint: prepBonus > 0 ? `Prepared run bonus remains +${prepBonus} for the next clear.` : "Clear the full dungeon route to unlock city follow-up.", nextActionText: this.buildNextActionText(returnState) };
    }
    return { cleared: true, goldGained: returnState.goldGained ?? 0, materials: returnState.materials ?? [], cycleCount, statusText: "Dungeon Cleared", progressText: cycleCount > 1 ? `Cycle ${cycleCount}: repeatable loop active.` : "Cycle 1: run completed. Progress updated.", serviceHint: prepBonus > 0 ? `Prepared run bonus is now +${prepBonus} on clear.` : "Rewards can now be used at future city services.", nextActionText: this.buildNextActionText(returnState) };
  }

  buildQuestUiState() {
    const questState = this.registry.get("questState");
    const repeatObjectiveState = this.registry.get("repeatObjectiveState");
    const cycleObjectiveState = this.registry.get("cycleObjectiveState");
    const repeatProgress = this.registry.get("repeatObjectiveProgress");
    const repeatTarget = this.getRepeatObjectiveTarget();
    const cycleProgress = this.registry.get("cycleObjectiveProgress");
    const cycleTarget = this.getCycleObjectiveTarget();

    switch (questState) {
      case "active": return { status: "Active", objective: "Clear the first dungeon route.", detail: "Return after the boss placeholder falls.", loopText: this.buildLoopStateText() };
      case "ready_to_turn_in": return { status: "Ready to Turn In", objective: "Talk to the Quest Giver.", detail: "Dungeon objective complete.", loopText: this.buildLoopStateText() };
      case "completed":
        if (cycleObjectiveState === "ready_to_turn_in") return { status: "Follow-up Ready", objective: "Talk to the Quest Giver.", detail: `Clear-chain complete: ${cycleProgress}/${cycleTarget}. Claim +${this.getCycleObjectiveRewardGold()} Gold.`, loopText: this.buildLoopStateText() };
        if (repeatObjectiveState === "ready_to_turn_in") return { status: "Repeatable Ready", objective: "Talk to the Quest Giver.", detail: `Enemy bounty complete: ${repeatProgress}/${repeatTarget}. Claim +${this.getRepeatObjectiveRewardGold()} Gold.`, loopText: this.buildLoopStateText() };
        if (cycleObjectiveState === "active") return { status: "Follow-up Active", objective: `Complete ${cycleTarget} more dungeon clears.`, detail: `Clear progress: ${cycleProgress}/${cycleTarget} | Bounty ${repeatProgress}/${repeatTarget}`, loopText: this.buildLoopStateText() };
        if (repeatObjectiveState === "active") return { status: "Repeatable Active", objective: `Defeat ${repeatTarget} dungeon enemies total.`, detail: `Progress: ${repeatProgress}/${repeatTarget}`, loopText: this.buildLoopStateText() };
        return { status: "Completed", objective: "First dungeon quest complete.", detail: `Reward claimed: +${this.getQuestRewardGold()} Gold`, loopText: this.buildLoopStateText() };
      default: return { status: "Not Accepted", objective: "Talk to the Quest Giver.", detail: "Accept the first dungeon quest.", loopText: this.buildLoopStateText() };
    }
  }

  buildLoopStateText() { return `Loop: Clears ${this.registry.get("dungeonCycles")} | Power ${this.registry.get("playerPowerTier")} | Prep +${this.calculatePreparationBonus()}`; }

  getCompactQuestStatus() {
    const qs = this.registry.get("questState");
    const ros = this.registry.get("repeatObjectiveState");
    const cos = this.registry.get("cycleObjectiveState");
    if (qs === "ready_to_turn_in") return "Ready";
    if (qs === "completed" && cos === "ready_to_turn_in") return "Chain Ready";
    if (qs === "completed" && ros === "ready_to_turn_in") return "Bounty Ready";
    if (qs === "completed" && cos === "active") return "Chain Active";
    if (qs === "completed" && ros === "active") return "Bounty Active";
    if (qs === "active") return "Main Active";
    if (qs === "completed") return "Main Clear";
    return "Not Taken";
  }

  buildCompactRewardLines() {
    const state = this.cityProgressState;
    const cycleCount = state?.cycleCount ?? this.registry.get("dungeonCycles") ?? 0;
    const materials = state?.materials || [];
    const materialPreview = materials.length > 0 ? materials.slice(0, 2).join(", ") : "None";
    return [
      `Run ${state?.cleared ? "CLEAR" : "IDLE"}  |  Cycle ${cycleCount}`,
      `Gold +${state?.goldGained ?? 0}  |  Mats ${materials.length}`,
      `Last Drop: ${materialPreview}`,
      `Prep +${this.calculatePreparationBonus()}  |  Power ${this.registry.get("playerPowerTier")}  |  Train ${GameState.getClassTrainingLevel?.(this.registry) || 0}`,
      `Spend: ${this.registry.get("citySpendResult") || "None"}`,
    ];
  }

  buildCompactQuestLines() {
    const qs = this.registry.get("questState");
    const ros = this.registry.get("repeatObjectiveState");
    const cos = this.registry.get("cycleObjectiveState");

    let objective = "Talk to the Quest Giver";
    let progress = "No active target";

    if (qs === "active") {
      objective = "Clear the first dungeon route";
      progress = "Boss kill needed";
    } else if (qs === "ready_to_turn_in") {
      objective = "Return to Quest Giver";
      progress = `Main reward +${this.getQuestRewardGold()} Gold`;
    } else if (qs === "completed" && cos === "ready_to_turn_in") {
      objective = "Turn in clear chain";
      progress = `Reward +${this.getCycleObjectiveRewardGold()} Gold`;
    } else if (qs === "completed" && ros === "ready_to_turn_in") {
      objective = "Turn in enemy bounty";
      progress = `Reward +${this.getRepeatObjectiveRewardGold()} Gold`;
    } else if (qs === "completed" && cos === "active") {
      objective = "Repeat full clears";
      progress = `${this.registry.get("cycleObjectiveProgress")}/${this.getCycleObjectiveTarget()} clears`;
    } else if (qs === "completed" && ros === "active") {
      objective = "Repeat enemy bounty";
      progress = `${this.registry.get("repeatObjectiveProgress")}/${this.getRepeatObjectiveTarget()} kills`;
    } else if (qs === "completed") {
      objective = "Main quest finished";
      progress = "Use Q for full list";
    }

    return [
      `State: ${this.getCompactQuestStatus()}`,
      `Objective: ${objective}`,
      `Progress: ${progress}`,
      `Loop: ${this.registry.get("dungeonCycles")} clear  |  Prep +${this.calculatePreparationBonus()}`,
    ];
  }

  buildObjectiveSummaryText() {
    const qs = this.registry.get("questState");
    const ros = this.registry.get("repeatObjectiveState");
    const cos = this.registry.get("cycleObjectiveState");
    if (qs === "ready_to_turn_in") return "Objective: Main quest ready to turn in";
    if (qs === "completed" && cos === "ready_to_turn_in") return "Objective: Follow-up clear chain ready";
    if (qs === "completed" && ros === "ready_to_turn_in") return "Objective: Repeat bounty ready to turn in";
    if (qs === "completed" && cos === "active") return `Objective: Clear chain ${this.registry.get("cycleObjectiveProgress")}/${this.getCycleObjectiveTarget()}`;
    if (qs === "completed" && ros === "active") return `Objective: Enemy bounty ${this.registry.get("repeatObjectiveProgress")}/${this.getRepeatObjectiveTarget()}`;
    if (qs === "active") return "Objective: Clear the first dungeon route";
    return "Objective: No active dungeon objective";
  }

  buildServiceStatusText() {
    return `Services: Potion ${this.registry.get("healthPotionCount")} | HP +${this.registry.get("maxHpBonus")} | Power ${this.registry.get("playerPowerTier")} | Train ${GameState.getClassTrainingLevel?.(this.registry) || 0} | Prep +${this.calculatePreparationBonus()}`;
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

  /* ══════════════════════════════════════════
     CITY LAYOUT (from old version)
     ══════════════════════════════════════════ */

  drawGround(width, height) {
    this.add.rectangle(width / 2, height / 2, width, height, 0x6d9961);
    this.add.rectangle(width / 2, height / 2, width - 100, height - 100, 0x79a86b);
    this.add.rectangle(width / 2, height / 2, 300, 180, 0x90b97d, 0.9);
  }

  drawRoads(width, height) {
    const roadColor = 0xbea77c;
    const roadEdge = 0x8c7552;

    this.add.rectangle(width / 2, height / 2, 150, height - 80, roadColor);
    this.add.rectangle(width / 2, height / 2, width - 120, 120, roadColor);
    this.add.rectangle(width / 2, height / 2 + 10, 220, 180, 0xd2c098);

    this.add.rectangle(width / 2 - 70, height / 2, 6, height - 80, roadEdge, 0.65);
    this.add.rectangle(width / 2 + 70, height / 2, 6, height - 80, roadEdge, 0.65);
    this.add.rectangle(width / 2, height / 2 - 57, width - 120, 6, roadEdge, 0.65);
    this.add.rectangle(width / 2, height / 2 + 57, width - 120, 6, roadEdge, 0.65);
  }

  createCollisionBlocks() {
    this.obstacles = this.physics.add.staticGroup();

    this.createStaticBlock(160, 120, 185, 110);
    this.createStaticBlock(780, 120, 185, 110);
    this.createStaticBlock(160, 430, 185, 110);
    this.createStaticBlock(780, 430, 185, 110);
    this.createStaticBlock(480, 115, 235, 118);

    this.createStaticBlock(80, 90, 44, 50);
    this.createStaticBlock(880, 90, 44, 50);
    this.createStaticBlock(70, 510, 44, 50);
    this.createStaticBlock(890, 510, 44, 50);
    this.createStaticBlock(320, 130, 44, 50);
    this.createStaticBlock(640, 130, 44, 50);
    this.createStaticBlock(310, 455, 44, 50);
    this.createStaticBlock(650, 455, 44, 50);

    this.createStaticBlock(360, 80, 34, 24);
    this.createStaticBlock(610, 80, 34, 24);
    this.createStaticBlock(345, 485, 34, 24);
    this.createStaticBlock(625, 485, 34, 24);

    this.createStaticBlock(344, 210, 126, 28);
    this.createStaticBlock(652, 210, 126, 28);
    this.createStaticBlock(344, 350, 126, 28);
    this.createStaticBlock(652, 350, 126, 28);
  }

  createStaticBlock(x, y, width, height) {
    const block = this.add.rectangle(x, y, width, height, 0x000000, 0);
    this.physics.add.existing(block, true);
    this.obstacles.add(block);
    return block;
  }

  drawServiceAreas() {
    const buildings = [
      { x: 160, y: 120, w: 170, h: 95, color: 0xb84f6a, sprite: "bld_potion", label: "Potion Merchant", scale: 0.28 },
      { x: 780, y: 120, w: 170, h: 95, color: 0x8d6a43, sprite: "bld_blacksmith", label: "Blacksmith", scale: 0.28 },
      { x: 160, y: 430, w: 170, h: 95, color: 0x5b6fb8, sprite: "bld_upgrader", label: "Upgrader", scale: 0.28 },
      { x: 780, y: 430, w: 170, h: 95, color: 0x7c5ba6, sprite: "bld_quest", label: "Quest Giver", scale: 0.28 },
      { x: 480, y: 115, w: 220, h: 105, color: 0x3f6d8a, sprite: "bld_gate", label: "Dungeon Gate", scale: 0.32 },
    ];

    buildings.forEach((b) => {
      this.add.rectangle(b.x, b.y + 8, b.w + 22, b.h + 22, 0x223128, 0.32);
      this.add.rectangle(b.x, b.y + 8, b.w + 4, b.h + 4, 0x162127, 0.18);
      this.add.rectangle(b.x, b.y, b.w, b.h, 0x24322f, 0.38);

      try {
        const sprite = this.add.image(b.x, b.y - 8, b.sprite);
        sprite.setScale(b.scale);
        sprite.setDepth(3);
      } catch (e) { /* fallback: colored rect already drawn */ }

      this.add.rectangle(b.x, b.y + b.h / 2 - 16, 34, 32, 0x473323, 0.78);
      this.add.rectangle(b.x, b.y - 6, b.w - 24, b.h - 30, 0xffffff, 0.05);
      this.createUiText(b.x, b.y - b.h / 2 - 22, b.label, {
        fontSize: "16px",
        color: "#f8f1dc",
        align: "center",
        strokeThickness: 3,
        shadowColor: "#081015",
      }).setOrigin(0.5);
    });
  }

  drawProps() {
    this.createTree(80, 80);
    this.createTree(880, 80);
    this.createTree(70, 500);
    this.createTree(890, 500);
    this.createTree(320, 120);
    this.createTree(640, 120);
    this.createTree(310, 445);
    this.createTree(650, 445);

    this.createRock(360, 80);
    this.createRock(610, 80);
    this.createRock(345, 485);
    this.createRock(625, 485);

    this.createFenceRow(290, 210, 7);
    this.createFenceRow(598, 210, 7);
    this.createFenceRow(290, 350, 7);
    this.createFenceRow(598, 350, 7);

    this.createSign(480, 260, "Central Plaza");
    this.createSign(480, 480, "South Road");
    this.createAnvilStation(252, 414);
  }

  createTree(x, y) {
    this.add.rectangle(x, y + 16, 14, 28, 0x6a4528);
    this.add.circle(x, y, 20, 0x2f6b3b);
    this.add.circle(x - 14, y + 6, 12, 0x377646);
    this.add.circle(x + 14, y + 6, 12, 0x377646);
  }

  createRock(x, y) {
    this.add.ellipse(x, y, 26, 18, 0x7f8892);
    this.add.ellipse(x + 8, y + 2, 14, 10, 0x99a2ab, 0.55);
  }

  createFenceRow(startX, y, count) {
    for (let index = 0; index < count; index += 1) {
      const x = startX + index * 18;
      this.add.rectangle(x, y, 8, 24, 0x8b6a43);
      this.add.rectangle(x, y - 8, 14, 5, 0xb28a5a);
    }
  }

  createSign(x, y, label) {
    this.add.rectangle(x, y + 16, 8, 24, 0x6a4528);
    this.add.rectangle(x, y, 90, 28, 0xe7d3a7);
    this.add.text(x, y, label, { fontFamily: "Arial, sans-serif", fontSize: "14px", color: "#2c2c2c" }).setOrigin(0.5);
  }

  createAnvilStation(x, y) {
    const glow = this.add.ellipse(x, y + 22, 58, 18, 0x000000, 0.24).setDepth(4);
    const base = this.add.rectangle(x, y + 20, 58, 16, 0x4c3427, 0.95).setStrokeStyle(2, 0x1a120d).setDepth(5);
    const stand = this.add.rectangle(x, y + 4, 22, 30, 0x5d4738, 0.98).setStrokeStyle(2, 0x1d1611).setDepth(6);
    const plate = this.add.rectangle(x - 4, y - 8, 56, 12, 0x798690, 0.98).setStrokeStyle(2, 0xd8c68a).setDepth(7);
    const horn = this.add.triangle(x + 24, y - 10, 0, 0, 18, 6, 0, 12, 0x798690, 0.98).setStrokeStyle(2, 0xd8c68a).setDepth(7);
    const ember = this.add.circle(x - 10, y - 18, 7, 0xf0b45d, 0.55).setStrokeStyle(2, 0xf7dda4, 0.9).setDepth(6);
    const focusRing = this.add.circle(x, y - 4, 30, 0xf1d9a0, 0.1).setStrokeStyle(2, 0xf6e2a6, 0.92).setDepth(8);
    const focusArrow = this.add.image(x, y - 44, "icon_01").setScale(0.26).setTint(0xf4df9c).setDepth(9);
    const label = this.createUiText(x, y - 64, "Blessed Anvil", {
      fontSize: "13px",
      color: "#f8f1dc",
      align: "center",
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(9);

    focusRing.setVisible(false);
    focusArrow.setVisible(false);

    this.createStaticBlock(x, y + 12, 62, 28);
    this.interactables.push({
      x,
      y,
      name: "Blessed Anvil",
      serviceType: "anvil",
      promptRadius: 70,
      dialogText: "Blessed Anvil: Place a weapon, add a blessed paper, and press Upgrade.",
      dialogHintText: "Press Enter to forge, E or Esc to close",
      visuals: [glow, base, stand, plate, horn, ember, label],
      focusVisuals: [focusRing, focusArrow],
    });
  }

  /* ══════════════════════════════════════════
     PLAYER & ANIMATIONS
     ══════════════════════════════════════════ */

  createAnimations() {
    if (!this.anims.exists("player-idle")) {
      this.anims.create({ key: "player-idle", frames: this.anims.generateFrameNumbers("player_idle_sheet", { start: 0, end: 7 }), frameRate: 8, repeat: -1 });
    }
    if (!this.anims.exists("player-run")) {
      this.anims.create({ key: "player-run", frames: this.anims.generateFrameNumbers("player_run_sheet", { start: 0, end: 5 }), frameRate: 10, repeat: -1 });
    }
  }

  createPlayer(x, y) {
    this.player = this.physics.add.sprite(x, y + 8, "player_idle_sheet", 0);
    this.player.setScale(0.3);
    this.player.setDepth(5);
    this.player.play("player-idle");
    this.player.body.setSize(46, 42);
    this.player.body.setOffset(74, 118);
    this.player.body.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.obstacles);
  }

  setPlayerAnimation(isMoving, horizontalVelocity = 0) {
    if (!this.player?.anims) return;
    if (horizontalVelocity !== 0) this.player.setFlipX(horizontalVelocity < 0);
    const nextKey = isMoving ? "player-run" : "player-idle";
    if (this.player.anims.currentAnim?.key !== nextKey) this.player.play(nextKey, true);
  }

  /* ══════════════════════════════════════════
     INPUT
     ══════════════════════════════════════════ */

  createInput() {
    const canvas = this.game?.canvas;
    if (canvas?.setAttribute) {
      canvas.setAttribute("tabindex", "0");
      canvas.style.outline = "none";
    }
    canvas?.focus?.();
    this.input.on("pointerdown", () => {
      this.game?.canvas?.focus?.();
    });

    this.moveKeys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP, down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT, right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      w: Phaser.Input.Keyboard.KeyCodes.W, a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S, d: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.actionKeys = this.input.keyboard.addKeys({
      interact: Phaser.Input.Keyboard.KeyCodes.E,
      close: Phaser.Input.Keyboard.KeyCodes.ESC,
      confirm: Phaser.Input.Keyboard.KeyCodes.ENTER,
      compare: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      inventory: Phaser.Input.Keyboard.KeyCodes.I,
      character: Phaser.Input.Keyboard.KeyCodes.C,
      skills: Phaser.Input.Keyboard.KeyCodes.K,
      questList: Phaser.Input.Keyboard.KeyCodes.Q,
      slot1: Phaser.Input.Keyboard.KeyCodes.ONE,
      slot2: Phaser.Input.Keyboard.KeyCodes.TWO,
      slot3: Phaser.Input.Keyboard.KeyCodes.THREE,
      slot4: Phaser.Input.Keyboard.KeyCodes.FOUR,
      slot5: Phaser.Input.Keyboard.KeyCodes.FIVE,
      slot6: Phaser.Input.Keyboard.KeyCodes.SIX,
    });

    if (!this.domHotkeyHandler) {
      this.domHotkeyHandler = (event) => {
        if (event.repeat) {
          return;
        }
        const tagName = event.target?.tagName;
        if (tagName === "INPUT" || tagName === "TEXTAREA") {
          return;
        }
        const key = String(event.key || "").toLowerCase();
        if (!["i", "c", "k", "q"].includes(key)) {
          return;
        }
        this.tryTriggerUiHotkey(key);
      };
      window.addEventListener("keydown", this.domHotkeyHandler);
      this.events.once("shutdown", () => {
        if (this.domHotkeyHandler) {
          window.removeEventListener("keydown", this.domHotkeyHandler);
          this.domHotkeyHandler = null;
        }
      });
      this.events.once("destroy", () => {
        if (this.domHotkeyHandler) {
          window.removeEventListener("keydown", this.domHotkeyHandler);
          this.domHotkeyHandler = null;
        }
      });
    }

    if (!this.sceneHotkeyHandlers && this.input.keyboard) {
      this.sceneHotkeyHandlers = {
        i: () => this.tryTriggerUiHotkey("i"),
        c: () => this.tryTriggerUiHotkey("c"),
        k: () => this.tryTriggerUiHotkey("k"),
        q: () => this.tryTriggerUiHotkey("q"),
      };
      this.input.keyboard.on("keydown-I", this.sceneHotkeyHandlers.i);
      this.input.keyboard.on("keydown-C", this.sceneHotkeyHandlers.c);
      this.input.keyboard.on("keydown-K", this.sceneHotkeyHandlers.k);
      this.input.keyboard.on("keydown-Q", this.sceneHotkeyHandlers.q);
      this.events.once("shutdown", () => {
        if (this.sceneHotkeyHandlers && this.input.keyboard) {
          this.input.keyboard.off("keydown-I", this.sceneHotkeyHandlers.i);
          this.input.keyboard.off("keydown-C", this.sceneHotkeyHandlers.c);
          this.input.keyboard.off("keydown-K", this.sceneHotkeyHandlers.k);
          this.input.keyboard.off("keydown-Q", this.sceneHotkeyHandlers.q);
          this.sceneHotkeyHandlers = null;
        }
      });
      this.events.once("destroy", () => {
        if (this.sceneHotkeyHandlers && this.input.keyboard) {
          this.input.keyboard.off("keydown-I", this.sceneHotkeyHandlers.i);
          this.input.keyboard.off("keydown-C", this.sceneHotkeyHandlers.c);
          this.input.keyboard.off("keydown-K", this.sceneHotkeyHandlers.k);
          this.input.keyboard.off("keydown-Q", this.sceneHotkeyHandlers.q);
          this.sceneHotkeyHandlers = null;
        }
      });
    }
  }

  tryTriggerUiHotkey(key) {
    const now = this.time?.now ?? Date.now();
    if (now < (this.hotkeyHandledUntil || 0)) {
      return false;
    }
    this.hotkeyHandledUntil = now + 180;

    if (key === "i") {
      this.toggleInventoryPanel();
      return true;
    }
    if (key === "c") {
      this.toggleCharacterPanel();
      return true;
    }
    if (key === "k") {
      this.toggleSkillPanel();
      return true;
    }
    if (key === "q") {
      this.toggleQuestList();
      return true;
    }
    return false;
  }

  /* ══════════════════════════════════════════
     NPCs
     ══════════════════════════════════════════ */

  createNpcLayer() {
    this.createInteractableNpc({ x: 160, y: 214, color: 0xd06f88, name: "Potion Merchant", promptRadius: 64,
      serviceType: "potion",
      dialogText: () => this.getPotionMerchantDialog(), dialogHintText: () => this.getPotionMerchantHint(),
      onConfirm: () => this.handlePotionMerchantConfirm() });

    this.createInteractableNpc({ x: 780, y: 214, color: 0xb48356, name: "Blacksmith", promptRadius: 64,
      serviceType: "blacksmith",
      dialogText: () => this.getBlacksmithDialog(), dialogHintText: () => this.getBlacksmithHint(),
      onConfirm: () => this.handleBlacksmithConfirm() });

    this.createInteractableNpc({ x: 160, y: 338, color: 0x6f83d2, name: "Upgrader", promptRadius: 64,
      serviceType: "upgrader",
      dialogText: () => this.getUpgraderDialog(), dialogHintText: () => this.getUpgraderHint(),
      onConfirm: () => this.handleUpgraderConfirm() });

    this.createInteractableNpc({ x: 780, y: 338, color: 0x9b77c7, name: "Quest Giver", promptRadius: 64,
      serviceType: "quest",
      dialogText: () => this.getQuestGiverDialog(), dialogHintText: () => this.getQuestGiverHint(),
      onConfirm: () => this.handleQuestGiverConfirm() });

    this.createInteractableNpc({ x: 480, y: 205, color: 0x59a6be, name: "Dungeon Gate Keeper", promptRadius: 72,
      serviceType: "dungeon",
      dialogText: () => this.getDungeonGateDialog(),
      dialogHintText: () => this.getDungeonGateHint(),
      onConfirm: null });

  }

  createInteractableNpc(config) {
    const markerShadow = this.add.ellipse(config.x, config.y + 18, 28, 12, 0x000000, 0.18).setDepth(5);
    const focusRing = this.add.circle(config.x, config.y + 2, 20, 0xf1d9a0, 0.12).setStrokeStyle(2, 0xf6e2a6, 0.92).setDepth(5);
    focusRing.setVisible(false);
    const body = this.add.rectangle(config.x, config.y + 6, 22, 28, config.color).setStrokeStyle(2, 0x22303a).setDepth(6);
    const head = this.add.circle(config.x, config.y - 16, 10, 0xf2dcc2).setStrokeStyle(2, 0x22303a).setDepth(7);
    const focusArrow = this.add.image(config.x, config.y - 44, "icon_08").setScale(0.28).setTint(0xf4df9c).setDepth(8);
    focusArrow.setVisible(false);
    const label = this.createUiText(config.x, config.y - 42, config.name, {
      fontSize: "13px",
      color: "#f8f1dc",
      align: "center",
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(8);

    this.createStaticBlock(config.x, config.y + 8, 24, 30);

    this.interactables.push({
      x: config.x, y: config.y, name: config.name,
      serviceType: config.serviceType ?? null,
      onConfirm: config.onConfirm ?? null,
      dialogHintText: config.dialogHintText ?? "Press E or Esc to close",
      promptRadius: config.promptRadius,
      dialogText: config.dialogText,
      visuals: [markerShadow, body, head, label],
      focusVisuals: [focusRing, focusArrow],
    });
  }

  /* ══════════════════════════════════════════
     NPC DIALOGS
     ══════════════════════════════════════════ */

  getPotionMerchantDialog() {
    const potionCost = this.getPotionCost();
    const gold = this.registry.get("gold");
    const potionCount = this.registry.get("healthPotionCount");
    const currentPrep = this.calculatePreparationBonus();
    const nextPrep = this.calculatePreparationBonus({ potionDelta: 1 });
    if (gold >= potionCost) {
      return `Potion Merchant: Health Potion ready for ${potionCost} gold. Potions: ${potionCount}. Prep bonus: +${currentPrep} → +${nextPrep}. Press Enter to buy.`;
    }
    return `Potion Merchant: Health Potion costs ${potionCost} gold, you have ${gold}. Prep bonus: +${currentPrep}. Return to the dungeon for more gold.`;
  }

  getPotionMerchantHint() {
    return this.registry.get("gold") >= this.getPotionCost() ? "Press Enter to stock, E or Esc to close" : "Not enough gold. Press E or Esc to close";
  }

  getBlacksmithDialog() {
    const cost = this.getBlacksmithCost();
    const gold = this.registry.get("gold");
    const currentPrep = this.calculatePreparationBonus();
    const nextPrep = this.calculatePreparationBonus({ hpBonusDelta: 20 });
    if (gold >= cost) {
      return `Blacksmith: Press Enter to forge Vital Reinforcement for ${cost} gold. Max HP: ${this.getCurrentMaxHp()} → ${this.getCurrentMaxHp() + 20}. Prep: +${currentPrep} → +${nextPrep}.`;
    }
    return `Blacksmith: Vital Reinforcement costs ${cost} gold. Max HP: ${this.getCurrentMaxHp()}. Prep: +${currentPrep}. Need more gold.`;
  }

  getBlacksmithHint() {
    return this.registry.get("gold") >= this.getBlacksmithCost() ? "Press Enter to forge, E or Esc to close" : "Not enough gold. Press E or Esc to close";
  }

  getUpgraderDialog() {
    const cost = this.getUpgradeCost();
    const tier = this.registry.get("playerPowerTier");
    const trainingDef = GameState.getClassTrainingDef(this.registry.get("playerClass") || "warrior");
    return `Upgrader: The Blessed Anvil handles weapon plus attempts. I handle Power Tier ${tier} -> ${tier + 1} for ${cost} gold and ${trainingDef.name}.`;
  }

  getUpgraderHint() {
    return "Press Enter to open services, E or Esc to close";
  }

  getQuestGiverDialog() {
    const qs = this.registry.get("questState");
    const ros = this.registry.get("repeatObjectiveState");
    const cos = this.registry.get("cycleObjectiveState");

    if (qs === "active") return "Quest Giver: Your task is active. Clear the first dungeon prototype and return to me.";
    if (qs === "ready_to_turn_in") return `Quest Giver: You cleared the dungeon! Press Enter to claim +${this.getQuestRewardGold()} gold.`;
    if (qs === "completed") {
      if (cos === "ready_to_turn_in") return `Quest Giver: Clear-chain complete! Press Enter to claim +${this.getCycleObjectiveRewardGold()} gold.`;
      if (ros === "ready_to_turn_in") return `Quest Giver: Repeat bounty complete! Press Enter to claim +${this.getRepeatObjectiveRewardGold()} gold.`;
      if (cos === "active") return `Quest Giver: Clear chain active. Progress: ${this.registry.get("cycleObjectiveProgress")}/${this.getCycleObjectiveTarget()}. Bounty: ${this.registry.get("repeatObjectiveProgress")}/${this.getRepeatObjectiveTarget()}.`;
      if (ros === "active") return `Quest Giver: Repeatable bounty active. Defeat ${this.getRepeatObjectiveTarget()} enemies. Progress: ${this.registry.get("repeatObjectiveProgress")}/${this.getRepeatObjectiveTarget()}.`;
      return "Quest Giver: First dungeon quest complete. More chains coming soon.";
    }
    return "Quest Giver: We need proof the first dungeon route can be cleared. Press Enter to accept this quest.";
  }

  getQuestGiverHint() {
    const qs = this.registry.get("questState");
    const ros = this.registry.get("repeatObjectiveState");
    const cos = this.registry.get("cycleObjectiveState");
    if (qs === "not_accepted") return "Press Enter to accept, E or Esc to close";
    if (qs === "ready_to_turn_in") return "Press Enter to complete, E or Esc to close";
    if (qs === "completed" && (cos === "ready_to_turn_in" || ros === "ready_to_turn_in")) return "Press Enter to claim, E or Esc to close";
    return "Press E or Esc to close";
  }

  getDungeonGateDialog() {
    const difficulty = GameState.getDungeonDifficultyDef?.(this.registry);
    return `Dungeon Gate Keeper: Forgotten Halls, Ashen Barracks, and Sunken Sanctum are open. Current difficulty is ${difficulty?.label || "Normal"}.`;
  }

  getDungeonGateHint() {
    return "Press Enter to choose a dungeon route, E or Esc to close";
  }

  getEditorDialog() {
    const difficulty = GameState.getDungeonDifficultyDef?.(this.registry);
    const minMobs = GameState.getGameConfigValue?.(this.registry, "dungeon.roomMinMobs", 1);
    const maxMobs = GameState.getGameConfigValue?.(this.registry, "dungeon.roomMaxMobs", 10);
    return `Server Editor: opens the standalone tuning tool window. Current: ${difficulty?.label || "Normal"} | Room ${minMobs}-${maxMobs} mobs.`;
  }

  getEditorHint() {
    return "Press Enter to open the editor, E or Esc to close";
  }

  /* ══════════════════════════════════════════
     NPC CONFIRM HANDLERS
     ══════════════════════════════════════════ */

  handleQuestGiverConfirm() {
    const qs = this.registry.get("questState");
    const ros = this.registry.get("repeatObjectiveState");
    const cos = this.registry.get("cycleObjectiveState");

    if (qs === "not_accepted") {
      this.registry.set("questState", "active");
      this.registry.set("repeatObjectiveState", "active");
      this.registry.set("repeatObjectiveProgress", 0);
      this.registry.set("cycleObjectiveState", "active");
      this.registry.set("cycleObjectiveProgress", 0);
      this.showCityBanner("Quest Accepted");
      this.refreshCityUi();
      this.updateCityFeed("Quest Accepted: Clear the first dungeon route.", "Objective: Return after the dungeon is cleared.");
      if (this.servicePanelOpen) this.refreshServicePanel();
      else this.openDialog(this.activeInteractable);
      return;
    }

    if (qs === "ready_to_turn_in") {
      const reward = this.getQuestRewardGold();
      this.registry.set("questState", "completed");
      this.registry.set("gold", this.registry.get("gold") + reward);
      this.showCityBanner("Quest Completed");
      this.refreshCityUi();
      this.updateCityFeed(`Quest Completed: +${reward} Gold`, `Repeat Objective: Defeat ${this.getRepeatObjectiveTarget()} enemies.`);
      if (this.servicePanelOpen) this.refreshServicePanel();
      else this.openDialog(this.activeInteractable);
      return;
    }

    if (qs === "completed" && cos === "ready_to_turn_in") {
      const reward = this.getCycleObjectiveRewardGold();
      this.registry.set("cycleObjectiveState", "active");
      this.registry.set("cycleObjectiveCompletions", this.registry.get("cycleObjectiveCompletions") + 1);
      this.registry.set("cycleObjectiveProgress", 0);
      this.registry.set("gold", this.registry.get("gold") + reward);
      this.showCityBanner("Follow-up Completed");
      this.refreshCityUi();
      this.updateCityFeed(`Clear Chain Completed: +${reward} Gold`, `Complete ${this.getCycleObjectiveTarget()} more clears.`);
      if (this.servicePanelOpen) this.refreshServicePanel();
      else this.openDialog(this.activeInteractable);
      return;
    }

    if (qs === "completed" && ros === "ready_to_turn_in") {
      const reward = this.getRepeatObjectiveRewardGold();
      this.registry.set("repeatObjectiveState", "active");
      this.registry.set("repeatObjectiveCompletions", this.registry.get("repeatObjectiveCompletions") + 1);
      this.registry.set("repeatObjectiveProgress", 0);
      if (cos === "inactive") { this.registry.set("cycleObjectiveState", "active"); this.registry.set("cycleObjectiveProgress", 0); }
      this.registry.set("gold", this.registry.get("gold") + reward);
      this.showCityBanner("Objective Completed");
      this.refreshCityUi();
      this.updateCityFeed(`Repeat Objective Completed: +${reward} Gold`, cos === "inactive" ? `Follow-up: Complete ${this.getCycleObjectiveTarget()} dungeon clears.` : `Defeat ${this.getRepeatObjectiveTarget()} more enemies.`);
      if (this.servicePanelOpen) this.refreshServicePanel();
      else this.openDialog(this.activeInteractable);
      return;
    }
  }

  handlePotionMerchantConfirm() {
    const cost = this.getPotionCost();
    const gold = this.registry.get("gold");
    if (gold < cost) {
      this.showCityBanner("Not Enough Gold");
      this.updateCityFeed(`Need ${cost} Gold`, "Return to the dungeon for more gold.");
      if (this.servicePanelOpen) this.refreshServicePanel();
      else this.openDialog(this.activeInteractable);
      return;
    }
    this.registry.set("gold", gold - cost);
    this.registry.set("healthPotionCount", this.registry.get("healthPotionCount") + 1);
    this.showCityBanner("Potion Purchased");
    this.refreshCityUi();
    this.updateCityFeed(`-${cost} Gold: Health Potion +1`, `Total: ${this.registry.get("healthPotionCount")} potions | Prep +${this.calculatePreparationBonus()}`);
    if (this.servicePanelOpen) this.refreshServicePanel();
    else this.openDialog(this.activeInteractable);
  }

  handleBlacksmithConfirm() {
    const cost = this.getBlacksmithCost();
    const gold = this.registry.get("gold");
    if (gold < cost) {
      this.showCityBanner("Not Enough Gold");
      this.updateCityFeed(`Need ${cost} Gold`, "Return to the dungeon for more gold.");
      if (this.servicePanelOpen) this.refreshServicePanel();
      else this.openDialog(this.activeInteractable);
      return;
    }
    this.registry.set("gold", gold - cost);
    this.registry.set("maxHpBonus", this.registry.get("maxHpBonus") + 20);
    this.showCityBanner("Reinforcement Applied");
    this.refreshCityUi();
    this.updateCityFeed(`-${cost} Gold: Max HP +20`, `Max HP: ${this.getCurrentMaxHp()} | Prep +${this.calculatePreparationBonus()}`);
    if (this.servicePanelOpen) this.refreshServicePanel();
    else this.openDialog(this.activeInteractable);
  }

  handleUpgraderConfirm() {
    const cost = this.getUpgradeCost();
    const gold = this.registry.get("gold");
    if (gold < cost) {
      this.showCityBanner("Not Enough Gold");
      this.updateCityFeed(`Need ${cost} Gold`, "Return to the dungeon for more gold.");
      if (this.servicePanelOpen) this.refreshServicePanel();
      else this.openDialog(this.activeInteractable);
      return;
    }
    this.registry.set("gold", gold - cost);
    this.registry.set("playerPowerTier", this.registry.get("playerPowerTier") + 1);
    this.showCityBanner("Upgrade Applied");
    this.refreshCityUi();
    this.updateCityFeed(`-${cost} Gold: Power Tier Up`, `Tier: ${this.registry.get("playerPowerTier")} | Prep +${this.calculatePreparationBonus()}`);
    if (this.servicePanelOpen) this.refreshServicePanel();
    else this.openDialog(this.activeInteractable);
  }

  /* ══════════════════════════════════════════
     UI LAYER
     ══════════════════════════════════════════ */

  drawUiLayer(width, height) {
    this.drawHudPanel();
    this.drawPlayerName(width);
    this.drawMinimapPanel(width);
    this.drawRewardSummaryPanel(width, height);
    this.drawQuestTrackerPanel(width, height);
    this.drawQuestListPanel(width, height);
    this.drawServicePanel(width, height);
    this.drawAnvilPanel(width, height);
    this.drawChatPanel(height);
    this.drawSkillBar(width, height);
  }

  drawHudPanel() {
    this.createUiPanel(18, 18, 428, 146, 0.96, "panel_light");
    this.createUiText(34, 24, this.registry.get("characterName") || "Wanderer", {
      fontSize: "18px",
      color: "#f8f1dc",
    });
    this.createUiText(146, 24, `${this.registry.get("playerClass") || "warrior"}`.toUpperCase(), {
      fontSize: "13px",
      color: "#d7c48d",
    });

    this.createUiText(34, 52, "HP", {
      fontSize: "14px",
      color: "#f6f1df",
    });
    this.createUiText(34, 84, "MP", {
      fontSize: "14px",
      color: "#f6f1df",
    });

    this.add.rectangle(60, 64, 268, 14, 0x24313a, 0.95).setOrigin(0, 0.5).setScrollFactor(0).setDepth(20);
    this.add.rectangle(60, 96, 268, 14, 0x24313a, 0.95).setOrigin(0, 0.5).setScrollFactor(0).setDepth(20);
    this.hpBarFill = this.add.rectangle(60, 64, 268, 10, 0xc84b4b, 0.95).setOrigin(0, 0.5).setScrollFactor(0).setDepth(21);
    this.mpBarFill = this.add.rectangle(60, 96, 268, 10, 0x4b8fc8, 0.95).setOrigin(0, 0.5).setScrollFactor(0).setDepth(21);

    this.hpValueText = this.createUiText(338, 55, "", {
      fontSize: "12px",
      color: "#f8f1dc",
      align: "left",
      strokeThickness: 2,
    });
    this.mpValueText = this.createUiText(338, 87, "", {
      fontSize: "12px",
      color: "#f8f1dc",
      align: "left",
      strokeThickness: 2,
    });
    this.goldValueText = this.createUiText(34, 116, "", {
      fontSize: "13px",
      color: "#dfe8ea",
      wordWrapWidth: 388,
    });
    this.potionValueText = this.createUiText(34, 132, "", {
      fontSize: "13px",
      color: "#b8c5c9",
      wordWrapWidth: 388,
    });
    this.refreshHudPanel();
  }

  drawPlayerName(width) {
    this.createUiPanel(width / 2 - 82, 62, 164, 38, 0.8);
    this.createUiText(width / 2, 81, "Wanderer", { fontSize: "16px", color: "#f6f1df", align: "center" }).setOrigin(0.5);
  }

  drawMinimapPanel(width) {
    const panelX = width - 254;
    const panelY = 22;
    this.createUiPanel(panelX, panelY, 218, 164, 0.96, "panel_alt");
    this.createUiText(panelX + 16, panelY + 18, "Minimap", { fontSize: "17px", color: "#f8f1dc" });

    const innerX = panelX + 20;
    const innerY = panelY + 42;
    const innerWidth = 178;
    const innerHeight = 102;
    this.minimapInnerBounds = { x: innerX, y: innerY, width: innerWidth, height: innerHeight };

    const mapFrame = this.add.rectangle(innerX + innerWidth / 2, innerY + innerHeight / 2, innerWidth, innerHeight, 0x1e2630, 0.96);
    mapFrame.setStrokeStyle(2, 0x60767b, 0.9);
    mapFrame.setScrollFactor(0);
    mapFrame.setDepth(20);

    this.add.rectangle(innerX + innerWidth / 2, innerY + innerHeight / 2, 132, 18, 0xd1bc91, 0.9).setScrollFactor(0).setDepth(21);
    this.add.rectangle(innerX + innerWidth / 2, innerY + innerHeight / 2, 22, 86, 0xd1bc91, 0.9).setScrollFactor(0).setDepth(21);
    this.add.rectangle(innerX + innerWidth / 2, innerY + innerHeight / 2 + 4, 78, 48, 0xe1d0aa, 0.92).setScrollFactor(0).setDepth(21);

    this.minimapPlayerGlow = this.add.circle(innerX + innerWidth / 2, innerY + innerHeight / 2, 7, 0xeadfb8, 0.28);
    this.minimapPlayerGlow.setScrollFactor(0);
    this.minimapPlayerGlow.setDepth(22);
    this.minimapPlayerDot = this.add.circle(innerX + innerWidth / 2, innerY + innerHeight / 2, 4, 0xf8f1dc);
    this.minimapPlayerDot.setScrollFactor(0);
    this.minimapPlayerDot.setDepth(23);
    this.minimapPlayerDot.setStrokeStyle(2, 0x16222a, 0.95);
    this.updateMinimapPlayerMarker();
  }

  drawChatPanel(height) {
    const panelY = height - 134;
    this.createUiPanel(20, panelY, 372, 126, 0.95, "panel_alt");
    this.createUiText(36, panelY + 12, "City Feed", { fontSize: "17px", color: "#f8f1dc" });
    this.cityFeedLines[0] = this.createUiText(36, panelY + 40, "Welcome to the prototype city.", { fontSize: "14px", color: "#f0e7c7", wordWrapWidth: 330 });
    this.cityFeedLines[1] = this.createUiText(36, panelY + 60, "Use city services or enter the dungeon.", { fontSize: "14px", color: "#d9e0e2", wordWrapWidth: 330 });
  }

  drawRewardSummaryPanel(width, height) {
    const panelX = width - 324;
    const panelY = height - 214;
    const panel = this.createUiPanel(panelX, panelY, 292, 96, 0.95, "panel_alt");
    const title = this.createUiText(panelX + 16, panelY + 14, "Run Summary", { fontSize: "17px", color: "#f8f1dc" });

    for (let i = 0; i < 5; i++) {
      this.rewardPanelLines[i] = this.createUiText(panelX + 16, panelY + 36 + i * 11, "", {
        fontSize: "11px",
        color: i >= 3 ? "#b8c5c9" : "#d9e0e2",
        wordWrapWidth: 256,
      });
    }
    this.rewardPanelElements = [panel, title, ...this.rewardPanelLines];
    this.refreshRewardSummaryPanel();
    this.setStatusPanelVisibility(false);
  }

  refreshRewardSummaryPanel() {
    if (this.rewardPanelLines.length === 0 || !this.cityProgressState) return;
    const lines = this.buildCompactRewardLines();
    this.rewardPanelLines.forEach((line, index) => {
      if (!line?.active) return;
      line.setText(lines[index] || "");
    });
  }

  drawQuestTrackerPanel(width, height) {
    const panelX = width - 324;
    const panelY = height - 112;
    const panel = this.createUiPanel(panelX, panelY, 292, 88, 0.95, "panel_alt");
    const title = this.createUiText(panelX + 16, panelY + 12, "Quest Brief", { fontSize: "17px", color: "#f8f1dc" });
    for (let i = 0; i < 4; i++) {
      this.questPanelLines[i] = this.createUiText(panelX + 16, panelY + 34 + i * 11, "", {
        fontSize: "11px",
        color: i === 3 ? "#b8c5c9" : "#d9e0e2",
        wordWrapWidth: 256,
      });
    }
    this.questTrackerElements = [panel, title, ...this.questPanelLines];
    this.refreshQuestTrackerPanel();
    this.setStatusPanelVisibility(false);
  }

  refreshQuestTrackerPanel() {
    if (this.questPanelLines.length === 0) return;
    const lines = this.buildCompactQuestLines();
    this.questPanelLines.forEach((line, index) => {
      if (!line?.active) return;
      line.setText(lines[index] || "");
    });
  }

  drawQuestListPanel(width, height) {
    const panelWidth = 468;
    const panelHeight = 278;
    const panelX = width - panelWidth - 22;
    const panelY = 154;

    const panel = this.createUiPanel(panelX, panelY, panelWidth, panelHeight, 0.97, "panel_alt", 40);
    const title = this.createUiText(panelX + 18, panelY + 12, "Quest List  (Q)", { fontSize: "18px", color: "#f8f1dc", depth: 43 });
    const subTitle = this.createUiText(panelX + 18, panelY + 36, "Click a quest to inspect its objective and reward.", { fontSize: "11px", color: "#9fb2ba", wordWrapWidth: 270, depth: 43 });

    const listBg = this.add.rectangle(panelX + 102, panelY + 152, 170, 188, 0x18222c, 0.94)
      .setStrokeStyle(1, 0x334453, 0.85)
      .setScrollFactor(0)
      .setDepth(41);
    const detailBg = this.add.rectangle(panelX + 336, panelY + 152, 250, 188, 0x18222c, 0.94)
      .setStrokeStyle(1, 0x334453, 0.85)
      .setScrollFactor(0)
      .setDepth(41);

    const rows = [];
    for (let index = 0; index < 3; index += 1) {
      const rowY = panelY + 80 + index * 58;
      const rowBg = this.add.rectangle(panelX + 102, rowY + 18, 160, 46, 0x22303a, 0.9)
        .setStrokeStyle(1, 0x42515c, 0.85)
        .setScrollFactor(0)
        .setDepth(42)
        .setInteractive({ useHandCursor: true });
      const rowTitle = this.createUiText(panelX + 28, rowY + 2, "", { fontSize: "13px", color: "#f8f1dc", wordWrapWidth: 132, depth: 43 });
      const rowStatus = this.createUiText(panelX + 28, rowY + 22, "", { fontSize: "11px", color: "#b8c5c9", wordWrapWidth: 132, depth: 43 });
      rowBg.on("pointerdown", () => this.selectQuestEntry(index));
      rowTitle.setInteractive({ useHandCursor: true });
      rowTitle.on("pointerdown", () => this.selectQuestEntry(index));
      rows.push({ bg: rowBg, title: rowTitle, status: rowStatus });
    }

    const detailTitle = this.createUiText(panelX + 210, panelY + 62, "", { fontSize: "16px", color: "#f4df9c", wordWrapWidth: 224, depth: 43 });
    const detailStatus = this.createUiText(panelX + 210, panelY + 86, "", { fontSize: "12px", color: "#d7c48d", wordWrapWidth: 224, depth: 43 });
    const detailLines = this.createUiText(panelX + 210, panelY + 112, "", {
      fontSize: "12px",
      color: "#d9e0e2",
      wordWrapWidth: 224,
      depth: 43,
      lineSpacing: 8
    });

    const hint = this.createUiText(panelX + 210, panelY + 234, "Q closes the list. Quest Giver can accept and turn in objectives.", {
      fontSize: "11px",
      color: "#9fb2ba",
      wordWrapWidth: 224,
      depth: 43,
    });

    this.questListElements = { panel, title, subTitle, listBg, detailBg, detailTitle, detailStatus, detailLines, hint };
    this.questListEntryRows = rows;
    this.refreshQuestListPanel();
    this.setQuestListVisible(false);
  }

  getQuestEntries() {
    const questState = this.registry.get("questState");
    const repeatObjectiveState = this.registry.get("repeatObjectiveState");
    const cycleObjectiveState = this.registry.get("cycleObjectiveState");
    const entries = [
      {
        label: "First Dungeon Route",
        active: questState !== "completed",
        status: questState === "not_accepted" ? "Not Accepted" : questState === "active" ? "Active" : questState === "ready_to_turn_in" ? "Ready" : "Completed",
        lines: [
          questState === "not_accepted" ? "Talk to the Quest Giver to accept the first city mission." : "Enter the dungeon, clear all phases, and defeat the boss.",
          questState === "ready_to_turn_in" ? `Reward: +${this.getQuestRewardGold()} Gold is ready to claim.` : "Reward: unlocks the repeatable loop and city progression.",
          questState === "completed" ? "State: finished. The dungeon route is now part of the repeat loop." : "Objective: prove the first dungeon route can be cleared.",
          `Loop: Clears ${this.registry.get("dungeonCycles")} | Prep +${this.calculatePreparationBonus()}`,
        ],
      },
      {
        label: "Enemy Bounty",
        active: questState === "completed" && (repeatObjectiveState === "active" || repeatObjectiveState === "ready_to_turn_in"),
        status: questState !== "completed" ? "Locked" : repeatObjectiveState === "ready_to_turn_in" ? "Ready" : repeatObjectiveState === "active" ? "Active" : "Standby",
        lines: [
          questState !== "completed" ? "Complete the first dungeon route to unlock the bounty loop." : `Defeat ${this.getRepeatObjectiveTarget()} dungeon enemies for repeat gold.`,
          questState === "completed" ? `Progress: ${this.registry.get("repeatObjectiveProgress")}/${this.getRepeatObjectiveTarget()}` : "Progress: locked",
          `Reward: +${this.getRepeatObjectiveRewardGold()} Gold`,
          "Turn in at the Quest Giver when the bounty is marked ready.",
        ],
      },
      {
        label: "Clear Chain",
        active: cycleObjectiveState === "active" || cycleObjectiveState === "ready_to_turn_in",
        status: cycleObjectiveState === "ready_to_turn_in" ? "Ready" : cycleObjectiveState === "active" ? "Active" : "Locked",
        lines: [
          cycleObjectiveState === "inactive" ? "Unlocks after the early quest loop starts rolling." : `Complete ${this.getCycleObjectiveTarget()} full dungeon clears.`,
          cycleObjectiveState === "inactive" ? "Progress: locked" : `Progress: ${this.registry.get("cycleObjectiveProgress")}/${this.getCycleObjectiveTarget()}`,
          `Reward: +${this.getCycleObjectiveRewardGold()} Gold`,
          "This chain keeps the city-to-dungeon loop moving after each clear.",
        ],
      },
    ];

    return entries;
  }

  selectQuestEntry(index) {
    this.selectedQuestIndex = Phaser.Math.Clamp(index, 0, Math.max(0, this.currentQuestEntries.length - 1));
    this.refreshQuestListPanel();
  }

  refreshQuestListPanel() {
    if (!this.questListElements || this.questListEntryRows.length === 0) {
      return;
    }

    this.currentQuestEntries = this.getQuestEntries();
    this.selectedQuestIndex = Phaser.Math.Clamp(this.selectedQuestIndex, 0, Math.max(0, this.currentQuestEntries.length - 1));

    this.questListEntryRows.forEach((row, index) => {
      const entry = this.currentQuestEntries[index];
      if (!entry) {
        if (row.bg?.active) row.bg.setVisible(false);
        if (row.title?.active) row.title.setVisible(false);
        if (row.status?.active) row.status.setVisible(false);
        return;
      }

      if (row.bg?.active) row.bg.setVisible(this.questListOpen);
      if (row.title?.active) row.title.setVisible(this.questListOpen);
      if (row.status?.active) row.status.setVisible(this.questListOpen);
      const selected = index === this.selectedQuestIndex;
      row.bg.setFillStyle(selected ? 0x304555 : 0x22303a, selected ? 0.98 : 0.9);
      row.bg.setStrokeStyle(1, selected ? 0xe0c98a : 0x42515c, 0.95);
      row.title.setText(entry.label);
      row.title.setColor(entry.active ? "#f8f1dc" : "#b8c5c9");
      row.status.setText(entry.status);
      row.status.setColor(selected ? "#f4df9c" : "#9fb2ba");
    });

    const selectedEntry = this.currentQuestEntries[this.selectedQuestIndex] || this.currentQuestEntries[0];
    if (!selectedEntry) {
      return;
    }

    this.questListElements.detailTitle.setText(selectedEntry.label);
    this.questListElements.detailStatus.setText(`Status: ${selectedEntry.status}`);
    this.questListElements.detailLines.setText(selectedEntry.lines.filter(Boolean).join("\n\n"));
  }

  toggleQuestList() {
    this.questListOpen = !this.questListOpen;
    if (this.questListOpen) {
      this.closeServicePanel();
      this.refreshQuestListPanel();
    }
    this.setQuestListVisible(this.questListOpen);
  }

  setQuestListVisible(visible) {
    if (!this.questListElements) {
      return;
    }

    Object.values(this.questListElements).forEach((entry) => {
      if (Array.isArray(entry)) {
        entry.forEach((item) => item.setVisible(visible));
      } else {
        entry.setVisible(visible);
      }
    });
    this.questListEntryRows.forEach((row) => {
      if (row.bg?.active) row.bg.setVisible(visible);
      if (row.title?.active) row.title.setVisible(visible);
      if (row.status?.active) row.status.setVisible(visible);
    });
    this.setStatusPanelVisibility(false);
  }

  drawServicePanel(width, height) {
    const panelWidth = 468;
    const panelHeight = 392;
    const panelX = width - panelWidth - 22;
    const panelY = 118;

    const panel = this.createUiPanel(panelX, panelY, panelWidth, panelHeight, 0.97, "panel_alt", 40);
    const title = this.createUiText(panelX + 16, panelY + 12, "Service", { fontSize: "18px", color: "#f8f1dc", depth: 43 });
    const goldText = this.createUiText(panelX + panelWidth - 16, panelY + 14, "", { fontSize: "13px", color: "#e8d45c", align: "right", depth: 43 }).setOrigin(1, 0);
    const listBg = this.add.rectangle(panelX + 108, panelY + 198, 184, 286, 0x18222c, 0.95)
      .setStrokeStyle(1, 0x334453, 0.85)
      .setScrollFactor(0)
      .setDepth(41);
    const detailBg = this.add.rectangle(panelX + 346, panelY + 198, 238, 286, 0x18222c, 0.95)
      .setStrokeStyle(1, 0x334453, 0.85)
      .setScrollFactor(0)
      .setDepth(41);

    const rows = [];
    for (let index = 0; index < 7; index += 1) {
      const rowY = panelY + 58 + index * 40;
      const rowBg = this.add.rectangle(panelX + 108, rowY + 14, 172, 34, 0x22303a, 0.9)
        .setStrokeStyle(1, 0x42515c, 0.85)
        .setScrollFactor(0)
        .setDepth(42)
        .setInteractive({ useHandCursor: true });
      const iconBg = this.add.rectangle(panelX + 34, rowY + 14, 24, 24, 0x142028, 0.95)
        .setStrokeStyle(1, 0x3e4f5c, 0.9)
        .setScrollFactor(0)
        .setDepth(43);
      const icon = this.add.image(panelX + 34, rowY + 14, "icon_05").setScale(0.2).setScrollFactor(0).setDepth(44);
      const titleText = this.createUiText(panelX + 52, rowY + 2, "", { fontSize: "12px", color: "#f8f1dc", wordWrapWidth: 126, depth: 44 });
      const metaText = this.createUiText(panelX + 52, rowY + 18, "", { fontSize: "10px", color: "#9fb2ba", wordWrapWidth: 126, strokeThickness: 2, depth: 44 });
      rowBg.on("pointerdown", () => this.selectServiceEntry(index, true));
      titleText.setInteractive({ useHandCursor: true });
      titleText.on("pointerdown", () => this.selectServiceEntry(index, true));
      rows.push({ bg: rowBg, iconBg, icon, titleText, metaText });
    }

    const detailTitle = this.createUiText(panelX + 230, panelY + 56, "", { fontSize: "16px", color: "#f4df9c", wordWrapWidth: 208, depth: 43 });
    const detailMeta = this.createUiText(panelX + 230, panelY + 80, "", { fontSize: "12px", color: "#d7c48d", wordWrapWidth: 208, depth: 43 });
    const detailLines = [];
    for (let index = 0; index < 7; index += 1) {
      detailLines.push(this.createUiText(panelX + 230, panelY + 108 + index * 24, "", {
        fontSize: index >= 5 ? "11px" : "12px",
        color: index >= 5 ? "#9fb2ba" : "#d9e0e2",
        wordWrapWidth: 208,
        depth: 43,
      }));
    }
    const dungeonDifficultyButtons = ["normal", "hard", "nightmare"].map((key, index) => {
      const x = panelX + 252 + index * 72;
      const y = panelY + 280;
      const bg = this.add.rectangle(x, y, 62, 26, 0x22303a, 0.96)
        .setStrokeStyle(1, 0x42515c, 0.9)
        .setScrollFactor(0)
        .setDepth(43)
        .setInteractive({ useHandCursor: true });
      const text = this.createUiText(x, y, key === "normal" ? "Normal" : key === "hard" ? "Hard" : "Nightmare", {
        fontSize: key === "nightmare" ? "10px" : "11px",
        color: "#f8f1dc",
        align: "center",
        depth: 44,
      }).setOrigin(0.5);
      bg.on("pointerdown", () => {
        GameState.setSelectedDungeonDifficulty?.(this.registry, key);
        this.refreshServicePanel();
      });
      return { key, bg, text };
    });
    const actionHint = this.createUiText(panelX + 18, panelY + panelHeight - 44, "", { fontSize: "12px", color: "#f8f1dc", wordWrapWidth: panelWidth - 36, depth: 43 });
    const footer = this.createUiText(panelX + 16, panelY + panelHeight - 20, "Enter buys or applies the selected entry. E / Esc closes.", {
      fontSize: "11px",
      color: "#9fb2ba",
      wordWrapWidth: panelWidth - 36,
      depth: 43,
    });

    this.servicePanelElements = { panel, title, goldText, listBg, detailBg, detailTitle, detailMeta, detailLines, dungeonDifficultyButtons, actionHint, footer };
    this.serviceEntryRows = rows;
    this.setServicePanelVisible(false);
  }

  drawAnvilPanel(width, height) {
    const panelWidth = 760;
    const panelHeight = 404;
    const panelX = width / 2 - panelWidth / 2;
    const panelY = 122;
    const depth = 46;
    const shade = this.add.rectangle(width / 2, height / 2, width, height, 0x091018, 0.42)
      .setScrollFactor(0)
      .setDepth(depth - 1);
    const panel = this.createUiPanel(panelX, panelY, panelWidth, panelHeight, 0.98, "panel_alt", depth);
    const title = this.createUiText(panelX + 18, panelY + 14, "Blessed Anvil", {
      fontSize: "22px",
      color: "#f8f1dc",
      depth: depth + 2,
    });
    const subtitle = this.createUiText(panelX + 18, panelY + 42, "Place any equipment item, load a blessed paper, then press Upgrade.", {
      fontSize: "12px",
      color: "#b8c5c9",
      wordWrapWidth: 360,
      depth: depth + 2,
    });
    const goldText = this.createUiText(panelX + panelWidth - 18, panelY + 18, "", {
      fontSize: "14px",
      color: "#e8d45c",
      align: "right",
      depth: depth + 2,
    }).setOrigin(1, 0);

    const rackBg = this.add.rectangle(panelX + 118, panelY + 188, 186, 264, 0x18222c, 0.95)
      .setStrokeStyle(1, 0x334453, 0.85)
      .setScrollFactor(0)
      .setDepth(depth + 1);
    const rackTitle = this.createUiText(panelX + 28, panelY + 72, "Equipment Rack", {
      fontSize: "15px",
      color: "#f4df9c",
      depth: depth + 2,
    });

    const rows = [];
    for (let index = 0; index < 5; index += 1) {
      const rowY = panelY + 96 + index * 46;
      const rowBg = this.add.rectangle(panelX + 118, rowY + 18, 168, 38, 0x22303a, 0.92)
        .setStrokeStyle(1, 0x42515c, 0.9)
        .setScrollFactor(0)
        .setDepth(depth + 2)
        .setInteractive({ useHandCursor: true });
      const icon = this.add.image(panelX + 48, rowY + 18, "icon_05")
        .setScale(0.22)
        .setScrollFactor(0)
        .setDepth(depth + 3);
      const titleText = this.createUiText(panelX + 66, rowY + 4, "", {
        fontSize: "11px",
        color: "#f8f1dc",
        wordWrapWidth: 104,
        depth: depth + 3,
      });
      const metaText = this.createUiText(panelX + 66, rowY + 20, "", {
        fontSize: "10px",
        color: "#9fb2ba",
        wordWrapWidth: 104,
        strokeThickness: 2,
        depth: depth + 3,
      });
      rowBg.on("pointerdown", () => this.selectAnvilWeapon(index));
      rows.push({ bg: rowBg, icon, titleText, metaText });
    }

    const forgeBg = this.add.rectangle(panelX + 378, panelY + 190, 248, 268, 0x141c24, 0.98)
      .setStrokeStyle(2, 0x5b4a2e, 0.9)
      .setScrollFactor(0)
      .setDepth(depth + 1);
    const forgeGlow = this.add.circle(panelX + 378, panelY + 184, 84, 0xe0a04a, 0.08)
      .setStrokeStyle(2, 0xd8c68a, 0.5)
      .setScrollFactor(0)
      .setDepth(depth + 1);
    const forgeTitle = this.createUiText(panelX + 304, panelY + 72, "Forge Tray", {
      fontSize: "15px",
      color: "#f4df9c",
      depth: depth + 2,
    });

    const slotCenters = [
      { x: panelX + 318, y: panelY + 126, label: "Item" },
      { x: panelX + 378, y: panelY + 126, label: "Scroll" },
      { x: panelX + 438, y: panelY + 126, label: "Seal I" },
      { x: panelX + 318, y: panelY + 214, label: "Seal II" },
      { x: panelX + 378, y: panelY + 214, label: "Seal III" },
      { x: panelX + 438, y: panelY + 214, label: "Seal IV" },
    ];
    const slots = slotCenters.map((slot, index) => {
      const bg = this.add.image(slot.x, slot.y, "slot_normal")
        .setDisplaySize(56, 56)
        .setScrollFactor(0)
        .setDepth(depth + 2);
      const icon = this.add.image(slot.x, slot.y, index === 1 ? "icon_01" : "icon_05")
        .setScale(0.24)
        .setScrollFactor(0)
        .setDepth(depth + 3)
        .setAlpha(index < 2 ? 0.18 : 0.12);
      const labelText = this.createUiText(slot.x, slot.y - 40, slot.label, {
        fontSize: "10px",
        color: "#b8c5c9",
        align: "center",
        strokeThickness: 2,
        depth: depth + 3,
      }).setOrigin(0.5);
      const valueText = this.createUiText(slot.x, slot.y + 36, "", {
        fontSize: "10px",
        color: "#d9e0e2",
        align: "center",
        wordWrapWidth: 86,
        strokeThickness: 2,
        depth: depth + 3,
      }).setOrigin(0.5, 0);
      if (index === 1) {
        bg.setInteractive({ useHandCursor: true });
        bg.on("pointerdown", () => this.toggleAnvilScrollLoad());
      }
      return { bg, icon, labelText, valueText };
    });

    const infoBg = this.add.rectangle(panelX + 626, panelY + 188, 198, 264, 0x18222c, 0.95)
      .setStrokeStyle(1, 0x334453, 0.85)
      .setScrollFactor(0)
      .setDepth(depth + 1);
    const infoTitle = this.createUiText(panelX + 538, panelY + 72, "", {
      fontSize: "15px",
      color: "#f4df9c",
      wordWrapWidth: 176,
      depth: depth + 2,
    });
    const infoMeta = this.createUiText(panelX + 538, panelY + 94, "", {
      fontSize: "12px",
      color: "#d7c48d",
      wordWrapWidth: 176,
      depth: depth + 2,
    });
    const infoLines = [];
    for (let index = 0; index < 7; index += 1) {
      infoLines.push(this.createUiText(panelX + 538, panelY + 120 + index * 22, "", {
        fontSize: index >= 5 ? "11px" : "12px",
        color: index >= 5 ? "#9fb2ba" : "#d9e0e2",
        wordWrapWidth: 176,
        depth: depth + 2,
      }));
    }

    const buyScrollBg = this.add.rectangle(panelX + 206, panelY + 362, 176, 36, 0x3d5360, 0.96)
      .setStrokeStyle(1, 0xe0c98a, 0.92)
      .setScrollFactor(0)
      .setDepth(depth + 2)
      .setInteractive({ useHandCursor: true });
    const buyScrollText = this.createUiText(panelX + 206, panelY + 362, "", {
      fontSize: "13px",
      color: "#f8f1dc",
      align: "center",
      depth: depth + 3,
    }).setOrigin(0.5);
    buyScrollBg.on("pointerdown", () => this.buyUpgradePaper());

    const clearBg = this.add.rectangle(panelX + 390, panelY + 362, 122, 36, 0x30414c, 0.96)
      .setStrokeStyle(1, 0x7d97a7, 0.92)
      .setScrollFactor(0)
      .setDepth(depth + 2)
      .setInteractive({ useHandCursor: true });
    const clearText = this.createUiText(panelX + 390, panelY + 362, "Unload", {
      fontSize: "13px",
      color: "#f8f1dc",
      align: "center",
      depth: depth + 3,
    }).setOrigin(0.5);
    clearBg.on("pointerdown", () => this.clearAnvilLoadout());

    const upgradeBg = this.add.rectangle(panelX + 568, panelY + 362, 192, 42, 0x6b3f2b, 0.98)
      .setStrokeStyle(2, 0xe0c98a, 0.96)
      .setScrollFactor(0)
      .setDepth(depth + 2)
      .setInteractive({ useHandCursor: true });
    const upgradeText = this.createUiText(panelX + 568, panelY + 362, "Upgrade", {
      fontSize: "16px",
      color: "#f8f1dc",
      align: "center",
      depth: depth + 3,
    }).setOrigin(0.5);
    upgradeBg.on("pointerdown", () => this.handleAnvilUpgradeConfirm());

    const footer = this.createUiText(panelX + 18, panelY + 384, "Click an equipment row, click the scroll slot to load paper, then press Upgrade. Enter also triggers the forge.", {
      fontSize: "11px",
      color: "#9fb2ba",
      wordWrapWidth: panelWidth - 36,
      depth: depth + 2,
    });

    this.anvilPanelElements = {
      shade,
      panel,
      title,
      subtitle,
      goldText,
      rackBg,
      rackTitle,
      forgeBg,
      forgeGlow,
      forgeTitle,
      infoBg,
      infoTitle,
      infoMeta,
      infoLines,
      footer,
    };
    this.anvilWeaponRows = rows;
    this.anvilSlotVisuals = slots;
    this.anvilButtonVisuals = {
      buyScroll: { bg: buyScrollBg, text: buyScrollText },
      clear: { bg: clearBg, text: clearText },
      upgrade: { bg: upgradeBg, text: upgradeText },
    };
    this.setAnvilPanelVisible(false);
  }

  buildAnvilWeaponSources() {
    return GameState.getUpgradeableEquipmentSources(this.registry);
  }

  getSelectedAnvilWeaponSource() {
    return this.currentAnvilWeapons.find((entry) => entry.key === this.selectedAnvilWeaponKey) || null;
  }

  openAnvilPanel(interactable = null) {
    this.dialogOpen = false;
    this.setDialogVisible(false);
    this.questListOpen = false;
    this.setQuestListVisible(false);
    this.servicePanelOpen = true;
    this.anvilPanelOpen = true;
    this.currentServiceInteractable = interactable || this.currentServiceInteractable || { name: "Blessed Anvil" };
    this.currentServiceType = "anvil";
    this.anvilScrollLoaded = false;
    this.setServicePanelVisible(false);
    this.refreshAnvilPanel();
    this.setAnvilPanelVisible(true);
  }

  setAnvilPanelVisible(visible) {
    if (!this.anvilPanelElements) {
      return;
    }

    Object.values(this.anvilPanelElements).forEach((entry) => {
      if (Array.isArray(entry)) {
        entry.forEach((item) => item.setVisible(visible));
      } else {
        entry.setVisible(visible);
      }
    });
    this.anvilWeaponRows.forEach((row) => {
      row.bg.setVisible(visible);
      row.icon.setVisible(visible);
      row.titleText.setVisible(visible);
      row.metaText.setVisible(visible);
    });
    this.anvilSlotVisuals.forEach((slot) => {
      slot.bg.setVisible(visible);
      slot.icon.setVisible(visible);
      slot.labelText.setVisible(visible);
      slot.valueText.setVisible(visible);
    });
    Object.values(this.anvilButtonVisuals).forEach((button) => {
      button.bg.setVisible(visible);
      button.text.setVisible(visible);
    });
    if (visible) {
      this.setStatusPanelVisibility(false);
    }
  }

  setAnvilButtonState(buttonKey, { label, enabled = true, fillColor, strokeColor = 0xe0c98a, textColor = "#f8f1dc" }) {
    const button = this.anvilButtonVisuals?.[buttonKey];
    if (!button) {
      return;
    }
    button.text.setText(label);
    button.text.setColor(enabled ? textColor : "#8da0aa");
    button.bg.setFillStyle(fillColor, enabled ? 0.98 : 0.55);
    button.bg.setStrokeStyle(buttonKey === "upgrade" ? 2 : 1, enabled ? strokeColor : 0x54606a, 0.96);
  }

  refreshAnvilPanel() {
    if (!this.anvilPanelElements) {
      return;
    }

    this.currentAnvilWeapons = this.buildAnvilWeaponSources();
    if (!this.currentAnvilWeapons.some((entry) => entry.key === this.selectedAnvilWeaponKey)) {
      this.selectedAnvilWeaponKey = this.currentAnvilWeapons[0]?.key || null;
    }

    const selectedSource = this.getSelectedAnvilWeaponSource();
    const item = selectedSource?.item || null;
    const currentLevel = item?.upgradeLevel || 0;
    const targetLevel = Math.min(7, currentLevel + 1);
    const successRate = item ? GameState.getUpgradeSuccessRate(targetLevel) : 0;
    const goldCost = item ? GameState.getUpgradeCost(this.registry, selectedSource) : 0;
    const paperCost = GameState.getUpgradePaperCost(this.registry, selectedSource);
    const paperStock = GameState.getUpgradePaperCount(this.registry);
    const hasPaperLoaded = this.anvilScrollLoaded && paperStock > 0;
    const isMaxWeapon = !!item && currentLevel >= 7;
    const canUpgrade = !!item && hasPaperLoaded && !isMaxWeapon && (this.registry.get("gold") || 0) >= goldCost;

    if (paperStock <= 0) {
      this.anvilScrollLoaded = false;
    }

    this.anvilPanelElements.title.setText("Blessed Anvil");
    this.anvilPanelElements.goldText.setText(`Gold ${this.registry.get("gold") || 0}`);

    this.anvilWeaponRows.forEach((row, index) => {
      const entry = this.currentAnvilWeapons[index];
      if (!entry) {
        row.bg.setVisible(false);
        row.icon.setVisible(false);
        row.titleText.setVisible(false);
        row.metaText.setVisible(false);
        return;
      }

      row.bg.setVisible(this.anvilPanelOpen);
      row.icon.setVisible(this.anvilPanelOpen);
      row.titleText.setVisible(this.anvilPanelOpen);
      row.metaText.setVisible(this.anvilPanelOpen);
      const selected = entry.key === this.selectedAnvilWeaponKey;
      row.bg.setFillStyle(selected ? 0x3a4d58 : 0x22303a, selected ? 0.98 : 0.92);
      row.bg.setStrokeStyle(1, selected ? 0xe0c98a : 0x42515c, 0.95);
      row.icon.setTexture(entry.item?.baseIcon || entry.item?.icon || "icon_05");
      row.icon.setTint(entry.item?.color || 0xffffff);
      row.titleText.setText(entry.item ? this.getDisplayItemName(entry.item) : "Empty");
      row.metaText.setText(entry.item ? `${entry.label} | ${entry.item.slot.toUpperCase()} | +${entry.item.upgradeLevel || 0}` : "");
      row.metaText.setColor(selected ? "#f4df9c" : "#9fb2ba");
    });

    const sealCount = item ? Math.min(4, Math.max(0, targetLevel - 1)) : 0;
    this.anvilSlotVisuals.forEach((slot, index) => {
      slot.bg.setTexture(index === 0 && item ? "slot_active" : index === 1 && hasPaperLoaded ? "slot_active" : "slot_normal");
      slot.icon.clearTint();
      slot.icon.setAlpha(index < 2 ? 0.22 : 0.12);
      slot.valueText.setColor("#d9e0e2");

      if (index === 0) {
        slot.icon.setTexture(item?.baseIcon || item?.icon || "icon_05");
        slot.icon.setTint(item?.color || 0xffffff);
        slot.icon.setAlpha(item ? 1 : 0.18);
        slot.valueText.setText(item ? this.getDisplayItemName(item).replace(" +", "\n+") : "Select\nitem");
      } else if (index === 1) {
        slot.icon.setTexture("icon_01");
        slot.icon.setTint(0xe9d495);
        slot.icon.setAlpha(hasPaperLoaded ? 1 : 0.22);
        slot.valueText.setText(hasPaperLoaded ? `Loaded\nx1` : `Stock ${paperStock}\nClick`);
      } else {
        const sealActive = !!item && (index - 2) < sealCount;
        slot.icon.setTexture(sealActive ? "icon_03" : "icon_10");
        slot.icon.setTint(sealActive ? 0xf0bf6d : 0x6f7d88);
        slot.icon.setAlpha(sealActive ? 0.95 : 0.18);
        slot.valueText.setText(sealActive ? `Ready\n+${targetLevel}` : "Empty");
        slot.valueText.setColor(sealActive ? "#f4df9c" : "#9fb2ba");
      }
    });

    const previewItem = item && !isMaxWeapon ? GameState.applyUpgradeDeltaToItem(item, GameState.getUpgradePreviewDelta(item)) : item;
    this.anvilPanelElements.infoTitle.setText(item ? this.getDisplayItemName(item) : "No Item Loaded");
    this.anvilPanelElements.infoMeta.setText(item ? `${item.slot.toUpperCase()}  |  Trying +${targetLevel}  |  ${successRate}% success` : "Choose an equipment item from the rack.");
    const infoLines = item
      ? [
          `Source: ${selectedSource.label}`,
          `Gold ${goldCost} | Paper x${paperStock}`,
          `${GameState.buildUpgradeStatSummary(item)}${previewItem ? ` -> ${GameState.buildUpgradeStatSummary(previewItem)}` : ""}`,
          isMaxWeapon ? "This item is already capped at +7." : hasPaperLoaded ? "Scroll is loaded. Upgrade is armed." : "Load 1 blessed paper into the tray.",
          "Failure keeps the item safe but still consumes gold and paper.",
          "+2 100% | +3 85% | +4 70%",
          "+5 50% | +6 30% | +7 10%",
        ]
      : [
          "Use the left rack to pick an equipped or bag item.",
          `Blessed paper stock: ${paperStock}`,
          `Next paper cost: ${paperCost} Gold`,
          "Scroll slot must be loaded before forging.",
          "The four seal slots light up as the target plus rises.",
          "+2 100% | +3 85% | +4 70%",
          "+5 50% | +6 30% | +7 10%",
        ];
    this.anvilPanelElements.infoLines.forEach((line, index) => {
      line.setText(infoLines[index] || "");
    });

    this.setAnvilButtonState("buyScroll", {
      label: `Buy Scroll (${paperCost}g)`,
      enabled: (this.registry.get("gold") || 0) >= paperCost,
      fillColor: 0x3d5360,
      strokeColor: 0xe0c98a,
    });
    this.setAnvilButtonState("clear", {
      label: "Unload Scroll",
      enabled: hasPaperLoaded,
      fillColor: 0x30414c,
      strokeColor: 0x7d97a7,
    });
    this.setAnvilButtonState("upgrade", {
      label: isMaxWeapon ? "Max +7" : `Upgrade +${item ? targetLevel : "-"}`,
      enabled: canUpgrade,
      fillColor: canUpgrade ? 0x8a5132 : 0x5d4237,
      strokeColor: 0xe0c98a,
    });
  }

  selectAnvilWeapon(index) {
    const entry = this.currentAnvilWeapons[index];
    if (!entry) {
      return;
    }
    this.selectedAnvilWeaponKey = entry.key;
    this.refreshAnvilPanel();
  }

  toggleAnvilScrollLoad() {
    const paperStock = GameState.getUpgradePaperCount(this.registry);
    if (paperStock <= 0) {
      this.showCityBanner("Need Blessed Paper");
      this.updateCityFeed("Buy blessed paper first.", "The scroll slot needs one paper before the forge can fire.");
      return;
    }
    this.anvilScrollLoaded = !this.anvilScrollLoaded;
    this.refreshAnvilPanel();
  }

  clearAnvilLoadout() {
    this.anvilScrollLoaded = false;
    this.refreshAnvilPanel();
  }

  handleAnvilUpgradeConfirm() {
    const selectedSource = this.getSelectedAnvilWeaponSource();
    const item = selectedSource?.item || null;
    const goldCost = item ? GameState.getUpgradeCost(this.registry, selectedSource) : 0;
    const paperCount = GameState.getUpgradePaperCount(this.registry);

    if (!item) {
      this.showCityBanner("No Item Loaded");
      return;
    }
    if (!this.anvilScrollLoaded) {
      this.showCityBanner("Load Blessed Paper");
      this.updateCityFeed("The scroll slot is empty.", "Click the scroll slot or buy paper first.");
      return;
    }
    if ((this.registry.get("gold") || 0) < goldCost) {
      this.showCityBanner("Not Enough Gold");
      this.updateCityFeed(`Need ${goldCost} Gold`, "Return to the dungeon for more gold.");
      return;
    }
    if (paperCount <= 0) {
      this.showCityBanner("Need Blessed Paper");
      this.updateCityFeed("Paper stock is empty.", "Buy another scroll and reload the slot.");
      this.anvilScrollLoaded = false;
      this.refreshAnvilPanel();
      return;
    }

    const result = GameState.attemptWeaponUpgradeAtSource(this.registry, selectedSource);
    if (!result.ok) {
      this.showCityBanner(result.reason === "max_level" ? "Max Upgrade Reached" : "Upgrade Blocked");
      this.refreshAnvilPanel();
      return;
    }

    this.registry.set("gold", (this.registry.get("gold") || 0) - goldCost);
    this.registry.set("weaponUpgradePaperCount", paperCount - 1);
    this.anvilScrollLoaded = false;
    this.registry.set(
      "citySpendResult",
      result.success
        ? `${this.getDisplayItemName(result.item)} reached +${result.targetLevel}.`
        : `${this.getDisplayItemName(item)} failed at +${result.targetLevel}.`,
    );
    this.playUpgradeRitual(result, goldCost);
  }

  buildCompactItemStatLine(item) {
    const parts = [];
    if (GameState.getItemStatValue(item, "ap")) parts.push(`Damage ${GameState.getItemStatValue(item, "ap")}`);
    if (GameState.getItemStatValue(item, "hp")) parts.push(`HP +${GameState.getItemStatValue(item, "hp")}`);
    if (GameState.getItemStatValue(item, "mp")) parts.push(`MP +${GameState.getItemStatValue(item, "mp")}`);
    if (GameState.getItemStatValue(item, "str")) parts.push(`STR ${GameState.getItemStatValue(item, "str") >= 0 ? "+" : ""}${GameState.getItemStatValue(item, "str")}`);
    if (GameState.getItemStatValue(item, "dex")) parts.push(`DEX ${GameState.getItemStatValue(item, "dex") >= 0 ? "+" : ""}${GameState.getItemStatValue(item, "dex")}`);
    if (GameState.getItemStatValue(item, "hpBonus")) parts.push(`HP Bonus +${GameState.getItemStatValue(item, "hpBonus")}`);
    if (GameState.getItemStatValue(item, "mpBonus")) parts.push(`MP Bonus +${GameState.getItemStatValue(item, "mpBonus")}`);
    return parts.slice(0, 3).join(" | ") || "No bonus";
  }

  getDisplayItemName(item) {
    return GameState.getItemDisplayName?.(item) || item?.name || "Unknown";
  }

  buildRequirementLine(item) {
    const requirement = GameState.getEquipRequirement?.(item, this.registry.get("playerClass") || "warrior");
    if (!requirement) {
      return "Req: None";
    }
    const currentValue = this.registry.get(requirement.statKey) || 0;
    return `Req ${requirement.label} ${requirement.value}  |  You ${currentValue}`;
  }

  buildComparisonLine(item) {
    const comparison = GameState.getEquipmentComparison?.(this.registry, item);
    if (!comparison) {
      return "No compare data";
    }

    const deltaEntries = (comparison.derivedDiffs.length > 0 ? comparison.derivedDiffs : comparison.statDiffs).slice(0, 2);
    const verdictMap = {
      empty: "Open Slot",
      upgrade: "Upgrade",
      downgrade: "Downgrade",
      sidegrade: "Sidegrade",
    };
    const compareTarget = comparison.equippedItem ? this.getDisplayItemName(comparison.equippedItem) : "Nothing equipped";
    const deltaText = deltaEntries.length
      ? deltaEntries.map((entry) => `${entry.label} ${entry.delta >= 0 ? "+" : ""}${entry.delta}`).join(", ")
      : "No change";
    return `${verdictMap[comparison.verdict] || "Compare"} vs ${compareTarget} | ${deltaText}`;
  }

  buildPotionServiceEntries() {
    const hpCost = this.getPotionCost();
    const mpCost = this.getMpPotionCost();
    const hpCount = this.registry.get("healthPotionCount") || 0;
    const mpCount = this.registry.get("mpPotionCount") || 0;

    return [
      {
        title: "Health Potion",
        meta: `Stock ${hpCount} | Buy ${hpCost} | Sell ${Math.floor(hpCost / 2)}`,
        iconKey: "icon_11",
        tint: 0xd67272,
        actionText: "Buy Health Potion",
        detailLines: [
          "Consumable: restores 50 HP.",
          `Hotbar stock: ${hpCount}`,
          `Buy ${hpCost} Gold | Sell ${Math.floor(hpCost / 2)} Gold`,
          `Prep bonus now: +${this.calculatePreparationBonus()}`,
          "Reliable sustain before each dungeon run.",
        ],
        onConfirm: () => this.handlePotionMerchantConfirm(),
      },
      {
        title: "Mana Potion",
        meta: `Stock ${mpCount} | Buy ${mpCost} | Sell ${Math.floor(mpCost / 2)}`,
        iconKey: "icon_11",
        tint: 0x79a6f2,
        actionText: "Buy Mana Potion",
        detailLines: [
          "Consumable: restores 30 MP.",
          `Hotbar stock: ${mpCount}`,
          `Buy ${mpCost} Gold | Sell ${Math.floor(mpCost / 2)} Gold`,
          "Supports class skill uptime inside the dungeon.",
          "Best value on Mage, Rogue, and Archer loops.",
        ],
        onConfirm: () => this.buyMpPotion(),
      },
    ];
  }

  buildBlacksmithServiceEntries() {
    const playerClass = this.registry.get("playerClass") || "warrior";
    const tierIndex = Phaser.Math.Clamp((this.registry.get("playerPowerTier") || 1) - 1, 0, 2);
    const slotOrder = ["weapon", "head", "body", "legs"];
    const entries = slotOrder
      .map((slot) => GameState.CLASS_EQUIPMENT[playerClass]?.[slot]?.[Math.min(tierIndex, (GameState.CLASS_EQUIPMENT[playerClass]?.[slot]?.length || 1) - 1)])
      .filter(Boolean)
      .map((template) => {
        const item = GameState.createInventoryItemFromTemplate(template);
        const buyPrice = GameState.getItemBuyPrice(item);
        const sellPrice = GameState.getItemSellPrice(item);
        return {
          title: this.getDisplayItemName(item),
          meta: `${item.slot.toUpperCase()} | ${this.buildCompactItemStatLine(item)}`,
          iconKey: item.baseIcon || item.icon || "icon_05",
          tint: item.color || 0xffffff,
          actionText: `Buy for ${buyPrice} Gold`,
          detailLines: [
            `${item.slot.toUpperCase()} | ${GameState.getTemplateRarity(item).toUpperCase()}`,
            this.buildCompactItemStatLine(item),
            this.buildRequirementLine(item),
            `Buy ${buyPrice} Gold | Sell ${sellPrice} Gold`,
            this.buildComparisonLine(item),
            "Purchased gear goes into your inventory bag.",
          ],
          onConfirm: () => this.buyBlacksmithItem(item, buyPrice),
        };
      });

    const sellEntries = GameState.getInventoryItems(this.registry)
      .map((item, index) => ({ item, index }))
      .filter((entry) => !!entry.item?.slot)
      .slice(0, 2)
      .map(({ item, index }) => {
        const sellPrice = GameState.getItemSellPrice(item);
        return {
          title: `Sell ${this.getDisplayItemName(item)}`,
          meta: `Bag ${index + 1} | ${item.slot.toUpperCase()} | +${item.upgradeLevel || 0}`,
          iconKey: item.baseIcon || item.icon || "icon_05",
          tint: item.color || 0xffffff,
          actionText: `Sell for ${sellPrice} Gold`,
          detailLines: [
            `${item.slot.toUpperCase()} | ${GameState.getTemplateRarity(item).toUpperCase()}`,
            this.buildCompactItemStatLine(item),
            this.buildRequirementLine(item),
            `Sell ${sellPrice} Gold`,
            this.buildComparisonLine(item),
            "Sells the selected bag item to the blacksmith immediately.",
          ],
          onConfirm: () => this.sellInventoryItem(index),
        };
      });

    entries.push({
      title: "Vital Reinforcement",
      meta: `Forge | HP +20 | Cost ${this.getBlacksmithCost()}`,
      iconKey: "icon_02",
      tint: 0xe59c63,
      actionText: "Forge Vital Reinforcement",
      detailLines: [
        "Permanent city service upgrade.",
        `Current Max HP: ${this.getCurrentMaxHp()} -> ${this.getCurrentMaxHp() + 20}`,
        `Buy ${this.getBlacksmithCost()} Gold | Sell N/A`,
        `Prep bonus: +${this.calculatePreparationBonus()} -> +${this.calculatePreparationBonus({ hpBonusDelta: 20 })}`,
        "This is the old blacksmith reinforcement line, now shown as a real service entry.",
      ],
      onConfirm: () => this.handleBlacksmithConfirm(),
    });

    return [...entries, ...sellEntries];
  }

  buildUpgraderServiceEntries() {
    const playerClass = this.registry.get("playerClass") || "warrior";
    const trainingDef = GameState.getClassTrainingDef(this.registry.get("playerClass") || "warrior");
    const trainingLevel = GameState.getClassTrainingLevel(this.registry);
    const paperCount = GameState.getUpgradePaperCount(this.registry);
    const powerCost = this.getUpgradeCost();
    const trainingCost = GameState.getClassTrainingCost(this.registry);

    return [
      {
        title: "Blessed Anvil",
        meta: `6 Slots | Paper x${paperCount} | KO Forge`,
        iconKey: "icon_10",
        tint: 0xe0c98a,
        actionText: "Open the anvil screen",
        detailLines: [
          "Place any equipment piece in the forge tray.",
          "Load 1 blessed paper into the scroll slot.",
          `Current paper stock: ${paperCount}`,
          "The forge screen now opens like a real KO-style anvil ritual.",
          "You can open the same screen from the physical anvil beside the upgrader.",
        ],
        onConfirm: () => this.openAnvilPanel(this.currentServiceInteractable),
      },
      {
        title: "Power Tier",
        meta: `Tier ${this.registry.get("playerPowerTier")} | Cost ${powerCost}`,
        iconKey: "icon_06",
        tint: 0x77a9ff,
        actionText: `Raise power tier for ${powerCost} Gold`,
        detailLines: [
          `Power Tier ${this.registry.get("playerPowerTier")} -> ${this.registry.get("playerPowerTier") + 1}`,
          "Increases the city preparation curve for future clears.",
          `Buy ${powerCost} Gold | Sell N/A`,
          `Prep bonus: +${this.calculatePreparationBonus()} -> +${this.calculatePreparationBonus({ powerDelta: 1 })}`,
          "A broader account-style progression step for this hero.",
        ],
        onConfirm: () => this.handleUpgraderConfirm(),
      },
      {
        title: trainingDef.name,
        meta: `${playerClass.toUpperCase()} Passive Lv.${trainingLevel} | Cost ${trainingCost}`,
        iconKey: GameState.getClassSkillForClass(playerClass)?.icon || "icon_12",
        tint: GameState.getClassSkillForClass(playerClass)?.tint || 0xf4df9c,
        actionText: `Train passive for ${trainingCost} Gold`,
        detailLines: [
          `${trainingDef.description}`,
          `Current: +${trainingLevel * trainingDef.perLevel} ${trainingDef.statLabel} | Next: +${(trainingLevel + 1) * trainingDef.perLevel} ${trainingDef.statLabel}`,
          `Buy ${trainingCost} Gold | Sell N/A`,
          "This is the new class identity progression layer.",
          "Training is permanent for the current hero and affects every future run.",
        ],
        onConfirm: () => this.handleClassTrainingConfirm(),
      },
    ];
  }

  buildQuestServiceEntries() {
    return this.getQuestEntries().map((entry) => ({
      title: entry.label,
      meta: entry.status,
      iconKey: "icon_08",
      tint: entry.active ? 0xd8b15c : 0x7c8d98,
      actionText: entry.active ? "Press Enter to interact with this quest flow" : "This quest is not actionable right now",
      detailLines: entry.lines,
      onConfirm: entry.active ? () => this.handleQuestGiverConfirm() : null,
    }));
  }

  formatEditorPercent(value) {
    return `${Math.round(value * 100)}%`;
  }

  adjustEditorNumber(path, step, min, max, precision = 0) {
    const current = Number(GameState.getGameConfigValue?.(this.registry, path, min) || 0);
    const next = Phaser.Math.Clamp(Number((current + step).toFixed(precision)), min, max);
    GameState.setGameConfigValue?.(this.registry, path, next);
    return next;
  }

  buildEditorServiceEntries() {
    const difficulty = GameState.getDungeonDifficultyDef?.(this.registry);
    const minMobs = GameState.getGameConfigValue?.(this.registry, "dungeon.roomMinMobs", 1);
    const maxMobs = GameState.getGameConfigValue?.(this.registry, "dungeon.roomMaxMobs", 10);
    const bossHpMultiplier = GameState.getGameConfigValue?.(this.registry, "dungeon.bossBaseHpMultiplier", 1);
    const lowThreshold = GameState.getGameConfigValue?.(this.registry, "dungeon.killQualityLow", 0.45);
    const highThreshold = GameState.getGameConfigValue?.(this.registry, "dungeon.killQualityHigh", 0.9);

    return [
      {
        title: "Dungeon Difficulty",
        meta: `Default ${difficulty?.label || "Normal"}`,
        iconKey: "icon_08",
        tint: difficulty?.color || 0xbfc9d6,
        actionText: "Cycle default difficulty",
        detailLines: [
          "Changes the default dungeon difficulty before entering a route.",
          `Current: ${difficulty?.label || "Normal"}`,
          `HP x${difficulty?.hpMultiplier || 1} | DMG x${difficulty?.damageMultiplier || 1}`,
          `Gold x${difficulty?.goldMultiplier || 1} | EXP x${difficulty?.expMultiplier || 1}`,
          "Use this as the server-style live tuning entry for route challenge.",
        ],
        onConfirm: () => {
          const next = GameState.cycleDungeonDifficulty?.(this.registry);
          this.showCityBanner(`Difficulty: ${(GameState.getDungeonDifficultyDef?.(this.registry, next)?.label || next).toUpperCase()}`);
          this.refreshServicePanel();
        },
      },
      {
        title: "Room Min Mobs",
        meta: `Current ${minMobs}`,
        iconKey: "icon_05",
        tint: 0xd7c48d,
        actionText: "Increase minimum room mobs",
        detailLines: [
          "Every combat room rolls at least this many enemies.",
          `Current: ${minMobs}`,
          `Current max: ${maxMobs}`,
          "The dungeon budget and boss chest quality use these values.",
          "Press Enter to raise it. Reset from the final entry if needed.",
        ],
        onConfirm: () => {
          const next = this.adjustEditorNumber("dungeon.roomMinMobs", 1, 1, 10);
          if (next > GameState.getGameConfigValue?.(this.registry, "dungeon.roomMaxMobs", 10)) {
            GameState.setGameConfigValue?.(this.registry, "dungeon.roomMaxMobs", next);
          }
          this.showCityBanner(`Room Min ${next}`);
          this.refreshServicePanel();
        },
      },
      {
        title: "Room Max Mobs",
        meta: `Current ${maxMobs}`,
        iconKey: "icon_06",
        tint: 0xe0a16f,
        actionText: "Increase maximum room mobs",
        detailLines: [
          "Every combat room rolls up to this many enemies.",
          `Current: ${maxMobs}`,
          `Current min: ${minMobs}`,
          "Three combat rooms can therefore reach up to 30 mobs total.",
          "Press Enter to raise it until 10.",
        ],
        onConfirm: () => {
          const next = this.adjustEditorNumber("dungeon.roomMaxMobs", 1, 1, 10);
          this.showCityBanner(`Room Max ${next}`);
          this.refreshServicePanel();
        },
      },
      {
        title: "Boss HP Scale",
        meta: `x${bossHpMultiplier.toFixed(2)}`,
        iconKey: "icon_10",
        tint: 0xd07b7b,
        actionText: "Raise boss base HP multiplier",
        detailLines: [
          "Global boss HP tuning before difficulty multipliers apply.",
          `Current: x${bossHpMultiplier.toFixed(2)}`,
          "Helps keep bosses from melting too quickly.",
          "Use together with difficulty to create KO-like server settings.",
          "Press Enter to raise it by 0.25.",
        ],
        onConfirm: () => {
          const next = this.adjustEditorNumber("dungeon.bossBaseHpMultiplier", 0.25, 1, 6, 2);
          this.showCityBanner(`Boss HP x${next.toFixed(2)}`);
          this.refreshServicePanel();
        },
      },
      {
        title: "Reward Thresholds",
        meta: `${this.formatEditorPercent(lowThreshold)} / ${this.formatEditorPercent(highThreshold)}`,
        iconKey: "icon_11",
        tint: 0x8ec2ff,
        actionText: "Raise low threshold",
        detailLines: [
          "Boss chest quality uses kill ratio thresholds.",
          `Low tier starts at ${this.formatEditorPercent(lowThreshold)}`,
          `High tier starts at ${this.formatEditorPercent(highThreshold)}`,
          "If the party clears most room mobs, the chest guarantees better gear.",
          "Press Enter to raise the low threshold by 5%.",
        ],
        onConfirm: () => {
          const lowNext = this.adjustEditorNumber("dungeon.killQualityLow", 0.05, 0.25, 0.85, 2);
          const highCurrent = GameState.getGameConfigValue?.(this.registry, "dungeon.killQualityHigh", 0.9);
          if (lowNext >= highCurrent) {
            GameState.setGameConfigValue?.(this.registry, "dungeon.killQualityHigh", Math.min(0.95, lowNext + 0.1));
          }
          this.showCityBanner(`Low Threshold ${this.formatEditorPercent(lowNext)}`);
          this.refreshServicePanel();
        },
      },
      {
        title: "Reset Tuning",
        meta: "Restore server defaults",
        iconKey: "icon_12",
        tint: 0xcfcfcf,
        actionText: "Reset all editor values",
        detailLines: [
          "Restores difficulty, room mob counts, boss HP, and reward thresholds.",
          "Useful if tuning drifts too far during testing.",
          "This is the first admin-style editor foundation entry.",
          "Next systems can be wired into the same config object.",
          "Press Enter to reset everything.",
        ],
        onConfirm: () => {
          GameState.resetGameConfig?.(this.registry);
          this.showCityBanner("Editor Reset");
          this.refreshServicePanel();
        },
      },
    ];
  }

  buildDungeonGateServiceEntries() {
    const selectedDifficultyKey = GameState.getSelectedDungeonDifficultyKey?.(this.registry) || "normal";
    const difficulty = GameState.getDungeonDifficultyDef?.(this.registry, selectedDifficultyKey);
    
    const entries = [];

    // 1. Difficulty Selector Entry
    entries.push({
      key: "difficulty_selector",
      title: `Difficulty: ${difficulty?.label || "Normal"}`,
      meta: "Click to cycle difficulty",
      iconKey: "icon_10",
      tint: difficulty?.color || 0xbfc9d6,
      actionText: "Cycle Difficulty (N / H / VH)",
      detailLines: [
        "Normal: Standard challenge and rewards.",
        "Hard: HP x1.3, DMG x1.2. Better gold and loot.",
        "Very Hard: HP x1.75, DMG x1.45. High rare drop chance.",
        `Current: ${difficulty?.label || "Normal"}`,
        "Select your challenge before entering a route."
      ],
      onConfirm: () => {
        const next = GameState.cycleDungeonDifficulty?.(this.registry);
        this.showCityBanner(`Difficulty: ${(GameState.getDungeonDifficultyDef?.(this.registry, next)?.label || next).toUpperCase()}`);
        this.refreshServicePanel();
      }
    });

    // 2. All 10 Dungeons
    Object.values(GameState.DUNGEON_DEFS).forEach(d => {
      const playerLevel = this.registry.get("playerLevel") || 1;
      const isLocked = (d.unlockLevel || 1) > playerLevel;

      entries.push({
        key: d.id,
        title: d.name + (isLocked ? " (Locked)" : ""),
        meta: `Rec. Lv ${d.recommendedLevel} | Reward: ${d.rewardFocus || "General"}`,
        iconKey: isLocked ? "icon_10" : (d.id === "forgotten_halls" ? "icon_05" : d.id === "ashen_barracks" ? "icon_06" : "icon_08"),
        tint: isLocked ? 0x666666 : (d.id === "forgotten_halls" ? 0xbfc9d6 : d.id === "ashen_barracks" ? 0xe0a16f : 0x7ab6d1),
        actionText: isLocked ? `Unlocks at Level ${d.unlockLevel}` : `Enter ${d.name}`,
        detailLines: [
          d.description || "No description available.",
          `Theme: ${d.theme || "Unknown"}`,
          `Phases: ${d.phases || 4}`,
          `Reward Focus: ${d.rewardFocus || "Balanced"}`,
          isLocked ? `Required Level: ${d.unlockLevel} (Your Level: ${playerLevel})` : "Press Enter to start this route."
        ],
        onConfirm: isLocked ? null : () => {
          const activeDifficultyKey = GameState.getSelectedDungeonDifficultyKey?.(this.registry) || "normal";
          this.closeServicePanel();
          this.scene.start("DungeonPrototypeScene", {
            dungeonVariant: d.id,
            difficultyKey: activeDifficultyKey,
            returnSpawn: { x: 480, y: 282 },
          });
        }
      });
    });

    return entries;
  }

  getServiceEntriesForType(serviceType) {
    if (serviceType === "potion") return this.buildPotionServiceEntries();
    if (serviceType === "blacksmith") return this.buildBlacksmithServiceEntries();
    if (serviceType === "upgrader") return this.buildUpgraderServiceEntries();
    if (serviceType === "quest") return this.buildQuestServiceEntries();
    if (serviceType === "dungeon") return this.buildDungeonGateServiceEntries();
    if (serviceType === "editor") return this.buildEditorServiceEntries();
    if (serviceType === "anvil") return [];
    return [];
  }

  openServicePanel(interactable) {
    if (!interactable?.serviceType) {
      return;
    }

    if (interactable.serviceType === "anvil") {
      this.openAnvilPanel(interactable);
      return;
    }
    if (interactable.serviceType === "editor") {
      this.openEditorTool();
      return;
    }

    this.dialogOpen = false;
    this.setDialogVisible(false);
    this.questListOpen = false;
    this.setQuestListVisible(false);
    this.servicePanelOpen = true;
    this.currentServiceInteractable = interactable;
    this.currentServiceType = interactable.serviceType;
    this.selectedServiceIndex = 0;
    this.interactionPrompt?.setVisible(false);
    this.setServicePanelVisible(true);
    this.refreshServicePanel();
  }

  closeServicePanel() {
    this.servicePanelOpen = false;
    this.currentServiceInteractable = null;
    this.currentServiceType = null;
    this.anvilPanelOpen = false;
    this.anvilScrollLoaded = false;
    this.setServicePanelVisible(false);
    this.setAnvilPanelVisible(false);
  }

  setServicePanelVisible(visible) {
    if (!this.servicePanelElements) {
      return;
    }

    Object.entries(this.servicePanelElements).forEach(([key, entry]) => {
      if (Array.isArray(entry)) {
        if (key === "dungeonDifficultyButtons") {
          entry.forEach((item) => {
            item.bg?.setVisible(false);
            item.text?.setVisible(false);
          });
        } else {
          entry.forEach((item) => {
            if (item?.setVisible) {
              item.setVisible(visible);
            }
          });
        }
      } else {
        entry?.setVisible?.(visible);
      }
    });
    this.serviceEntryRows.forEach((row) => {
      row.bg.setVisible(visible);
      row.iconBg.setVisible(visible);
      row.icon.setVisible(visible);
      row.titleText.setVisible(visible);
      row.metaText.setVisible(visible);
    });
    this.servicePanelElements.dungeonDifficultyButtons?.forEach((button) => {
      button.bg.setVisible(false);
      button.text.setVisible(false);
    });
    if (visible) {
      this.setStatusPanelVisibility(false);
    }
  }

  selectServiceEntry(index, refreshOnly = false) {
    this.selectedServiceIndex = Phaser.Math.Clamp(index, 0, Math.max(0, this.currentServiceEntries.length - 1));
    if (refreshOnly) {
      this.refreshServicePanel();
    }
  }

  refreshServicePanel() {
    if (!this.servicePanelElements) {
      return;
    }

    this.currentServiceEntries = this.getServiceEntriesForType(this.currentServiceType);
    this.selectedServiceIndex = Phaser.Math.Clamp(this.selectedServiceIndex, 0, Math.max(0, this.currentServiceEntries.length - 1));

    this.servicePanelElements.title.setText(this.currentServiceInteractable?.name || "Service");
    this.servicePanelElements.goldText.setText(`Gold ${this.registry.get("gold") || 0}`);

    this.serviceEntryRows.forEach((row, index) => {
      const entry = this.currentServiceEntries[index];
      if (!entry) {
        row.bg.setVisible(false);
        row.iconBg.setVisible(false);
        row.icon.setVisible(false);
        row.titleText.setVisible(false);
        row.metaText.setVisible(false);
        return;
      }

      row.bg.setVisible(true);
      row.iconBg.setVisible(true);
      row.icon.setVisible(true);
      row.titleText.setVisible(true);
      row.metaText.setVisible(true);
      const selected = index === this.selectedServiceIndex;
      row.bg.setFillStyle(selected ? 0x304555 : 0x22303a, selected ? 0.98 : 0.9);
      row.bg.setStrokeStyle(1, selected ? 0xe0c98a : 0x42515c, 0.95);
      row.icon.setTexture(entry.iconKey || "icon_05");
      row.icon.setTint(entry.tint || 0xffffff);
      row.titleText.setText(entry.title);
      row.titleText.setColor(entry.onConfirm ? "#f8f1dc" : "#9fb2ba");
      row.metaText.setText(entry.meta);
      row.metaText.setColor(selected ? "#f4df9c" : "#9fb2ba");
    });

    const selectedEntry = this.currentServiceEntries[this.selectedServiceIndex] || this.currentServiceEntries[0];
    if (!selectedEntry) {
      return;
    }

    this.servicePanelElements.detailTitle.setText(selectedEntry.title);
    const activeDifficultyKey = GameState.getSelectedDungeonDifficultyKey?.(this.registry) || "normal";
    const activeDifficulty = GameState.getDungeonDifficultyDef?.(this.registry, activeDifficultyKey);
    this.servicePanelElements.detailMeta.setText(
      this.currentServiceType === "dungeon" && selectedEntry.entryType === "route"
        ? `${selectedEntry.meta || ""} | Difficulty: ${activeDifficulty?.label || "Normal"}`
        : (selectedEntry.meta || "")
    );
    this.servicePanelElements.detailLines.forEach((line, index) => {
      line.setText(selectedEntry.detailLines?.[index] || "");
    });
    const isDungeonRoute = this.currentServiceType === "dungeon" && selectedEntry.entryType === "route";
    this.servicePanelElements.dungeonDifficultyButtons?.forEach((button) => {
      const visible = isDungeonRoute;
      button.bg.setVisible(visible);
      button.text.setVisible(visible);
      if (!visible) {
        return;
      }
      const active = button.key === (GameState.getSelectedDungeonDifficultyKey?.(this.registry) || "normal");
      const tint = GameState.getDungeonDifficultyDef?.(this.registry, button.key)?.color || 0xbfc9d6;
      button.bg.setFillStyle(active ? tint : 0x22303a, active ? 0.98 : 0.96);
      button.bg.setStrokeStyle(1, active ? 0xf4df9c : 0x42515c, 0.95);
      button.text.setColor(active ? "#101820" : "#f8f1dc");
    });
    this.servicePanelElements.actionHint.setText(
      isDungeonRoute
        ? `${selectedEntry.actionText} | Choose Normal / Hard / Nightmare on the right, then press Enter.`
        : (selectedEntry.actionText || "No action available")
    );
  }

  confirmSelectedServiceEntry() {
    const entry = this.currentServiceEntries[this.selectedServiceIndex];
    if (!entry?.onConfirm) {
      this.showCityBanner("No Action");
      return;
    }

    entry.onConfirm();
    if (this.servicePanelOpen && this.currentServiceType === "anvil") {
      this.refreshAnvilPanel();
    } else if (this.servicePanelOpen) {
      this.refreshServicePanel();
    }
  }

  buyMpPotion() {
    const cost = this.getMpPotionCost();
    const gold = this.registry.get("gold");
    if (gold < cost) {
      this.showCityBanner("Not Enough Gold");
      this.updateCityFeed(`Need ${cost} Gold`, "Return to the dungeon for more gold.");
      return;
    }

    this.registry.set("gold", gold - cost);
    this.registry.set("mpPotionCount", (this.registry.get("mpPotionCount") || 0) + 1);
    this.showCityBanner("Mana Potion Purchased");
    this.refreshCityUi();
    this.updateCityFeed(`-${cost} Gold: Mana Potion +1`, `Total: ${this.registry.get("mpPotionCount")} mana potions`);
  }

  buyBlacksmithItem(item, cost) {
    if ((this.registry.get("gold") || 0) < cost) {
      this.showCityBanner("Not Enough Gold");
      this.updateCityFeed(`Need ${cost} Gold`, "Return to the dungeon for more gold.");
      return;
    }

    const inventoryItem = GameState.createInventoryItemFromTemplate(item);
    const inventoryIndex = GameState.addToInventory(this.registry, inventoryItem);
    if (inventoryIndex < 0) {
      this.showCityBanner("Inventory Full");
      this.updateCityFeed("Inventory is full.", "Free a slot before buying more gear.");
      return;
    }

    this.registry.set("gold", this.registry.get("gold") - cost);
    this.showCityBanner(`${this.getDisplayItemName(item)} Purchased`);
    this.refreshCityUi();
    this.updateCityFeed(`-${cost} Gold: ${this.getDisplayItemName(item)}`, `${item.slot.toUpperCase()} added to bag slot ${inventoryIndex + 1}.`);
  }

  sellInventoryItem(index) {
    const result = GameState.sellInventoryItem(this.registry, index);
    if (!result.ok) {
      this.showCityBanner("No Item To Sell");
      return;
    }

    this.showCityBanner(`${this.getDisplayItemName(result.item)} Sold`);
    this.refreshCityUi();
    this.updateCityFeed(`+${result.gold} Gold: ${this.getDisplayItemName(result.item)}`, `Bag slot ${result.index + 1} sold to the blacksmith.`);
  }

  buyUpgradePaper() {
    const selectedSource = this.currentServiceType === "anvil" ? this.getSelectedAnvilWeaponSource() : null;
    const cost = GameState.getUpgradePaperCost(this.registry, selectedSource);
    const gold = this.registry.get("gold") || 0;
    if (gold < cost) {
      this.showCityBanner("Not Enough Gold");
      this.updateCityFeed(`Need ${cost} Gold`, "Return to the dungeon for more gold.");
      return;
    }

    const nextCount = (GameState.getUpgradePaperCount(this.registry) || 0) + 1;
    this.registry.set("gold", gold - cost);
    this.registry.set("weaponUpgradePaperCount", nextCount);
    this.registry.set("citySpendResult", `Blessed paper bought. Stock ${nextCount}.`);
    this.showCityBanner("Paper Purchased");
    this.refreshCityUi();
    this.updateCityFeed(`-${cost} Gold: Blessed Paper`, `Upgrade paper stock is now ${nextCount}.`);
  }

  handleWeaponEnhanceConfirm() {
    const cost = GameState.getUpgradeCost(this.registry);
    const gold = this.registry.get("gold") || 0;
    const weapon = GameState.getEquippedItem(this.registry, "weapon");
    const paperCount = GameState.getUpgradePaperCount(this.registry);

    if (!weapon) {
      this.showCityBanner("No Weapon Equipped");
      return;
    }
    if (gold < cost) {
      this.showCityBanner("Not Enough Gold");
      this.updateCityFeed(`Need ${cost} Gold`, "Return to the dungeon for more gold.");
      return;
    }
    if (paperCount <= 0) {
      this.showCityBanner("Need Blessed Paper");
      this.updateCityFeed("Buy upgrade paper first.", "The upgrader ritual consumes 1 paper per try.");
      return;
    }

    const result = GameState.attemptWeaponUpgrade(this.registry);
    if (!result.ok) {
      this.showCityBanner(result.reason === "max_level" ? "Max Upgrade Reached" : "Upgrade Blocked");
      return;
    }

    this.registry.set("gold", gold - cost);
    this.registry.set("weaponUpgradePaperCount", paperCount - 1);
    this.registry.set(
      "citySpendResult",
      result.success
        ? `${this.getDisplayItemName(result.item)} reached +${result.targetLevel}.`
        : `${weapon.name} failed at +${result.targetLevel}.`,
    );
    this.playUpgradeRitual(result, cost);
  }

  handleClassTrainingConfirm() {
    const cost = GameState.getClassTrainingCost(this.registry);
    const gold = this.registry.get("gold") || 0;
    const trainingDef = GameState.getClassTrainingDef(this.registry.get("playerClass") || "warrior");
    const currentLevel = GameState.getClassTrainingLevel(this.registry);

    if (gold < cost) {
      this.showCityBanner("Not Enough Gold");
      this.updateCityFeed(`Need ${cost} Gold`, "Return to the dungeon for more gold.");
      return;
    }

    this.registry.set("gold", gold - cost);
    this.registry.set("classTrainingLevel", currentLevel + 1);
    this.showCityBanner(`${trainingDef.name} Trained`);
    this.playerSpeed = this.getPlayerSpeed();
    this.refreshCityUi();
    this.updateCityFeed(`-${cost} Gold: ${trainingDef.name} Lv.${currentLevel + 1}`, `${trainingDef.statLabel} bonus is now +${(currentLevel + 1) * trainingDef.perLevel}.`);
  }

  playUpgradeRitual(result, goldCost) {
    this.upgradeRitualActive = true;
    if (this.currentServiceType === "anvil") {
      this.setAnvilPanelVisible(true);
    } else {
      this.setServicePanelVisible(true);
    }
    const { width, height } = this.scale;
    const panelWidth = 430;
    const panelHeight = 238;
    const panelX = width / 2 - panelWidth / 2;
    const panelY = height / 2 - panelHeight / 2 - 14;
    const item = result.item || result.weapon;
    const successColor = result.success ? 0x77d39c : 0xd36f6f;

    const shade = this.add.rectangle(width / 2, height / 2, width, height, 0x091018, 0.5).setScrollFactor(0).setDepth(60);
    const panel = this.createUiPanel(panelX, panelY, panelWidth, panelHeight, 0.98, "panel_alt", 61);
    const title = this.createUiText(width / 2, panelY + 22, "Upgrade Anvil", {
      fontSize: "22px",
      color: "#f8f1dc",
      align: "center",
      depth: 64,
    }).setOrigin(0.5, 0);
    const ritualRing = this.add.circle(width / 2, panelY + 124, 56, 0xe7d49c, 0.12).setStrokeStyle(3, 0xe7d49c, 0.9).setScrollFactor(0).setDepth(62);
    const weaponIcon = this.add.image(width / 2 - 54, panelY + 124, item?.baseIcon || item?.icon || "icon_05").setTint(item?.color || 0xffffff).setScale(0.48).setScrollFactor(0).setDepth(64);
    const paperIcon = this.add.image(width / 2 + 56, panelY + 124, "icon_01").setTint(0xe9d495).setScale(0.46).setScrollFactor(0).setDepth(64);
    const chanceText = this.createUiText(width / 2, panelY + 70, `Trying +${result.targetLevel}  |  ${result.successRate}%`, {
      fontSize: "16px",
      color: "#f4df9c",
      align: "center",
      depth: 64,
    }).setOrigin(0.5, 0);
    const line1 = this.createUiText(width / 2, panelY + 170, result.success ? "Weapon accepted the blessed paper." : "Flames reject the blessing.", {
      fontSize: "14px",
      color: "#d9e0e2",
      align: "center",
      depth: 64,
      wordWrapWidth: 360,
    }).setOrigin(0.5, 0);
    const line2 = this.createUiText(width / 2, panelY + 194, "", {
      fontSize: "18px",
      color: result.success ? "#7de2a3" : "#ff9b8f",
      align: "center",
      depth: 64,
      wordWrapWidth: 360,
    }).setOrigin(0.5, 0);

    this.upgradeRitualElements = [shade, panel, title, ritualRing, weaponIcon, paperIcon, chanceText, line1, line2];

    this.tweens.add({
      targets: [weaponIcon, paperIcon],
      scale: 0.58,
      duration: 320,
      yoyo: true,
      repeat: 1,
    });
    this.tweens.add({
      targets: ritualRing,
      alpha: 0.42,
      scale: 1.18,
      duration: 420,
      yoyo: true,
      repeat: 2,
    });

    this.time.delayedCall(980, () => {
      ritualRing.setStrokeStyle(4, successColor, 1);
      line2.setText(
        result.success
          ? `SUCCESS  ${this.getDisplayItemName(result.item)}  |  ${result.afterSummary}`
          : `FAILED  ${this.getDisplayItemName(item)} stayed +${result.currentLevel}  |  Roll ${result.roll.toFixed(1)}`,
      );
      this.showCityBanner(result.success ? "Upgrade Success" : "Upgrade Failed", 1600);
      this.refreshCityUi();
      this.updateCityFeed(
        result.success
          ? `-${goldCost} Gold, -1 Paper: ${this.getDisplayItemName(result.item)}`
          : `-${goldCost} Gold, -1 Paper: ${this.getDisplayItemName(item)} failed`,
        result.success
          ? `${result.beforeSummary} -> ${result.afterSummary} | Next try will use another blessed paper.`
          : `Chance ${result.successRate}% | Roll ${result.roll.toFixed(1)} | Item stayed safe.`,
      );
    });

    this.time.delayedCall(2480, () => this.closeUpgradeRitual());
  }

  closeUpgradeRitual() {
    this.upgradeRitualElements.forEach((element) => element?.destroy?.());
    this.upgradeRitualElements = [];
    this.upgradeRitualActive = false;
    if (this.servicePanelOpen) {
      if (this.currentServiceType === "anvil") {
        this.refreshAnvilPanel();
      } else {
        this.refreshServicePanel();
      }
    }
  }

  drawSkillBar(width, height) {
    const slotCount = GameState.HOTBAR_SIZE ?? 6;
    const slotSize = 52;
    const gap = 10;
    const totalWidth = slotCount * slotSize + (slotCount - 1) * gap;
    const startX = width / 2 - totalWidth / 2;
    const panelY = height - 84;

    this.createUiPanel(startX - 18, panelY - 14, totalWidth + 36, 74);
    const bagButtonX = startX - 52;
    const charButtonX = startX + totalWidth + 52;

    const bagButtonBg = this.add.rectangle(bagButtonX, panelY + 20, 34, 34, 0x22303a, 0.95)
      .setStrokeStyle(2, 0x8aa3a7, 0.9)
      .setScrollFactor(0)
      .setDepth(20)
      .setInteractive({ useHandCursor: true });
    const bagButtonText = this.createUiText(bagButtonX, panelY + 20, "I", {
      fontSize: "16px",
      color: "#f8f1dc",
      align: "center",
    }).setOrigin(0.5).setDepth(21);
    bagButtonBg.on("pointerdown", () => this.toggleInventoryPanel());

    const charButtonBg = this.add.rectangle(charButtonX, panelY + 20, 34, 34, 0x22303a, 0.95)
      .setStrokeStyle(2, 0x8aa3a7, 0.9)
      .setScrollFactor(0)
      .setDepth(20)
      .setInteractive({ useHandCursor: true });
    const charButtonText = this.createUiText(charButtonX, panelY + 20, "C", {
      fontSize: "16px",
      color: "#f8f1dc",
      align: "center",
    }).setOrigin(0.5).setDepth(21);
    charButtonBg.on("pointerdown", () => this.toggleCharacterPanel());

    this.hotbarSlotVisuals.forEach(v => {
      if (v.bg) v.bg.destroy();
      if (v.icon) v.icon.destroy();
      if (v.keyLabel) v.keyLabel.destroy();
    });
    this.hotbarSlotVisuals = [];
    for (let i = 0; i < slotCount; i++) {
      const slotX = startX + i * (slotSize + gap);
      try {
        const bg = this.add.image(slotX + slotSize / 2, panelY + 20, "slot_normal").setDisplaySize(slotSize, slotSize).setScrollFactor(0).setDepth(20).setInteractive({ dropZone: true });
        bg.input.dropZone = true;
        bg.setData("slotIndex", i);
        const icon = this.add.image(slotX + slotSize / 2, panelY + 20, "icon_11").setScale(0.28).setScrollFactor(0).setDepth(21).setAlpha(0.3);
        const keyLabel = this.createUiText(slotX + slotSize / 2, panelY + 20, `${i + 1}`, { fontSize: "16px", color: "#f4efe6", align: "center" }).setOrigin(0.5);
        this.hotbarSlotVisuals.push({ bg, icon, keyLabel, slotIndex: i });
      } catch (e) {
        const slot = this.add.rectangle(slotX + slotSize / 2, panelY + 20, slotSize, slotSize, 0x31424a, 0.95).setStrokeStyle(2, 0x8aa3a7, 0.85).setScrollFactor(0).setDepth(20).setInteractive({ dropZone: true });
        slot.input.dropZone = true;
        slot.setData("slotIndex", i);
        this.createUiText(slotX + slotSize / 2, panelY + 20, `${i + 1}`, { fontSize: "18px", color: "#f4efe6", align: "center" }).setOrigin(0.5);
        this.hotbarSlotVisuals.push({ bg: slot, icon: null, keyLabel: null, slotIndex: i });
      }
    }
    this.refreshHotbarVisuals();
  }

  setupCityInventoryDragDrop() {
    if (this.cityDragDropBound) {
      return;
    }

    this.input.on("dragstart", (pointer, gameObject) => {
      if (gameObject?.getData("dragSource") !== "city_inventory_consumable") {
        return;
      }
      gameObject.setDepth(80);
      gameObject.setScale(0.32);
    });

    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      if (gameObject?.getData("dragSource") !== "city_inventory_consumable") {
        return;
      }
      gameObject.setPosition(dragX, dragY);
    });

    this.input.on("drop", (pointer, gameObject, dropZone) => {
      if (gameObject?.getData("dragSource") !== "city_inventory_consumable") {
        return;
      }
      const targetIndex = dropZone?.getData?.("slotIndex");
      const itemId = gameObject.getData("itemId");
      if (targetIndex === undefined || targetIndex === null || !itemId) {
        return;
      }
      GameState.setHotbarSlot?.(this.registry, targetIndex, itemId);
      const def = GameState.getConsumableDef?.(itemId);
      this.showCityBanner(`${def?.name || itemId} -> Slot ${targetIndex + 1}`);
      this.refreshInventoryGrid();
      this.refreshHotbarVisuals();
    });

    this.input.on("dragend", (pointer, gameObject) => {
      if (gameObject?.getData("dragSource") !== "city_inventory_consumable") {
        return;
      }
      this.refreshInventoryGrid();
    });

    this.cityDragDropBound = true;
  }

  refreshHotbarVisuals() {
    this.hotbarSlotVisuals.forEach((slot) => {
      if (!slot.icon) return;
      const itemId = GameState.getHotbarSlot?.(this.registry, slot.slotIndex);
      if (itemId) {
        const def = GameState.getConsumableDef?.(itemId);
        if (def) { slot.icon.setTint(def.color); slot.icon.setAlpha(1); slot.bg.setTexture?.("slot_active"); }
      } else {
        slot.icon.setTint(0xffffff); slot.icon.setAlpha(0.3); slot.bg.setTexture?.("slot_normal");
      }
    });
  }

  handleHotbarKeys() {
    if (!this.actionKeys) return;
    const slotCount = GameState.HOTBAR_SIZE ?? 6;
    for (let i = 0; i < slotCount; i++) {
      const keyName = `slot${i + 1}`;
      if (this.actionKeys[keyName] && Phaser.Input.Keyboard.JustDown(this.actionKeys[keyName])) {
        this.useHotbarSlot(i);
      }
    }
  }

  useHotbarSlot(index) {
    const itemId = GameState.getHotbarSlot?.(this.registry, index);
    if (!itemId) return;
    const def = GameState.getConsumableDef?.(itemId);
    if (!def) return;
    const count = this.registry.get(def.countKey) || 0;
    if (count <= 0) { GameState.clearHotbarSlot?.(this.registry, index); this.refreshHotbarVisuals(); return; }
    this.registry.set(def.countKey, count - 1);
    if (count - 1 <= 0) GameState.clearHotbarSlot?.(this.registry, index);
    this.refreshHotbarVisuals();
    this.refreshCityUi();
  }

  /* ══════════════════════════════════════════
     INVENTORY PANEL (I) - 5x4 Grid Only
     ══════════════════════════════════════════ */

  toggleInventoryPanel() {
    this.inventoryOpen = !this.inventoryOpen;
    if (this.inventoryOpen) this.showInventoryPanel();
    else this.hideInventoryPanel();
  }

  showInventoryPanel() {
    this.inventoryOpen = true;
    if (this.servicePanelOpen) {
      this.closeServicePanel();
    }
    if (this.questListOpen) {
      this.questListOpen = false;
      this.setQuestListVisible(false);
    }
    if (this.skillPanelOpen) {
      this.skillPanelOpen = false;
      this.hideSkillPanel?.();
    }
    if (this.characterOpen) {
      this.characterOpen = false;
      this.hideCharacterPanel?.();
    }
    const { width, height } = this.scale;
    const panelX = width / 2 - 190;
    const panelY = height / 2 - 180;

    if (!this.inventoryElements) {
      this.inventoryElements = {};
      this.inventoryElements.panel = this.createUiPanel(panelX, panelY, 380, 360, 0.96, "panel_alt");
      this.inventoryElements.title = this.createUiText(panelX + 16, panelY + 14, "Bag  (I)", { fontSize: "17px", color: "#f8f1dc" });
      this.inventoryElements.subtitle = this.createUiText(panelX + 16, panelY + 38, "Left click to use/assign, Right click to equip", { fontSize: "11px", color: "#8899a6" });
      // Equipment Section (Left/Top)
      this.inventoryElements.equipmentHeader = this.createUiText(panelX + 16, panelY + 62, "Equipment", { fontSize: "12px", color: "#f4df9c", fontStyle: "bold" });

      const equipSlots = GameState.EQUIP_SLOTS;
      const equipLabelMap = { head: "Head", body: "Body", hands: "Hands", legs: "Legs", weapon: "Weapon" };
      
      // Better vertical distribution for equipment
      const positions = {
        head: { x: panelX + 104, y: panelY + 110 },
        hands: { x: panelX + 44, y: panelY + 170 },
        body: { x: panelX + 104, y: panelY + 170 },
        weapon: { x: panelX + 164, y: panelY + 170 },
        legs: { x: panelX + 104, y: panelY + 230 },
      };
      
      equipSlots.forEach((slot, index) => {
        const pos = positions[slot];
        const sx = pos.x;
        const sy = pos.y;
        
        const slotBg = this.add.image(sx, sy, "slot_normal").setDisplaySize(52, 52).setScrollFactor(0).setDepth(20).setInteractive({ useHandCursor: true });
        const slotIcon = this.add.image(sx, sy, "icon_05").setScale(0.3).setScrollFactor(0).setDepth(21).setAlpha(0.18);
        
        const labelY = slot === "head" ? sy - 34 : sy + 34;
        const slotLabel = this.createUiText(sx, labelY, equipLabelMap[slot], {
          fontSize: "10px",
          color: "#b8c5c9",
          align: "center"
        }).setOrigin(0.5).setDepth(21);
        
        const itemText = this.createUiText(sx, sy + 18, "-", {
          fontSize: "9px",
          color: "#d9e0e2",
          align: "center",
          wordWrapWidth: 62
        }).setOrigin(0.5, 0).setDepth(21);

        slotBg.on("pointerdown", () => {
          if (GameState.unequipToInventory(this.registry, slot)) {
            this.showCityBanner(`Unequipped ${equipLabelMap[slot]}`);
            this.playerSpeed = this.getPlayerSpeed();
            this.refreshInventoryEquipment();
            this.refreshInventoryGrid();
            this.refreshCityUi();
            if (this.characterOpen) this.refreshCharacterPanel();
          }
        });
        slotBg.on("pointerover", () => {
          const item = GameState.getEquippedItem(this.registry, slot);
          if (item) {
            this.showTooltipForItem(item, sx, sy, "Click to UNEQUIP");
          }
        });
        slotBg.on("pointerout", () => {
          this.clearInventoryHoverState();
          this.hideItemTooltip();
        });

        this.inventoryEquipSlots.push({ slot, bg: slotBg });
        this.inventoryEquipIcons.push(slotIcon);
        this.inventoryEquipLabels.push(slotLabel);
        this.inventoryEquipItemTexts.push(itemText);
      });

      // Bag Section (Bottom)
      const bagStartY = panelY + 275;
      this.inventoryElements.bagHeader = this.createUiText(panelX + 16, bagStartY - 18, "Bag Items", { fontSize: "12px", color: "#d7c48d", fontStyle: "bold" });

      const gridStartX = panelX + 28;
      const slotSpacing = 68; // Increased spacing

      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 5; col++) {
          const idx = row * 5 + col;
          const sx = gridStartX + col * 68 + 20; // Corrected calculation
          const sy = bagStartY + row * 46 + 20;

          const slotBg = this.add.rectangle(sx, sy, 44, 44, 0x2a3a44, 0.9).setStrokeStyle(2, 0x5f767a, 0.7).setScrollFactor(0).setDepth(19).setInteractive({ useHandCursor: true });
          slotBg.on("pointerdown", (pointer) => this.handleGridSlotClick(idx, pointer));
          slotBg.on("pointerover", () => { slotBg.setStrokeStyle(2, 0x88cc88, 0.9); this.showItemTooltip(idx, sx, sy); });
          slotBg.on("pointerout", () => {
            slotBg.setStrokeStyle(2, 0x5f767a, 0.7);
            this.clearInventoryHoverState();
            this.hideItemTooltip();
          });

          let slotIcon = null;
          try { slotIcon = this.add.image(sx, sy, "icon_11").setScale(0.26).setScrollFactor(0).setDepth(20).setAlpha(0); } catch (e) { /* ok */ }
          const slotCount = this.createUiText(sx + 14, sy + 12, "", { fontSize: "10px", color: "#f8f1dc", align: "right" }).setOrigin(1, 0.5).setDepth(21);

          this.inventoryGridSlots.push(slotBg);
          this.inventoryGridIcons.push(slotIcon);
          this.inventoryGridCounts.push(slotCount);
        }
      }
      
      // Update panel size if needed
      this.inventoryElements.panel.height = 500;
      this.inventoryElements.panel.setPosition(panelX + 190, panelY + 250);
    }

    this.refreshInventoryEquipment();
    this.refreshInventoryGrid();
    this.setInventoryPanelVisible(true);
  }

  showTooltipForItem(item, slotX, slotY, actionLabelOverride = null) {
    if (!item) { this.hideItemTooltip(); return; }

    this.hideItemTooltip();

    const tipW = 220;
    const comparisonLines = this.getItemComparisonLines(item);
    const requirement = item.slot ? GameState.getEquipRequirement?.(item, this.registry.get("playerClass") || "warrior") : null;
    const requirementLine = requirement
      ? `  Req ${requirement.label} ${requirement.value}  |  You ${this.registry.get(requirement.statKey) || 0}`
      : null;
    const statLines = item.stats
      ? Object.entries(item.stats).map(([k, v]) => `  ${k.toUpperCase()} ${v >= 0 ? "+" : ""}${v}`)
      : (item.type === "healHp" ? ["  Heals 50 HP"] : item.type === "restoreMp" ? ["  Restores 30 MP"] : []);
    if (requirementLine) {
      statLines.push(requirementLine);
    }
    const statBlockHeight = Math.max(statLines.length, 1) * 15;
    const compareBlockHeight = comparisonLines.length > 0 ? comparisonLines.length * 14 + 10 : 0;
    const tipH = 88 + statBlockHeight + compareBlockHeight;
    let tipX = slotX + 28;
    let tipY = slotY - tipH / 2;

    const { width, height } = this.scale;
    if (tipX + tipW > width - 10) tipX = slotX - 28 - tipW;
    if (tipY < 10) tipY = 10;
    if (tipY + tipH > height - 10) tipY = height - 10 - tipH;

    const rarityInfo = GameState.RARITIES[item.rarity] || GameState.RARITIES.common;
    const borderColor = rarityInfo.fullColor || 0xcccccc;

    const bg = this.add.rectangle(tipX + tipW / 2, tipY + tipH / 2, tipW, tipH, 0x111a22, 0.96)
      .setStrokeStyle(2, borderColor, 1).setScrollFactor(0).setDepth(30);

    const nameColor = `#${rarityInfo.fullColor.toString(16).padStart(6, "0")}`;
    const nameText = this.add.text(tipX + 12, tipY + 10, this.getDisplayItemName(item), {
      fontFamily: "Trebuchet MS, Arial, sans-serif", fontSize: "15px", fontStyle: "bold", color: nameColor,
    }).setScrollFactor(0).setDepth(31);

    const slotLabel = item.slot ? item.slot.charAt(0).toUpperCase() + item.slot.slice(1) : "Consumable";
    const rarityLabel = item.rarity ? item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1) : "";
    const typeText = this.add.text(tipX + 12, tipY + 30, `${slotLabel} | ${rarityLabel}`, {
      fontFamily: "Trebuchet MS, Arial, sans-serif", fontSize: "11px", color: "#8a99a6",
    }).setScrollFactor(0).setDepth(31);

    const pClass = this.registry.get("playerClass") || "warrior";
    const statsText = this.add.text(tipX + 12, tipY + 50, "", {
      fontFamily: "Trebuchet MS, Arial, sans-serif", fontSize: "13px", color: "#dfe8ea",
    }).setScrollFactor(0).setDepth(31);

    // Build multi-colored stat lines
    let statYOffset = 0;
    statLines.forEach((line, idx) => {
      const statKeyMatch = line.match(/\b(AP|HP|MP|STR|DEX|HP BONUS|MP BONUS)\b/);
      let color = "#dfe8ea";
      if (statKeyMatch) {
        const key = statKeyMatch[1].toLowerCase().replace(' ', '');
        const valMatch = line.match(/([+-]?\d+)/);
        const val = valMatch ? parseInt(valMatch[1]) : 0;
        color = GameState.getItemStatColor(pClass, key, val);
      }
      
      const lineText = this.add.text(tipX + 12, tipY + 50 + statYOffset, line, {
        fontFamily: "Trebuchet MS, Arial, sans-serif", fontSize: "13px", color: color,
      }).setScrollFactor(0).setDepth(31);
      
      if (!this.inventoryTooltipLines) this.inventoryTooltipLines = [];
      this.inventoryTooltipLines.push(lineText);
      statYOffset += 15;
    });

    let compareText = null;
    if (comparisonLines.length > 0) {
      compareText = this.add.text(tipX + 12, tipY + 52 + statBlockHeight, comparisonLines.join("\n"), {
        fontFamily: "Trebuchet MS, Arial, sans-serif", fontSize: "11px", color: "#f4df9c",
      }).setScrollFactor(0).setDepth(31);
    }

    const actionLabel = actionLabelOverride ?? (item.slot ? "Click to EQUIP" : (item.type ? "Click to USE" : ""));
    const actionText = this.add.text(tipX + 12, tipY + tipH - 22, actionLabel, {
      fontFamily: "Trebuchet MS, Arial, sans-serif", fontSize: "11px", fontStyle: "bold", color: "#88cc88",
    }).setScrollFactor(0).setDepth(31);

    if (item.count > 1) {
      const countText = this.add.text(tipX + tipW - 12, tipY + 10, `x${item.count}`, {
        fontFamily: "Trebuchet MS, Arial, sans-serif", fontSize: "12px", color: "#f4df9c",
      }).setOrigin(1, 0).setScrollFactor(0).setDepth(31);
      this.inventoryTooltipElements = { bg, nameText, typeText, statsText, compareText, actionText, countText };
    } else {
      this.inventoryTooltipElements = { bg, nameText, typeText, statsText, compareText, actionText };
    }
  }

  getItemComparisonLines(item) {
    const comparison = item?.slot ? GameState.getEquipmentComparison(this.registry, item) : null;
    if (!comparison) {
      return [];
    }

    if (!this.actionKeys?.compare?.isDown) {
      return ["Hold Shift to compare"];
    }

    const verdictLabels = {
      empty: "Open Slot",
      upgrade: "Upgrade",
      downgrade: "Downgrade",
      sidegrade: "Sidegrade",
    };

    const lines = [
      `${verdictLabels[comparison.verdict] || "Compare"}: ${comparison.equippedItem ? this.getDisplayItemName(comparison.equippedItem) : "Nothing equipped"}`,
    ];

    if (comparison.requirement) {
      lines.push(`  Req ${comparison.requirement.label} ${comparison.requirement.value}`);
    }

    const deltaLines = (comparison.derivedDiffs.length > 0 ? comparison.derivedDiffs : comparison.statDiffs).slice(0, 4);
    if (deltaLines.length === 0) {
      lines.push("  No stat change");
      return lines;
    }

    deltaLines.forEach((entry) => {
      lines.push(`  ${entry.label} ${entry.delta >= 0 ? "+" : ""}${entry.delta}`);
    });

    return lines;
  }

  buildInventoryDisplayEntries() {
    const inventoryItems = GameState.getInventoryItems(this.registry);
    const displayEntries = inventoryItems.map((item, index) => (item ? {
      sourceType: "inventory",
      index,
      item,
    } : null));

    const consumableEntries = GameState.getAvailableConsumables(this.registry).map((def) => ({
      sourceType: "consumable",
      itemId: def.id,
      item: {
        ...def,
        count: def.count,
        icon: "icon_11",
        baseIcon: "icon_11",
        rarity: "common",
      },
    }));

    let consumableCursor = 0;
    for (let i = 0; i < displayEntries.length && consumableCursor < consumableEntries.length; i++) {
      if (!displayEntries[i]) {
        displayEntries[i] = consumableEntries[consumableCursor];
        consumableCursor += 1;
      }
    }

    this.inventoryDisplayEntries = displayEntries;
    return displayEntries;
  }

  getInventoryDisplayEntry(index) {
    if (!this.inventoryDisplayEntries?.length) {
      this.buildInventoryDisplayEntries();
    }
    return this.inventoryDisplayEntries[index] || null;
  }

  assignConsumableToHotbar(itemId) {
    const slotCount = GameState.HOTBAR_SIZE ?? 6;
    for (let i = 0; i < slotCount; i++) {
      if (GameState.getHotbarSlot?.(this.registry, i) === itemId) {
        return { ok: true, alreadyAssigned: true, slotIndex: i };
      }
    }

    for (let i = 0; i < slotCount; i++) {
      if (!GameState.getHotbarSlot?.(this.registry, i)) {
        GameState.setHotbarSlot?.(this.registry, i, itemId);
        return { ok: true, alreadyAssigned: false, slotIndex: i };
      }
    }

    return { ok: false, reason: "hotbar_full" };
  }

  showItemTooltip(index, slotX, slotY) {
    this.inventoryHoverState = { index, slotX, slotY };
    this.inventoryCompareState = !!this.actionKeys?.compare?.isDown;
    const entry = this.getInventoryDisplayEntry(index);
    const item = entry?.item || null;
    const actionLabel = entry?.sourceType === "consumable" ? "Click to ASSIGN HOTBAR" : null;
    this.showTooltipForItem(item, slotX, slotY, actionLabel);
  }

  refreshHoveredInventoryTooltip(force = false) {
    if (!this.inventoryOpen || !this.inventoryHoverState) {
      return;
    }

    const compareState = !!this.actionKeys?.compare?.isDown;
    if (!force && compareState === this.inventoryCompareState) {
      return;
    }

    this.inventoryCompareState = compareState;
    this.showItemTooltip(this.inventoryHoverState.index, this.inventoryHoverState.slotX, this.inventoryHoverState.slotY);
  }

  clearInventoryHoverState() {
    this.inventoryHoverState = null;
    this.inventoryCompareState = !!this.actionKeys?.compare?.isDown;
  }

  hideItemTooltip() {
    if (!this.inventoryTooltipElements) return;
    Object.values(this.inventoryTooltipElements).forEach((el) => { if (el?.destroy) el.destroy(); });
    this.inventoryTooltipElements = null;
    if (this.inventoryTooltipLines) {
      this.inventoryTooltipLines.forEach(l => l.destroy());
      this.inventoryTooltipLines = null;
    }
  }

  handleGridSlotClick(index, pointer) {
    const entry = this.getInventoryDisplayEntry(index);
    if (!entry?.item) return;

    const item = entry.item;
    const isRightClick = pointer && pointer.rightButtonDown();

    if (entry.sourceType === "inventory" && item.slot) {
      if (isRightClick || !isRightClick) { // Allow both for now, but ensure right click works
        const equipResult = GameState.equipFromInventory(this.registry, entry.index);
        if (equipResult?.ok) {
          this.showCityBanner(`Equipped: ${this.getDisplayItemName(item)}`);
          this.playerSpeed = this.getPlayerSpeed();
        } else if (equipResult?.reason === "requirement") {
          this.showCityBanner(`Need ${equipResult.requirement.label} ${equipResult.requirement.value}`);
          this.updateCityFeed(
            `${this.getDisplayItemName(item)} cannot be equipped yet.`,
            `Requirement: ${equipResult.requirement.label} ${equipResult.requirement.value} | Current: ${equipResult.currentValue}`,
          );
        }
      }
    } else if (entry.sourceType === "consumable") {
      const assignResult = this.assignConsumableToHotbar(entry.itemId);
      if (!assignResult.ok) {
        this.showCityBanner("Hotbar Full");
        this.updateCityFeed("No open hotbar slot.", "Use keys 1-6 in the city or dungeon after assigning a potion.");
      } else if (assignResult.alreadyAssigned) {
        this.showCityBanner(`${item.name} already on ${assignResult.slotIndex + 1}`);
      } else {
        this.showCityBanner(`${item.name} -> Slot ${assignResult.slotIndex + 1}`);
        this.updateCityFeed(`${item.name} assigned to hotbar ${assignResult.slotIndex + 1}.`, "Potions now show in the city inventory and can be triggered with number keys.");
      }
      this.refreshHotbarVisuals();
    }

    this.refreshInventoryGrid();
    this.refreshCityUi();
    if (this.characterOpen) this.refreshCharacterPanel();
  }

  refreshInventoryGrid() {
    if (this.inventoryGridSlots.length === 0) return;

    const entries = this.buildInventoryDisplayEntries();

    for (let i = 0; i < this.inventoryGridSlots.length; i++) {
      const slotBg = this.inventoryGridSlots[i];
      const slotIcon = this.inventoryGridIcons[i];
      const slotCount = this.inventoryGridCounts[i];
      const entry = entries[i];
      const item = entry?.item || null;
      const slotCenterX = slotBg.x;
      const slotCenterY = slotBg.y;

      if (item) {
        const iconMap = { head: "icon_01", body: "icon_02", hands: "icon_03", legs: "icon_04", weapon: "icon_05" };
        const iconKey = item.baseIcon || item.icon || (item.slot ? (iconMap[item.slot] || "icon_05") : "icon_11");
        const tint = item.color || GameState.getRarityColor(item.rarity) || (item.id === "hpPotion" ? 0xd67272 : 0x79a6f2);

        slotBg.setFillStyle(0x3a4a54, 0.95);
        if (slotIcon) {
          slotIcon.setPosition(slotCenterX, slotCenterY);
          slotIcon.setTexture(iconKey);
          slotIcon.setTint(tint);
          slotIcon.setAlpha(1);
          if (entry?.sourceType === "consumable") {
            slotIcon.setInteractive({ draggable: true, useHandCursor: true });
            this.input.setDraggable(slotIcon, true);
            slotIcon.setData("dragSource", "city_inventory_consumable");
            slotIcon.setData("itemId", entry.itemId);
          } else {
            slotIcon.disableInteractive();
            slotIcon.removeData("dragSource");
            slotIcon.removeData("itemId");
          }
        }
        slotCount.setText(item.count > 1 ? `${item.count}` : "");
      } else {
        slotBg.setFillStyle(0x2a3a44, 0.9);
        if (slotIcon) {
          slotIcon.disableInteractive();
          slotIcon.removeData("dragSource");
          slotIcon.removeData("itemId");
          slotIcon.setPosition(slotCenterX, slotCenterY);
          slotIcon.setAlpha(0);
        }
        slotCount.setText("");
      }
    }
  }

  refreshInventoryEquipment() {
    if (this.inventoryEquipSlots.length === 0) return;

    const iconMap = { head: "icon_01", body: "icon_02", hands: "icon_03", legs: "icon_04", weapon: "icon_05" };
    this.inventoryEquipSlots.forEach((slotData, index) => {
      const slot = slotData.slot;
      const item = GameState.getEquippedItem(this.registry, slot);
      const icon = this.inventoryEquipIcons[index];
      const itemText = this.inventoryEquipItemTexts[index];

      if (item) {
        slotData.bg.setTexture("slot_active");
        icon.setTexture(item.baseIcon || item.icon || iconMap[slot] || "icon_05");
        icon.setTint(item.color || GameState.getRarityColor(item.rarity));
        icon.setAlpha(1);
        itemText.setText(this.getDisplayItemName(item));
        itemText.setColor("#f8f1dc");
      } else {
        slotData.bg.setTexture("slot_normal");
        icon.setTexture(iconMap[slot] || "icon_05");
        icon.setTint(0x9aa5aa);
        icon.setAlpha(0.18);
        itemText.setText("-");
        itemText.setColor("#66727c");
      }
    });
  }

  hideInventoryPanel() {
    this.inventoryOpen = false;
    this.clearInventoryHoverState();
    this.hideItemTooltip();
    if (this.cityDragGhost?.destroy) {
      this.cityDragGhost.destroy();
    }
    this.cityDragGhost = null;
    this.setInventoryPanelVisible(false);
    this.game?.canvas?.focus();
  }

  setInventoryPanelVisible(visible) {
    if (!this.inventoryElements) return;
    this.inventoryElements.panel.setVisible(visible);
    this.inventoryElements.title.setVisible(visible);
    this.inventoryElements.subtitle.setVisible(visible);
    this.inventoryElements.equipmentHeader.setVisible(visible);
    this.inventoryElements.bagHeader.setVisible(visible);
    this.inventoryGridSlots.forEach((s) => {
      s.setVisible(visible);
      if (s.input) {
        s.input.enabled = visible;
      }
    });
    this.inventoryGridIcons.forEach((i) => {
      if (i) {
        i.setVisible(visible);
        if (i.input) {
          i.input.enabled = visible;
        }
      }
    });
    this.inventoryGridCounts.forEach((c) => c.setVisible(visible));
    this.inventoryEquipSlots.forEach((s) => {
      s.bg.setVisible(visible);
      if (s.bg.input) {
        s.bg.input.enabled = visible;
      }
    });
    this.inventoryEquipIcons.forEach((i) => i.setVisible(visible));
    this.inventoryEquipLabels.forEach((t) => t.setVisible(visible));
    this.inventoryEquipItemTexts.forEach((t) => t.setVisible(visible));
    if (!visible) {
      this.hideItemTooltip();
    }
  }

  /* ══════════════════════════════════════════
     CHARACTER PANEL (C) - Stats & Equipment
     ══════════════════════════════════════════ */


  toggleCharacterPanel() {
    this.characterOpen = !this.characterOpen;
    if (this.characterOpen) {
      this.characterBonusScrollIndex = 0;
      this.showCharacterPanel();
    } else {
      this.hideCharacterPanel();
    }
  }

  showCharacterPanel() {
    if (this.inventoryOpen) this.hideInventoryPanel();
    if (this.servicePanelOpen) this.closeServicePanel();
    if (this.questListOpen) { this.questListOpen = false; this.setQuestListVisible(false); }
    if (this.skillPanelOpen) { this.skillPanelOpen = false; this.hideSkillPanel?.(); }

    const { width, height } = this.scale;
    const panelWidth = 480;
    const panelHeight = 540;
    const panelX = Math.floor((width - panelWidth) / 2);
    const panelY = Math.floor((height - panelHeight) / 2);

    if (!this.characterElements) {
      this.characterElements = {};
      this.characterStaticTexts = [];
      this.characterStatButtons = [];
      const depthBase = 35;

      // Scrim & Background
      this.characterElements.scrim = this.add.rectangle(width / 2, height / 2, width, height, 0x05080c, 0.65)
        .setScrollFactor(0).setDepth(depthBase).setInteractive();
      
      this.characterElements.shadow = this.add.rectangle(panelX + panelWidth / 2, panelY + panelHeight / 2 + 10, panelWidth + 20, panelHeight + 20, 0x000000, 0.4)
        .setScrollFactor(0).setDepth(depthBase + 1);
        
      this.characterElements.panel = this.add.rectangle(panelX + panelWidth / 2, panelY + panelHeight / 2, panelWidth, panelHeight, 0x111923, 0.98)
        .setStrokeStyle(2, 0x4a5d6e, 0.95).setScrollFactor(0).setDepth(depthBase + 2);
        
      this.characterElements.inner = this.add.rectangle(panelX + panelWidth / 2, panelY + panelHeight / 2, panelWidth - 20, panelHeight - 20, 0x16222d, 0.98)
        .setStrokeStyle(1, 0x2d3e4d, 0.9).setScrollFactor(0).setDepth(depthBase + 3);

      // Header
      this.characterElements.header = this.add.rectangle(panelX + panelWidth / 2, panelY + 30, panelWidth - 30, 40, 0x1e2d3d, 0.95)
        .setStrokeStyle(1, 0x3d4e5f, 0.9).setScrollFactor(0).setDepth(depthBase + 4);
      
      this.characterElements.title = this.createUiText(panelX + 25, panelY + 15, "Character (C)", { fontSize: "20px", color: "#f8f1dc", fontStyle: "bold" })
        .setDepth(depthBase + 5);

      this.characterElements.closeBg = this.add.rectangle(panelX + panelWidth - 35, panelY + 30, 32, 28, 0x3d2323, 0.95)
        .setStrokeStyle(1, 0x8a5353, 0.95).setScrollFactor(0).setDepth(depthBase + 5).setInteractive({ useHandCursor: true });
      this.characterElements.closeLabel = this.createUiText(panelX + panelWidth - 35, panelY + 30, "X", { fontSize: "14px", color: "#f8f1dc", fontStyle: "bold" })
        .setOrigin(0.5).setDepth(depthBase + 6);
      
      this.characterElements.closeBg.on("pointerdown", () => this.toggleCharacterPanel());
      this.characterElements.closeBg.on("pointerover", () => this.characterElements.closeBg.setFillStyle(0x5a2e2e, 0.98));
      this.characterElements.closeBg.on("pointerout", () => this.characterElements.closeBg.setFillStyle(0x3d2323, 0.95));

      // Identity Section
      this.characterElements.infoBox = this.add.rectangle(panelX + panelWidth / 2, panelY + 90, panelWidth - 40, 60, 0x1d2b38, 0.95)
        .setStrokeStyle(1, 0x35485a, 0.9).setScrollFactor(0).setDepth(depthBase + 4);
      
      this.characterElements.identityText = this.createUiText(panelX + 35, panelY + 70, "", { fontSize: "18px", color: "#f4df9c", fontStyle: "bold" })
        .setDepth(depthBase + 5);
      this.characterElements.statPointsText = this.createUiText(panelX + 35, panelY + 96, "", { fontSize: "14px", color: "#a6d4a8" })
        .setDepth(depthBase + 5);

      // Stats Section
      const statLabels = ["HP", "MP", "STR", "DEX"];
      const statKeys = ["hpStat", "mpStat", "strStat", "dexStat"];
      
      this.characterElements.statsBox = this.add.rectangle(panelX + panelWidth / 2, panelY + 235, panelWidth - 40, 200, 0x1d2b38, 0.95)
        .setStrokeStyle(1, 0x35485a, 0.9).setScrollFactor(0).setDepth(depthBase + 4);
      
      this.characterStaticTexts.push(this.createUiText(panelX + 35, panelY + 135, "Attributes & Combat Stats", { fontSize: "16px", color: "#d7c48d", fontStyle: "bold" }).setDepth(depthBase + 5));

      for (let i = 0; i < 4; i++) {
        const y = panelY + 165 + i * 38;
        
        // Base Attribute Line: HP: 5 (+17)
        const labelText = this.createUiText(panelX + 35, y, `${statLabels[i]}:`, { fontSize: "14px", color: "#cfdadf" }).setDepth(depthBase + 5);
        const baseValText = this.createUiText(panelX + 75, y, "0", { fontSize: "14px", color: "#f8f1dc" }).setDepth(depthBase + 5);
        const bonusValText = this.createUiText(panelX + 105, y, "(+0)", { fontSize: "14px", color: "#a6d4a8" }).setDepth(depthBase + 5);
        
        // Separator/Arrow
        this.characterStaticTexts.push(this.createUiText(panelX + 165, y, "⇒", { fontSize: "14px", color: "#5d7a8c" }).setDepth(depthBase + 5));
        
        // Derived Combat Stat: MaxHP: 177
        const derivedLabelText = this.createUiText(panelX + 195, y, "", { fontSize: "14px", color: "#f1b36d" }).setDepth(depthBase + 5);
        
        // Special handle for DEX which has two derived stats
        let extraDerivedText = null;
        if (statKeys[i] === "dexStat") {
          extraDerivedText = this.createUiText(panelX + 310, y, "", { fontSize: "14px", color: "#7fb7ea" }).setDepth(depthBase + 5);
        }

        // Allocate Button
        const btnBg = this.add.rectangle(panelX + panelWidth - 55, y + 8, 26, 24, 0x355339, 0.95)
          .setStrokeStyle(1, 0x6eaf64, 0.95).setInteractive({ useHandCursor: true }).setScrollFactor(0).setDepth(depthBase + 5);
        const btnLabel = this.createUiText(panelX + panelWidth - 55, y + 8, "+", { fontSize: "15px", color: "#f8f1dc", fontStyle: "bold" })
          .setOrigin(0.5).setDepth(depthBase + 6);
        
        btnBg.on("pointerdown", () => this.tryAllocateStat(statKeys[i]));
        btnBg.on("pointerover", () => btnBg.setFillStyle(0x4a714c, 0.98));
        btnBg.on("pointerout", () => btnBg.setFillStyle(0x355339, 0.95));

        this.characterStatButtons.push({ 
          key: statKeys[i], 
          baseValText, 
          bonusValText, 
          derivedLabelText, 
          extraDerivedText,
          btnBg, 
          btnLabel 
        });
      }

      // Active Bonuses Section
      this.characterElements.bonusBox = this.add.rectangle(panelX + panelWidth / 2, panelY + 415, panelWidth - 40, 130, 0x1d2b38, 0.95)
        .setStrokeStyle(1, 0x35485a, 0.9).setScrollFactor(0).setDepth(depthBase + 4);
      
      this.characterStaticTexts.push(this.createUiText(panelX + 35, panelY + 355, "Active Bonuses", { fontSize: "16px", color: "#d7c48d", fontStyle: "bold" }).setDepth(depthBase + 5));
      
      this.characterElements.bonusText = this.createUiText(panelX + 45, panelY + 385, "", {
        fontSize: "13px",
        color: "#f4df9c",
        wordWrap: { width: panelWidth - 90 },
        lineSpacing: 6
      }).setDepth(depthBase + 5);

      this.characterElements.bonusHintText = this.createUiText(panelX + panelWidth / 2, panelY + 465, "", {
        fontSize: "11px",
        color: "#98aab4",
        align: "center"
      }).setOrigin(0.5).setDepth(depthBase + 5);

      this.characterElements.bonusViewportBounds = {
        left: panelX + 20,
        right: panelX + panelWidth - 20,
        top: panelY + 380,
        bottom: panelY + 480,
      };

      // Resources Footer
      this.characterElements.footer = this.add.rectangle(panelX + panelWidth / 2, panelY + 510, panelWidth - 40, 34, 0x1a242d, 0.9)
        .setStrokeStyle(1, 0x334453, 0.8).setScrollFactor(0).setDepth(depthBase + 4);
      
      this.characterElements.goldText = this.createUiText(panelX + 40, panelY + 500, "", { fontSize: "14px", color: "#e8d45c" }).setDepth(depthBase + 5);
      this.characterElements.potionsText = this.createUiText(panelX + 180, panelY + 500, "", { fontSize: "14px", color: "#cfdadf" }).setDepth(depthBase + 5);
    }

    this.refreshCharacterPanel();
    this.setCharacterPanelVisible(true);
  }

  refreshCharacterPanel() {
    if (!this.characterElements) return;

    const charName = this.registry.get("characterName") || "Wanderer";
    const playerClass = (this.registry.get("playerClass") || "warrior").toUpperCase();
    const playerLevel = this.registry.get("playerLevel") || 1;
    this.characterElements.identityText.setText(`${charName} | Level ${playerLevel} | ${playerClass}`);
    
    const points = this.registry.get("statPoints") || 0;
    this.characterElements.statPointsText.setText(`Available Stat Points: ${points}`);

    const statKeys = ["hpStat", "mpStat", "strStat", "dexStat"];
    const baseStats = statKeys.map(key => this.registry.get(key) || 0);
    
    // Calculate final totals using GameState to get bonuses
    const maxHp = this.getCurrentMaxHp();
    const maxMp = this.getCurrentMaxMp();
    const atk = GameState.getTotalAttack(this.registry);
    const def = GameState.getTotalDefense(this.registry);
    const spd = this.getPlayerSpeed();

    const combatStats = [
      { label: "MaxHP", total: maxHp },
      { label: "MaxMP", total: maxMp },
      { label: "ATK", total: atk },
      { label: "SPD", total: spd, label2: "DEF", total2: def }
    ];

    this.characterStatButtons.forEach((btn, i) => {
      const baseVal = baseStats[i];
      const combat = combatStats[i];
      const statKeyShort = statKeys[i].replace("Stat", "");
      const bonusAttr = GameState.getItemStatBonus(this.registry, statKeyShort);
      
      btn.baseValText.setText(`${baseVal}`);
      
      // KO style color coding for bonus stats
      const pClass = this.registry.get("playerClass") || "warrior";
      const isPrimary = GameState.isClassPrimaryStat(pClass, statKeyShort);
      const bonusColor = bonusAttr > 0 ? (isPrimary ? "#7de2a3" : "#a6d4a8") : "#8899a6";
      
      btn.bonusValText.setText(`(+${bonusAttr})`).setColor(bonusColor);
      
      btn.derivedLabelText.setText(`${combat.label}: ${combat.total}`);
      if (btn.extraDerivedText) {
        btn.extraDerivedText.setText(`${combat.label2}: ${combat.total2}`);
      }

      const canSpend = points > 0;
      btn.btnBg.setVisible(canSpend);
      btn.btnLabel.setVisible(canSpend);
    });

    this.characterElements.goldText.setText(`Gold: ${this.registry.get("gold") || 0}`);
    this.characterElements.potionsText.setText(`Potions: ${this.registry.get("healthPotionCount") || 0} HP / ${this.registry.get("mpPotionCount") || 0} MP`);

    // Active Bonuses Logic
    const setBonuses = GameState.getSetBonusesForEquipped?.(this.registry) ?? [];
    const bonusEntries = setBonuses.map((b) => `- ${b.name} (${b.pieces}/${b.maxPieces}): ${b.effect}`);
    
    const maxHpBonus = this.registry.get("maxHpBonus") || 0;
    const powerTier = this.registry.get("playerPowerTier") || 1;
    const trainingDef = GameState.getClassTrainingDef?.(this.registry.get("playerClass") || "warrior");
    const trainingLevel = GameState.getClassTrainingLevel?.(this.registry) || 0;
    const weapon = GameState.getEquippedItem?.(this.registry, "weapon");

    if (maxHpBonus > 0) bonusEntries.push(`- Vital Reinforcement: HP +${maxHpBonus}`);
    if (powerTier > 1) bonusEntries.push(`- Power Tier ${powerTier}: AP scaling active`);
    if (trainingLevel > 0 && trainingDef) bonusEntries.push(`- ${trainingDef.name}: +${trainingLevel * trainingDef.perLevel} ${trainingDef.statLabel}`);
    if (weapon?.upgradeLevel > 0) bonusEntries.push(`- ${weapon.name}: Upgrade +${weapon.upgradeLevel}`);
    
    if (bonusEntries.length === 0) bonusEntries.push("- No active bonuses yet");

    this.characterBonusEntries = bonusEntries;
    const visibleCount = 4;
    const maxStart = Math.max(0, bonusEntries.length - visibleCount);
    this.characterBonusScrollIndex = Phaser.Math.Clamp(this.characterBonusScrollIndex || 0, 0, maxStart);
    
    const visibleEntries = bonusEntries.slice(this.characterBonusScrollIndex, this.characterBonusScrollIndex + visibleCount);
    this.characterElements.bonusText.setText(visibleEntries.join("\n"));
    
    if (bonusEntries.length > visibleCount) {
      this.characterElements.bonusHintText.setText(`Scroll for more (${this.characterBonusScrollIndex + 1}/${bonusEntries.length})`);
    } else {
      this.characterElements.bonusHintText.setText("");
    }
  }

  hideCharacterPanel() {
    this.setCharacterPanelVisible(false);
  }

  setCharacterPanelVisible(visible) {
    if (!this.characterElements) return;
    Object.values(this.characterElements).forEach((el) => { if (el?.setVisible) el.setVisible(visible); });
    
    const points = this.registry.get("statPoints") || 0;
    this.characterStatButtons.forEach((btn) => {
      btn.baseValText.setVisible(visible);
      btn.bonusValText.setVisible(visible);
      btn.derivedLabelText.setVisible(visible);
      if (btn.extraDerivedText) btn.extraDerivedText.setVisible(visible);
      
      const canSpend = visible && points > 0;
      btn.btnBg.setVisible(canSpend);
      btn.btnLabel.setVisible(canSpend);
    });
    
    if (this.characterStaticTexts) this.characterStaticTexts.forEach((t) => t.setVisible(visible));
  }

  handleCharacterBonusWheel(pointer, gameObjects, deltaX, deltaY) {
    if (!this.characterOpen || !this.characterElements?.bonusViewportBounds || this.characterBonusEntries.length <= 4) return;
    const bounds = this.characterElements.bonusViewportBounds;
    if (pointer.x < bounds.left || pointer.x > bounds.right || pointer.y < bounds.top || pointer.y > bounds.bottom) return;
    
    const step = deltaY > 0 ? 1 : -1;
    const maxStart = Math.max(0, this.characterBonusEntries.length - 4);
    const nextIndex = Phaser.Math.Clamp((this.characterBonusScrollIndex || 0) + step, 0, maxStart);
    
    if (nextIndex !== this.characterBonusScrollIndex) {
      this.characterBonusScrollIndex = nextIndex;
      this.refreshCharacterPanel();
    }
  }

  /* ══════════════════════════════════════════
     SKILL PANEL
     ══════════════════════════════════════════ */

  toggleSkillPanel() {
    this.skillPanelOpen = !this.skillPanelOpen;
    if (this.skillPanelOpen) this.showSkillPanel();
    else this.hideSkillPanel();
  }

  showSkillPanel() {
    if (!this.skillPanelElements) {
      const { width, height } = this.scale;
      const panelX = width / 2 + 60;
      const panelY = height / 2 - 140;
      this.skillPanelElements = {};
      this.skillPanelElements.panel = this.createUiPanel(panelX, panelY, 280, 280, 0.96);
      this.skillPanelElements.title = this.createUiText(panelX + 14, panelY + 14, "Skills  (K)", { fontSize: "17px", color: "#f8f1dc" });
      this.skillPanelElements.infoText = this.createUiText(panelX + 14, panelY + 44, "", { fontSize: "14px", color: "#dfe8ea", wordWrapWidth: 250 });

      const playerClass = this.registry.get("playerClass") || "warrior";
      const skills = this.getClassSkills(playerClass);
      this.skillPanelElements.skillTexts = [];
      skills.forEach((skill, i) => {
        const text = this.createUiText(panelX + 14, panelY + 70 + i * 28, `• ${skill.name}: ${skill.description}`, { fontSize: "13px", color: "#f8f1dc", wordWrapWidth: 250 });
        this.skillPanelElements.skillTexts.push(text);
      });
    }
    this.refreshSkillPanel();
    this.setSkillPanelVisible(true);
  }

  refreshSkillPanel() {
    if (!this.skillPanelElements) return;
    const ap = this.getWeaponAp();
    const speed = this.getPlayerSpeed();
    this.skillPanelElements.infoText.setText(
      `Class: ${(this.registry.get("playerClass") || "warrior").toUpperCase()}\nAP: ${ap} | Speed: ${speed}\nCycles: ${this.registry.get("dungeonCycles")} | Tier: ${this.registry.get("playerPowerTier")}`
    );
  }

  getClassSkills(playerClass) {
    const ap = this.getWeaponAp();
    const skillMap = {
      warrior: [{ name: "Power Strike", description: `F: heavy melee hit for ${Math.floor(ap * 1.7)} damage` }, { name: "Iron Will", description: "+20% HP from equipment" }, { name: "Shield Bash", description: "Future stun / control skill" }],
      mage: [{ name: "Arcane Bolt", description: `F: ranged spell for ${Math.floor(ap * 1.4)} damage` }, { name: "Mana Shield", description: "Future absorb barrier" }, { name: "Fireball", description: "Future AoE burst skill" }],
      rogue: [{ name: "Shadow Step", description: `F: blink slash for ${Math.floor(ap * 1.5)} damage` }, { name: "Backstab", description: "Future crit opener skill" }, { name: "Poison Blade", description: "Future DoT skill" }],
      archer: [{ name: "Power Shot", description: `F: long-range shot for ${Math.floor(ap * 1.35)} damage` }, { name: "Multishot", description: "Future multi-target attack" }, { name: "Eagle Eye", description: "Future crit-focused passive" }],
    };
    return skillMap[playerClass] || skillMap.warrior;
  }

  hideSkillPanel() { this.setSkillPanelVisible(false); }

  setSkillPanelVisible(visible) {
    if (!this.skillPanelElements) return;
    this.skillPanelElements.panel.setVisible(visible);
    this.skillPanelElements.title.setVisible(visible);
    this.skillPanelElements.infoText.setVisible(visible);
    this.skillPanelElements.skillTexts?.forEach((t) => t.setVisible(visible));
  }

  showSkillPanel() {
    if (!this.skillPanelElements || !this.skillPanelElements.modernLayout) {
      if (this.skillPanelElements) {
        Object.values(this.skillPanelElements).forEach((entry) => {
          if (Array.isArray(entry)) {
            entry.forEach((item) => {
              if (item?.destroy) item.destroy();
              if (item && typeof item === "object") {
                Object.values(item).forEach((sub) => { if (sub?.destroy) sub.destroy(); });
              }
            });
          } else if (entry?.destroy) {
            entry.destroy();
          }
        });
      }

      const { width, height } = this.scale;
      const panelX = width / 2 + 32;
      const panelY = height / 2 - 170;
      this.skillPanelElements = { modernLayout: true };
      this.skillPanelElements.panel = this.createUiPanel(panelX, panelY, 336, 338, 0.96, "panel_alt");
      this.skillPanelElements.title = this.createUiText(panelX + 16, panelY + 14, "Skills  (K)", { fontSize: "18px", color: "#f8f1dc" });
      this.skillPanelElements.infoText = this.createUiText(panelX + 16, panelY + 42, "", { fontSize: "13px", color: "#dfe8ea", wordWrapWidth: 302 });
      this.skillPanelElements.skillCards = [];

      const skills = this.getClassSkills(this.registry.get("playerClass") || "warrior");
      skills.forEach((skill, i) => {
        const cardY = panelY + 84 + i * 74;
        const cardBg = this.add.rectangle(panelX + 168, cardY + 24, 304, 60, 0x1a2430, 0.96)
          .setStrokeStyle(1, 0x455867, 0.9)
          .setScrollFactor(0)
          .setDepth(20);
        const iconBg = this.add.image(panelX + 40, cardY + 24, "slot_normal")
          .setDisplaySize(44, 44)
          .setScrollFactor(0)
          .setDepth(21);
        const icon = this.add.image(panelX + 40, cardY + 24, skill.icon || "icon_05")
          .setScale(0.24)
          .setTint(skill.tint || 0xffffff)
          .setScrollFactor(0)
          .setDepth(22);
        const nameText = this.createUiText(panelX + 68, cardY + 4, skill.name, { fontSize: "14px", color: "#f8f1dc", wordWrapWidth: 170 });
        const tagText = this.createUiText(panelX + 292, cardY + 4, skill.tag, { fontSize: "11px", color: "#d7c48d", align: "right" }).setOrigin(1, 0);
        const descText = this.createUiText(panelX + 68, cardY + 25, skill.description, { fontSize: "12px", color: "#d9e0e2", wordWrapWidth: 220 });
        this.skillPanelElements.skillCards.push({ cardBg, iconBg, icon, nameText, tagText, descText });
      });

      this.skillPanelElements.hint = this.createUiText(panelX + 16, panelY + 312, "Use F in dungeon for the active class skill. Press K to close.", {
        fontSize: "12px",
        color: "#b7c8cb",
        wordWrapWidth: 302,
      });
    }
    this.refreshSkillPanel();
    this.setSkillPanelVisible(true);
  }

  refreshSkillPanel() {
    if (!this.skillPanelElements) return;
    const ap = this.getWeaponAp();
    const speed = this.getPlayerSpeed();
    this.skillPanelElements.infoText.setText(
      `Class: ${(this.registry.get("playerClass") || "warrior").toUpperCase()}\nAP: ${ap} | Speed: ${speed}\nCycles: ${this.registry.get("dungeonCycles")} | Tier: ${this.registry.get("playerPowerTier")}`
    );
  }

  getClassSkills(playerClass) {
    const ap = this.getWeaponAp();
    const skillMap = {
      warrior: [
        { name: "Power Strike", description: `Heavy melee hit for ${Math.floor(ap * 1.7)} damage.`, icon: "icon_05", tint: 0xd98852, tag: "Active  F" },
        { name: "Iron Will", description: "Current gear path leans into HP and front-line durability.", icon: "icon_01", tint: 0xb8c9d9, tag: "Passive" },
        { name: "Shield Bash", description: "Reserved for the next control-focused warrior pass.", icon: "icon_03", tint: 0xa8b38e, tag: "Future" },
      ],
      mage: [
        { name: "Arcane Bolt", description: `Ranged spell hit for ${Math.floor(ap * 1.4)} damage.`, icon: "icon_06", tint: 0x77a9ff, tag: "Active  F" },
        { name: "Mana Shield", description: "Future defensive spell layer with mana-based mitigation.", icon: "icon_02", tint: 0x8f7fff, tag: "Passive" },
        { name: "Fireball", description: "Reserved AoE burst slot for the next mage expansion pass.", icon: "icon_05", tint: 0xff9a52, tag: "Future" },
      ],
      rogue: [
        { name: "Shadow Step", description: `Blink forward and slash for ${Math.floor(ap * 1.5)} damage.`, icon: "icon_08", tint: 0xae7cff, tag: "Active  F" },
        { name: "Backstab", description: "Future crit opener that will reward positioning and timing.", icon: "icon_03", tint: 0xd7c48d, tag: "Passive" },
        { name: "Poison Blade", description: "Reserved DoT utility slot for later rogue depth.", icon: "icon_11", tint: 0x67b26f, tag: "Future" },
      ],
      archer: [
        { name: "Power Shot", description: `Long-range shot for ${Math.floor(ap * 1.35)} damage.`, icon: "icon_05", tint: 0xd8b15c, tag: "Active  F" },
        { name: "Multishot", description: "Future spread attack for multi-target ranged pressure.", icon: "icon_12", tint: 0xa8c46a, tag: "Passive" },
        { name: "Eagle Eye", description: "Reserved crit/precision upgrade track for later passes.", icon: "icon_01", tint: 0x8bb8d8, tag: "Future" },
      ],
    };
    return skillMap[playerClass] || skillMap.warrior;
  }

  setSkillPanelVisible(visible) {
    if (!this.skillPanelElements) return;
    this.skillPanelElements.panel.setVisible(visible);
    this.skillPanelElements.title.setVisible(visible);
    this.skillPanelElements.infoText.setVisible(visible);
    this.skillPanelElements.skillCards?.forEach((card) => {
      card.cardBg.setVisible(visible);
      card.iconBg.setVisible(visible);
      card.icon.setVisible(visible);
      card.nameText.setVisible(visible);
      card.tagText.setVisible(visible);
      card.descText.setVisible(visible);
    });
    this.skillPanelElements.hint?.setVisible(visible);
  }

  /* ══════════════════════════════════════════
     INTERACTION & DIALOG
     ══════════════════════════════════════════ */

  createInteractionUi(width, height) {
    this.interactionPrompt = this.createUiText(width / 2, height - 138, "Press E to interact", {
      fontSize: "18px", color: "#f8f1dc", align: "center",
    }).setOrigin(0.5);
    this.interactionPrompt.setBackgroundColor("#22303a");
    this.interactionPrompt.setPadding(10, 6, 10, 6);
    this.interactionPrompt.setVisible(false);

    const dialogPanel = this.createUiPanel(width / 2 - 240, height - 260, 480, 132, 0.95, "panel_alt");
    const dialogTitle = this.createUiText(width / 2 - 220, height - 242, "", { fontSize: "20px", color: "#f8f1dc" });
    const dialogBody = this.createUiText(width / 2 - 220, height - 208, "", { fontSize: "17px", color: "#dde6e7", wordWrapWidth: 430 });
    const dialogHint = this.createUiText(width / 2 - 220, height - 124, "Press E or Esc to close", { fontSize: "15px", color: "#b7c8cb" });

    this.dialogElements = { panel: dialogPanel, title: dialogTitle, body: dialogBody, hint: dialogHint };
    this.setDialogVisible(false);
  }

  updateInteractionPrompt() {
    if (this.servicePanelOpen) {
      this.interactionPrompt.setVisible(false);
      return;
    }
    this.activeInteractable = this.findNearbyInteractable();
    if (!this.activeInteractable) { this.interactionPrompt.setVisible(false); return; }
    const promptKey = this.activeInteractable.serviceType ? "Press E or Enter" : "Press E";
    this.interactionPrompt.setText(`${promptKey}: ${this.activeInteractable.name}`);
    this.interactionPrompt.setVisible(true);
  }

  findNearbyInteractable() {
    let closest = null;
    let closestDistance = Number.POSITIVE_INFINITY;
    this.interactables.forEach((interactable) => {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, interactable.x, interactable.y);
      if (distance <= interactable.promptRadius && distance < closestDistance) { closest = interactable; closestDistance = distance; }
    });
    return closest;
  }

  openDialog(interactable) {
    if (interactable?.serviceType) {
      this.openServicePanel(interactable);
      return;
    }
    this.dialogOpen = true;
    this.activeInteractable = interactable;
    this.interactionPrompt.setVisible(false);
    this.dialogElements.title.setText(interactable.name);
    this.dialogElements.body.setText(this.resolveInteractableValue(interactable.dialogText, interactable));
    this.dialogElements.hint.setText(this.resolveInteractableValue(interactable.dialogHintText, interactable));
    this.setDialogVisible(true);
  }

  closeDialog() {
    if (this.servicePanelOpen) {
      this.closeServicePanel();
      return;
    }
    this.dialogOpen = false;
    this.setDialogVisible(false);
  }

  setDialogVisible(visible) {
    this.dialogElements.panel.setVisible(visible);
    this.dialogElements.title.setVisible(visible);
    this.dialogElements.body.setVisible(visible);
    this.dialogElements.hint.setVisible(visible);
  }

  resolveInteractableValue(value, interactable) {
    return typeof value === "function" ? value(interactable) : value;
  }

  updateMinimapPlayerMarker() {
    if (!this.player || !this.minimapInnerBounds || !this.minimapPlayerDot || !this.minimapPlayerGlow) {
      return;
    }

    const worldLeft = 48;
    const worldTop = 48;
    const worldWidth = this.scale.width - 96;
    const worldHeight = this.scale.height - 96;
    const ratioX = Phaser.Math.Clamp((this.player.x - worldLeft) / worldWidth, 0, 1);
    const ratioY = Phaser.Math.Clamp((this.player.y - worldTop) / worldHeight, 0, 1);
    const dotX = this.minimapInnerBounds.x + ratioX * this.minimapInnerBounds.width;
    const dotY = this.minimapInnerBounds.y + ratioY * this.minimapInnerBounds.height;

    this.minimapPlayerGlow.setPosition(dotX, dotY);
    this.minimapPlayerDot.setPosition(dotX, dotY);
  }

  /* ══════════════════════════════════════════
     CITY HEADER & HELPERS
     ══════════════════════════════════════════ */

  drawCityHeader(width) {
    this.add.text(width / 2, 34, "Prototype City Hub", {
      fontFamily: "Arial, sans-serif", fontSize: "28px", color: "#f4efe6", backgroundColor: "#22303a", padding: { x: 12, y: 6 },
    }).setOrigin(0.5);

    this.cityBannerText = this.createUiText(width / 2, 112, "", { fontSize: "22px", color: "#f8f1dc", align: "center" }).setOrigin(0.5);
    this.cityBannerText.setBackgroundColor("#24313a");
    this.cityBannerText.setPadding(12, 6, 12, 6);
    this.cityBannerText.setVisible(false);
    
    this.createWasdIndicator();
  }

  createWasdIndicator() {
    const startX = 26;
    const startY = 32;
    this.add.rectangle(startX + 30, startY, 26, 26, 0x182430, 0.8).setStrokeStyle(1, 0x334453).setScrollFactor(0).setDepth(20);
    this.createUiText(startX + 30, startY, "W", { fontSize: "14px", color: "#b8c5c9", depth: 21 }).setOrigin(0.5);
    
    this.add.rectangle(startX, startY + 30, 26, 26, 0x182430, 0.8).setStrokeStyle(1, 0x334453).setScrollFactor(0).setDepth(20);
    this.createUiText(startX, startY + 30, "A", { fontSize: "14px", color: "#b8c5c9", depth: 21 }).setOrigin(0.5);

    this.add.rectangle(startX + 30, startY + 30, 26, 26, 0x182430, 0.8).setStrokeStyle(1, 0x334453).setScrollFactor(0).setDepth(20);
    this.createUiText(startX + 30, startY + 30, "S", { fontSize: "14px", color: "#b8c5c9", depth: 21 }).setOrigin(0.5);

    this.add.rectangle(startX + 60, startY + 30, 26, 26, 0x182430, 0.8).setStrokeStyle(1, 0x334453).setScrollFactor(0).setDepth(20);
    this.createUiText(startX + 60, startY + 30, "D", { fontSize: "14px", color: "#b8c5c9", depth: 21 }).setOrigin(0.5);

    this.createUiText(startX + 30, startY + 54, "Move", { fontSize: "11px", color: "#8899a6", depth: 21 }).setOrigin(0.5);
  }

  refreshCityUi() {
    if (this.cityProgressState) {
      this.cityProgressState.serviceHint = this.calculatePreparationBonus() > 0 ? `Prepared run bonus is now +${this.calculatePreparationBonus()} on clear.` : "City services will start shaping dungeon rewards after upgrades.";
      this.cityProgressState.nextActionText = this.buildNextActionText();
    }
    if (this.hpBarFill) this.hpBarFill.width = 268;
    if (this.mpBarFill) this.mpBarFill.width = 268;
    if (this.hpValueText) this.hpValueText.setText(`${this.getCurrentMaxHp()}/${this.getCurrentMaxHp()}`);
    if (this.mpValueText) this.mpValueText.setText(`${this.getCurrentMaxMp()}/${this.getCurrentMaxMp()}`);
    if (this.goldValueText) this.goldValueText.setText(`Gold: ${this.registry.get("gold")}`);
    if (this.potionValueText) this.potionValueText.setText(`HP Pot ${this.registry.get("healthPotionCount")} | MP Pot ${this.registry.get("mpPotionCount")} | Power ${this.registry.get("playerPowerTier")}`);
    this.refreshRewardSummaryPanel();
    this.refreshQuestTrackerPanel();
    this.refreshHotbarVisuals();
    if (this.inventoryOpen) {
      this.refreshInventoryEquipment();
      this.refreshInventoryGrid();
    }
    if (this.characterOpen) {
      this.refreshCharacterPanel();
    }
    if (this.servicePanelOpen) {
      this.refreshServicePanel();
    }
    if (this.questListOpen) {
      this.refreshQuestListPanel();
    }
  }

  updateCityFeed(line1, line2) {
    if (this.cityFeedLines[0]) this.cityFeedLines[0].setText(line1);
    if (this.cityFeedLines[1]) this.cityFeedLines[1].setText(line2);
  }

  setStatusPanelVisibility(visible) {
    const shouldShow = visible && !this.questListOpen && !this.servicePanelOpen;
    this.rewardPanelElements.forEach((element) => {
      if (element?.active) {
        element.setVisible(shouldShow);
      }
    });
    this.questTrackerElements.forEach((element) => {
      if (element?.active) {
        element.setVisible(shouldShow);
      }
    });
  }

  flashStatusPanels(duration = 4200) {
    if (this.rightPanelHideEvent) {
      this.rightPanelHideEvent.remove(false);
      this.rightPanelHideEvent = null;
    }
    this.setStatusPanelVisibility(true);
    this.rightPanelHideEvent = this.time.delayedCall(duration, () => {
      this.setStatusPanelVisibility(false);
      this.rightPanelHideEvent = null;
    });
  }

  showCityBanner(text, duration = 2200) {
    if (!this.cityBannerText) return;
    if (this.cityBannerHideEvent) this.cityBannerHideEvent.remove(false);
    this.cityBannerText.setText(text);
    this.cityBannerText.setVisible(true);
    this.flashStatusPanels(Math.max(3800, duration + 1200));
    this.cityBannerHideEvent = this.time.delayedCall(duration, () => {
      if (this.cityBannerText?.active) this.cityBannerText.setVisible(false);
    });
  }

  applyCityReturnState(returnState) {
    this.refreshCityUi();
    this.refreshRewardSummaryPanel();
    if (!returnState) return;
    this.showCityBanner(returnState.message ?? "Returned from dungeon");
    this.updateCityFeed(
      returnState.summaryLine1 ?? "Returned from dungeon.",
      returnState.nextActionHint ?? returnState.questSummaryLine ?? this.cityProgressState?.serviceHint ?? returnState.summaryLine2 ?? "Dungeon cycle completed.",
    );
  }

  /* ══════════════════════════════════════════
     UI HELPERS
     ══════════════════════════════════════════ */

  createUiPanel(x, y, width, height, alpha = 0.84, variant = "panel_line", depth = 18) {
    const isTinySwords = variant === "panel_dark" || variant === "panel_light";
    const panel = this.add.nineslice(
      x + width / 2,
      y + height / 2,
      variant,
      null,
      width,
      height,
      isTinySwords ? 64 : 16,
      isTinySwords ? 64 : 16,
      isTinySwords ? 48 : 8,
      isTinySwords ? 48 : 8,
    );
    panel.setAlpha(alpha);
    panel.setScrollFactor(0);
    panel.setDepth(depth);
    return panel;
  }

  createUiText(x, y, text, style = {}) {
    const uiText = this.add.text(x, y, text, {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: style.fontSize ?? "16px",
      fontStyle: style.fontStyle ?? "bold",
      color: style.color ?? "#f4efe6",
      align: style.align ?? "left",
      wordWrap: style.wordWrapWidth ? { width: style.wordWrapWidth } : undefined,
    });
    if (style.strokeThickness !== 0) {
      uiText.setStroke(style.stroke ?? "#132028", style.strokeThickness ?? 3);
    }
    if (style.shadow !== false) {
      uiText.setShadow(0, 2, style.shadowColor ?? "#081015", 0.9, false, true);
    }
    uiText.setScrollFactor(0);
    uiText.setDepth(style.depth ?? 21);
    return uiText;
  }

  refreshHudPanel() {
    this.refreshCityUi();
  }

  preload() {
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
    this.load.spritesheet("class_warrior_idle", "assets/sprites/classes/warrior_idle.png", {
      frameWidth: 192,
      frameHeight: 192,
    });
    this.load.spritesheet("class_warrior_run", "assets/sprites/classes/warrior_run.png", {
      frameWidth: 192,
      frameHeight: 192,
    });
    this.load.spritesheet("class_mage_idle", "assets/sprites/classes/mage_idle.png", {
      frameWidth: 192,
      frameHeight: 192,
    });
    this.load.spritesheet("class_mage_run", "assets/sprites/classes/mage_run.png", {
      frameWidth: 192,
      frameHeight: 192,
    });
    this.load.spritesheet("class_rogue_idle", "assets/sprites/classes/rogue_idle.png", {
      frameWidth: 192,
      frameHeight: 192,
    });
    this.load.spritesheet("class_rogue_run", "assets/sprites/classes/rogue_run.png", {
      frameWidth: 192,
      frameHeight: 192,
    });
    this.load.spritesheet("class_archer_idle", "assets/sprites/classes/archer_idle.png", {
      frameWidth: 192,
      frameHeight: 192,
    });
    this.load.spritesheet("class_archer_run", "assets/sprites/classes/archer_run.png", {
      frameWidth: 192,
      frameHeight: 192,
    });
    this.load.image("bld_blacksmith", "assets/buildings/city_blacksmith.png");
    this.load.image("bld_potion", "assets/buildings/city_house_potion.png");
    this.load.image("bld_quest", "assets/buildings/city_quest.png");
    this.load.image("bld_upgrader", "assets/buildings/city_upgrader.png");
    this.load.image("bld_gate", "assets/buildings/city_gate.png");
  }

  createAnimations() {
    const animConfigs = [
      { key: "player-idle", texture: "player_idle_sheet", end: 7, frameRate: 8 },
      { key: "player-run", texture: "player_run_sheet", end: 5, frameRate: 10 },
      { key: "player-warrior-idle", texture: "class_warrior_idle", end: 7, frameRate: 8 },
      { key: "player-warrior-run", texture: "class_warrior_run", end: 5, frameRate: 10 },
      { key: "player-mage-idle", texture: "class_mage_idle", end: 5, frameRate: 8 },
      { key: "player-mage-run", texture: "class_mage_run", end: 3, frameRate: 10 },
      { key: "player-rogue-idle", texture: "class_rogue_idle", end: 7, frameRate: 8 },
      { key: "player-rogue-run", texture: "class_rogue_run", end: 5, frameRate: 10 },
      { key: "player-archer-idle", texture: "class_archer_idle", end: 5, frameRate: 8 },
      { key: "player-archer-run", texture: "class_archer_run", end: 3, frameRate: 10 },
    ];

    animConfigs.forEach((config) => {
      if (!this.anims.exists(config.key)) {
        this.anims.create({
          key: config.key,
          frames: this.anims.generateFrameNumbers(config.texture, { start: 0, end: config.end }),
          frameRate: config.frameRate,
          repeat: -1,
        });
      }
    });
  }

  getPlayerVisualProfile() {
    const playerClass = this.registry.get("playerClass") || "warrior";
    const profiles = {
      warrior: { idleTexture: "class_warrior_idle", idleAnim: "player-warrior-idle", runAnim: "player-warrior-run" },
      mage: { idleTexture: "class_mage_idle", idleAnim: "player-mage-idle", runAnim: "player-mage-run" },
      rogue: { idleTexture: "class_rogue_idle", idleAnim: "player-rogue-idle", runAnim: "player-rogue-run" },
      archer: { idleTexture: "class_archer_idle", idleAnim: "player-archer-idle", runAnim: "player-archer-run" },
    };
    return profiles[playerClass] || profiles.warrior;
  }

  createPlayer(x, y) {
    const profile = this.getPlayerVisualProfile();
    this.player = this.physics.add.sprite(x, y + 8, profile.idleTexture, 0);
    this.player.setScale(0.3);
    this.player.setDepth(5);
    this.player.play(profile.idleAnim);
    this.player.body.setSize(46, 42);
    this.player.body.setOffset(74, 118);
    this.player.body.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.obstacles);
  }

  setPlayerAnimation(isMoving, horizontalVelocity = 0) {
    if (!this.player?.anims) return;
    if (horizontalVelocity !== 0) this.player.setFlipX(horizontalVelocity < 0);
    const profile = this.getPlayerVisualProfile();
    const nextKey = isMoving ? profile.runAnim : profile.idleAnim;
    if (this.player.anims.currentAnim?.key !== nextKey) this.player.play(nextKey, true);
  }

  getHotbarItemVisual(itemId, index) {
    const consumableDef = GameState.getConsumableDef?.(itemId);
    if (consumableDef) {
      return {
        key: "icon_11",
        tint: consumableDef.color,
        alpha: 1,
        active: true,
      };
    }

    const skillDef = GameState.getClassSkillDef?.(itemId);
    if (skillDef) {
      return {
        key: skillDef.icon,
        tint: skillDef.tint,
        alpha: 1,
        active: true,
      };
    }

    return {
      key: "icon_11",
      tint: 0xffffff,
      alpha: 0.3,
      active: false,
    };
  }

  refreshHotbarVisuals() {
    this.hotbarSlotVisuals.forEach((slot) => {
      if (!slot?.icon?.scene?.sys) return;
      const itemId = GameState.getHotbarSlot?.(this.registry, slot.slotIndex);
      const visual = this.getHotbarItemVisual(itemId, slot.slotIndex);
      slot.icon.setTexture(visual.key);
      slot.icon.setTint(visual.tint);
      slot.icon.setAlpha(visual.alpha);
      if (slot.bg?.scene?.sys && slot.bg.setTexture) {
        slot.bg.setTexture(visual.active ? "slot_active" : "slot_normal");
      }
    });
  }

  useHotbarSlot(index) {
    const itemId = GameState.getHotbarSlot?.(this.registry, index);
    if (!itemId) return;

    const skillDef = GameState.getClassSkillDef?.(itemId);
    if (skillDef) {
      this.showCityBanner(`${skillDef.name} is ready`);
      this.updateCityFeed(`${skillDef.name} is equipped on your hotbar.`, "Use active class skills inside the dungeon, then return stronger.");
      return;
    }

    const def = GameState.getConsumableDef?.(itemId);
    if (!def) return;
    const count = this.registry.get(def.countKey) || 0;
    if (count <= 0) {
      GameState.clearHotbarSlot?.(this.registry, index);
      this.refreshHotbarVisuals();
      return;
    }

    this.registry.set(def.countKey, count - 1);
    if (count - 1 <= 0) GameState.clearHotbarSlot?.(this.registry, index);
    this.refreshHotbarVisuals();
    this.refreshCityUi();
    const effectLine = def.type === "healHp" ? `HP Potion used: +${def.healAmount} recovery prepared.` : `MP Potion used: +${def.restoreAmount} recovery prepared.`;
    this.updateCityFeed(effectLine, "Consumables are stocked for your next dungeon run.");
  }

  getClassSkills(playerClass) {
    const activeSkill = GameState.getClassSkillForClass?.(playerClass) || GameState.getClassSkillForClass?.("warrior");
    const passiveMap = {
      warrior: { name: "Iron Will", description: "Front-line gear path leans into HP and durable melee trading.", icon: "icon_01", tint: 0xb8c9d9, tag: "Passive" },
      mage: { name: "Mana Flow", description: "Arcane gear and MP scaling prepare the class for stronger spell loops.", icon: "icon_02", tint: 0x8f7fff, tag: "Passive" },
      rogue: { name: "Backstab", description: "High DEX and burst windows reward aggressive positioning.", icon: "icon_03", tint: 0xd7c48d, tag: "Passive" },
      archer: { name: "Eagle Eye", description: "Range pressure and dexterity support cleaner long-range picks.", icon: "icon_01", tint: 0x8bb8d8, tag: "Passive" },
    };
    const futureMap = {
      warrior: { name: "Shield Bash", description: "Reserved crowd-control slot for the next warrior pass.", icon: "icon_03", tint: 0xa8b38e, tag: "Future" },
      mage: { name: "Fireball", description: "Reserved AoE burst slot for the next mage expansion pass.", icon: "icon_05", tint: 0xff9a52, tag: "Future" },
      rogue: { name: "Poison Blade", description: "Reserved DoT utility slot for later rogue depth.", icon: "icon_11", tint: 0x67b26f, tag: "Future" },
      archer: { name: "Multishot", description: "Reserved spread shot slot for a later ranged depth pass.", icon: "icon_12", tint: 0xa8c46a, tag: "Future" },
    };

    return [
      {
        name: activeSkill.name,
        description: `${activeSkill.description} MP ${activeSkill.mpCost} | CD ${(activeSkill.cooldownMs / 1000).toFixed(1)}s`,
        icon: activeSkill.icon,
        tint: activeSkill.tint,
        tag: "Active  F",
      },
      passiveMap[playerClass] || passiveMap.warrior,
      futureMap[playerClass] || futureMap.warrior,
    ];
  }
}

window.PrototypeScene = PrototypeScene;
