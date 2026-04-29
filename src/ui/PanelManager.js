/**
 * PanelManager - small, defensive manager for blocking UI panels.
 * Panels must expose show(), hide(), and isVisible().
 */
class PanelManager {
  constructor(scene) {
    this.scene = scene;
    this.panels = new Map();
    this.activePanelId = null;
  }

  register(id, panel, options = {}) {
    if (!id || !panel) return false;
    this.panels.set(id, {
      panel,
      blocking: options.blocking !== false,
      closeOthers: options.closeOthers !== false,
    });
    return true;
  }

  has(id) {
    return this.panels.has(id);
  }

  get(id) {
    return this.panels.get(id)?.panel || null;
  }

  isPanelVisible(id) {
    const entry = this.panels.get(id);
    return !!(entry && this.safeIsVisible(entry.panel));
  }

  safeIsVisible(panel) {
    try {
      return !!(panel && typeof panel.isVisible === "function" && panel.isVisible());
    } catch (error) {
      console.warn(`[PanelManager] isVisible failed`, error);
      return false;
    }
  }

  open(id) {
    const entry = this.panels.get(id);
    if (!entry) {
      console.warn(`[PanelManager] open skipped; panel not found: ${id}`);
      return false;
    }

    if (entry.closeOthers) this.closeBlockingPanelsExcept(id);

    try {
      if (typeof entry.panel.show === "function") entry.panel.show();
      this.activePanelId = id;
      this.refocusGameCanvas();
      return true;
    } catch (error) {
      console.error(`[PanelManager] open failed for ${id}`, error);
      return false;
    }
  }

  close(id) {
    const entry = this.panels.get(id);
    if (!entry) return false;

    const wasVisible = this.safeIsVisible(entry.panel);
    try {
      if (typeof entry.panel.hide === "function") entry.panel.hide();
      if (this.activePanelId === id) this.activePanelId = null;
      this.refocusGameCanvas();
      return wasVisible;
    } catch (error) {
      console.error(`[PanelManager] close failed for ${id}`, error);
      return false;
    }
  }

  toggle(id) {
    const entry = this.panels.get(id);
    if (!entry) {
      console.warn(`[PanelManager] toggle skipped; panel not found: ${id}`);
      return false;
    }
    if (this.safeIsVisible(entry.panel)) return this.close(id);
    return this.open(id);
  }

  closeActive() {
    if (this.activePanelId && this.isPanelVisible(this.activePanelId)) {
      return this.close(this.activePanelId);
    }

    // Fallback: close the topmost visible blocking panel even if activePanelId is stale.
    const openNames = this.getOpenPanelNamesArray();
    if (openNames.length > 0) return this.close(openNames[openNames.length - 1]);
    this.activePanelId = null;
    return false;
  }

  closeBlockingPanelsExcept(exceptId) {
    this.panels.forEach((entry, id) => {
      if (id === exceptId || !entry.blocking) return;
      if (this.safeIsVisible(entry.panel)) {
        try {
          if (typeof entry.panel.hide === "function") entry.panel.hide();
          if (this.activePanelId === id) this.activePanelId = null;
        } catch (error) {
          console.warn(`[PanelManager] closeBlockingPanelsExcept failed for ${id}`, error);
        }
      }
    });
  }

  closeAll() {
    let closedAny = false;
    this.panels.forEach((entry, id) => {
      if (this.safeIsVisible(entry.panel)) {
        try {
          if (typeof entry.panel.hide === "function") entry.panel.hide();
          closedAny = true;
        } catch (error) {
          console.warn(`[PanelManager] closeAll failed for ${id}`, error);
        }
      }
    });
    this.activePanelId = null;
    this.refocusGameCanvas();
    return closedAny;
  }

  isAnyBlockingOpen() {
    let open = false;
    this.panels.forEach((entry) => {
      if (entry.blocking && this.safeIsVisible(entry.panel)) open = true;
    });
    return open;
  }

  getOpenPanelNamesArray() {
    const names = [];
    this.panels.forEach((entry, id) => {
      if (this.safeIsVisible(entry.panel)) names.push(id);
    });
    return names;
  }

  getOpenPanelNames() {
    const names = this.getOpenPanelNamesArray();
    return names.length ? names.join(", ") : "none";
  }

  refocusGameCanvas() {
    try {
      this.scene?.game?.canvas?.focus?.();
    } catch (_) {}
  }
}

window.PanelManager = PanelManager;
console.log("[PanelManager] Loaded stable module");
