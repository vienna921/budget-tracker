const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors())
// if request has JSON data, parse, so I can access
app.use(express.json())

const PORT = 3000

const transactions = [
    {
        id: 1,
        type: "expense",
        amount: 25,
        category: "Food",
        description: "Lunch"
    },
    {
        id: 2,
        type: "income",
        amount: 1000,
        category: "Salary",
        description: "Paycheck"
    }
]

app.get("/", (req, res) => {
    res.send("Budget Tracker API is running!")
})
app.get("/api/transactions", (req, res) => {
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
    // req.body - data React sends
    const transaction ={
        id: Date.now(),
        ...req.body
    }
    transactions.push(transaction)

    res.json(transaction)
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})