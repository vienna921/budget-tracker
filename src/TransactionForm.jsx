import { useState } from "react"


function TransactionForm({ onSubmit, onError }) {
    const [type, setType] = useState("expense")
    const [amount, setAmount] = useState("")
    const [category, setCategory] = useState("")
    const [description, setDescription] = useState("")
    const [date, setDate] = useState(
        new Date().toISOString().split("T")[0]
    )

    return (
        <div>
            <h2>Add Transaction</h2>

            <form onSubmit={(event) => {
                event.preventDefault()

                if (!amount || Number(amount) <= 0) {
                    onError("Amount must be greater than 0")
                    return
                }
                // .trim() removes spaces from beginning and end
                if (!category.trim()) {
                    onError("Category is required")
                    return
                }

                onSubmit({
                    type,
                    amount,
                    category,
                    description,
                    date
                })
                    .then(() => {
                        setAmount("")
                        setCategory("")
                        setDescription("")
                        setType("expense")
                        setDate(new Date().toISOString.split("T")[0])
                        onError("")
                    })
                    .catch((error) => {
                        onError(error.message)
                    })
            }}>
                <label>
                    Type
                    <select
                        value={type}
                        onChange={(event) => setType(event.target.value)}
                    >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                    </select>
                </label>

                <label>
                    Amount
                    <input
                        type="number"
                        value={amount}
                        onChange={(event) => setAmount(event.target.value)}
                    />
                </label>

                <label>
                    Category
                    <input
                        type="text"
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                    />
                </label>

                <label>
                    Description
                    <input
                        type="text"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                    />
                </label>

                <label>
                    Date
                    <input
                        type="date" 
                        value={date}
                        onChange={(event) => setDate(event.target.value)}
                    />
                </label>
                <button type="submit">
                    Add Transaction
                </button>
            </form>
        </div>
    )
}

export default TransactionForm