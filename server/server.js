const express = require("express")
const cors = require("cors")
const db = require("./database")

const app = express()

app.use(cors())
// if request has JSON data, parse, so I can access
app.use(express.json())

const PORT = 3000


app.get("/", (req, res) => {
    res.send("Budget Tracker API is running!")
})


app.get("/api/transactions", (req, res) => {
    // prepare this SQL query
    const transactions = db.prepare(
        // give all columns and rows from transactions table
        "SELECT * FROM transactions"
    // execute query and give me results
    ).all()
    // send transactions back to requester as JSON
    res.json(transactions)
})


app.post("/api/transactions", (req,res) => {
    if (req.body.type !== "income" && req.body.type !== "expense") {
        return res.status(400).json({ 
            error: "Invalid transaction type" 
        })
    }
    if (typeof req.body.amount !== "number" || req.body.amount <= 0) {
        return res.status(400).json({ 
            error: "Amount must be a positive number" 
        })
    }
    if (!req.body.category || !req.body.description) {
        return res.status(400).json({
            error: "Category and description are required"
        })
    }
    
    const result = db.prepare(`
        INSERT INTO transactions
        (type, amount, category, description)
        VALUES (?, ?, ?, ?)
    `).run(
        // fills in ? placeeholders
        req.body.type,
        req.body.amount,
        req.body.category,
        req.body.description
    )

    const newTransaction = db.prepare(
        "SELECT * FROM transactions WHERE id = ?"
        // gives us ID that SQLite just generated
    ).get(result.lastInsertRowid)


    res.json(newTransaction)
})


app.delete("/api/transactions/:id", (req, res) => {
    const id = Number(req.params.id)

    const transaction = db.prepare(
        // find transaction before deleting it
        "SELECT * FROM transactions WHERE id = ?"
    ).get(id)

    if (!transaction) {
        return res.status(404).json({
            error: "Transaction not found"
        })
    }

    db.prepare(
        // delete transaction whose ID matches the given from SQLite
        "DELETE FROM transactions WHERE id = ?"
    ).run(id)
    // sends deleted transaction back to React
    res.json(transaction)
})


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})

app.patch("/api/transactions/:id", (req, res) => {
    // get id
    const id = Number(req.params.id)
    const transaction = db.prepare(
        "SELECT * FROM transactions WHERE id = ?"
    ).get(id)

    if (!transaction) {
        return res.status(404).json({
            error: "Transaction not found"
        })
    }
    
    db.prepare(`
        UPDATE transactions
        SET type = ?, amount = ?, category = ?, description = ?
        WHERE id = ?
    `).run(
        req.body.type,
        req.body.amount,
        req.body.category,
        req.body.description,
        id
    )

    const updatedTransaction = db.prepare(
        "SELECT * FROM transactions WHERE id = ?"
    ).get(id)

    res.json(updatedTransaction)
})