# /Users/kooshapari/CodeProjects/Phenotype/repos/PhenoContracts/justfile
# PhenoContracts — Phenotype-org standard task runner
# Polyglot workspace: TypeScript/Bun (contract verification) + Rust (Prusti/Kani adapters)
# See https://just.systems/man/en/

set shell := ["bash", "-uc"]
set dotenv-load

# Node package manager (bun | pnpm | yarn | npm), detected from lockfiles.
node_pm := `\
    if [ -f bun.lockb ] || [ -f bun.lock ]; then printf "bun"; \
    elif [ -f pnpm-lock.yaml ]; then printf "pnpm"; \
    elif [ -f yarn.lock ]; then printf "yarn"; \
    else printf "npm"; fi`

# Whether the rust/ subdir has a Cargo workspace.
has_rust := `test -f rust/Cargo.toml && echo 1 || echo 0`

# ---- Default: list available recipes ----
_default:
    @just --list
    @echo "node_pm={{node_pm}} has_rust={{has_rust}}"

# ---- Build: produce release artifacts (TS compile + Rust workspace) ----
build:
    {{node_pm}} run build
    @if [ "{{has_rust}}" = "1" ]; then (cd rust && cargo build --workspace --all-features); fi

# ---- Test: run the test suite ----
test:
    {{node_pm}} test
    @if [ "{{has_rust}}" = "1" ]; then (cd rust && cargo test --workspace --all-features); fi

# ---- Lint: biome (TS) + cargo clippy (Rust) ----
lint:
    {{node_pm}} run lint
    @if [ "{{has_rust}}" = "1" ]; then (cd rust && cargo clippy --workspace --all-targets --all-features -- -D warnings); fi

# ---- Format: biome --write (TS) + cargo fmt (Rust) ----
fmt:
    @{{node_pm}} run lint:fix 2>/dev/null || {{node_pm}} exec biome check --write .
    @if [ "{{has_rust}}" = "1" ]; then (cd rust && cargo fmt --all); fi

# ---- Audit: npm audit + cargo audit ----
audit:
    {{node_pm}} audit --omit=dev || true
    @if [ "{{has_rust}}" = "1" ]; then (cd rust && (command -v cargo-audit >/dev/null && cargo audit || echo "cargo-audit not installed")); fi

# ---- Deny: cargo deny (Rust) + JS no-op ----
deny:
    @if [ "{{has_rust}}" = "1" ]; then \
        (cd rust && (command -v cargo-deny >/dev/null && cargo deny check || echo "cargo-deny not installed")); \
    else \
        echo "deny: no Rust subcrate in this repo; use 'just audit' for JS dependency security"; \
    fi

# ---- Grade: fleet-wide grading gate ----
grade:
    @if [ -f grade.sh ]; then ./grade.sh; \
    elif [ -f ../grade.sh ]; then bash ../grade.sh; \
    else echo "no grade.sh found (vendored or central)"; exit 1; \
    fi

grade-fast:
    @if [ -f grade.sh ]; then ./grade.sh --fast; \
    elif [ -f ../grade.sh ]; then bash ../grade.sh --fast; \
    else echo "no grade.sh found"; exit 1; \
    fi

# ---- CI: full local CI sweep ----
ci: lint test build audit deny
    @echo "✓ CI checks pass"

# ---- Bonus recipes ----

# Type-check only (TS)
typecheck:
    {{node_pm}} run typecheck

# Generate docs
docs:
    @if [ "{{has_rust}}" = "1" ]; then (cd rust && cargo doc --workspace --no-deps); fi

# Remove build artifacts
clean:
    rm -rf node_modules dist build coverage .turbo .next
    @if [ "{{has_rust}}" = "1" ]; then (cd rust && cargo clean); fi
