// get database tool
const Database = require("better-sqlite3")
// open SQLite database called budget.db
const db = new Database("budget.db")

// id INTEGER PRIMARY KEY AUTOINCREMENT = database generates IDs for us
db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL
    )
`)

// what columns currently exist in transactions table
// database migration
const columnExists = db.prepare(`
        SELECT COUNT(*) AS count
        FROM pragma_table_info('transactions')
        WHERE name = 'date'
    `).get()
if (columnExists.count === 0) {
    db.exec(`
        ALTER TABLE transactions
        ADD COLUMN date TEXT
    `)
}

// allow other backend files to use database
module.exports = db