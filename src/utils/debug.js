// This panel is opt-in (?debug=1). It drives the real controller and physics world.
import { fa } from "../config.js";
import { CHARACTER_RENDER } from "../art/Bahram.js";
export function installDebug(scene) {
  scene.debugReport = "";
  scene.addDebugPanel = () => {
    if (document.getElementById("debug-panel")) return;
    const panel = document.createElement("div");
    panel.id = "debug-panel";
    panel.className = "debug-panel";
    panel.innerHTML =
      '<b>QA / debug</b> <button id="debug-movement">Test movement</button><button id="debug-next">Next puzzle</button><button id="debug-reset">Checkpoint</button><button id="debug-goal">Goal</button><select id="debug-level" aria-label="Debug level"><option value="0">Valley</option><option value="1">Cavern</option><option value="2">Sky</option></select><button id="debug-load">Load</button><button id="debug-answer">Jump on correct choice</button><button id="debug-wrong">Try wrong choice</button><div id="debug-readout" class="debug-readout"></div>';
    document.getElementById("ui").append(panel);
    document.getElementById("debug-next").onclick = () => {
      const z = scene.education.zones.find((z) => !z.solved);
      if (z) {
        scene.player.reset(z.x + 180, 620);
        scene.invulnerableUntil = scene.time.now + 1000;
        scene.cameras.main.scrollX = z.x - 60;
      }
    };
    document.getElementById("debug-reset").onclick = () => {
      scene.invulnerableUntil = 0;
      scene.respawnPlayer();
    };
    document.getElementById("debug-goal").onclick = () =>
      scene.player.reset(scene.level.length - 275, 610);
    document.getElementById("debug-load").onclick = () =>
      scene.ui.startLevel(Number(document.getElementById("debug-level").value));
    const choose = (wrong) => {
      const z = scene.education.zones.find((z) => !z.solved);
      if (!z) return;
      const correct =
        z.type === "order" ? z.q.tokens[z.step] : z.q.correctAnswer;
      const choice = z.choices.find(
        (c) => !c.taken && (wrong ? c.value !== correct : c.value === correct),
      );
      if (!choice) return;
      scene.controls.clear();
      scene.player.reset(choice.x, z.type === "gate" ? 640 : choice.y - 85);
      scene.cameras.main.scrollX = z.x - 60;
      scene.invulnerableUntil = scene.time.now + 1100;
      if (z.type === "gate") {
        let begin = scene.time.now;
        scene.debugTask = (time) => {
          scene.controls.script.jump = time - begin > 160 && time - begin < 280;
          if (time - begin > 400) {
            scene.controls.clear();
            scene.debugTask = null;
          }
        };
      }
    };
    document.getElementById("debug-answer").onclick = () => choose(false);
    document.getElementById("debug-wrong").onclick = () => choose(true);
    document.getElementById("debug-movement").onclick = () =>
      movementTest(scene);
    document.getElementById("debug-level").value = scene.level.id;
  };
  scene.updateDebug = () => {
    const e = document.getElementById("debug-readout");
    if (e)
      e.textContent = `x=${scene.player.x.toFixed(1)} y=${scene.player.y.toFixed(1)} vx=${scene.player.sprite.body.velocity.x.toFixed(1)} vy=${scene.player.sprite.body.velocity.y.toFixed(1)} grounded=${scene.player.grounded} state=${scene.player.state} fps=${scene.game.loop.actualFps.toFixed(1)}\n${scene.debugReport}`;
  };
  scene.addDebugPanel();
}
function movementTest(s) {
  const samples = {};
  let start = s.time.now,
    lastPhase = -1,
    minY = 999,
    shortHeight = 0,
    longHeight = 0;
  s.controls.clear();
  s.player.reset(220, 630);
  s.invulnerableUntil = start + 12000;
  s.debugReport = "Testing live physics…";
  s.debugTask = (time) => {
    let t = time - start;
    const b = s.player.sprite.body;
    let phase = Math.floor(t / 1500);
    if (phase !== lastPhase) {
      lastPhase = phase;
      if (phase === 1) samples.maxSpeed = Math.abs(b.velocity.x);
      if (phase === 2) {
        samples.stopped = Math.abs(b.velocity.x);
        s.player.reset(250, 650 + CHARACTER_RENDER.footOffset);
        minY = 650;
      }
      if (phase === 3) {
        shortHeight = 650 - minY;
        s.player.reset(250, 650 + CHARACTER_RENDER.footOffset);
        minY = 650;
      }
      if (phase === 4) {
        longHeight = 650 - minY;
        s.controls.clear();
        s.debugTask = null;
        const checks = {
          accelerates:
            samples.earlySpeed > 0 && samples.earlySpeed < samples.maxSpeed,
          maxSpeed: samples.maxSpeed <= 286,
          decelerates: samples.stopped < 5,
          shortJump: shortHeight > 25,
          longJump: longHeight > shortHeight + 35,
          landing: Math.abs(b.bottom - 650) < 3,
        };
        s.debugReport = JSON.stringify(
          {
            checks,
            samples,
            shortHeight: Math.round(shortHeight),
            longHeight: Math.round(longHeight),
          },
          null,
          1,
        );
        return;
      }
    }
    s.controls.script.right = phase === 0 && t > 100;
    s.controls.script.jump =
      (phase === 2 && t % 1500 > 100 && t % 1500 < 170) ||
      (phase === 3 && t % 1500 > 100 && t % 1500 < 550);
    if (t > 160 && t < 210) samples.earlySpeed = Math.abs(b.velocity.x);
    if (phase >= 2) minY = Math.min(minY, b.bottom);
  };
}
