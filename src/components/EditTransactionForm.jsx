import { useState } from "react";

function EditTransactionForm({ transaction, onSave, onCancel }) {
    const [amount, setAmount] = useState(transaction.amount)
    const [category, setCategory] = useState(transaction.category)
    const [description, setDescription] = useState(transaction.description)
    const [type, setType] = useState(transaction.type)
    const [date, setDate] = useState(transaction.date)

    return (
        <div>
            <input 
                type="number"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
            />

            <input 
                type="text"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
            />

            <input 
                type="text"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
            />

            <input 
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
            />

            <select 
                value={type}
                onChange={(event) => setType(event.target.value)}
            >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
            </select>

            <button
                onClick={() =>
                    onSave({
                        amount: Number(amount),
                        category,
                        description,
                        type,
                        date
                    })
                }
            >
                Save
            </button>

            <button onClick={onCancel}>
                Cancel
            </button>
        </div>
    )
}

export default EditTransactionForm