// Game-native props share the illustrated backdrops' enamel, glass and garden palette.
const TAU = Math.PI * 2;
const rounded = (c, x, y, w, h, r, fill) => {
  c.fillStyle = fill;
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fill();
};
const ellipse = (c, x, y, rx, ry, fill) => {
  c.fillStyle = fill;
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, TAU);
  c.fill();
};
const polygon = (c, points, fill) => {
  c.fillStyle = fill;
  c.beginPath();
  points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
  c.fill();
};
function gradient(c, y, h, a, b) {
  const g = c.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  return g;
}
function texture(scene, key, w, h, draw) {
  if (scene.textures.exists(key)) return;
  const t = scene.textures.createCanvas(key, w, h);
  draw(t.context);
  t.refresh();
}
function compass(c, x, y, r) {
  c.save();
  c.translate(x, y);
  const outline = Array.from({ length: 8 }, (_, i) => [
    Math.cos((i * TAU) / 8 + TAU / 16) * r,
    Math.sin((i * TAU) / 8 + TAU / 16) * r,
  ]);
  polygon(c, outline, "#94592f");
  c.scale(0.9, 0.9);
  polygon(c, outline, gradient(c, -r, r * 2, "#fff1ae", "#e5a748"));
  ellipse(c, 0, 0, r * 0.68, r * 0.68, "#284e60");
  ellipse(c, 0, -1, r * 0.56, r * 0.56, "#4cb4b5");
  polygon(
    c,
    [
      [-4, 3],
      [7, -r * 0.49],
      [4, -2],
      [-7, r * 0.49],
    ],
    "#fff1c5",
  );
  polygon(
    c,
    [
      [-4, 3],
      [7, -r * 0.49],
      [4, -2],
    ],
    "#f5896f",
  );
  ellipse(c, 0, 0, r * 0.1, r * 0.1, "#ffe8ad");
  c.restore();
}
export function generateTamObjects(scene) {
  texture(scene, "travel-token", 80, 80, (c) => compass(c, 40, 40, 31));
  texture(scene, "tam-bot", 128, 128, (c) => {
    ellipse(c, 64, 110, 37, 7, "#234a592f");
    ellipse(c, 43, 105, 13, 11, "#354d68");
    ellipse(c, 85, 105, 13, 11, "#354d68");
    rounded(c, 22, 40, 84, 65, 27, gradient(c, 35, 70, "#ffbd9c", "#d86c74"));
    rounded(c, 17, 53, 11, 30, 5, "#f5d3ad");
    rounded(c, 100, 53, 11, 30, 5, "#f5d3ad");
    rounded(c, 33, 52, 62, 34, 14, "#26465c");
    for (const x of [48, 79]) {
      ellipse(c, x, 68, 5, 7, "#b7f7ed");
      ellipse(c, x + 1, 66, 2, 2, "#ffffff");
    }
    rounded(c, 58, 25, 10, 20, 4, "#476677");
    ellipse(c, 64, 24, 10, 9, "#ffd784");
    ellipse(c, 46, 43, 16, 4, "#ffe4c4aa");
    for (const x of [52, 64, 76]) ellipse(c, x, 95, 2.2, 2.2, "#fff1c7");
  });
  texture(scene, "drift-cloud", 260, 92, (c) => {
    const g = gradient(c, 0, 92, "#fffefa", "#d8f3ff");
    ellipse(c, 130, 62, 117, 25, g);
    ellipse(c, 89, 44, 55, 34, g);
    ellipse(c, 151, 34, 53, 34, g);
    ellipse(c, 198, 57, 43, 24, g);
  });
  texture(scene, "petal", 24, 24, (c) => {
    c.translate(12, 12);
    c.rotate(-0.45);
    ellipse(c, 0, 0, 4, 10, "#ffb7c8");
    ellipse(c, -1, -3, 1.2, 5, "#ffe2e4");
  });
  texture(scene, "butterfly", 54, 40, (c) => {
    ellipse(c, 15, 13, 12, 12, "#ffbd70");
    ellipse(c, 39, 13, 12, 12, "#ffc787");
    ellipse(c, 19, 29, 8, 8, "#ed929b");
    ellipse(c, 35, 29, 8, 8, "#f5a3aa");
    rounded(c, 25, 9, 4, 27, 2, "#655066");
  });
  texture(scene, "fan-rotor", 110, 110, (c) => {
    c.translate(55, 55);
    for (let i = 0; i < 3; i++) {
      c.rotate(TAU / 3);
      c.save();
      c.rotate(0.3);
      rounded(
        c,
        -7,
        -48,
        16,
        42,
        8,
        gradient(c, -48, 42, "#fff1bf", "#e9aa57"),
      );
      c.restore();
    }
    ellipse(c, 0, 0, 11, 11, "#476b82");
    ellipse(c, 0, 0, 5, 5, "#fcdeb0");
  });
}
function crystal(c, x, y, size, color) {
  polygon(
    c,
    [
      [x - size * 0.34, y],
      [x - size * 0.46, y - size * 0.68],
      [x, y - size],
      [x + size * 0.32, y - size * 0.66],
      [x + size * 0.23, y],
    ],
    color,
  );
  polygon(
    c,
    [
      [x, y - size],
      [x + size * 0.32, y - size * 0.66],
      [x + size * 0.23, y],
      [x - 2, y],
    ],
    "#ffffff50",
  );
  polygon(
    c,
    [
      [x - size * 0.34, y],
      [x - size * 0.46, y - size * 0.68],
      [x, y - size],
      [x - size * 0.19, y - size * 0.64],
    ],
    "#ffffff65",
  );
}
export function generateTamWorldProps(scene, p) {
  texture(scene, `plant-${p.key}`, 160, 160, (c) => {
    ellipse(c, 80, 148, 61, 10, "#163b522e");
    if (p.key === "cavern") {
      ellipse(c, 78, 137, 48, 16, "#547ba4");
      crystal(c, 53, 137, 103, "#6fcad3");
      crystal(c, 89, 139, 128, "#b297ea");
      crystal(c, 116, 137, 79, "#8ce6de");
      for (let i = 0; i < 3; i++) {
        ellipse(c, 29 + i * 45, 132, 11, 7, "#dd9ee0");
        ellipse(c, 29 + i * 45, 130, 4, 3, "#ffe2d5");
      }
    } else if (p.key === "sky") {
      rounded(c, 43, 63, 75, 78, 23, gradient(c, 60, 80, "#bee7e1", "#5c9da9"));
      rounded(c, 54, 78, 53, 37, 12, "#345d77");
      rounded(c, 59, 82, 43, 7, 3, "#9fe1e5");
      rounded(c, 46, 120, 69, 12, 6, "#f5be79");
      rounded(c, 76, 30, 8, 39, 4, "#39627c");
      for (let i = 0; i < 3; i++)
        ellipse(c, 65 + i * 16, 103, 3, 3, i === 1 ? "#f9c387" : "#b7efe3");
      rounded(c, 37, 140, 86, 10, 5, "#325574");
    } else {
      c.strokeStyle = "#34836c";
      c.lineWidth = 5;
      c.lineCap = "round";
      for (let i = 0; i < 3; i++) {
        const x = 44 + i * 34,
          y = 43 + (i % 2) * 22;
        c.beginPath();
        c.moveTo(80, 129);
        c.quadraticCurveTo(x, 90, x, y);
        c.stroke();
        c.save();
        c.translate(x - 7, y + 32);
        c.rotate(-0.6);
        ellipse(c, 0, 0, 10, 23, gradient(c, -23, 46, "#a2e7b3", "#3aaf8a"));
        c.restore();
        for (let f = 0; f < 5; f++) {
          const a = (f * TAU) / 5;
          ellipse(
            c,
            x + Math.cos(a) * 11,
            y + Math.sin(a) * 11,
            9,
            10,
            i === 1 ? "#ffc57d" : "#f697b3",
          );
        }
        ellipse(c, x, y, 7, 7, "#fff2b1");
      }
      rounded(
        c,
        35,
        115,
        90,
        30,
        14,
        gradient(c, 115, 30, "#84d6c7", "#397f90"),
      );
      rounded(c, 29, 111, 102, 11, 5, "#d4f8d1");
      ellipse(c, 80, 132, 10, 5, "#ffda8b");
    }
  });
  texture(scene, `checkpoint-${p.key}`, 130, 180, (c) => {
    ellipse(c, 65, 168, 48, 9, "#163f5930");
    rounded(c, 42, 151, 47, 14, 7, "#3a6980");
    rounded(c, 59, 28, 12, 130, 5, gradient(c, 28, 130, "#b6d8ce", "#517c8c"));
    polygon(
      c,
      [
        [33, 46],
        [89, 46],
        [111, 62],
        [89, 79],
        [33, 79],
      ],
      "#ffcb88",
    );
    polygon(
      c,
      [
        [96, 87],
        [40, 87],
        [20, 102],
        [40, 117],
        [96, 117],
      ],
      "#8de0d0",
    );
    rounded(c, 49, 59, 27, 5, 2, "#be7c51");
    rounded(c, 57, 99, 28, 5, 2, "#40998f");
    compass(c, 65, 27, 19);
  });
  texture(scene, `goal-${p.key}`, 260, 310, (c) => {
    ellipse(c, 130, 290, 110, 13, "#274a673a");
    rounded(c, 27, 270, 207, 27, 13, "#42657e");
    rounded(c, 42, 253, 177, 23, 11, "#aacfc5");
    rounded(c, 42, 55, 23, 211, 9, gradient(c, 55, 211, "#b8ebe1", "#457f99"));
    rounded(c, 195, 55, 23, 211, 9, gradient(c, 55, 211, "#b8ebe1", "#457f99"));
    rounded(c, 34, 43, 192, 43, 20, "#43879a");
    rounded(c, 39, 46, 181, 11, 5, "#bef3df");
    polygon(
      c,
      [
        [55, 94],
        [99, 94],
        [99, 189],
        [77, 170],
        [55, 189],
      ],
      "#e68d9a",
    );
    polygon(
      c,
      [
        [164, 94],
        [206, 94],
        [206, 189],
        [185, 170],
        [164, 189],
      ],
      "#eeb968",
    );
    compass(c, 131, 133, 40);
    rounded(c, 105, 227, 53, 25, 9, "#f6d08d");
    for (let i = 0; i < 3; i++) ellipse(c, 112 + i * 19, 61, 4, 4, "#ffdb9b");
  });
}
