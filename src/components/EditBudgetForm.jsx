import { useState } from "react"

function EditBudgetForm({ budget, onSave }) {
    const [month, setMonth] = useState(budget.month)
    const [category, setCategory] = useState(budget.category)
    const [amount, setAmount] = useState(budget.amount)


    return (
        <div>
            <input
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
            />

            <input
                type="text"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
            />

            <input
                type="number"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
            />

            <button onClick={() => 
                onSave({
                    ...budget,
                    month,
                    category,
                    amount: Number(amount)
                })
            }>
                Save
            </button>
        </div>
    )
}

export default EditBudgetForm