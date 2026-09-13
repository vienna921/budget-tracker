require("dotenv").config()

const express = require("express")
const cors = require("cors")
const db = require("./database")
const bcrypt = require("bcrypt")
const session = require("express-session")

const app = express()

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
// if request has JSON data, parse, so I can access
app.use(express.json())

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    // javascript can't access session cookie
    cookie: {
        httpOnly: true,
        // don't send login cookie when requested from different website
        // protect against Cross-Site Request Forgery (CSRF)
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
    }
}))

const PORT = 3000

app.post("/api/signup", async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({
            error: "Username and password are required"
        })
    }

    if (password.length < 6) {
        return res.status(400).json({
            error: "Password must be at least 6 characters"
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const insertUser = db.prepare(`
        INSERT INTO users (username, password)
        VALUES (?, ?)        
    `)

    try {
        insertUser.run(username, hashedPassword)
        res.json({ message: "Account created successfully!"})
    } catch (error) {
        res.status(409).json({
            error: "Username already exists"
        })
    }
})

app.post("/api/login", async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({
            error: "Username and password are required"
        })
    }

    const user = db.prepare(
        "SELECT * FROM users WHERE username = ?"
    ).get(username)

    if (!user) {
        return res.status(401).json({
            error: "Invalid username or password"
        })
    }

    const passwordMatches = await bcrypt.compare(password, user.password)

    if (!passwordMatches) {
        return res.status(401).json({
            error: "Invalid username or password"
        })
    }

    // this session belongs to user ID user.id
    req.session.userId = user.id
    res.json({
        message: "Login successful!"
    })
})

app.get("/api/me", (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            error: "You must be logged in"
        })
    }
    const user = db.prepare(
        "SELECT id, username FROM users WHERE id = ?"
    ).get(req.session.userId)

    res.json(user)
})

app.post("/api/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({
                error: "Failed to log out"
            })
        }

        res.json({
            message: "Logged out successfully"
        })
    })
})



app.get("/", (req, res) => {
    res.send("Budget Tracker API is running!")
})


app.get("/api/transactions", (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            error: "You must be logged in"
        })
    }
    // prepare this SQL query
    const transactions = db.prepare(
        // give all columns and rows from transactions table
        "SELECT * FROM transactions WHERE user_id = ?" 
    // execute query and give me results
    ).all(req.session.userId)
    // send transactions back to requester as JSON
    res.json(transactions)
})


app.post("/api/transactions", (req,res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            error: "You must be logged in"
        })
    }
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
        (type, amount, category, description, date, user_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(
        // fills in ? placeeholders
        req.body.type,
        req.body.amount,
        req.body.category,
        req.body.description,
        req.body.date,
        req.session.userId
    )

    const newTransaction = db.prepare(
        "SELECT * FROM transactions WHERE id = ?"
        // gives us ID that SQLite just generated
    ).get(result.lastInsertRowid)


    res.json(newTransaction)
})


app.delete("/api/transactions/:id", (req, res) => {
    const id = Number(req.params.id)

    if (!req.session.userId) {
        return res.status(401).json({
            error: "You must be logged in"
        })
    }

    const transaction = db.prepare(
        // find transaction before deleting it
        "SELECT * FROM transactions WHERE id = ? AND user_id = ?"
    ).get(id, req.session.userId)

    if (!transaction) {
        return res.status(404).json({
            error: "Transaction not found"
        })
    }

    db.prepare(
        // delete transaction whose ID matches the given from SQLite
        "DELETE FROM transactions WHERE id = ? AND user_id = ?"
    ).run(id, req.session.userId)
    // sends deleted transaction back to React
    res.json(transaction)
})


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})

app.patch("/api/transactions/:id", (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            error: "You must be logged in"
        })
    }
    // get id
    const id = Number(req.params.id)
    const transaction = db.prepare(
        "SELECT * FROM transactions WHERE id = ? AND user_id = ?"
    ).get(id, req.session.userId)

    if (!transaction) {
        return res.status(404).json({
            error: "Transaction not found"
        })
    }
    
    db.prepare(`
        UPDATE transactions
        SET type = ?, amount = ?, category = ?, description = ?
        WHERE id = ? AND user_id = ?
    `).run(
        req.body.type,
        req.body.amount,
        req.body.category,
        req.body.description,
        id,
        req.session.userId
    )

    const updatedTransaction = db.prepare(
        "SELECT * FROM transactions WHERE id = ?"
    ).get(id)

    res.json(updatedTransaction)
})

// budgets
app.get("/api/budgets", (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            error: "You must be logged in"
        })
    }
    const budgets = db.prepare(
        "SELECT * FROM budgets WHERE user_id = ?"
    ).all(req.session.userId)

    res.json(budgets)
})

app.post("/api/budgets", (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            error: "You must be logged in"
        })
    }
    const { month, amount } = req.body
    const category = req.body.category?.trim()


    if (!month || !category) {
        return res.status(400).json({
            error: "Month and category are required"
        })
    }

    if (typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({
            error: "Budget amount must be a positive number"
        })
    }
    try {
        const result = db.prepare(`
            INSERT INTO budgets (month, category, amount, user_id)
            VALUES (?, ?, ?, ?)
        `).run(month, category, amount, req.session.userId)

        const newBudget = db.prepare(
            "SELECT * FROM budgets WHERE id = ?"
        ).get(result.lastInsertRowid)

        res.json(newBudget)
    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                error: "A budget already exists for this month and category"
            })
        }
        console.error(error)

        res.status(500).json({
            error: "Failed to create budget"
        })
    }

})

app.delete("/api/budgets/:id", (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            error: "You must be logged in"
        })
    }

    const id = Number(req.params.id)

    const budget = db.prepare(
        "SELECT * FROM budgets WHERE id = ? AND user_id = ?"
    ).get(id, req.session.userId)

    if (!budget) {
        return res.status(404).json({
            error: "Budget not found"
        })
    }
    db.prepare(
        "DELETE FROM budgets WHERE id = ? AND user_id = ?"
    ).run(id, req.session.userId)

    res.json(budget)
})

app.patch("/api/budgets/:id", (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            error: "You must be logged in"
        })
    }

    const id = Number(req.params.id)

    const budget = db.prepare(
        "SELECT * FROM budgets WHERE id = ? AND user_id = ?"
    ).get(id, req.session.userId)

    if (!budget) {
        return res.status(404).json({
            error: "Budget not found"
        })
    }

    const  { month, amount } = req.body
    const category = req.body.category?.trim()

    if (!month || !category) {
        return res.status(400).json({
            error: "Month and category are required"
        })
    }

    if (typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({
            error: "Budget amount must be a positive number"
        })
    }

    try {
        db.prepare(`
            UPDATE budgets
            SET month = ?, category = ?, amount = ?
            WHERE id = ? AND user_id = ?    
        `).run(
            month,
            category,
            amount,
            id,
            req.session.userId
        )

        const updatedBudget = db.prepare(
            "SELECT * FROM budgets WHERE id = ? AND user_id = ?"
        ).get(id, req.session.userId)

        res.json(updatedBudget)
    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                error: "A budget already exists for this month and category"
            })
        }

        console.error(error)

        res.status(500).json({
            error: "Failed to update budget"
        })
    }
})