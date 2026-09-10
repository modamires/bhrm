import { GAME, PHYSICS } from "./config.js";
import { BootScene } from "./scenes/BootScene.js";
import { MenuScene } from "./scenes/MenuScene.js";
import { LevelScene } from "./scenes/LevelScene.js";
import { ProgressSystem } from "./gameplay/ProgressSystem.js";
import { AudioSystem } from "./gameplay/AudioSystem.js";
import { InputSystem } from "./gameplay/InputSystem.js";
import { UISystem } from "./scenes/UISystem.js";
let storage;
try {
  storage = window.localStorage;
} catch {}
const progress = new ProgressSystem(storage),
  audio = new AudioSystem(progress);
await Promise.race([
  document.fonts.load("600 24px Vazirmatn"),
  new Promise((r) => setTimeout(r, 2500)),
]).catch(() => {});
if (typeof Phaser === "undefined")
  throw new Error("The bundled Phaser engine is missing.");
const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: GAME.width,
  height: GAME.height,
  backgroundColor: "#173e50",
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: false,
    powerPreference: "default",
  },
  fps: { target: 60, forceSetTimeOut: false },
  loader: { imageLoadType: "HTMLImageElement" },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: PHYSICS.gravity },
      debug: false,
      fps: 60,
      fixedStep: true,
    },
  },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { keyboard: false },
  scene: [BootScene, MenuScene, LevelScene],
  callbacks: {
    preBoot(g) {
      g.progress = progress;
      g.audio = audio;
      g.inputSystem = new InputSystem(() => {
        const s = g.scene.getScene("Level");
        if (s?.scene.isActive()) s.pause();
        else if (s?.isPaused && g.ui.modal === "pause") s.resume();
      });
      g.ui = new UISystem(g);
    },
  },
});
const resize = () => {
  document
    .getElementById("ui")
    .classList.toggle(
      "compact-ui",
      document.getElementById("game-shell").clientWidth < 950,
    );
  document.getElementById("ui").style.transform =
    `scale(${document.getElementById("game-shell").clientWidth / GAME.width})`;
};
new ResizeObserver(resize).observe(document.getElementById("game-shell"));
resize();
window.addEventListener("pagehide", () => audio.pause(true));
