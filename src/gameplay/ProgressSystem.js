const KEY = "jarqegard.v1";
const defaults = () => ({
  version: 1,
  grade: 7,
  settings: {
    music: true,
    sfx: true,
    volume: 0.55,
    reducedMotion: false,
    touch: false,
    enemies: false,
  },
  grades: {
    7: { unlocked: 1, results: {} },
    8: { unlocked: 1, results: {} },
    9: { unlocked: 1, results: {} },
  },
});
export function sanitizeProgress(raw) {
  const clean = defaults();
  if (!raw || raw.version !== 1) return clean;
  if ([7, 8, 9].includes(raw.grade)) clean.grade = raw.grade;
  const s = raw.settings || {};
  for (const k of ["music", "sfx", "reducedMotion", "touch", "enemies"])
    if (typeof s[k] === "boolean") clean.settings[k] = s[k];
  if (Number.isFinite(s.volume))
    clean.settings.volume = Math.max(0, Math.min(1, s.volume));
  for (const grade of [7, 8, 9]) {
    const g = raw.grades?.[grade];
    if (!g) continue;
    clean.grades[grade].unlocked = Number.isInteger(g.unlocked)
      ? Math.max(1, Math.min(3, g.unlocked))
      : 1;
    for (const id of [0, 1, 2]) {
      const r = g.results?.[id];
      if (!r || !Number.isFinite(r.score) || !Number.isInteger(r.stars))
        continue;
      clean.grades[grade].results[id] = {
        score: Math.max(0, Math.min(r.score, 9999999)),
        stars: Math.max(1, Math.min(3, r.stars)),
      };
    }
  }
  return clean;
}
export class ProgressSystem {
  constructor(storage) {
    this.storage = storage;
    this.available = true;
    try {
      this.data = sanitizeProgress(JSON.parse(storage?.getItem(KEY) || "null"));
    } catch {
      this.data = defaults();
      this.available = false;
    }
  }
  save() {
    try {
      this.storage?.setItem(KEY, JSON.stringify(this.data));
    } catch {
      this.available = false;
    }
  }
  get settings() {
    return this.data.settings;
  }
  get grade() {
    return this.data.grade;
  }
  get progress() {
    return this.data.grades[this.grade];
  }
  setGrade(grade) {
    if ([7, 8, 9].includes(grade)) {
      this.data.grade = grade;
      this.save();
    }
  }
  setSetting(key, value) {
    if (key in this.settings) {
      this.settings[key] = value;
      this.save();
    }
  }
  complete(level, result) {
    const g = this.progress;
    g.unlocked = Math.max(g.unlocked, Math.min(3, level + 2));
    const old = g.results[level];
    g.results[level] = {
      score: Math.max(old?.score || 0, result.score),
      stars: Math.max(old?.stars || 0, result.stars),
    };
    this.save();
  }
  reset() {
    const settings = { ...this.settings },
      grade = this.grade;
    this.data = defaults();
    this.data.settings = settings;
    this.data.grade = grade;
    this.save();
  }
}
