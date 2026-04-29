/**
 * SkillPanel - class skill + passive/training overview.
 */
class SkillPanel {
  constructor(scene, registry, GameState) {
    this.scene = scene;
    this.registry = registry;
    this.GameState = GameState || window.GameState || {};
    this.container = null;
    this.visible = false;
    this.dynamicElements = [];
    this.metrics = null;
    this.selectedSkillId = null;
  }

  create() {
    const { width, height } = this.scene.scale;
    const panelW = 720;
    const panelH = 520;
    const panelX = width / 2 - panelW / 2;
    const panelY = height / 2 - panelH / 2;
    this.metrics = { width, height, panelW, panelH, panelX, panelY };

    this.container = this.scene.add.container(0, 0).setDepth(99999).setScrollFactor(0).setVisible(false);
    const children = [];

    children.push(this.scene.add.rectangle(width / 2, height / 2, panelW, panelH, 0x101820, 0.97)
      .setStrokeStyle(3, 0x9b7a35, 0.98).setScrollFactor(0));
    children.push(this.scene.add.rectangle(width / 2, height / 2 + 14, panelW - 24, panelH - 76, 0x182634, 0.76)
      .setStrokeStyle(1, 0x314554, 0.8).setScrollFactor(0));
    children.push(this.scene.add.text(panelX + 24, panelY + 18, "Skills", {
      fontSize: "22px", color: "#f6e2a0", fontFamily: "Trebuchet MS, Arial, sans-serif", fontStyle: "bold", stroke: "#000", strokeThickness: 3,
    }).setScrollFactor(0));
    children.push(this.scene.add.text(panelX + panelW - 24, panelY + 24, "Press K or ESC to close", {
      fontSize: "12px", color: "#d7c58f", fontFamily: "Trebuchet MS, Arial, sans-serif",
    }).setOrigin(1, 0).setScrollFactor(0));

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
    const { panelX, panelY, panelW } = this.metrics;
    const className = String(this.registry.get("playerClass") || this.GameState.DEFAULT_CLASS || "warrior").toLowerCase();
    const classLabel = className.charAt(0).toUpperCase() + className.slice(1);
    const skills = this.GameState.CLASS_LEVEL_SKILLS?.[className] || [];
    const defaultSkill = this.getClassSkill(className);
    const skill = skills.find((entry) => entry.id === this.selectedSkillId) || defaultSkill;
    this.selectedSkillId = skill?.id || this.selectedSkillId;
    const training = this.GameState.CLASS_TRAINING_DEFS?.[className] || null;

    this.addDynamic(this.scene.add.text(panelX + 34, panelY + 64, `${classLabel} Class Skill`, {
      fontSize: "15px", color: "#f4df9c", fontFamily: "Trebuchet MS, Arial, sans-serif", fontStyle: "bold", stroke: "#000", strokeThickness: 2,
    }).setScrollFactor(0));

    const cardX = panelX + 38;
    const cardY = panelY + 92;
    const cardW = panelW - 76;
    this.addDynamic(this.scene.add.rectangle(panelX + panelW / 2, cardY + 70, cardW, 132, 0x0b1118, 0.72)
      .setStrokeStyle(2, 0x6aa7ff, 0.8).setScrollFactor(0));

    const iconKey = this.safeTextureKey(skill?.icon || this.defaultSkillIcon(className));
    this.addDynamic(this.scene.add.rectangle(cardX + 42, cardY + 52, 62, 62, 0x22313a, 0.95)
      .setStrokeStyle(2, 0x4e6570, 0.9).setScrollFactor(0));
    this.addDynamic(this.scene.add.image(cardX + 42, cardY + 52, iconKey)
      .setDisplaySize(36, 36).setTint(skill?.tint || 0xffffff).setScrollFactor(0));

    this.addDynamic(this.scene.add.text(cardX + 86, cardY + 18, skill?.name || "Class Skill", {
      fontSize: "17px", color: "#f8f1dc", fontFamily: "Trebuchet MS, Arial, sans-serif", fontStyle: "bold",
    }).setScrollFactor(0));
    this.addDynamic(this.scene.add.text(cardX + 86, cardY + 44, skill?.description || "No class skill description yet.", {
      fontSize: "12px", color: "#c8d3d7", fontFamily: "Trebuchet MS, Arial, sans-serif",
      wordWrap: { width: cardW - 112, useAdvancedWrap: true }, maxLines: 3, lineSpacing: 3,
    }).setScrollFactor(0));
    this.addDynamic(this.scene.add.text(cardX + 86, cardY + 98,
      `Hotbar 1-6   |   MP ${skill?.mpCost ?? "-"}   |   CD ${this.msToSeconds(skill?.cooldownMs)}   |   DMG ${skill?.damageScale ? `${skill.damageScale}x` : "-"}`, {
      fontSize: "12px", color: "#d7c58f", fontFamily: "Trebuchet MS, Arial, sans-serif",
    }).setScrollFactor(0));

    this.addDynamic(this.scene.add.text(panelX + 34, panelY + 242, "Training / Passive", {
      fontSize: "15px", color: "#f4df9c", fontFamily: "Trebuchet MS, Arial, sans-serif", fontStyle: "bold", stroke: "#000", strokeThickness: 2,
    }).setScrollFactor(0));

    const trainingLevel = this.registry.get(`${className}TrainingLevel`) || this.registry.get("classTrainingLevel") || 0;
    this.addDynamic(this.scene.add.rectangle(panelX + panelW / 2, panelY + 312, cardW, 104, 0x0b1118, 0.62)
      .setStrokeStyle(1, 0x9b7a35, 0.75).setScrollFactor(0));
    this.addDynamic(this.scene.add.text(cardX + 18, panelY + 270, training?.name || "Class Training", {
      fontSize: "15px", color: "#f8f1dc", fontFamily: "Trebuchet MS, Arial, sans-serif", fontStyle: "bold",
    }).setScrollFactor(0));
    this.addDynamic(this.scene.add.text(cardX + 18, panelY + 294, training?.description || "Permanent class progression bonuses will be shown here.", {
      fontSize: "12px", color: "#c8d3d7", fontFamily: "Trebuchet MS, Arial, sans-serif",
      wordWrap: { width: cardW - 36, useAdvancedWrap: true }, maxLines: 3, lineSpacing: 3,
    }).setScrollFactor(0));
    this.addDynamic(this.scene.add.text(cardX + 18, panelY + 354,
      `Level: ${trainingLevel}   |   Bonus: ${training?.statLabel || "-"} +${(training?.perLevel || 0) * trainingLevel}`, {
      fontSize: "12px", color: "#8ad97a", fontFamily: "Trebuchet MS, Arial, sans-serif",
    }).setScrollFactor(0));
  }

  getClassSkill(className) {
    if (typeof this.GameState.getClassSkillForClass === "function") return this.GameState.getClassSkillForClass(className);
    return this.GameState.CLASS_SKILL_DEFS?.[className] || null;
  }

  defaultSkillIcon(className) {
    return { warrior: "icon_05", mage: "icon_06", rogue: "icon_08", archer: "icon_12" }[className] || "icon_05";
  }

  msToSeconds(ms) {
    if (!ms && ms !== 0) return "-";
    return `${(ms / 1000).toFixed(ms % 1000 === 0 ? 0 : 1)}s`;
  }

  safeTextureKey(key) {
    if (key && this.scene.textures?.exists?.(key)) return key;
    if (this.scene.textures?.exists?.("icon_05")) return "icon_05";
    return key || "__MISSING";
  }

  addDynamic(obj) {
    this.dynamicElements.push(obj);
    this.container.add(obj);
  }

  clearDynamic() {
    this.dynamicElements.forEach((el) => el?.destroy?.());
    this.dynamicElements = [];
  }

  destroy() {
    this.clearDynamic();
    this.container?.destroy?.();
    this.container = null;
    this.visible = false;
  }
}

window.SkillPanel = SkillPanel;
console.log("[SkillPanel] Loaded stable module");
