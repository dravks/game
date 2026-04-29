(function () {
  const GS = window.GameState;

  function safeBanner(scene, title, msg, ms = 1800) {
    if (scene?.showCityBanner) scene.showCityBanner(title, msg, ms);
    else console.log(`[${title}] ${msg}`);
  }

  function addServiceElement(scene, el) {
    scene.servicePanelElements = scene.servicePanelElements || [];
    scene.servicePanelElements.push(el);
    return el;
  }

  function serviceText(scene, x, y, text, style = {}) {
    return addServiceElement(scene, scene.add.text(x, y, text, Object.assign({
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "12px",
      color: "#f8f1dc",
      wordWrap: { width: 260, useAdvancedWrap: true },
    }, style)).setScrollFactor(0).setDepth(5003));
  }

  // ---------- ServiceManager split shops + KO-style anvil ----------
  if (window.ServiceManager) {
    const SM = window.ServiceManager.prototype;
    SM.openServicePanel = function (interactable) {
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
      if (type === "anvil" || type === "upgrader") return this.createAnvilBoardPanel();
      if (type === "potion") return this.createPotionServicePanel();
      if (type === "sundries" || type === "blacksmith") return this.createSundriesServicePanel();
      return this.createMessagePanel("Service", "This service is not available yet.");
    };

    SM.createPotionServicePanel = function () {
      const scene = this.scene;
      const m = this.createBasePanel("Potion Merchant", "Only this NPC sells HP and MP potions.");
      const entries = [
        { name: "Buy HP Potion", description: "Restores 50 HP. Left-click it in inventory, then click a hotbar slot.", cost: GS.SHOP_ITEMS.hpPotion.price, action: () => this.buyShopItemFromPanel("hpPotion", "potion") },
        { name: "Buy MP Potion", description: "Restores 30 MP. Left-click it in inventory, then click a hotbar slot.", cost: GS.SHOP_ITEMS.mpPotion.price, action: () => this.buyShopItemFromPanel("mpPotion", "potion") },
      ];
      scene.currentServiceEntries = entries;
      entries.forEach((entry, index) => this.createButtonRow(index, entry, m.panelY + 96 + index * 56, m.panelX, m.panelW));
      this.updateServiceSelection();
    };

    SM.createSundriesServicePanel = function () {
      const scene = this.scene;
      const m = this.createBasePanel("Sundries", "General goods and selling. Potions are sold only by the Potion Merchant.");
      const materials = GS.getMaterials?.(scene.registry) || {};
      const materialLine = Object.entries(materials)
        .filter(([, amount]) => amount > 0)
        .map(([id, amount]) => `${GS.MATERIAL_DEFS?.[id]?.name || id} x${amount}`)
        .join(" | ");
      const entries = [
        { name: "Buy Town Scroll", description: "Utility item for later systems.", cost: GS.SHOP_ITEMS.returnScroll.price, action: () => this.buyShopItemFromPanel("returnScroll", "sundries") },
        { name: "Craft Class Gear Cache", description: materialLine || "Needs Boss Core x2 and class material x4.", cost: 0, action: () => this.craftClassGearCacheFromPanel() },
      ];
      const inventory = GS.getInventoryItems(scene.registry) || [];
      inventory.forEach((item, idx) => {
        if (!item || item.type === "potion") return;
        entries.push({ name: `Sell ${item.name || item.id}`, description: `${item.rarity || "common"} ${item.slot || item.type || "item"}`, action: () => this.sellInventoryItem(idx) });
      });
      scene.currentServiceEntries = entries;
      if (materialLine) serviceText(scene, m.panelX + 34, m.panelY + 72, `Materials: ${materialLine}`, { color: "#8ad97a", fontSize: "11px", wordWrap: { width: m.panelW - 68 } });
      entries.slice(0, 10).forEach((entry, index) => this.createButtonRow(index, entry, m.panelY + 92 + index * 50, m.panelX, m.panelW));
      this.updateServiceSelection();
    };

    SM.craftClassGearCacheFromPanel = function () {
      const result = GS.craftClassGearCache?.(this.scene.registry);
      if (result?.ok) {
        const itemName = GS.getItemDisplayName?.(result.item) || result.item?.name || "Gear";
        safeBanner(this.scene, "Crafted", result.convertedToGold ? `${itemName} sold because bag is full.` : itemName, 2200);
      } else {
        safeBanner(this.scene, "Cannot Craft", result?.reason === "gold" ? `Need ${result.costGold} Gold` : "Need Boss Core x2 and class material x4.", 2200);
      }
      this.scene.refreshInventoryUI?.();
      this.scene.refreshCityUi?.();
      this.createSundriesServicePanel();
    };

    SM.buyShopItemFromPanel = function (itemId, panelType = "shop") {
      const result = GS.buyShopItem(this.scene.registry, itemId, 1);
      if (result.ok) safeBanner(this.scene, "Purchased", result.item.name, 1500);
      else safeBanner(this.scene, "Cannot Buy", result.reason === "gold" ? `Need ${result.cost} Gold` : "Inventory full or unavailable", 1800);
      this.scene.refreshInventoryUI?.();
      this.scene.uiManager?.hotbarPanel?.refresh?.();
      this.scene.hotbarPanel?.refresh?.();
      this.scene.refreshCityUi?.();
      if (panelType === "potion") this.createPotionServicePanel();
      else this.createSundriesServicePanel();
    };

    SM.buyShopItem = function (itemId) { return this.buyShopItemFromPanel(itemId, this.scene.currentServiceType || "shop"); };

    SM.ensureAnvilState = function () {
      const scene = this.scene;
      scene.anvilState = scene.anvilState || { slots: new Array(9).fill(null), held: null, message: "Select an item/paper, then click an anvil slot." };
      if (!Array.isArray(scene.anvilState.slots) || scene.anvilState.slots.length !== 9) scene.anvilState.slots = new Array(9).fill(null);
      return scene.anvilState;
    };

    SM.createAnvilBoardPanel = function () {
      const scene = this.scene;
      const state = this.ensureAnvilState();
      const m = this.createBasePanel("Blessed Anvil", "Place an equipment item and Upgrade Paper into the 3x3 anvil, then press Upgrade.");
      const centerX = m.panelX + m.panelW / 2;
      const boardX = m.panelX + 90;
      const boardY = m.panelY + 108;
      const slotSize = 58;
      const gap = 12;

      const closeBg = addServiceElement(scene, scene.add.rectangle(m.panelX + m.panelW - 38, m.panelY + 58, 34, 28, 0x2b1c1c, 0.95)
        .setStrokeStyle(1, 0xf4df9c, 0.85).setInteractive({ useHandCursor: true }).setScrollFactor(0).setDepth(5004));
      serviceText(scene, m.panelX + m.panelW - 47, m.panelY + 49, "X", { fontSize: "14px", color: "#f8f1dc", fontStyle: "bold", wordWrap: { width: 20 } });
      closeBg.on("pointerdown", () => this.closeServicePanel());

      serviceText(scene, m.panelX + 34, m.panelY + 76, `Papers: ${scene.registry.get("weaponUpgradePaperCount") || 0}   Gold: ${scene.registry.get("gold") || 0}`, { color: "#f4df9c", fontSize: "13px", wordWrap: { width: 420 } });

      for (let i = 0; i < 9; i++) {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = boardX + col * (slotSize + gap);
        const y = boardY + row * (slotSize + gap);
        const placed = state.slots[i];
        const bg = addServiceElement(scene, scene.add.rectangle(x, y, slotSize, slotSize, 0x1a2532, 0.96)
          .setStrokeStyle(2, placed?.kind === "paper" ? 0xf4df9c : placed ? 0x8ad97a : 0x5f767a, 0.88)
          .setInteractive({ useHandCursor: true }).setScrollFactor(0).setDepth(5002));
        const label = placed?.kind === "paper" ? "PAPER" : placed?.item ? `+${placed.item.upgradeLevel || 0}\n${this.compact(placed.item.name || "Item", 8)}` : "+";
        serviceText(scene, x - slotSize / 2 + 4, y - 14, label, { fontSize: "10px", color: placed ? "#f8f1dc" : "#6f8591", align: "center", wordWrap: { width: slotSize - 8 } });
        bg.on("pointerdown", () => this.handleAnvilSlotClick(i));
      }

      // Available equipment list.
      serviceText(scene, m.panelX + 330, m.panelY + 82, "Equipment", { color: "#f4df9c", fontStyle: "bold", fontSize: "14px" });
      const sources = (GS.getUpgradeableEquipmentSources?.(scene.registry) || []).filter((s) => s.item?.slot);
      sources.slice(0, 7).forEach((source, idx) => {
        const item = source.item;
        const y = m.panelY + 116 + idx * 34;
        const row = addServiceElement(scene, scene.add.rectangle(m.panelX + 450, y, 250, 28, 0x0f1822, 0.9)
          .setStrokeStyle(1, 0x50626f, 0.75).setInteractive({ useHandCursor: true }).setScrollFactor(0).setDepth(5002));
        serviceText(scene, m.panelX + 334, y - 8, `${this.compact(GS.getItemDisplayName?.(item) || item.name || "Item", 24)} (${source.label || item.slot})`, { fontSize: "11px", wordWrap: { width: 220 } });
        row.on("pointerdown", () => { state.held = { kind: "item", source, item: { ...item } }; state.message = "Now click an anvil slot for the item."; this.createAnvilBoardPanel(); });
      });

      const paperRow = addServiceElement(scene, scene.add.rectangle(m.panelX + 450, m.panelY + 362, 250, 32, 0x3a2f1c, 0.95)
        .setStrokeStyle(2, 0xf4df9c, 0.85).setInteractive({ useHandCursor: true }).setScrollFactor(0).setDepth(5002));
      serviceText(scene, m.panelX + 334, m.panelY + 352, "Use Upgrade Paper", { fontSize: "12px", color: "#f4df9c", wordWrap: { width: 210 } });
      paperRow.on("pointerdown", () => {
        if ((scene.registry.get("weaponUpgradePaperCount") || 0) <= 0) { safeBanner(scene, "Anvil", "Buy Upgrade Paper first."); return; }
        state.held = { kind: "paper" }; state.message = "Now click an anvil slot for the paper."; this.createAnvilBoardPanel();
      });

      const buyPaper = addServiceElement(scene, scene.add.rectangle(m.panelX + 450, m.panelY + 404, 250, 32, 0x0f1822, 0.95)
        .setStrokeStyle(1, 0xf4df9c, 0.75).setInteractive({ useHandCursor: true }).setScrollFactor(0).setDepth(5002));
      serviceText(scene, m.panelX + 334, m.panelY + 394, `Buy Paper (${GS.SHOP_ITEMS.upgradePaper.price} Gold)`, { fontSize: "12px", color: "#f4df9c", wordWrap: { width: 210 } });
      buyPaper.on("pointerdown", () => { this.buyAnvilPaperOnly(); });

      const upgradeBtn = addServiceElement(scene, scene.add.rectangle(centerX - 94, m.panelY + 452, 188, 50, 0x6b3f2b, 0.98)
        .setStrokeStyle(2, 0xf4df9c, 0.95).setInteractive({ useHandCursor: true }).setScrollFactor(0).setDepth(5002));
      serviceText(scene, centerX - 154, m.panelY + 438, "UPGRADE", { fontSize: "18px", color: "#f8f1dc", fontStyle: "bold", wordWrap: { width: 120 } });
      upgradeBtn.on("pointerdown", () => this.performAnvilUpgrade(upgradeBtn));

      serviceText(scene, m.panelX + 34, m.panelY + 500, state.message || "", { color: "#d7c58f", fontSize: "12px", wordWrap: { width: m.panelW - 68 } });
    };

    SM.compact = function (text, max = 14) { return String(text || "").length > max ? `${String(text).slice(0, max - 1)}…` : String(text || ""); };

    SM.handleAnvilSlotClick = function (index) {
      const state = this.ensureAnvilState();
      if (state.held) {
        state.slots[index] = state.held;
        state.held = null;
        state.message = "Placed. Add item + paper, then click Upgrade.";
      } else if (state.slots[index]) {
        state.held = state.slots[index];
        state.slots[index] = null;
        state.message = "Picked up anvil slot content. Click another slot to place it.";
      } else state.message = "Select an equipment item or paper first.";
      this.createAnvilBoardPanel();
    };

    SM.buyAnvilPaperOnly = function () {
      let result = GS.buyShopItem(this.scene.registry, "upgradePaper", 1);
      if (!result?.ok) {
        const price = GS.SHOP_ITEMS?.upgradePaper?.price || 25;
        const gold = this.scene.registry.get("gold") || 0;
        if (gold >= price) {
          this.scene.registry.set("gold", gold - price);
          this.scene.registry.set("weaponUpgradePaperCount", (this.scene.registry.get("weaponUpgradePaperCount") || 0) + 1);
          result = { ok: true, item: GS.SHOP_ITEMS?.upgradePaper || { name: "Upgrade Paper" } };
        }
      }
      if (result.ok) safeBanner(this.scene, "Purchased", "Upgrade Paper", 1500);
      else safeBanner(this.scene, "Cannot Buy", result.reason === "gold" ? `Need ${result.cost} Gold` : "Inventory full", 1800);
      this.scene.refreshInventoryUI?.();
      this.scene.refreshCityUi?.();
      this.createAnvilBoardPanel();
    };
    SM.buyAnvilPaper = SM.buyAnvilPaperOnly;

    SM.showUpgradeOverlay = function (title, subtitle = "") {
      const scene = this.scene;
      this.clearUpgradeOverlay?.();
      const { width, height } = scene.scale;
      const elements = [];
      const bg = scene.add.rectangle(width / 2, height / 2, 420, 180, 0x090d12, 0.92)
        .setStrokeStyle(3, 0xf4df9c, 0.95).setScrollFactor(0).setDepth(7000);
      const glow = scene.add.circle(width / 2, height / 2 - 18, 34, 0xffd84a, 0.22)
        .setStrokeStyle(2, 0xffd84a, 0.85).setScrollFactor(0).setDepth(7001);
      const text = scene.add.text(width / 2, height / 2 - 58, title, {
        fontFamily: "Trebuchet MS, Arial, sans-serif",
        fontSize: "20px",
        color: "#f8f1dc",
        fontStyle: "bold",
        stroke: "#000",
        strokeThickness: 3,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(7002);
      const sub = scene.add.text(width / 2, height / 2 + 48, subtitle, {
        fontFamily: "Trebuchet MS, Arial, sans-serif",
        fontSize: "13px",
        color: "#d7c58f",
        stroke: "#000",
        strokeThickness: 2,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(7002);
      elements.push(bg, glow, text, sub);
      scene.upgradeOverlayElements = elements;
      scene.tweens?.add?.({ targets: glow, scale: 1.55, alpha: 0.55, yoyo: true, repeat: -1, duration: 360 });
      return elements;
    };

    SM.clearUpgradeOverlay = function () {
      const elements = this.scene.upgradeOverlayElements || [];
      elements.forEach((el) => el?.destroy?.());
      this.scene.upgradeOverlayElements = [];
    };

    SM.performAnvilUpgrade = function (button) {
      const state = this.ensureAnvilState();
      const itemSlotIndex = state.slots.findIndex((s) => s?.kind === "item" && s.source && s.item?.slot);
      const paperSlotIndex = state.slots.findIndex((s) => s?.kind === "paper");
      if (itemSlotIndex < 0) { state.message = "Place one equipment item into the anvil."; this.createAnvilBoardPanel(); return; }
      if (paperSlotIndex < 0) { state.message = "Place Upgrade Paper into the anvil."; this.createAnvilBoardPanel(); return; }
      if ((this.scene.registry.get("weaponUpgradePaperCount") || 0) <= 0) { state.message = "You do not have Upgrade Paper."; this.createAnvilBoardPanel(); return; }
      button.setFillStyle(0xf4df9c, 0.98);
      state.message = "Upgrade ritual started...";
      const source = state.slots[itemSlotIndex].source;
      const targetLevel = (state.slots[itemSlotIndex].item?.upgradeLevel || 0) + 1;
      const chance = GS.getUpgradeSuccessRate?.(targetLevel) ?? "?";
      this.showUpgradeOverlay("UPGRADE IN PROGRESS", `Trying +${targetLevel}  |  Chance ${chance}%`);
      this.scene.time.delayedCall(2000, () => {
        const result = GS.upgradeItemAtSource(this.scene.registry, source);
        this.clearUpgradeOverlay();
        if (result.ok && result.success) {
          state.message = `SUCCESS! Item is now +${result.targetLevel}.`;
          state.slots[itemSlotIndex] = null;
          state.slots[paperSlotIndex] = null;
          button.setFillStyle(0xffd84a, 1);
          safeBanner(this.scene, "Upgrade Success", `+${result.targetLevel} (${result.successRate}%)`, 2000);
        } else if (result.ok) {
          state.message = `FAILED. Item stayed the same. Chance was ${result.successRate}%.`;
          state.slots[paperSlotIndex] = null;
          button.setFillStyle(0xb53636, 1);
          safeBanner(this.scene, "Upgrade Failed", "Item survived. Only paper/gold consumed.", 2200);
        } else {
          state.message = result.reason === "gold" ? `Need ${result.cost} Gold.` : result.reason === "no_paper" ? "Need Upgrade Paper." : "Only equipment can be upgraded.";
          button.setFillStyle(0xb53636, 1);
        }
        this.scene.refreshInventoryUI?.();
        this.scene.uiManager?.hotbarPanel?.refresh?.();
        this.scene.refreshCityUi?.();
        GS.saveProgress?.(this.scene.registry);
        this.scene.time.delayedCall(900, () => this.createAnvilBoardPanel());
      });
    };
  }

  // ---------- Inventory: left-click potions to hotbar placement mode ----------
  if (window.InventoryPanel) {
    const IP = window.InventoryPanel.prototype;
    const originalInventoryRefresh = IP.refresh;
    IP.refresh = function () {
      if (originalInventoryRefresh) originalInventoryRefresh.call(this);
      (this.inventorySlotViews || []).forEach((view) => {
        const item = view.currentItem;
        const isPotion = item && (item.id === "hpPotion" || item.id === "mpPotion" || item.type === "potion");
        if (!isPotion || !view.bg || view.bg.__hotbarDragBound) return;
        view.bg.__hotbarDragBound = true;
        view.bg.setData("hotbarPayload", { type: "consumable", id: item.id, itemId: item.id, label: item.name || item.id });
        this.scene.input.setDraggable(view.bg);
        view.bg.on("dragstart", () => {
          const current = view.currentItem;
          if (!current) return;
          this.scene.pendingHotbarAssignment = { type: "consumable", id: current.id, itemId: current.id, label: current.name || current.id };
          view.bg.setAlpha(0.55);
        });
        view.bg.on("dragend", () => view.bg.setAlpha(1));
      });
    };
    const originalHandleSlotClick = IP.handleInventorySlotClick;
    IP.handleInventorySlotClick = function (view, pointer) {
      const item = view.currentItem;
      if (!item) return;
      const isPotion = item.id === "hpPotion" || item.id === "mpPotion" || item.type === "potion";
      if (isPotion && pointer?.button === 0) {
        this.scene.pendingHotbarAssignment = { type: "consumable", id: item.id, label: item.name || item.id };
        this.setStatus?.(`Selected ${item.name || item.id}. Now left-click a hotbar slot.`);
        this.safeBanner?.("Hotbar", `Click a hotbar slot for ${item.name || item.id}.`);
        return;
      }
      if (originalHandleSlotClick) return originalHandleSlotClick.call(this, view, pointer);
    };
    IP.setStatus = function (message) {
      if (this.resourceTexts?.statusText) this.resourceTexts.statusText.setText(message || "");
      else this.safeBanner?.("Inventory", message || "");
    };
  }

  // ---------- Skills: left-click unlocked skill, then click hotbar slot ----------
  if (window.SkillPanel) {
    const SP = window.SkillPanel.prototype;
    const oldRefresh = SP.refresh;
    SP.refresh = function () {
      if (oldRefresh) oldRefresh.call(this);
      const m = this.metrics;
      if (!m || !this.container) return;
      const className = String(this.registry.get("playerClass") || this.GameState.DEFAULT_CLASS || "warrior").toLowerCase();
      const skills = this.GameState.CLASS_LEVEL_SKILLS?.[className] || [];
      if (!skills.length) return;
      const balance = this.GameState.getClassCombatBalance?.(className) || null;
      this.addDynamic(this.scene.add.text(m.panelX + 34, m.panelY + 384, `${balance?.role || className.toUpperCase()} | Left-click or drag an unlocked skill to a hotbar slot.`, {
        fontSize: "11px", color: "#d7c58f", fontFamily: "Trebuchet MS, Arial, sans-serif",
      }).setScrollFactor(0));
      const points = this.GameState.getSkillPointCount?.(this.registry) || 0;
      this.addDynamic(this.scene.add.text(m.panelX + 34, m.panelY + 402, `Skill Points: ${points} | Click + to upgrade a skill.`, {
        fontSize: "12px", color: "#f4df9c", fontFamily: "Trebuchet MS, Arial, sans-serif", fontStyle: "bold",
      }).setScrollFactor(0));
      skills.forEach((skill, index) => {
        const unlocked = this.GameState.isSkillUnlocked ? this.GameState.isSkillUnlocked(this.registry, skill) : ((this.registry.get("playerLevel") || 1) >= (skill.unlockLevel || 1));
        const skillLevel = this.GameState.getSkillLevel?.(this.registry, skill.id) || 1;
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = m.panelX + 34 + col * 326;
        const y = m.panelY + 432 + row * 42;
        const cardW = 302;
        const card = this.scene.add.rectangle(x + cardW / 2, y, cardW, 36, unlocked ? 0x22313a : 0x1a2028, 0.92)
          .setStrokeStyle(1, unlocked ? 0x8ad97a : 0x5f767a, 0.85)
          .setInteractive({ useHandCursor: unlocked }).setScrollFactor(0);
        if (unlocked) {
          card.setData("hotbarPayload", { type: "skill", id: skill.id, itemId: skill.id, label: skill.name });
          this.scene.input.setDraggable(card);
          card.on("dragstart", () => {
            this.scene.pendingHotbarAssignment = { type: "skill", id: skill.id, itemId: skill.id, label: skill.name };
            card.setAlpha(0.55);
          });
          card.on("dragend", () => card.setAlpha(1));
        }
        this.addDynamic(card);
        const icon = this.scene.add.image(x + 18, y, this.safeTextureKey?.(skill.icon || "icon_05") || "icon_05").setDisplaySize(22, 22).setScrollFactor(0);
        if (skill.tint) icon.setTint(skill.tint);
        this.addDynamic(icon);
        this.addDynamic(this.scene.add.text(x + 38, y - 13, `${skill.name}  Lv ${skillLevel}`, {
          fontSize: "11px", color: unlocked ? "#f8f1dc" : "#77868c", fontFamily: "Trebuchet MS, Arial, sans-serif", fontStyle: "bold",
          wordWrap: { width: 190, useAdvancedWrap: true }, maxLines: 1,
        }).setScrollFactor(0));
        this.addDynamic(this.scene.add.text(x + 38, y + 3, `Lv ${skill.unlockLevel || 1} | ${skill.damageType || "physical"} | ${skill.range || "-"} range`, {
          fontSize: "9px", color: unlocked ? "#b8c7cc" : "#687980", fontFamily: "Trebuchet MS, Arial, sans-serif",
          wordWrap: { width: 202, useAdvancedWrap: true }, maxLines: 1,
        }).setScrollFactor(0));
        const plus = this.scene.add.rectangle(x + cardW - 20, y, 28, 24, unlocked ? 0x4a3320 : 0x1a2028, 0.96)
          .setStrokeStyle(1, 0xf4df9c, 0.75).setInteractive({ useHandCursor: unlocked }).setScrollFactor(0);
        const plusLabel = this.scene.add.text(x + cardW - 20, y, "+", {
          fontSize: "14px", color: unlocked ? "#f8f1dc" : "#77868c", fontFamily: "Trebuchet MS, Arial, sans-serif", fontStyle: "bold",
        }).setOrigin(0.5).setScrollFactor(0);
        this.addDynamic(plus);
        this.addDynamic(plusLabel);
        if (unlocked) plus.on("pointerdown", (pointer) => {
          pointer?.event?.stopPropagation?.();
          const result = this.GameState.upgradeSkill?.(this.registry, skill.id);
          if (this.scene.showCityBanner) this.scene.showCityBanner(result?.ok ? "Skill Upgraded" : "Skill", result?.ok ? `${skill.name} Lv ${result.level}` : "No skill points.", 1700);
          this.refresh();
        });
        if (unlocked) card.on("pointerdown", () => {
          this.selectedSkillId = skill.id;
          this.scene.pendingHotbarAssignment = { type: "skill", id: skill.id, label: skill.name };
          if (this.scene.showCityBanner) this.scene.showCityBanner("Skill Selected", `Click a hotbar slot for ${skill.name}.`, 1800);
          this.refresh();
        });
      });
    };
  }

  // ---------- Hotbar: click target slot for selected potion/skill ----------
  if (window.HotbarPanel) {
    const HP = window.HotbarPanel.prototype;
    const oldUseSlot = HP.useSlot;
    HP.useSlot = function (index) {
      if (this.scene.pendingHotbarAssignment) {
        const pending = this.scene.pendingHotbarAssignment;
        const result = GS.assignToHotbar(this.registry, pending.id, index);
        this.scene.pendingHotbarAssignment = null;
        this.refresh();
        safeBanner(this.scene, "Hotbar", result.ok ? `${pending.label} assigned to slot ${index + 1}.` : "Could not assign slot.", 1600);
        return result.ok;
      }
      const itemId = this.getSlotItemId(index);
      const skill = itemId ? GS.getSkillDefById?.(itemId, this.registry.get("playerClass")) : null;
      if (skill) {
        const ok = typeof this.scene.useSkillById === "function"
          ? this.scene.useSkillById(itemId)
          : !!this.scene.useClassSkill?.();
        this.refresh();
        if (this.scene.refreshCityUi) this.scene.refreshCityUi();
        if (this.scene.refreshHudPanel) this.scene.refreshHudPanel();
        return !!ok;
      }
      const used = GS.useHotbarEntry(this.registry, itemId, this.scene);
      this.refresh();
      if (this.scene.refreshCityUi) this.scene.refreshCityUi();
      if (this.scene.refreshHudPanel) this.scene.refreshHudPanel();
      return used?.ok || (oldUseSlot ? oldUseSlot.call(this, index) : false);
    };
    const oldRefreshSlot = HP.refreshSlot;
    HP.refreshSlot = function (slot) {
      const itemId = this.getSlotItemId(slot.index);
      const skill = itemId ? GS.getSkillDefById?.(itemId, this.registry.get("playerClass")) : null;
      if (skill) {
        const skillLevel = GS.getSkillLevel?.(this.registry, itemId) || 1;
        slot.itemId = itemId;
        slot.bg.setStrokeStyle(2, skill.tint || 0x6aa7ff, 0.95).setFillStyle(0x263142, 0.98);
        slot.icon.setTexture(this.safeTextureKey(skill.icon || "icon_05")).setTint(skill.tint || 0x6aa7ff).setAlpha(1).setDisplaySize(30, 30);
        slot.count.setText(`Lv${skillLevel}`);
        const remaining = this.scene.getSkillCooldownRemaining
          ? this.scene.getSkillCooldownRemaining(skill.id)
          : Math.max(0, (this.scene.classSkillReadyAt || 0) - (this.scene.time?.now || 0));
        if (remaining > 0) {
          const ratio = Math.max(0, Math.min(1, remaining / Math.max(1, skill.cooldownMs || 3000)));
          this.drawCooldownClock?.(slot, ratio);
          slot.cdText.setText(`${Math.ceil(remaining / 1000)}s`);
        } else {
          this.clearCooldownClock?.(slot);
          slot.cdText.setText("");
        }
        return;
      }
      return oldRefreshSlot.call(this, slot);
    };
  }
})();

(function () {
  // Better Dungeon Gate: always show all 10 dungeon rows, with 3 difficulty buttons per row.
  if (!window.ServiceManager) return;
  const SM = window.ServiceManager.prototype;
  SM.createDungeonGateServicePanel = function () {
    const scene = this.scene;
    const m = this.createBasePanel("Dungeon Gate", "Choose one of the 10 editor-made dungeons.");
    const dungeons = window.DungeonTemplates?.list?.() || [];
    const difficulties = ["normal", "hard", "very_hard"].map((key) => window.DungeonTemplates?.getDifficulty?.(key) || { key, label: key === "very_hard" ? "Very Hard" : key });
    if (!dungeons.length) return this.createMessagePanel("Dungeon Gate", "No dungeon templates found.");
    scene.currentServiceEntries = [];
    scene.serviceEntryRows = [];
    dungeons.slice(0, 10).forEach((dungeon, index) => {
      const y = m.panelY + 90 + index * 45;
      const rowBg = scene.add.rectangle(m.panelX + m.panelW / 2, y, m.panelW - 64, 39, 0x0f1822, 0.9)
        .setStrokeStyle(1, 0x50626f, 0.75).setScrollFactor(0).setDepth(5002);
      scene.servicePanelElements.push(rowBg);
      const name = scene.add.text(m.panelX + 46, y - 15, dungeon.name || dungeon.id, { fontFamily: "Trebuchet MS, Arial, sans-serif", fontSize: "12px", color: "#f8f1dc", fontStyle: "bold" }).setScrollFactor(0).setDepth(5003);
      const desc = scene.add.text(m.panelX + 46, y + 2, `Rec ${dungeon.recommendedLevel || 1}/${dungeon.recommendedPower || 100} · ${dungeon.description || "Dungeon"}`, { fontFamily: "Trebuchet MS, Arial, sans-serif", fontSize: "9px", color: "#9fb0b7", wordWrap: { width: m.panelW - 350 } }).setScrollFactor(0).setDepth(5003);
      scene.servicePanelElements.push(name, desc);
      difficulties.forEach((diff, dIndex) => {
        const bx = m.panelX + m.panelW - 250 + dIndex * 78;
        const btn = scene.add.rectangle(bx, y, 70, 26, dIndex === 0 ? 0x22313a : dIndex === 1 ? 0x4a3320 : 0x4a2020, 0.96)
          .setStrokeStyle(1, 0xf4df9c, 0.8).setInteractive({ useHandCursor: true }).setScrollFactor(0).setDepth(5003);
        const label = scene.add.text(bx, y, diff.label || diff.key, { fontFamily: "Trebuchet MS, Arial, sans-serif", fontSize: "9px", color: "#f8f1dc", align: "center" }).setOrigin(0.5).setScrollFactor(0).setDepth(5004);
        btn.on("pointerdown", () => this.startDungeon(dungeon.id, diff.key));
        scene.servicePanelElements.push(btn, label);
      });
    });
  };
})();
