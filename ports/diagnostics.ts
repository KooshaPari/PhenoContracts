/** T80: PhenoContracts diagnostics — surface verification results across all adapters. */
import { KaniVerifier } from "./adapters/kani";
import { PrustiVerifier } from "./adapters/prusti";
import type { Contract, ContractVerifier, Verdict } from "./contract_verifier";
import type { HealthCheck, HealthSnapshot } from "./health";
import { createHealthSnapshot } from "./health";
import type { Logger } from "./logger";
import { createLogger, silentSink } from "./logger";

export interface DiagnosticResult {
  readonly backend: ContractVerifier["backend"];
  readonly contract: string;
  readonly verdict: Verdict;
  readonly health: HealthSnapshot;
}

export interface DiagnosticsReport {
  readonly startedAt: string;
  readonly finishedAt: string;
  readonly results: readonly DiagnosticResult[];
  readonly summary: {
    readonly total: number;
    readonly ok: number;
    readonly failed: number;
  };
}

export function defaultVerifiers(logger?: Logger): ContractVerifier[] {
  return [new KaniVerifier({ logger }), new PrustiVerifier({ logger })];
}

export async function runDiagnostics(
  contracts: readonly Contract[],
  verifiers: readonly ContractVerifier[] = defaultVerifiers(),
  logger: Logger = createLogger({ scope: "diagnostics", sink: silentSink }),
): Promise<DiagnosticsReport> {
  const startedAt = new Date().toISOString();
  logger.info("diagnostics.start", { contracts: contracts.length, backends: verifiers.length });
  const results: DiagnosticResult[] = [];
  for (const v of verifiers) {
    for (const c of contracts) {
      const verdict = await v.verify(c);
      const health = v.health();
      results.push({ backend: v.backend, contract: c.name, verdict, health });
      logger.info("diagnostics.row", {
        backend: v.backend,
        contract: c.name,
        ok: verdict.ok,
        durationMs: verdict.durationMs,
      });
    }
  }
  const ok = results.filter((r) => r.verdict.ok).length;
  const finishedAt = new Date().toISOString();
  logger.info("diagnostics.done", { total: results.length, ok, failed: results.length - ok });
  return {
    startedAt,
    finishedAt,
    results,
    summary: { total: results.length, ok, failed: results.length - ok },
  };
}

export function reportHealth(verifiers: readonly ContractVerifier[]): HealthSnapshot {
  const checks: Record<string, HealthCheck> = {};
  for (const v of verifiers) {
    const snap = v.health();
    for (const [name, check] of Object.entries(snap.checks)) {
      checks[`${v.backend}.${name}`] = check;
    }
  }
  return createHealthSnapshot(checks);
}
