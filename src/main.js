const config = {
  type: Phaser.AUTO,
  parent: "game-root",
  width: 1280,
  height: 720,
  backgroundColor: "#101820",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [window.CharacterCreateScene, window.PrototypeScene, window.DungeonPrototypeScene],
  // Debug: Show errors in console
  load: {
    baseURL: "",
    crossOrigin: "anonymous",
  },
};

window.game = new Phaser.Game(config);
