import { questionsFor, STAGE_COUNTS } from "../data/questions.js";
import { LEVELS, fa, GAME } from "../config.js";
import { ABOUT } from "../data/about.js";
const bahramIcon = new URL(
  "../../assets/characters/bahram/bahram-icon.png",
  import.meta.url,
).href;
const tamlandLogo = new URL("../../assets/branding/Tamland-Logo.svg", import.meta.url).href;
const kaveLogo = new URL("../../assets/branding/dr-kave-logo.png", import.meta.url).href;
const brands = (small = false) => `<div class="partner-brands ${small ? 'small' : ''}" aria-label="تاملند و دکتر علیرضا کاوه"><img class="tamland-logo" src="${tamlandLogo}" alt="تاملند"><span></span><img class="kave-logo" src="${kaveLogo}" alt="دکتر علیرضا کاوه"></div>`;
const icons = {
  gear: '<path d="m10 2 1-1h2l1 1 .5 2 2 1 2-.4 1.5 1.5-.4 2 1 2 2 .5v3l-2 .5-1 2 .4 2-1.5 1.5-2-.4-2 1-.5 2h-3l-.5-2-2-1-2 .4L3 18l.4-2-1-2L1 13v-2l2-.5 1-2-.4-2L5 5l2 .4 2-1z"/><circle cx="12" cy="11.5" r="3.5"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 4 3c-1 1-1 2-1 2m0 3h.01"/>',
  back: '<path d="m9 5 7 7-7 7M4 12h12"/>',
  full: '<path d="M3 9V3h6m6 0h6v6M3 15v6h6m6 0h6v-6"/>',
  home: '<path d="m3 11 9-8 9 8M5 9v12h14V9m-10 12v-8h6v8"/>',
  compass:
    '<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5z"/>',
};
const icon = (name) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.help}</svg>`;
export class UISystem {
  constructor(game) {
    this.game = game;
    this.root = document.getElementById("ui");
    this.touch = document.getElementById("touch");
    this.progress = game.progress;
    this.modal = null;
    this.toastTimer = null;
    this.applySettings();
    document.addEventListener("keydown", (e) => {
      if (
        e.code === "Escape" &&
        this.modal &&
        this.modal !== "pause" &&
        this.modal !== "result"
      ) {
        e.preventDefault();
        e.stopPropagation();
        this.closeModal();
      }
    });
  }
  applySettings() {
    document.body.classList.toggle(
      "reduced-motion",
      this.progress.settings.reducedMotion,
    );
    document.body.classList.toggle("wall-mode", this.progress.settings.wallMode);
    this.game.display?.refresh();
    this.game.audio.apply();
    this.updateTouch();
  }
  updateTouch() {
    const active = this.game.inputSystem?.active;
    this.touch.hidden = !(
      active &&
      (matchMedia("(pointer: coarse)").matches || this.progress.settings.touch)
    );
  }
  clearTransient() {
    clearTimeout(this.toastTimer);
    document.getElementById("toast").classList.remove("show");
  }
  bind(id, fn) {
    const e = this.root.querySelector(`[data-action="${id}"]`);
    if (e)
      e.onclick = () => {
        this.game.audio.unlock();
        this.game.audio.effect("ui");
        fn();
      };
  }
  menu() {
    this.modal = null;
    this.clearTransient();
    this.updateTouch();
    const unlocked = this.progress.progress.unlocked;
    this.root.innerHTML = `<section class="screen menu-screen"><header class="menu-top"><div class="brand"><img class="brand-mark" src="${bahramIcon}" alt=""><span>بهرام؛ در سرزمین تام</span></div><div class="menu-meta"><span class="mini-pill">یک سفر پر از کشف</span><span>نسخهٔ ۱.۵</span></div></header><div class="hero-copy"><div class="eyebrow">به سرزمین تام خوش آمدی</div><h1><span class="hero-name">بهرام</span><span class="hero-subtitle">در سرزمین تام</span></h1><p>بپر، کشف کن، راهت را پیدا کن.<br>سه مرحله و پنج سؤال برای هر پایه!</p><div class="hero-actions"><button class="primary" data-action="start">شروع بازی <span class="play-icon">▶</span></button><button class="secondary" data-action="grade">پایهٔ ${fa(this.progress.grade)} <span>⌄</span></button></div><div class="enemy-option"><div><strong>دشمن‌ها</strong><small>ربات‌های بازیگوش در مسیر</small></div><span id="enemy-status">${this.progress.settings.enemies ? "روشن" : "خاموش"}</span><button class="switch" role="switch" aria-label="فعال‌کردن دشمن‌ها" aria-checked="${this.progress.settings.enemies}" data-action="enemies"></button></div><div class="hero-tools"><button class="text-btn" data-action="levels">انتخاب مرحله</button><button class="text-btn" data-action="help">${icon("help")} راهنما</button><button class="text-btn" data-action="settings">${icon("gear")} تنظیمات</button><button class="text-btn" data-action="about">دربارهٔ ما</button></div></div>${brands()}<div class="display-actions"><button data-action="wall" aria-pressed="${this.progress.settings.wallMode}">حالت وال: ${this.progress.settings.wallMode ? "روشن" : "خاموش"}</button><button data-action="fullscreen" aria-label="نمایش تمام‌صفحه">${icon("full")}</button></div><div class="hero-note">من «بهرام»م. آماده‌ای؟</div><nav class="level-strip" aria-label="دنیاهای بازی">${LEVELS.map((l, i) => `<button class="level-mini ${i === 0 ? "active" : ""} ${i >= unlocked ? "locked" : ""}" data-action="level-${i}"><img class="mini-art" src="${this.game.thumbnails[i]}" alt=""><span><strong>${l.title}</strong><small>${l.focus}</small></span><span class="mini-status">${i < unlocked ? (this.progress.progress.results[i] ? "✦".repeat(this.progress.progress.results[i].stars) : "←") : "◇"}</span></button>`).join("")}</nav></section>`;
    this.bind("wall", () => {
      this.progress.setSetting("wallMode", !this.progress.settings.wallMode);
      this.applySettings();
      const button = this.root.querySelector('[data-action="wall"]');
      button.textContent = `حالت وال: ${this.progress.settings.wallMode ? "روشن" : "خاموش"}`;
      button.setAttribute("aria-pressed", this.progress.settings.wallMode);
    });
    this.bind("fullscreen", () => this.toggleFullscreen());
    this.bind("start", () => this.startLevel(0));
    this.bind("grade", () => this.gradeMenu());
    this.bind("levels", () => this.levelMenu());
    this.bind("help", () => this.help());
    this.bind("settings", () => this.settings());
    this.bind("about", () => this.about());
    this.bind("enemies", () => {
      const enabled = !this.progress.settings.enemies;
      this.progress.setSetting("enemies", enabled);
      this.root
        .querySelector('[data-action="enemies"]')
        .setAttribute("aria-checked", enabled);
      this.root.querySelector("#enemy-status").textContent = enabled
        ? "روشن"
        : "خاموش";
    });
    LEVELS.forEach((l, i) =>
      this.bind(`level-${i}`, () =>
        i < unlocked
          ? this.startLevel(i)
          : this.feedback(
              "با کامل‌کردن دنیای قبلی، این مسیر باز می‌شود",
              false,
            ),
      ),
    );
  }
  about() {
    this.panel("دربارهٔ ما", '<div class="about-content"></div>', {
      type: "about",
    });
    const body = this.root.querySelector(".about-content");
    for (const paragraph of ABOUT.text
      .trim()
      .split(/\n\s*\n/)
      .filter(Boolean)) {
      const p = document.createElement("p");
      p.textContent = paragraph;
      body.append(p);
    }
  }
  async startLevel(level) {
    if (level >= this.progress.progress.unlocked && !GAME.debug) return;
    this.game.audio.unlock();
    if (questionsFor(this.progress.grade, level + 1, STAGE_COUNTS[level]).length < STAGE_COUNTS[level]) {
      this.feedback(`برای این مرحله ${fa(STAGE_COUNTS[level])} سؤال فعال لازم است. بانک سؤال را کامل کنید.`, false);
      return;
    }
    this.modal = null;
    this.clearTransient();
    this.game.scene.stop("Menu");
    this.game.scene.stop("Level");
    this.root.innerHTML = "";
    this.game.scene.start("Level", { level });
  }
  backToMenu() {
    this.modal = null;
    this.game.scene.stop("Level");
    this.game.scene.stop("Menu");
    this.game.scene.start("Menu");
  }
  hud(scene, intro = true) {
    this.modal = null;
    this.root.innerHTML = `${brands(true)}<div class="hud"><div class="hud-group"><button class="icon-btn" aria-label="توقف و تنظیمات" data-action="pause">${icon("gear")}</button><button class="icon-btn" aria-label="نمایش تمام‌صفحه" data-action="fullscreen">${icon("full")}</button><div class="hud-chip"><span class="token-icon">${icon("compass")}</span><span id="hud-collect">۰</span><span class="hud-secondary">نشان</span></div><div class="hud-chip hud-score"><span id="hud-score">۰</span><span class="hud-secondary">امتیاز</span></div><div class="hud-chip combo-chip" id="hud-combo"><span>✧</span><span id="hud-streak">۰</span></div></div><div class="hud-group"><div class="hud-chip"><span id="hud-learn">۰ / ${fa(scene.level.challenges.length)}</span><span class="hud-secondary">معما</span></div><div class="hud-level"><strong>${scene.level.title}</strong><div class="progress-track"><i id="hud-progress"></i></div></div></div></div>${intro ? `<div class="level-intro"><small>دنیای ${fa(scene.level.id + 1)}</small><h2>${scene.level.title}</h2><p>${scene.palette.subtitle}</p></div>` : ""}`;
    this.bind("pause", () => scene.pause());
    this.bind("fullscreen", () => this.toggleFullscreen());
    this.updateTouch();
    this.updateHud(scene);
    if (GAME.debug && scene.addDebugPanel) scene.addDebugPanel();
  }
  updateHud(s) {
    const set = (id, v) => {
      const e = this.root.querySelector("#" + id);
      if (e && e.textContent !== v) e.textContent = v;
    };
    set("hud-collect", fa(s.stats.collected));
    set("hud-score", fa(s.stats.score));
    set("hud-streak", s.time.now < s.bonusUntil ? "×۲" : fa(s.stats.streak));
    set("hud-learn", `${fa(s.stats.solved)} / ${fa(s.education.total)}`);
    const bar = this.root.querySelector("#hud-progress");
    if (bar)
      bar.style.width =
        Math.min(100, (s.progressMax / s.level.length) * 100) + "%";
    this.root
      .querySelector("#hud-combo")
      ?.classList.toggle("bonus", s.time.now < s.bonusUntil);
  }
  showQuestion(z, scene) {
    let card = this.root.querySelector(".live-question");
    if (!z || this.modal) { card?.remove(); return; }
    if (!card || card._zone !== z) {
      card?.remove();
      this.root.querySelector(".level-intro")?.remove();
      card = document.createElement("section");
      card._zone = z;
      card.className = "live-question" + (z.q.image ? " has-image" : "");
      card.setAttribute("aria-label", "صورت سؤال");
      card.innerHTML = '<header class="question-heading"><strong class="question-caption"></strong><button class="question-expand" type="button">نمایش کامل ⤢</button></header><div class="question-body"><div class="question-copy" tabindex="0" aria-label="متن سؤال"><p class="question-prompt"></p><div class="question-arabic"></div><p class="question-explanation" hidden></p></div></div><footer class="question-status" role="status" aria-live="polite"></footer>';
      card.querySelector(".question-prompt").textContent = z.q.promptFa;
      card.querySelector(".question-expand").onclick = () => this.expandQuestion(z, scene);
      if (z.numbered) {
        const list = document.createElement("div"); list.className = "question-option-list";
        z.choices.forEach((choice, i) => {
          const line = document.createElement("div"); line.textContent = `${fa(i + 1)}. ${choice.value}`; list.append(line);
        });
        card.querySelector(".question-copy").append(list);
      }
      if (z.q.image) {
        const button = document.createElement("button"); button.className = "question-image-button";
        button.setAttribute("aria-label", "بزرگ‌نمایی تصویر سؤال");
        const img = document.createElement("img"); img.src = z.q.image; img.alt = z.q.imageAlt || "تصویر سؤال";
        img.onerror = () => { button.textContent = "تصویر بارگذاری نشد"; };
        const hint = document.createElement("span"); hint.textContent = "بزرگ‌نمایی ⤢";
        button.append(img, hint); button.onclick = () => this.expandQuestion(z, scene, true);
        card.querySelector(".question-body").append(button);
      }
      this.root.append(card);
    }
    // Update only changed text. Do not recreate the card, image or scroll box
    // on walking, jumping, wrong answers or intermediate sentence tokens.
    const state = `${z.step}:${z.solved}:${z.revision}`;
    if (card.dataset.state === state) return;
    card.dataset.state = state;
    card.querySelector(".question-caption").textContent = `سؤال ${fa(z.index + 1)} از ${fa(scene.education.total)} · ` + (z.solved ? "پاسخ درست ✓" : z.type === "order" ? "واژه‌ها را به ترتیب جمع کن" : z.type === "gate" ? "وارد دروازه شو و پرش را بزن" : "روی سکوی پاسخ بپر");
    const phrase = card.querySelector(".question-arabic");
    phrase.textContent = z.type === "order" ? (z.order.join(" ") || "از اولین واژه شروع کن") : z.q.arabicText || "";
    phrase.hidden = !phrase.textContent;
    const explanation = card.querySelector(".question-explanation");
    explanation.hidden = !(z.solved && z.q.explanationFa);
    explanation.textContent = z.solved ? z.q.explanationFa : "";
    const status = card.querySelector(".question-status"); status.textContent = z.statusText;
    status.classList.toggle("correct", z.statusGood);
    card.querySelectorAll(".question-option-list>div").forEach((line, i) => line.classList.toggle("taken", !!z.choices[i].taken));
  }
  expandQuestion(z, scene, imageOnly = false) {
    scene.isPaused = true;
    scene.controls.clear(); scene.controls.active = false; scene.audio.pause(true); scene.scene.pause(); this.updateTouch();
    this.panel(imageOnly ? "تصویر سؤال" : "سؤال و گزینه‌ها", '<div class="question-detail"></div>', {wide:true, type:"question-image", onClose:() => scene.resume(true)});
    const body = this.root.querySelector(".question-detail");
    if (!imageOnly) {
      const prompt = document.createElement("p"); prompt.textContent = z.q.promptFa; body.append(prompt);
      if (z.q.arabicText && z.type !== "order") {const phrase = document.createElement("p"); phrase.textContent = z.q.arabicText; phrase.className = "detail-arabic"; body.append(phrase);}
    }
    if (z.q.image) {const img = document.createElement("img"); img.src=z.q.image; img.alt=z.q.imageAlt || "تصویر سؤال"; body.append(img);}
    if (!imageOnly) {
      const list=document.createElement("ol");
      z.choices.forEach((choice,i) => {const line=document.createElement("li");line.textContent=choice.value;list.append(line);});body.append(list);
      if(z.solved && z.q.explanationFa) {const answer=document.createElement("p");answer.textContent=z.q.explanationFa;body.append(answer);}
    }
    body.tabIndex=0;body.setAttribute("aria-label","متن کامل سؤال و تصویر");
  }
  toggleFullscreen() {
    try {
      const task = document.fullscreenElement ? document.exitFullscreen?.() : document.documentElement.requestFullscreen?.();
      if (task?.catch) task.catch(() => this.feedback("تمام‌صفحه در این مرورگر در دسترس نیست؛ از کلید F11 استفاده کنید.", false));
      else if (!document.documentElement.requestFullscreen) this.feedback("برای تمام‌صفحه از کلید F11 استفاده کنید.", false);
    } catch { this.feedback("برای تمام‌صفحه از کلید F11 استفاده کنید.", false); }
  }
  celebrate(final = false) {
    const layer = document.getElementById("confetti");
    layer.style.setProperty("--fall", `${layer.clientHeight + 60}px`);
    const reduced = this.progress.settings.reducedMotion;
    const count = reduced ? 12 : final ? 130 : 65;
    const colors = ["#ffcc54", "#f76b8a", "#59dcca", "#66afff", "#b68cff", "#fff4dd"];
    for (let i = 0; i < count; i++) {
      const piece = document.createElement("i");
      piece.style.cssText = `left:${Math.random()*100}%;background:${colors[i%colors.length]};--drift:${Math.random()*260-130}px;--spin:${Math.random()*1000-500}deg;animation-duration:${reduced ? .9 : 2.3+Math.random()*1.9}s;animation-delay:${Math.random()*.35}s;width:${6+Math.random()*6}px;height:${4+Math.random()*7}px`;
      piece.addEventListener("animationend", () => piece.remove(), { once: true });
      layer.append(piece);
      setTimeout(() => piece.remove(), 5000);
    }
  }
  feedback(text, good = true) {
    const toast = document.getElementById("toast");
    clearTimeout(this.toastTimer);
    toast.textContent = text;
    toast.className = "show" + (good ? " good" : "");
    this.toastTimer = setTimeout(() => (toast.className = ""), 3600);
  }
  panel(title, body, { wide = false, type = "other", onClose = null } = {}) {
    this.root.querySelector(".modal-backdrop")?.remove();
    this.modal = type;
    this.onClose = onClose;
    const wrap = document.createElement("div");
    wrap.className = "modal-backdrop";
    wrap.innerHTML = `<section class="panel ${wide ? "wide" : ""}" role="dialog" aria-modal="true" aria-label="${title}"><div class="panel-head"><h2>${title}</h2><button class="close-btn" aria-label="بستن" data-action="close">×</button></div>${body}</section>`;
    this.root.append(wrap);
    this.bind("close", () => this.closeModal());
    this.focusTrap(wrap);
  }
  focusTrap(wrap) {
    const buttons = () => [
      ...wrap.querySelectorAll('button:not([disabled]),input,select,[tabindex="0"]'),
    ];
    const primary = wrap.querySelector(".primary") || buttons()[0];
    primary?.focus({ preventScroll: true });
    wrap.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;
      const b = buttons(),
        first = b[0],
        last = b.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }
  closeModal() {
    const fn = this.onClose;
    this.modal = null;
    this.onClose = null;
    this.root.querySelector(".modal-backdrop")?.remove();
    if (fn) fn();
    else this.root.querySelector("button")?.focus({ preventScroll: true });
  }
  gradeMenu() {
    this.panel(
      "انتخاب پایه",
      `<p>معماها را برای پایهٔ خودت تنظیم کن.</p><div class="grade-options">${[7, 8, 9].map((g, i) => `<button class="grade-card ${g === this.progress.grade ? "selected" : ""}" data-action="grade-${g}"><strong>${fa(g)}</strong>${["هفتم", "هشتم", "نهم"][i]}</button>`).join("")}</div>`,
      { type: "grade" },
    );
    for (const g of [7, 8, 9])
      this.bind(`grade-${g}`, () => {
        this.progress.setGrade(g);
        this.menu();
      });
  }
  levelMenu() {
    const u = this.progress.progress.unlocked;
    this.panel(
      "انتخاب مرحله",
      `<p>هر دنیا را کامل کن تا مسیر بعدی باز شود.</p><div class="level-grid">${LEVELS.map((l, i) => `<button class="level-card ${i < u ? "selected" : ""}" data-action="select-${i}" ${i >= u ? "disabled" : ""}><img src="${this.game.thumbnails[i]}" alt="${l.title}"><h3>${fa(i + 1)}. ${l.title}</h3><p>${l.description}</p><div class="${i < u ? "level-stars" : "lock-note"}">${i < u ? (this.progress.progress.results[i] ? "✦".repeat(this.progress.progress.results[i].stars) : "آمادهٔ کشف") : "پس از دنیای قبلی باز می‌شود"}</div></button>`).join("")}</div>`,
      { wide: true, type: "levels" },
    );
    LEVELS.forEach((l, i) =>
      this.bind(`select-${i}`, () => this.startLevel(i)),
    );
  }
  pauseMenu(scene) {
    this.updateTouch();
    this.panel(
      "یک نفس تازه",
      `<div class="pause-caption">✦</div><p style="text-align:center">${scene.level.title} منتظر توست.</p><button class="primary" data-action="resume">ادامهٔ بازی <span>▶</span></button><button class="secondary" data-action="settings">${icon("gear")} تنظیمات</button><button class="secondary" data-action="help">${icon("help")} راهنما</button><div class="settings-footer"><button class="text-btn" data-action="retry">شروع دوبارهٔ مرحله</button><button class="text-btn" data-action="home">${icon("home")} منوی اصلی</button></div>`,
      { type: "pause", onClose: () => scene.resume() },
    );
    this.bind("resume", () => scene.resume());
    this.bind("retry", () => this.startLevel(scene.level.id));
    this.bind("home", () => this.backToMenu());
    this.bind("settings", () => this.settings(scene));
    this.bind("help", () => this.help(scene));
  }
  settings(scene = null) {
    const s = this.progress.settings;
    this.panel(
      "تنظیمات",
      `<div class="setting-row wall-setting"><span>حالت نمایشگر وال<small>متن درشت، تصویر واضح‌تر و حاشیهٔ امن</small></span><button class="switch" role="switch" aria-label="حالت نمایشگر وال" aria-checked="${s.wallMode}" data-action="wallMode"></button></div><div class="setting-row"><span>موسیقی</span><button class="switch" role="switch" aria-label="موسیقی" aria-checked="${s.music}" data-action="music"></button></div><div class="setting-row"><span>جلوه‌های صوتی</span><button class="switch" role="switch" aria-label="جلوه‌های صوتی" aria-checked="${s.sfx}" data-action="sfx"></button></div><label class="setting-row"><span>بلندی صدا</span><input aria-label="بلندی صدا" type="range" min="0" max="100" value="${s.volume * 100}"></label><div class="setting-row"><span>حرکت‌های تزئینی کمتر<small>پرش و حرکت اصلی تغییری نمی‌کند</small></span><button class="switch" role="switch" aria-label="حرکت‌های تزئینی کمتر" aria-checked="${s.reducedMotion}" data-action="reducedMotion"></button></div><div class="setting-row"><span>دکمه‌های لمسی<small>در گوشی به‌صورت خودکار نمایش داده می‌شوند</small></span><button class="switch" role="switch" aria-label="دکمه‌های لمسی" aria-checked="${s.touch}" data-action="touch"></button></div><div class="settings-footer"><button class="text-btn" data-action="fullscreen">${icon("full")} تمام‌صفحه</button><button class="text-btn" data-action="reset">پاک‌کردن پیشرفت</button></div><p class="sample-note">فقط روی همین مرورگر ذخیره می‌شود. بازی هیچ اطلاعات شخصی دریافت نمی‌کند.</p>`,
      {
        type: "settings",
        onClose: () => (scene ? this.pauseMenu(scene) : null),
      },
    );
    for (const key of ["music", "sfx", "reducedMotion", "touch", "wallMode"])
      this.bind(key, () => {
        this.progress.setSetting(key, !this.progress.settings[key]);
        this.root
          .querySelector(`[data-action="${key}"]`)
          .setAttribute("aria-checked", this.progress.settings[key]);
        this.applySettings();
      });
    this.root.querySelector("input[type=range]").oninput = (e) => {
      this.progress.setSetting("volume", Number(e.target.value) / 100);
      this.applySettings();
    };
    this.bind("fullscreen", () => this.toggleFullscreen());
    this.bind("reset", () => {
      this.panel(
        "یک شروع تازه؟",
        '<p>مرحله‌های بازشده و بهترین امتیازها پاک می‌شوند. تنظیمات صدا باقی می‌مانند.</p><button class="primary" data-action="confirm-reset">شروع تازه</button><button class="secondary" data-action="cancel-reset">برگشت</button>',
        { type: "reset", onClose: () => this.settings(scene) },
      );
      this.bind("confirm-reset", () => {
        this.progress.reset();
        this.backToMenu();
        this.feedback("همه‌چیز آمادهٔ یک ماجراجویی تازه است");
      });
      this.bind("cancel-reset", () => this.settings(scene));
    });
  }
  help(scene = null) {
    this.panel(
      "راهنمای ماجراجویی",
      `<div class="help-grid"><div class="help-item"><strong>حرکت و پرش</strong><span><kbd>← →</kbd> یا <kbd>A D</kbd> برای حرکت<br><kbd>Space</kbd> یا <kbd>W ↑</kbd> برای پرش<br>پرش را نگه‌دار تا بالاتر بروی.</span></div><div class="help-item"><strong>با خیال راحت کشف کن</strong><span><kbd>Esc</kbd> یا <kbd>P</kbd> برای توقف<br>اگر افتادی، از آخرین ایستگاه ادامه می‌دهی.<br>نشان‌های کمیاب امتیاز بیشتری دارند.</span></div></div><div class="help-learning"><div><b>سکوهای واژه</b><p>معنی واژه را بخوان و روی سکوی پاسخ فرود بیا.</p></div><div><b>دروازهٔ معما</b><p>وارد دروازهٔ پاسخ شو و کلید پرش را بزن.</p></div><div><b>مسیر جمله</b><p>واژه‌ها را از اولین واژه، به ترتیب با پرش جمع کن.</p></div></div><p class="sample-note">سه معمای درستِ پی‌درپی، امتیاز نشان‌ها را برای چند ثانیه دو برابر می‌کند. هر پاسخ فرصت دوباره دارد.</p>`,
      {
        wide: true,
        type: "help",
        onClose: () => (scene ? this.pauseMenu(scene) : null),
      },
    );
  }
  results(scene, r) {
    this.updateTouch();
    this.modal = "result";
    this.root.innerHTML = `<div class="modal-backdrop"><section class="panel result-panel" role="dialog" aria-modal="true" aria-label="نتیجهٔ مرحله"><div class="result-symbol">${"✦".repeat(r.stars)}${"✧".repeat(3 - r.stars)}</div><div class="result-kicker">دنیای ${fa(scene.level.id + 1)} کامل شد</div><h2>${scene.level.id === 2 ? "تام را کشف کردی!" : "چه سفر خوبی بود!"}</h2><p>${scene.level.id === 2 ? "هر سه دنیا را کشف کردی. ماجراجویی بعدی می‌تواند بهتر هم باشد." : "نشان‌ها را جمع کردی؛ یک مسیر تازه منتظر توست."}</p><div class="stats-grid"><div class="stat"><b>${fa(r.score)}</b><span>امتیاز</span></div><div class="stat"><b>${fa(r.collected)}</b><span>نشان از ${fa(r.total)}</span></div><div class="stat"><b>${fa(r.accuracy)}٪</b><span>انتخاب درست</span></div><div class="stat"><b>${fa(r.bestStreak)}</b><span>بهترین زنجیره</span></div></div><p class="sample-note">${fa(r.solved)} معما حل شد · ${fa(r.secrets)} نشانِ کمیاب · ${fa(Math.floor(r.seconds / 60))} دقیقه و ${fa(r.seconds % 60)} ثانیه</p><div class="result-buttons"><button class="primary" data-action="next">${scene.level.id < 2 ? "دنیای بعدی" : "بازگشت به دنیاها"} <span>←</span></button><button class="secondary" data-action="replay">دوباره بازی کن</button></div><div class="result-foot"><button class="text-btn" data-action="home">${icon("home")} منوی اصلی</button></div></section></div>`;
    this.bind("next", () =>
      scene.level.id < 2
        ? this.startLevel(scene.level.id + 1)
        : this.backToMenu(),
    );
    this.bind("replay", () => this.startLevel(scene.level.id));
    this.bind("home", () => this.backToMenu());
    this.focusTrap(this.root.querySelector(".modal-backdrop"));
  }
}
