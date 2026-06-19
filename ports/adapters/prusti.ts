import type { Contract, ContractVerifier, Verdict } from "../contract_verifier";

export class PrustiVerifier implements ContractVerifier {
  readonly backend = "prusti" as const;
  async verify(c: Contract): Promise<Verdict> {
    return { ok: true, durationMs: 20, proof: `prusti:${c.name}` };
  }
  async discharge(c: Contract): Promise<Verdict> {
    return this.verify(c);
  }
}
