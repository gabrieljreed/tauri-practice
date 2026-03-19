use sqlx::sqlite::SqlitePoolOptions;
use crate::models::{CellData, ClueData, PuzzleData};


pub type DbPool = sqlx::Pool<sqlx::Sqlite>;

pub async fn setup_db(app_handle: &tauri::AppHandle) -> DbPool {
    use tauri::Manager;

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

// Creates an in-memory DB for tests — runs migrations against it
// so the schema is identical to production
#[cfg(test)]
pub async fn setup_test_db() -> DbPool {
    let pool = SqlitePoolOptions::new()
        .connect("sqlite::memory:")
        .await
        .expect("Failed to create in-memory database");

    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Migration failed");

    pool
}

pub async fn db_save_puzzle(pool: &DbPool, puzzle: PuzzleData) -> Result<i64, String> {
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    let puzzle_id = match puzzle.id {
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

    for cell in &puzzle.cells {
        sqlx::query(
            "INSERT INTO cells (puzzle_id, row, col, is_black, letter, number)
            VALUES (?, ?, ?, ?, ?, ?)"
        )
        .bind(puzzle_id)
        .bind(cell.row)
        .bind(cell.col)
        .bind(cell.is_black as i64)
        .bind(cell.letter.clone())
        .bind(cell.number)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
    }

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

pub async fn db_load_puzzle(pool: &DbPool, puzzle_id: i64) -> Result<PuzzleData, String> {
    use sqlx::Row;

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

#[cfg(test)]
mod tests {
    use super::*;

    // Helper that builds a minimal test puzzle — keeps test bodies clean
    fn make_test_puzzle(id: Option<i64>) -> PuzzleData {
        PuzzleData {
            id,
            title: Some("Test Puzzle".to_string()),
            author: Some("Test Author".to_string()),
            notes: None,
            rows: 3,
            cols: 3,
            symmetry: "rotational".to_string(),
            cells: vec![
                CellData { row: 0, col: 0, is_black: false, letter: Some("C".to_string()), number: Some(1) },
                CellData { row: 0, col: 1, is_black: false, letter: Some("A".to_string()), number: Some(2) },
                CellData { row: 0, col: 2, is_black: false, letter: Some("T".to_string()), number: None },
                CellData { row: 1, col: 0, is_black: true,  letter: None, number: None },
                CellData { row: 1, col: 1, is_black: false, letter: Some("B".to_string()), number: None },
                CellData { row: 1, col: 2, is_black: true,  letter: None, number: None },
                CellData { row: 2, col: 0, is_black: false, letter: Some("D".to_string()), number: Some(3) },
                CellData { row: 2, col: 1, is_black: false, letter: Some("O".to_string()), number: None },
                CellData { row: 2, col: 2, is_black: false, letter: Some("G".to_string()), number: None },
            ],
            clues: vec![
                ClueData { number: 1, direction: "across".to_string(), clue_text: Some("Feline".to_string()) },
                ClueData { number: 3, direction: "across".to_string(), clue_text: Some("Canine".to_string()) },
                ClueData { number: 1, direction: "down".to_string(),   clue_text: Some("Cold remedy".to_string()) },
                ClueData { number: 2, direction: "down".to_string(),   clue_text: Some("Insect home".to_string()) },
            ],
        }
    }

    // tokio::test is the async equivalent of a regular #[test]
    // Each test gets its own fresh in-memory DB so they can't interfere
    #[tokio::test]
    async fn test_save_returns_id() {
        let pool = setup_test_db().await;
        let id = db_save_puzzle(&pool, make_test_puzzle(None)).await.unwrap();
        assert!(id > 0, "Expected a positive id, got {}", id);
    }

    #[tokio::test]
    async fn test_save_and_load_metadata() {
        let pool = setup_test_db().await;
        let id = db_save_puzzle(&pool, make_test_puzzle(None)).await.unwrap();
        let puzzle = db_load_puzzle(&pool, id).await.unwrap();

        assert_eq!(puzzle.title, Some("Test Puzzle".to_string()));
        assert_eq!(puzzle.author, Some("Test Author".to_string()));
        assert_eq!(puzzle.rows, 3);
        assert_eq!(puzzle.cols, 3);
        assert_eq!(puzzle.symmetry, "rotational");
    }

    #[tokio::test]
    async fn test_save_and_load_cells() {
        let pool = setup_test_db().await;
        let id = db_save_puzzle(&pool, make_test_puzzle(None)).await.unwrap();
        let puzzle = db_load_puzzle(&pool, id).await.unwrap();

        assert_eq!(puzzle.cells.len(), 9);

        // Check a normal cell
        let first = &puzzle.cells[0];
        assert_eq!(first.row, 0);
        assert_eq!(first.col, 0);
        assert_eq!(first.is_black, false);
        assert_eq!(first.letter, Some("C".to_string()));
        assert_eq!(first.number, Some(1));

        // Check a black cell
        let black = &puzzle.cells[3];
        assert_eq!(black.is_black, true);
        assert_eq!(black.letter, None);
    }

    #[tokio::test]
    async fn test_save_and_load_clues() {
        let pool = setup_test_db().await;
        let id = db_save_puzzle(&pool, make_test_puzzle(None)).await.unwrap();
        let puzzle = db_load_puzzle(&pool, id).await.unwrap();

        assert_eq!(puzzle.clues.len(), 4);
        assert_eq!(puzzle.clues[0].direction, "across");
        assert_eq!(puzzle.clues[0].clue_text, Some("Feline".to_string()));
    }

    #[tokio::test]
    async fn test_update_existing_puzzle() {
        let pool = setup_test_db().await;

        // Save once to get an id
        let id = db_save_puzzle(&pool, make_test_puzzle(None)).await.unwrap();

        // Save again with the same id but different title
        let mut updated = make_test_puzzle(Some(id));
        updated.title = Some("Updated Title".to_string());
        db_save_puzzle(&pool, updated).await.unwrap();

        // Load and verify the title changed
        let puzzle = db_load_puzzle(&pool, id).await.unwrap();
        assert_eq!(puzzle.title, Some("Updated Title".to_string()));
    }

    #[tokio::test]
    async fn test_update_replaces_cells() {
        let pool = setup_test_db().await;
        let id = db_save_puzzle(&pool, make_test_puzzle(None)).await.unwrap();

        // Save again with only 1 cell
        let mut updated = make_test_puzzle(Some(id));
        updated.cells = vec![
            CellData { row: 0, col: 0, is_black: false, letter: Some("X".to_string()), number: Some(1) },
        ];
        db_save_puzzle(&pool, updated).await.unwrap();

        // Should have 1 cell, not 9 — confirms delete-then-reinsert works
        let puzzle = db_load_puzzle(&pool, id).await.unwrap();
        assert_eq!(puzzle.cells.len(), 1);
        assert_eq!(puzzle.cells[0].letter, Some("X".to_string()));
    }

    #[tokio::test]
    async fn test_load_nonexistent_puzzle() {
        let pool = setup_test_db().await;
        let result = db_load_puzzle(&pool, 99999).await;
        assert!(result.is_err(), "Expected error when loading nonexistent puzzle");
    }
}
