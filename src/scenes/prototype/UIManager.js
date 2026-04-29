class UIManager {
  constructor(scene) {
    this.scene = scene;
    this.panelManager = null;
    this.inventoryPanel = null;
    this.hotbarPanel = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    
    const scene = this.scene;
    const registry = scene.registry;
    
    // Create PanelManager
    if (window.PanelManager) {
      this.panelManager = new PanelManager(scene);
      console.log("[UIManager] PanelManager created");
    } else {
      console.error("[UIManager] PanelManager not loaded!");
    }
    
    // Create InventoryPanel
    if (window.InventoryPanel) {
      this.inventoryPanel = new InventoryPanel(scene, registry, window.GameState);
      if (this.panelManager) {
        this.panelManager.register("inventory", this.inventoryPanel, { blocking: true });
      }
      console.log("[UIManager] InventoryPanel created and registered");
    } else {
      console.error("[UIManager] InventoryPanel not loaded!");
    }
    
    // Create CharacterPanel
    if (window.CharacterPanel) {
      this.characterPanel = new CharacterPanel(scene, registry, window.GameState);
      if (this.panelManager) {
        this.panelManager.register("character", this.characterPanel, { blocking: true });
      }
      console.log("[UIManager] CharacterPanel created and registered");
    } else {
      console.error("[UIManager] CharacterPanel not loaded!");
    }
    
    // Create SkillPanel
    if (window.SkillPanel) {
      this.skillPanel = new SkillPanel(scene, registry, window.GameState);
      if (this.panelManager) {
        this.panelManager.register("skills", this.skillPanel, { blocking: true });
      }
      console.log("[UIManager] SkillPanel created and registered");
    } else {
      console.error("[UIManager] SkillPanel not loaded!");
    }
    
    // Create QuestPanel
    if (window.QuestPanel) {
      this.questPanel = new QuestPanel(scene, registry, window.GameState);
      if (this.panelManager) {
        this.panelManager.register("quests", this.questPanel, { blocking: true });
      }
      console.log("[UIManager] QuestPanel created and registered");
    } else {
      console.error("[UIManager] QuestPanel not loaded!");
    }
    
    // Create HotbarPanel
    if (window.HotbarPanel) {
      this.hotbarPanel = new HotbarPanel(scene, registry, window.GameState);
      console.log("[UIManager] HotbarPanel created");
    } else {
      console.error("[UIManager] HotbarPanel not loaded!");
    }
    
    this.initialized = true;
  }

  drawCityHeader(width) {
    const scene = this.scene;
    
    // City header background
    scene.add.rectangle(width / 2, 30, width - 40, 50, 0x0f1822, 0.92)
      .setStrokeStyle(2, 0x50626f, 0.85)
      .setScrollFactor(0)
      .setDepth(20);
    
    // City title
    scene.add.text(width / 2, 30, "Isekai City Hub", {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "22px",
      color: "#f8f1dc",
      align: "center",
      stroke: "#0b141a",
      strokeThickness: 3,
      shadow: { offsetX: 0, offsetY: 2, color: "#081015", blur: 0, fill: true },
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(21);
    
    // Subtitle
    scene.add.text(width / 2, 56, "Prepare for the dungeon, upgrade your gear, accept quests.", {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "12px",
      color: "#b8c5c9",
      align: "center",
      stroke: "#0b141a",
      strokeThickness: 2,
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(21);
  }

  drawUiLayer(width, height) {
    const scene = this.scene;
    
    const hudX = 22;
    const hudY = 82;

    // Health bar background
    scene.add.rectangle(hudX, hudY, 220, 20, 0x1a2833, 0.9)
      .setStrokeStyle(2, 0x415260, 0.8)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(15);
    
    // Health bar fill
    scene.hpBarFill = scene.add.rectangle(hudX + 2, hudY, 216, 16, 0xff5555, 0.95)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(16);
    
    // Health text
    scene.hpValueText = scene.add.text(hudX + 6, hudY, "100/100", {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "13px",
      color: "#f8f1dc",
      stroke: "#0b141a",
      strokeThickness: 2,
    })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(17);
    
    // Mana bar background
    scene.add.rectangle(hudX, hudY + 28, 220, 14, 0x1a2833, 0.9)
      .setStrokeStyle(2, 0x415260, 0.8)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(15);
    
    // Mana bar fill
    scene.mpBarFill = scene.add.rectangle(hudX + 2, hudY + 28, 216, 10, 0x5588ff, 0.95)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(16);
    
    // Mana text
    scene.mpValueText = scene.add.text(hudX + 6, hudY + 28, "40/40", {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "11px",
      color: "#f8f1dc",
      stroke: "#0b141a",
      strokeThickness: 2,
    })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(17);

    // XP bar under MP
    scene.add.rectangle(hudX, hudY + 51, 220, 12, 0x1a2833, 0.9)
      .setStrokeStyle(1, 0x415260, 0.8)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(15);

    scene.xpBarFill = scene.add.rectangle(hudX + 2, hudY + 51, 0, 8, 0xffd34f, 0.95)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(16);

    scene.xpValueText = scene.add.text(hudX + 226, hudY + 51, "Lv 1  0/145 XP", {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "10px",
      color: "#ffdf78",
      stroke: "#0b141a",
      strokeThickness: 2,
    })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(17);
    
    this.drawActivityFeed(width, height);
    this.drawMinimap(width);
    
    // Hotbar - use HotbarPanel if available
    if (this.hotbarPanel) {
      this.hotbarPanel.create();
    } else {
      this.drawHotbar(width, height);
    }
  }

  drawActivityFeed(width, height) {
    const scene = this.scene;
    const x = width - 22;
    const y = height - 108;
    scene.add.rectangle(x, y, 310, 118, 0x071017, 0.7)
      .setStrokeStyle(1, 0x415260, 0.65)
      .setOrigin(1, 0.5)
      .setScrollFactor(0)
      .setDepth(15);
    scene.activityFeedTexts = [];
    for (let i = 0; i < 5; i++) {
      const text = scene.add.text(x - 296, y - 48 + i * 20, "", {
        fontFamily: "Trebuchet MS, Arial, sans-serif",
        fontSize: "11px",
        color: i === 0 ? "#f8d36b" : "#dfe8ea",
        stroke: "#0b141a",
        strokeThickness: 2,
        wordWrap: { width: 280, useAdvancedWrap: true },
        maxLines: 1,
      }).setScrollFactor(0).setDepth(16);
      scene.activityFeedTexts.push(text);
    }
  }

  drawMinimap(width) {
    const scene = this.scene;
    const panelW = 170;
    const panelH = 126;
    const x = width - panelW - 20;
    const y = 82;
    scene.add.rectangle(x + panelW / 2, y, panelW, panelH, 0x101820, 0.82)
      .setStrokeStyle(2, 0x60767b, 0.8).setScrollFactor(0).setDepth(15);
    scene.add.text(x + 12, y - 54, "Mini Map  [M]", {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "12px",
      color: "#f8f1dc",
      stroke: "#0b141a",
      strokeThickness: 2,
    }).setScrollFactor(0).setDepth(16);
    scene.minimapInnerBounds = { x: x + 12, y: y - 34, width: panelW - 24, height: panelH - 42 };
    scene.add.rectangle(scene.minimapInnerBounds.x + scene.minimapInnerBounds.width / 2, scene.minimapInnerBounds.y + scene.minimapInnerBounds.height / 2, scene.minimapInnerBounds.width, scene.minimapInnerBounds.height, 0x1e2630, 0.92)
      .setStrokeStyle(1, 0x314554, 0.8).setScrollFactor(0).setDepth(16);
    scene.minimapPlayerGlow = scene.add.circle(scene.minimapInnerBounds.x + scene.minimapInnerBounds.width / 2, scene.minimapInnerBounds.y + scene.minimapInnerBounds.height / 2, 7, 0xeadfb8, 0.28).setScrollFactor(0).setDepth(17);
    scene.minimapPlayerDot = scene.add.circle(scene.minimapInnerBounds.x + scene.minimapInnerBounds.width / 2, scene.minimapInnerBounds.y + scene.minimapInnerBounds.height / 2, 4, 0xf8f1dc).setScrollFactor(0).setDepth(18);
  }

  drawHotbar(width, height) {
    const scene = this.scene;
    const hotbarY = height - 100;
    const slotWidth = 50;
    const spacing = 8;
    const totalWidth = 6 * slotWidth + 5 * spacing;
    const startX = width / 2 - totalWidth / 2;
    
    scene.hotbarSlotVisuals = [];
    
    for (let i = 0; i < 6; i++) {
      const x = startX + i * (slotWidth + spacing);
      const y = hotbarY;
      
      // Slot background
      const slotBg = scene.add.image(x, y, "slot_normal")
        .setDisplaySize(slotWidth, slotWidth)
        .setScrollFactor(0)
        .setDepth(15)
        .setInteractive({ useHandCursor: true });
      
      // Slot number
      scene.add.text(x, y - slotWidth / 2 + 6, `${i + 1}`, {
        fontFamily: "Trebuchet MS, Arial, sans-serif",
        fontSize: "12px",
        color: "#b8c5c9",
        stroke: "#0b141a",
        strokeThickness: 2,
      })
        .setOrigin(0.5, 0.5)
        .setScrollFactor(0)
        .setDepth(16);
      
      scene.hotbarSlotVisuals.push({ bg: slotBg, icon: null, count: null });
    }
  }

  drawQuestTracker(width, height) {
    const scene = this.scene;
    
    // Quest tracker background
    scene.add.rectangle(width - 220, 100, 200, 120, 0x1a2833, 0.9)
      .setStrokeStyle(2, 0x415260, 0.8)
      .setScrollFactor(0)
      .setDepth(15);
    
    // Quest tracker title
    scene.add.text(width - 220, 70, "Quest Tracker", {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "14px",
      color: "#f8f1dc",
      stroke: "#0b141a",
      strokeThickness: 2,
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(16);
    
    // Quest lines
    scene.questTrackerElements = [];
    for (let i = 0; i < 3; i++) {
      const y = 90 + i * 20;
      const text = scene.add.text(width - 220, y, "", {
        fontFamily: "Trebuchet MS, Arial, sans-serif",
        fontSize: "11px",
        color: "#b8c5c9",
        stroke: "#0b141a",
        strokeThickness: 1,
      })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(16);
      
      scene.questTrackerElements.push(text);
    }
  }

  createInteractionUi(width, height) {
    const scene = this.scene;
    
    // Interaction prompt container
    scene.interactionPrompt = scene.add.container(0, 0).setDepth(1000).setScrollFactor(0).setVisible(false);
    
    // Interaction prompt background
    const bg = scene.add.rectangle(0, 0, 220, 40, 0x000000, 0.8).setOrigin(0.5);
    
    // Interaction prompt text
    const txt = scene.add.text(0, 0, "[E] INTERACT", {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "16px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 3,
    })
      .setOrigin(0.5);
    
    scene.interactionPrompt.add([bg, txt]);
  }

  // Panel creation helper
  createUiPanel(x, y, width, height, alpha = 0.84, variant = "panel_line", depth = 18) {
    const scene = this.scene;
    
    const panel = scene.add.image(x, y, variant)
      .setDisplaySize(width, height)
      .setAlpha(alpha)
      .setScrollFactor(0)
      .setDepth(depth);
    
    return panel;
  }

  // Text creation helper
  createUiText(x, y, text, style = {}) {
    const scene = this.scene;
    
    const uiText = scene.add.text(x, y, text, {
      fontFamily: style.fontFamily ?? "Trebuchet MS, Arial, sans-serif",
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

  // Panel toggle methods - now using PanelManager
  toggleInventoryPanel() {
    if (!this.panelManager) {
      console.error("[UIManager] No PanelManager!");
      return;
    }
    this.panelManager.toggle("inventory");
  }

  toggleCharacterPanel() {
    if (!this.panelManager) {
      console.error("[UIManager] No PanelManager!");
      return;
    }
    this.panelManager.toggle("character");
  }

  toggleSkillPanel() {
    if (!this.panelManager) {
      console.error("[UIManager] No PanelManager!");
      return;
    }
    this.panelManager.toggle("skills");
  }

  toggleQuestList() {
    if (!this.panelManager) {
      console.error("[UIManager] No PanelManager!");
      return;
    }
    this.panelManager.toggle("quests");
  }

  // Helper methods for inventory panel
  setInventoryPanelVisible(visible) {
    if (this.inventoryPanel) {
      if (visible) {
        this.inventoryPanel.show();
      } else {
        this.inventoryPanel.hide();
      }
    }
  }

  refreshInventoryEquipment() {
    if (this.inventoryPanel && this.inventoryPanel.refreshEquipment) {
      this.inventoryPanel.refreshEquipment();
    }
  }

  refreshInventoryGrid() {
    if (this.inventoryPanel && this.inventoryPanel.refreshGrid) {
      this.inventoryPanel.refreshGrid();
    }
  }

  handleGridSlotClick(index, pointer) {
    if (this.inventoryPanel && this.inventoryPanel.handleSlotClick) {
      this.inventoryPanel.handleSlotClick(index, pointer);
    }
  }

  showItemTooltip(index, x, y) {
    if (this.inventoryPanel && this.inventoryPanel.showTooltip) {
      this.inventoryPanel.showTooltip(index, x, y);
    }
  }

  hideItemTooltip() {
    if (this.inventoryPanel && this.inventoryPanel.hideTooltip) {
      this.inventoryPanel.hideTooltip();
    }
  }

  clearInventoryHoverState() {
    if (this.inventoryPanel && this.inventoryPanel.clearHoverState) {
      this.inventoryPanel.clearHoverState();
    }
  }

  refreshCharacterPanel() {
    console.log("[UIManager] refreshCharacterPanel called");
  }
}

window.UIManager = UIManager;
