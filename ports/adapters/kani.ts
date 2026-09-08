import type { Contract, ContractVerifier, Verdict } from '../contract_verifier';
import { registerBackend } from '../registry';
import { type AdapterOptions, runAdapter, toVerdict } from './runner';
export * from './runner';

// ---------------------------------------------------------------------------
// KaniVerifier
// ---------------------------------------------------------------------------

/**
 * Kani (model checker for Rust) adapter.
 *
 * The constructor accepts {@link AdapterOptions}. When `command` is omitted
 * the adapter is unconfigured and `verify` / `discharge` return
 * `{ ok: false, counterexample: 'backend not configured', durationMs: 0 }`.
 *
 * On a configured invocation the adapter spawns the backend with
 * `shell: false`, passes the contract payload on stdin, and:
 *   - on `exit 0` with non-empty stdout: returns `{ ok: true, proof, durationMs }`;
 *   - on any other outcome: returns `{ ok: false, counterexample, durationMs }`.
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
// works without callers importing the adapter explicitly. Callers that want
// real verification construct `new KaniVerifier({ command: [...] })`.
registerBackend('kani', new KaniVerifier());
