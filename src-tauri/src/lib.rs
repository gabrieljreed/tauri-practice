// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use serde::{Deserialize, Serialize};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Serialize, Deserialize)]
struct GridSize {
    rows: u32,
    cols: u32,
}

#[tauri::command]
fn create_grid(size: GridSize) -> Result<String, String> {
    if size.rows < 3 || size.cols < 3 {
        return Err("Grid must be at least 3x3".to_string());
    }

    Ok(format!(
        "Creating a {}x{} grid - {} total cells",
        size.rows,
        size.cols,
        size.rows * size.cols,
    ))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, create_grid])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
