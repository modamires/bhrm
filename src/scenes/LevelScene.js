import { REWARDS } from "../config.js";
import { LEVELS, PALETTES, PHYSICS as P, GAME, clamp, fa } from "../config.js";
import { Background } from "../art/Background.js";
import { Particles } from "../art/Particles.js";
import { PlayerController } from "../gameplay/PlayerController.js";
import { WorldBuilder } from "../gameplay/WorldBuilder.js";
import { EducationSystem } from "../gameplay/EducationSystem.js";
import { installDebug } from "../utils/debug.js";
export class LevelScene extends Phaser.Scene {
  constructor() {
    super("Level");
  }
  init(data) {
    this.level = LEVELS[data.level ?? 0];
    this.palette = PALETTES[this.level.palette];
    this.runSeed = data.seed ?? Math.floor(Math.random() * 100);
    this.stats = {
      score: 0,
      collected: 0,
      total: 0,
      solved: 0,
      attempts: 0,
      wrong: 0,
      firstTry: 0,
      streak: 0,
      bestStreak: 0,
      respawns: 0,
      secrets: 0,
    };
    this.elapsed = 0;
    this.finishing = false;
    this.bonusUntil = 0;
    this.invulnerableUntil = 0;
    this.collectibles = [];
    this.checkpoints = [];
    this.hudAt = 0;
    this.progressMax = 0;
    this.isPaused = false;
    this.lastToast = -10000;
  }
  create() {
    this.progress = this.game.progress;
    this.enemiesEnabled = this.progress.settings.enemies;
    this.audio = this.game.audio;
    this.ui = this.game.ui;
    this.controls = this.game.inputSystem;
    this.physics.world.setBounds(0, -100, this.level.length, 1080);
    this.physics.world.checkCollision.down = false;
    this.physics.world.TILE_BIAS = 32;
    this.background = new Background(this, this.palette);
    this.particles = new Particles(this);
    this.world = new WorldBuilder(this);
    this.education = new EducationSystem(this);
    this.player = new PlayerController(this, 165, 570);
    this.physics.add.collider(
      this.player.sprite,
      this.world.static,
      undefined,
      (p, o) => this.world.collisionFilter(p, o),
    );
    this.physics.add.collider(
      this.player.sprite,
      this.world.movers,
      undefined,
      (p, o) => this.world.collisionFilter(p, o),
    );
    this.cameras.main.setBounds(0, 0, this.level.length, 720);
    this.cameras.main.scrollX = 0;
    this.cameras.main.setRoundPixels(false);
    this.shadow = this.add.image(165, 649, "shadow").setDepth(7).setScale(0.9);
    this.respawn = { x: 180, y: 590 };
    this.controls.clear();
    this.controls.active = true;
    this.ui.hud(this);
    this.audio.setTrack(this.level.id);
    this.audio.pause(false);
    if (!this.progress.settings.reducedMotion) this.cameras.main.fadeIn(350);
    this.events.once("shutdown", () => {
      this.controls.clear();
      this.controls.active = false;
      this.ui.clearTransient();
    });
    if (GAME.debug) installDebug(this);
  }
  addCollectible(x, y, secret = false) {
    const art = this.add
      .image(x, y, "travel-token")
      .setScale(secret ? 0.8 : 0.46)
      .setDepth(13);
    if (secret) art.setTint(0xc8eaff);
    this.collectibles.push({
      art,
      x,
      y,
      secret,
      collected: false,
      phase: x * 0.02,
    });
    this.stats.total++;
  }
  addCheckpoint(x, y, initial = false) {
    const art = this.add
      .image(x, y, `checkpoint-${this.palette.key}`)
      .setOrigin(0.5, 1)
      .setDisplaySize(86, 119)
      .setDepth(14);
    if (!initial) art.setAlpha(0.72);
    this.checkpoints.push({ x, y, art, active: initial });
  }
  feedback(msg, good = true) {
    if (this.time.now - this.lastToast < 900) return;
    this.lastToast = this.time.now;
    this.ui.feedback(msg, good);
  }
  respawnPlayer() {
    if (this.finishing || this.time.now < this.invulnerableUntil) return;
    this.stats.respawns++;
    this.player.reset(this.respawn.x, this.respawn.y);
    this.controls.clear();
    this.invulnerableUntil = this.time.now + 1300;
    this.particles.burst(this.player.x, this.player.y - 30, 13, 0xd3fff0, 160);
    this.feedback("از همین‌جا ادامه بده ✦", false);
    this.education.lastJump = false;
    for (const z of this.education.zones) z.lastChoice = -1;
  }
  pause() {
    if (this.isPaused || this.finishing) return;
    this.isPaused = true;
    this.controls.clear();
    this.controls.active = false;
    this.audio.pause(true);
    this.scene.pause();
    this.ui.pauseMenu(this);
  }
  resume() {
    this.isPaused = false;
    this.controls.clear();
    this.controls.active = true;
    this.player.previousJump = false;
    this.audio.pause(false);
    this.scene.resume();
    this.ui.hud(this, false);
  }
  complete() {
    if (this.finishing) return;
    if (this.stats.solved < this.education.total) {
      this.feedback("اول معماهای مسیر را کامل کن", false);
      return;
    }
    this.finishing = true;
    this.controls.clear();
    this.controls.active = false;
    this.player.sprite.body.setAccelerationX(0);
    this.player.sprite.body.setVelocityX(0);
    this.audio.effect("complete");
    this.ui.celebrate(true);
    this.particles.burst(this.player.x, this.player.y - 90, 45, 0xffe9a0, 310);
    const accuracy = this.stats.attempts
      ? Math.round(
          ((this.stats.attempts - this.stats.wrong) / this.stats.attempts) *
            100,
        )
      : 100;
    const stars =
      1 +
      (accuracy >= 65 ? 1 : 0) +
      (this.stats.collected / this.stats.total >= 0.45 ? 1 : 0);
    const result = {
      ...this.stats,
      accuracy,
      stars,
      seconds: Math.round(this.elapsed / 1000),
    };
    this.progress.complete(this.level.id, result);
    this.time.delayedCall(1400, () => {
      this.scene.pause();
      this.audio.pause(true);
      this.ui.clearTransient();
      this.ui.results(this, result);
    });
  }
  update(time, delta) {
    const dt = Math.min(delta, 35) / 1000;
    this.elapsed += Math.min(delta, 100);
    let input = this.controls.read();
    if (this.debugTask) this.debugTask(time, delta);
    input = this.controls.read();
    if (this.finishing) input = { left: false, right: false, jump: false };
    this.player.update(time, input);
    this.world.update(time, dt);
    this.education.update(time, input);
    this.particles.update(dt);
    const p = this.player,
      b = p.sprite.body;
    // A small velocity-based look-ahead; exponential smoothing stays consistent across frame rates.
    let target = clamp(
      p.x - 530 + b.velocity.x * 0.34,
      0,
      this.level.length - 1280,
    );
    const arena = this.education.zones.find(
      (z) => !z.solved && p.x > z.x + 20 && p.x < z.x + 1210,
    );
    if (arena) target = clamp(arena.x - 65, 0, this.level.length - 1280);
    const cam = this.cameras.main;
    cam.scrollX += (target - cam.scrollX) * (1 - Math.exp(-dt * 6));
    this.background.update(time);
    this.progressMax = Math.max(this.progressMax, p.x);
    this.shadow
      .setPosition(p.x, 650)
      .setAlpha(clamp(1 - Math.abs(b.bottom - 650) / 240, 0, 0.6));
    if (!this.finishing) {
      if (p.y > 870) this.respawnPlayer();
      for (const item of this.collectibles) {
        if (item.collected) continue;
        const near = Math.abs(item.x - p.x) < 780;
        item.art.visible = near;
        if (!near) continue;
        item.art.y =
          item.y +
          (this.progress.settings.reducedMotion
            ? 0
            : Math.sin(time / 600 + item.phase) * 5);
        if (
          Math.abs(item.x - p.x) < 40 &&
          Math.abs(item.art.y - b.center.y) < b.halfHeight + 16
        ) {
          item.collected = true;
          item.art.destroy();
          this.stats.collected++;
          this.stats.score +=
            (item.secret ? REWARDS.secret : REWARDS.token) *
            (time < this.bonusUntil ? 2 : 1);
          if (item.secret) {
            this.stats.secrets++;
            this.feedback("یک نشانِ سفرِ کمیاب پیدا کردی!", true);
          }
          this.audio.effect(item.secret ? "secret" : "collect");
          this.particles.burst(
            item.x,
            item.y,
            item.secret ? 16 : 6,
            0xffe3a0,
            100,
          );
          p.reward(time);
        }
      }
      for (const cp of this.checkpoints)
        if (
          !cp.active &&
          Math.abs(p.x - cp.x) < 54 &&
          Math.abs(b.bottom - cp.y) < 90
        ) {
          cp.active = true;
          cp.art.setAlpha(1).setTint(0xfff1b5);
          this.respawn = { x: cp.x + 50, y: cp.y - 60 };
          this.audio.effect("checkpoint");
          this.particles.burst(cp.x, cp.y - 78, 22, 0xcaffcf, 180);
          this.feedback("ایستگاه ثبت شد؛ از اینجا ادامه می‌دهی", true);
        }
      for (const spring of this.world.springs)
        if (
          time - spring.last > 400 &&
          b.velocity.y >= 0 &&
          Math.abs(p.x - spring.x) < 48 &&
          b.bottom >= spring.y - 24 &&
          b.bottom < spring.y + 15
        ) {
          spring.last = time;
          b.setVelocityY(-830);
          this.player.lastGround = -Infinity;
          this.audio.effect("bounce");
          this.particles.burst(spring.x, spring.y - 18, 10, 0xffebbd, 160);
        }
      for (const bubble of this.world.bubbles)
        if (
          this.enemiesEnabled &&
          Math.hypot(
            bubble.art.x - clamp(bubble.art.x, b.left, b.right),
            bubble.art.y - clamp(bubble.art.y, b.top, b.bottom),
          ) < 21
        ) {
          this.respawnPlayer();
          break;
        }
      if (p.x > this.level.length - 295 && b.bottom > 480) this.complete();
    }
    p.sprite.alpha =
      time < this.invulnerableUntil ? 0.6 + Math.sin(time / 65) * 0.25 : 1;
    if (time > this.hudAt) {
      this.hudAt = time + 120;
      this.ui.updateHud(this);
      if (GAME.debug) this.updateDebug?.();
    }
  }
}
