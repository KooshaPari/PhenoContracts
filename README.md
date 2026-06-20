<!-- AI-DD-META:START -->
<!-- This repository is planned, maintained, and managed by AI Agents only. -->
<!-- Slop issues are expected and intentionally present as part of an HITL-less -->
<!-- /minimized AI-DD metaproject of learning, refining, and building brute-force -->
<!-- training for both agents and the human operator. -->
![Downloads](https://img.shields.io/github/downloads/KooshaPari/PhenoContracts/total?style=flat-square&label=downloads&color=blue)
![GitHub release](https://img.shields.io/github/v/release/KooshaPari/PhenoContracts?style=flat-square&label=release)
![License](https://img.shields.io/github/license/KooshaPari/PhenoContracts?style=flat-square)
![AI-Slop](https://img.shields.io/badge/AI--DD-Slop%20Expected-orange?style=flat-square)
![AI-Only-Maintained](https://img.shields.io/badge/Planned%20%26%20Maintained%20by-AI%20Agents%20Only-red?style=flat-square)
![HITL-less](https://img.shields.io/badge/HITL--less%20AI--DD-metaproject-yellow?style=flat-square)

> ⚠️ **AI-Agent-Only Repository**
>
> This repo is **planned, maintained, and managed exclusively by AI Agents**.
> Slop issues, rough edges, and AI artifacts are **expected and intentionally
> present** as part of an **HITL-less / minimized AI-DD** metaproject focused
> on learning, refining, and brute-force training both the agents and the
> human operator. Bug reports and contributions are still welcome, but please
> expect AI-generated code, comments, and documentation throughout.
<!-- AI-DD-META:END -->

# PhenoContracts

Hexagonal port contracts for **formal verification adapters** in the Phenotype
ecosystem. Provides a single `ContractVerifier` port with pluggable adapters
that front different formal-verification backends (Kani, Prusti, Coq) so the
rest of the Phenotype stack can request verification without coupling to any
specific tool.

## Contents

- [Installation](#installation)
- [Quickstart](#quickstart)
- [Usage Examples](#usage-examples)
  - [Kani adapter](#kani-adapter)
  - [Prusti adapter](#prusti-adapter)
  - [Coq adapter (planned)](#coq-adapter-planned)
- [API Reference](#api-reference)
- [Build & Test](#build--test)
- [Project Layout](#project-layout)
- [License](#license)

## Installation

PhenoContracts is a TypeScript library. The project pins a Bun toolchain but
any modern Node 22+ runtime works.

```bash
# Clone
git clone https://github.com/KooshaPari/PhenoContracts.git
cd PhenoContracts

# Install dependencies (Bun)
bun install
```

As a dependency in a downstream Phenotype project:

```bash
bun add github:KooshaPari/PhenoContracts
```

## Quickstart

After `bun install`, run the port contract tests to confirm everything works:

```bash
bunx vitest run
```

Verify the port satisfies TypeScript:

```bash
bunx tsc --noEmit
```

Lint with Biome:

```bash
bunx biome check .
```

Or run the full quality gate (typecheck → lint → test → build) via the
included `Taskfile.yml`:

```bash
task quality
```

### A 30-second tour

```ts
import { KaniVerifier } from "./ports/adapters/kani";
import { PrustiVerifier } from "./ports/adapters/prusti";
import type { Contract } from "./ports/contract_verifier";

const contract: Contract = {
  name: "no-overflow-add",
  predicate: "forall x: i32, y: i32 :: x.wrapping_add(y) >= i32::MIN",
  target: "fn add",
};

// Swap adapters freely — they all satisfy the same port.
const kani = await new KaniVerifier().verify(contract);
const prusti = await new PrustiVerifier().verify(contract);

console.log(kani, prusti);
```

## Usage Examples

All adapters implement the same `ContractVerifier` port, so swapping
verification backends is a one-line change. The examples below assume you
have either cloned this repo or installed it as a dependency.

### Kani adapter

[Kani](https://model-checking.github.io/kani/) is an AWS-developed model
checker for Rust. The Kani adapter fronts it behind the `ContractVerifier`
port.

```ts
import { KaniVerifier } from "./ports/adapters/kani";

const verifier = new KaniVerifier();

const verdict = await verifier.verify({
  name: "bounded-index",
  predicate: "0 <= idx && idx < buf.len()",
  target: "fn read_at(buf: &[u8], idx: usize) -> u8",
});

if (!verdict.ok) {
  console.error("Counterexample:", verdict.counterexample);
  process.exit(1);
}

console.log(`Kani proved it in ${verdict.durationMs}ms`);
```

`discharge` is an alias for `verify` provided for parity with deductive
verifiers:

```ts
await verifier.discharge(contract);
```

### Prusti adapter

[Prusti](https://www.pm.inf.ethz.ch/research/prusti.html) is a deductive
verifier for Rust, built on the Viper verification infrastructure. The Prusti
adapter fronts it behind the same `ContractVerifier` port.

```ts
import { PrustiVerifier } from "./ports/adapters/prusti";

const verifier = new PrustiVerifier();

const verdict = await verifier.discharge({
  name: "list-len-non-negative",
  predicate: "result >= 0",
  target: "fn len(&self) -> usize",
});

if (verdict.proof) {
  console.log(`Prusti discharged ${verdict.proof} in ${verdict.durationMs}ms`);
}
```

### Coq adapter (planned)

The Coq adapter is part of the [Stage 2 backlog](STATUS.md); the port
already includes `"coq"` as a valid `backend` discriminant so downstream
consumers can write code against the future API today. When the adapter
ships, the usage will look like:

```ts
import { CoqVerifier } from "./ports/adapters/coq";

const verifier = new CoqVerifier();

const verdict = await verifier.discharge({
  name: "append-associative",
  predicate: "forall a b c :: append(append(a, b), c) = append(a, append(b, c))",
  target: "Lemma append_assoc",
});
```

Until then, see `STATUS.md` for tracking.

## API Reference

The entire public surface lives in [`ports/contract_verifier.ts`](ports/contract_verifier.ts).

### `interface Contract`

A formal property to be checked.

| Field       | Type     | Description                                          |
| ----------- | -------- | ---------------------------------------------------- |
| `name`      | `string` | Stable, human-readable identifier for the contract.  |
| `predicate` | `string` | The property to verify, in the backend's DSL.        |
| `target`    | `string` | The function/type/lemma the predicate applies to.    |

### `interface Verdict`

The result of running a verifier.

| Field            | Type                  | Description                                              |
| ---------------- | --------------------- | -------------------------------------------------------- |
| `ok`             | `boolean`             | `true` if the contract holds.                            |
| `counterexample` | `string \| undefined` | A reproducer when `ok === false` (model checkers).       |
| `proof`          | `string \| undefined` | A proof term/script when `ok === true` (deductive).      |
| `durationMs`     | `number`              | Wall-clock time the backend took, in milliseconds.       |

### `interface ContractVerifier`

The port every adapter implements.

| Member       | Type                                          | Description                                       |
| ------------ | --------------------------------------------- | ------------------------------------------------- |
| `backend`    | `"kani" \| "prusti" \| "coq"`                 | Discriminant identifying the verification backend.|
| `verify`     | `(c: Contract) => Promise<Verdict>`           | Run the contract through the backend.             |
| `discharge`  | `(c: Contract) => Promise<Verdict>`           | Run with discharge semantics (deductive verifiers).|

### Adapters

| Class             | File                                          | Backend tag |
| ----------------- | --------------------------------------------- | ----------- |
| `KaniVerifier`    | [`ports/adapters/kani.ts`](ports/adapters/kani.ts)    | `"kani"`    |
| `PrustiVerifier`  | [`ports/adapters/prusti.ts`](ports/adapters/prusti.ts) | `"prusti"`  |
| `CoqVerifier`     | `ports/adapters/coq.ts` (planned)             | `"coq"`     |

## Build & Test

```bash
# Install
bun install

# Type-check
bunx tsc --noEmit

# Lint
bunx biome check .

# Run the port contract test suite
bunx vitest run

# Build
bun run build
```

## Project Layout

See [`CLAUDE.md`](CLAUDE.md) for the full repository tree and hexagonal
architecture notes, or [`AGENTS.md`](AGENTS.md) for the agent governance
document.

## License

Dual-licensed under [MIT](LICENSE-MIT) or [Apache-2.0](LICENSE-APACHE), at
your option.
