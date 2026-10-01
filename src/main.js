import { DisplaySystem } from "./gameplay/DisplaySystem.js";
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
const wallFlag = new URLSearchParams(location.search).get("wall");
if (wallFlag === "1" || wallFlag === "0") progress.setSetting("wallMode", wallFlag === "1");
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
      g.display = new DisplaySystem(g);
      g.audio = audio;
      g.inputSystem = new InputSystem(() => {
        const s = g.scene.getScene("Level");
        if (s?.scene.isActive()) s.pause();
        else if (s?.isPaused && g.ui.modal === "pause") s.resume();
      });
      g.ui = new UISystem(g);
    },
    postBoot(g) { g.display.start(); },
  },
});
window.addEventListener("pagehide", () => audio.pause(true));

if (GAME.debug) window.__bahramGame = game;
