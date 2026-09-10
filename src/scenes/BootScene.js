import { generateAssets, terrainKey } from "../art/Assets.js";
import { PALETTES } from "../config.js";
import { preloadBahram } from "../art/Bahram.js";
import { preloadScenery } from "../art/Scenery.js";
export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }
  preload() {
    this.load.on("progress", (value) => {
      document.getElementById("load-progress").style.width =
        `${20 + value * 70}%`;
    });
    preloadBahram(this);
    preloadScenery(this);
  }
  create() {
    generateAssets(this);
    this.game.thumbnails = PALETTES.map((p) => {
      const canvas = document.createElement("canvas");
      canvas.width = 450;
      canvas.height = 270;
      const c = canvas.getContext("2d");
      c.drawImage(
        this.textures.get(`sky-${p.key}`).getSourceImage(),
        0,
        0,
        450,
        270,
      );
      if (this.textures.exists(`scenery-${p.key}`)) {
        c.drawImage(
          this.textures.get(`scenery-${p.key}`).getSourceImage(),
          0,
          70,
          1536,
          922,
          0,
          0,
          450,
          270,
        );
      } else
        for (let i = 0; i < 3; i++) {
          c.globalAlpha = i === 2 ? 0.7 : 1;
          c.drawImage(
            this.textures.get(`bg-${p.key}-${i}`).getSourceImage(),
            0,
            0,
            1536,
            720,
            0,
            0,
            450,
            270,
          );
        }
      c.globalAlpha = 1;
      c.drawImage(
        this.textures.get(terrainKey(this, p, 310, 90)).getSourceImage(),
        -35,
        230,
      );
      c.drawImage(
        this.textures.get(`plant-${p.key}`).getSourceImage(),
        310,
        150,
        106,
        106,
      );
      c.drawImage(
        this.textures.get("player-idle-0").getSourceImage(),
        136,
        99,
        116,
        139.2,
      );
      return canvas.toDataURL("image/png");
    });
    document.getElementById("load-progress").style.width = "100%";
    document.getElementById("loading").remove();
    window.__jarqegardReady = true;
    this.scene.start("Menu");
  }
}
