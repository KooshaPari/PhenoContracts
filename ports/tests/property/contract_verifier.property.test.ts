/**
 * Property-based tests for the {@link ContractVerifier} port.
 *
 * Mirrors the role of `proptest!` in the Rust ecosystem: arbitrary
 * {@link Contract} values are fed into every backend, and we assert
 * structural invariants of the returned {@link Verdict}.
 *
 * Property tests always invoke the adapters through a configured
 * (in-memory) runner so that the fail-closed contract holds: ok=true
 * requires a real backend invocation that returned valid evidence.
 */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { BACKENDS, CoqVerifier, KaniVerifier, PrustiVerifier } from '../../index';
import type { Backend, Contract, ContractVerifier, Verdict } from '../../index';
import type { AdapterOptions } from '../../adapters/kani';

/** Generator: any well-formed {@link Contract} (non-empty strings, etc). */
const contractArb: fc.Arbitrary<Contract> = fc.record({
  name: fc.string({ minLength: 1, maxLength: 64 }),
  predicate: fc.string({ minLength: 1, maxLength: 256 }),
  target: fc.string({ minLength: 1, maxLength: 128 }),
});

/**
 * A {@link Verdict} must satisfy the documented structural invariants.
 * When ok=true, proof must be present. When ok=false, counterexample must be present.
 */
function assertVerdictInvariants(v: Verdict): void {
  expect(typeof v.ok).toBe('boolean');
  expect(Number.isFinite(v.durationMs)).toBe(true);
  expect(v.durationMs).toBeGreaterThanOrEqual(0);
  if (v.ok) {
    expect(v.proof).toBeDefined();
    expect(typeof v.proof).toBe('string');
    expect(v.proof?.length ?? 0).toBeGreaterThan(0);
    expect(v.counterexample).toBeUndefined();
  } else {
    expect(v.counterexample).toBeDefined();
    expect(typeof v.counterexample).toBe('string');
    expect(v.counterexample?.length ?? 0).toBeGreaterThan(0);
    expect(v.proof).toBeUndefined();
  }
}

function configuredVerifier(backend: Backend, options: AdapterOptions): ContractVerifier {
  switch (backend) {
    case 'kani':
      return new KaniVerifier(options);
    case 'prusti':
      return new PrustiVerifier(options);
    case 'coq':
      return new CoqVerifier(options);
  }
}

describe('PhenoContracts ports — property-based', () => {
  // 100 iterations is the default for fast-check; bump to 200 for higher
  // confidence without slowing the suite materially.
  const NUM_RUNS = 200;

  for (const backend of BACKENDS) {
    describe(`backend=${backend}`, () => {
      // Configure each adapter with a runner that always returns valid evidence
      // so we exercise the success path under arbitrary contract inputs.
      const v = configuredVerifier(backend, {
        command: ['fake'],
        runner: {
          async run() {
            return {
              exitCode: 0,
              signal: null,
              stdout: Buffer.from(JSON.stringify({ ok: true, backend, version: 'property-1', proof: 'proof' })),
              stderr: Buffer.alloc(0),
              timedOut: false,
              durationMs: 1,
            };
          },
        },
      });

      it('verify always returns a Verdict honoring the invariants', async () => {
        await fc.assert(
          fc.asyncProperty(contractArb, async (c) => {
            const verdict = await v.verify(c);
            assertVerdictInvariants(verdict);
            // Backend tag is always present in the proof string (real evidence).
            expect(verdict.proof).toContain(`${backend}@property-1:`);
          }),
          { numRuns: NUM_RUNS }
        );
      });

      it('discharge always returns a Verdict honoring the invariants', async () => {
        await fc.assert(
          fc.asyncProperty(contractArb, async (c) => {
            const verdict = await v.discharge(c);
            assertVerdictInvariants(verdict);
            expect(verdict.proof).toContain(`${backend}@property-1:`);
          }),
          { numRuns: NUM_RUNS }
        );
      });

      it('verify and discharge agree on the same Contract (idempotence)', async () => {
        await fc.assert(
          fc.asyncProperty(contractArb, async (c) => {
            const a = await v.verify(c);
            const b = await v.discharge(c);
            expect(b).toEqual(a);
          }),
          { numRuns: NUM_RUNS }
        );
      });

      it('backend field is stable across calls', () => {
        fc.assert(
          fc.property(fc.constant(null), () => {
            expect(v.backend).toBe(backend);
          }),
          { numRuns: NUM_RUNS }
        );
      });
    });
  }

  it('unconfigured backends always return ok=false (fail-closed)', async () => {
    await fc.assert(
      fc.asyncProperty(contractArb, async (c) => {
        for (const backend of BACKENDS) {
          const v = configuredVerifier(backend, {}); // no command configured
          const ok = await v.verify(c);
          const dis = await v.discharge(c);
          expect(ok.ok).toBe(false);
          expect(ok.proof).toBeUndefined();
          expect(dis.ok).toBe(false);
          expect(dis.proof).toBeUndefined();
        }
      }),
      { numRuns: 20 }
    );
  });

  it('BACKENDS list has no duplicates and is non-empty', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        expect(BACKENDS.length).toBeGreaterThan(0);
        expect(new Set(BACKENDS).size).toBe(BACKENDS.length);
      }),
      { numRuns: 10 }
    );
  });
});
