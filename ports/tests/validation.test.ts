/**
 * Tests for {@link validateContract} and {@link ContractError}.
 *
 * Covers:
 * - All three empty-field rejection cases (name, predicate, target).
 * - Whitespace-only string rejection.
 * - Valid contract pass-through.
 * - `ContractError` is a typed `Error` subclass (ADR-L14).
 */
import { describe, expect, it } from 'vitest';
import { ContractError, validateContract } from '../validation';
import type { Contract } from '../contract_verifier';

/** Build a valid contract then selectively mutate fields for failure tests. */
function valid(): Contract {
  return { name: 'no_overflow', predicate: 'x + 1 > x', target: 'fn add_one' };
}

describe('validateContract (L14 input validation)', () => {
  // -----------------------------------------------------------------------
  // Rejection: empty & whitespace-only
  // -----------------------------------------------------------------------

  it('rejects empty name', () => {
    const c: Contract = { ...valid(), name: '' };
    expect(() => validateContract(c)).toThrow(ContractError);
  });

  it('rejects blank name (whitespace only)', () => {
    const c: Contract = { ...valid(), name: '   ' };
    expect(() => validateContract(c)).toThrow(ContractError);
  });

  it('rejects empty predicate', () => {
    const c: Contract = { ...valid(), predicate: '' };
    expect(() => validateContract(c)).toThrow(ContractError);
  });

  it('rejects blank predicate', () => {
    const c: Contract = { ...valid(), predicate: '  ' };
    expect(() => validateContract(c)).toThrow(ContractError);
  });

  it('rejects empty target', () => {
    const c: Contract = { ...valid(), target: '' };
    expect(() => validateContract(c)).toThrow(ContractError);
  });

  it('rejects blank target', () => {
    const c: Contract = { ...valid(), target: '\t\n' };
    expect(() => validateContract(c)).toThrow(ContractError);
  });

  // -----------------------------------------------------------------------
  // Acceptance
  // -----------------------------------------------------------------------

  it('accepts a fully valid contract', () => {
    const c = valid();
    expect(validateContract(c)).toBe(c); // returns same ref
  });

  it('accepts contract with minimal single-char fields', () => {
    const c: Contract = { name: 'a', predicate: 'b', target: 'c' };
    expect(validateContract(c)).toBe(c);
  });

  // -----------------------------------------------------------------------
  // ContractError type shape
  // -----------------------------------------------------------------------

  it('ContractError is an Error subclass with typed code', () => {
    try {
      validateContract({ ...valid(), name: '' });
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(ContractError);
      expect((err as ContractError).name).toBe('ContractError');
      expect((err as ContractError).code).toBe('EMPTY_NAME');
    }
  });

  it('ContractError codes are distinct per field', () => {
    const cases: [Partial<Contract>, string][] = [
      [{ name: '' }, 'EMPTY_NAME'],
      [{ predicate: '' }, 'EMPTY_PREDICATE'],
      [{ target: '' }, 'EMPTY_TARGET'],
    ];
    for (const [patch, expectedCode] of cases) {
      try {
        validateContract({ ...valid(), ...patch });
      } catch (err) {
        expect((err as ContractError).code).toBe(expectedCode);
      }
    }
  });
});
