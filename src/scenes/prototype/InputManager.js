class InputManager {
  constructor(scene) {
    this.scene = scene;
  }

  createInput() {
    const scene = this.scene;
    
    scene.actionKeys = scene.input.keyboard.addKeys({
      up: 'W', down: 'S', left: 'A', right: 'D',
      w: 'W', a: 'A', s: 'S', d: 'D',
      interact: 'E', close: 'ESC', confirm: 'ENTER',
      inventory: 'I', skills: 'K', questList: 'Q', classSkill: 'F', character: 'C', map: 'M'
    });

    scene.moveKeys = scene.input.keyboard.addKeys({
      up: 'W', down: 'S', left: 'A', right: 'D',
      w: 'W', a: 'A', s: 'S', d: 'D',
    });

    // Setup pointer events
    scene.input.on("pointerdown", (pointer) => {
      if (pointer.button === 0) {
        if (scene.handlePointerInteraction?.(pointer)) return;
        scene.handleBasicAttack?.();
      }
    });

    // Setup global hotkeys
    this.setupGlobalHotkeys();
  }

  setupGlobalHotkeys() {
    const scene = this.scene;
    
    // Hotbar keys 1-6
    for (let i = 0; i < 6; i++) {
      const keyCode = Phaser.Input.Keyboard.KeyCodes[`${i + 1}`];
      const key = scene.input.keyboard.addKey(keyCode);
      
      key.on('down', () => {
        scene.useHotbarSlot?.(i);
      });
    }
  }
}


window.InputManager = InputManager;
