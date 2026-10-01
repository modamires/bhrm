import g7 from "./grade7.js";
import g8 from "./grade8.js";
import g9 from "./grade9.js";

export const BANKS = { 7: g7, 8: g8, 9: g9 };
export const STAGE_COUNTS = [2, 2, 1];

export function questionsFor(grade, stage, count = STAGE_COUNTS[stage - 1]) {
  return (BANKS[grade] || BANKS[7]).filter(q => q.stage === stage).slice(0, count);
}

export function shuffled(values, seed = 1) {
  const a = [...values];
  let n = (seed + 17) | 0;
  for (let i = a.length - 1; i > 0; i--) {
    n = (n * 1664525 + 1013904223) >>> 0;
    const j = n % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
