import { describe, expect, it } from 'vitest';
import { CoqVerifier } from '../adapters/coq';
import { KaniVerifier } from '../adapters/kani';
import { PrustiVerifier } from '../adapters/prusti';
import { createVerifier, BackendNotFoundError } from '../registry';
import type { ContractVerifier } from '../contract_verifier';
import { okRunner } from './fixtures';

const sample = { name: 'n', predicate: 'true', target: 'fn' } as const;

describe('PhenoContracts ports', () => {
  it('KaniVerifier.backend', () => {
    expect(new KaniVerifier().backend).toBe('kani');
  });
  it('PrustiVerifier.backend', () => {
    expect(new PrustiVerifier().backend).toBe('prusti');
  });
  it('KaniVerifier.verify ok=false when no command configured', async () => {
    const v = await new KaniVerifier().verify(sample);
    expect(v.ok).toBe(false);
    expect(v.proof).toBeUndefined();
    expect(v.counterexample).toBeDefined();
  });
  it('PrustiVerifier.discharge ok=false when no command configured', async () => {
    const v = await new PrustiVerifier().discharge(sample);
    expect(v.ok).toBe(false);
    expect(v.proof).toBeUndefined();
    expect(v.counterexample).toBeDefined();
  });
  it('KaniVerifier verify returns ok=true only when a real backend is configured', async () => {
    const v = await new KaniVerifier({ command: ['fake'], runner: okRunner('kani') }).verify(sample);
    expect(v.ok).toBe(true);
    expect(v.proof).toBe('kani@test-1:proof');
  });
  it('PrustiVerifier discharge returns ok=true only when a real backend is configured', async () => {
    const v = await new PrustiVerifier({ command: ['fake'], runner: okRunner('prusti') }).discharge(sample);
    expect(v.ok).toBe(true);
    expect(v.proof).toBe('prusti@test-1:proof');
  });
  it('ContractVerifier interface object-safe', () => {
    const _s: ContractVerifier = new KaniVerifier();
    const _p: ContractVerifier = new PrustiVerifier();
    const _c: ContractVerifier = new CoqVerifier();
  });
  it('createVerifier throws BackendNotFoundError for unknown backend', () => {
    expect(() => createVerifier('unknown' as never)).toThrow(BackendNotFoundError);
  });
  it('BackendNotFoundError has expected name and properties', () => {
    try {
      createVerifier('unknown' as never);
    } catch (e) {
      expect(e).toBeInstanceOf(BackendNotFoundError);
      const err = e as BackendNotFoundError;
      expect(err.name).toBe('BackendNotFoundError');
      expect(err.backend).toBe('unknown');
      expect(new Set(err.available)).toEqual(new Set(['kani', 'prusti', 'coq']));
    }
  });
});
