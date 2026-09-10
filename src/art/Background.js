const wrap = (x, width) => ((x % width) + width) % width;
export class Background {
  constructor(scene, p) {
    this.scene = scene;
    this.palette = p;
    this.sky = scene.add
      .image(640, 360, `sky-${p.key}`)
      .setScrollFactor(0)
      .setDepth(-40);
    this.scenery = [];
    this.layers = [];
    if (scene.textures.exists(`scenery-${p.key}`)) {
      // Mirrored neighbours meet at identical edge pixels. Only three reusable
      // panorama sprites are needed, even for the longest level.
      for (let i = 0; i < 3; i++)
        this.scenery.push(
          scene.add
            .image(0, -126, `scenery-${p.key}`)
            .setOrigin(0)
            .setDisplaySize(1404, 936)
            .setScrollFactor(0)
            .setDepth(-35),
        );
    } else {
      for (let i = 0; i < 3; i++)
        this.layers.push(
          scene.add
            .tileSprite(640, 360, 1280, 720, `bg-${p.key}-${i}`)
            .setScrollFactor(0)
            .setDepth(-35 + i)
            .setAlpha(i === 2 ? 0.45 : 0.8),
        );
    }
    this.clouds = Array.from({ length: 4 }, (_, i) =>
      scene.add
        .image(0, 90 + (i % 3) * 79, "drift-cloud")
        .setScrollFactor(0)
        .setDepth(-23)
        .setScale(0.44 + i * 0.16)
        .setAlpha(p.key === "cavern" ? 0.16 : 0.28),
    );
    this.motes = Array.from({ length: 18 }, (_, i) =>
      scene.add
        .image(0, 0, i % 5 === 0 ? "butterfly" : "petal")
        .setScrollFactor(0)
        .setDepth(i % 5 === 0 ? -4 : -20)
        .setScale(i % 5 === 0 ? 0.38 : 0.4 + (i % 3) * 0.1)
        .setAlpha(i % 5 === 0 ? 0.82 : 0.55)
        .setTint(p.key === "cavern" ? 0xc6efff : 0xffffff),
    );
    this.update(0);
  }
  update(time) {
    const x = this.scene.cameras.main.scrollX;
    const still = this.scene.progress?.settings.reducedMotion;
    const drift = still ? 0 : time;
    const distance = x * 0.085;
    const first = Math.floor(distance / 1404);
    for (let i = 0; i < this.scenery.length; i++) {
      const tile = first + i;
      this.scenery[i].setX(tile * 1404 - distance).setFlipX(tile % 2 !== 0);
    }
    this.layers.forEach((l, i) => (l.tilePositionX = x * (0.1 + i * 0.16)));
    this.clouds.forEach(
      (cloud, i) =>
        (cloud.x = wrap(i * 443 - x * 0.19 + drift * 0.008, 1710) - 220),
    );
    this.motes.forEach((m, i) => {
      const butterfly = i % 5 === 0;
      m.x =
        wrap(
          i * 147 -
            x * (butterfly ? 0.32 : 0.23) +
            drift * (butterfly ? 0.021 : 0.008),
          1420,
        ) - 70;
      m.y =
        135 +
        ((i * 79) % 402) +
        (still
          ? 0
          : Math.sin(time / (butterfly ? 970 : 1800) + i) *
            (butterfly ? 22 : 12));
      if (butterfly)
        m.scaleX = still
          ? 0.38
          : 0.13 + Math.abs(Math.sin(time / 105 + i)) * 0.25;
      else
        m.rotation = still
          ? i * 0.8
          : i * 0.8 + Math.sin(time / 1300 + i) * 0.6;
    });
  }
}
