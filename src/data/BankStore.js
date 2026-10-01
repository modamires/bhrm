import { defaults, validateBank, setQuestions } from "./questions.js";
const DB = "bahram-question-bank-v1";
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore("bank");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error("بانک سؤال در یک پنجرهٔ دیگر باز است."));
  });
}
async function transaction(mode, operation) {
  const db = await openDB();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction("bank", mode);
      const req = operation(tx.objectStore("bank"));
      tx.oncomplete = () => resolve(req.result);
      tx.onerror = tx.onabort = () => reject(tx.error || new Error("ذخیره‌سازی انجام نشد."));
    });
  } finally { db.close(); }
}
export async function loadBank() {
  let warning = "";
  try {
    const local = await transaction("readonly", s => s.get("active"));
    if (local) { const questions = validateBank(local); setQuestions(questions); return { questions, origin: "local", warning }; }
  } catch { warning = "ذخیرهٔ محلی در دسترس نیست؛ برای نگهداری تغییرات حتماً خروجی بگیرید."; }
  try {
    const response = await fetch(new URL("../../question-bank.json", import.meta.url), { cache: "no-store" });
    if (!response.ok) throw new Error();
    const data = await response.json();
    if (data.questions !== null) { const questions = validateBank(data); setQuestions(questions); return { questions, origin: "published", warning }; }
  } catch { warning = "فایل بانک منتشرشده بارگذاری نشد؛ سؤال‌های نمونه نمایش داده می‌شوند."; }
  const questions = defaults(); setQuestions(questions);
  return { questions, origin: "sample", warning };
}
export async function saveBank(questions) {
  const data = { version: 1, questions, updatedAt: new Date().toISOString() };
  validateBank(data);
  await transaction("readwrite", s => s.put(data, "active"));
  setQuestions(questions);
}
export async function usePublishedBank() {
  await transaction("readwrite", s => s.delete("active"));
  return loadBank();
}
