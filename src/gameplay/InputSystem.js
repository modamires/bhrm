const MAP = {
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
  Space: "jump",
  KeyW: "jump",
  ArrowUp: "jump",
};
export class InputSystem {
  constructor(onPause) {
    this.keys = new Set();
    this.pointers = new Map();
    this.script = { left: false, right: false, jump: false };
    this.active = false;
    this.blockUntilRelease = false;
    window.addEventListener("keydown", (e) => {
      if (["Escape", "KeyP"].includes(e.code)) {
        e.preventDefault();
        if (!e.repeat) onPause();
        return;
      }
      if (!this.active) return;
      if (MAP[e.code]) {
        e.preventDefault();
        this.keys.add(e.code);
      }
    });
    window.addEventListener("keyup", (e) => this.keys.delete(e.code));
    window.addEventListener("blur", () => {
      this.clear();
      if (this.active) onPause(true);
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.clear();
        if (this.active) onPause(true);
      }
    });
    for (const b of document.querySelectorAll("[data-control]")) {
      b.addEventListener("pointerdown", (e) => {
        if (!this.active) return;
        e.preventDefault();
        b.setPointerCapture(e.pointerId);
        this.pointers.set(e.pointerId, b.dataset.control);
        b.classList.add("pressed");
      });
      const release = (e) => {
        this.pointers.delete(e.pointerId);
        b.classList.remove("pressed");
      };
      b.addEventListener("pointerup", release);
      b.addEventListener("pointercancel", release);
      b.addEventListener("lostpointercapture", release);
      b.addEventListener("contextmenu", (e) => e.preventDefault());
    }
  }
  read() {
    const out = { ...this.script };
    for (const key of this.keys) if (MAP[key]) out[MAP[key]] = true;
    for (const value of this.pointers.values()) out[value] = true;
    return out;
  }
  clear() {
    this.keys.clear();
    this.pointers.clear();
    this.script = { left: false, right: false, jump: false };
    document
      .querySelectorAll(".pressed")
      .forEach((e) => e.classList.remove("pressed"));
  }
}
