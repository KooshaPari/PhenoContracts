import { describe, expect, it } from "vitest";
import { createHealthSnapshot, degradedCheck, okCheck, unavailableCheck } from "../health";

describe("health", () => {
  it("aggregates ok when all checks ok", () => {
    const snap = createHealthSnapshot({ a: okCheck(), b: okCheck() });
    expect(snap.status).toBe("ok");
    expect(snap.version).toBeDefined();
    expect(typeof snap.uptimeMs).toBe("number");
    expect(snap.checks.a?.status).toBe("ok");
  });
  it("degraded if any check degraded", () => {
    const snap = createHealthSnapshot({ a: okCheck(), b: degradedCheck("slow") });
    expect(snap.status).toBe("degraded");
  });
  it("unavailable overrides degraded", () => {
    const snap = createHealthSnapshot({
      a: degradedCheck("d"),
      b: unavailableCheck("down"),
    });
    expect(snap.status).toBe("unavailable");
  });
  it("timestamp is ISO", () => {
    const snap = createHealthSnapshot({});
    expect(() => new Date(snap.ts).toISOString()).not.toThrow();
  });
});
