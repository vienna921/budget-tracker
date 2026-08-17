const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors())

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
    res.json(transactions)
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})