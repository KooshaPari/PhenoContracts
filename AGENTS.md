# PhenoContracts — Agent Governance

## Project Overview

Hexagonal port contracts for **formal verification adapters** in the Phenotype ecosystem. Defines a `ContractVerifier` interface with two adapters (Kani model checker + Prusti deductive verifier) and a test suite.

## Stack

- **Language:** TypeScript (ports + adapters + tests)
- **Rust:** Cargo lockfile for adapter Rust implementations
- **Test framework:** Vitest

## Key Commands

```bash
# Install
bun install

# Type-check
bunx tsc --noEmit

# Lint
bunx biome check .

# Test
bunx vitest run

# Build
bun run build
```

## File Map

```
PhenoContracts/
├── ports/
│   ├── contract_verifier.ts   # ContractVerifier port interface
│   ├── adapters/
│   │   ├── kani.ts             # Kani model checker adapter
│   │   └── prusti.ts           # Prusti deductive verifier adapter
│   ├── logger.ts               # Structured logger (zero-dep JSON console wrapper)
│   ├── health.ts               # Health/status snapshot model
│   ├── diagnostics.ts          # Diagnostics runner across all adapters
│   ├── diagnostics_cli.ts      # CLI entry point for diagnostics command
│   └── tests/
│       └── contract_verifier.test.ts  # Port contract tests
├── rust/
│   └── Cargo.lock              # Rust dep lockfile (for adapter impls)
├── .github/dependabot.yml      # Dependabot config (monthly cargo)
├── AGENTS.md                   # This file
├── STATUS.md                   # Work state tracker
├── Taskfile.yml                # SSOT recipes
└── .github/workflows/ci.yml    # CI workflow
```

## Quality Gate

Run all checks before committing:
```bash
task quality
```

This runs: typecheck → lint → test → build.

## Conventions

- **Ports** (`ports/*.ts`) define trait interfaces only — no implementation.
- **Adapters** (`ports/adapters/*.ts`) implement ports. Each adapter is one backend.
- **Tests** (`ports/tests/*.test.ts`) test port contract compliance, not specific adapters.
- All files dual-licensed MIT/Apache-2.0.

## Stage Tracker

See `STATUS.md` for current DAG stage (0-3) and pending items.
