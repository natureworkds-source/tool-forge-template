//! Pure domain logic for the recommended external tool template.
//! Keep this crate free of wasm-bindgen and DOM concerns.

/// Demo payload returned by the sample action.
pub fn sample_message() -> String {
    "ok from tool-core".to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sample_message_is_non_empty() {
        assert!(!sample_message().is_empty());
    }
}
