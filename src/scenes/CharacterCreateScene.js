class CharacterCreateScene extends Phaser.Scene {
  constructor() {
    super("CharacterCreateScene");
    this.nameInput = null;
    this.nameInputActive = false;
    this.currentClass = null;
    this.currentStats = null;
    this.currentEquipment = null;
    this.currentName = "";
    this.previewSprite = null;
    this.previewClassText = null;
    this.previewWeaponText = null;
    this.fateTexts = {};
    this.equipmentRows = [];
    this.helpText = null;
    this.continueButton = null;
    this.continueInfoText = null;
  }

  preload() {
    this.load.image("icon_01", "assets/ui/tiny-swords/icon_01.png");
    this.load.image("icon_02", "assets/ui/tiny-swords/icon_02.png");
    this.load.image("icon_03", "assets/ui/tiny-swords/icon_03.png");
    this.load.image("icon_04", "assets/ui/tiny-swords/icon_04.png");
    this.load.image("icon_05", "assets/ui/tiny-swords/icon_05.png");
    this.load.image("icon_06", "assets/ui/tiny-swords/icon_06.png");
    this.load.image("slot_normal", "assets/ui/tiny-swords/slot_normal.png");
    this.load.image("slot_active", "assets/ui/tiny-swords/slot_active.png");
    this.load.spritesheet("class_warrior_idle", "assets/sprites/classes/warrior_idle.png", {
      frameWidth: 192,
      frameHeight: 192,
    });
    this.load.spritesheet("class_mage_idle", "assets/sprites/classes/mage_idle.png", {
      frameWidth: 192,
      frameHeight: 192,
    });
    this.load.spritesheet("class_rogue_idle", "assets/sprites/classes/rogue_idle.png", {
      frameWidth: 192,
      frameHeight: 192,
    });
    this.load.spritesheet("class_archer_idle", "assets/sprites/classes/archer_idle.png", {
      frameWidth: 192,
      frameHeight: 192,
    });
    this.loadClassAndCatImages();
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#101820");
    this.drawBackdrop(width, height);
    this.buildLayout(width, height);
    this.createPreviewAnimations();
    this.bindNameInput();

    this.currentName = "Jin";
    this.nameInput.setText(this.currentName);
    this.rerollFate();
  }

  drawBackdrop(width, height) {
    this.add.rectangle(width / 2, height / 2, width, height, 0x101820, 1);
    this.add.rectangle(width / 2, height / 2, width - 40, height - 40, 0x162430, 0.92);
    this.add.circle(width * 0.18, height * 0.22, 140, 0x294458, 0.12);
    this.add.circle(width * 0.84, height * 0.78, 180, 0x24394a, 0.12);
  }

  buildLayout(width, height) {
    const modalWidth = Math.min(1020, width - 80);
    const modalHeight = Math.min(620, height - 60);
    const modalX = (width - modalWidth) / 2;
    const modalY = (height - modalHeight) / 2;

    this.createPanelRect(modalX, modalY, modalWidth, modalHeight, {
      fill: 0x0f1822,
      alpha: 0.98,
      stroke: 0x50626f,
      depth: 4,
      radius: 18,
    });
    this.createPanelRect(modalX + 12, modalY + 12, modalWidth - 24, modalHeight - 24, {
      fill: 0x15212b,
      alpha: 0.96,
      stroke: 0x273643,
      depth: 5,
      radius: 14,
    });

    this.createUiText(width / 2, modalY + 42, "Isekai Arrival", {
      fontSize: "30px",
      color: "#f8f1dc",
      align: "center",
    }).setOrigin(0.5).setDepth(10);

    this.createUiText(width / 2, modalY + 76, "Enter only your name. Class, stats, and loadout are granted by fate.", {
      fontSize: "14px",
      color: "#b8c5c9",
      align: "center",
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(10);

    const nameRowY = modalY + 110;
    this.createUiText(modalX + 34, nameRowY, "Name", {
      fontSize: "16px",
      color: "#f6f1df",
    }).setDepth(10);
    this.nameInput = this.add.text(modalX + 96, nameRowY - 2, "", {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "18px",
      color: "#f8f1dc",
      backgroundColor: "#20303d",
      fixedWidth: 280,
      fixedHeight: 34,
      padding: { left: 12, right: 12, top: 6, bottom: 4 },
    })
      .setStroke("#0b141a", 2)
      .setShadow(0, 2, "#081015", 0.9, false, true)
      .setInteractive({ useHandCursor: true })
      .setDepth(11);
    this.nameInput.on("pointerdown", () => {
      this.nameInputActive = true;
      this.nameInput.setStroke("#d8c27a", 3);
    });

    const leftX = modalX + 28;
    const centerX = modalX + modalWidth / 2 - 120;
    const rightX = modalX + modalWidth - 264;
    const contentTop = modalY + 148;

    this.buildFateSection(leftX, contentTop, 248, 270);
    this.buildPreviewSection(centerX, contentTop, 240, 270);
    this.buildEquipmentSection(rightX, contentTop, 236, 330);
    this.buildButtons(width / 2, modalY + modalHeight - 54);
  }

  buildFateSection(x, y, width, height) {
    this.createPanelRect(x, y, width, height, {
      fill: 0x1a2833,
      alpha: 0.95,
      stroke: 0x415260,
      depth: 6,
      radius: 12,
    });
    this.createUiText(x + 16, y + 16, "Fated Start", {
      fontSize: "18px",
      color: "#f8f1dc",
    }).setDepth(10);

    this.fateTexts.classLine = this.createUiText(x + 16, y + 52, "", {
      fontSize: "18px",
      color: "#f4df9c",
    }).setDepth(10);
    this.fateTexts.storyLine = this.createUiText(x + 16, y + 80, "", {
      fontSize: "13px",
      color: "#b8c5c9",
      wordWrapWidth: width - 32,
    }).setDepth(10);
    this.fateTexts.statLine1 = this.createUiText(x + 16, y + 132, "", {
      fontSize: "15px",
      color: "#f6f1df",
    }).setDepth(10);
    this.fateTexts.statLine2 = this.createUiText(x + 16, y + 160, "", {
      fontSize: "15px",
      color: "#f6f1df",
    }).setDepth(10);
    this.fateTexts.derivedLine = this.createUiText(x + 16, y + 196, "", {
      fontSize: "14px",
      color: "#d9e0e2",
      wordWrapWidth: width - 32,
    }).setDepth(10);
    this.helpText = this.createUiText(x + 16, y + 228, "Class, stats, and loadout are assigned automatically when you arrive.", {
      fontSize: "12px",
      color: "#9fb0b7",
      wordWrapWidth: width - 32,
    }).setDepth(10);
  }

  buildPreviewSection(x, y, width, height) {
    this.createPanelRect(x, y, width, height, {
      fill: 0x1a2833,
      alpha: 0.95,
      stroke: 0x415260,
      depth: 6,
      radius: 12,
    });
    this.createUiText(x + width / 2, y + 18, "Fate Preview", {
      fontSize: "18px",
      color: "#f8f1dc",
      align: "center",
    }).setOrigin(0.5, 0).setDepth(10);

    this.add.ellipse(x + width / 2, y + 202, 110, 26, 0x000000, 0.22).setDepth(8).setScrollFactor(0);
    this.previewSprite = this.add.sprite(x + width / 2, y + 146, "hero_preview_warrior")
      .setDisplaySize(96, 96)
      .setDepth(10)
      .setScrollFactor(0);
    this.previewClassText = this.createUiText(x + width / 2, y + 220, "", {
      fontSize: "16px",
      color: "#f4df9c",
      align: "center",
    }).setOrigin(0.5).setDepth(10);
    this.previewWeaponText = this.createUiText(x + width / 2, y + 244, "", {
      fontSize: "13px",
      color: "#c8d5d8",
      align: "center",
      wordWrapWidth: width - 34,
    }).setOrigin(0.5, 0).setDepth(10);
  }

  buildEquipmentSection(x, y, width, height) {
    this.createPanelRect(x, y, width, height, {
      fill: 0x1a2833,
      alpha: 0.95,
      stroke: 0x415260,
      depth: 6,
      radius: 12,
    });
    this.createUiText(x + 16, y + 16, "Starting Equipment", {
      fontSize: "18px",
      color: "#f8f1dc",
    }).setDepth(10);

    const slots = ["head", "body", "hands", "legs", "weapon"];
    const slotLabels = ["Head", "Body", "Hands", "Legs", "Weapon"];
    this.equipmentRows = slots.map((slot, index) => {
      const rowY = y + 52 + index * 54;
      this.createUiText(x + 16, rowY + 16, slotLabels[index], {
        fontSize: "13px",
        color: "#b8c5c9",
      }).setDepth(10);

      const slotBg = this.add.image(x + 58, rowY + 22, "slot_normal").setDisplaySize(44, 44).setScrollFactor(0).setDepth(10);
      const icon = this.add.image(x + 58, rowY + 22, "icon_05").setScale(0.28).setScrollFactor(0).setDepth(11);
      const nameText = this.createUiText(x + 90, rowY + 8, "-", {
        fontSize: "13px",
        color: "#f8f1dc",
        wordWrapWidth: width - 102,
      }).setDepth(10);
      const statText = this.createUiText(x + 90, rowY + 28, "", {
        fontSize: "11px",
        color: "#b8c5c9",
        wordWrapWidth: width - 102,
      }).setDepth(10);

      return { slot, slotBg, icon, nameText, statText };
    });
  }

  buildButtons(centerX, y) {
    const hasSave = GameState.hasSavedProgress?.();
    if (hasSave) {
      this.continueButton = this.createButton(centerX - 130, y, 230, "Continue Journey", () => this.continueSavedHero(), 0x304255, 0x7f9fc7);
      this.confirmButton = this.createButton(centerX + 130, y, 230, "Start New Hero", () => this.confirmCharacter());
      const summary = GameState.getSavedProgressSummary?.();
      const summaryText = summary
        ? `Saved: ${summary.name}  |  ${summary.playerClass}  |  Gold ${summary.gold}  |  Clears ${summary.cycles}  |  ${summary.weaponName} +${summary.weaponUpgradeLevel}`
        : "A previous journey can be continued from browser save data.";
      this.continueInfoText = this.createUiText(centerX, y - 52, summaryText, {
        fontSize: "12px",
        color: "#a9bac1",
        align: "center",
        wordWrapWidth: 620,
      }).setOrigin(0.5).setDepth(11);
      return;
    }

    this.confirmButton = this.createButton(centerX, y, 230, "Confirm Hero", () => this.confirmCharacter());
  }

  createButton(x, y, width, text, callback, fillColor = 0x28403f, strokeColor = 0x7d9670) {
    const bg = this.createPanelRect(x - width / 2, y - 22, width, 44, {
      fill: fillColor,
      alpha: 0.96,
      stroke: strokeColor,
      depth: 9,
      radius: 10,
    });
    bg.setInteractive({ useHandCursor: true });
    bg.on("pointerdown", callback);
    bg.on("pointerover", () => bg.setFillStyle(fillColor + 0x0c1110, 0.98));
    bg.on("pointerout", () => bg.setFillStyle(fillColor, 0.96));
    const label = this.createUiText(x, y, text, {
      fontSize: "17px",
      color: "#f8f1dc",
      align: "center",
    }).setOrigin(0.5).setDepth(11);
    return { bg, label };
  }

  createPreviewAnimations() {
    const configs = [
      { key: "preview-warrior-idle", texture: "class_warrior_idle", end: 7, frameRate: 8 },
      { key: "preview-mage-idle", texture: "class_mage_idle", end: 5, frameRate: 8 },
      { key: "preview-rogue-idle", texture: "class_rogue_idle", end: 7, frameRate: 8 },
      { key: "preview-archer-idle", texture: "class_archer_idle", end: 5, frameRate: 8 },
    ];

    configs.forEach((config) => {
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

  loadClassAndCatImages() {
    const base = "class%20and%20cat/";
    const folders = {
      warrior: "A_32px_low_top-down_pixel_art_fantasy_MMORPG_warri",
      mage: "A_32px_low_top-down_pixel_art_fantasy_MMORPG_mage",
      rogue: "A_32px_low_top-down_pixel_art_fantasy_MMORPG_rogue",
      archer: "A_32px_low_top-down_pixel_art_fantasy_MMORPG_arche",
    };
    Object.entries(folders).forEach(([className, folder]) => {
      this.load.image(`hero_preview_${className}`, `${base}${folder}/rotations/south.png`);
    });
  }

  getClassPreviewTexture(className) {
    const generatedKey = `hero_preview_${className || "warrior"}`;
    if (this.textures.exists(generatedKey)) return generatedKey;
    const textureMap = {
      warrior: "class_warrior_idle",
      mage: "class_mage_idle",
      rogue: "class_rogue_idle",
      archer: "class_archer_idle",
    };
    return textureMap[className] || "class_warrior_idle";
  }

  bindNameInput() {
    this.input.keyboard.on("keydown", (event) => {
      if (!this.nameInputActive) {
        return;
      }
      this.handleNameInput(event);
    });
  }

  rerollFate({ rerollName = false } = {}) {
    this.currentClass = GameState.generateRandomClass();

    if (rerollName || !this.currentName) {
      this.currentName = GameState.generateRandomName();
      this.nameInput.setText(this.currentName);
    }

    this.currentStats = GameState.generateRandomStats();
    this.currentStats.hpStat = Math.max(1, this.currentStats.hpStat);
    this.currentStats.mpStat = Math.max(1, this.currentStats.mpStat);
    this.currentStats.strStat = Math.max(1, this.currentStats.strStat);
    this.currentStats.dexStat = Math.max(1, this.currentStats.dexStat);

    this.currentEquipment = {};
    GameState.EQUIP_SLOTS.forEach((slot) => {
      const item = GameState.pickRandomEquipment(this.currentClass, slot);
      this.currentEquipment[slot] = item ? { ...item, upgradeLevel: 0 } : null;
    });

    this.updateUI();
  }

  updateUI() {
    const classDescriptions = {
      warrior: "You awaken as a front-line fighter with heavy steel and brute force.",
      mage: "You awaken with arcane talent, higher mana flow, and a caster's loadout.",
      rogue: "You awaken as a fast shadow fighter built around burst and movement.",
      archer: "You awaken with ranged instincts, sharp aim, and balanced dexterity.",
    };

    const tempRegistry = new Phaser.Data.DataManager(this);
    tempRegistry.set("characterName", this.currentName || this.nameInput.text || "Hero");
    tempRegistry.set("playerClass", this.currentClass);
    tempRegistry.set("hpStat", this.currentStats.hpStat);
    tempRegistry.set("mpStat", this.currentStats.mpStat);
    tempRegistry.set("strStat", this.currentStats.strStat);
    tempRegistry.set("dexStat", this.currentStats.dexStat);
    tempRegistry.set("maxHpBonus", 0);
    GameState.EQUIP_SLOTS.forEach((slot) => {
      tempRegistry.set(`equipped_${slot}`, this.currentEquipment[slot] ? { ...this.currentEquipment[slot] } : null);
    });

    const derived = {
      hp: GameState.getMaxHp(tempRegistry),
      mp: GameState.getMaxMp(tempRegistry),
      ap: GameState.getWeaponAp(tempRegistry),
      spd: GameState.getPlayerSpeed(tempRegistry),
    };

    const previewTexture = this.getClassPreviewTexture(this.currentClass);
    this.previewSprite.setTexture(previewTexture);
    if (previewTexture.startsWith("hero_preview_")) {
      this.previewSprite.stop();
      this.previewSprite.setDisplaySize(96, 96);
      this.previewSprite.setFlipX(false);
    } else {
      this.previewSprite.setScale(0.54);
      this.previewSprite.play(`preview-${this.currentClass}-idle`, true);
    }
    this.previewClassText.setText((this.currentClass || "warrior").toUpperCase());
    this.previewWeaponText.setText(this.currentEquipment.weapon ? this.currentEquipment.weapon.name : "No starter weapon");

    this.fateTexts.classLine.setText(`Fated Class: ${(this.currentClass || "warrior").toUpperCase()}`);
    this.fateTexts.storyLine.setText(classDescriptions[this.currentClass] ?? "");
    this.fateTexts.statLine1.setText(`HP ${this.currentStats.hpStat}  |  MP ${this.currentStats.mpStat}`);
    this.fateTexts.statLine2.setText(`STR ${this.currentStats.strStat}  |  DEX ${this.currentStats.dexStat}`);
    this.fateTexts.derivedLine.setText(`Derived: MaxHP ${derived.hp}  |  MaxMP ${derived.mp}  |  AP ${derived.ap}  |  SPD ${derived.spd}`);

    this.equipmentRows.forEach((row) => {
      const item = this.currentEquipment[row.slot];
      if (!item) {
        row.slotBg.setTexture("slot_normal");
        row.icon.setTexture("icon_05");
        row.icon.setTint(0x95a0a8);
        row.icon.setAlpha(0.24);
        row.nameText.setText("Empty");
        row.nameText.setColor("#6f7c85");
        row.statText.setText("");
        return;
      }

      row.slotBg.setTexture("slot_active");
      row.icon.setTexture(item.baseIcon || item.icon || "icon_05");
      row.icon.setTint(item.color || GameState.getRarityColor(item.rarity));
      row.icon.setAlpha(1);
      row.nameText.setText(item.name);
      row.nameText.setColor("#f8f1dc");
      const statLine = Object.entries(item.stats || {})
        .map(([key, value]) => `${key.toUpperCase()} ${value >= 0 ? "+" : ""}${value}`)
        .join("  ");
      row.statText.setText(statLine);
    });
  }

  confirmCharacter() {
    const name = this.nameInput.text.trim();
    if (!name) {
      this.showMessage("Please enter a hero name.");
      return;
    }

    this.currentName = name;
    GameState.smoothTransitionToNewSystem?.(this.registry);
    GameState.createCharacter(
      this.registry,
      name,
      this.currentClass,
      this.currentStats,
      this.currentEquipment,
    );
    GameState.initHotbarSlots?.(this.registry);
    GameState.ensureCoreStats?.(this.registry);
    GameState.initInventory?.(this.registry);
    GameState.saveProgress?.(this.registry);

    this.scene.start("PrototypeScene");
  }

  continueSavedHero() {
    if (!GameState.applySavedProgress?.(this.registry)) {
      this.showMessage("No saved journey found.");
      return;
    }

    GameState.saveProgress?.(this.registry);
    this.scene.start("PrototypeScene");
  }

  handleNameInput(event) {
    const key = event.key;
    if (key === "Enter") {
      this.nameInputActive = false;
      this.nameInput.setStroke("#0b141a", 2);
      return;
    }
    if (key === "Escape") {
      this.nameInputActive = false;
      this.nameInput.setStroke("#0b141a", 2);
      this.nameInput.setText(this.currentName);
      return;
    }
    if (key === "Backspace") {
      this.nameInput.setText(this.nameInput.text.slice(0, -1));
      return;
    }
    if (key.length === 1 && this.nameInput.text.length < 14) {
      this.nameInput.setText(this.nameInput.text + key);
    }
  }

  showMessage(text, duration = 1500) {
    const { width, height } = this.scale;
    const msg = this.createUiText(width / 2, height - 22, text, {
      fontSize: "16px",
      color: "#ff9e8d",
      align: "center",
    }).setOrigin(0.5).setDepth(20);
    this.time.delayedCall(duration, () => msg.destroy());
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER))) {
      if (this.nameInputActive) {
        this.nameInputActive = false;
        this.nameInput.setStroke("#0b141a", 2);
      } else {
        this.confirmCharacter();
      }
    }
  }

  createPanelRect(x, y, width, height, { fill = 0x1a2833, alpha = 0.96, stroke = 0x415260, depth = 5, radius = 12 } = {}) {
    const rect = this.add.rectangle(x + width / 2, y + height / 2, width, height, fill, alpha);
    rect.setStrokeStyle(2, stroke, 0.95);
    rect.setScrollFactor(0);
    rect.setDepth(depth);
    rect.setData("cornerRadius", radius);
    return rect;
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
      uiText.setStroke(style.stroke ?? "#0b141a", style.strokeThickness ?? 3);
    }
    if (style.shadow !== false) {
      uiText.setShadow(0, 2, style.shadowColor ?? "#081015", 0.9, false, true);
    }
    uiText.setScrollFactor(0);
    uiText.setDepth(10);
    return uiText;
  }
}

window.CharacterCreateScene = CharacterCreateScene;
