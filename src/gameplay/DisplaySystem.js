import { GAME } from "../config.js";

// Keep physics in the original 1280 × 720 coordinate system. Only the render
// buffer and camera zoom grow on a wall; the scene is never stretched or cut.
export function stageLayout(width, height, wall = false) {
  const inset = wall ? Math.min(width, height) * 0.03 : 0;
  const scale = Math.max(0.05, Math.min((width - inset * 2) / GAME.width, (height - inset * 2) / GAME.height));
  return { width: GAME.width * scale, height: GAME.height * scale, scale,
    renderScale: wall ? Math.min(3, Math.max(1, Math.ceil(scale))) : 1 };
}
export class DisplaySystem {
  constructor(game) {
    this.game = game;
    this.renderScale = 1;
    this.started = false;
  }
  start() {
    this.started = true;
    const refresh = () => this.refresh();
    window.addEventListener("resize", refresh);
    document.addEventListener("fullscreenchange", refresh);
    this.observer = new ResizeObserver(refresh);
    this.observer.observe(document.documentElement);
    this.refresh();
    this.game.events.once("destroy", () => {
      window.removeEventListener("resize", refresh);
      document.removeEventListener("fullscreenchange", refresh);
      this.observer.disconnect();
    });
  }
  refresh() {
    if (!this.started) return;
    const wall = this.game.progress.settings.wallMode;
    const shell = document.getElementById("game-shell");
    const ui = document.getElementById("ui");
    const layout = stageLayout(document.documentElement.clientWidth || innerWidth, document.documentElement.clientHeight || innerHeight, wall);
    document.body.classList.toggle("wall-mode", wall);
    shell.style.width = `${layout.width}px`;
    shell.style.height = `${layout.height}px`;
    shell.style.setProperty("--stage-scale", layout.scale);
    ui.style.transform = `scale(${layout.scale})`;
    ui.classList.toggle("compact-ui", !wall && layout.width < 950);
    this.renderScale = layout.renderScale;
    const width = GAME.width * this.renderScale, height = GAME.height * this.renderScale;
    if (this.game.scale.gameSize.width !== width || this.game.scale.gameSize.height !== height)
      this.game.scale.setGameSize(width, height);
    this.game.scale.refresh();
    for (const scene of this.game.scene.scenes) if (scene.cameras?.main) this.applyCamera(scene);
    this.layout = layout;
  }
  applyCamera(scene) {
    const camera = scene.cameras.main;
    camera.setSize(GAME.width * this.renderScale, GAME.height * this.renderScale);
    camera.setOrigin(0, 0).setZoom(this.renderScale);
    // Phaser's automatic bounds assume a centered zoom origin. Our game uses
    // a top-left origin and already clamps the virtual horizontal camera.
    camera.removeBounds();
    camera.scrollY = 0;
  }
}
