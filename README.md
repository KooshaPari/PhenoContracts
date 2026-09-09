# PhenoContracts

PhenoContracts: shared Phenotype API contracts for formal verification.

[![AI slop inside](https://sladge.net/badge.svg)](https://sladge.net) [![GitHub Downloads (all assets, all releases)](https://img.shields.io/github/downloads/KooshaPari/PhenoContracts/total)](https://github.com/KooshaPari/PhenoContracts/releases)

A hexagonal contract-verification port with multi-backend support (Prusti,
Kani, Coq) and a polyglot workspace combining TypeScript (port interface,
registry, tests) with Rust (core contract models, port interfaces, traits).

## TypeScript adapter contract

Kani, Prusti and Coq adapters are protocol clients. They do not translate a
`Contract` into solver input or bundle an installed prover. A caller must supply
a trusted wrapper executable implementing the protocol below, or a custom
`SpawnRunner`. Pointing `command` directly at a prover that prints ordinary
console output does not satisfy this protocol.

```ts
import { KaniVerifier } from './ports/adapters/kani';

const verifier = new KaniVerifier({
  command: ['/absolute/path/to/your-kani-wrapper'],
  timeoutMs: 30_000,
});
const verdict = await verifier.verify({
  name: 'addition', predicate: 'result >= input', target: 'checked_add',
});
```

The path above is caller supplied; this repository does not provide that wrapper.
The executable receives one JSON object on stdin, followed by EOF:

```json
{"protocolVersion":1,"requestId":"generated UUID","contractHash":"SHA-256 hex","backend":"kani","contract":{"name":"addition","predicate":"result >= input","target":"checked_add"}}
```

`contractHash` is SHA-256 of the exact JavaScript `JSON.stringify(contract)`
representation. The wrapper must run the requested verification and return one
JSON object on stdout, echoing the request's `requestId` and `contractHash`.
Diagnostics belong on stderr. The wrapper is trusted to report real solver
results; correlation alone does not authenticate a proof.

| Result | Required response fields |
|---|---|
| Verified | `ok: true`, matching `backend`, nonempty `version`, nonempty `proof`, matching `requestId` and `contractHash` |
| Disproved | `ok: false`, matching `backend`, nonempty `version`, nonempty `counterexample`, matching `requestId` and `contractHash` |

Both protocol responses require exit code 0. A nonzero exit, signal, timeout,
output overflow, missing/malformed evidence or correlation mismatch returns
`ok: false`. Disproved evidence is labeled `verification_false`; a nonzero exit
is labeled `tool_error`. Plain nonempty stdout is never sufficient for success.
The default runner uses `shell: false`, a 30-second timeout (maximum 5 minutes),
and a 1 MiB combined stdout/stderr cap (maximum 16 MiB).

Without a command or injected runner, adapters fail closed. Importing an adapter
registers only its own unconfigured default; importing the registry alone does
not load adapters. Construct and register a configured instance explicitly when
using `createVerifier`. `verify` and `discharge` currently use the same operation.

The regression suite validates transport and verdict behavior using controlled
fixtures. Real solver translation, installed solver versions and consuming
application acceptance remain integration gates.

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
