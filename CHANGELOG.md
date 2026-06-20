# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `vitest.config.ts` — coverage configuration with 80% threshold (lines,
  functions, branches, statements) per ADR-040 (lib tier gate). Wired
  `@vitest/coverage-v8` as a devDependency.
- `npm run test:coverage` and `npm run lint:fix` scripts.
- `biome.json` — Biome formatter + linter configuration (2-space indent,
  single quotes, lineWidth 120, LF line endings). Coexists with
  `dprint.json` (which handles Markdown/Dockerfile/TOML/Ruff).

### Changed

- `ports/registry.ts` — `BACKENDS` is now derived statically from the
  `Backend` union type (`['kani', 'prusti', 'coq'] as const satisfies
  readonly Backend[]`) rather than from the runtime registry snapshot
  (`backendNames()`). This guarantees the list is always populated, even
  before any adapter has called `registerBackend()`.
- `ports/adapters/{prusti,kani,coq}.ts` — each adapter now calls
  `registerBackend(name, new Verifier())` at module load time so the
  runtime registry is populated as soon as the barrel is imported.
- `ports/index.ts` — barrel re-exports the adapters (forcing side-effect
  import) plus `registerBackend`, `CoqVerifier`, `KaniVerifier`,
  `PrustiVerifier`.
- `.github/workflows/ci.yml` — removed `|| true` masking from lint, test,
  and build steps so CI actually fails on regressions. Coverage gate is
  enforced via `vitest run --coverage`.

### Fixed

- `BACKENDS list has no duplicates and is non-empty` property test now
  passes (was failing because `BACKENDS` was empty at module load).
- 231 Biome formatting errors (root cause: missing `biome.json`, so Biome
  used defaults incompatible with the 2-space codebase style). Now 0
  errors after adding config and running `biome check --write`.
- Vitest coverage gate added (was missing entirely).

### Removed

- The `BACKENDS: Backend[] = backendNames()` runtime-derived constant was
  removed in favor of the static `as const satisfies readonly Backend[]`
  declaration (see Changed).

## [0.1.0] - 2026-06-14

### Added

- Initial release with version tracking.

[Unreleased]: https://github.com/KooshaPari/PhenoContracts/compare/0.1.0...HEAD
[0.1.0]: https://github.com/KooshaPari/PhenoContracts/releases/tag/0.1.0
