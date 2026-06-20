/**
 * T79: PhenoContracts hexagonal port — ContractVerifier.
 *
 * 3 adapters are defined (or planned) for this port: Kani, Prusti, Coq.
 * Downstream code should depend on the `ContractVerifier` interface and
 * select a concrete adapter at composition time.
 *
 * @example Build a contract and run it through any adapter
 * ```ts
 * import type { Contract, ContractVerifier } from "./ports/contract_verifier";
 * import { KaniVerifier } from "./ports/adapters/kani";
 *
 * const contract: Contract = {
 *   name: "no-overflow-add",
 *   predicate: "forall x: i32, y: i32 :: x.wrapping_add(y) >= i32::MIN",
 *   target: "fn add",
 * };
 *
 * const verifier: ContractVerifier = new KaniVerifier();
 * const verdict = await verifier.verify(contract);
 * if (verdict.ok) console.log("proved");
 * ```
 */

/** A formal property to be checked by a verification backend. */
export interface Contract {
  /** Stable, human-readable identifier for the contract (e.g. `"no-overflow-add"`). */
  readonly name: string;
  /** The property to verify, expressed in the backend's DSL. */
  readonly predicate: string;
  /** The function, type, or lemma the predicate applies to. */
  readonly target: string;
}

/** The result of running a `Contract` through a `ContractVerifier`. */
export interface Verdict {
  /** `true` if the contract holds; `false` if a counterexample was found. */
  readonly ok: boolean;
  /** A reproducer, populated when `ok === false` (typical for model checkers). */
  readonly counterexample?: string;
  /** A proof term or script, populated when `ok === true` (typical for deductive verifiers). */
  readonly proof?: string;
  /** Wall-clock duration the backend took, in milliseconds. */
  readonly durationMs: number;
}

/**
 * The PhenoContracts verification port.
 *
 * Every adapter (Kani, Prusti, Coq) implements this interface so callers
 * can swap backends without changing call sites.
 *
 * @example Pick a backend at runtime
 * ```ts
 * import type { ContractVerifier } from "./ports/contract_verifier";
 *
 * function makeVerifier(backend: "kani" | "prusti" | "coq"): ContractVerifier {
 *   switch (backend) {
 *     case "kani":   return new (require("./ports/adapters/kani").KaniVerifier)();
 *     case "prusti": return new (require("./ports/adapters/prusti").PrustiVerifier)();
 *     case "coq":    throw new Error("Coq adapter not yet implemented");
 *   }
 * }
 * ```
 */
export interface ContractVerifier {
  /** Discriminant identifying the verification backend. */
  readonly backend: "kani" | "prusti" | "coq";
  /** Run the contract through the backend. */
  verify(c: Contract): Promise<Verdict>;
  /** Run with discharge semantics (used by deductive verifiers). */
  discharge(c: Contract): Promise<Verdict>;
}
