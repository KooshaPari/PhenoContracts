# PhenoContracts — Work State

## Decision: KEEP as standalone (2026-07-07)

PhenoContracts has **real, substantive code** — both TypeScript port interfaces
and a Rust workspace with 3 crates. The original audit's claim of "zero substantive
content" was incorrect. Code is NOT trivial and NOT duplicated elsewhere.

### Why not merge into PhenoSpecs
PhenoSpecs is explicitly a **documentation-only specification registry**
("no code build" per its AGENTS.md, "Implementation Code is out of scope" per its
CHARTER.md). Merging Rust crates + TypeScript port adapters would violate its charter.

### Why not archive
The code is real, compilable, tested, and has a clear purpose (formal-verification
port contracts for the Phenotype ecosystem). Worth keeping as an active workspace.

---

## Current Content

### TypeScript side (`ports/`)
- `contract_verifier.ts` — Port interface: `ContractVerifier`, `Contract`, `Verdict`
- `adapters/kani.ts` — Kani model checker adapter
- `adapters/prusti.ts` — Prusti deductive verifier adapter
- `tests/contract_verifier.test.ts` — Port contract compliance tests
- `registry.ts` + `index.ts` — Re-exports

### Rust workspace (`rust/crates/`) — 3 crates

| Crate | Lines | Key Types |
|-------|-------|-----------|
| `phenotype-contracts` | 112 + benches + property tests | `Contract`, `Verdict`, `RunId`, `ContractVerifier` trait |
| `phenotype-port-interfaces` | 113 | `Backend` enum, `VerifyRequest/Response`, `PortError`, `Port` trait |
| `phenotype-port-traits` | 75 | `BackendTag`, `Tagged`/`PortBase` traits, `TraitError` |

Total: **~423 lines of Rust** (3 lib.rs + benches + property tests) + unit tests,
criterion benchmarks, and proptest property tests.

### Known structural debt
The 3 Rust crates have overlapping concerns:
- `phenotype-contracts::ContractVerifier` / `phenotype-port-interfaces::Port` / `phenotype-port-traits::PortBase` all define async port traits with similar shape
- `phenotype-port-interfaces::Backend` / `phenotype-port-traits::BackendTag` are nearly identical enums

This suggests premature crate splitting. A future consolidation pass could merge
the three crates into one `phenotype-contracts` crate with feature-gated modules,
but this doesn't affect the keep-vs-archive decision.

---

## Current DAG Stage: 2 (Hexagonal / Layer Refactor)

### Stage 0 — State Unification

- [x] Repo initialized with real content
- [x] `.github/dependabot.yml` present (monthly cargo)
- [x] `rust/Cargo.lock` present
- [x] LICENSE, LICENSE-MIT, LICENSE-APACHE present
- [ ] **TODO:** Push to GitHub remote (currently local-only)

### Stage 1 — Tooling Standardization

- [x] `AGENTS.md`
- [x] `STATUS.md`
- [x] `Taskfile.yml` SSOT recipes
- [x] `.github/workflows/ci.yml` GitHub Actions
- [ ] **TODO:** Verify CI green on GitHub

### Stage 2 — Hexagonal / Layer Refactor

- [x] `ContractVerifier` port (`ports/contract_verifier.ts`)
- [x] Kani adapter (`ports/adapters/kani.ts`)
- [x] Prusti adapter (`ports/adapters/prusti.ts`)
- [x] Coq adapter: missing (only 2 of 3 adapters)
- [x] Port contract tests (`ports/tests/contract_verifier.test.ts`)

### Stage 3 — QA Hardening

- [ ] Coverage gate (80% threshold)
- [ ] SAST (CodeQL)
- [ ] SBOM / cargo-deny for Rust adapter

## Pending Work

1. Push to GitHub: `gh repo create KooshaPari/PhenoContracts --public --source=. --remote=origin --push`
2. Implement Coq adapter (third backend)
3. Add coverage gate
4. Consider consolidating the 3 Rust crates into one (structural debt fix)
