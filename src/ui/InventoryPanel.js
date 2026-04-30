/**
 * InventoryPanel - Knight Online-style inventory UI.
 * Isolated, container-based inventory display.
 *
 * Safety goals:
 * - One stable Phaser Container controls the whole panel.
 * - show()/hide() never destroy the UI.
 * - refresh() only updates existing slot views.
 * - Event handlers are attached once during create(), not on every refresh.
 * - Optional GameState/scene helpers are guarded to avoid runtime crashes.
 */
class InventoryPanel {
  constructor(scene, registry, GameState) {
    this.scene = scene;
    this.registry = registry;
    this.GameState = GameState || window.GameState || {};
    this.container = null;
    this.visible = false;

    this.equipmentSlotViews = [];
    this.inventorySlotViews = [];
    this.resourceTexts = {};
    this.tooltipElements = null;
    this.hoveredTooltip = null;

    this.panelMetrics = null;
  }

  create() {
    const { width, height } = this.scene.scale;
    const panelW = 720;
    const panelH = 500;
    const panelX = width / 2 - panelW / 2;
    const panelY = height / 2 - panelH / 2;

    this.panelMetrics = { width, height, panelW, panelH, panelX, panelY };
    this.scene.input?.mouse?.disableContextMenu?.();
    this.equipmentSlotViews = [];
    this.inventorySlotViews = [];
    this.resourceTexts = {};
    this.hideTooltip();

    this.container = this.scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(99999);
    this.container.setVisible(false);

    const children = [];

    const bg = this.scene.add.rectangle(width / 2, height / 2, panelW, panelH, 0x101820, 0.97)
      .setStrokeStyle(3, 0x9b7a35, 0.98);
    children.push(bg);

    const innerBg = this.scene.add.rectangle(width / 2, height / 2 + 8, panelW - 22, panelH - 56, 0x182634, 0.74)
      .setStrokeStyle(1, 0x314554, 0.8);
    children.push(innerBg);

    const title = this.scene.add.text(panelX + 24, panelY + 18, "Inventory", {
      fontSize: "22px",
      color: "#f6e2a0",
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 3,
    }).setScrollFactor(0);
    children.push(title);

    const closeHint = this.scene.add.text(panelX + panelW - 24, panelY + 24, "Press I or ESC to close", {
      fontSize: "12px",
      color: "#d7c58f",
      fontFamily: "Trebuchet MS, Arial, sans-serif",
    }).setOrigin(1, 0).setScrollFactor(0);
    children.push(closeHint);

    children.push(this.createSectionHeader(panelX + 34, panelY + 62, "Equipment"));
    children.push(this.createSectionHeader(panelX + 318, panelY + 62, "Bag"));

    // Paperdoll area on the left, closer to the Knight Online inventory feel.
    const dollX = panelX + 164;
    const dollY = panelY + 250;
    const doll = this.scene.add.ellipse(dollX, dollY, 96, 210, 0x0b1118, 0.76)
      .setStrokeStyle(2, 0x314554, 0.9)
      .setScrollFactor(0);
    children.push(doll);

    const dollText = this.scene.add.text(dollX, dollY - 12, "HERO", {
      fontSize: "13px",
      color: "#6f8591",
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontStyle: "bold",
    }).setOrigin(0.5).setScrollFactor(0);
    children.push(dollText);

    const slotSize = 54;
    const equipLayout = [
      { slot: "head", label: "Head", x: dollX, y: panelY + 112 },
      { slot: "body", label: "Body", x: dollX, y: panelY + 196 },
      { slot: "hands", label: "Hands", x: dollX - 82, y: panelY + 208 },
      { slot: "legs", label: "Legs", x: dollX, y: panelY + 304 },
      { slot: "weapon", label: "Weapon", x: dollX + 88, y: panelY + 208 },
    ];

    equipLayout.forEach((cfg) => {
      children.push(...this.createEquipmentSlot(cfg, slotSize));
    });

    const gridStartX = panelX + 318;
    const gridStartY = panelY + 104;
    const gridSlotSize = 52;
    const gridSpacing = 60;

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        const index = row * 5 + col;
        const sx = gridStartX + col * gridSpacing + gridSlotSize / 2;
        const sy = gridStartY + row * gridSpacing + gridSlotSize / 2;
        children.push(...this.createInventorySlot(index, sx, sy, gridSlotSize));
      }
    }

    const resourcePanel = this.scene.add.rectangle(width / 2, panelY + panelH - 42, panelW - 44, 42, 0x0b1118, 0.72)
      .setStrokeStyle(1, 0x314554, 0.85)
      .setScrollFactor(0);
    children.push(resourcePanel);

    const resourceText = this.scene.add.text(panelX + 34, panelY + panelH - 52, "", {
      fontSize: "12px",
      color: "#dfe8ea",
      fontFamily: "Trebuchet MS, Arial, sans-serif",
    }).setScrollFactor(0);
    children.push(resourceText);
    this.resourceTexts.resourceText = resourceText;

    const statusText = this.scene.add.text(panelX + 34, panelY + panelH - 28, "", {
      fontSize: "11px",
      color: "#f4df9c",
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      wordWrap: { width: panelW - 68, useAdvancedWrap: true },
      maxLines: 1,
    }).setScrollFactor(0);
    children.push(statusText);
    this.resourceTexts.statusText = statusText;

    const helperText = this.scene.add.text(panelX + panelW - 34, panelY + panelH - 52, "Right-click: equip  |  Click equipped slot: unequip", {
      fontSize: "11px",
      color: "#9fb0b7",
      fontFamily: "Trebuchet MS, Arial, sans-serif",
    }).setOrigin(1, 0).setScrollFactor(0);
    children.push(helperText);

    this.container.add(children);
    return true;
  }

  createSectionHeader(x, y, label) {
    return this.scene.add.text(x, y, label, {
      fontSize: "15px",
      color: "#f4df9c",
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 2,
    }).setScrollFactor(0);
  }

  createEquipmentSlot(cfg, slotSize) {
    const children = [];
    const bg = this.scene.add.rectangle(cfg.x, cfg.y, slotSize, slotSize, 0x22313a, 0.95)
      .setStrokeStyle(2, 0x5f767a, 0.75)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    bg.setData("equipmentSlot", cfg.slot);
    children.push(bg);

    const icon = this.scene.add.image(cfg.x, cfg.y, this.safeTextureKey(this.defaultIconForSlot(cfg.slot)))
      .setDisplaySize(31, 31)
      .setScrollFactor(0)
      .setAlpha(0.22);
    children.push(icon);

    const label = this.scene.add.text(cfg.x, cfg.y - slotSize / 2 - 15, cfg.label, {
      fontSize: "11px",
      color: "#b8c5c9",
      align: "center",
      fontFamily: "Trebuchet MS, Arial, sans-serif",
    }).setOrigin(0.5).setScrollFactor(0);
    children.push(label);

    const itemText = this.scene.add.text(cfg.x, cfg.y + slotSize / 2 + 6, "Empty", {
      fontSize: "10px",
      color: "#88979e",
      align: "center",
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      wordWrap: { width: 92, useAdvancedWrap: true },
      maxLines: 2,
    }).setOrigin(0.5, 0).setScrollFactor(0);
    children.push(itemText);

    const view = { slot: cfg.slot, label: cfg.label, bg, icon, itemText, currentItem: null };
    this.equipmentSlotViews.push(view);

    bg.on("pointerdown", () => this.handleEquipmentSlotClick(view));
    bg.on("pointerover", () => {
      bg.setStrokeStyle(2, 0xd2b768, 0.98);
      if (view.currentItem) {
        this.hoveredTooltip = { item: view.currentItem, x: cfg.x, y: cfg.y };
        this.showTooltip(view.currentItem, cfg.x, cfg.y);
      }
    });
    bg.on("pointerout", () => {
      this.applyEquipmentSlotBorder(view);
      this.hideTooltip();
      this.hoveredTooltip = null;
      this.safeClearHoverState();
    });

    return children;
  }

  createInventorySlot(index, sx, sy, size) {
    const children = [];
    const bg = this.scene.add.rectangle(sx, sy, size, size, 0x24323c, 0.95)
      .setStrokeStyle(2, 0x4e6570, 0.75)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    bg.setData("inventoryIndex", index);
    children.push(bg);

    const icon = this.scene.add.image(sx, sy, this.safeTextureKey("icon_11"))
      .setDisplaySize(29, 29)
      .setScrollFactor(0)
      .setAlpha(0);
    children.push(icon);

    const initials = this.scene.add.text(sx, sy, "", {
      fontSize: "10px",
      color: "#f8f1dc",
      align: "center",
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontStyle: "bold",
    }).setOrigin(0.5).setScrollFactor(0).setAlpha(0);
    children.push(initials);

    const count = this.scene.add.text(sx + size / 2 - 5, sy + size / 2 - 14, "", {
      fontSize: "10px",
      color: "#f8f1dc",
      align: "right",
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      stroke: "#000000",
      strokeThickness: 2,
    }).setOrigin(1, 0).setScrollFactor(0);
    children.push(count);

    const view = { index, bg, icon, initials, count, x: sx, y: sy, size, currentItem: null };
    this.inventorySlotViews.push(view);

    const handlePointerDown = (pointer) => this.handleInventorySlotClick(view, pointer);
    bg.on("pointerdown", handlePointerDown);
    icon.setInteractive({ useHandCursor: true });
    icon.on("pointerdown", handlePointerDown);
    initials.setInteractive({ useHandCursor: true });
    initials.on("pointerdown", handlePointerDown);

    const onOver = () => {
      bg.setStrokeStyle(2, 0xd2b768, 0.98);
      if (view.currentItem) {
        this.hoveredTooltip = { item: view.currentItem, x: sx, y: sy };
        this.showTooltip(view.currentItem, sx, sy);
      }
    };
    const onOut = () => {
      this.applyInventorySlotBorder(view);
      this.hideTooltip();
      this.hoveredTooltip = null;
      this.safeClearHoverState();
    };
    bg.on("pointerover", onOver);
    bg.on("pointerout", onOut);
    icon.on("pointerover", onOver);
    icon.on("pointerout", onOut);
    initials.on("pointerover", onOver);
    initials.on("pointerout", onOut);

    return children;
  }

  show() {
    if (!this.container || !this.container.active) {
      if (!this.create()) {
        console.error("[InventoryPanel] Failed to create inventory panel");
        return;
      }
    }

    this.refresh();
    this.container.setAlpha(1);
    this.container.setDepth(99999);
    this.container.setVisible(true);
    if (this.scene.children && this.scene.children.bringToTop) {
      this.scene.children.bringToTop(this.container);
    }
    this.visible = true;
    this.bindShiftCompareRefresh();
  }

  hide() {
    this.hideTooltip();
    if (this.container && this.container.active) {
      this.container.setVisible(false);
    }
    this.visible = false;
    this.scene?.game?.canvas?.focus();
  }

  toggle() {
    if (this.isVisible()) this.hide();
    else this.show();
  }

  isVisible() {
    return !!(this.visible && this.container && this.container.active && this.container.visible);
  }

  refresh() {
    this.refreshEquipment();
    this.refreshGrid();
    this.refreshResources();
  }

  refreshEquipment() {
    this.equipmentSlotViews.forEach((view) => {
      const item = this.GameState.getEquippedItem?.(this.registry, view.slot) || null;
      view.currentItem = item;

      if (item) {
        const iconKey = this.resolveIconKey(item, view.slot);
        const color = this.resolveItemColor(item);
        view.icon.setTexture(iconKey).setTint(color).setAlpha(1).setDisplaySize(34, 34);
        view.itemText.setText(this.compactName(item.name || "Item", 13));
        view.itemText.setColor(this.hexColor(color));
      } else {
        view.icon.setTexture(this.safeTextureKey(this.defaultIconForSlot(view.slot))).setTint(0x8d99a1).setAlpha(0.22).setDisplaySize(31, 31);
        view.itemText.setText("Empty");
        view.itemText.setColor("#88979e");
      }

      this.applyEquipmentSlotBorder(view);
    });
  }

  refreshGrid() {
    const inventory = this.GameState.getInventoryItems?.(this.registry) || [];

    this.inventorySlotViews.forEach((view, index) => {
      const item = inventory[index] || null;
      view.currentItem = item;

      if (item) {
        const iconKey = this.resolveIconKey(item, item.slot || null);
        const color = this.resolveItemColor(item);
        view.bg.setFillStyle(0x33434e, 0.98);
        view.icon.setTexture(iconKey).setTint(color).setAlpha(1).setDisplaySize(30, 30);
        view.initials.setText(this.getInitials(item.name || item.id || "IT")).setAlpha(0);
        view.count.setText(item.count > 1 ? String(item.count) : "");
      } else {
        view.bg.setFillStyle(0x24323c, 0.92);
        view.icon.setAlpha(0);
        view.initials.setText("").setAlpha(0);
        view.count.setText("");
      }

      this.applyInventorySlotBorder(view);
    });
  }

  refreshResources() {
    const resourceText = this.resourceTexts.resourceText;
    if (!resourceText) return;

    const gold = this.registry.get("gold") || 0;
    const hpPotions = this.registry.get("healthPotionCount") || 0;
    const mpPotions = this.registry.get("mpPotionCount") || 0;
    resourceText.setText(`Gold: ${gold}   |   HP Potions: ${hpPotions}   |   MP Potions: ${mpPotions}`);
  }

  handleInventorySlotClick(view, pointer) {
    const item = view.currentItem;
    if (!item) return;

    const nativeButton = pointer?.event?.button;
    const nativeButtons = pointer?.event?.buttons;
    const isRightClick = pointer?.button === 2
      || nativeButton === 2
      || (typeof nativeButtons === "number" && (nativeButtons & 2) === 2)
      || (pointer?.rightButtonDown && pointer.rightButtonDown());

    if (isRightClick) {
      pointer?.event?.preventDefault?.();
      if (item.id === "hpPotion" || item.id === "mpPotion") {
        const result = this.GameState.assignConsumableToHotbar?.(this.registry, item.id);
        if (result?.ok) {
          this.safeBanner(`${item.name || item.id} assigned to hotbar slot ${result.index + 1}.`);
          this.scene.uiManager?.hotbarPanel?.refresh?.();
        } else {
          this.safeBanner("Could not assign this item to hotbar.");
        }
        return;
      }
      this.tryEquipFromInventory(view.index, item);
      return;
    }

    this.showTooltip(item, view.x, view.y);
  }

  handleEquipmentSlotClick(view) {
    if (!view.currentItem) return;
    this.tryUnequip(view.slot, view.label);
  }

  normalizeEquipSlot(itemOrSlot) {
    const raw = typeof itemOrSlot === "string"
      ? itemOrSlot
      : (itemOrSlot?.slot || itemOrSlot?.equipmentSlot || itemOrSlot?.type || itemOrSlot?.category || itemOrSlot?.id || itemOrSlot?.name || "");
    const value = String(raw || "").toLowerCase().replace(/[^a-z0-9_ -]/g, "");

    if (["head", "helm", "helmet", "hood", "hat", "crown", "cap", "mask"].some((k) => value.includes(k))) return "head";
    if (["body", "armor", "armour", "chest", "robe", "jacket", "garb", "plate", "tunic", "vest"].some((k) => value.includes(k))) return "body";
    if (["hands", "hand", "glove", "gloves", "gauntlet", "gauntlets", "grip", "grips", "bracer", "bracers", "wrap", "wraps"].some((k) => value.includes(k))) return "hands";
    if (["legs", "leg", "boot", "boots", "greaves", "sabatons", "slippers", "treads", "pants", "legging"].some((k) => value.includes(k))) return "legs";
    if (["weapon", "sword", "axe", "staff", "wand", "dagger", "knife", "knives", "blade", "bow", "crossbow", "mace", "spear"].some((k) => value.includes(k))) return "weapon";

    return null;
  }

  tryEquipFromInventory(index, item) {
    const normalizedSlot = this.normalizeEquipSlot(item);
    if (!normalizedSlot) {
      this.safeBanner("This item cannot be equipped.", "#d96b6b");
      return false;
    }

    const inventory = [...(this.GameState.getInventoryItems?.(this.registry) || [])];
    const originalItem = inventory[index] || item;
    const normalizedItem = { ...originalItem, slot: normalizedSlot };

    const reqStatus = this.getEquipRequirementStatus(normalizedItem);
    if (reqStatus && !reqStatus.ok) {
      this.safeBanner(reqStatus.message, "#d96b6b");
      this.showTooltip(normalizedItem, this.inventorySlotViews[index]?.x || this.panelMetrics?.width / 2 || 0, this.inventorySlotViews[index]?.y || this.panelMetrics?.height / 2 || 0);
      return false;
    }

    if (originalItem && originalItem.slot !== normalizedSlot) {
      inventory[index] = normalizedItem;
      this.registry.set("inventoryItems", inventory);
    }

    let result = null;
    if (this.GameState.equipFromInventory) {
      result = this.GameState.equipFromInventory(this.registry, index);
    }

    if (result === true || result?.ok) {
      this.safeBanner(`Equipped ${normalizedItem.name || "item"}`, "#8ad97a");
      this.afterEquipmentChanged();
      return true;
    }

    const fallbackResult = this.forceEquipFromInventory(index, normalizedItem, normalizedSlot);
    if (fallbackResult.ok) {
      this.safeBanner(`Equipped ${normalizedItem.name || "item"}`, "#8ad97a");
      this.afterEquipmentChanged();
      return true;
    }

    const finalResult = result || fallbackResult;
    if (finalResult?.reason === "requirement" && finalResult.requirement) {
      const label = finalResult.requirement.statLabel || finalResult.requirement.label || "stat";
      const need = finalResult.requirement.value || "";
      const current = finalResult.currentValue ?? this.registry.get(finalResult.requirement.statKey) ?? 0;
      this.safeBanner(`Cannot equip: requires ${label} ${need} (you have ${current})`, "#d96b6b");
    } else if (finalResult?.reason === "bag_full") {
      this.safeBanner("Cannot equip: bag is full.", "#d96b6b");
    } else {
      this.safeBanner("Cannot equip this item.", "#d96b6b");
    }
    return false;
  }

  forceEquipFromInventory(index, item, normalizedSlot) {
    const allowed = ["head", "body", "hands", "legs", "weapon"];
    if (!allowed.includes(normalizedSlot)) return { ok: false, reason: "bad_slot" };

    if (this.GameState.canEquipItem) {
      const canEquip = this.GameState.canEquipItem(this.registry, item);
      if (!canEquip?.ok) return canEquip || { ok: false, reason: "requirement" };
    }

    const inventory = [...(this.GameState.getInventoryItems?.(this.registry) || [])];
    if (index < 0 || index >= inventory.length || !inventory[index]) {
      return { ok: false, reason: "no_item" };
    }

    const equippedKey = `equipped_${normalizedSlot}`;
    const currentEquipped = this.GameState.getEquippedItem?.(this.registry, normalizedSlot) || this.registry.get(equippedKey) || null;
    inventory[index] = currentEquipped ? { ...currentEquipped, slot: normalizedSlot } : null;
    this.registry.set(equippedKey, { ...item, slot: normalizedSlot });
    this.registry.set("inventoryItems", inventory);
    return { ok: true, item, previousItem: currentEquipped };
  }

  tryUnequip(slot, label) {
    if (!this.GameState.unequipToInventory) {
      this.safeBanner("Unequip system is not available yet.");
      return false;
    }

    const ok = this.GameState.unequipToInventory(this.registry, slot);
    if (ok) {
      this.safeBanner(`Unequipped ${label || slot}`);
      this.afterEquipmentChanged();
      return true;
    }

    this.safeBanner("Cannot unequip: bag may be full.");
    return false;
  }

  afterEquipmentChanged() {
    this.refresh();
    if (this.scene.getPlayerSpeed) this.scene.playerSpeed = this.scene.getPlayerSpeed();
    if (this.scene.refreshCityUi) this.scene.refreshCityUi();
    if (this.scene.characterOpen && this.scene.refreshCharacterPanel) this.scene.refreshCharacterPanel();
  }

  applyEquipmentSlotBorder(view) {
    if (!view?.bg) return;
    const color = view.currentItem ? this.resolveItemColor(view.currentItem) : 0x5f767a;
    view.bg.setStrokeStyle(2, color, view.currentItem ? 0.98 : 0.75);
  }

  applyInventorySlotBorder(view) {
    if (!view?.bg) return;
    const color = view.currentItem ? this.resolveItemColor(view.currentItem) : 0x4e6570;
    view.bg.setStrokeStyle(2, color, view.currentItem ? 0.98 : 0.75);
  }

  showTooltip(item, x, y) {
    if (!item || !this.scene) return;
    this.hideTooltip();

    const { width, height } = this.scene.scale;
    const shiftDown = this.isShiftDown();
    const compare = shiftDown && item.slot ? this.GameState.getEquipmentComparison?.(this.registry, item) : null;
    const compareLines = compare ? this.buildCompareLines(compare) : [];
    const boxW = 250;
    const boxH = compareLines.length ? 260 : 210;
    let tooltipX = x + 122;
    let tooltipY = y - 8;

    if (tooltipX + boxW / 2 > width - 8) tooltipX = x - 142;
    if (tooltipY + boxH / 2 > height - 8) tooltipY = height - boxH / 2 - 8;
    if (tooltipY - boxH / 2 < 8) tooltipY = boxH / 2 + 8;

    const elements = [];
    const bg = this.scene.add.rectangle(tooltipX, tooltipY, boxW, boxH, 0x0c141c, 0.98)
      .setStrokeStyle(2, this.resolveItemColor(item), 0.95)
      .setScrollFactor(0)
      .setDepth(100000);
    elements.push(bg);

    const nameColor = this.hexColor(this.resolveItemColor(item));
    const upgradeLevel = item.upgradeLevel || 0;
    const displayName = upgradeLevel > 0 && !String(item.name || "").includes(`+${upgradeLevel}`)
      ? `${item.name || "Unknown"} +${upgradeLevel}`
      : (item.name || "Unknown");
    const nameText = this.scene.add.text(tooltipX - boxW / 2 + 12, tooltipY - boxH / 2 + 10, displayName, {
      fontSize: "14px",
      color: nameColor,
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontStyle: "bold",
      wordWrap: { width: boxW - 24, useAdvancedWrap: true },
      maxLines: 2,
    }).setScrollFactor(0).setDepth(100001);
    elements.push(nameText);

    const rarity = this.getRarityName(item);
    const typeLine = `${rarity} ${item.slot || item.type || "Item"}${upgradeLevel > 0 ? `  |  Upgrade +${upgradeLevel}` : ""}`;
    const typeText = this.scene.add.text(tooltipX - boxW / 2 + 12, tooltipY - boxH / 2 + 44, typeLine, {
      fontSize: "11px",
      color: "#b8c5c9",
      fontFamily: "Trebuchet MS, Arial, sans-serif",
    }).setScrollFactor(0).setDepth(100001);
    elements.push(typeText);

    let statsY = tooltipY - boxH / 2 + 66;
    if (item.slot) {
      const durability = this.GameState.getItemDurabilityText?.(item) || `${item.durability ?? "-"} / ${item.maxDurability ?? "-"}`;
      const durabilityText = this.scene.add.text(tooltipX - boxW / 2 + 12, statsY, `Durability: ${durability}`, {
        fontSize: "11px",
        color: (item.durability || 0) <= 0 ? "#d96b6b" : "#d7c58f",
        fontFamily: "Trebuchet MS, Arial, sans-serif",
      }).setScrollFactor(0).setDepth(100001);
      elements.push(durabilityText);
      statsY += 16;
    }
    const stats = this.collectItemStats(item);
    if (stats.length === 0) {
      const emptyText = this.scene.add.text(tooltipX - boxW / 2 + 12, statsY, "No bonus stats", {
        fontSize: "11px",
        color: "#8a9aa3",
        fontFamily: "Trebuchet MS, Arial, sans-serif",
      }).setScrollFactor(0).setDepth(100001);
      elements.push(emptyText);
      statsY += 16;
    } else {
      stats.slice(0, 6).forEach((entry) => {
        const statText = this.scene.add.text(tooltipX - boxW / 2 + 12, statsY, entry.text, {
          fontSize: "11px",
          color: entry.color,
          fontFamily: "Trebuchet MS, Arial, sans-serif",
        }).setScrollFactor(0).setDepth(100001);
        elements.push(statText);
        statsY += 16;
      });
    }

    const reqStatus = this.getEquipRequirementStatus(item);
    if (reqStatus) {
      const reqText = this.scene.add.text(tooltipX - boxW / 2 + 12, tooltipY + boxH / 2 - 42, reqStatus.message, {
        fontSize: "10px",
        color: reqStatus.ok ? "#8ad97a" : "#d96b6b",
        fontFamily: "Trebuchet MS, Arial, sans-serif",
        wordWrap: { width: boxW - 24, useAdvancedWrap: true },
        maxLines: 2,
      }).setScrollFactor(0).setDepth(100001);
      elements.push(reqText);
    }

    if (compareLines.length) {
      let compareY = tooltipY + boxH / 2 - 88;
      const title = this.scene.add.text(tooltipX - boxW / 2 + 12, compareY, `Compare vs ${compare.equippedItem?.name || "empty slot"}`, {
        fontSize: "10px",
        color: compare.verdict === "upgrade" || compare.verdict === "empty" ? "#8ad97a" : compare.verdict === "downgrade" ? "#d96b6b" : "#d7c58f",
        fontFamily: "Trebuchet MS, Arial, sans-serif",
        fontStyle: "bold",
        wordWrap: { width: boxW - 24, useAdvancedWrap: true },
      }).setScrollFactor(0).setDepth(100001);
      elements.push(title);
      compareY += 14;
      compareLines.slice(0, 4).forEach((line) => {
        const t = this.scene.add.text(tooltipX - boxW / 2 + 12, compareY, line.text, {
          fontSize: "10px",
          color: line.delta >= 0 ? "#8ad97a" : "#d96b6b",
          fontFamily: "Trebuchet MS, Arial, sans-serif",
        }).setScrollFactor(0).setDepth(100001);
        elements.push(t);
        compareY += 13;
      });
    }

    const hintText = item.slot ? "Right-click equip | Hold Shift compare" : "Left-click then hotbar slot / drag to hotbar";
    const hint = this.scene.add.text(tooltipX - boxW / 2 + 12, tooltipY + boxH / 2 - 20, hintText, {
      fontSize: "10px",
      color: "#d7c58f",
      fontFamily: "Trebuchet MS, Arial, sans-serif",
    }).setScrollFactor(0).setDepth(100001);
    elements.push(hint);

    if (this.container) this.container.add(elements);
    this.tooltipElements = elements;
  }

  bindShiftCompareRefresh() {
    if (this.__shiftCompareBound || !this.scene?.input?.keyboard) return;
    this.__shiftCompareBound = true;
    this.scene.input.keyboard.on("keydown-SHIFT", () => this.refreshHoveredCompareTooltip());
    this.scene.input.keyboard.on("keyup-SHIFT", () => this.refreshHoveredCompareTooltip());
  }

  refreshHoveredCompareTooltip() {
    if (!this.visible || !this.hoveredTooltip?.item) return;
    this.showTooltip(this.hoveredTooltip.item, this.hoveredTooltip.x, this.hoveredTooltip.y);
  }

  isShiftDown() {
    const kb = this.scene.input?.keyboard;
    if (!kb) return false;
    return !!kb.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)?.isDown;
  }

  buildCompareLines(compare) {
    return (compare.derivedDiffs?.length ? compare.derivedDiffs : compare.statDiffs || []).map((entry) => {
      const sign = entry.delta > 0 ? "+" : "";
      return { text: `${entry.label}: ${sign}${Math.round(entry.delta * 10) / 10}`, delta: entry.delta };
    });
  }

  hideTooltip() {
    if (!this.tooltipElements) return;
    this.tooltipElements.forEach((el) => {
      if (el && el.destroy) el.destroy();
    });
    this.tooltipElements = null;
  }

  collectItemStats(item) {
    const combined = {};
    if (item.stats && typeof item.stats === "object") {
      Object.entries(item.stats).forEach(([key, value]) => { combined[key] = value; });
    }
    ["ap", "hp", "mp", "str", "dex", "def", "speed", "crit", "hpBonus", "mpBonus"].forEach((key) => {
      if (item[key] !== undefined && item[key] !== null && item[key] !== 0 && combined[key] === undefined) {
        combined[key] = item[key];
      }
    });

    return Object.entries(combined)
      .filter(([, value]) => value !== undefined && value !== null && value !== 0)
      .map(([key, value]) => {
        const label = this.statLabel(key);
        const prefix = value > 0 ? "+" : "";
        return {
          key,
          value,
          text: `${label}: ${prefix}${value}`,
          color: this.statColorForClass(key, value),
        };
      });
  }

  getEquipRequirementStatus(item) {
    if (!item) return null;
    let requirement = null;
    let canEquip = null;

    if (this.GameState.canEquipItem) {
      canEquip = this.GameState.canEquipItem(this.registry, item);
      requirement = canEquip?.requirement || null;
    } else if (this.GameState.getEquipRequirement) {
      requirement = this.GameState.getEquipRequirement(item, this.registry.get("playerClass") || this.GameState.DEFAULT_CLASS || "warrior");
    }

    if (!requirement) return null;

    const statKey = requirement.statKey;
    const label = requirement.statLabel || requirement.label || this.statLabel(statKey);
    const requiredValue = requirement.value || 0;
    const currentValue = canEquip?.currentValue ?? this.registry.get(statKey) ?? 0;
    const ok = canEquip?.ok ?? currentValue >= requiredValue;

    return {
      ok,
      label,
      statKey,
      value: requiredValue,
      currentValue,
      message: ok
        ? `Requirement met: ${label} ${currentValue}/${requiredValue}`
        : `Cannot equip: requires ${label} ${requiredValue} (you have ${currentValue})`,
    };
  }

  statColorForClass(key, value) {
    if (value < 0) return "#d96b6b";

    const playerClass = (this.registry.get("playerClass") || "warrior").toLowerCase();
    const good = {
      warrior: ["hp", "hpBonus", "str", "def", "ap"],
      mage: ["mp", "mpBonus", "ap", "dex"],
      rogue: ["dex", "speed", "crit", "ap", "str"],
      archer: ["dex", "speed", "crit", "ap", "mp"],
    };
    const weak = {
      warrior: ["mp", "mpBonus"],
      mage: ["str", "def"],
      rogue: ["mp", "mpBonus", "def"],
      archer: ["str", "def", "hpBonus"],
    };

    if ((good[playerClass] || []).includes(key)) return "#8ad97a";
    if ((weak[playerClass] || []).includes(key)) return "#d96b6b";
    return "#dfe8ea";
  }

  statLabel(key) {
    const labels = this.GameState.ITEM_STAT_LABELS || this.GameState.ITEM_STAT_LABEL || {};
    return labels[key] || {
      ap: "AP",
      hp: "HP",
      mp: "MP",
      str: "STR",
      dex: "DEX",
      def: "DEF",
      speed: "SPD",
      crit: "CRIT",
      hpBonus: "HP Bonus",
      mpBonus: "MP Bonus",
    }[key] || String(key).toUpperCase();
  }

  resolveIconKey(item, fallbackSlot = null) {
    const requested = item?.baseIcon || item?.icon || this.defaultIconForSlot(fallbackSlot || item?.slot) || "icon_11";
    return this.safeTextureKey(requested);
  }

  defaultIconForSlot(slot) {
    return {
      head: "icon_01",
      body: "icon_02",
      hands: "icon_03",
      legs: "icon_04",
      weapon: "icon_05",
    }[slot] || "icon_11";
  }

  safeTextureKey(key) {
    if (key && this.scene.textures && this.scene.textures.exists(key)) return key;
    if (this.scene.textures && this.scene.textures.exists("icon_11")) return "icon_11";
    if (this.scene.textures && this.scene.textures.exists("icon_05")) return "icon_05";
    return key || "__MISSING";
  }

  resolveItemColor(item) {
    if (item?.color) return item.color;
    if (this.GameState.getRarityColor && item?.rarity) return this.GameState.getRarityColor(item.rarity);
    const rarityColors = {
      common: 0xcfd8dc,
      uncommon: 0x79d982,
      rare: 0x6aa7ff,
      epic: 0xb678ff,
      legendary: 0xffc857,
    };
    return rarityColors[item?.rarity] || 0xcfd8dc;
  }

  getRarityName(item) {
    const rarity = item?.rarity || "common";
    const info = this.GameState.RARITY_NAMES?.[rarity];
    if (typeof info === "string") return info;
    if (info?.name) return info.name;
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  }

  hexColor(value) {
    const numeric = Number(value || 0xffffff) & 0xffffff;
    return `#${numeric.toString(16).padStart(6, "0")}`;
  }

  compactName(name, max = 14) {
    if (!name) return "-";
    return name.length > max ? `${name.slice(0, max - 1)}…` : name;
  }

  getInitials(name) {
    return String(name || "IT")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "IT";
  }

  safeBanner(message, color = "#f4df9c") {
    if (this.resourceTexts?.statusText) {
      this.resourceTexts.statusText.setText(message || "");
      this.resourceTexts.statusText.setColor(color || "#f4df9c");
      this.resourceTexts.statusText.setAlpha(1);
      this.scene.time?.delayedCall?.(2200, () => {
        if (this.resourceTexts?.statusText) this.resourceTexts.statusText.setText("");
      });
    }
    if (this.scene.showCityBanner) this.scene.showCityBanner(message);
    else console.log(`[InventoryPanel] ${message}`);
  }

  safeClearHoverState() {
    if (this.scene.clearInventoryHoverState) this.scene.clearInventoryHoverState();
  }

  destroy() {
    this.hideTooltip();
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
    this.visible = false;
    this.equipmentSlotViews = [];
    this.inventorySlotViews = [];
    this.resourceTexts = {};
  }
}

window.InventoryPanel = InventoryPanel;
console.log("[InventoryPanel] Loaded KO-style module");
