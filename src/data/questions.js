import g7 from "./grade7.js";
import g8 from "./grade8.js";
import g9 from "./grade9.js";
export const BANKS = { 7: g7, 8: g8, 9: g9 };
export const STAGE_KINDS = ["platform", "gate", "order"];
export const STAGE_COUNTS = [2, 2, 1];
export const stageOf = q => q.stage ?? STAGE_KINDS.indexOf(q.kind) + 1;
export const defaults = () => Object.values(BANKS).flat().map(q => ({ ...q, stage: stageOf(q), sample: true, enabled: true }));
let active = defaults();
export const getQuestions = () => structuredClone(active);
export const setQuestions = questions => { active = structuredClone(questions); };
export function validQuestion(q) {
  const text = (s, max) => typeof s === "string" && s.trim().length > 0 && s.length <= max;
  if (!q || !text(q.id, 120) || ![7,8,9].includes(q.grade) || ![1,2,3].includes(stageOf(q)) ||
      !text(q.promptFa, 1200) || typeof q.explanationFa !== "string" || q.explanationFa.length > 600 ||
      (q.arabicText != null && (typeof q.arabicText !== "string" || q.arabicText.length > 600)) ||
      (q.image && (typeof q.image !== "string" || q.image.length > 2800000 || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(q.image))) ||
      (q.imageAlt != null && (typeof q.imageAlt !== "string" || q.imageAlt.length > 300)) ||
      (q.source != null && (typeof q.source !== "string" || q.source.length > 200)) ||
      (q.enabled != null && typeof q.enabled !== "boolean") || (q.sample != null && typeof q.sample !== "boolean")) return false;
  if (q.kind === "order") return Array.isArray(q.tokens) && q.tokens.length >= 2 && q.tokens.length <= 5 &&
    q.tokens.every(t => text(t, 60)) && q.tokens.join(" ") === q.correctAnswer;
  return ["gate", "platform"].includes(q.kind) && Array.isArray(q.choices) && q.choices.length >= 2 && q.choices.length <= 4 &&
    new Set(q.choices).size === q.choices.length && q.choices.includes(q.correctAnswer) && q.choices.every(c => text(c, 100));
}
export function validateBank(data) {
  if (!data || data.version !== 1 || !Array.isArray(data.questions) || data.questions.length > 1000 ||
      !data.questions.every(validQuestion) || new Set(data.questions.map(q => q.id)).size !== data.questions.length)
    throw new Error("فایل بانک سؤال معتبر نیست؛ از خروجی همین پنل استفاده کنید.");
  return data.questions;
}
export function questionsFor(grade, stageOrKind, count = 2, seed = 0) {
  const stage = typeof stageOrKind === "number" ? stageOrKind : STAGE_KINDS.indexOf(stageOrKind) + 1;
  const g = BANKS[grade] ? grade : 7;
  const pool = active.filter(q => q.grade === g && stageOf(q) === stage && q.enabled !== false && validQuestion(q));
  const authored = shuffled(pool.filter(q => !q.sample), seed);
  const samples = shuffled(pool.filter(q => q.sample), seed + 1);
  return [...authored, ...samples].slice(0, count);
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
