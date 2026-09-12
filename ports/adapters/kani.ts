import type { Contract, ContractVerifier, Verdict } from '../contract_verifier';
import { registerBackend } from '../registry';
import { type AdapterOptions, runAdapter, toVerdict } from './runner';

// ---------------------------------------------------------------------------
// KaniVerifier
// ---------------------------------------------------------------------------

/**
 * Kani protocol adapter. A configured executable must implement the correlated
 * JSON protocol documented in README.md; ordinary prover stdout is insufficient.
 * With neither command nor injected runner, verification fails closed.
 * Success requires exit 0, matching request/backend identity and nonempty proof
 * evidence. Transport failures and malformed evidence return an ok:false verdict.
 */
export class KaniVerifier implements ContractVerifier {
  readonly backend = 'kani' as const;
  private readonly options: AdapterOptions;

  constructor(options: AdapterOptions = {}) {
    this.options = options;
  }

  async verify(c: Contract): Promise<Verdict> {
    const outcome = await runAdapter(this.backend, c, this.options);
    return toVerdict(outcome);
  }

  async discharge(c: Contract): Promise<Verdict> {
    // For Kani, discharge and verify are the same operation.
    return this.verify(c);
  }
}

// Self-register an unconfigured default instance so `createVerifier("kani")`
// works after this adapter module is imported. Callers that want
// real verification construct `new KaniVerifier({ command: [...] })`.
registerBackend('kani', new KaniVerifier());
