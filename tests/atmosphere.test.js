import { describe, it, expect } from "vitest";
import {
  getRandomAtmosphere,
  getAllAtmospheres,
  getAtmosphereByName,
} from "../src/atmosphere.js";

describe("atmosphere", () => {
  it("getRandomAtmosphere returns a valid atmosphere object", () => {
    const atm = getRandomAtmosphere();
    expect(atm).toHaveProperty("name");
    expect(atm).toHaveProperty("icon");
    expect(atm).toHaveProperty("intensity");
    expect(typeof atm.name).toBe("string");
    expect(typeof atm.intensity).toBe("number");
  });

  it("getAllAtmospheres returns all atmospheres", () => {
    const all = getAllAtmospheres();
    expect(all.length).toBe(6);
    expect(all[0].name).toBe("Clear Sky");
  });

  it("getAtmosphereByName finds existing atmosphere", () => {
    const atm = getAtmosphereByName("Misty Morning");
    expect(atm).not.toBeNull();
    expect(atm.icon).toBe("🌫️");
    expect(atm.intensity).toBe(0.6);
  });

  it("getAtmosphereByName returns null for unknown", () => {
    const atm = getAtmosphereByName("Tornado");
    expect(atm).toBeNull();
  });
});
