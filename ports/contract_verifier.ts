/** T79: PhenoContracts hexagonal port — ContractVerifier. Adapters: Kani, Prusti, Coq. */
import type { HealthCheck, HealthSnapshot } from "./health";

export interface Contract {
  readonly name: string;
  readonly predicate: string;
  readonly target: string;
}
export interface Verdict {
  readonly ok: boolean;
  readonly counterexample?: string;
  readonly proof?: string;
  readonly durationMs: number;
}
export interface ContractVerifier {
  readonly backend: "kani" | "prusti" | "coq";
  verify(c: Contract): Promise<Verdict>;
  discharge(c: Contract): Promise<Verdict>;
  health(): HealthSnapshot;
}
export type { HealthCheck, HealthSnapshot } from "./health";
