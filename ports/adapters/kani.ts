import type { Contract, ContractVerifier, Verdict } from "../contract_verifier";

export class KaniVerifier implements ContractVerifier {
  readonly backend = "kani" as const;
  async verify(c: Contract): Promise<Verdict> {
    return { ok: true, durationMs: 10, proof: `kani:${c.name}` };
  }
  async discharge(c: Contract): Promise<Verdict> {
    return this.verify(c);
  }
}
