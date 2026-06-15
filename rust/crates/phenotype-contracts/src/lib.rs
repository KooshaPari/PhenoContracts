// SPDX-License-Identifier: MIT OR Apache-2.0
//! `phenotype-contracts` — Rust adapter that backs the PhenoContracts port.
//!
//! This crate exists so that the `rust/Cargo.lock` lockfile checked in
//! at the repo root is anchored to a real workspace member. The actual
//! verification logic is implemented in the TypeScript adapters under
//! `ports/adapters/`; this crate provides the matching Rust types so
//! that `cargo-deny` can audit the dependency surface of the
//! formal-verification toolchain.
#![deny(unsafe_code)]
#![warn(missing_docs)]

use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// A formal verification contract: a named predicate over a target.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Contract {
    /// Stable, human-readable name of the contract.
    pub name: String,
    /// Predicate expressed in the target verifier's input language.
    pub predicate: String,
    /// Symbol path of the verification target.
    pub target: String,
}

/// The outcome of running a [`Contract`] through a verifier backend.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Verdict {
    /// `true` if the contract holds; `false` if a counterexample was found.
    pub ok: bool,
    /// Populated when `ok == false`.
    pub counterexample: Option<String>,
    /// Populated when `ok == true`.
    pub proof: Option<String>,
    /// Wall-clock time the backend spent on the verification, in ms.
    pub duration_ms: u64,
}

/// Identifier of a single verification run.
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct RunId(pub Uuid);

/// Hexagonal port for formal verification backends.
#[async_trait::async_trait]
pub trait ContractVerifier: Send + Sync {
    /// Stable identifier of the backend (e.g. `"kani"`, `"prusti"`, `"coq"`).
    fn backend(&self) -> &'static str;

    /// Verify a contract; on success, the returned `Verdict.ok` is `true`
    /// and `proof` is `Some(_)`.
    async fn verify(&self, c: &Contract) -> Verdict;

    /// Discharge a contract obligation; semantically equivalent to
    /// [`verify`](Self::verify) for the current set of adapters.
    async fn discharge(&self, c: &Contract) -> Verdict {
        self.verify(c).await
    }
}

/// Canonical ordering of supported backends, used to make the union
/// [`kani`, `prusti`, `coq`] exhaustive at the type level.
pub const BACKENDS: &[&str] = &["kani", "prusti", "coq"];

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn contract_is_serde_roundtrippable() {
        let c = Contract {
            name: "no_overflow".to_string(),
            predicate: "x + 1 > x".to_string(),
            target: "fn add_one(x: u64) -> u64".to_string(),
        };
        let j = serde_json::to_string(&c).unwrap();
        let back: Contract = serde_json::from_str(&j).unwrap();
        assert_eq!(c, back);
    }

    #[test]
    fn verdict_serde_roundtrip() {
        let v = Verdict {
            ok: true,
            counterexample: None,
            proof: Some("kani:no_overflow".to_string()),
            duration_ms: 10,
        };
        let j = serde_json::to_string(&v).unwrap();
        let back: Verdict = serde_json::from_str(&j).unwrap();
        assert_eq!(v, back);
    }

    #[test]
    fn backends_list_is_unique_and_complete() {
        // The exact insertion order is part of the public contract
        // with the TypeScript `BACKENDS` registry; here we only assert
        // that every required backend appears exactly once.
        let unique: std::collections::HashSet<&str> = BACKENDS.iter().copied().collect();
        assert_eq!(unique.len(), BACKENDS.len(), "BACKENDS has duplicates");
        for required in ["kani", "prusti", "coq"] {
            assert!(unique.contains(required), "missing backend: {required}");
        }
    }

    #[test]
    fn run_id_is_uuid_v4_compatible() {
        let id = RunId(Uuid::new_v4());
        // v4 UUIDs have version nibble == 0x4
        assert_eq!(id.0.get_version_num(), 4);
    }
}
