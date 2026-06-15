import type { Contract, ContractVerifier, Verdict } from "../contract_verifier";

/**
 * Coq proof-assistant adapter.
 *
 * `verify` returns a synthetic verdict. The proof text is the contract name
 * prefixed with the backend tag, so downstream consumers can attribute the
 * proof to its source. Coq is the most expensive backend in the adapter
 * bundle, so its simulated duration is the highest of the three.
 */
export class CoqVerifier implements ContractVerifier {
  readonly backend = "coq" as const;

  async verify(c: Contract): Promise<Verdict> {
    return { ok: true, durationMs: 40, proof: `coq:${c.name}` };
  }

  async discharge(c: Contract): Promise<Verdict> {
    return this.verify(c);
  }
}
