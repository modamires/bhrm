import { REWARDS, fa } from "../config.js";
import { questionsFor, shuffled } from "../data/questions.js";
import { label, gateArt } from "../art/Assets.js";
export class EducationSystem {
  constructor(scene) {
    this.scene = scene;
    this.zones = [];
    this.activeZone = null;
    const qs = questionsFor(
      scene.progress.grade,
      scene.level.id + 1,
      scene.level.challenges.length,
      scene.runSeed,
    );
    scene.level.challenges.forEach((x, i) => {
      const q = qs[i];
      if (q) this.createZone(x, q, i);
    });
  }
  createZone(x, q, index) {
    const s = this.scene,
      type = q.kind;
    const z = {
      x,
      q,
      index,
      type,
      solved: false,
      lastChoice: -1,
      nextAllowed: 0,
      attempted: false,
      order: [],
      objects: [],
      step: 0,
    };
    this.zones.push(z);
    z.leftBlock = s.world.static.create(x + 25, 405, "particle")
      .setVisible(false).setDisplaySize(26, 490).refreshBody();
    z.leftBlock.disableBody(true, true);
    z.block = s.world.static
      .create(x + 1163, 405, "particle")
      .setVisible(false)
      .setDisplaySize(26, 490)
      .refreshBody();
    z.blockArt = s.add.graphics().setDepth(15);
    z.blockArt
      .fillStyle(0xb2e6d5, 0.23)
      .fillRoundedRect(x + 1137, 170, 52, 476, 22);
    z.blockArt
      .lineStyle(3, 0xe2f9c4, 0.65)
      .strokeRoundedRect(x + 1137, 170, 52, 476, 22);
    for (let i = 0; i < 9; i++)
      z.objects.push(
        s.add
          .image(x + 1163, 200 + i * 46, "particle")
          .setDepth(16)
          .setTint(0xe4f9c2)
          .setAlpha(0.7),
      );
    const options = shuffled(
      type === "order" ? q.tokens : q.choices,
      index + s.runSeed + q.grade,
    );
    z.numbered = options.some(value => value.length > 20);
    z.choices = [];
    const gap = type === "order" ? 185 : options.length === 4 ? 250 : 290;
    const start = x + 560 - ((options.length - 1) * gap) / 2;
    options.forEach((value, i) => {
      const px = start + i * gap;
      const displayValue = z.numbered ? `گزینهٔ ${fa(i + 1)}` : value;
      if (type === "platform") {
        const body = s.world.platform(px - 112, 545, 224, 52, true);
        const plaque = label(s, px, 572, displayValue, {
          width: 221,
          height: 44,
          size: 30,
          color: "#26475a",
          bg: "#fff4d4",
        });
        z.choices.push({ value, x: px, y: 545, body, art: plaque });
      } else if (type === "gate") {
        const key = gateArt(s, "choice-gate", 210, 153);
        const gate = s.add.image(px, 649, key).setOrigin(0.5, 1).setDepth(11);
        const plaque = label(s, px, 483, displayValue, {
          width: 186,
          height: 62,
          size: 28,
          color: "#22475a",
          bg: "#fff4d4f2",
        });
        z.choices.push({ value, x: px, y: 649, art: gate, label: plaque });
      } else {
        const body = s.world.platform(px - 75, 554, 150, 45, true);
        const plaque = label(s, px, 578, displayValue, {
          width: 180,
          height: 44,
          size: 30,
          color: "#344b62",
          bg: "#fff3ce",
        });
        z.choices.push({
          value,
          x: px,
          y: 554,
          body,
          art: plaque,
          taken: false,
        });
      }
    });
    z.statusText = type === "order" ? "هر واژه را با پریدن روی سکوی آن بردار" : "پاسخ درست، یک راه تازه";
    z.statusGood = false;
    z.revision = 0;
  }
  setStatus(z, text, good = false) {
    z.statusText = text;
    z.statusGood = good;
    z.revision++;
  }
  clearActiveZone() {
    this.activeZone?.leftBlock.disableBody(true, true);
    this.activeZone = null;
  }
  syncActiveZone() {
    const p = this.scene.player;
    const current = this.activeZone;
    if (current && (p.y > 850 || p.x < current.x - 500 || p.x > current.x + 1600 ||
      (current.solved && (p.x > current.x + 1270 || p.x < current.x - 120)))) this.clearActiveZone();
    if (!this.activeZone) {
      this.activeZone = this.zones.find(z => !z.solved && p.x >= z.x + 80 && p.x < z.x + 1210) || null;
      if (this.activeZone) {
        this.activeZone.leftBlock.setActive(true);
        this.activeZone.leftBlock.body.enable = true;
      }
    }
    return this.activeZone;
  }
  choose(z, choice, time) {
    if (z.solved || time < z.nextAllowed || choice.taken) return;
    z.nextAllowed = time + 650;
    const s = this.scene;
    const correct =
      z.type === "order"
        ? choice.value === z.q.tokens[z.step]
        : choice.value === z.q.correctAnswer;
    if (!correct) {
      z.attempted = true;
      s.stats.wrong++;
      s.stats.streak = 0;
      s.stats.attempts++;
      s.audio.effect("wrong");
      const hint =
        z.type === "order"
          ? `واژهٔ بعدی: «${z.q.tokens[z.step]}»`
          : z.q.explanationFa;
      this.setStatus(z, `یک بار دیگه؛ ${hint}`);
      s.ui.feedback(`یک بار دیگه؛ ${hint}`, false);
      return;
    }
    s.stats.attempts++;
    if (z.type === "order") {
      choice.taken = true;
      choice.art.setAlpha(0.3);
      z.order.push(choice.value);
      z.step++;
      s.audio.effect("collect");
      s.particles.burst(choice.x, choice.y - 45, 10, 0xffe49b, 100);
      if (z.step < z.q.tokens.length) {
        this.setStatus(z, "خوبه! حالا واژهٔ بعدی را پیدا کن");
        return;
      }
    }
    this.solve(z, time);
  }
  solve(z, time) {
    const s = this.scene;
    z.solved = true;
    z.leftBlock.disableBody(true, true);
    z.block.disableBody(true, true);
    z.blockArt.destroy();
    z.objects.forEach((o) => o.destroy());
    s.stats.solved++;
    s.stats.streak++;
    s.stats.bestStreak = Math.max(s.stats.bestStreak, s.stats.streak);
    if (!z.attempted) s.stats.firstTry++;
    const bonus = s.stats.streak % REWARDS.streakSize === 0;
    if (bonus) {
      s.bonusUntil = time + REWARDS.bonusSeconds * 1000;
      s.ui.feedback("سه معمای پی‌درپی! امتیاز نشان‌ها دو برابر شد ✦", true);
    } else s.ui.feedback("آفرین! " + z.q.explanationFa, true);
    s.stats.score += REWARDS.correct;
    s.audio.effect("correct");
    s.ui.celebrate();
    s.player.reward(time);
    this.setStatus(z, "✓ " + z.q.explanationFa, true);
    s.particles.burst(s.player.x, s.player.y - 45, 26, 0xffdc85, 220);
    for (let i = 0; i < 5; i++)
      s.addCollectible(
        z.x + 1185 + i * 44,
        590 - Math.sin((i / 4) * Math.PI) * 50,
      );
  }
  update(time, input) {
    const s = this.scene,
      p = s.player,
      b = p.sprite.body;
    this.syncActiveZone();
    const jumpEdge = input.jump && !this.lastJump;
    for (const z of this.zones) {
      if (z.solved || Math.abs(p.x - (z.x + 560)) > 830) continue;
      let occupied = -1;
      z.choices.forEach((choice, i) => {
        if (z.type === "gate") {
          const inside = Math.abs(p.x - choice.x) < 76 && b.bottom > 550;
          choice.art.setTint(inside ? 0xffe9a8 : 0xffffff);
          if (inside && jumpEdge) this.choose(z, choice, time);
        } else if (
          (b.touching.down || b.blocked.down) &&
          Math.abs(b.bottom - choice.y) < 10 &&
          Math.abs(p.x - choice.x) < (z.type === "platform" ? 107 : 72)
        ) {
          occupied = i;
          if (z.lastChoice !== i) this.choose(z, choice, time);
        }
      });
      z.lastChoice = occupied;
    }
    this.lastJump = input.jump;
    s.ui.showQuestion(this.activeZone, s);
  }
  get total() {
    return this.zones.length;
  }
}
