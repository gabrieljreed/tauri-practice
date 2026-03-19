use crate::models::PuzzleData;
use crate::db::{DbPool, db_save_puzzle, db_load_puzzle};


#[tauri::command]
pub async fn save_puzzle(
    pool: tauri::State<'_, DbPool>,
    puzzle: PuzzleData,
) -> Result<i64, String> {
    db_save_puzzle(pool.inner(), puzzle).await
}

#[tauri::command]
pub async fn load_puzzle(
    pool: tauri::State<'_, DbPool>,
    puzzle_id: i64,
) -> Result<PuzzleData, String> {
    db_load_puzzle(pool.inner(), puzzle_id).await
}
