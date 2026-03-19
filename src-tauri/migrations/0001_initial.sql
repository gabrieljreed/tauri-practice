CREATE TABLE puzzles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT,
    author      TEXT,
    notes       TEXT,
    rows        INTEGER NOT NULL,
    cols        INTEGER NOT NULL,
    symmetry    TEXT NOT NULL DEFAULT "rotational",
    created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cells (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    puzzle_id   INTEGER NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE, -- ON DELETE CASCADE ensures that when a puzzle is deleted, its cells are also deleted
    row         INTEGER NOT NULL,
    col         INTEGER NOT NULL,
    is_black    INTEGER NOT NULL DEFAULT 0,
    letter      TEXT, -- null until filled
    number      INTEGER,  -- the across/down number, if any
    UNIQUE(puzzle_id, row, col)
);

CREATE TABLE clues (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    puzzle_id   INTEGER NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE,
    number      INTEGER NOT NULL,
    direction   TEXT NOT NULL,  -- "across", "down", or future variants
    clue_text   TEXT,
    UNIQUE(puzzle_id, number, direction)
);

CREATE TABLE wordlists (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    enabled     INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE words (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    wordlist_id  INTEGER NOT NULL REFERENCES wordlists(id) ON DELETE CASCADE,
    word         TEXT NOT NULL,
    score        INTEGER NOT NULL DEFAULT 50,
    UNIQUE(wordlist_id, word)
);

CREATE INDEX idx_words_word on words(word);
-- Tells SQLite "I'm going to query this table by word a lot — keep a sorted, searchable copy of just that column"

CREATE TABLE clue_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word TEXT NOT NULL,
    clue TEXT NOT NULL,
    author TEXT,
    publication TEXT,
    puzzle_date TEXT  -- stored as "YYYY-MM-DD"
);

CREATE INDEX idx_clue_history_word ON clue_history(word);
