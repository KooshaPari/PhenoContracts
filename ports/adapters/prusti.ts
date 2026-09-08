import type { Contract, ContractVerifier, Verdict } from '../contract_verifier';
import { registerBackend } from '../registry';
import { type AdapterOptions, runAdapter, toVerdict } from './runner';

export class PrustiVerifier implements ContractVerifier {
  readonly backend = 'prusti' as const;
  private readonly options: AdapterOptions;

  constructor(options: AdapterOptions = {}) {
    this.options = options;
  }

  async verify(c: Contract): Promise<Verdict> {
    return toVerdict(await runAdapter(this.backend, c, this.options));
  }
  async discharge(c: Contract): Promise<Verdict> {
    return this.verify(c);
  }
}

// Self-register at module load time so `createVerifier("prusti")` works
// without callers having to import the adapter explicitly. See ADR-014 /
// `ports/registry.ts:registerBackend` for the pattern rationale.
registerBackend('prusti', new PrustiVerifier());
