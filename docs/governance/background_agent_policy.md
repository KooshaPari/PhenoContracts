# Background Agent Policy

## Purpose

This document governs how background/automation agents operate across
the Phenotype fleet, including PhenoContracts.

## Agent Identity & Routing

- Every agent carries a unique `agent-id` (e.g., `orch-v10-005`).
- Agents are dispatched through the fleet DAG (`FLEET_DAG_v10_seed.db`).
- Agents report completion via `dagctl complete`.

## Permissions

- Agents operate with least-privilege tokens scoped to a single repo.
- No agent may modify GitHub org-level settings, delete repos, or
  alter branch protection rules.

## Commit Hygiene

- All agent commits must follow conventional commits format.
- Commits must be signed when the agent runtime supports it.

## Failure Handling

- If `cargo check` or `tsc --noEmit` fails, the agent must surface
  the error and abort — it may not force-push or override gates.
- `dagctl` failures should be logged to the agent worklog and retried
  once before escalating.
