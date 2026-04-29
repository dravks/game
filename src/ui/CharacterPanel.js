/**
 * CharacterPanel - clean MMORPG / Knight Online-style character stats UI.
 *
 * Safety goals:
 * - One stable Phaser Container controls the whole panel.
 * - show()/hide() never destroy UI.
 * - refresh() only updates existing text/icons.
 * - Optional GameState/scene helpers are guarded to avoid runtime crashes.
 */
class CharacterPanel {
  constructor(scene, registry, GameState) {
    this.scene = scene;
    this.registry = registry;
    this.GameState = GameState || window.GameState || {};
    this.container = null;
    this.visible = false;

    this.identityTexts = {};
    this.baseStatViews = [];
    this.derivedStatViews = [];
    this.resourceTexts = {};
    this.equipmentViews = [];
    this.bonusTexts = [];
    this.tooltipElements = null;
    this.panelMetrics = null;
  }

  create() {
    const { width, height } = this.scene.scale;
    const panelW = 740;
    const panelH = 520;
    const panelX = width / 2 - panelW / 2;
    const panelY = height / 2 - panelH / 2;

    this.panelMetrics = { width, height, panelW, panelH, panelX, panelY };
    this.identityTexts = {};
    this.baseStatViews = [];
    this.derivedStatViews = [];
    this.resourceTexts = {};
    this.equipmentViews = [];
    this.bonusTexts = [];
    this.hideTooltip();

    this.container = this.scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(99998);
    this.container.setVisible(false);

    const children = [];

    const bg = this.scene.add.rectangle(width / 2, height / 2, panelW, panelH, 0x101820, 0.97)
      .setStrokeStyle(3, 0x9b7a35, 0.98)
      .setScrollFactor(0);
    children.push(bg);

    const innerBg = this.scene.add.rectangle(width / 2, height / 2 + 8, panelW - 22, panelH - 58, 0x182634, 0.74)
      .setStrokeStyle(1, 0x314554, 0.82)
      .setScrollFactor(0);
    children.push(innerBg);

    const title = this.scene.add.text(panelX + 24, panelY + 18, "Character", {
      fontSize: "22px",
      color: "#f6e2a0",
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 3,
    }).setScrollFactor(0);
    children.push(title);

    const closeHint = this.scene.add.text(panelX + panelW - 24, panelY + 24, "Press C or ESC to close", {
      fontSize: "12px",
      color: "#d7c58f",
      fontFamily: "Trebuchet MS, Arial, sans-serif",
    }).setOrigin(1, 0).setScrollFactor(0);
    children.push(closeHint);

    // Identity strip
    const strip = this.scene.add.rectangle(width / 2, panelY + 70, panelW - 48, 42, 0x0b1118, 0.72)
      .setStrokeStyle(1, 0x314554, 0.85)
      .setScrollFactor(0);
    children.push(strip);

    this.identityTexts.name = this.createText(panelX + 36, panelY + 58, "Name: -", 13, "#dfe8ea");
    this.identityTexts.class = this.createText(panelX + 260, panelY + 58, "Class: -", 13, "#dfe8ea");
    this.identityTexts.points = this.createText(panelX + 500, panelY + 58, "Points: 0", 13, "#f4df9c", true);
    children.push(this.identityTexts.name, this.identityTexts.class, this.identityTexts.points);

    // Section headers
    children.push(this.createSectionHeader(panelX + 34, panelY + 108, "Base Stats"));
    children.push(this.createSectionHeader(panelX + 286, panelY + 108, "Derived Stats"));
    children.push(this.createSectionHeader(panelX + 514, panelY + 108, "Equipment"));
    children.push(this.createSectionHeader(panelX + 34, panelY + 342, "Active Bonuses"));

    const basePanel = this.scene.add.rectangle(panelX + 138, panelY + 220, 218, 210, 0x0b1118, 0.56)
      .setStrokeStyle(1, 0x314554, 0.75)
      .setScrollFactor(0);
    const derivedPanel = this.scene.add.rectangle(panelX + 378, panelY + 220, 204, 210, 0x0b1118, 0.56)
      .setStrokeStyle(1, 0x314554, 0.75)
      .setScrollFactor(0);
    const equipPanel = this.scene.add.rectangle(panelX + 612, panelY + 220, 188, 210, 0x0b1118, 0.56)
      .setStrokeStyle(1, 0x314554, 0.75)
      .setScrollFactor(0);
    children.push(basePanel, derivedPanel, equipPanel);

    const baseStats = [
      { key: "hpStat", label: "HP", bonusKey: "hp" },
      { key: "mpStat", label: "MP", bonusKey: "mp" },
      { key: "strStat", label: "STR", bonusKey: "str" },
      { key: "dexStat", label: "DEX", bonusKey: "dex" },
    ];
    baseStats.forEach((cfg, index) => {
      children.push(...this.createBaseStatRow(panelX + 54, panelY + 142 + index * 45, cfg));
    });

    const derivedStats = [
      { key: "atk", label: "ATK" },
      { key: "def", label: "DEF" },
      { key: "spd", label: "SPD" },
      { key: "maxHp", label: "MaxHP" },
      { key: "maxMp", label: "MaxMP" },
    ];
    derivedStats.forEach((cfg, index) => {
      children.push(...this.createDerivedStatRow(panelX + 304, panelY + 142 + index * 36, cfg));
    });

    const equipSlots = [
      { slot: "head", label: "Head" },
      { slot: "body", label: "Body" },
      { slot: "hands", label: "Hands" },
      { slot: "legs", label: "Legs" },
      { slot: "weapon", label: "Weapon" },
    ];
    equipSlots.forEach((cfg, index) => {
      children.push(...this.createEquipmentRow(panelX + 528, panelY + 140 + index * 38, cfg));
    });

    // Bonus panel
    const bonusBg = this.scene.add.rectangle(width / 2, panelY + 414, panelW - 48, 116, 0x0b1118, 0.62)
      .setStrokeStyle(1, 0x314554, 0.82)
      .setScrollFactor(0);
    children.push(bonusBg);

    for (let i = 0; i < 5; i++) {
      const text = this.createText(panelX + 44, panelY + 365 + i * 20, "", 11, "#dfe8ea");
      text.setWordWrapWidth(panelW - 88, true);
      this.bonusTexts.push(text);
      children.push(text);
    }

    const resourcePanel = this.scene.add.rectangle(width / 2, panelY + panelH - 42, panelW - 44, 42, 0x0b1118, 0.72)
      .setStrokeStyle(1, 0x314554, 0.85)
      .setScrollFactor(0);
    children.push(resourcePanel);

    this.resourceTexts.resourceText = this.createText(panelX + 34, panelY + panelH - 52, "", 12, "#dfe8ea");
    this.resourceTexts.hintText = this.createText(panelX + panelW - 34, panelY + panelH - 52, "Click + to spend stat points", 11, "#9fb0b7");
    this.resourceTexts.hintText.setOrigin(1, 0);
    children.push(this.resourceTexts.resourceText, this.resourceTexts.hintText);

    this.container.add(children);
    return true;
  }

  createText(x, y, text, size = 12, color = "#dfe8ea", bold = false) {
    return this.scene.add.text(x, y, text, {
      fontSize: `${size}px`,
      color,
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontStyle: bold ? "bold" : "normal",
      stroke: "#000000",
      strokeThickness: bold ? 2 : 0,
    }).setScrollFactor(0);
  }

  createSectionHeader(x, y, label) {
    return this.createText(x, y, label, 15, "#f4df9c", true);
  }

  createBaseStatRow(x, y, cfg) {
    const children = [];
    const label = this.createText(x, y, cfg.label, 14, "#f8f1dc", true);
    const value = this.createText(x + 62, y, "0", 14, "#dfe8ea");
    const bonus = this.createText(x + 100, y, "(+0)", 12, "#8ad97a");
    const plusBg = this.scene.add.rectangle(x + 172, y + 10, 24, 22, 0x31424a, 0.94)
      .setStrokeStyle(1, 0xd2b768, 0.85)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    const plusText = this.createText(x + 172, y + 1, "+", 15, "#f6e2a0", true).setOrigin(0.5, 0);

    const view = { ...cfg, label, value, bonus, plusBg, plusText };
    this.baseStatViews.push(view);

    plusBg.on("pointerdown", () => this.spendPoint(cfg.key));
    plusText.setInteractive({ useHandCursor: true });
    plusText.on("pointerdown", () => this.spendPoint(cfg.key));
    plusBg.on("pointerover", () => plusBg.setFillStyle(0x4a5d33, 0.98));
    plusBg.on("pointerout", () => this.applyPlusButtonState(view));

    children.push(label, value, bonus, plusBg, plusText);
    return children;
  }

  createDerivedStatRow(x, y, cfg) {
    const children = [];
    const label = this.createText(x, y, cfg.label, 13, "#b8c5c9", true);
    const value = this.createText(x + 88, y, "0", 13, "#f8f1dc");
    const view = { ...cfg, label, value };
    this.derivedStatViews.push(view);
    children.push(label, value);
    return children;
  }

  createEquipmentRow(x, y, cfg) {
    const children = [];
    const bg = this.scene.add.rectangle(x + 18, y + 10, 30, 30, 0x24323c, 0.95)
      .setStrokeStyle(1, 0x4e6570, 0.78)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    const icon = this.scene.add.image(x + 18, y + 10, this.safeTextureKey(this.defaultIconForSlot(cfg.slot)))
      .setDisplaySize(20, 20)
      .setAlpha(0.25)
      .setScrollFactor(0);
    const text = this.createText(x + 42, y, `${cfg.label}: Empty`, 11, "#88979e");
    text.setWordWrapWidth(128, true);

    const view = { ...cfg, bg, icon, text, currentItem: null };
    this.equipmentViews.push(view);

    bg.on("pointerover", () => {
      bg.setStrokeStyle(1, 0xd2b768, 0.98);
      if (view.currentItem) this.showTooltip(view.currentItem, x + 18, y + 10);
    });
    bg.on("pointerout", () => {
      this.applyEquipmentBorder(view);
      this.hideTooltip();
    });
    icon.setInteractive({ useHandCursor: true });
    icon.on("pointerover", () => {
      if (view.currentItem) this.showTooltip(view.currentItem, x + 18, y + 10);
    });
    icon.on("pointerout", () => this.hideTooltip());

    children.push(bg, icon, text);
    return children;
  }

  show() {
    if (!this.container || !this.container.active) {
      if (!this.create()) {
        console.error("[CharacterPanel] Failed to create character panel");
        return;
      }
    }
    this.refresh();
    this.container.setAlpha(1);
    this.container.setDepth(99998);
    this.container.setVisible(true);
    if (this.scene.children?.bringToTop) this.scene.children.bringToTop(this.container);
    this.visible = true;
  }

  hide() {
    this.hideTooltip();
    if (this.container && this.container.active) this.container.setVisible(false);
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
    this.refreshIdentity();
    this.refreshBaseStats();
    this.refreshDerivedStats();
    this.refreshEquipment();
    this.refreshResources();
    this.refreshBonuses();
  }

  refreshIdentity() {
    const name = this.registry.get("playerName") || this.registry.get("heroName") || "Hero";
    const className = this.registry.get("playerClass") || this.GameState.DEFAULT_CLASS || "warrior";
    const points = this.registry.get("statPoints") || 0;
    this.identityTexts.name?.setText(`Name: ${name}`);
    this.identityTexts.class?.setText(`Class: ${this.prettyClass(className)}`);
    this.identityTexts.points?.setText(`Points: ${points}`);
    this.identityTexts.points?.setColor(points > 0 ? "#f4df9c" : "#9fb0b7");
  }

  refreshBaseStats() {
    const points = this.registry.get("statPoints") || 0;
    this.baseStatViews.forEach((view) => {
      const base = this.getBaseStat(view.key);
      const bonus = this.getStatBonus(view.bonusKey);
      view.value.setText(String(base));
      view.bonus.setText(bonus ? `(${bonus > 0 ? "+" : ""}${bonus})` : "(+0)");
      view.bonus.setColor(bonus >= 0 ? "#8ad97a" : "#d96b6b");
      this.applyPlusButtonState(view, points);
    });
  }

  refreshDerivedStats() {
    const values = this.getDerivedStats();
    this.derivedStatViews.forEach((view) => {
      view.value.setText(String(values[view.key] ?? 0));
    });
  }

  refreshEquipment() {
    this.equipmentViews.forEach((view) => {
      const item = this.GameState.getEquippedItem?.(this.registry, view.slot) || this.registry.get(`equipped_${view.slot}`) || null;
      view.currentItem = item;
      if (item) {
        const color = this.resolveItemColor(item);
        view.icon.setTexture(this.resolveIconKey(item, view.slot)).setTint(color).setAlpha(1).setDisplaySize(22, 22);
        view.text.setText(`${view.label}: ${this.compactName(item.name || "Item", 14)}`);
        view.text.setColor(this.hexColor(color));
      } else {
        view.icon.setTexture(this.safeTextureKey(this.defaultIconForSlot(view.slot))).setTint(0x8d99a1).setAlpha(0.22).setDisplaySize(20, 20);
        view.text.setText(`${view.label}: Empty`);
        view.text.setColor("#88979e");
      }
      this.applyEquipmentBorder(view);
    });
  }

  refreshResources() {
    const gold = this.registry.get("gold") || 0;
    const hpPotions = this.registry.get("healthPotionCount") || 0;
    const mpPotions = this.registry.get("mpPotionCount") || 0;
    this.resourceTexts.resourceText?.setText(`Gold: ${gold}   |   HP Potions: ${hpPotions}   |   MP Potions: ${mpPotions}`);
  }

  refreshBonuses() {
    const bonusLines = this.getActiveBonusLines();
    this.bonusTexts.forEach((text, index) => {
      text.setText(bonusLines[index] || "");
      text.setColor(index === 0 && bonusLines[0] === "No active bonuses" ? "#8a9aa3" : "#dfe8ea");
    });
  }

  applyPlusButtonState(view, points = this.registry.get("statPoints") || 0) {
    const enabled = points > 0;
    view.plusBg.setFillStyle(enabled ? 0x31424a : 0x1b252b, enabled ? 0.94 : 0.66);
    view.plusBg.setStrokeStyle(1, enabled ? 0xd2b768 : 0x4e6570, enabled ? 0.85 : 0.5);
    view.plusText.setColor(enabled ? "#f6e2a0" : "#66757c");
  }

  spendPoint(statKey) {
    const points = this.registry.get("statPoints") || 0;
    if (points <= 0) {
      this.safeBanner("No stat points available.");
      return false;
    }

    let ok = false;
    if (this.GameState.allocateStatPoint) {
      ok = this.GameState.allocateStatPoint(this.registry, statKey);
    } else {
      this.registry.set(statKey, (this.registry.get(statKey) || 0) + 1);
      this.registry.set("statPoints", Math.max(0, points - 1));
      ok = true;
    }

    if (!ok) {
      this.safeBanner("Could not spend stat point.");
      return false;
    }

    this.safeBanner(`Increased ${this.statLabel(statKey.replace("Stat", ""))}`);
    this.afterStatsChanged();
    return true;
  }

  afterStatsChanged() {
    this.refresh();
    if (this.scene.getPlayerSpeed) this.scene.playerSpeed = this.scene.getPlayerSpeed();
    else if (this.GameState.getPlayerSpeed) this.scene.playerSpeed = this.GameState.getPlayerSpeed(this.registry);
    if (this.scene.refreshCityUi) this.scene.refreshCityUi();
    if (this.scene.inventoryPanel?.refresh) this.scene.inventoryPanel.refresh();
    if (this.scene.hotbarPanel?.refresh) this.scene.hotbarPanel.refresh();
  }

  getBaseStat(key) {
    return this.GameState.getStat?.(this.registry, key) ?? this.registry.get(key) ?? 0;
  }

  getStatBonus(key) {
    let total = 0;
    if (this.GameState.getItemStatBonus) {
      total += this.GameState.getItemStatBonus(this.registry, key) || 0;
    } else {
      this.getEquipSlots().forEach((slot) => {
        const item = this.GameState.getEquippedItem?.(this.registry, slot) || this.registry.get(`equipped_${slot}`);
        total += this.getItemStatValue(item, key);
      });
    }
    total += this.getActiveBonusStat(key);
    return total;
  }

  getDerivedStats() {
    const fallbackAp = this.getStatBonus("ap") + this.getBaseStat("strStat") + this.getStatBonus("str");
    return {
      atk: this.GameState.getWeaponAp?.(this.registry) ?? fallbackAp,
      def: this.GameState.getDefense?.(this.registry) ?? this.getStatBonus("def"),
      spd: this.GameState.getPlayerSpeed?.(this.registry) ?? (this.GameState.BASE_SPEED || 180) + (this.getBaseStat("dexStat") + this.getStatBonus("dex")) * 2,
      maxHp: this.GameState.getMaxHp?.(this.registry) ?? (this.GameState.BASE_HP || 100) + this.getBaseStat("hpStat") * 10 + this.getStatBonus("hp") + this.getStatBonus("hpBonus"),
      maxMp: this.GameState.getMaxMp?.(this.registry) ?? (this.GameState.BASE_MP || 40) + this.getBaseStat("mpStat") * 8 + this.getStatBonus("mp") + this.getStatBonus("mpBonus"),
    };
  }

  getActiveBonusLines() {
    const bonuses = this.getActiveBonuses();
    if (!bonuses.length) return ["No active bonuses"];
    return bonuses.slice(0, 5).map((bonus) => this.formatBonusLine(bonus));
  }

  getActiveBonuses() {
    const candidates = [
      this.GameState.getActiveSetBonuses,
      this.GameState.getSetBonusesForEquipped,
      this.GameState.getSetBonusSummary,
    ];
    for (const fn of candidates) {
      if (typeof fn !== "function") continue;
      try {
        const result = fn.call(this.GameState, this.registry);
        if (Array.isArray(result)) return result.filter(Boolean);
        if (result && typeof result === "object") return Object.values(result).flat().filter(Boolean);
      } catch (error) {
        console.warn("[CharacterPanel] bonus helper failed", error);
      }
    }
    return [];
  }

  formatBonusLine(bonus) {
    if (typeof bonus === "string") return `• ${bonus}`;
    const name = bonus.name || bonus.label || bonus.setName || "Bonus";
    const tier = bonus.pieces || bonus.count || bonus.threshold;
    const stats = bonus.stats || bonus.effects || bonus.statBonuses || {};
    const statText = this.formatStats(stats);
    const desc = bonus.description || bonus.text || "";
    const prefix = tier ? `${name} (${tier})` : name;
    return `• ${prefix}: ${statText || desc || "active"}`;
  }

  formatStats(stats) {
    if (!stats || typeof stats !== "object") return "";
    return Object.entries(stats)
      .filter(([, value]) => value !== undefined && value !== null && value !== 0)
      .map(([key, value]) => `${this.statLabel(key)} ${value > 0 ? "+" : ""}${value}`)
      .join(", ");
  }

  getActiveBonusStat(key) {
    let total = 0;
    this.getActiveBonuses().forEach((bonus) => {
      const stats = bonus?.stats || bonus?.effects || bonus?.statBonuses || {};
      const value = stats?.[key];
      if (typeof value === "number") total += value;
    });
    return total;
  }

  getEquipSlots() {
    return this.GameState.EQUIP_SLOTS || ["head", "body", "hands", "legs", "weapon"];
  }

  getItemStatValue(item, key) {
    if (!item) return 0;
    if (typeof item[key] === "number") return item[key];
    if (typeof item.stats?.[key] === "number") return item.stats[key];
    return 0;
  }

  showTooltip(item, x, y) {
    if (!item || !this.scene) return;
    this.hideTooltip();
    const { width, height } = this.scene.scale;
    const boxW = 250;
    const boxH = 160;
    let tooltipX = x + 122;
    let tooltipY = y;
    if (tooltipX + boxW / 2 > width - 8) tooltipX = x - 142;
    if (tooltipY + boxH / 2 > height - 8) tooltipY = height - boxH / 2 - 8;
    if (tooltipY - boxH / 2 < 8) tooltipY = boxH / 2 + 8;

    const elements = [];
    const bg = this.scene.add.rectangle(tooltipX, tooltipY, boxW, boxH, 0x0c141c, 0.98)
      .setStrokeStyle(2, this.resolveItemColor(item), 0.95)
      .setScrollFactor(0)
      .setDepth(100000);
    elements.push(bg);

    const upgradeLevel = item.upgradeLevel || 0;
    const displayName = upgradeLevel > 0 && !String(item.name || "").includes(`+${upgradeLevel}`)
      ? `${item.name || "Unknown"} +${upgradeLevel}`
      : (item.name || "Unknown");
    const name = this.scene.add.text(tooltipX - boxW / 2 + 12, tooltipY - boxH / 2 + 10, displayName, {
      fontSize: "14px",
      color: this.hexColor(this.resolveItemColor(item)),
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontStyle: "bold",
      wordWrap: { width: boxW - 24, useAdvancedWrap: true },
      maxLines: 2,
    }).setScrollFactor(0).setDepth(100001);
    elements.push(name);

    const type = this.scene.add.text(tooltipX - boxW / 2 + 12, tooltipY - boxH / 2 + 44, `${this.getRarityName(item)} ${item.slot || item.type || "Item"}${upgradeLevel > 0 ? ` | Upgrade +${upgradeLevel}` : ""}`, {
      fontSize: "11px",
      color: "#b8c5c9",
      fontFamily: "Trebuchet MS, Arial, sans-serif",
    }).setScrollFactor(0).setDepth(100001);
    elements.push(type);

    let statsY = tooltipY - boxH / 2 + 66;
    this.collectItemStats(item).slice(0, 5).forEach((entry) => {
      const stat = this.scene.add.text(tooltipX - boxW / 2 + 12, statsY, entry.text, {
        fontSize: "11px",
        color: entry.color,
        fontFamily: "Trebuchet MS, Arial, sans-serif",
      }).setScrollFactor(0).setDepth(100001);
      elements.push(stat);
      statsY += 16;
    });

    if (this.container) this.container.add(elements);
    this.tooltipElements = elements;
  }

  hideTooltip() {
    if (!this.tooltipElements) return;
    this.tooltipElements.forEach((el) => {
      if (el?.destroy) el.destroy();
    });
    this.tooltipElements = null;
  }

  collectItemStats(item) {
    const combined = {};
    if (item?.stats && typeof item.stats === "object") {
      Object.entries(item.stats).forEach(([key, value]) => { combined[key] = value; });
    }
    ["ap", "hp", "mp", "str", "dex", "def", "speed", "crit", "hpBonus", "mpBonus"].forEach((key) => {
      if (item?.[key] !== undefined && item[key] !== null && item[key] !== 0 && combined[key] === undefined) {
        combined[key] = item[key];
      }
    });
    return Object.entries(combined)
      .filter(([, value]) => value !== undefined && value !== null && value !== 0)
      .map(([key, value]) => ({
        key,
        value,
        text: `${this.statLabel(key)}: ${value > 0 ? "+" : ""}${value}`,
        color: value < 0 ? "#d96b6b" : "#8ad97a",
      }));
  }

  applyEquipmentBorder(view) {
    const color = view.currentItem ? this.resolveItemColor(view.currentItem) : 0x4e6570;
    view.bg.setStrokeStyle(1, color, view.currentItem ? 0.98 : 0.78);
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
    if (key && this.scene.textures?.exists(key)) return key;
    if (this.scene.textures?.exists("icon_11")) return "icon_11";
    if (this.scene.textures?.exists("icon_05")) return "icon_05";
    return key || "__MISSING";
  }

  resolveItemColor(item) {
    if (item?.color) return item.color;
    if (this.GameState.getRarityColor && item?.rarity) return this.GameState.getRarityColor(item.rarity);
    const rarityColors = { common: 0xcfd8dc, uncommon: 0x79d982, rare: 0x6aa7ff, epic: 0xb678ff, legendary: 0xffc857 };
    return rarityColors[item?.rarity] || 0xcfd8dc;
  }

  getRarityName(item) {
    const rarity = item?.rarity || "common";
    const info = this.GameState.RARITY_NAMES?.[rarity];
    if (typeof info === "string") return info;
    if (info?.name) return info.name;
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  }

  statLabel(key) {
    const clean = String(key || "").replace("Stat", "");
    const labels = this.GameState.ITEM_STAT_LABELS || this.GameState.ITEM_STAT_LABEL || {};
    return labels[key] || labels[clean] || {
      hp: "HP", mp: "MP", str: "STR", dex: "DEX", ap: "AP", def: "DEF", speed: "SPD", crit: "CRIT",
      hpBonus: "HP Bonus", mpBonus: "MP Bonus", hpStat: "HP", mpStat: "MP", strStat: "STR", dexStat: "DEX",
    }[key] || String(clean || key).toUpperCase();
  }

  prettyClass(className) {
    return String(className || "warrior").charAt(0).toUpperCase() + String(className || "warrior").slice(1).toLowerCase();
  }

  hexColor(value) {
    const numeric = Number(value || 0xffffff) & 0xffffff;
    return `#${numeric.toString(16).padStart(6, "0")}`;
  }

  compactName(name, max = 14) {
    if (!name) return "-";
    return name.length > max ? `${name.slice(0, max - 1)}…` : name;
  }

  safeBanner(message) {
    if (this.scene.showCityBanner) this.scene.showCityBanner(message);
    else console.log(`[CharacterPanel] ${message}`);
  }

  destroy() {
    this.hideTooltip();
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
    this.visible = false;
    this.identityTexts = {};
    this.baseStatViews = [];
    this.derivedStatViews = [];
    this.resourceTexts = {};
    this.equipmentViews = [];
    this.bonusTexts = [];
  }
}

window.CharacterPanel = CharacterPanel;
console.log("[CharacterPanel] Loaded KO-style module");
