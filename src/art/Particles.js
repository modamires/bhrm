export class Particles {
  constructor(scene) {
    this.scene = scene;
    this.pool = [];
  }
  burst(x, y, count = 10, tint = 0xffe29d, speed = 160) {
    if (this.scene.progress.settings.reducedMotion) count = Math.min(3, count);
    for (let i = 0; i < count; i++) {
      if (this.pool.length >= 110) break;
      const a = Math.random() * Math.PI * 2,
        s = 30 + Math.random() * speed;
      const sprite = this.scene.add
        .image(x, y, "particle")
        .setDepth(45)
        .setTint(tint)
        .setScale(0.3 + Math.random() * 0.5);
      this.pool.push({
        sprite,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 70,
        life: 0.4 + Math.random() * 0.35,
        max: 0.8,
      });
    }
  }
  update(dt) {
    for (let i = this.pool.length - 1; i >= 0; i--) {
      const p = this.pool[i];
      p.life -= dt;
      if (p.life <= 0) {
        p.sprite.destroy();
        this.pool.splice(i, 1);
        continue;
      }
      p.vy += 240 * dt;
      p.sprite.x += p.vx * dt;
      p.sprite.y += p.vy * dt;
      p.sprite.rotation += dt * 3;
      p.sprite.alpha = Math.min(1, p.life * 2);
    }
  }
}
