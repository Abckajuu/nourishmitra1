const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "nourishmitra.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    conditions TEXT,
    goal TEXT,
    language TEXT DEFAULT 'en',
    onboarded INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS meals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT 1,
    raw_input TEXT NOT NULL,
    parsed_summary TEXT,
    meal_date TEXT DEFAULT (date('now')),
    logged_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS patterns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT 1,
    analysis TEXT,
    reality_check TEXT,
    suggestion TEXT,
    doctor_flag INTEGER DEFAULT 0,
    doctor_note TEXT,
    generated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

module.exports = db;
