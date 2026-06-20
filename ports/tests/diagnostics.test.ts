import { describe, expect, it } from "vitest";
import { KaniVerifier } from "../adapters/kani";
import { PrustiVerifier } from "../adapters/prusti";
import { reportHealth, runDiagnostics } from "../diagnostics";
import type { LogRecord } from "../logger";
import { StructuredLogger } from "../logger";

const CONTRACTS = [
  { name: "c1", predicate: "true", target: "fn1" },
  { name: "c2", predicate: "true", target: "fn2" },
];

describe("diagnostics", () => {
  it("runs every contract on every verifier", async () => {
    const report = await runDiagnostics(CONTRACTS, [new KaniVerifier(), new PrustiVerifier()]);
    expect(report.results).toHaveLength(4);
    expect(report.summary.ok).toBe(4);
    expect(report.summary.failed).toBe(0);
  });
  it("emits structured log records", async () => {
    const records: LogRecord[] = [];
    const logger = new StructuredLogger({ write: (r) => records.push(r) }, "diag-test", "info");
    await runDiagnostics(CONTRACTS.slice(0, 1), [new KaniVerifier({ logger })], logger);
    expect(records.find((r) => r.msg === "diagnostics.start")).toBeDefined();
    expect(records.find((r) => r.msg === "diagnostics.done")).toBeDefined();
    expect(records.find((r) => r.msg === "diagnostics.row")).toBeDefined();
  });
  it("aggregates health across verifiers", () => {
    const health = reportHealth([new KaniVerifier(), new PrustiVerifier()]);
    expect(health.status).toBe("ok");
    expect(Object.keys(health.checks).some((k) => k.startsWith("kani"))).toBe(true);
    expect(Object.keys(health.checks).some((k) => k.startsWith("prusti"))).toBe(true);
  });
});
