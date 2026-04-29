class ServiceManager {
  constructor(scene) { this.scene = scene; }

  openServicePanel(interactable) {
    const scene = this.scene;
    scene.servicePanelOpen = true;
    scene.currentServiceInteractable = interactable;
    scene.currentServiceType = interactable?.serviceType || "service";
    scene.currentServiceEntries = [];
    scene.selectedServiceIndex = 0;
    this.clearPanel();
    const type = scene.currentServiceType;
    if (type === "gate" || type === "dungeon_gate") return this.createDungeonGateServicePanel();
    if (type === "quest") return this.createQuestServicePanel();
    if (type === "anvil" || type === "upgrader") return this.createAnvilServicePanel();
    if (type === "sundries" || type === "blacksmith" || type === "potion") return this.createSundriesServicePanel();
    return this.createMessagePanel("Service", "This service is not available yet.");
  }

  clearPanel() {
    const scene = this.scene;
    (scene.servicePanelElements || []).forEach((el) => el?.destroy?.());
    scene.servicePanelElements = [];
    scene.serviceEntryRows = [];
  }

  closeServicePanel() {
    const scene = this.scene;
    scene.servicePanelOpen = false;
    scene.currentServiceInteractable = null;
    scene.currentServiceType = null;
    scene.currentServiceEntries = [];
    scene.selectedServiceIndex = 0;
    this.clearPanel();
    scene.game?.canvas?.focus?.();
  }

  createBasePanel(title, subtitle = "") {
    const scene = this.scene;
    const { width, height } = scene.scale;
    this.clearPanel();
    const panelW = Math.min(860, width - 48);
    const panelH = Math.min(620, height - 48);
    const panelX = width / 2 - panelW / 2;
    const panelY = height / 2 - panelH / 2;
    const bg = scene.add.rectangle(width / 2, height / 2, panelW, panelH, 0x101820, 0.97)
      .setStrokeStyle(3, 0x9b7a35, 0.98).setScrollFactor(0).setDepth(5000).setInteractive();
    const titleText = scene.add.text(panelX + 24, panelY + 18, title, { fontFamily: "Trebuchet MS, Arial, sans-serif", fontSize: "24px", color: "#f6e2a0", stroke: "#000", strokeThickness: 3, fontStyle: "bold" }).setScrollFactor(0).setDepth(5001);
    const hint = scene.add.text(panelX + panelW - 24, panelY + 24, "ENTER/click confirm · ESC closes", { fontFamily: "Trebuchet MS, Arial, sans-serif", fontSize: "12px", color: "#d7c58f" }).setOrigin(1, 0).setScrollFactor(0).setDepth(5001);
    scene.servicePanelElements.push(bg, titleText, hint);
    if (subtitle) {
      const sub = scene.add.text(panelX + 24, panelY + 52, subtitle, { fontFamily: "Trebuchet MS, Arial, sans-serif", fontSize: "12px", color: "#b8c5c9" }).setScrollFactor(0).setDepth(5001);
      scene.servicePanelElements.push(sub);
    }
    return { width, height, panelW, panelH, panelX, panelY };
  }

  createButtonRow(index, entry, y, panelX, panelW, rowH = 46) {
    const scene = this.scene;
    const rowBg = scene.add.rectangle(panelX + panelW / 2, y, panelW - 64, rowH, 0x0f1822, 0.9)
      .setStrokeStyle(1, 0x50626f, 0.75).setScrollFactor(0).setDepth(5002).setInteractive({ useHandCursor: true });
    const name = scene.add.text(panelX + 46, y - rowH / 2 + 8, entry.name, { fontFamily: "Trebuchet MS, Arial, sans-serif", fontSize: "13px", color: "#f8f1dc", fontStyle: "bold" }).setScrollFactor(0).setDepth(5003);
    const desc = scene.add.text(panelX + 46, y + 4, entry.description || "", { fontFamily: "Trebuchet MS, Arial, sans-serif", fontSize: "10px", color: "#9fb0b7", wordWrap: { width: panelW - 240 } }).setScrollFactor(0).setDepth(5003);
    const cost = entry.cost !== undefined ? scene.add.text(panelX + panelW - 46, y - 2, `${entry.cost} Gold`, { fontFamily: "Trebuchet MS, Arial, sans-serif", fontSize: "12px", color: "#f8d36b", fontStyle: "bold" }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(5003) : null;
    rowBg.on("pointerdown", () => { scene.selectedServiceIndex = index; this.updateServiceSelection(); entry.action?.(); });
    scene.serviceEntryRows.push({ bg: rowBg, name, desc, cost });
    scene.servicePanelElements.push(rowBg, name, desc); if (cost) scene.servicePanelElements.push(cost);
  }

  updateServiceSelection() {
    const scene = this.scene;
    (scene.serviceEntryRows || []).forEach((row, index) => {
      row.bg?.setStrokeStyle(index === scene.selectedServiceIndex ? 2 : 1, index === scene.selectedServiceIndex ? 0xf4df9c : 0x50626f, index === scene.selectedServiceIndex ? 1 : 0.75);
      row.bg?.setFillStyle(index === scene.selectedServiceIndex ? 0x28394a : 0x0f1822, 0.9);
    });
  }

  confirmSelectedServiceEntry() {
    const scene = this.scene;
    const entry = scene.currentServiceEntries?.[scene.selectedServiceIndex];
    entry?.action?.();
  }

  createSundriesServicePanel() {
    const scene = this.scene;
    const m = this.createBasePanel("Sundries", "Buy potions, upgrade paper, or sell unequipped items.");
    const entries = [
      { name: "Buy HP Potion", description: "Restores 50 HP. Right-click in inventory to assign to hotbar.", cost: GameState.SHOP_ITEMS.hpPotion.price, action: () => this.buyShopItem("hpPotion") },
      { name: "Buy MP Potion", description: "Restores 30 MP. Right-click in inventory to assign to hotbar.", cost: GameState.SHOP_ITEMS.mpPotion.price, action: () => this.buyShopItem("mpPotion") },
      { name: "Buy Upgrade Paper", description: "Required for Blessed Anvil upgrades.", cost: GameState.SHOP_ITEMS.upgradePaper.price, action: () => this.buyShopItem("upgradePaper") },
    ];
    const inventory = GameState.getInventoryItems(scene.registry);
    inventory.forEach((item, idx) => { if (item) entries.push({ name: `Sell ${item.name || item.id}`, description: `${item.rarity || "common"} ${item.slot || item.type || "item"}`, action: () => this.sellInventoryItem(idx) }); });
    scene.currentServiceEntries = entries;
    entries.slice(0, 10).forEach((entry, index) => this.createButtonRow(index, entry, m.panelY + 92 + index * 50, m.panelX, m.panelW));
    this.updateServiceSelection();
  }

  buyShopItem(itemId) {
    const result = GameState.buyShopItem(this.scene.registry, itemId, 1);
    if (result.ok) this.scene.showCityBanner?.("Purchased", result.item.name, 1500);
    else this.scene.showCityBanner?.("Cannot Buy", result.reason === "gold" ? `Need ${result.cost} Gold` : "Inventory full or unavailable", 1800);
    this.scene.refreshInventoryUI?.(); this.scene.uiManager?.hotbarPanel?.refresh?.(); this.scene.refreshCityUi?.();
    this.createSundriesServicePanel();
  }

  sellInventoryItem(index) {
    const result = GameState.sellInventoryItem(this.scene.registry, index);
    if (result.ok) this.scene.showCityBanner?.("Sold", `+${result.value} Gold`, 1500);
    else this.scene.showCityBanner?.("Cannot Sell", "No item in that slot", 1500);
    this.scene.refreshInventoryUI?.(); this.scene.refreshCityUi?.();
    this.createSundriesServicePanel();
  }

  createAnvilServicePanel() {
    const scene = this.scene;
    const m = this.createBasePanel("Blessed Anvil", `Upgrade equipment only. Papers: ${scene.registry.get("weaponUpgradePaperCount") || 0}`);
    const sources = GameState.getUpgradeableEquipmentSources?.(scene.registry) || [];
    const entries = [];
    sources.forEach((source) => {
      const item = source.item;
      if (!item?.slot) return;
      const level = item.upgradeLevel || 0;
      const target = level + 1;
      const rate = GameState.getUpgradeSuccessRate(target);
      const cost = 20 + target * 10;
      entries.push({ name: `Upgrade ${GameState.getItemDisplayName?.(item) || item.name || "Item"}`, description: `${source.label || source.slot} ${item.slot} → +${target} | Chance ${rate}% | Equipment only`, cost, action: () => this.upgradeSource(source) });
    });
    if (entries.length === 0) entries.push({ name: "No equipment available", description: "Equip or loot an item first.", action: () => this.scene.showCityBanner?.("Anvil", "No equipment to upgrade.", 1500) });
    entries.push({ name: "Buy Upgrade Paper", description: "Purchase one upgrade paper.", cost: GameState.SHOP_ITEMS.upgradePaper.price, action: () => this.buyAnvilPaper() });
    scene.currentServiceEntries = entries;
    entries.slice(0, 10).forEach((entry, index) => this.createButtonRow(index, entry, m.panelY + 92 + index * 50, m.panelX, m.panelW));
    this.updateServiceSelection();
  }

  buyAnvilPaper() { this.buyShopItem("upgradePaper"); this.createAnvilServicePanel(); }

  upgradeSource(source) {
    const result = GameState.upgradeItemAtSource(this.scene.registry, source);
    if (!result.ok) {
      const msg = result.reason === "no_paper" ? "Need Upgrade Paper" : result.reason === "gold" ? `Need ${result.cost} Gold` : result.reason === "max_level" ? "Item is already +10" : "Only equipment can be upgraded";
      this.scene.showCityBanner?.("Upgrade Failed", msg, 1800);
    } else if (result.success) {
      this.scene.showCityBanner?.("Upgrade Success", `+${result.targetLevel} (${result.successRate}%)`, 2000);
    } else {
      this.scene.showCityBanner?.("Upgrade Failed", `Roll ${result.roll}/${result.successRate}. Item survived.`, 2200);
    }
    this.scene.refreshInventoryUI?.(); this.scene.refreshCityUi?.(); this.createAnvilServicePanel();
  }

  createQuestServicePanel() {
    const scene = this.scene;
    const m = this.createBasePanel("Quest Giver", "Accept dungeon quests or turn in completed objectives.");
    const active = GameState.getActiveQuests(scene.registry);
    const available = GameState.getAvailableQuests(scene.registry);
    const entries = [];
    active.filter((q) => q.state === "ready_to_turn_in").forEach((q) => entries.push({ name: `Turn in: ${q.title}`, description: `Reward: ${q.rewardGold || 0} Gold, ${q.rewardPaper || 0} Paper`, action: () => this.turnInQuest(q.id) }));
    active.filter((q) => q.state === "active").forEach((q) => entries.push({ name: `Active: ${q.title}`, description: q.objectiveText || q.description || "In progress", action: () => this.scene.showCityBanner?.("Quest", "Already active.", 1500) }));
    available.slice(0, Math.max(0, 10 - entries.length)).forEach((q) => entries.push({ name: `Accept: ${q.title}`, description: q.description || "Dungeon quest", action: () => this.acceptQuest(q.id) }));
    if (!entries.length) entries.push({ name: "No quests available", description: "You have completed all current quests.", action: () => {} });
    scene.currentServiceEntries = entries;
    entries.slice(0, 10).forEach((entry, index) => this.createButtonRow(index, entry, m.panelY + 92 + index * 50, m.panelX, m.panelW));
    this.updateServiceSelection();
  }

  acceptQuest(id) { const r = GameState.acceptQuest(this.scene.registry, id); this.scene.showCityBanner?.(r.ok ? "Quest Accepted" : "Quest", r.ok ? r.quest.title : "Already accepted or unavailable", 1800); this.createQuestServicePanel(); }
  turnInQuest(id) { const r = GameState.turnInQuest(this.scene.registry, id); this.scene.showCityBanner?.(r.ok ? "Quest Complete" : "Quest", r.ok ? `+${r.quest.rewardGold || 0} Gold` : "Not ready yet", 2000); this.scene.refreshCityUi?.(); this.createQuestServicePanel(); }

  createDungeonGateServicePanel() {
    const scene = this.scene;
    const m = this.createBasePanel("Dungeon Gate", "Choose one of the 10 editor-made dungeons.");
    const dungeons = window.DungeonTemplates?.list?.() || [];
    const difficulties = ["normal", "hard", "very_hard"].map((key) => window.DungeonTemplates?.getDifficulty?.(key) || { key, label: key });
    if (!dungeons.length) return this.createMessagePanel("Dungeon Gate", "No dungeon templates found.");
    const entries = [];
    dungeons.forEach((dungeon) => difficulties.forEach((difficulty) => entries.push({ name: `${dungeon.name} - ${difficulty.label}`, description: `${dungeon.description || "Dungeon"} | Rec: ${dungeon.recommendedLevel || 1}/${dungeon.recommendedPower || 100}`, action: () => this.startDungeon(dungeon.id, difficulty.key) })));
    scene.currentServiceEntries = entries;
    entries.slice(0, 20).forEach((entry, index) => this.createButtonRow(index, entry, m.panelY + 82 + index * 26, m.panelX, m.panelW, 24));
    this.updateServiceSelection();
  }

  startDungeon(dungeonId, difficulty) { this.closeServicePanel(); this.scene.scene.start("DungeonPrototypeScene", { dungeonId, difficulty }); }

  createMessagePanel(title, message) {
    const m = this.createBasePanel(title, message);
    const text = this.scene.add.text(m.width / 2, m.height / 2, message, { fontFamily: "Trebuchet MS, Arial, sans-serif", fontSize: "16px", color: "#f8f1dc", align: "center", wordWrap: { width: m.panelW - 80 } }).setOrigin(0.5).setScrollFactor(0).setDepth(5001);
    this.scene.servicePanelElements.push(text);
  }
}

window.ServiceManager = ServiceManager;
