/** T79: PhenoContracts hexagonal port — ContractVerifier. 3 adapters: Kani, Prusti, Coq. */
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
}
