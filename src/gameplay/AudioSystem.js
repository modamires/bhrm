// Three original short looping compositions. No audio files or network are needed.
const TRACKS = [
  {
    bpm: 96,
    notes: [72, 76, 79, 83, 79, 76, 74, 79, 72, 76, 81, 79, 76, 74, 69, 71],
    bass: [48, 53, 55, 48],
  },
  {
    bpm: 86,
    notes: [74, 81, 77, 84, 81, 77, 72, 79, 74, 77, 81, 86, 84, 81, 77, 72],
    bass: [50, 58, 53, 57],
  },
  {
    bpm: 110,
    notes: [76, 79, 83, 86, 83, 79, 74, 78, 76, 81, 84, 88, 86, 83, 79, 74],
    bass: [52, 57, 55, 50],
  },
];
const hz = (n) => 440 * 2 ** ((n - 69) / 12);
export class AudioSystem {
  constructor(progress) {
    this.progress = progress;
    this.ctx = null;
    this.track = 0;
    this.step = 0;
    this.next = 0;
    this.paused = false;
    this.timer = null;
  }
  async unlock() {
    try {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.musicGain = this.ctx.createGain();
        this.fxGain = this.ctx.createGain();
        this.musicGain.connect(this.ctx.destination);
        this.fxGain.connect(this.ctx.destination);
        this.timer = setInterval(() => this.schedule(), 100);
      }
      if (this.ctx.state === "suspended") await this.ctx.resume();
      this.apply();
    } catch {
      /* Audio is optional; gameplay continues. */
    }
  }
  apply() {
    if (!this.ctx) return;
    const s = this.progress.settings,
      t = this.ctx.currentTime;
    this.musicGain.gain.setTargetAtTime(
      s.music && !this.paused ? s.volume * 0.19 : 0,
      t,
      0.08,
    );
    this.fxGain.gain.setTargetAtTime(s.sfx ? s.volume * 0.38 : 0, t, 0.03);
  }
  setTrack(n) {
    this.track = n;
    this.step = 0;
    this.next = this.ctx?.currentTime || 0;
  }
  pause(value) {
    this.paused = value;
    this.apply();
    if (!value) this.next = this.ctx?.currentTime || 0;
  }
  tone(
    freq,
    time,
    duration,
    type = "sine",
    volume = 0.5,
    output = this.fxGain,
    end = freq,
  ) {
    if (!this.ctx || !output) return;
    try {
      const o = this.ctx.createOscillator(),
        g = this.ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, time);
      o.frequency.exponentialRampToValueAtTime(
        Math.max(30, end),
        time + duration,
      );
      g.gain.setValueAtTime(0.001, time);
      g.gain.exponentialRampToValueAtTime(volume, time + 0.009);
      g.gain.exponentialRampToValueAtTime(0.001, time + duration);
      o.connect(g);
      g.connect(output);
      o.start(time);
      o.stop(time + duration + 0.03);
      o.onended = () => {
        o.disconnect();
        g.disconnect();
      };
    } catch {}
  }
  schedule() {
    if (
      !this.ctx ||
      this.ctx.state !== "running" ||
      !this.progress.settings.music ||
      this.paused
    )
      return;
    const t = TRACKS[this.track];
    if (this.next < this.ctx.currentTime)
      this.next = this.ctx.currentTime + 0.02;
    while (this.next < this.ctx.currentTime + 0.22) {
      const i = this.step % t.notes.length;
      this.tone(hz(t.notes[i]), this.next, 0.32, "sine", 0.26, this.musicGain);
      if (i % 4 === 0)
        this.tone(
          hz(t.bass[Math.floor(i / 4)]),
          this.next,
          0.85,
          "triangle",
          0.2,
          this.musicGain,
        );
      this.next += 60 / t.bpm / 2;
      this.step++;
    }
  }
  effect(name) {
    if (
      !this.ctx ||
      this.ctx.state !== "running" ||
      !this.progress.settings.sfx
    )
      return;
    const t = this.ctx.currentTime;
    const melodies = {
      collect: [84, 91],
      correct: [72, 76, 79, 84],
      checkpoint: [67, 72, 76, 84],
      complete: [72, 76, 79, 84, 88, 91],
      wrong: [64, 62],
      secret: [79, 84, 88, 91],
      ui: [79],
    };
    if (name === "jump")
      this.tone(280, t, 0.14, "sine", 0.18, this.fxGain, 560);
    else if (name === "land")
      this.tone(155, t, 0.09, "sine", 0.09, this.fxGain, 70);
    else if (name === "bounce")
      this.tone(180, t, 0.23, "triangle", 0.16, this.fxGain, 740);
    else
      (melodies[name] || melodies.ui).forEach((n, i) =>
        this.tone(
          hz(n),
          t + i * 0.075,
          name === "complete" ? 0.45 : 0.18,
          "sine",
          name === "wrong" ? 0.13 : 0.23,
        ),
      );
  }
}
export { TRACKS };
