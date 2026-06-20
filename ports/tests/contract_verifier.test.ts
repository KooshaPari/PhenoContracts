import { describe, expect, it } from "vitest";
import { KaniVerifier } from "../adapters/kani";
import { PrustiVerifier } from "../adapters/prusti";

describe("PhenoContracts ports", () => {
  it("KaniVerifier.backend", () => {
    expect(new KaniVerifier().backend).toBe("kani");
  });
  it("PrustiVerifier.backend", () => {
    expect(new PrustiVerifier().backend).toBe("prusti");
  });
  it("KaniVerifier.verify ok", async () => {
    const v = await new KaniVerifier().verify({ name: "n", predicate: "true", target: "fn" });
    expect(v.ok).toBe(true);
  });
  it("PrustiVerifier.discharge", async () => {
    const v = await new PrustiVerifier().discharge({ name: "n", predicate: "true", target: "fn" });
    expect(v.ok).toBe(true);
  });
  it("ContractVerifier interface object-safe", () => {
    const _s: import("../contract_verifier").ContractVerifier = new KaniVerifier();
  });
  it("KaniVerifier.health returns snapshot", () => {
    const snap = new KaniVerifier().health();
    expect(snap.status).toBe("ok");
    expect(snap.version).toBeDefined();
    expect(snap.checks.backend?.status).toBe("ok");
  });
  it("PrustiVerifier.health returns snapshot", () => {
    const snap = new PrustiVerifier().health();
    expect(snap.status).toBe("ok");
    expect(snap.checks.backend?.status).toBe("ok");
  });
});
