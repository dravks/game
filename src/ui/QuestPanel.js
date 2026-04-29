/**
 * QuestPanel - shows only accepted/active quests.
 * It intentionally does not show available/unaccepted quest-giver options.
 */
class QuestPanel {
  constructor(scene, registry, GameState) {
    this.scene = scene;
    this.registry = registry;
    this.GameState = GameState || window.GameState || {};
    this.container = null;
    this.visible = false;
    this.dynamicElements = [];
    this.metrics = null;
  }

  create() {
    const { width, height } = this.scene.scale;
    const panelW = 640;
    const panelH = 460;
    const panelX = width / 2 - panelW / 2;
    const panelY = height / 2 - panelH / 2;
    this.metrics = { width, height, panelW, panelH, panelX, panelY };

    this.container = this.scene.add.container(0, 0).setDepth(99999).setScrollFactor(0).setVisible(false);
    const children = [];

    children.push(this.scene.add.rectangle(width / 2, height / 2, panelW, panelH, 0x101820, 0.97)
      .setStrokeStyle(3, 0x9b7a35, 0.98).setScrollFactor(0));
    children.push(this.scene.add.rectangle(width / 2, height / 2 + 8, panelW - 22, panelH - 60, 0x182634, 0.76)
      .setStrokeStyle(1, 0x314554, 0.8).setScrollFactor(0));
    children.push(this.scene.add.text(panelX + 24, panelY + 18, "Quest Journal", {
      fontSize: "22px", color: "#f6e2a0", fontFamily: "Trebuchet MS, Arial, sans-serif", fontStyle: "bold", stroke: "#000", strokeThickness: 3,
    }).setScrollFactor(0));
    children.push(this.scene.add.text(panelX + panelW - 24, panelY + 24, "Press Q or ESC to close", {
      fontSize: "12px", color: "#d7c58f", fontFamily: "Trebuchet MS, Arial, sans-serif",
    }).setOrigin(1, 0).setScrollFactor(0));
    children.push(this.scene.add.text(panelX + 32, panelY + 62, "Active Quests", {
      fontSize: "15px", color: "#f4df9c", fontFamily: "Trebuchet MS, Arial, sans-serif", fontStyle: "bold", stroke: "#000", strokeThickness: 2,
    }).setScrollFactor(0));

    this.container.add(children);
    return true;
  }

  show() {
    if (!this.container || !this.container.active) this.create();
    this.refresh();
    this.container.setVisible(true).setDepth(99999);
    this.scene.children?.bringToTop?.(this.container);
    this.visible = true;
  }

  hide() {
    this.clearDynamic();
    if (this.container && this.container.active) this.container.setVisible(false);
    this.visible = false;
    this.scene?.game?.canvas?.focus?.();
  }

  isVisible() {
    return !!(this.visible && this.container && this.container.active && this.container.visible);
  }

  refresh() {
    if (!this.container || !this.metrics) return;
    this.clearDynamic();
    const { panelX, panelY, panelW, panelH } = this.metrics;
    const quests = this.getAcceptedQuests();
    let y = panelY + 92;

    if (quests.length === 0) {
      this.addDynamic(this.scene.add.text(panelX + 36, y, "No active quests.", {
        fontSize: "15px", color: "#c8d3d7", fontFamily: "Trebuchet MS, Arial, sans-serif",
      }).setScrollFactor(0));
      this.addDynamic(this.scene.add.text(panelX + 36, y + 28, "Talk to a quest NPC and press Accept to add a quest here.", {
        fontSize: "12px", color: "#8fa3ad", fontFamily: "Trebuchet MS, Arial, sans-serif",
        wordWrap: { width: panelW - 72, useAdvancedWrap: true },
      }).setScrollFactor(0));
      return;
    }

    quests.slice(0, 8).forEach((quest, index) => {
      const rowH = 72;
      const rowY = y + index * rowH;
      const statusColor = quest.state === "ready_to_turn_in" ? 0x79d982 : 0x6aa7ff;
      this.addDynamic(this.scene.add.rectangle(panelX + panelW / 2, rowY + 26, panelW - 64, 58, 0x0b1118, 0.64)
        .setStrokeStyle(1, statusColor, 0.75).setScrollFactor(0));
      this.addDynamic(this.scene.add.text(panelX + 48, rowY + 4, quest.title || quest.name || quest.id || "Quest", {
        fontSize: "14px", color: "#f8f1dc", fontFamily: "Trebuchet MS, Arial, sans-serif", fontStyle: "bold",
        wordWrap: { width: panelW - 120, useAdvancedWrap: true }, maxLines: 1,
      }).setScrollFactor(0));
      this.addDynamic(this.scene.add.text(panelX + 48, rowY + 24, this.getQuestObjectiveText(quest), {
        fontSize: "12px", color: "#c8d3d7", fontFamily: "Trebuchet MS, Arial, sans-serif",
        wordWrap: { width: panelW - 120, useAdvancedWrap: true }, maxLines: 2, lineSpacing: 3,
      }).setScrollFactor(0));
      this.addDynamic(this.scene.add.text(panelX + panelW - 48, rowY + 9, this.stateLabel(quest.state), {
        fontSize: "11px", color: this.hexColor(statusColor), fontFamily: "Trebuchet MS, Arial, sans-serif", fontStyle: "bold",
      }).setOrigin(1, 0).setScrollFactor(0));
    });

    if (quests.length > 8) {
      this.addDynamic(this.scene.add.text(panelX + 36, panelY + panelH - 44, `+${quests.length - 8} more active quest(s) hidden`, {
        fontSize: "11px", color: "#d7c58f", fontFamily: "Trebuchet MS, Arial, sans-serif",
      }).setScrollFactor(0));
    }
  }

  getAcceptedQuests() {
    const result = [];
    if (typeof this.GameState.getActiveQuests === "function") {
      const active = this.GameState.getActiveQuests(this.registry) || [];
      return active.filter((q) => this.isAcceptedState(q.state || q.status || "active"));
    }

    const questDefs = this.getQuestDefinitions();
    const questStates = this.registry.get("questStates") || this.registry.get("questStateById") || {};
    const activeIds = this.registry.get("activeQuestIds") || this.registry.get("acceptedQuestIds") || [];

    if (Array.isArray(activeIds) && activeIds.length) {
      activeIds.forEach((id) => {
        const def = questDefs[id] || { id, title: id };
        const state = questStates[id] || "active";
        if (this.isAcceptedState(state)) result.push({ ...def, id, state });
      });
      return result;
    }

    // Legacy single quest support: only show if accepted/ready, never not_accepted.
    const legacyState = this.registry.get("questState");
    if (this.isAcceptedState(legacyState)) {
      result.push({
        id: "clear_dungeon",
        title: "Clear the Dungeon",
        description: "Clear a dungeon run and report back.",
        state: legacyState,
      });
    }
    return result;
  }

  getQuestDefinitions() {
    return this.GameState.QUEST_DEFS || this.GameState.QUESTS || this.GameState.questDefs || {};
  }

  isAcceptedState(state) {
    return ["active", "accepted", "in_progress", "ready_to_turn_in", "claimable"].includes(String(state || "").toLowerCase());
  }

  stateLabel(state) {
    const value = String(state || "active").toLowerCase();
    if (value === "ready_to_turn_in" || value === "claimable") return "Ready";
    if (value === "completed") return "Done";
    return "Active";
  }

  getQuestObjectiveText(quest) {
    return quest.objectiveText || quest.objective || quest.description || quest.summary || "Complete the quest objective.";
  }

  addDynamic(obj) {
    this.dynamicElements.push(obj);
    this.container.add(obj);
  }

  clearDynamic() {
    this.dynamicElements.forEach((el) => el?.destroy?.());
    this.dynamicElements = [];
  }

  hexColor(value) {
    return `#${(Number(value) & 0xffffff).toString(16).padStart(6, "0")}`;
  }

  destroy() {
    this.clearDynamic();
    this.container?.destroy?.();
    this.container = null;
    this.visible = false;
  }
}

window.QuestPanel = QuestPanel;
console.log("[QuestPanel] Loaded stable module");
