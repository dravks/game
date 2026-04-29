/**
 * HotbarPanel - bottom gameplay hotbar HUD.
 * UI only; safe to call refresh() frequently.
 */
class HotbarPanel {
  constructor(scene, registry, GameState) {
    this.scene = scene;
    this.registry = registry;
    this.GameState = GameState || window.GameState || {};
    this.container = null;
    this.slotVisuals = [];
    this.visible = false;
    this.slotCount = this.GameState.HOTBAR_SIZE || 6;
  }

  create() {
    const { width, height } = this.scene.scale;
    const slotSize = 48;
    const gap = 8;
    const totalWidth = this.slotCount * (slotSize + gap) - gap;
    const startX = width / 2 - totalWidth / 2;
    const y = height - 58;

    this.slotVisuals = [];
    this.container = this.scene.add.container(0, 0).setDepth(60).setScrollFactor(0).setVisible(true);
    const children = [];

    const panelBg = this.scene.add.rectangle(width / 2, y, totalWidth + 32, slotSize + 22, 0x0b1118, 0.68)
      .setStrokeStyle(1, 0x314554, 0.8).setScrollFactor(0);
    children.push(panelBg);

    for (let i = 0; i < this.slotCount; i++) {
      const x = startX + i * (slotSize + gap) + slotSize / 2;
      const bg = this.scene.add.rectangle(x, y, slotSize, slotSize, 0x22313a, 0.94)
        .setStrokeStyle(2, 0x5f767a, 0.75).setScrollFactor(0).setInteractive({ useHandCursor: true, dropZone: true });
      bg.setData("slotIndex", i);
      bg.setData("hotbarIndex", i);
      children.push(bg);

      const icon = this.scene.add.image(x, y, this.safeTextureKey("icon_11"))
        .setDisplaySize(28, 28).setAlpha(0.28).setScrollFactor(0);
      children.push(icon);

      const keyLabel = this.scene.add.text(x - slotSize / 2 + 5, y - slotSize / 2 + 3, String(i + 1), {
        fontSize: "10px", color: "#d7c58f", fontFamily: "Trebuchet MS, Arial, sans-serif", stroke: "#000", strokeThickness: 2,
      }).setScrollFactor(0);
      children.push(keyLabel);

      const count = this.scene.add.text(x + slotSize / 2 - 5, y + slotSize / 2 - 14, "", {
        fontSize: "10px", color: "#f8f1dc", fontFamily: "Trebuchet MS, Arial, sans-serif", stroke: "#000", strokeThickness: 2,
      }).setOrigin(1, 0).setScrollFactor(0);
      children.push(count);

      const cd = this.scene.add.rectangle(x, y, slotSize, slotSize, 0x000000, 0).setScrollFactor(0);
      children.push(cd);
      const cdArc = this.scene.add.graphics().setScrollFactor(0).setDepth(61);
      children.push(cdArc);
      const cdText = this.scene.add.text(x, y, "", {
        fontSize: "12px", color: "#ffffff", fontFamily: "Trebuchet MS, Arial, sans-serif", stroke: "#000", strokeThickness: 3,
      }).setOrigin(0.5).setScrollFactor(0);
      children.push(cdText);

      this.slotVisuals.push({ bg, icon, keyLabel, count, cd, cdArc, cdText, index: i, itemId: null, x, y, slotSize });

      bg.on("pointerover", () => this.applyHover(i, true));
      bg.on("pointerout", () => this.applyHover(i, false));
      this.scene.input.setDraggable(bg);
      bg.on("dragstart", () => {
        const itemId = this.getSlotItemId(i);
        if (!itemId) return;
        this.scene.hotbarDragPayload = { type: "hotbar", fromIndex: i, itemId };
        bg.setAlpha(0.55);
      });
      bg.on("dragend", () => {
        bg.setAlpha(1);
        this.scene.hotbarDragPayload = null;
      });
      bg.on("pointerdown", (pointer) => this.handleSlotPointer(i, pointer));
    }

    this.container.add(children);
    this.bindDropHandler();
    this.visible = true;
    this.refresh();
    return true;
  }

  show() {
    if (!this.container || !this.container.active) this.create();
    this.container.setVisible(true);
    this.visible = true;
    this.refresh();
  }

  hide() {
    if (this.container && this.container.active) this.container.setVisible(false);
    this.visible = false;
  }

  isVisible() {
    return !!(this.visible && this.container && this.container.visible);
  }

  refresh() {
    if (!this.container || !this.container.active || this.slotVisuals.length === 0) return;
    this.slotVisuals.forEach((slot) => this.refreshSlot(slot));
  }

  refreshSlot(slot) {
    const itemId = this.getSlotItemId(slot.index);
    slot.itemId = itemId;
    const def = itemId ? this.getConsumableDef(itemId) : null;
    const skill = itemId ? this.GameState.getSkillDefById?.(itemId, this.registry.get("playerClass") || this.GameState.DEFAULT_CLASS || "warrior") : null;

    if (skill) {
      const skillLevel = this.GameState.getSkillLevel?.(this.registry, skill.id) || 1;
      slot.bg.setStrokeStyle(2, skill.tint || 0x6aa7ff, 0.95).setFillStyle(0x263142, 0.98);
      slot.icon.setTexture(this.safeTextureKey(skill.icon || "icon_05"))
        .setTint(skill.tint || 0x6aa7ff).setAlpha(1).setDisplaySize(30, 30);
      slot.count.setText(`Lv${skillLevel}`);
      const remaining = this.scene.getSkillCooldownRemaining
        ? this.scene.getSkillCooldownRemaining(skill.id)
        : Math.max(0, (this.scene.classSkillReadyAt || 0) - (this.scene.time?.now || 0));
      if (remaining > 0) {
        const ratio = Math.max(0, Math.min(1, remaining / Math.max(1, skill.cooldownMs || 3000)));
        this.drawCooldownClock(slot, ratio);
        slot.cdText.setText(`${Math.ceil(remaining / 1000)}s`);
      } else {
        this.clearCooldownClock(slot);
        slot.cdText.setText("");
      }
      return;
    } else if (def) {
      const ownedCount = this.getConsumableCount(def);
      if (ownedCount <= 0) {
        this.GameState.clearHotbarSlot?.(this.registry, slot.index);
        slot.itemId = null;
        slot.bg.setStrokeStyle(2, 0x5f767a, 0.75).setFillStyle(0x22313a, 0.94);
        slot.icon.setTexture(this.safeTextureKey("icon_11")).clearTint().setAlpha(0.2).setDisplaySize(28, 28);
        slot.count.setText("");
        this.clearCooldownClock(slot);
        slot.cdText.setText("");
        return;
      }
      slot.bg.setStrokeStyle(2, def.color || 0xd7c58f, 0.95).setFillStyle(0x33434e, 0.98);
      slot.icon.setTexture(this.safeTextureKey(def.baseIcon || def.icon || "icon_11"))
        .setTint(def.color || 0xffffff).setAlpha(1).setDisplaySize(30, 30);
      slot.count.setText(String(ownedCount));
    } else {
      slot.bg.setStrokeStyle(2, 0x5f767a, 0.75).setFillStyle(0x22313a, 0.94);
      slot.icon.setTexture(this.safeTextureKey("icon_11")).clearTint().setAlpha(0.2).setDisplaySize(28, 28);
      slot.count.setText("");
    }

    this.clearCooldownClock(slot);
    slot.cdText.setText("");
  }

  drawCooldownClock(slot, ratio) {
    if (!slot) return;
    slot.cd?.setAlpha?.(0);
    const g = slot.cdArc;
    if (!g) return;
    const x = slot.x ?? slot.bg?.x ?? 0;
    const y = slot.y ?? slot.bg?.y ?? 0;
    const radius = Math.max(18, (slot.slotSize || 48) / 2 - 3);
    g.clear();
    g.fillStyle(0x000000, 0.64);
    g.slice(x, y, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio, true);
    g.fillPath();
  }

  clearCooldownClock(slot) {
    slot?.cd?.setAlpha?.(0);
    slot?.cdArc?.clear?.();
  }

  getSlotItemId(index) {
    if (typeof this.GameState.getHotbarSlot === "function") return this.GameState.getHotbarSlot(this.registry, index);
    const hotbar = this.registry.get("hotbarSlots") || [];
    return hotbar[index] || (index === 0 ? "hpPotion" : index === 1 ? "mpPotion" : null);
  }

  getConsumableDef(itemId) {
    if (typeof this.GameState.getConsumableDef === "function") return this.GameState.getConsumableDef(itemId);
    return this.GameState.CONSUMABLE_DEFS?.[itemId] || null;
  }

  getConsumableCount(def) {
    if (!def?.countKey) return 0;
    return this.registry.get(def.countKey) || 0;
  }

  getClassSkill() {
    const className = this.registry.get("playerClass") || this.GameState.DEFAULT_CLASS || "warrior";
    if (typeof this.GameState.getClassSkillForClass === "function") return this.GameState.getClassSkillForClass(className);
    return this.GameState.CLASS_SKILL_DEFS?.[className] || null;
  }

  handleKeys(actionKeys) {
    if (!actionKeys) return;
    for (let i = 0; i < this.slotCount; i++) {
      const keyName = `slot${i + 1}`;
      if (actionKeys[keyName] && Phaser.Input.Keyboard.JustDown(actionKeys[keyName])) this.useSlot(i);
    }
  }

  bindDropHandler() {
    if (this.scene.__hotbarDropHandlerBound) return;
    this.scene.__hotbarDropHandlerBound = true;
    this.scene.input.on("drop", (pointer, gameObject, dropZone) => {
      const targetIndex = dropZone?.getData?.("hotbarIndex");
      if (targetIndex === undefined || targetIndex === null) return;
      const payload = this.scene.hotbarDragPayload || this.scene.pendingHotbarAssignment || gameObject?.getData?.("hotbarPayload");
      if (!payload) return;
      this.placePayloadInSlot(payload, targetIndex);
    });
  }

  handleSlotPointer(index, pointer) {
    const nativeButton = pointer?.event?.button;
    const isRightClick = pointer?.button === 2 || nativeButton === 2;
    if (isRightClick) {
      pointer?.event?.preventDefault?.();
      this.clearSlot(index);
      return true;
    }
    if (this.scene.pendingHotbarAssignment) {
      const payload = this.scene.pendingHotbarAssignment;
      this.scene.pendingHotbarAssignment = null;
      return this.placePayloadInSlot(payload, index);
    }
    return this.useSlot(index);
  }

  placePayloadInSlot(payload, index) {
    const itemId = payload.itemId || payload.id;
    if (!itemId && payload.type !== "hotbar") return false;
    const slots = [...(this.registry.get("hotbarSlots") || new Array(this.slotCount).fill(null))].slice(0, this.slotCount);
    while (slots.length < this.slotCount) slots.push(null);
    if (payload.type === "hotbar" && payload.fromIndex !== undefined) {
      const fromIndex = payload.fromIndex;
      const source = slots[fromIndex] || payload.itemId;
      slots[fromIndex] = slots[index] || null;
      slots[index] = source || null;
    } else {
      slots[index] = itemId;
    }
    this.registry.set("hotbarSlots", slots);
    this.refresh();
    this.scene.refreshCityUi?.();
    this.scene.showCityBanner?.("Hotbar", payload.label ? `${payload.label} slot ${index + 1}` : `Slot ${index + 1} updated`, 1400);
    return true;
  }

  clearSlot(index) {
    if (typeof this.GameState.clearHotbarSlot === "function") this.GameState.clearHotbarSlot(this.registry, index);
    else {
      const slots = [...(this.registry.get("hotbarSlots") || new Array(this.slotCount).fill(null))];
      slots[index] = null;
      this.registry.set("hotbarSlots", slots);
    }
    this.refresh();
    this.scene.showCityBanner?.("Hotbar", `Slot ${index + 1} cleared`, 1200);
    return true;
  }

  useSlot(index) {
    const itemId = this.getSlotItemId(index);
    if (!itemId) return false;
    if (typeof this.scene.useHotbarSlot === "function") return this.scene.useHotbarSlot(index);

    const def = this.getConsumableDef(itemId);
    if (!def) return false;
    if (typeof this.GameState.useConsumable === "function") {
      const ok = this.GameState.useConsumable(this.registry, itemId);
      this.refresh();
      if (this.scene.refreshCityUi) this.scene.refreshCityUi();
      if (this.scene.updateCityUi) this.scene.updateCityUi();
      return ok;
    }
    return false;
  }

  applyHover(index, hover) {
    const slot = this.slotVisuals[index];
    if (!slot) return;
    if (hover) slot.bg.setStrokeStyle(2, 0xf4df9c, 1);
    else this.refreshSlot(slot);
  }

  safeTextureKey(key) {
    if (key && this.scene.textures?.exists?.(key)) return key;
    if (this.scene.textures?.exists?.("icon_11")) return "icon_11";
    if (this.scene.textures?.exists?.("icon_05")) return "icon_05";
    return key || "__MISSING";
  }

  destroy() {
    this.container?.destroy?.();
    this.container = null;
    this.slotVisuals = [];
    this.visible = false;
  }
}

window.HotbarPanel = HotbarPanel;
console.log("[HotbarPanel] Loaded stable module");
