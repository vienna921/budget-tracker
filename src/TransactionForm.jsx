import { useState } from "react"


function TransactionForm({ onSubmit }) {
    const [type, setType] = useState("expense")
    const [amount, setAmount] = useState("")
    const [category, setCategory] = useState("")
    const [description, setDescription] = useState("")

    return (
        <div>
            <h2>Add Transaction</h2>

            <form onSubmit={(event) => {
                event.preventDefault()

                onSubmit({
                    type,
                    amount,
                    category,
                    description
                }).then(() => {
                    setAmount("")
                    setCategory("")
                    setDescription("")
                    setType("expense")
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

                <button type="submit">
                Add Transaction
                </button>
            </form>
        </div>
    )
}

export default TransactionForm