class EditorScene extends Phaser.Scene {
  constructor() {
    super("EditorScene");
    this.returnSceneKey = "PrototypeScene";
    this.returnSceneData = {};
    this.rows = [];
    this.detailTexts = [];
    this.bannerText = null;
  }

  create(data) {
    const { width, height } = this.scale;
    this.returnSceneKey = data?.returnScene || "PrototypeScene";
    this.returnSceneData = data?.returnData || {};

    GameState.ensureGameConfig?.(this.registry);

    this.cameras.main.setBackgroundColor("#0b1117");
    this.drawShell(width, height);
    this.buildRows(width, height);
    this.refreshView();

    this.input.keyboard.on("keydown-ESC", () => this.returnToSource());
  }

  drawShell(width, height) {
    this.add.rectangle(width / 2, height / 2, width, height, 0x091018, 1);
    this.add.rectangle(width / 2, height / 2, width - 40, height - 40, 0x101923, 0.98).setStrokeStyle(2, 0x3b4c5c, 0.95);
    this.add.rectangle(width / 2, 54, width - 40, 42, 0x1a2632, 0.98).setStrokeStyle(1, 0x617382, 0.9);
    this.add.text(34, 34, "MMO Isekai Server Editor", {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "22px",
      color: "#f8f1dc",
      fontStyle: "bold",
    });
    this.add.text(width - 34, 36, "Future External Tool Schema", {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "12px",
      color: "#9fb2ba",
    }).setOrigin(1, 0);

    this.add.rectangle(212, height / 2 + 12, 348, height - 136, 0x141f29, 0.98).setStrokeStyle(1, 0x334453, 0.88);
    this.add.rectangle(width - 290, height / 2 + 12, 496, height - 136, 0x141f29, 0.98).setStrokeStyle(1, 0x334453, 0.88);

    this.add.text(38, 88, "Config Entries", {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "16px",
      color: "#d7c48d",
    });
    this.add.text(404, 88, "Details / Transport", {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "16px",
      color: "#d7c48d",
    });

    this.bannerText = this.add.text(404, height - 86, "", {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "14px",
      color: "#f8f1dc",
      wordWrap: { width: 448 },
    });

    const back = this.add.rectangle(width - 88, height - 44, 132, 34, 0x26384a, 0.96)
      .setStrokeStyle(1, 0x6c8191, 0.95)
      .setInteractive({ useHandCursor: true });
    const backLabel = this.add.text(width - 88, height - 44, "Return  (Esc)", {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "14px",
      color: "#f8f1dc",
    }).setOrigin(0.5);
    back.on("pointerdown", () => this.returnToSource());
    back.on("pointerover", () => back.setFillStyle(0x31495f, 0.98));
    back.on("pointerout", () => back.setFillStyle(0x26384a, 0.96));

    this.detailTitle = this.add.text(404, 122, "", {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "22px",
      color: "#f4df9c",
      fontStyle: "bold",
    });
    this.detailMeta = this.add.text(404, 154, "", {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "14px",
      color: "#d7c48d",
      wordWrap: { width: 448 },
    });
    for (let index = 0; index < 8; index += 1) {
      this.detailTexts.push(this.add.text(404, 196 + index * 34, "", {
        fontFamily: "Trebuchet MS, Arial, sans-serif",
        fontSize: "14px",
        color: index >= 5 ? "#9fb2ba" : "#d9e0e2",
        wordWrap: { width: 448 },
      }));
    }
  }

  buildRows(width, height) {
    const entries = this.getEditorEntries();
    this.rows = entries.map((entry, index) => {
      const y = 124 + index * 52;
      const bg = this.add.rectangle(212, y, 324, 42, 0x1d2b36, 0.96)
        .setStrokeStyle(1, 0x42515c, 0.9)
        .setInteractive({ useHandCursor: true });
      const title = this.add.text(62, y - 12, "", {
        fontFamily: "Trebuchet MS, Arial, sans-serif",
        fontSize: "14px",
        color: "#f8f1dc",
      });
      const meta = this.add.text(62, y + 6, "", {
        fontFamily: "Trebuchet MS, Arial, sans-serif",
        fontSize: "12px",
        color: "#9fb2ba",
      });
      bg.on("pointerdown", () => {
        entry.onConfirm?.();
        this.refreshView(index);
      });
      return { bg, title, meta, entry };
    });
    this.selectedIndex = 0;
  }

  getEditorEntries() {
    const currentDifficulty = GameState.getDungeonDifficultyDef?.(this.registry);
    const snapshot = GameState.loadEditorSnapshot?.();

    return [
      {
        title: "Default Difficulty",
        meta: `${currentDifficulty?.label || "Normal"}`,
        lines: [
          "Cycles Normal -> Hard -> Nightmare.",
          `Enemy HP x${currentDifficulty?.hpMultiplier || 1}`,
          `Enemy DMG x${currentDifficulty?.damageMultiplier || 1}`,
          `Drop x${currentDifficulty?.dropMultiplier || 1}`,
          "Portable config field: selectedDungeonDifficulty",
        ],
        onConfirm: () => GameState.cycleDungeonDifficulty?.(this.registry),
      },
      {
        title: "Room Min Mobs",
        meta: `${GameState.getGameConfigValue?.(this.registry, "dungeon.roomMinMobs", 1)}`,
        lines: [
          "Controls lower spawn bound for every combat room.",
          `Current min ${GameState.getGameConfigValue?.(this.registry, "dungeon.roomMinMobs", 1)}`,
          `Current max ${GameState.getGameConfigValue?.(this.registry, "dungeon.roomMaxMobs", 10)}`,
          "Target use: live server-side spawn tuning.",
        ],
        onConfirm: () => {
          const next = Phaser.Math.Clamp((GameState.getGameConfigValue?.(this.registry, "dungeon.roomMinMobs", 1) || 1) + 1, 1, 10);
          GameState.setGameConfigValue?.(this.registry, "dungeon.roomMinMobs", next);
          const max = GameState.getGameConfigValue?.(this.registry, "dungeon.roomMaxMobs", 10) || 10;
          if (next > max) GameState.setGameConfigValue?.(this.registry, "dungeon.roomMaxMobs", next);
        },
      },
      {
        title: "Room Max Mobs",
        meta: `${GameState.getGameConfigValue?.(this.registry, "dungeon.roomMaxMobs", 10)}`,
        lines: [
          "Controls upper spawn bound for every combat room.",
          `Current max ${GameState.getGameConfigValue?.(this.registry, "dungeon.roomMaxMobs", 10)}`,
          "Three combat phases can therefore reach up to 30 kills.",
          "Boss chest grade consumes this budget.",
        ],
        onConfirm: () => {
          const currentMin = GameState.getGameConfigValue?.(this.registry, "dungeon.roomMinMobs", 1) || 1;
          const next = Phaser.Math.Clamp((GameState.getGameConfigValue?.(this.registry, "dungeon.roomMaxMobs", 10) || 10) + 1, currentMin, 10);
          GameState.setGameConfigValue?.(this.registry, "dungeon.roomMaxMobs", next);
        },
      },
      {
        title: "Boss HP Multiplier",
        meta: `x${(GameState.getGameConfigValue?.(this.registry, "dungeon.bossBaseHpMultiplier", 1) || 1).toFixed(2)}`,
        lines: [
          "Global boss HP scale before difficulty and level scaling.",
          `Current x${(GameState.getGameConfigValue?.(this.registry, "dungeon.bossBaseHpMultiplier", 1) || 1).toFixed(2)}`,
          "Use to stop bosses from melting too quickly.",
          "Future multiplayer admin tool will reuse this exact field.",
        ],
        onConfirm: () => {
          const current = GameState.getGameConfigValue?.(this.registry, "dungeon.bossBaseHpMultiplier", 1) || 1;
          GameState.setGameConfigValue?.(this.registry, "dungeon.bossBaseHpMultiplier", Phaser.Math.Clamp(Number((current + 0.25).toFixed(2)), 1, 6));
        },
      },
      {
        title: "Reward Thresholds",
        meta: `${Math.round((GameState.getGameConfigValue?.(this.registry, "dungeon.killQualityLow", 0.45) || 0.45) * 100)}% / ${Math.round((GameState.getGameConfigValue?.(this.registry, "dungeon.killQualityHigh", 0.9) || 0.9) * 100)}%`,
        lines: [
          "Low/high chest quality thresholds for mob clear ratio.",
          "Lower ratio means weaker boss chest reward.",
          "High ratio means best guaranteed class-appropriate reward.",
          "Each click raises the low threshold by 5%.",
        ],
        onConfirm: () => {
          const low = GameState.getGameConfigValue?.(this.registry, "dungeon.killQualityLow", 0.45) || 0.45;
          const nextLow = Phaser.Math.Clamp(Number((low + 0.05).toFixed(2)), 0.25, 0.85);
          GameState.setGameConfigValue?.(this.registry, "dungeon.killQualityLow", nextLow);
          const high = GameState.getGameConfigValue?.(this.registry, "dungeon.killQualityHigh", 0.9) || 0.9;
          if (nextLow >= high) {
            GameState.setGameConfigValue?.(this.registry, "dungeon.killQualityHigh", Math.min(0.95, Number((nextLow + 0.1).toFixed(2))));
          }
        },
      },
      {
        title: "Save Editor Profile",
        meta: snapshot ? "Overwrite local profile" : "Create local profile",
        lines: [
          "Stores the portable editor schema in localStorage.",
          "This is the same schema planned for future external exe tooling.",
          snapshot ? `Last saved ${new Date(snapshot.savedAt).toLocaleString()}` : "No saved editor profile yet.",
        ],
        onConfirm: () => {
          GameState.saveEditorSnapshot?.(this.registry);
          this.flashBanner("Editor profile saved locally.");
        },
      },
      {
        title: "Load Editor Profile",
        meta: snapshot ? "Load saved profile" : "No profile found",
        lines: [
          "Restores tuning values from the saved editor profile.",
          "Useful for bringing back multiplayer/server presets.",
          "If no snapshot exists, nothing changes.",
        ],
        onConfirm: () => {
          const ok = GameState.applyEditorSnapshot?.(this.registry);
          this.flashBanner(ok ? "Editor profile loaded." : "No editor profile found.");
        },
      },
      {
        title: "Copy JSON Snapshot",
        meta: "Clipboard export",
        lines: [
          "Copies the portable editor schema as JSON.",
          "This is the handoff format for a future standalone exe.",
          "You can version, diff, and share it between environments.",
        ],
        onConfirm: async () => {
          const payload = GameState.buildEditorSnapshot?.(this.registry);
          try {
            if (navigator?.clipboard?.writeText) {
              await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
              this.flashBanner("Editor JSON copied to clipboard.");
            } else {
              this.flashBanner("Clipboard API unavailable in this build.");
            }
          } catch (error) {
            this.flashBanner("Clipboard copy failed.");
          }
        },
      },
      {
        title: "Reset Defaults",
        meta: "Restore base schema",
        lines: [
          "Resets the shared editor schema to project defaults.",
          "Use when a tuning experiment goes too far.",
          "Current game save remains intact; only config changes.",
        ],
        onConfirm: () => {
          GameState.resetGameConfig?.(this.registry);
          this.flashBanner("Editor config reset to defaults.");
        },
      },
    ];
  }

  refreshView(selectedIndex = null) {
    if (selectedIndex !== null) {
      this.selectedIndex = selectedIndex;
    }
    const entries = this.getEditorEntries();
    this.rows.forEach((row, index) => {
      row.entry = entries[index];
      const selected = index === this.selectedIndex;
      row.bg.setFillStyle(selected ? 0x304555 : 0x1d2b36, selected ? 0.98 : 0.96);
      row.bg.setStrokeStyle(1, selected ? 0xe0c98a : 0x42515c, selected ? 0.95 : 0.9);
      row.title.setText(entries[index].title);
      row.meta.setText(entries[index].meta);
    });

    const active = entries[this.selectedIndex];
    if (!active) {
      return;
    }
    this.detailTitle.setText(active.title);
    this.detailMeta.setText(active.meta);
    this.detailTexts.forEach((text, index) => {
      text.setText(active.lines[index] || "");
    });

    const snapshot = GameState.buildEditorSnapshot?.(this.registry);
    this.bannerText.setText(
      `Schema Ready For External Tooling\nVersion ${snapshot?.version || 1} | Difficulty ${snapshot?.selectedDungeonDifficulty || "normal"}\nStorage Key: ${GameState.EDITOR_STORAGE_KEY}`
    );
  }

  flashBanner(message) {
    if (!this.bannerText) {
      return;
    }
    this.bannerText.setText(message);
    this.time.delayedCall(1400, () => this.refreshView());
  }

  returnToSource() {
    GameState.saveEditorSnapshot?.(this.registry);
    this.scene.start(this.returnSceneKey, this.returnSceneData);
  }
}

window.EditorScene = EditorScene;
