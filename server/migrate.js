const db = require("./database")

const migrate = db.transaction(() => {
    // 1. Create a new budgets table with unique constraint
    db.exec(`
       CREATE TABLE budgets_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        month TEXT NOT NULL,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        UNIQUE(month,category COLLATE NOCASE)
       ) 
    `)

    // 2. Copy existing budgets to new table
    db.exec(`
        INSERT INTO budgets_new (id, month, category, amount)
        SELECT id, month, category, amount
        FROM budgets
    `)

    // 3. Remove the old table
    db.exec(`
       DROP TABLE budgets 
    `)

    // 4. Rename the new table
    db.exec(`
        ALTER TABLE budgets_new RENAME TO budgets
    `)
})

migrate()

console.log("Budget migration complete.")