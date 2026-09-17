const API_URL = import.meta.env.VITE_API_URL
import { useState } from "react"

function BudgetForm({ onBudgetAdded }) {
    const [month, setMonth] = useState("")
    const [category, setCategory] = useState("")
    const [amount, setAmount] = useState("")
    const [error, setError] = useState("")

    function handleSubmit(event) {
        event.preventDefault()

        setError("")

        if (!month || !category || !amount) {
            setError("Please fill in all fields")
            return
        }

        if (Number(amount) <= 0) {
            setError("Budget amount must be greater than 0")
            return
        }

        fetch(`${API_URL}/api/budgets`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                month,
                category,
                amount: Number(amount)
            })
        })
            .then(async (response) => {
                const data = await response.json()
                
                if (!response.ok) {
                    throw new Error(data.error)
                }

                return data
            })
            .then((data) => {

                onBudgetAdded(data)

                setMonth("")
                setCategory("")
                setAmount("")
                setError("")
            })
            .catch((error) => {
                setError(error.message)
            })
    }

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Month
                <input 
                    type="month" 
                    value={month}
                    onChange={(event) => {
                        setMonth(event.target.value)
                        setError("")
                    }}
                />
            </label>

             <label>
                Category
                <input 
                    type="text" 
                    value={category}
                    onChange={(event) => {
                        setCategory(event.target.value)
                        setError("")
                    }}                
                />
            </label>

            <label>
                Budget Amount
                <input 
                    type="number" 
                    value={amount}
                    onChange={(event) => {
                        setAmount(event.target.value)
                        setError("")
                    }}
                />
            </label>  
            {error && <p>{error}</p>}
            <button type="submit">
                Add Budget
            </button> 
        </form>
    )
}

export default BudgetForm