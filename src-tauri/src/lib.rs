// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use serde::{Deserialize, Serialize};
use sqlx::sqlite::SqlitePoolOptions;
use tauri::Manager;

type DbPool = sqlx::Pool<sqlx::Sqlite>;

#[derive(Serialize, Deserialize)]
pub struct CellData {
    pub row: i64,
    pub col: i64,
    pub is_black: bool,
    pub letter: Option<String>, // Like Python's Optional[str]
    pub number: Option<i64>,
}

#[derive(Serialize, Deserialize)]
pub struct ClueData {
    pub number: i64,
    pub direction: String,
    pub clue_text: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct PuzzleData {
    pub id: Option<i64>,  // None when creating, Some(id) when loading
    pub title: Option<String>,
    pub author: Option<String>,
    pub notes: Option<String>,
    pub rows: i64,
    pub cols: i64,
    pub symmetry: String,
    pub cells: Vec<CellData>,
    pub clues: Vec<ClueData>,
}

async fn setup_db(app_handle: &tauri::AppHandle) -> DbPool {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .expect("Could not resolve app data directory");

    std::fs::create_dir_all(&app_dir).expect("Could not create app data directory");

    let db_path = app_dir.join("crossword.db");
    println!("Database path: {}", db_path.to_str().unwrap());
    let db_url = format!("sqlite:{}?mode=rwc", db_path.to_str().unwrap());

    let pool = SqlitePoolOptions::new()
        .connect(&db_url) // Creates file if it doesn't exist
        .await
        .expect("Failed to connect to database");

    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Migration failed");

    pool
}

#[tauri::command]
async fn save_puzzle(
    pool: tauri::State<'_, DbPool>,
    puzzle: PuzzleData,
) -> Result<i64, String> {
    let pool = pool.inner();

    // Start a transaction - everything saves or nothing does
    // Like Python's `with db.transaction():`
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    // Upsert puzzle row
    let puzzle_id = match puzzle.id {
        // No id: new puzzle, insert
        None => {
            let result = sqlx::query(
                "INSERT INTO puzzles (title, author, notes, rows, cols, symmetry)
                VALUES (?, ?, ?, ?, ?, ?)"
            )
            .bind(&puzzle.title)
            .bind(&puzzle.author)
            .bind(&puzzle.notes)
            .bind(&puzzle.rows)
            .bind(&puzzle.cols)
            .bind(&puzzle.symmetry)
            .execute(&mut *tx)
            .await
            .map_err(|e| e.to_string())?;

        result.last_insert_rowid()
        }
        // Some id: existing puzzle, update
        Some(id) => {
            sqlx::query(
                "UPDATE puzzles
                SET title=?, author=?, notes=?, rows=?, cols=?, symmetry=?,
                    updated_at=datetime('now')
                    WHERE id=?"
            )
            .bind(&puzzle.title)
            .bind(&puzzle.author)
            .bind(&puzzle.notes)
            .bind(puzzle.rows)
            .bind(puzzle.cols)
            .bind(&puzzle.symmetry)
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| e.to_string())?;

            id
        }
    };

    // Delete existing cells and clues, then re-insert
    // Simpler than diffing what changed
    sqlx::query("DELETE FROM cells WHERE puzzle_id = ?")
        .bind(puzzle_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    sqlx::query("DELETE FROM clues WHERE puzzle_id = ?")
        .bind(puzzle_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    // Re-insert all cells
    for cell in &puzzle.cells {
        sqlx::query(
            "INSERT INTO cells (puzzle_id, row, col, is_black, letter, number)
            VALUES (?, ?, ?, ?, ?, ?)"
        )
        .bind(puzzle_id)
        .bind(cell.row)
        .bind(cell.col)
        .bind(cell.is_black as i64)  // SQLite stores bools as 0/1
        .bind(cell.letter.clone())
        .bind(cell.number)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
    }

    // Re-insert all clues
    for clue in &puzzle.clues {
        sqlx::query(
            "INSERT INTO clues (puzzle_id, number, direction, clue_text)
            VALUES(?, ?, ?, ?)"
        )
        .bind(puzzle_id)
        .bind(clue.number)
        .bind(&clue.direction)
        .bind(&clue.clue_text)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
    }

    tx.commit().await.map_err(|e| e.to_string())?;

    Ok(puzzle_id)
}

#[tauri::command]
async fn load_puzzle(
    pool: tauri::State<'_, DbPool>,
    puzzle_id: i64,
) -> Result<PuzzleData, String> {
    let pool = pool.inner();

    let row = sqlx::query(
        "SELECT id, title, author, notes, rows, cols, symmetry
         FROM puzzles WHERE id = ?"
    )
    .bind(puzzle_id)
    .fetch_one(pool)
    .await
    .map_err(|e| e.to_string())?;

    let cell_rows = sqlx::query(
        "SELECT row, col, is_black, letter, number
         FROM cells WHERE puzzle_id = ? ORDER BY row, col"
    )
    .bind(puzzle_id)
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    let clue_rows = sqlx::query(
        "SELECT number, direction, clue_text
         FROM clues WHERE puzzle_id = ? ORDER BY number, direction"
    )
    .bind(puzzle_id)
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    // With query() you access columns by name using .try_get()
    // rather than struct fields — like a Python dict vs a dataclass
    use sqlx::Row;

    let cells: Result<Vec<CellData>, _> = cell_rows.iter().map(|c| {
        Ok(CellData {
            row: c.try_get("row").map_err(|e: sqlx::Error| e.to_string())?,
            col: c.try_get("col").map_err(|e: sqlx::Error| e.to_string())?,
            is_black: c.try_get::<i64, _>("is_black").map_err(|e: sqlx::Error| e.to_string())? != 0,
            letter: c.try_get("letter").map_err(|e: sqlx::Error| e.to_string())?,
            number: c.try_get("number").map_err(|e: sqlx::Error| e.to_string())?,
        })
    }).collect();
    let cells = cells.map_err(|e: String| e)?;

    let clues: Result<Vec<ClueData>, _> = clue_rows.iter().map(|c| {
        Ok(ClueData {
            number: c.try_get("number").map_err(|e: sqlx::Error| e.to_string())?,
            direction: c.try_get("direction").map_err(|e: sqlx::Error| e.to_string())?,
            clue_text: c.try_get("clue_text").map_err(|e: sqlx::Error| e.to_string())?,
        })
    }).collect();
    let clues = clues.map_err(|e: String| e)?;

    Ok(PuzzleData {
        id: Some(row.try_get("id").map_err(|e| e.to_string())?),
        title: row.try_get("title").map_err(|e| e.to_string())?,
        author: row.try_get("author").map_err(|e| e.to_string())?,
        notes: row.try_get("notes").map_err(|e| e.to_string())?,
        rows: row.try_get("rows").map_err(|e| e.to_string())?,
        cols: row.try_get("cols").map_err(|e| e.to_string())?,
        symmetry: row.try_get("symmetry").map_err(|e| e.to_string())?,
        cells,
        clues,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Block on the async setup_db() call, then hand the pool to Tauri
            let handle = app.handle().clone();
            let pool = tauri::async_runtime::block_on(setup_db(&handle));
            app.manage(pool);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
                save_puzzle,
                load_puzzle,
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    // Builder pattern: each method call configures the app and returns it for chaining
}
