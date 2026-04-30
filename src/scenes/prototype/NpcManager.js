class NpcManager {
  constructor(scene) {
    this.scene = scene;
  }

  createNpcLayer() {
    const scene = this.scene;

    // Clear existing interactables. Service NPCs are now placed at the FRONT of
    // buildings instead of inside/behind building art, so they are visible and reachable.
    scene.interactables = [];

    const serviceNpcs = [
      { x: 160, y: 188, name: "Potion Merchant", serviceType: "potion", tint: 0x69c37a },
      { x: 780, y: 188, name: "Sundries", serviceType: "sundries", tint: 0xc49257 },
      { x: 160, y: 502, name: "Anvil", serviceType: "anvil", tint: 0x6fa8ff },
      { x: 780, y: 502, name: "Quest Giver", serviceType: "quest", tint: 0xb58cff },
      { x: 480, y: 188, name: "Dungeon Gate", serviceType: "gate", tint: 0xffd05a, scale: 0.36 },
    ];

    serviceNpcs.forEach((npc) => this.createNpc(npc.x, npc.y, npc.name, npc.serviceType, npc));

    // Decorative NPCs stay small, but are still drawn above the ground.
    this.createDecorativeNpc(300, 275, "Traveler");
    this.createDecorativeNpc(700, 275, "Merchant");
    this.createDecorativeNpc(400, 415, "Guard");

    // Temporary test NPC. Safe to remove later from this single line.
    this.createTemporaryClassNpc(610, 360, "Çakır", "archer");
  }

  createNpc(x, y, name, serviceType, options = {}) {
    const scene = this.scene;
    const depth = options.depth ?? 34;
    const tint = options.tint ?? 0xffffff;
    const scale = options.scale ?? 0.31;
    const visuals = [];

    // Ground shadow / interaction marker.
    const shadow = scene.add.ellipse(x, y + 22, 38, 14, 0x000000, 0.28).setDepth(depth - 2);
    visuals.push(shadow);

    let sprite = null;
    if (scene.textures?.exists?.("npc_pawn_idle_sheet")) {
      sprite = scene.add.sprite(x, y, "npc_pawn_idle_sheet", 0)
        .setScale(scale)
        .setDepth(depth)
        .setTint(tint);
      visuals.push(sprite);
    } else {
      // Fallback visible NPC made from primitives if the sprite is not preloaded.
      const body = scene.add.rectangle(x, y, 20, 30, tint, 0.95).setDepth(depth);
      const head = scene.add.circle(x, y - 22, 9, 0xf0cf9d, 0.98).setDepth(depth + 1);
      const trim = scene.add.rectangle(x, y + 8, 24, 6, 0x101820, 0.45).setDepth(depth + 1);
      visuals.push(body, head, trim);
    }

    // A subtle service icon above the NPC makes each service readable even when zoomed out.
    const marker = scene.add.circle(x, y - 50, 7, 0xffd700, 0.95)
      .setStrokeStyle(2, 0x1a1a1a, 0.8)
      .setDepth(depth + 3);
    visuals.push(marker);

    const label = scene.add.text(x, y - 72, name, {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "12px",
      color: "#f8f1dc",
      align: "center",
      stroke: "#0b141a",
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(depth + 4);
    visuals.push(label);

    // Interaction zone. Kept invisible, but it follows the visible NPC position.
    const zone = scene.add.circle(x, y, 54, 0x88ccff, 0.001)
      .setDepth(depth + 5)
      .setInteractive({ useHandCursor: true });
    visuals.push(zone);

    const clickHandler = (pointer) => {
      pointer?.event?.stopPropagation?.();
      this.handleNpcInteraction(name, serviceType);
    };
    zone.on("pointerdown", clickHandler);
    marker.setInteractive({ useHandCursor: true }).on("pointerdown", clickHandler);
    label.setInteractive({ useHandCursor: true }).on("pointerdown", clickHandler);
    if (sprite) sprite.setInteractive({ useHandCursor: true }).on("pointerdown", clickHandler);

    scene.interactables.push({
      x,
      y,
      name,
      serviceType,
      radius: 88,
      clickRadius: 96,
      visuals,
      onConfirm: () => this.handleNpcInteraction(name, serviceType),
      getDialog: () => this.getNpcDialog(name, serviceType),
    });

    return sprite || visuals[1];
  }

  createDecorativeNpc(x, y, name) {
    const scene = this.scene;
    const depth = 24;
    scene.add.ellipse(x, y + 16, 24, 10, 0x000000, 0.22).setDepth(depth - 1);
    if (scene.textures?.exists?.("npc_pawn_idle_sheet")) {
      scene.add.sprite(x, y, "npc_pawn_idle_sheet", 0).setScale(0.22).setDepth(depth).setTint(0xa8b7c0);
    } else {
      scene.add.circle(x, y - 14, 8, 0xd5bd91, 0.95).setDepth(depth + 1);
      scene.add.rectangle(x, y + 2, 16, 24, 0x2f4f4f, 0.9).setDepth(depth);
    }

    scene.add.text(x, y - 42, name, {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "10px",
      color: "#d7e1e5",
      align: "center",
      stroke: "#0b141a",
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(depth + 2);
  }

  createTemporaryClassNpc(x, y, name, className = "archer") {
    const scene = this.scene;
    const depth = 32;
    const visuals = [];
    const waypoints = [
      { x, y },
      { x: x + 95, y: y - 48 },
      { x: x + 170, y: y + 34 },
      { x: x + 42, y: y + 82 },
    ];
    const shadow = scene.add.ellipse(x, y + 18, 30, 10, 0x000000, 0.24).setDepth(depth - 1);
    const textureKey = `city_class_${className}_south`;
    const body = scene.textures?.exists?.(textureKey)
      ? scene.add.image(x, y, textureKey).setDisplaySize(42, 42).setDepth(depth)
      : scene.add.rectangle(x, y, 22, 30, 0xd8b15c, 0.95).setDepth(depth);
    const label = scene.add.text(x, y - 42, name, {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "11px",
      color: "#f8f1dc",
      align: "center",
      stroke: "#0b141a",
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(depth + 1);
    visuals.push(shadow, body, label);
    const interactable = {
      x,
      y,
      name,
      serviceType: "temporary_cakir",
      radius: 72,
      clickRadius: 78,
      visuals,
      patrol: {
        className,
        shadow,
        body,
        label,
        waypoints,
        targetIndex: 1,
        speed: 42,
        lastDir: new Phaser.Math.Vector2(0, 1),
      },
      onConfirm: () => scene.showCityBanner?.(name, "Geçici test NPC.", 1600),
      getDialog: () => [`${name}: Şimdilik test için buradayım.`],
    };
    scene.interactables.push(interactable);
  }

  update() {
    const scene = this.scene;
    const delta = Math.min(0.05, (scene.game?.loop?.delta || 16) / 1000);
    (scene.interactables || []).forEach((interactable) => {
      if (!interactable?.patrol) return;
      const patrol = interactable.patrol;
      const target = patrol.waypoints[patrol.targetIndex] || patrol.waypoints[0];
      const dir = new Phaser.Math.Vector2(target.x - interactable.x, target.y - interactable.y);
      if (dir.lengthSq() <= 16) {
        patrol.targetIndex = (patrol.targetIndex + 1) % patrol.waypoints.length;
        return;
      }
      dir.normalize();
      patrol.lastDir = dir.clone();
      interactable.x += dir.x * patrol.speed * delta;
      interactable.y += dir.y * patrol.speed * delta;
      patrol.shadow?.setPosition(interactable.x, interactable.y + 18);
      patrol.body?.setPosition(interactable.x, interactable.y);
      patrol.label?.setPosition(interactable.x, interactable.y - 42);
      const textureKey = `city_class_${patrol.className}_${this.getDirectionName(dir)}`;
      if (scene.textures?.exists?.(textureKey) && patrol.body?.setTexture) {
        try {
          patrol.body.setTexture(textureKey).setDisplaySize(42, 42);
        } catch (error) {
          console.warn("[NpcManager] Çakır texture swap skipped:", textureKey, error);
        }
      }
    });
  }

  getDirectionName(vec) {
    const angle = Phaser.Math.RadToDeg(Math.atan2(vec?.y || 0, vec?.x || 1));
    if (angle >= -22.5 && angle < 22.5) return "east";
    if (angle >= 22.5 && angle < 67.5) return "south-east";
    if (angle >= 67.5 && angle < 112.5) return "south";
    if (angle >= 112.5 && angle < 157.5) return "south-west";
    if (angle >= 157.5 || angle < -157.5) return "west";
    if (angle >= -157.5 && angle < -112.5) return "north-west";
    if (angle >= -112.5 && angle < -67.5) return "north";
    return "north-east";
  }


  handleNpcInteraction(name, serviceType) {
    const scene = this.scene;
    
    switch (serviceType) {
      case "potion":
        scene.openServicePanel?.(scene.interactables.find(i => i.name === name));
        break;
      case "blacksmith":
      case "sundries":
        scene.openServicePanel?.(scene.interactables.find(i => i.name === name));
        break;
      case "upgrader":
      case "anvil":
        scene.openServicePanel?.(scene.interactables.find(i => i.name === name));
        break;
      case "quest":
        scene.openServicePanel?.(scene.interactables.find(i => i.name === name));
        break;
      case "gate":
        this.handleDungeonGateInteraction();
        break;
      default:
        scene.openDialog?.(scene.interactables.find(i => i.name === name));
    }
  }

  getNpcDialog(name, serviceType) {
    switch (serviceType) {
      case "potion":
        return this.getPotionMerchantDialog();
      case "blacksmith":
        return this.getBlacksmithDialog();
      case "upgrader":
        return this.getUpgraderDialog();
      case "quest":
        return this.getQuestGiverDialog();
      case "gate":
        return this.getDungeonGateDialog();
      default:
        return [`Hello, I'm ${name}.`, "How can I help you today?"];
    }
  }

  getPotionMerchantDialog() {
    return [
      "Welcome to my potion shop!",
      "I sell health and mana potions for your dungeon adventures.",
      `Health Potion: ${this.scene.getPotionCost?.() ?? 20} Gold (heals 50 HP)`,
      `Mana Potion: ${this.scene.getMpPotionCost?.() ?? 30} Gold (restores 30 MP)`,
      "Would you like to buy some potions?"
    ];
  }

  getBlacksmithDialog() {
    return [
      "I forge the finest weapons and armor in the city.",
      "I can sell you basic equipment or help upgrade your current gear.",
      `Weapon Upgrade: ${this.scene.getUpgradeCost?.() ?? 30} Gold`,
      "Would you like to see my services?"
    ];
  }

  getUpgraderDialog() {
    return [
      "I specialize in enhancing your existing equipment.",
      "I can upgrade your weapons and armor to make them more powerful.",
      "Each upgrade increases the stats of your equipment.",
      "Would you like to upgrade your gear?"
    ];
  }

  getQuestGiverDialog() {
    const scene = this.scene;
    const questState = scene.registry?.get("questState") || "not_accepted";
    
    switch (questState) {
      case "not_accepted":
        return [
          "Adventurer! We need your help.",
          "The dungeon gates have opened, and monsters are pouring out.",
          "Will you accept the quest to clear the dungeon?",
          "Reward: Gold and valuable loot."
        ];
      case "active":
        return [
          "You've accepted the quest!",
          "Enter the dungeon and clear all the monsters.",
          "Defeat the boss to complete the quest.",
          "Return to me when you're done."
        ];
      case "ready_to_turn_in":
        return [
          "Well done! You've cleared the dungeon.",
          "Here is your reward for completing the quest.",
          `+${scene.getQuestRewardGold?.() ?? 18} Gold`,
          "Would you like to accept another quest?"
        ];
      case "completed":
        return [
          "Thank you for your service, adventurer.",
          "The city is safer thanks to you.",
          "You can continue exploring the dungeon for more rewards.",
          "Or take on repeatable bounties for additional gold."
        ];
      default:
        return [
          "Hello adventurer!",
          "I have quests available for brave souls like you.",
          "Would you like to see what's available?"
        ];
    }
  }

  getDungeonGateDialog() {
    return [
      "This gate leads to the dungeon.",
      "Are you prepared for your adventure?",
      "Make sure you have enough potions and your gear is ready.",
      "Enter when you're ready to face the challenges ahead."
    ];
  }

  handleQuestGiverInteraction() {
    const scene = this.scene;
    const quest = scene.interactables?.find?.((i) => i.serviceType === "quest") || { name: "Quest Giver", serviceType: "quest" };
    scene.openServicePanel?.(quest);
  }

  handleDungeonGateInteraction() {
    const scene = this.scene;
    const gate = scene.interactables?.find?.((i) => i.name === "Dungeon Gate") || { name: "Dungeon Gate", serviceType: "gate" };
    scene.openServicePanel?.(gate);
  }

  handleQuestGiverConfirm() {
    const scene = this.scene;
    const questState = scene.registry?.get("questState") || "not_accepted";
    
    if (questState === "not_accepted") {
      scene.registry?.set("questState", "active");
      scene.showCityBanner?.("Quest Accepted", "Clear the dungeon!", 2000);
      scene.closeDialog?.();
    } else if (questState === "ready_to_turn_in") {
      scene.registry?.set("questState", "completed");
      const gold = scene.registry?.get("gold") || 0;
      scene.registry?.set("gold", gold + (scene.getQuestRewardGold?.() ?? 18));
      scene.showCityBanner?.("Quest Completed", `+${scene.getQuestRewardGold?.() ?? 18} Gold`, 2000);
      scene.closeDialog?.();
    } else {
      scene.closeDialog?.();
    }
  }

  // Dialog panel methods
  createDialogPanel() {
    const scene = this.scene;
    const { width, height } = scene.scale;
    
    if (scene.dialogElements) {
      // Panel already exists
      return;
    }
    
    // Create dialog panel background
    const panelBg = scene.add.rectangle(width / 2, height - 100, 500, 180, 0x1a2833, 0.95)
      .setStrokeStyle(2, 0x415260, 0.9)
      .setScrollFactor(0)
      .setDepth(100)
      .setInteractive();
    
    // Dialog title
    const title = scene.add.text(width / 2, height - 180, "", {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "20px",
      color: "#f4df9c",
      stroke: "#0b141a",
      strokeThickness: 3,
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101);
    
    // Dialog body text
    const body = scene.add.text(width / 2, height - 140, "", {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "14px",
      color: "#f8f1dc",
      wordWrap: { width: 450 },
      align: "center",
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101);
    
    // Dialog hint text
    const hint = scene.add.text(width / 2, height - 50, "Press E to interact, ESC to close", {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "12px",
      color: "#b8c5c9",
      align: "center",
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101);
    
    scene.dialogElements = {
      panel: panelBg,
      title: title,
      body: body,
      hint: hint
    };
    
    // Initially hide the dialog
    this.setDialogVisible(false);
  }
  
  setDialogVisible(visible) {
    const scene = this.scene;
    
    if (scene.dialogElements) {
      scene.dialogElements.panel.setVisible(visible);
      scene.dialogElements.title.setVisible(visible);
      scene.dialogElements.body.setVisible(visible);
      scene.dialogElements.hint.setVisible(visible);
    }
  }
  
  openDialog(interactable) {
    const scene = this.scene;
    
    if (interactable?.serviceType) {
      scene.openServicePanel?.(interactable);
      return;
    }
    
    // Create dialog panel if it doesn't exist
    if (!scene.dialogElements) {
      this.createDialogPanel();
    }
    
    scene.dialogOpen = true;
    scene.activeInteractable = interactable;
    scene.interactionPrompt?.setVisible(false);
    
    // Set dialog text
    if (scene.dialogElements) {
      scene.dialogElements.title.setText(interactable.name || "NPC");
      
      const dialogText = this.resolveInteractableValue(interactable.getDialog?.(), interactable);
      scene.dialogElements.body.setText(dialogText || "Hello adventurer!");
      
      const hintText = interactable.dialogHintText ? this.resolveInteractableValue(interactable.dialogHintText, interactable) : "Press E to interact, ESC to close";
      scene.dialogElements.hint.setText(hintText);
    }
    
    this.setDialogVisible(true);
  }
  
  closeDialog() {
    const scene = this.scene;
    
    if (scene.servicePanelOpen) {
      scene.closeServicePanel?.();
      return;
    }
    
    scene.dialogOpen = false;
    this.setDialogVisible(false);
  }
  
  resolveInteractableValue(value, interactable) {
    return typeof value === "function" ? value(interactable) : value;
  }
  
  // Helper method to get dialog text from NPC
  getDialogForNpc(name, serviceType) {
    switch (serviceType) {
      case "potion":
        return this.getPotionMerchantDialog();
      case "blacksmith":
        return this.getBlacksmithDialog();
      case "upgrader":
        return this.getUpgraderDialog();
      case "quest":
        return this.getQuestGiverDialog();
      case "gate":
        return this.getDungeonGateDialog();
      default:
        return [`Hello, I'm ${name}.`, "How can I help you today?"];
    }
  }
}

window.NpcManager = NpcManager;
