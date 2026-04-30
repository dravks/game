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
    if (type === "mmo_systems" || type === "economy" || type === "pvp") return this.createMmoSystemsPanel();
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
    const m = this.createBasePanel("Sundries", "Buy supplies, repair equipment, or sell unequipped items.");
    const repairPlan = GameState.getAllRepairPlan?.(scene.registry) || { sources: [], damaged: [], totalCost: 0 };
    const entries = [
      { name: "Buy HP Potion", description: "Restores 50 HP. Right-click in inventory to assign to hotbar.", cost: GameState.SHOP_ITEMS.hpPotion.price, action: () => this.buyShopItem("hpPotion") },
      { name: "Buy MP Potion", description: "Restores 30 MP. Right-click in inventory to assign to hotbar.", cost: GameState.SHOP_ITEMS.mpPotion.price, action: () => this.buyShopItem("mpPotion") },
      { name: "Buy Upgrade Paper", description: "Required for Blessed Anvil upgrades.", cost: GameState.SHOP_ITEMS.upgradePaper.price, action: () => this.buyShopItem("upgradePaper") },
      {
        name: "Full Repair",
        description: repairPlan.sources?.length
          ? `${repairPlan.damaged?.length || 0}/${repairPlan.sources.length} equipped/bag gear items need repair.`
          : "No equipment found in equipped slots or inventory.",
        cost: repairPlan.totalCost || 0,
        action: () => this.repairAllGear(),
      },
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

  repairSource(source, returnPanel = "sundries") {
    const result = GameState.repairEquipmentAtSource?.(this.scene.registry, source) || { ok: false };
    if (result.ok) this.scene.showCityBanner?.("Repaired", result.alreadyFull ? "Durability already full" : `-${result.cost} Gold`, 1600);
    else this.scene.showCityBanner?.("Repair Failed", result.reason === "gold" ? `Need ${result.cost} Gold` : "Equipment only", 1800);
    this.scene.refreshInventoryUI?.();
    this.scene.refreshCityUi?.();
    if (returnPanel === "anvil") this.createAnvilServicePanel();
    else this.createSundriesServicePanel();
  }

  repairAllGear() {
    const result = GameState.repairAllGear?.(this.scene.registry) || { ok: false };
    if (result.ok) {
      const msg = result.reason === "already_full" ? "All gear durability already full" : `${result.repaired || 0}/${result.total || 0} gear repaired | -${result.cost || 0} Gold`;
      this.scene.showCityBanner?.("Repair", msg, 1800);
    } else {
      this.scene.showCityBanner?.("Repair Failed", result.reason === "gold" ? `Need ${result.cost} Gold` : "No gear found", 1800);
    }
    this.scene.refreshInventoryUI?.();
    this.scene.refreshCityUi?.();
    this.createSundriesServicePanel();
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
    dungeons.forEach((dungeon) => difficulties.forEach((difficulty) => {
      const entryFee = GameState.getDungeonEntryCost?.(difficulty.key) || 0;
      entries.push({ name: `${dungeon.name} - ${difficulty.label}`, description: `${dungeon.description || "Dungeon"} | Rec: ${dungeon.recommendedLevel || 1}/${dungeon.recommendedPower || 100} | Fee ${entryFee} Gold`, action: () => this.startDungeon(dungeon.id, difficulty.key) });
    }));
    scene.currentServiceEntries = entries;
    entries.slice(0, 20).forEach((entry, index) => this.createButtonRow(index, entry, m.panelY + 82 + index * 26, m.panelX, m.panelW, 24));
    this.updateServiceSelection();
  }

  startDungeon(dungeonId, difficulty) {
    const paid = GameState.chargeDungeonEntry?.(this.scene.registry, dungeonId, difficulty) || { ok: true };
    if (!paid.ok) {
      this.scene.showCityBanner?.("Dungeon Fee", `Need ${paid.cost} Gold`, 1800);
      return;
    }
    this.closeServicePanel();
    this.scene.scene.start("DungeonPrototypeScene", { dungeonId, difficulty });
  }

  createMmoSystemsPanel() {
    const scene = this.scene;
    const pvp = GameState.getPvpState?.(scene.registry) || {};
    const party = GameState.getPartyState?.(scene.registry) || {};
    const guild = scene.registry.get("guildState") || null;
    const marketTax = GameState.getMarketTax?.(1000) || 0;
    const repairPlan = GameState.getEquippedRepairPlan?.(scene.registry) || { damaged: [], totalCost: 0 };
    const m = this.createBasePanel("MMO Systems", `Prototype systems hub | Party ${party.members?.length || 0}/${window.SocialPvpConfig?.PARTY?.maxSize || 5} | Guild ${guild?.name || "None"} | PvP ${pvp.rating || 1000}`);
    const entries = [
      { name: "Party", description: `${party.members?.length ? `${party.members.length} member local party active` : "Create and inspect local party state"} | Loot ${party.lootMode || "solo"}`, action: () => this.createMmoPartyPanel() },
      { name: "Guild", description: guild ? `${guild.name} | ${guild.rank} | ${guild.members}/${guild.capacity} members` : `Create test guild | Cost ${GameState.getGuildCreationCost?.() || 0} Gold`, action: () => this.createMmoGuildPanel() },
      { name: "PvP Arena", description: `Rating ${pvp.rating || 1000} | W ${pvp.wins || 0} / L ${pvp.losses || 0} | Streak ${pvp.streak || 0}`, action: () => this.createMmoPvpPanel() },
      { name: "Economy", description: `Market tax on 1000g: ${marketTax}g | Repair due ${repairPlan.totalCost || 0}g | Dungeon fees`, action: () => this.createMmoEconomyPanel() },
      { name: "Durability Note", description: `${repairPlan.damaged?.length || 0} equipped items damaged. Repair is intentionally handled by Sundries/blacksmith flow.`, action: () => this.scene.showCityBanner?.("Repair", "Use Sundries for item repair.", 1800) },
    ];
    scene.currentServiceEntries = entries;
    entries.slice(0, 10).forEach((entry, index) => this.createButtonRow(index, entry, m.panelY + 92 + index * 50, m.panelX, m.panelW));
    this.updateServiceSelection();
  }

  createMmoBackEntry() {
    return { name: "< Back to MMO Systems", description: "Return to the MMO systems hub.", action: () => this.createMmoSystemsPanel() };
  }

  createMmoPartyPanel() {
    const scene = this.scene;
    const party = GameState.getPartyState?.(scene.registry) || {};
    const members = party.members || [];
    const merc = GameState.getMercenaryState?.(scene.registry);
    const m = this.createBasePanel("MMO Systems - Party", `Local party | ${members.length}/${window.SocialPvpConfig?.PARTY?.maxSize || 5} members | Merc ${merc?.label || "None"} ${merc ? GameState.getMercenaryRemainingText?.(scene.registry) : ""}`);
    const entries = [
      this.createMmoBackEntry(),
      { name: members.length ? "Disband Local Party" : "Create Local Party", description: members.length ? `Leader ${party.leader || "Player"} | Clears local party state.` : "Creates a local party state for future multiplayer logic.", action: () => (members.length ? this.disbandParty("party") : this.createParty("party")) },
      { name: "Add Test Member", description: members.length ? members.map((member) => `${member.name || "Player"} (${member.className || "class"})`).join(", ") : "Creates party first, then adds a test member.", action: () => this.addPartyMember() },
      { name: "Cycle Loot Mode", description: `Current: ${party.lootMode || "solo"} | round_robin -> leader -> free_loot`, action: () => this.cyclePartyLootMode() },
      { name: "Hire Warrior Mercenary", description: `1 hour | melee guard | 35% loot cut | ${GameState.getMercenaryHireCost?.("warrior", 1) || 90} Gold`, cost: GameState.getMercenaryHireCost?.("warrior", 1) || 90, action: () => this.hireMercenary("warrior") },
      { name: "Hire Rogue Mercenary", description: `1 hour | melee DPS | 35% loot cut | ${GameState.getMercenaryHireCost?.("rogue", 1) || 105} Gold`, cost: GameState.getMercenaryHireCost?.("rogue", 1) || 105, action: () => this.hireMercenary("rogue") },
      { name: "Hire Mage Mercenary", description: `1 hour | ranged magic | 35% loot cut | ${GameState.getMercenaryHireCost?.("mage", 1) || 120} Gold`, cost: GameState.getMercenaryHireCost?.("mage", 1) || 120, action: () => this.hireMercenary("mage") },
      { name: "Hire Archer Mercenary", description: `1 hour | ranged physical | 35% loot cut | ${GameState.getMercenaryHireCost?.("archer", 1) || 110} Gold`, cost: GameState.getMercenaryHireCost?.("archer", 1) || 110, action: () => this.hireMercenary("archer") },
      { name: "Dismiss Mercenary", description: merc ? `${merc.label} leaves immediately. No refund in prototype.` : "No active mercenary.", action: () => this.dismissMercenary() },
    ];
    scene.currentServiceEntries = entries;
    entries.forEach((entry, index) => this.createButtonRow(index, entry, m.panelY + 92 + index * 50, m.panelX, m.panelW));
    this.updateServiceSelection();
  }

  createMmoGuildPanel() {
    const scene = this.scene;
    const guild = scene.registry.get("guildState") || null;
    const guildCost = GameState.getGuildCreationCost?.() || 0;
    const m = this.createBasePanel("MMO Systems - Guild", guild ? `${guild.name} | ${guild.rank} | ${guild.members}/${guild.capacity} members` : `No guild | Creation cost ${guildCost} Gold`);
    const entries = [
      this.createMmoBackEntry(),
      { name: guild ? `Guild: ${guild.name}` : "Create Test Guild", description: guild ? `Rank ${guild.rank} | Capacity ${guild.capacity} | Prototype guild state active.` : "Creates Amasra guild and charges the configured gold sink.", cost: guild ? undefined : guildCost, action: () => (guild ? this.scene.showCityBanner?.("Guild", `${guild.name} already active`, 1500) : this.createGuild("guild")) },
      { name: "Deposit 50g to Guild Bank", description: guild ? `Bank Gold: ${guild.bankGold || 0}` : "Create a guild first.", cost: guild ? 50 : undefined, action: () => this.depositGuildGold() },
      { name: "Set Guild Notice", description: guild?.notice ? `Current: ${guild.notice}` : "Creates/updates prototype guild announcement text.", action: () => this.setGuildNotice() },
    ];
    scene.currentServiceEntries = entries;
    entries.forEach((entry, index) => this.createButtonRow(index, entry, m.panelY + 92 + index * 50, m.panelX, m.panelW));
    this.updateServiceSelection();
  }

  createMmoPvpPanel() {
    const scene = this.scene;
    const pvp = GameState.getPvpState?.(scene.registry) || {};
    const m = this.createBasePanel("MMO Systems - PvP Arena", `Rating ${pvp.rating || 1000} | Wins ${pvp.wins || 0} | Losses ${pvp.losses || 0} | Streak ${pvp.streak || 0} | Queue ${pvp.queued ? "ON" : "OFF"}`);
    const entries = [
      this.createMmoBackEntry(),
      { name: "Record PvP Win", description: "Adds rating, increments wins, updates PvP quest progress.", action: () => this.recordPvp(true, "pvp") },
      { name: "Record PvP Loss", description: "Applies rating loss and clears streak.", action: () => this.recordPvp(false, "pvp") },
      { name: pvp.queued ? "Leave Arena Queue" : "Join Arena Queue", description: `Queue state is saved in PvP prototype state. Type: ${pvp.queueType || "none"}`, action: () => this.togglePvpQueue(!pvp.queued) },
      { name: "Claim PvP Rewards", description: `Unclaimed wins: ${Math.max(0, (pvp.wins || 0) - (pvp.claimedWins || 0))} | Pays gold for test loop.`, action: () => this.claimPvpReward() },
    ];
    scene.currentServiceEntries = entries;
    entries.forEach((entry, index) => this.createButtonRow(index, entry, m.panelY + 92 + index * 50, m.panelX, m.panelW));
    this.updateServiceSelection();
  }

  createMmoEconomyPanel() {
    const scene = this.scene;
    const repairPlan = GameState.getEquippedRepairPlan?.(scene.registry) || { damaged: [], totalCost: 0 };
    const marketTax = GameState.getMarketTax?.(1000) || 0;
    const m = this.createBasePanel("MMO Systems - Economy", `Gold ${scene.registry.get("gold") || 0} | 1000g market tax ${marketTax}g | Repair due ${repairPlan.totalCost || 0}g`);
    const entries = [
      this.createMmoBackEntry(),
      { name: "Dungeon Entry Fees", description: `Normal ${GameState.getDungeonEntryCost?.("normal") || 0}g | Hard ${GameState.getDungeonEntryCost?.("hard") || 0}g | Very Hard ${GameState.getDungeonEntryCost?.("very_hard") || 0}g`, action: () => this.scene.showCityBanner?.("Dungeon Fees", "Fees are charged at gate entry.", 1700) },
      { name: "Market Tax Preview", description: `Selling/listing for 1000 Gold removes ${marketTax} Gold from economy.`, action: () => this.scene.showCityBanner?.("Market Tax", `${marketTax} Gold sink on 1000`, 1800) },
      { name: "Repair Cost Preview", description: `${repairPlan.damaged?.length || 0} equipped items damaged | Total ${repairPlan.totalCost || 0} Gold. Repair at Sundries.`, action: () => this.scene.showCityBanner?.("Repair", `Sundries repair due: ${repairPlan.totalCost || 0}g`, 1800) },
      { name: "Push Economy Snapshot", description: "Writes current gold/tax/repair state into the activity feed.", action: () => this.pushEconomySnapshot() },
    ];
    scene.currentServiceEntries = entries;
    entries.forEach((entry, index) => this.createButtonRow(index, entry, m.panelY + 92 + index * 50, m.panelX, m.panelW));
    this.updateServiceSelection();
  }

  createParty(returnTo = "main") {
    const result = GameState.createLocalParty?.(this.scene.registry);
    this.scene.showCityBanner?.("Party", result?.ok ? "Local party created" : "Could not create party", 1600);
    returnTo === "party" ? this.createMmoPartyPanel() : this.createMmoSystemsPanel();
  }

  disbandParty(returnTo = "main") {
    GameState.clearLocalParty?.(this.scene.registry);
    this.scene.showCityBanner?.("Party", "Disbanded", 1500);
    returnTo === "party" ? this.createMmoPartyPanel() : this.createMmoSystemsPanel();
  }

  addPartyMember() {
    const result = GameState.addLocalPartyMember?.(this.scene.registry);
    this.scene.showCityBanner?.("Party", result?.ok ? "Test member added" : result?.reason === "full" ? "Party full" : "Could not add member", 1600);
    this.createMmoPartyPanel();
  }

  cyclePartyLootMode() {
    const party = GameState.getPartyState?.(this.scene.registry) || {};
    const modes = ["round_robin", "leader", "free_loot"];
    const current = party.lootMode || "round_robin";
    const next = modes[(modes.indexOf(current) + 1) % modes.length] || modes[0];
    const result = GameState.setPartyLootMode?.(this.scene.registry, next);
    this.scene.showCityBanner?.("Party Loot", result?.ok ? next : "Create party first", 1600);
    this.createMmoPartyPanel();
  }

  hireMercenary(className) {
    const result = GameState.hireMercenary?.(this.scene.registry, className, 1) || { ok: false };
    this.scene.showCityBanner?.(
      result.ok ? "Mercenary Hired" : "Hire Failed",
      result.ok ? `${result.mercenary.label} | 1h` : result.reason === "gold" ? `Need ${result.cost} Gold` : "Unavailable",
      1900,
    );
    this.scene.refreshCityUi?.();
    this.createMmoPartyPanel();
  }

  dismissMercenary() {
    const result = GameState.dismissMercenary?.(this.scene.registry);
    this.scene.showCityBanner?.("Mercenary", result?.ok ? "Dismissed" : "No mercenary", 1500);
    this.createMmoPartyPanel();
  }

  createGuild(returnTo = "main") {
    const result = GameState.createLocalGuild?.(this.scene.registry, "Amasra");
    this.scene.showCityBanner?.(result?.ok ? "Guild Created" : "Guild", result?.ok ? result.guild.name : result?.reason === "gold" ? `Need ${result.cost} Gold` : "Unavailable", 1800);
    this.scene.refreshCityUi?.();
    returnTo === "guild" ? this.createMmoGuildPanel() : this.createMmoSystemsPanel();
  }

  depositGuildGold() {
    const result = GameState.depositGuildGold?.(this.scene.registry, 50);
    this.scene.showCityBanner?.("Guild Bank", result?.ok ? "+50 Gold deposited" : result?.reason === "gold" ? "Need 50 Gold" : "Create guild first", 1700);
    this.scene.refreshCityUi?.();
    this.createMmoGuildPanel();
  }

  setGuildNotice() {
    const notices = ["Prepare for dungeon runs.", "Boss cores are guild priority.", "PvP queue opens after repairs."];
    const guild = this.scene.registry.get("guildState") || {};
    const currentIndex = notices.indexOf(guild.notice);
    const notice = notices[(currentIndex + 1) % notices.length] || notices[0];
    const result = GameState.setGuildNotice?.(this.scene.registry, notice);
    this.scene.showCityBanner?.("Guild Notice", result?.ok ? notice : "Create guild first", 1700);
    this.createMmoGuildPanel();
  }

  recordPvp(won, returnTo = "main") {
    const result = GameState.recordPvpResult?.(this.scene.registry, won);
    this.scene.showCityBanner?.("PvP", result?.ok ? `Rating ${result.pvp.rating}` : "Unavailable", 1600);
    returnTo === "pvp" ? this.createMmoPvpPanel() : this.createMmoSystemsPanel();
  }

  togglePvpQueue(queued) {
    const result = GameState.setPvpQueueState?.(this.scene.registry, queued);
    this.scene.showCityBanner?.("PvP Queue", result?.pvp?.queued ? "Joined solo queue" : "Left queue", 1600);
    this.createMmoPvpPanel();
  }

  claimPvpReward() {
    const result = GameState.claimPvpReward?.(this.scene.registry);
    this.scene.showCityBanner?.("PvP Rewards", result?.ok ? `+${result.gold} Gold` : "No unclaimed wins", 1700);
    this.scene.refreshCityUi?.();
    this.createMmoPvpPanel();
  }

  pushEconomySnapshot() {
    const repairPlan = GameState.getAllRepairPlan?.(this.scene.registry) || { totalCost: 0 };
    const gold = this.scene.registry.get("gold") || 0;
    const tax = GameState.getMarketTax?.(1000) || 0;
    GameState.pushActivityEvent?.(this.scene.registry, `Economy snapshot: gold ${gold}, 1000g tax ${tax}, repair ${repairPlan.totalCost || 0}`, "economy");
    this.scene.showCityBanner?.("Economy", "Snapshot added to activity feed", 1700);
    this.scene.refreshCityUi?.();
    this.createMmoEconomyPanel();
  }

  createMessagePanel(title, message) {
    const m = this.createBasePanel(title, message);
    const text = this.scene.add.text(m.width / 2, m.height / 2, message, { fontFamily: "Trebuchet MS, Arial, sans-serif", fontSize: "16px", color: "#f8f1dc", align: "center", wordWrap: { width: m.panelW - 80 } }).setOrigin(0.5).setScrollFactor(0).setDepth(5001);
    this.scene.servicePanelElements.push(text);
  }
}

window.ServiceManager = ServiceManager;
