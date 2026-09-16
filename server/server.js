require("dotenv").config()

const express = require("express")
const cors = require("cors")
const db = require("./database")

db.query("SELECT NOW()")
    .then(() => {
        console.log("Connected to PostgreSQL!")
    })
    .catch((error) => {
        console.error("PostgreSQL connection error:", error)
    })


const bcrypt = require("bcrypt")
const session = require("express-session")
const rateLimit = require("express-rate-limit")
const axios = require("axios")
const multer = require("multer")
const fs = require("fs")
const FormData = require("form-data")

const app = express()

app.use(cors({
    origin: "https://budget-tracker-viennatan21-8087s-projects.vercel.app",
    credentials: true
}))
// if request has JSON data, parse, so I can access
app.use(express.json())

const upload = multer({ dest: "uploads/" })

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

const PORT = process.env.PORT || 3000

app.post("/api/signup", async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({
            error: "Username and password are required"
        })
    }

    if (username.length < 3 || username.length > 20) {
        return res.status(400).json({
            error: "Username must be between 3 and 20"
        })
    }

    if (password.length < 6) {
        return res.status(400).json({
            error: "Password must be at least 6 characters"
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        await db.query(`
            INSERT INTO users (username, password)
            VALUES ($1, $2)
        `, [
            username,
            hashedPassword
        ])

        res.json({
            message: "Account created successfully!"
        })

    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                error: "Username already exists"
            })
        }
        console.error("SIGNUP ERROR:", error)

        res.status(500).json({
            error: "Could not create account"
        })
    }
})

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: {
        error: "Too many login attempts. Please try again later."
    }
})

app.post("/api/login", loginLimiter, async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({
            error: "Username and password are required"
        })
    }

    try {
        const result = await db.query(
            "SELECT * FROM users WHERE username = $1",
            [username]
        )
        const user = result.rows[0]

        if (!user) {
            return res.status(401).json({
                error: "Invalid username or password"
            })
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        )

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
    } catch (error) {
        console.error("LOGIN ERROR:", error)

        res.status(500).json({
            error: "Could not log in"
        })
    }
})

app.get("/api/me", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            error: "You must be logged in"
        })
    }

    try {
        const result = await db.query(
            "SELECT id, username FROM users WHERE id = $1",
            [req.session.userId]
        )
        const user = result.rows[0]

        res.json(user)
    } catch (error) {
        console.error("ME ERROR:", error)

        res.status(500).json({
            error: "Could not get user"
        })
    }
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


app.get("/api/transactions", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            error: "You must be logged in"
        })
    }
    try {
        const result = await db.query(
            // give all columns and rows from transactions table
            // put first value from this array here
            "SELECT * FROM transactions WHERE user_id = $1",
            [req.session.userId]
        )
        const transactions = result.rows.map(transaction => ({
            ...transaction,
            amount: Number(transaction.amount)
        }))
        res.json(transactions)
    } catch (error) {
        console.error("GET TRANSACTIONS ERROR:", error)

        res.status(500).json({
            error: "Could not fetch transactions"
        })
    }
})


app.post("/api/transactions", async (req, res) => {
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
    if (!req.body.category || !req.body.description || !req.body.date) {
        return res.status(400).json({
            error: "Category, description, and date are required"
        })
    }

    try {
        // creates transaction and gives newly created row
        const result = await db.query(`
            INSERT INTO transactions
            (type, amount, category, description, date, user_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *    
        `, [
            req.body.type,
            req.body.amount,
            req.body.category,
            req.body.description,
            req.body.date,
            req.session.userId
        ])
        const newTransaction = {
            ...result.rows[0],
            amount: Number(result.rows[0].amount)
        }
        res.json(newTransaction)
    } catch (error) {
        console.error("POST TRANSACTION ERROR:", error)

        res.status(500).json({
            error: "Could not create transaction"
        })
    }
})


app.delete("/api/transactions/:id", async (req, res) => {
    const id = Number(req.params.id)

    if (!req.session.userId) {
        return res.status(401).json({
            error: "You must be logged in"
        })
    }

    try {
        const result = await db.query(
            // find transaction before deleting it
            "SELECT * FROM transactions WHERE id = $1 AND user_id = $2",
            [id, req.session.userId]
        )

        const transaction = result.rows[0]

        if (!transaction) {
            return res.status(404).json({
                error: "Transaction not found"
            })
        }

        await  db.query(
            // delete transaction whose ID matches the given from SQLite
            "DELETE FROM transactions WHERE id = $1 AND user_id = $2",
            [id, req.session.userId]
        )
        // sends deleted transaction back to React
        res.json({
            ...transaction,
            amount: Number(transaction.amount)
        })
    } catch (error) {
        console.error("DELETE TRANSACTION ERROR:", error)

        res.status(500).json({
            error: "Could not delete transaction"
        })
    }
})

app.patch("/api/transactions/:id", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            error: "You must be logged in"
        })
    }

    if (typeof req.body.amount !== "number" || req.body.amount <= 0) {
        return res.status(400).json({
            error: "Amount must be a positive number"
        })
    }

    if (!req.body.category?.trim() ||
        !req.body.description?.trim() ||
        !req.body.date
    ) {
        return res.status(400).json({
            error: "Category, description, amount, and date are required"
        })
    }

    // get id
    const id = Number(req.params.id)
    try {
        const result = await db.query(
            "SELECT * FROM transactions WHERE id = $1 AND user_id = $2",
            [id, req.session.userId]
        )

        const transaction = result.rows[0]

        if (!transaction) {
            return res.status(404).json({
                error: "Transaction not found"
            })
        }

        await db.query(`
            UPDATE transactions
            SET type = $1, amount = $2, category = $3, description = $4, date = $5
            WHERE id = $6 AND user_id = $7
        `, [
                req.body.type,
                req.body.amount,
                req.body.category,
                req.body.description,
                req.body.date,
                id,
                req.session.userId
            ]
        )

        const updatedResult = await db.query(
            "SELECT * FROM transactions WHERE id = $1 AND user_id = $2",
            [id, req.session.userId]
        )

        const updatedTransaction = {
            ...updatedResult.rows[0],
            amount: Number(updatedResult.rows[0].amount)
        }

        res.json(updatedTransaction)
    } catch (error) {
        console.error("PATCH TRANSACTION ERROR:", error)

        res.status(500).json({
            error: "Could not update transaction"
        })
    }
})

// budgets
app.get("/api/budgets", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            error: "You must be logged in"
        })
    }
    try {
        const result = await db.query(
            "SELECT * FROM budgets WHERE user_id = $1",
            [req.session.userId]
        )
        const budgets = result.rows.map(budget => ({
            ...budget,
            amount: Number(budget.amount)
        }))
        res.json(budgets)
    } catch (error) {
        console.error("GET BUDGETS ERROR:", error)

        res.status(500).json({
            error: "Could not fetch budgets"
        })
    }
})

app.post("/api/budgets", async (req, res) => {
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
        const result = await db.query(`
            INSERT INTO budgets (month, category, amount, user_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [
            month,
            category,
            amount,
            req.session.userId
        ])

        const newBudget = {
            ...result.rows[0],
            amount: Number(result.rows[0].amount)
        }

        res.json(newBudget)

    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                error: "A budget already exists for this month and category"
            })
        }
        console.error("POST BUDGET ERROR:", error)

        res.status(500).json({
            error: "Failed to create budget"
        })
    }
})

app.delete("/api/budgets/:id", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            error: "You must be logged in"
        })
    }
    
    const id = Number(req.params.id)
    try {
        const result = await db.query(
            "SELECT * FROM budgets WHERE id = $1 AND user_id = $2",
            [id, req.session.userId]
        )

        const budget = result.rows[0]

        if (!budget) {
            return res.status(404).json({
                error: "Budget not found"
            })
        }
        await db.query(
            "DELETE FROM budgets WHERE id = $1 AND user_id = $2",
            [id, req.session.userId]
        )

        res.json({
            ...budget,
            amount: Number(budget.amount)
        })
    } catch (error) {
        console.error("DELETE BUDGET ERROR:", error)

        res.status(500).json({
            error: "Failed to delete budget"
        })
    }
})

app.patch("/api/budgets/:id", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            error: "You must be logged in"
        })
    }

    const id = Number(req.params.id)

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
        const result = await db.query(
            "SELECT * FROM budgets WHERE id = $1 AND user_id = $2",
            [id, req.session.userId]
        )

        const budget = result.rows[0]

        if (!budget) {
            return res.status(404).json({
                error: "Budget not found"
            })
        }
        await db.query(`
            UPDATE budgets
            SET month = $1, category = $2, amount = $3
            WHERE id = $4 AND user_id = $5   
        `, [
            month,
            category,
            amount,
            id,
            req.session.userId
        ])

        const updatedResult = await db.query(
            "SELECT * FROM budgets WHERE id = $1 AND user_id = $2",
            [id, req.session.userId]
        )

        const updatedBudget = {
            ...updatedResult.rows[0],
            amount: Number(updatedResult.rows[0].amount)
        }
        res.json(updatedBudget)

    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                error: "A budget already exists for this month and category"
            })
        }

        console.error("PATCH BUDGET ERROR:", error)

        res.status(500).json({
            error: "Failed to update budget"
        })
    }
})

app.post("/api/scan-receipt", upload.single("receipt"), async (req, res) => {
    try {
        console.log("RECEIVED FILE:", req.file)

        // create form that holds a file
        const formData = new FormData()

        // take file Multer saved and put into form named "receipt"
        formData.append("receipt", fs.createReadStream(req.file.path))

        // axios is like fetch, sends form to Python
        const response = await axios.post(
            "http://localhost:5001/ocr",
            formData,
            {
                headers: formData.getHeaders()
            }
        )
        fs.unlinkSync(req.file.path)

        // sends Python's result back to whoever called Express
        res.json(response.data)

    } catch (error) {
        console.error("OCR ERROR:", error.message)

        res.status(500).json({
            error: "Could not process receipt"
        })
    }
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})
