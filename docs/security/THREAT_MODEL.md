---
title: "Threat Model"
version: 0.1.0
lastUpdated: 2026-06-16
---

# Threat Model

> **Source of truth:** PhenoContracts (Phenotype contract verification — formal verification port + Prusti/Kani adapters + contract test bundle)
> **Scope:** Formal-verification tool adapters, contract test bundle, build pipeline, CI/CD, distributed verification results

## Assets

1. **Prusti / Kani adapters** — Generated bindings to formal-verification tools (Prusti for Rust, Kani for model checking). If mutable, can produce false-positive verification results.
2. **Contract test bundle** — JSON/YAML contracts that downstream consumers depend on. If modified, downstream consumers receive incorrect contracts and may reject valid implementations.
3. **Verification results (`*.sarif`, `*.vcy`, `*.json`)** — Output of a verification run. If mutable in transit, consumers may accept unverified code as verified.
4. **CI pipeline** — Builds, runs Prusti/Kani, and bundles contracts. If mutable, can swap the verification binary for a stub that returns "verified" for any input.
5. **Public TS contract verifier (`ports/contract_verifier.ts`)** — TS-side port of the Rust adapter. If a contributor treats it as the canonical contract spec, divergence between TS and Rust sources is a silent fail.

## Threats (STRIDE)

| Category | Threat | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| **Spoofing** | An adversary publishes a fake Prusti or Kani binary under a similar name and downstream CI tools fetch the wrong binary. | Low | Critical | The Prusti and Kani binaries are pinned to 40-char SHAs in `.github/workflows/`. CI verifies the binary checksum on download. The README documents the canonical install paths. |
| **Tampering** | A contract test bundle is modified before being bundled into the published artifact. | Low | High | All contract bundles are content-addressed by SHA-256. The release script verifies the bundle hash matches the registered hash. `cargo update` is run in CI to detect any drift in transitive deps. |
| **Repudiation** | A contributor pushes a contract change and later denies it. | Low | Medium | All commits are signed (gitsign, keyless). Releases are tagged. The git history is the audit trail. |
| **Information Disclosure** | A contract test bundle contains proprietary spec information (internal API shapes) that should not be public. | Medium | Medium | Public bundles use redacted PURLs / placeholder names. Private contracts are stored in a separate non-public registry. CI includes a `secret-scan` step that fails the build on known secret patterns. |
| **Denial of Service** | A malicious or malformed input to the contract verifier (deeply nested JSON, billion-laughs XML) causes a DoS in the verification pipeline. | Medium | Medium | The contract parser enforces `max-depth=64`, `max-array-len=10000`, `max-string-len=1MB`. Prusti is sandboxed with `--rlimit-memory=4GB`. |
| **Elevation of Privilege** | A malicious Rust dependency in the workspace (e.g., a typosquatted crate) executes arbitrary code at build time. | Low | Critical | `Cargo.lock` is committed; CI runs `cargo audit` on every push. `cargo build --locked` prevents drift. The workspace uses `[patch.crates-io]` only for explicitly audited internal forks. |

## Residual Risk and Revision Cadence

The most material residual risk is **TS vs Rust contract divergence** — the TS port `ports/contract_verifier.ts` and the Rust adapters may drift over time, and consumers may treat the TS source as canonical. The strongest available mitigation is to treat the Rust source as canonical and mark the TS port as a derived artifact, but this convention is not enforced by tooling. The next highest residual is **Prusti/Kani binary compromise** — if the upstream tools' release channels are compromised, every consumer of the adapter is affected. This threat model should be revised quarterly (February, May, August, November) or whenever a new formal-verification tool is integrated, a new contract format is added, or the TS port is updated. The revision trigger is any PR that adds a new contract format, integrates a new verification tool, or modifies `ports/contract_verifier.ts`.
