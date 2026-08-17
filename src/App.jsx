import { useState } from 'react'
function App() {
  const [type, setType] = useState("expense")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [transactions, setTransactions] = useState([])

  function handleSubmit(event) {
    event.preventDefault()
    const transaction = {
      type,
      amount: Number(amount),
      category,
      description
    }
    setTransactions([...transactions, transaction])
    console.log(transaction)
  }

  return (
    <div>
      <h1>Budget Tracker</h1>
      <p>Amount: {amount}</p>
      <h2>Add Transaction</h2>
      
      <form onSubmit={handleSubmit}>
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

export default App