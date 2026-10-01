import { defaults, validQuestion, validateBank, stageOf, STAGE_COUNTS } from "../data/questions.js";
import { loadBank, saveBank, usePublishedBank } from "../data/BankStore.js";
const $ = id => document.getElementById(id);
const fa = n => Number(n).toLocaleString("fa-IR");
let questions = [], editing = null, currentImage = "", dirty = false, imageTask = 0, imageBusy = false, saving = false;
function notify(message, error = false) { $("notice").textContent = message; $("notice").classList.toggle("error", error); }
function setDirty(value = true) { dirty = value; $("save-state").textContent = value ? "تغییرات فرم هنوز ذخیره نشده" : "بانک سؤال آماده است"; }
function discardOK() { return !dirty || confirm("تغییرات این فرم هنوز ذخیره نشده است. ادامه می‌دهید؟"); }
function el(tag, text, className = "") { const e = document.createElement(tag); e.textContent = text; e.className = className; return e; }
for (let i = 0; i < 4; i++) {
  const row = el("div", "", "choice-row");
  const radio = document.createElement("input"); radio.type = "radio"; radio.name = "correct"; radio.value = i; radio.setAttribute("aria-label", `گزینهٔ ${fa(i+1)} پاسخ درست است`);
  const input = document.createElement("input"); input.type = "text"; input.id = `choice-${i}`; input.maxLength = 100; input.placeholder = `گزینهٔ ${fa(i+1)}${i > 1 ? " (اختیاری)" : ""}`; input.setAttribute("aria-label", `متن گزینهٔ ${fa(i+1)}`);
  row.append(radio, input); $("choices-inputs").append(row);
}
function render() {
  $("authored-count").textContent = fa(questions.filter(q => !q.sample && q.enabled !== false).length);
  $("image-count").textContent = fa(questions.filter(q => q.image).length);
  const grade = Number($("filter-grade").value), stage = Number($("filter-stage").value), source = $("filter-source").value, search = $("search").value.trim();
  const visible = questions.filter(q => q.grade === grade && (!stage || stageOf(q) === stage) && (source === "all" || (source === "sample" ? q.sample : !q.sample)) && (!search || [q.promptFa,q.arabicText,q.source,q.correctAnswer].join(" ").includes(search)));
  $("list-count").textContent = `${fa(visible.length)} سؤال`;
  $("coverage").replaceChildren();
  for (let i = 1; i <= 3; i++) {
    const pool = questions.filter(q => q.grade === grade && stageOf(q) === i && q.enabled !== false);
    const authored = pool.filter(q => !q.sample).length;
    const span = el("span", `مرحله ${fa(i)}: ${fa(pool.length)} فعال / نیاز ${fa(STAGE_COUNTS[i-1])} · ${fa(authored)} تألیفی`, "coverage-chip" + (pool.length < STAGE_COUNTS[i-1] ? " missing" : ""));
    $("coverage").append(span);
  }
  $("question-list").replaceChildren();
  if (!visible.length) $("question-list").append(el("p", "سؤالی با این فیلتر پیدا نشد. یک سؤال تازه اضافه کنید.", "empty"));
  visible.sort((a,b) => Number(!!a.sample)-Number(!!b.sample)).forEach(q => {
    const button = el("button", "", "question-item" + (editing === q.id ? " selected" : ""));
    const meta = el("div", "", "item-meta");
    meta.append(el("span", q.sample ? "نمونه" : "تألیفی", "tag" + (q.sample ? "" : " authored")), el("span", `مرحلهٔ ${fa(stageOf(q))} · ${q.kind === "order" ? "مرتب‌سازی" : "چندگزینه‌ای"}`));
    if (q.image) meta.append(el("span", "تصویری", "tag"));
    if (q.enabled === false) meta.append(el("span", "غیرفعال", "tag"));
    button.append(meta, el("div", q.promptFa, "item-text"));
    if (q.source) button.append(el("div", q.source, "item-source"));
    button.onclick = () => { if (discardOK()) fill(q); };
    $("question-list").append(button);
  });
}
function showImage() {
  $("image-preview").hidden = !currentImage; $("remove-image").hidden = !currentImage; $("image-alt-label").hidden = !currentImage;
  if (currentImage) $("image-preview").src = currentImage; else $("image-preview").removeAttribute("src");
}
function changeType() {
  const order = $("answer-type").value === "order";
  $("choices-field").hidden = order; $("tokens-field").hidden = !order;
  $("arabic").disabled = order;
  $("arabic").placeholder = order ? "در این نوع سؤال، واژه‌ها از بخش ترتیب درست خوانده می‌شوند." : "متن عربی سؤال";
  for (let i = 0; i < 4; i++) $("choice-"+i).required = !order && i < 2;
  $("tokens").required = order;
}
function fill(q = null) {
  ++imageTask; imageBusy = false; $("save").disabled = false;
  editing = q?.id || null; currentImage = q?.image || "";
  $("question-form").reset();
  $("grade").value = q?.grade || $("filter-grade").value;
  $("stage").value = q ? stageOf(q) : Number($("filter-stage").value) || 1;
  $("answer-type").value = q?.kind === "order" ? "order" : "choice";
  $("prompt").value = q?.promptFa || ""; $("arabic").value = q?.arabicText || "";
  $("explanation").value = q?.explanationFa || ""; $("source").value = q?.source || "";
  $("image-alt").value = q?.imageAlt || "";
  $("enabled").checked = q?.enabled !== false;
  for (let i = 0; i < 4; i++) {
    $("choice-"+i).value = q?.choices?.[i] || "";
    document.querySelector(`[name=correct][value="${i}"]`).checked = q?.choices?.[i] === q?.correctAnswer && q != null;
  }
  $("tokens").value = q?.tokens?.join("\n") || "";
  $("delete").hidden = !q; $("question-preview").hidden = true;
  $("editor-mode").textContent = q ? q.sample ? "ویرایش نمونه؛ پس از ذخیره، تألیفی می‌شود" : "ویرایش سؤال" : "سؤال جدید";
  showImage(); changeType(); setDirty(false); render();
}
function readForm() {
  if (imageBusy) throw new Error("لطفاً تا آماده‌شدن تصویر صبر کنید.");
  const stage = Number($("stage").value), order = $("answer-type").value === "order";
  const q = { id: editing || `custom-${crypto.randomUUID()}`, grade: Number($("grade").value), stage,
    kind: order ? "order" : stage === 2 ? "gate" : "platform", sample: false, enabled: $("enabled").checked,
    promptFa: $("prompt").value.trim(), arabicText: order ? "" : $("arabic").value.trim(), explanationFa: $("explanation").value.trim(), source: $("source").value.trim(), image: currentImage, imageAlt: currentImage ? $("image-alt").value.trim() : "" };
  if (order) { q.tokens = $("tokens").value.split("\n").map(t => t.trim()).filter(Boolean); q.correctAnswer = q.tokens.join(" "); }
  else {
    const answer = document.querySelector("[name=correct]:checked");
    q.choices = Array.from({length:4}, (_,i) => $("choice-"+i).value.trim()).filter(Boolean);
    q.correctAnswer = answer ? $("choice-"+answer.value).value.trim() : "";
  }
  if (!q.promptFa) throw new Error("صورت سؤال را بنویسید.");
  if (!order && (!q.correctAnswer || !q.choices.includes(q.correctAnswer))) throw new Error("پاسخ درست را از دایرهٔ کنار گزینه‌ها انتخاب کنید.");
  if (!validQuestion(q)) throw new Error(order ? "۲ تا ۵ واژه یا عبارت وارد کنید؛ هر خط حداکثر ۶۰ نویسه." : "۲ تا ۴ گزینهٔ غیرتکراری بنویسید و پاسخ درست را مشخص کنید.");
  return q;
}
async function persist(next) {
  try { await saveBank(next); }
  catch (error) { throw new Error("ذخیره انجام نشد؛ فضای مرورگر یا دسترسی ذخیره‌سازی را بررسی کنید. فرم حفظ شده است."); }
  questions = next; setDirty(false); render();
}
$("question-form").addEventListener("submit", async e => {
  e.preventDefault(); if (saving) return;
  try {
    const q = readForm(); saving = true; $("save").disabled = true;
    const next = questions.filter(x => x.id !== q.id); next.push(q);
    await persist(next); $("filter-grade").value = q.grade; $("filter-stage").value = q.stage; $("filter-source").value = "all"; $("search").value = ""; fill(q);
    notify("سؤال ذخیره شد و از شروع بعدی مرحله در بازی استفاده می‌شود. برای پشتیبان‌گیری، خروجی بگیرید.");
  } catch (error) { notify(error.message, true); }
  finally { saving = false; $("save").disabled = imageBusy; }
});
$("question-form").addEventListener("input", () => setDirty());
$("answer-type").onchange = changeType;
$("new-question").onclick = $("reset-form").onclick = () => { if (discardOK()) { fill(); $("prompt").focus(); } };
for (const id of ["filter-grade","filter-stage","filter-source"]) $(id).onchange = render;
$("search").oninput = render;
$("guide-button").onclick = () => { $("guide").open = !$("guide").open; };
$("delete").onclick = async () => {
  if (!editing || !confirm("این سؤال حذف شود؟ برای نگهداری نسخهٔ قبلی ابتدا خروجی بگیرید.")) return;
  try { await persist(questions.filter(q => q.id !== editing)); fill(); notify("سؤال حذف شد."); } catch (e) { notify(e.message, true); }
};
$("remove-image").onclick = () => { ++imageTask; imageBusy = false; $("save").disabled = false; currentImage = ""; $("image-file").value = ""; showImage(); setDirty(); };
$("image-file").onchange = async () => {
  const file = $("image-file").files[0]; if (!file) return;
  const task = ++imageTask;
  try {
    if (!["image/png","image/jpeg","image/webp"].includes(file.type) || file.size > 8*1024*1024) throw new Error("یک تصویر PNG، JPG یا WebP تا ۸ مگابایت انتخاب کنید.");
    imageBusy = true; $("save").disabled = true;
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width,bitmap.height));
    const canvas = document.createElement("canvas"); canvas.width = Math.max(1,Math.round(bitmap.width*scale)); canvas.height = Math.max(1,Math.round(bitmap.height*scale));
    canvas.getContext("2d").drawImage(bitmap,0,0,canvas.width,canvas.height); bitmap.close();
    const data = canvas.toDataURL("image/webp", .9);
    if (data.length > 2800000) throw new Error("تصویر هنوز بزرگ است؛ تصویری با حجم کمتر انتخاب کنید.");
    if (task !== imageTask) return;
    currentImage = data; showImage(); setDirty(); notify("تصویر آماده شد؛ برای ثبت آن، سؤال را ذخیره کنید.");
  } catch(e) { if (task === imageTask) notify(e.message || "تصویر خوانده نشد.", true); }
  finally { if (task === imageTask) { imageBusy = false; $("save").disabled = false; $("image-file").value = ""; } }
};
$("preview-button").onclick = () => {
  try {
    const q = readForm(), box = $("question-preview"); box.replaceChildren(el("small", "پیش‌نمایش محتوای سؤال"), el("p", q.promptFa));
    if (q.arabicText) box.append(el("p", q.arabicText));
    if (q.image) { const img = document.createElement("img"); img.src = q.image; img.alt = q.imageAlt || "تصویر سؤال"; box.append(img); }
    const list = document.createElement("ol"); (q.tokens || q.choices).forEach(t => list.append(el("li", t + (t === q.correctAnswer ? " ✓" : ""), t === q.correctAnswer ? "correct" : ""))); box.append(list);
    if (q.kind === "order") box.append(el("small", "در بازی، ترتیب این واژه‌ها به‌هم می‌ریزد."));
    box.append(el("p", q.explanationFa)); box.hidden = false; box.scrollIntoView({behavior:"smooth",block:"nearest"});
  } catch(e) { notify(e.message, true); }
};
$("export").onclick = () => {
  if (dirty && !confirm("فرم فعلی ذخیره نشده است؛ خروجی فقط شامل سؤال‌های ذخیره‌شده خواهد بود. ادامه می‌دهید؟")) return;
  const blob = new Blob([JSON.stringify({ version:1, exportedAt:new Date().toISOString(), questions }, null,2)], {type:"application/json"});
  const url = URL.createObjectURL(blob), a = document.createElement("a"); a.href = url; a.download = "question-bank.json"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 2000);
  notify("خروجی بانک سؤال با تصاویر آمادهٔ دانلود است.");
};
$("import").onchange = async () => {
  const file = $("import").files[0]; if (!file) return;
  try {
    if (file.size > 80*1024*1024) throw new Error("حجم فایل بانک باید کمتر از ۸۰ مگابایت باشد.");
    const next = validateBank(JSON.parse(await file.text()));
    if (!discardOK() || !confirm(`بانک فعلی با ${fa(next.length)} سؤال این فایل جایگزین شود؟ برای حفظ بانک فعلی، ابتدا خروجی بگیرید.`)) return;
    await persist(next); fill(); notify("بانک سؤال و تصاویر با موفقیت وارد شدند.");
  } catch(e) { notify(e instanceof SyntaxError ? "فایل JSON خوانده نشد؛ از خروجی همین پنل استفاده کنید." : e.message, true); }
  finally { $("import").value = ""; }
};
$("published").onclick = async () => {
  if (!discardOK() || !confirm("بانک محلی کنار گذاشته و نسخهٔ منتشرشدهٔ میزبان بارگذاری شود؟ ابتدا از تغییرات خود خروجی بگیرید.")) return;
  try { const result = await usePublishedBank(); questions = result.questions; fill(); notify(result.warning || "نسخهٔ منتشرشده بارگذاری شد.", !!result.warning); } catch { notify("بارگذاری انجام نشد؛ دسترسی ذخیره‌سازی مرورگر را بررسی کنید.", true); }
};
window.addEventListener("beforeunload", e => { if (dirty) { e.preventDefault(); e.returnValue = ""; } });
try {
  const result = await loadBank(); questions = result.questions; fill();
  if (result.warning) notify(result.warning, true);
} catch { questions = defaults(); fill(); notify("بانک ذخیره‌شده خوانده نشد؛ نمونه‌ها نمایش داده می‌شوند.", true); }
