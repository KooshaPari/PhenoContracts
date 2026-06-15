/**
 * Centralized adapter registry.
 *
 * Maps each {@link Backend} literal to the concrete adapter class that
 * implements it. Used by port-contract tests, by consumers that want to
 * resolve a backend string, and by the property tests (which iterate
 * over every supported backend to verify the contract).
 */
import { CoqVerifier } from "./adapters/coq";
import { KaniVerifier } from "./adapters/kani";
import { PrustiVerifier } from "./adapters/prusti";
import type { Backend, ContractVerifier } from "./contract_verifier";

export const BACKENDS: readonly Backend[] = ["kani", "prusti", "coq"] as const;

export function createVerifier(backend: Backend): ContractVerifier {
  switch (backend) {
    case "kani":
      return new KaniVerifier();
    case "prusti":
      return new PrustiVerifier();
    case "coq":
      return new CoqVerifier();
    default: {
      const _exhaustive: never = backend;
      throw new Error(`Unknown backend: ${String(_exhaustive)}`);
    }
  }
}

export { CoqVerifier } from "./adapters/coq";
export { KaniVerifier } from "./adapters/kani";
export { PrustiVerifier } from "./adapters/prusti";
export type { Backend, Contract, ContractVerifier, Verdict } from "./contract_verifier";
