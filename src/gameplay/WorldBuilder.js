import { terrainKey, label } from "../art/Assets.js";
export class WorldBuilder {
  constructor(scene) {
    this.scene = scene;
    this.level = scene.level;
    this.palette = scene.palette;
    this.static = scene.physics.add.staticGroup();
    this.movers = scene.physics.add.group({
      allowGravity: false,
      immovable: true,
    });
    this.moving = [];
    this.springs = [];
    this.bubbles = [];
    this.decor = [];
    this.livingProps = [];
    this.platforms = [];
    this.build();
  }
  platform(x, y, width, height = 75, oneWay = false) {
    const s = this.scene;
    const body = this.static
      .create(x + width / 2, y + height / 2, "particle")
      .setVisible(false);
    body.setDisplaySize(width, height).refreshBody();
    body.oneWay = oneWay;
    const art = s.add
      .image(x, y, terrainKey(s, this.palette, width, height))
      .setOrigin(0)
      .setDepth(8);
    this.platforms.push({ x, y, width, height, oneWay, body });
    this.decor.push(art);
    return body;
  }
  mover(x, y, width = 160, range = 110, axis = "x", period = 4300, phase = 0) {
    const s = this.scene;
    const b = this.movers
      .create(x, y + 16, "particle")
      .setVisible(false)
      .setDisplaySize(width, 32);
    b.body.setSize(12, 12);
    b.body.setAllowGravity(false).setImmovable(true).setFriction(1, 1);
    b.oneWay = true;
    const art = s.add
      .image(x - width / 2, y, terrainKey(s, this.palette, width, 45))
      .setOrigin(0)
      .setDepth(9);
    this.moving.push({
      b,
      art,
      x,
      y: y + 16,
      width,
      range,
      axis,
      period,
      phase,
    });
    return b;
  }
  spring(x, y) {
    const art = this.scene.add
      .image(x, y, "spring")
      .setOrigin(0.5, 1)
      .setDisplaySize(90, 37)
      .setDepth(15);
    this.springs.push({ x, y, art, last: -1000 });
  }
  hazard(x, y, range = 100) {
    if (!this.scene.enemiesEnabled) return;
    const art = this.scene.add
      .image(x, y, "tam-bot")
      .setDisplaySize(64, 64)
      .setDepth(18);
    this.bubbles.push({ art, x, y, range, phase: x * 0.01 });
  }
  coins(x, y, count = 5, step = 52, arc = 0) {
    for (let i = 0; i < count; i++)
      this.scene.addCollectible(
        x + i * step,
        y - Math.sin((i / (count - 1 || 1)) * Math.PI) * arc,
      );
  }
  prop(x, y, scale = 1) {
    const art = this.scene.add
      .image(x, y, `plant-${this.palette.key}`)
      .setOrigin(0.5, 1)
      .setScale(scale * 0.64)
      .setDepth(7);
    this.decor.push(art);
    this.livingProps.push({ art, phase: x * 0.012 });
    if (this.palette.key === "sky") {
      const rotor = this.scene.add
        .image(x, y - 130 * scale * 0.64, "fan-rotor")
        .setScale(scale * 0.64 * 0.65)
        .setDepth(8);
      this.decor.push(rotor);
      this.livingProps.push({ art: rotor, phase: x * 0.012, rotor: true });
    }
  }
  build() {
    const l = this.level;
    const safe = (x) =>
      x < 1800 ||
      l.challenges.some((a) => x < a + 1600 && x + 1200 > a - 500) ||
      l.checkpoints.some((a) => x < a + 500 && x + 1200 > a - 500) ||
      x + 1200 > l.length - 1000;
    for (let x = 0, i = 0; x < l.length; x += 1200, i++) {
      let pattern = (i + l.id * 2) % 5;
      if (safe(x)) pattern = 0;
      if (pattern === 0) {
        this.platform(x, 650, Math.min(1200, l.length - x), 130);
        if (!safe(x)) {
          this.platform(x + 340, 538, 180, 55, true);
          this.platform(x + 620, 442, 180, 55, true);
          this.coins(x + 350, 500, 4, 48);
          this.coins(x + 640, 405, 3, 50);
          this.scene.addCollectible(x + 730, 370, true);
          this.hazard(x + 930, 622, 90);
        } else if (
          !l.challenges.some((a) => x < a + 1600 && x + 1200 > a - 400)
        ) {
          this.coins(x + 240, 608, 8, 95, 28);
        }
      }
      if (pattern === 1) {
        this.platform(x, 650, 390, 130);
        this.platform(x + 830, 650, 370, 130);
        this.mover(x + 600, 586, 175, 140, "x", 5100);
        this.coins(x + 390, 512, 6, 70, 50);
        this.coins(x + 900, 603, 3, 55);
      }
      if (pattern === 2) {
        this.platform(x, 650, 430, 130);
        this.platform(x + 710, 650, 490, 130);
        this.platform(x + 500, 557, 145, 58, true);
        this.spring(x + 160, 650);
        this.platform(x + 290, 445, 180, 55, true);
        this.platform(x + 600, 390, 170, 55, true);
        this.coins(x + 300, 405, 4, 47);
        this.scene.addCollectible(x + 690, 345, true);
        this.coins(x + 450, 499, 5, 55, 20);
      }
      if (pattern === 3) {
        this.platform(x, 650, 400, 130);
        this.platform(x + 400, 568, 360, 210);
        this.platform(x + 760, 650, 440, 130);
        this.coins(x + 410, 523, 6, 60, 12);
        this.hazard(x + 985, 620, 80);
        this.platform(x + 50, 523, 140, 45, true);
        this.prop(x + 610, 568, 0.9);
      }
      if (pattern === 4) {
        this.platform(x, 650, 330, 130);
        this.platform(x + 965, 650, 235, 130);
        this.platform(x + 405, 575, 160, 55, true);
        this.platform(x + 645, 502, 165, 55, true);
        this.mover(x + 892, 567, 150, 34, "y", 3300);
        this.coins(x + 410, 529, 3, 58, 12);
        this.coins(x + 650, 458, 3, 58, 12);
        this.coins(x + 870, 489, 3, 40, 8);
      }
      if (pattern !== 4) this.prop(x + 40, 650, 0.75 + (i % 3) * 0.14);
      if (
        pattern === 0 &&
        !l.challenges.some((a) => Math.abs(x + 1040 - a) < 1700)
      )
        this.prop(x + 1040, 650, 1.1);
    }
    // Teach one action at a time in the opening, with an optional upper route.
    this.platform(780, 550, 180, 55, true);
    this.platform(1100, 473, 180, 55, true);
    this.coins(802, 510, 3, 52);
    this.coins(1120, 432, 3, 52);
    this.scene.addCollectible(1230, 390, true);
    this.mover(1710, 560, 180, 95, "x", 5200);
    this.coins(1670, 510, 3, 45);
    this.hazard(2190, 620, 65);
    if (l.id === 0) {
      label(this.scene, 380, 480, "با کلیدهای چپ و راست حرکت کن", {
        width: 390,
        size: 23,
        color: "#245d60",
        bg: "#f8fff2ed",
      });
      label(this.scene, 960, 353, "با فاصله بپر؛ نگه‌دار تا بالاتر بروی", {
        width: 470,
        size: 22,
        color: "#245d60",
        bg: "#f8fff2ed",
      });
    }
    for (const x of l.checkpoints) this.scene.addCheckpoint(x, 650);
    this.scene.addCheckpoint(90, 650, true);
    this.goal = this.scene.add
      .image(l.length - 240, 650, `goal-${this.palette.key}`)
      .setOrigin(0.5, 1)
      .setDisplaySize(210, 250)
      .setDepth(17);
    label(this.scene, l.length - 240, 359, "پایان مسیر؛ به ایستگاه برس", {
      width: 340,
      size: 23,
      color: this.palette.key === "cavern" ? "#f0f4ff" : "#264e59",
      bg: this.palette.key === "cavern" ? "#26435de8" : "#f7fff2ed",
    });
  }
  update(time, dt) {
    for (const m of this.moving) {
      const a = ((time + m.phase) / m.period) * Math.PI * 2;
      const speed = (m.range * 2 * Math.PI) / (m.period / 1000);
      m.b.body.setVelocity(
        m.axis === "x" ? Math.cos(a) * speed : 0,
        m.axis === "y" ? Math.cos(a) * speed : 0,
      );
      m.art.setPosition(m.b.x - m.width / 2, m.b.y - 16);
    }
    for (const h of this.bubbles) {
      h.art.x = h.x + Math.sin(time / 1300 + h.phase) * h.range;
      h.art.y = h.y + Math.sin(time / 320 + h.phase) * 4;
      h.art.rotation = Math.sin(time / 700 + h.phase) * 0.12;
    }
    const cam = this.scene.cameras.main;
    for (const art of this.decor)
      art.visible = art.x > cam.scrollX - 1500 && art.x < cam.scrollX + 1450;
    for (const prop of this.livingProps) {
      if (!prop.art.visible) continue;
      prop.art.rotation = this.scene.progress.settings.reducedMotion
        ? 0
        : prop.rotor
          ? time / 850 + prop.phase
          : Math.sin(time / 1900 + prop.phase) * 0.025;
    }
  }
  collisionFilter(player, platform) {
    if (!platform.oneWay) return true;
    return (
      player.body.velocity.y >= platform.body.velocity.y - 5 &&
      player.body.prev.y + player.body.height <= platform.body.top + 18
    );
  }
}
