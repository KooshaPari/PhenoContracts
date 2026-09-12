# PhenoContracts — Work State

## Current DAG Stage: 2 (Hexagonal / Layer Refactor)

The `ContractVerifier` port is defined with 3 protocol adapters (Kani, Prusti and Coq). Tests validate
port contract compliance.

## Stage 0 — State Unification

- [x] GitHub repository and PR #36 exist
- [x] `.github/dependabot.yml` present (monthly cargo)
- [x] `rust/Cargo.lock` present
- [x] Branch published in PR #36; merge and release remain gated
- [x] LICENSE-MIT + LICENSE-APACHE present

## Stage 1 — Tooling Standardization

- [x] `AGENTS.md` (this file)
- [x] `STATUS.md` (this file)
- [x] `Taskfile.yml` SSOT recipes
- [x] `.github/workflows/ci.yml` GitHub Actions
- [ ] **TODO:** Verify CI green on GitHub

## Stage 2 — Hexagonal / Layer Refactor

- [x] `ContractVerifier` port (`ports/contract_verifier.ts`)
- [x] Kani adapter (`ports/adapters/kani.ts`)
- [x] Prusti adapter (`ports/adapters/prusti.ts`)
- [x] Coq protocol adapter (`ports/adapters/coq.ts`)
- [x] Port contract tests (`ports/tests/contract_verifier.test.ts`)

## Stage 3 — QA Hardening

- [ ] Coverage gate (80% threshold)
- [ ] SAST (CodeQL)
- [ ] SBOM / cargo-deny for Rust adapter

## Pending Work

1. Obtain final-head review acceptance for PR #36 and resolve external checks.
2. Review Mergify automation policy before changing its held configuration.
3. Restore matching Infisical runner capacity; review external Kilo failure.
4. Validate a trusted solver wrapper and actual consuming application against the
   correlated JSON protocol in README.md. Adapter fixtures do not prove solver integration.
5. Establish remaining coverage, SAST and Rust evidence gates above.

This tracker does not attest release readiness or an installed solver backend.
