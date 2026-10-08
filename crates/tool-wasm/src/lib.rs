use wasm_bindgen::prelude::*;

/// WASM export wrapping `tool_core::sample_message`.
#[wasm_bindgen]
pub fn sample_message() -> String {
    tool_core::sample_message()
}
