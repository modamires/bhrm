import { BAHRAM, BAHRAM_FALLBACK } from "./BahramFrames.js";
export const CHARACTER_RENDER = Object.freeze({
  scale: 0.75 / BAHRAM.frame.resolution,
  menuScale: 1.7 / BAHRAM.frame.resolution,
  bodyUnits: BAHRAM.frame.resolution / 0.75,
  frameWidth: BAHRAM.frame.width,
  soleY: BAHRAM.frame.footY,
  footOffset:
    ((BAHRAM.frame.height - BAHRAM.frame.footY) * 0.75) /
    BAHRAM.frame.resolution,
});

export function preloadBahram(scene) {
  scene.load.image(
    "bahram-atlas",
    new URL("../../assets/characters/bahram/bahram-atlas.png", import.meta.url)
      .href,
  );
  // A small embedded standing pose keeps the character visible if the atlas
  // cannot be fetched. Production animation uses the articulated atlas.
  scene.load.image("bahram-fallback", BAHRAM_FALLBACK);
}

export function createBahram(scene) {
  const { width, height, columns } = BAHRAM.frame;
  const hasAtlas = scene.textures.exists("bahram-atlas");
  const source = scene.textures
    .get(hasAtlas ? "bahram-atlas" : "bahram-fallback")
    .getSourceImage();
  for (const [state, animation] of Object.entries(BAHRAM.animations)) {
    for (let f = 0; f < animation.count; f++) {
      const index = animation.start + f;
      const texture = scene.textures.createCanvas(
        `player-${state}-${f}`,
        width,
        height,
      );
      texture.context.drawImage(
        source,
        hasAtlas ? (index % columns) * width : 0,
        hasAtlas ? Math.floor(index / columns) * height : 0,
        width,
        height,
        0,
        0,
        width,
        height,
      );
      texture.refresh();
    }
    scene.anims.create({
      key: `player-${state}`,
      frames: Array.from({ length: animation.count }, (_, f) => ({
        key: `player-${state}-${f}`,
      })),
      frameRate: animation.fps,
      repeat: animation.repeat,
    });
  }
  // Frame textures are shared by every scene. The packed source is no longer
  // needed on the GPU after slicing, keeping the character's memory bounded.
  if (hasAtlas) scene.textures.remove("bahram-atlas");
}
