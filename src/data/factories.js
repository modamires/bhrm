export const choice = (grade, kind, category, rows) =>
  rows.map((r, i) => ({
    id: `g${grade}_${kind}_${i + 1}`,
    grade,
    kind,
    category,
    difficulty: i < 3 ? 1 : 2,
    promptFa: r[0],
    arabicText: r[1],
    correctAnswer: r[2],
    choices: [r[2], r[3], r[4]],
    explanationFa: r[5],
  }));
export const order = (grade, rows) =>
  rows.map((r, i) => ({
    id: `g${grade}_order_${i + 1}`,
    grade,
    kind: "order",
    category: "sentence",
    difficulty: i < 3 ? 1 : 2,
    promptFa: `جمله بساز: «${r[0]}»`,
    arabicText: r[1],
    tokens: r[1].split(" "),
    correctAnswer: r[1],
    explanationFa: r[2],
  }));
