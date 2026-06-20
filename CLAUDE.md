# CLAUDE.md — Project Layout

## Project: PhenoContracts

Hexagonal port contracts for **formal verification adapters** in the Phenotype ecosystem.

## Repository Layout

```
PhenoContracts/
├── ports/
│   ├── contract_verifier.ts            # Port interface (Contract, Verdict, ContractVerifier)
│   ├── adapters/
│   │   ├── kani.ts                     # Kani model checker adapter
│   │   └── prusti.ts                   # Prusti deductive verifier adapter
│   │   └── coq.ts                      # Coq proof assistant adapter (planned, see STATUS.md)
│   └── tests/
│       └── contract_verifier.test.ts   # Port contract compliance tests (Vitest)
├── rust/
│   └── Cargo.lock                      # Cargo lockfile for adapter Rust implementations
├── .github/
│   ├── dependabot.yml                  # Dependabot config (monthly cargo updates)
│   └── workflows/ci.yml                # CI workflow
├── AGENTS.md                           # Agent governance + conventions
├── CLAUDE.md                           # This file — project layout for Claude
├── LICENSE-MIT                         # MIT license
├── LICENSE-APACHE                      # Apache-2.0 license
├── README.md                           # User-facing documentation
├── STATUS.md                           # Work state / DAG stage tracker
└── Taskfile.yml                        # SSOT task recipes (install, typecheck, lint, test, build, quality)
```

## Hexagonal Architecture

- **Port** (`ports/contract_verifier.ts`) — the `ContractVerifier` interface, plus the `Contract` input and `Verdict` output value types. No implementation, no backend details.
- **Adapters** (`ports/adapters/*.ts`) — concrete implementations of the port, one per verification backend.
  - `KaniVerifier` — Rust model checker (AWS Kani).
  - `PrustiVerifier` — Rust deductive verifier (Prusti).
  - `CoqVerifier` — interactive proof assistant (planned).
- **Tests** (`ports/tests/*.test.ts`) — verify that adapters satisfy the port contract (object-safety, backend tag, return shape).

## Key Conventions

- Ports define trait interfaces only; adapters implement them; tests check port contract compliance.
- Adapters must export a class with a `readonly backend` discriminant (`"kani" | "prusti" | "coq"`).
- All files dual-licensed MIT/Apache-2.0.

## Common Tasks

| Task               | Command                |
| ------------------ | ---------------------- |
| Install deps       | `bun install`          |
| Type-check         | `bunx tsc --noEmit`    |
| Lint               | `bunx biome check .`   |
| Run tests          | `bunx vitest run`      |
| Build              | `bun run build`        |
| Full quality gate  | `task quality`         |

See `AGENTS.md` for the full agent governance document and `STATUS.md` for the current DAG stage.
