# PhenoContracts — Work State

## Current DAG Stage: 2 (Hexagonal / Layer Refactor)

The `ContractVerifier` port is defined with 2 adapters (Kani + Prusti). Tests validate
port contract compliance.

## Stage 0 — State Unification

- [x] Local-only repo with 2 commits
- [x] `.github/dependabot.yml` present (monthly cargo)
- [x] `rust/Cargo.lock` present
- [ ] **TODO:** Push to GitHub remote (currently local-only)
- [ ] **TODO:** LICENSE-MIT + LICENSE-APACHE

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
- [x] Coq adapter: missing (only 2 of 3 adapters)
- [x] Port contract tests (`ports/tests/contract_verifier.test.ts`)

## Stage 3 — QA Hardening

- [ ] Coverage gate (80% threshold)
- [ ] SAST (CodeQL)
- [ ] SBOM / cargo-deny for Rust adapter

## Pending Work

1. Push to GitHub: `gh repo create KooshaPari/PhenoContracts --public --source=. --remote=origin --push`
2. Add LICENSE-MIT + LICENSE-APACHE
3. Implement Coq adapter (third backend)
4. Add coverage gate
