// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::Manager;

mod models;
mod db;
mod commands;
mod engine;


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let handle = app.handle().clone();
            let pool = tauri::async_runtime::block_on(db::setup_db(&handle));
            app.manage(pool);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::save_puzzle,
            commands::load_puzzle,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
