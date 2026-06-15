// SPDX-License-Identifier: MIT OR Apache-2.0
//! `phenotype-port-traits` — lightweight port trait helpers shared
//! across the Phenotype backend family.
//!
//! This crate exists so the heavier interfaces in
//! `phenotype-port-interfaces` can be split from the bits that almost
//! every adapter pulls in (serde round-trips, thiserror ergonomics).
#![deny(unsafe_code)]
#![warn(missing_docs)]

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use thiserror::Error;

/// Identifier of a verification backend (matches the TypeScript union).
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "lowercase")]
pub enum BackendTag {
    /// Kani model checker.
    Kani,
    /// Prusti deductive verifier.
    Prusti,
    /// Coq proof assistant.
    Coq,
}

impl BackendTag {
    /// Stable lowercase string tag, identical to the TypeScript `Backend` union.
    pub const fn as_str(self) -> &'static str {
        match self {
            BackendTag::Kani => "kani",
            BackendTag::Prusti => "prusti",
            BackendTag::Coq => "coq",
        }
    }
}

/// Trait for any port that exposes a backend tag.
pub trait Tagged {
    /// Return the backend tag for this port.
    fn tag(&self) -> BackendTag;
}

/// Generic error type for trait-level operations.
#[derive(Debug, Error)]
pub enum TraitError {
    /// The requested backend is not registered in the current process.
    #[error("backend not registered: {0}")]
    Unknown(String),
    /// The operation failed for an unspecified reason.
    #[error("operation failed: {0}")]
    Failed(String),
}

/// Base port trait that every concrete port extends.
#[async_trait]
pub trait PortBase: Send + Sync + Tagged {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn tag_serde_is_lowercase() {
        let j = serde_json::to_string(&BackendTag::Coq).unwrap();
        assert_eq!(j, "\"coq\"");
    }

    #[test]
    fn tag_str_matches_typescript() {
        assert_eq!(BackendTag::Kani.as_str(), "kani");
        assert_eq!(BackendTag::Prusti.as_str(), "prusti");
        assert_eq!(BackendTag::Coq.as_str(), "coq");
    }
}
