export class Companion {
  constructor() {
    this.mode = "idle";
    this.startTime = null;
    this.atmosphere = null;
  }

  startWalk(atmosphere) {
    this.mode = "walking";
    this.startTime = Date.now();
    this.atmosphere = atmosphere;
    return this.getStatus();
  }

  startRun(atmosphere) {
    this.mode = "running";
    this.startTime = Date.now();
    this.atmosphere = atmosphere;
    return this.getStatus();
  }

  stop() {
    const duration = this.getDuration();
    this.mode = "idle";
    this.startTime = null;
    return { stopped: true, duration };
  }

  getDuration() {
    if (!this.startTime) return 0;
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  getPace() {
    if (this.mode === "walking") return "~4.5 km/h";
    if (this.mode === "running") return "~8.0 km/h";
    return null;
  }

  getStatus() {
    return {
      mode: this.mode,
      duration: this.getDuration(),
      pace: this.getPace(),
      atmosphere: this.atmosphere,
    };
  }

  isActive() {
    return this.mode !== "idle";
  }
}
