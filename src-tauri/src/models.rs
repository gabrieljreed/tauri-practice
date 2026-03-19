use serde::{Deserialize, Serialize};


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
