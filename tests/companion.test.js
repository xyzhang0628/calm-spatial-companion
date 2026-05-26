import { describe, it, expect, beforeEach } from "vitest";
import { Companion } from "../src/companion.js";

describe("Companion", () => {
  let companion;
  const testAtmosphere = { name: "Clear Sky", icon: "🌤️", intensity: 0.2 };

  beforeEach(() => {
    companion = new Companion();
  });

  it("starts in idle mode", () => {
    expect(companion.mode).toBe("idle");
    expect(companion.isActive()).toBe(false);
  });

  it("startWalk sets mode to walking", () => {
    const status = companion.startWalk(testAtmosphere);
    expect(status.mode).toBe("walking");
    expect(companion.isActive()).toBe(true);
  });

  it("startRun sets mode to running", () => {
    const status = companion.startRun(testAtmosphere);
    expect(status.mode).toBe("running");
    expect(companion.isActive()).toBe(true);
  });

  it("getPace returns correct pace for walking", () => {
    companion.startWalk(testAtmosphere);
    expect(companion.getPace()).toBe("~4.5 km/h");
  });

  it("getPace returns correct pace for running", () => {
    companion.startRun(testAtmosphere);
    expect(companion.getPace()).toBe("~8.0 km/h");
  });

  it("getPace returns null when idle", () => {
    expect(companion.getPace()).toBeNull();
  });

  it("stop returns to idle and reports duration", () => {
    companion.startWalk(testAtmosphere);
    const result = companion.stop();
    expect(result.stopped).toBe(true);
    expect(typeof result.duration).toBe("number");
    expect(companion.mode).toBe("idle");
  });

  it("getStatus includes atmosphere", () => {
    companion.startRun(testAtmosphere);
    const status = companion.getStatus();
    expect(status.atmosphere).toEqual(testAtmosphere);
  });
});
