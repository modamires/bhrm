import { PALETTES } from "../config.js";
import { createBahram } from "./Bahram.js";
import { generateTamObjects, generateTamWorldProps } from "./TamArt.js";
const TAU = Math.PI * 2;
function rr(c, x, y, w, h, r, color) {
  c.fillStyle = color;
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fill();
}
function oval(c, x, y, rx, ry, color) {
  c.fillStyle = color;
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, TAU);
  c.fill();
}
function line(c, pts, color, width = 2) {
  c.strokeStyle = color;
  c.lineWidth = width;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.beginPath();
  pts.forEach((p, i) => (i ? c.lineTo(...p) : c.moveTo(...p)));
  c.stroke();
}
function poly(c, pts, color) {
  c.fillStyle = color;
  c.beginPath();
  pts.forEach((p, i) => (i ? c.lineTo(...p) : c.moveTo(...p)));
  c.closePath();
  c.fill();
}
function rng(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
function texture(scene, key, w, h, draw) {
  if (scene.textures.exists(key)) return key;
  const t = scene.textures.createCanvas(key, w, h);
  draw(t.context);
  t.refresh();
  return key;
}
export function textTexture(
  scene,
  key,
  text,
  {
    size = 25,
    color = "#173e4c",
    bg = null,
    width = 260,
    height = 66,
    weight = 600,
  } = {},
) {
  return texture(scene, key, width * 2, height * 2, (c) => {
    c.scale(2, 2);
    if (bg) rr(c, 0, 0, width, height, 20, bg);
    c.direction = "rtl";
    c.font = `${weight} ${size}px Vazirmatn, Tahoma, sans-serif`;
    c.fillStyle = color;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(text, width / 2, height / 2 + 2, width - 18);
  });
}
export function label(scene, x, y, text, opts = {}) {
  const width = opts.width || 260,
    height = opts.height || 66;
  const key = `label:${text}:${JSON.stringify(opts)}`;
  textTexture(scene, key, text, { ...opts, width, height });
  return scene.add
    .image(x, y, key)
    .setDisplaySize(width, height)
    .setDepth(opts.depth || 20);
}
function spark(c, x, y, r, color) {
  poly(
    c,
    [
      [x, y - r],
      [x + r * 0.33, y - r * 0.3],
      [x + r, y],
      [x + r * 0.33, y + r * 0.3],
      [x, y + r],
      [x - r * 0.33, y + r * 0.3],
      [x - r, y],
      [x - r * 0.33, y - r * 0.3],
    ],
    color,
  );
}
export function generateAssets(scene) {
  createBahram(scene);
  generateTamObjects(scene);
  texture(scene, "particle", 12, 12, (c) => {
    spark(c, 6, 6, 6, "#fff");
  });
  texture(scene, "shadow", 100, 24, (c) => {
    const g = c.createRadialGradient(50, 12, 0, 50, 12, 50);
    g.addColorStop(0, "#173e4c44");
    g.addColorStop(1, "#173e4c00");
    oval(c, 50, 12, 50, 12, g);
  });
  texture(scene, "spring", 140, 58, (c) => {
    line(
      c,
      [
        [35, 47],
        [95, 40],
        [40, 32],
        [98, 24],
      ],
      "#638c91",
      6,
    );
    rr(c, 8, 6, 124, 19, 10, "#fff0af");
    rr(c, 5, 0, 130, 15, 8, "#eeb66b");
    line(
      c,
      [
        [51, 8],
        [65, 2],
        [79, 8],
      ],
      "#fff7d1",
      3,
    );
    rr(c, 18, 46, 104, 10, 5, "#436e7c");
  });
  for (const p of PALETTES) generateWorld(scene, p);
}
function generateWorld(scene, p) {
  const cave = p.key === "cavern",
    sky = p.key === "sky";
  texture(scene, `sky-${p.key}`, 1280, 720, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 720);
    g.addColorStop(0, p.sky[0]);
    g.addColorStop(1, p.sky[1]);
    c.fillStyle = g;
    c.fillRect(0, 0, 1280, 720);
    const r = c.createRadialGradient(900, 175, 10, 900, 175, 440);
    r.addColorStop(0, cave ? "#bfbcf12b" : "#ffffdd77");
    r.addColorStop(1, "#ffffff00");
    c.fillStyle = r;
    c.fillRect(0, 0, 1280, 720);
  });
  if (!scene.textures.exists(`scenery-${p.key}`))
    for (let layer = 0; layer < 3; layer++)
      texture(scene, `bg-${p.key}-${layer}`, 1536, 720, (c) => {
        // Paint wrapped neighbors so clouds and silhouettes meet at tile seams.
        for (const offset of [-1536, 0, 1536]) {
          c.save();
          c.translate(offset, 0);
          const random = rng(407 + layer * 701);
          const base = [p.far, p.mid, p.front][layer];
          if (!cave) {
            for (let i = 0; i < 10; i++) {
              let x = random() * 1536,
                y = 60 + random() * 220,
                s = 30 + random() * 70;
              c.globalAlpha = 0.35 - layer * 0.06;
              oval(c, x, y, s * 1.6, s * 0.36, "#fff");
              oval(c, x - s * 0.25, y - s * 0.24, s * 0.65, s * 0.4, "#fff");
              oval(c, x + s * 0.45, y - s * 0.1, s * 0.55, s * 0.34, "#fff");
            }
            c.globalAlpha = 1;
          }
          if (cave) {
            for (let i = 0; i < 12; i++) {
              const x = i * 140 + random() * 50,
                h = 80 + random() * 200;
              poly(
                c,
                [
                  [x - 90, -10],
                  [x + 100, -10],
                  [x + 65, h * 0.7],
                  [x + 12, h],
                  [x - 15, h * 0.5],
                ],
                base,
              );
              poly(
                c,
                [
                  [x + 12, h],
                  [x + 15, -10],
                  [x + 100, -10],
                  [x + 65, h * 0.7],
                ],
                p.sky[0],
              );
            }
            for (let i = 0; i < 14; i++) {
              const x = i * 120,
                y = 500 + random() * 170;
              poly(
                c,
                [
                  [x - 60, 720],
                  [x - 24, y],
                  [x + 16, y - 70],
                  [x + 60, y],
                  [x + 88, 720],
                ],
                base,
              );
              poly(
                c,
                [
                  [x + 16, y - 70],
                  [x + 10, 720],
                  [x + 88, 720],
                  [x + 60, y],
                ],
                p.mid,
              );
            }
          } else if (sky) {
            for (let i = 0; i < 7; i++) {
              let x = i * 250 + random() * 80,
                y = 330 + random() * 200;
              oval(c, x, y, 140, 22, base);
              poly(
                c,
                [
                  [x - 100, y],
                  [x + 95, y],
                  [x + 40, y + 70],
                  [x - 30, y + 95],
                ],
                base,
              );
              line(
                c,
                [
                  [x + 30, y - 90],
                  [x + 30, y],
                ],
                base,
                4,
              );
              oval(c, x + 30, y - 90, 5, 5, base);
              for (let k = 0; k < 3; k++) {
                const a = (k * TAU) / 3;
                line(
                  c,
                  [
                    [x + 30, y - 90],
                    [x + 30 + Math.cos(a) * 50, y - 90 + Math.sin(a) * 50],
                  ],
                  base,
                  9,
                );
              }
            }
          } else {
            c.fillStyle = base;
            c.beginPath();
            c.moveTo(0, 720);
            c.lineTo(0, 510 - layer * 30);
            for (let i = 0; i < 8; i++) {
              const x = i * 192;
              c.bezierCurveTo(
                x + 45,
                250 + layer * 90,
                x + 132,
                340 + layer * 35,
                x + 192,
                510 - layer * 30,
              );
            }
            c.lineTo(1536, 720);
            c.fill();
            if (layer > 0)
              for (let i = 0; i < 12; i++) {
                const x = i * 145 + random() * 70,
                  y = 500 + random() * 110,
                  s = 0.5 + random() * 0.6;
                line(
                  c,
                  [
                    [x, y],
                    [x + 10, y - 100 * s],
                  ],
                  base,
                  8 * s,
                );
                for (let k = 0; k < 4; k++) {
                  oval(
                    c,
                    x - 16 + k * 14,
                    y - 60 * s - (k % 2) * 23,
                    35 * s,
                    50 * s,
                    base,
                  );
                }
              }
          }
          c.restore();
        }
      });
  generateTamWorldProps(scene, p);
}
export function terrainKey(scene, p, width, height = 70) {
  const w = Math.ceil(width),
    h = Math.ceil(height);
  return texture(scene, `terrain-${p.key}-${w}-${h}`, w, h + 16, (c) => {
    const random = rng(w * 17 + h);
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, p.soilLight);
    g.addColorStop(1, p.soil);
    rr(c, 0, 5, w, h, Math.min(20, w / 5), g);
    c.save();
    c.beginPath();
    c.roundRect(0, 5, w, h, Math.min(20, w / 5));
    c.clip();
    for (let i = 0; i < w / 110; i++) {
      const x = random() * w,
        y = 28 + random() * h;
      if (p.key === "sky") {
        rr(c, i * 110 + 16, 34, 78, Math.max(10, h - 45), 10, "#accbd522");
        rr(c, i * 110 + 24, 39, 61, 4, 2, "#d3e6e52b");
        oval(c, i * 110 + 30, 30, 3.5, 3.5, "#fbe6b2");
      } else if (p.key === "valley") {
        rr(c, x - 20, y, 48, 22, 10, i % 2 ? "#234f6155" : "#61a59333");
        rr(c, x - 18, y, 41, 4, 2, "#91c4b722");
      } else
        poly(
          c,
          [
            [x - 14, y],
            [x, y - 10],
            [x + 18, y + 4],
            [x + 5, y + 17],
          ],
          i % 2 ? p.soil : p.soilLight,
        );
    }
    c.restore();
    rr(c, 0, 0, w, 22, 10, p.top);
    rr(c, 3, 2, w - 6, 6, 3, p.edge);
    for (let i = 0; i < w / 38 && p.key !== "sky"; i++) {
      let x = i * 39 + random() * 20;
      rr(c, x, 11, 14 + random() * 18, 12 + random() * 9, 8, p.top);
    }
    for (let i = 0; i < w / 100 && p.key === "valley"; i++) {
      let x = i * 103 + 28;
      line(
        c,
        [
          [x, 4],
          [x - 4, 0],
          [x + 2, 4],
          [x + 7, 0],
        ],
        p.edge,
        2,
      );
    }
  });
}
export function gateArt(scene, key, width = 160, height = 124) {
  return texture(scene, key, width, height, (c) => {
    rr(c, 7, 4, width - 14, height - 9, 24, "#518c9c");
    rr(c, 15, 10, width - 30, height - 23, 19, "#b8edeb");
    rr(c, 24, 18, width - 48, height - 38, 15, "#ecfcecd9");
    rr(c, 0, height - 16, width, 15, 7, "#375e78");
    for (let i = 0; i < 3; i++)
      oval(c, width / 2 + (i - 1) * 15, height - 9, 2.5, 2.5, "#fff0b1");
  });
}
