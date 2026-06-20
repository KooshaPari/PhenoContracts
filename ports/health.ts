/** T80: PhenoContracts health/status metadata for verifiers and library output. */
export type HealthStatus = "ok" | "degraded" | "unavailable";

export interface HealthSnapshot {
  readonly status: HealthStatus;
  readonly version: string;
  readonly uptimeMs: number;
  readonly checks: Readonly<Record<string, HealthCheck>>;
  readonly ts: string;
}

export interface HealthCheck {
  readonly status: HealthStatus;
  readonly detail?: string;
  readonly observedAt: string;
}

export const LIB_VERSION = "0.1.0";

const startedAt = Date.now();

export function createHealthSnapshot(
  checks: Record<string, HealthCheck>,
  version: string = LIB_VERSION,
): HealthSnapshot {
  const statuses = Object.values(checks).map((c) => c.status);
  let overall: HealthStatus = "ok";
  if (statuses.includes("unavailable")) overall = "unavailable";
  else if (statuses.includes("degraded")) overall = "degraded";
  return {
    status: overall,
    version,
    uptimeMs: Date.now() - startedAt,
    checks,
    ts: new Date().toISOString(),
  };
}

export function okCheck(detail?: string): HealthCheck {
  return { status: "ok", detail, observedAt: new Date().toISOString() };
}

export function degradedCheck(detail: string): HealthCheck {
  return { status: "degraded", detail, observedAt: new Date().toISOString() };
}

export function unavailableCheck(detail: string): HealthCheck {
  return { status: "unavailable", detail, observedAt: new Date().toISOString() };
}
