# PhenoContracts

PhenoContracts: shared Phenotype API contracts for formal verification.

A hexagonal contract-verification port with multi-backend support (Prusti,
Kani, Coq) and a polyglot workspace combining TypeScript (port interface,
registry, tests) with Rust (core contract models, port interfaces, traits).

## Build

```bash
# Install JS dependencies
npm install

# Build TypeScript sources
npm run build

# Build Rust workspace (contract models, port interfaces, traits)
cd rust && cargo build --workspace --all-features
```

## Test

```bash
# Run TypeScript tests (vitest)
npm test

# Run Rust tests
cd rust && cargo test --workspace --all-features

# Run full CI suite
just ci
```

## Quality

```bash
# TypeScript typecheck + lint + test
npm run quality

# Rust lints
cd rust && cargo clippy --workspace --all-targets --all-features -- -D warnings
cd rust && cargo fmt --all --check

# Security audit
cargo audit
cargo deny check
```

## License

MIT — see [LICENSE](LICENSE).
