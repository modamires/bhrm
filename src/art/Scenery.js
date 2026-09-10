export const SCENERY = {
  valley: new URL("../../assets/worlds/tam-valley.webp", import.meta.url).href,
  cavern: new URL(
    "../../assets/worlds/tam-crystal-garden.webp",
    import.meta.url,
  ).href,
  sky: new URL("../../assets/worlds/tam-sky-workshop.webp", import.meta.url)
    .href,
};
export function preloadScenery(scene) {
  for (const [key, url] of Object.entries(SCENERY))
    scene.load.image(`scenery-${key}`, url);
}
