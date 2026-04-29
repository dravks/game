class CityLayout {
  constructor(scene) {
    this.scene = scene;
  }

  drawGround(width, height) {
    const scene = this.scene;
    
    scene.add.rectangle(width / 2, height / 2, width, height, 0x6d9961);
    scene.add.rectangle(width / 2, height / 2, width - 100, height - 100, 0x79a86b);
    scene.add.rectangle(width / 2, height / 2, 300, 180, 0x90b97d, 0.9);
  }

  drawRoads(width, height) {
    const scene = this.scene;
    const roadColor = 0xbea77c;
    const roadEdge = 0x8c7552;

    scene.add.rectangle(width / 2, height / 2, 150, height - 80, roadColor);
    scene.add.rectangle(width / 2, height / 2, width - 120, 120, roadColor);
    scene.add.rectangle(width / 2, height / 2 + 10, 220, 180, 0xd2c098);

    scene.add.rectangle(width / 2 - 70, height / 2, 6, height - 80, roadEdge, 0.65);
    scene.add.rectangle(width / 2 + 70, height / 2, 6, height - 80, roadEdge, 0.65);
    scene.add.rectangle(width / 2, height / 2 - 57, width - 120, 6, roadEdge, 0.65);
    scene.add.rectangle(width / 2, height / 2 + 57, width - 120, 6, roadEdge, 0.65);
  }

  createCollisionBlocks() {
    const scene = this.scene;
    scene.obstacles = scene.physics.add.staticGroup();

    this.createStaticBlock(160, 120, 185, 110);
    this.createStaticBlock(780, 120, 185, 110);
    this.createStaticBlock(160, 430, 185, 110);
    this.createStaticBlock(780, 430, 185, 110);
    this.createStaticBlock(480, 115, 235, 118);

    this.createStaticBlock(80, 90, 44, 50);
    this.createStaticBlock(880, 90, 44, 50);
    this.createStaticBlock(70, 510, 44, 50);
    this.createStaticBlock(890, 510, 44, 50);
    this.createStaticBlock(320, 130, 44, 50);
    this.createStaticBlock(640, 130, 44, 50);
    this.createStaticBlock(310, 455, 44, 50);
    this.createStaticBlock(650, 455, 44, 50);

    this.createStaticBlock(360, 80, 34, 24);
    this.createStaticBlock(610, 80, 34, 24);
    this.createStaticBlock(345, 485, 34, 24);
    this.createStaticBlock(625, 485, 34, 24);

    this.createStaticBlock(344, 210, 126, 28);
    this.createStaticBlock(652, 210, 126, 28);
    this.createStaticBlock(344, 350, 126, 28);
    this.createStaticBlock(652, 350, 126, 28);
  }

  createStaticBlock(x, y, width, height) {
    const scene = this.scene;
    const block = scene.add.rectangle(x, y, width, height, 0x000000, 0);
    scene.physics.add.existing(block, true);
    scene.obstacles.add(block);
    return block;
  }

  drawServiceAreas() {
    const scene = this.scene;
    const buildings = [
      { x: 160, y: 120, w: 170, h: 95, color: 0xb84f6a, sprite: "bld_potion", label: "Potion Merchant", scale: 0.28 },
      { x: 780, y: 120, w: 170, h: 95, color: 0x8d6a43, sprite: "bld_blacksmith", label: "Blacksmith", scale: 0.28 },
      { x: 160, y: 430, w: 170, h: 95, color: 0x5b6fb8, sprite: "bld_upgrader", label: "Upgrader", scale: 0.28 },
      { x: 780, y: 430, w: 170, h: 95, color: 0x7c5ba6, sprite: "bld_quest", label: "Quest Giver", scale: 0.28 },
      { x: 480, y: 115, w: 220, h: 105, color: 0x3f6d8a, sprite: "bld_gate", label: "Dungeon Gate", scale: 0.32 },
    ];

    buildings.forEach((b) => {
      scene.add.rectangle(b.x, b.y + 8, b.w + 22, b.h + 22, 0x223128, 0.32);
      scene.add.rectangle(b.x, b.y + 8, b.w + 4, b.h + 4, 0x162127, 0.18);
      scene.add.rectangle(b.x, b.y, b.w, b.h, 0x24322f, 0.38);

      try {
        const sprite = scene.add.image(b.x, b.y - 8, b.sprite);
        sprite.setScale(b.scale);
        sprite.setDepth(3);
      } catch (e) { /* fallback: colored rect already drawn */ }

      scene.add.rectangle(b.x, b.y + b.h / 2 - 16, 34, 32, 0x473323, 0.78);
      scene.add.rectangle(b.x, b.y - 6, b.w - 24, b.h - 30, 0xffffff, 0.05);
      
      scene.add.text(b.x, b.y - b.h / 2 - 22, b.label, {
        fontFamily: "Trebuchet MS, Arial, sans-serif",
        fontSize: "16px",
        color: "#f8f1dc",
        align: "center",
        stroke: "#0b141a",
        strokeThickness: 3,
        shadow: { offsetX: 0, offsetY: 2, color: "#081015", blur: 0, fill: true },
      }).setOrigin(0.5);
    });
  }

  drawProps() {
    this.createTree(80, 80);
    this.createTree(880, 80);
    this.createTree(70, 500);
    this.createTree(890, 500);
    this.createTree(320, 120);
    this.createTree(640, 120);
    this.createTree(310, 445);
    this.createTree(650, 445);

    this.createRock(360, 80);
    this.createRock(610, 80);
    this.createRock(345, 485);
    this.createRock(625, 485);

    this.createFenceRow(290, 210, 7);
    this.createFenceRow(598, 210, 7);
    this.createFenceRow(290, 350, 7);
    this.createFenceRow(598, 350, 7);

    this.createSign(480, 260, "Central Plaza");
    this.createSign(480, 480, "South Road");
    this.createAnvilStation(252, 414);
  }

  createTree(x, y) {
    const scene = this.scene;
    scene.add.rectangle(x, y + 16, 14, 28, 0x6a4528);
    scene.add.circle(x, y, 20, 0x2f6b3b);
    scene.add.circle(x - 14, y + 6, 12, 0x37764b);
  }

  createRock(x, y) {
    const scene = this.scene;
    scene.add.ellipse(x, y, 18, 12, 0x5a4a3a);
    scene.add.ellipse(x + 4, y - 2, 10, 6, 0x6a5a4a);
  }

  createFenceRow(x, y, count) {
    const scene = this.scene;
    const fenceWidth = 16;
    const spacing = 8;
    
    for (let i = 0; i < count; i++) {
      const fenceX = x + i * (fenceWidth + spacing);
      scene.add.rectangle(fenceX, y, fenceWidth, 4, 0x8b7355);
      scene.add.rectangle(fenceX, y - 8, 2, 16, 0x6a4528);
      scene.add.rectangle(fenceX, y + 8, 2, 16, 0x6a4528);
    }
  }

  createSign(x, y, text) {
    const scene = this.scene;
    
    scene.add.rectangle(x, y, 60, 4, 0x8b7355);
    scene.add.rectangle(x, y - 12, 40, 20, 0xd2b48c);
    scene.add.rectangle(x, y - 12, 36, 16, 0xf5deb3);
    
    scene.add.text(x, y - 12, text, {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "10px",
      color: "#654321",
      align: "center",
    }).setOrigin(0.5);
  }

  createAnvilStation(x, y) {
    const scene = this.scene;
    
    scene.add.rectangle(x, y, 40, 20, 0x2f4f4f);
    scene.add.rectangle(x, y - 6, 30, 8, 0x696969);
    scene.add.rectangle(x - 8, y - 10, 6, 4, 0x8b4513);
    scene.add.rectangle(x + 8, y - 10, 6, 4, 0x8b4513);
    
    scene.add.text(x, y - 24, "Anvil", {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "10px",
      color: "#d2b48c",
      align: "center",
    }).setOrigin(0.5);
  }
}


window.CityLayout = CityLayout;