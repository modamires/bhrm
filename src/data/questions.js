import g7 from "./grade7.js";
import g8 from "./grade8.js";
import g9 from "./grade9.js";
export const BANKS = { 7: g7, 8: g8, 9: g9 };
export function validQuestion(q) {
  if (
    !q ||
    typeof q.id !== "string" ||
    typeof q.promptFa !== "string" ||
    typeof q.explanationFa !== "string"
  )
    return false;
  if (q.kind === "order")
    return (
      Array.isArray(q.tokens) &&
      q.tokens.length >= 2 &&
      q.tokens.length <= 5 &&
      q.tokens.every((t) => typeof t === "string" && t.length > 0) &&
      new Set(q.tokens).size === q.tokens.length &&
      q.tokens.join(" ") === q.correctAnswer
    );
  return (
    ["gate", "platform"].includes(q.kind) &&
    Array.isArray(q.choices) &&
    q.choices.length === 3 &&
    new Set(q.choices).size === 3 &&
    q.choices.includes(q.correctAnswer) &&
    q.choices.every((c) => typeof c === "string")
  );
}
export function questionsFor(grade, kind, count = 4, seed = 0) {
  let pool = (BANKS[grade] || BANKS[7]).filter(
    (q) => q.kind === kind && validQuestion(q),
  );
  if (!pool.length)
    pool = BANKS[7].filter((q) => q.kind === kind && validQuestion(q));
  const start = Math.abs(seed) % pool.length;
  return Array.from(
    { length: Math.min(count, pool.length) },
    (_, i) => pool[(i + start) % pool.length],
  );
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
