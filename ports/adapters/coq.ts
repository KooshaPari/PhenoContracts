import type { Contract, ContractVerifier, Verdict } from '../contract_verifier';
import { registerBackend } from '../registry';
import { type AdapterOptions, runAdapter, toVerdict } from './runner';

/**
 * Coq proof-assistant adapter.
 *
 * Coq is disabled until a caller configures an executable implementing the
 * adapter JSON protocol. Unconfigured and malformed invocations fail closed.
 */
export class CoqVerifier implements ContractVerifier {
  readonly backend = 'coq' as const;
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

// Self-register at module load time so `createVerifier("coq")` works
// without callers having to import the adapter explicitly.
registerBackend('coq', new CoqVerifier());
