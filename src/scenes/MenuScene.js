import { PALETTES } from "../config.js";
import { terrainKey } from "../art/Assets.js";
import { Background } from "../art/Background.js";
import { CHARACTER_RENDER } from "../art/Bahram.js";
export class MenuScene extends Phaser.Scene {
  constructor() {
    super("Menu");
  }
  create() {
    this.game.display?.applyCamera(this);
    const p = PALETTES[0];
    this.progress = this.game.progress;
    this.background = new Background(this, p);
    this.add
      .image(283, 580, terrainKey(this, p, 440, 145))
      .setOrigin(0.5, 0)
      .setDepth(5)
      .setAngle(-3);
    this.add
      .image(325, 522, terrainKey(this, p, 255, 76))
      .setOrigin(0.5, 0)
      .setDepth(6)
      .setAngle(2);
    this.add
      .image(115, 572, `plant-${p.key}`)
      .setOrigin(0.5, 1)
      .setScale(1)
      .setDepth(7);
    this.add
      .image(477, 537, `plant-${p.key}`)
      .setOrigin(0.5, 1)
      .setScale(0.95)
      .setDepth(5);
    this.add.image(314, 519, "shadow").setScale(1.8).setDepth(7);
    this.hero = this.add
      .sprite(316, 543, "player-idle-0")
      .setOrigin(0.5, 1)
      .setScale(CHARACTER_RENDER.menuScale)
      .setDepth(10)
      .play("player-idle");
    this.sparks = [];
    for (let i = 0; i < 5; i++)
      this.sparks.push(
        this.add
          .image(172 + i * 72, 260 - Math.sin(i * 0.7) * 70, "travel-token")
          .setDepth(8)
          .setScale(0.52 + (i % 2) * 0.16),
      );
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0xf5fff7, 0.86).fillRoundedRect(651, 94, 581, 472, 46);
    this.game.ui.menu();
    this.game.audio.pause(false);
    this.game.audio.setTrack(0);
    this.game.inputSystem.active = false;
  }
  update(time) {
    this.background.update(time);
    if (!this.progress.settings.reducedMotion)
      this.sparks.forEach(
        (s, i) =>
          (s.y = 260 - Math.sin(i * 0.7) * 70 + Math.sin(time / 900 + i) * 9),
      );
  }
}
