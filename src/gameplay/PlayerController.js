import { PHYSICS as P } from "../config.js";
import { CHARACTER_RENDER as ART } from "../art/Bahram.js";
export class PlayerController {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.physics.add
      .sprite(x, y, "player-idle-0")
      .setScale(ART.scale)
      .setOrigin(0.5, 1)
      .setDepth(30);
    const b = this.sprite.body;
    b.setSize(
      P.bodyWidth * ART.bodyUnits,
      P.bodyHeight * ART.bodyUnits,
    ).setOffset(
      (ART.frameWidth - P.bodyWidth * ART.bodyUnits) / 2,
      ART.soleY - P.bodyHeight * ART.bodyUnits,
    );
    b.setMaxVelocity(P.maxSpeed, P.terminalVelocity);
    b.setCollideWorldBounds(true);
    b.setBounce(0);
    b.setMaxSpeed(-1);
    this.lastGround = -Infinity;
    this.bufferUntil = -Infinity;
    this.previousJump = false;
    this.wasGrounded = false;
    this.facing = 1;
    this.previousVy = 0;
    this.landUntil = 0;
    this.rewardUntil = 0;
    this.state = "idle";
    this.jumpCount = 0;
    this.sprite.play("player-idle");
  }
  reset(x, y) {
    this.sprite.body.reset(x, y);
    this.sprite.body.setVelocity(0, 0);
    this.sprite.body.setAcceleration(0, 0);
    this.lastGround = -Infinity;
    this.bufferUntil = -Infinity;
    this.wasGrounded = false;
    this.previousJump = false;
    this.previousVy = 0;
  }
  update(time, input) {
    const s = this.sprite,
      b = s.body;
    const grounded = b.blocked.down || b.touching.down;
    this.grounded = grounded;
    if (grounded) {
      this.lastGround = time;
      if (!this.wasGrounded && this.previousVy > 220) {
        this.landUntil = time + 145;
        this.scene.particles.burst(s.x, this.feetY, 7, 0xd7e8bc, 70);
        this.scene.audio.effect("land");
      }
    }
    if (input.jump && !this.previousJump) this.bufferUntil = time + P.bufferMs;
    const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    b.setAccelerationX(dir * (grounded ? P.acceleration : P.airAcceleration));
    b.setDragX(grounded ? P.groundDrag : P.airDrag);
    b.setGravityY(b.velocity.y > 0 ? P.gravity * (P.fallMultiplier - 1) : 0);
    if (this.bufferUntil >= time && time - this.lastGround <= P.coyoteMs) {
      b.setVelocityY(P.jumpVelocity);
      this.bufferUntil = -Infinity;
      this.lastGround = -Infinity;
      this.landUntil = 0;
      this.jumpCount++;
      this.scene.audio.effect("jump");
      this.scene.particles.burst(s.x, this.feetY, 4, 0xf3ecc0, 40);
    }
    if (!input.jump && this.previousJump && b.velocity.y < P.jumpCutVelocity)
      b.setVelocityY(P.jumpCutVelocity);
    if (dir) {
      this.facing = dir;
      s.setFlipX(dir < 0);
    }
    let state;
    if (this.scene.finishing) state = "victory";
    else if (!grounded || b.velocity.y < -40)
      state =
        b.velocity.y < 0 ? (b.velocity.y < -510 ? "jump" : "rise") : "fall";
    else if (time < this.landUntil) state = "land";
    else if (time < this.rewardUntil && Math.abs(b.velocity.x) < 60)
      state = "collect";
    else state = Math.abs(b.velocity.x) > 20 ? "run" : "idle";
    if (state !== this.state) {
      this.state = state;
      s.play("player-" + state, true);
    }
    s.anims.timeScale =
      state === "run" ? Math.max(0.45, Math.abs(b.velocity.x) / P.maxSpeed) : 1;
    this.wasGrounded = grounded && b.velocity.y >= 0;
    this.previousVy = b.velocity.y;
    this.previousJump = input.jump;
  }
  reward(time) {
    this.rewardUntil = time + 440;
  }
  get x() {
    return this.sprite.x;
  }
  get y() {
    return this.sprite.y;
  }
  get feetY() {
    return this.sprite.y - ART.footOffset;
  }
}
