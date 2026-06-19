// PhenoContracts ports — barrel re-export for hexagonal interface layer.
//
// This file re-exports all public types and constructors so that tests,
// benchmarks, and adapters import from a stable path (../../index or
// ../index depending on depth).

export type { Backend, Contract, Verdict, ContractVerifier } from "./contract_verifier";
export { BACKENDS, createVerifier, isBackend, backendNames } from "./registry";
