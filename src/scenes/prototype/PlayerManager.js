class PlayerManager {
  constructor(scene) {
    this.scene = scene;
  }

  createPlayer(x, y) {
    const scene = this.scene;
    
    scene.player = scene.physics.add.sprite(x, y, "player_idle_sheet")
      .setScale(0.35)
      .setDepth(10);
    
    scene.player.body.setSize(40, 40).setOffset(76, 120);
    scene.player.play("player-idle");
    
    // Add collision with obstacles
    if (scene.obstacles) {
      scene.physics.add.collider(scene.player, scene.obstacles);
    }
    
    return scene.player;
  }

  setPlayerAnimation(isRunning, directionX = 0) {
    const scene = this.scene;
    
    if (!scene.player) return;
    
    if (isRunning) {
      scene.player.play("player-run", true);
      if (directionX !== 0) {
        scene.player.setFlipX(directionX < 0);
      }
    } else {
      scene.player.play("player-idle", true);
    }
  }

  handleMovement() {
    const scene = this.scene;
    
    if (!scene.moveKeys) return;
    
    let horizontal = 0;
    let vertical = 0;

    if (scene.moveKeys.left.isDown || scene.moveKeys.a.isDown) horizontal -= 1;
    if (scene.moveKeys.right.isDown || scene.moveKeys.d.isDown) horizontal += 1;
    if (scene.moveKeys.up.isDown || scene.moveKeys.w.isDown) vertical -= 1;
    if (scene.moveKeys.down.isDown || scene.moveKeys.s.isDown) vertical += 1;

    const direction = new Phaser.Math.Vector2(horizontal, vertical);

    if (direction.lengthSq() > 0) {
      scene.playerFacing = direction.clone().normalize();
      direction.normalize().scale(scene.playerSpeed);
      scene.player.body.setVelocity(direction.x, direction.y);
      this.setPlayerAnimation(true, direction.x);
    } else {
      scene.player.body.setVelocity(0, 0);
      this.setPlayerAnimation(false);
    }
  }

  // Hotbar slot usage
  useHotbarSlot(index) {
    const scene = this.scene;
    
    if (index < 0 || index >= 6) return;
    
    // Get hotbar items from GameState
    const hotbarItems = window.GameState?.getHotbarItems?.(scene.registry) || [];
    const item = hotbarItems[index];
    
    if (item) {
      // Use the item
      const useResult = window.GameState?.useHotbarItem?.(scene.registry, index);
      if (useResult) {
        scene.showCityBanner?.(`Used ${item.name}`, "From hotbar", 1000);
        
        // Update hotbar visual
        this.updateHotbarSlotVisual(index);
      }
    } else {
      scene.showCityBanner?.(`Hotbar slot ${index + 1} is empty`, "", 1000);
    }
  }

  updateHotbarSlotVisual(index) {
    const scene = this.scene;
    
    if (index < 0 || index >= scene.hotbarSlotVisuals.length) return;
    
    const slotVisual = scene.hotbarSlotVisuals[index];
    const hotbarItems = window.GameState?.getHotbarItems?.(scene.registry) || [];
    const item = hotbarItems[index];
    
    if (item) {
      // Update slot icon
      if (slotVisual.icon) {
        slotVisual.icon.destroy();
      }
      
      try {
        const iconKey = this.getItemIconKey(item);
        const icon = scene.add.image(slotVisual.bg.x, slotVisual.bg.y, iconKey)
          .setScale(0.3)
          .setScrollFactor(0)
          .setDepth(16);
        slotVisual.icon = icon;
      } catch (e) {
        // Icon not found, use default
        const icon = scene.add.image(slotVisual.bg.x, slotVisual.bg.y, "icon_11")
          .setScale(0.3)
          .setScrollFactor(0)
          .setDepth(16);
        slotVisual.icon = icon;
      }
      
      // Update count
      if (slotVisual.count) {
        slotVisual.count.destroy();
      }
      
      if (item.count > 1) {
        const count = scene.add.text(slotVisual.bg.x + 15, slotVisual.bg.y + 15, item.count.toString(), {
          fontFamily: "Trebuchet MS, Arial, sans-serif",
          fontSize: "10px",
          color: "#f8f1dc",
          stroke: "#0b141a",
          strokeThickness: 2,
        })
          .setOrigin(1, 1)
          .setScrollFactor(0)
          .setDepth(17);
        slotVisual.count = count;
      }
    } else {
      // Clear slot
      if (slotVisual.icon) {
        slotVisual.icon.destroy();
        slotVisual.icon = null;
      }
      if (slotVisual.count) {
        slotVisual.count.destroy();
        slotVisual.count = null;
      }
    }
  }

  getItemIconKey(item) {
    // Map item types to icon keys
    const iconMap = {
      "weapon": "icon_05",
      "armor": "icon_06",
      "potion": "icon_08",
      "material": "icon_10",
      "quest": "icon_12"
    };
    
    return iconMap[item.type] || "icon_11";
  }
}

window.PlayerManager = PlayerManager;