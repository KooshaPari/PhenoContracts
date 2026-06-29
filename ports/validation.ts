/**
 * Input validation for PhenoContracts.
 *
 * The audit (L14/L25) identifies that the {@link Contract} type allows empty
 * strings for `name`, `predicate`, and `target`, which can lead to confusing
 * downstream behavior or silent failures. This module provides a validation
 * guard that callers can use at trust boundaries.
 *
 * @module
 */

import type { Contract } from './contract_verifier';

// ---------------------------------------------------------------------------
// ContractError — typed validation error
// ---------------------------------------------------------------------------

/** Error codes produced by {@link validateContract}. */
export type ContractErrorCode = 'EMPTY_NAME' | 'EMPTY_PREDICATE' | 'EMPTY_TARGET';

/**
 * Typed error thrown when a {@link Contract} fails validation.
 *
 * Carries a machine-readable {@link code} so callers can handle specific
 * validation failures programmatically.
 */
export class ContractError extends Error {
  /** Machine-readable error code. */
  readonly code: ContractErrorCode;

  constructor(message: string, code: ContractErrorCode) {
    super(message);
    this.name = 'ContractError';
    this.code = code;
  }
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validate a {@link Contract} value at a trust boundary.
 *
 * Checks that all string fields are non-empty. Returns the contract unchanged
 * on success, or throws {@link ContractError} on failure.
 *
 * @example
 * ```ts
 * const c: Contract = { name: '', predicate: 'true', target: 'fn' };
 * validateContract(c); // throws ContractError with code 'EMPTY_NAME'
 * ```
 */
export function validateContract(c: Contract): Contract {
  if (c.name.trim().length === 0) {
    throw new ContractError('Contract name must be a non-empty string', 'EMPTY_NAME');
  }
  if (c.predicate.trim().length === 0) {
    throw new ContractError('Contract predicate must be a non-empty string', 'EMPTY_PREDICATE');
  }
  if (c.target.trim().length === 0) {
    throw new ContractError('Contract target must be a non-empty string', 'EMPTY_TARGET');
  }
  return c;
}
