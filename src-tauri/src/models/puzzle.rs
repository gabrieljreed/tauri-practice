use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../bindings/", rename_all = "camelCase")] // Triggers TS file generation
pub struct Cell {
    pub letter: String,
    pub is_black: bool,
    pub number: Option<u32>,
    pub is_selected: bool,
    pub is_highlighted: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../bindings/", rename_all = "camelCase")] // Triggers TS file generation
pub struct Grid {
    pub cells: Vec<Vec<Cell>>,
    pub width: u32,
    pub height: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../bindings/", rename_all = "camelCase")] // Triggers TS file generation
pub enum Direction {
    Across,
    Down,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../bindings/", rename_all = "camelCase")] // Triggers TS file generation
pub struct Clue {
    pub number: u32,
    pub direction: Direction,
    pub text: String,
    pub start_row: u32,
    pub start_col: u32,
    pub length: u32,
}

// #[cfg(test)]
// mod tests {
//     use super::*;
//     #[test]
//     fn generate_ts_bindings() {
//         Cell::export_all_to("../bindings/").unwrap();
//         Grid::export_all_to("../bindings/").unwrap();
//         Direction::export_all_to("../bindings/").unwrap();
//         Clue::export_all_to("../bindings/").unwrap();
//     }
// }
