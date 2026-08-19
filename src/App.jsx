import { useEffect, useState } from 'react'
function App() {
  console.log("App loaded")

  const [type, setType] = useState("expense")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [transactions, setTransactions] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editAmount, setEditAmount] = useState("")
  const [editCategory, setEditCategory] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editType, setEditType] = useState("expense")


  // do this when component loads or renders
  useEffect(() => {
    //make http requests
    fetch("http://localhost:3000/api/transactions")
    // response.json() - React turn that response to JavaScript data
    .then((response) => response.json())
    .then((data) => {
      setTransactions(data)
    })
  // [] - run this effect after component's initial render 
  // instead of every after render
  }, [])

  function handleSubmit(event) {
    event.preventDefault()
    const transaction = {
      type,
      amount: Number(amount),
      category,
      description
    }
    fetch("http://localhost:3000/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(transaction)
    })
      .then((response) => response.json())
      .then((newTransaction) => {
        setTransactions([...transactions, newTransaction])

        setAmount("")
        setCategory("")
        setDescription("")
        setType("expense")
      })
    console.log(transaction)
  }

  function handleDelete(id) {
    fetch(`http://localhost:3000/api/transactions/${id}`, {
      method: "DELETE"
    })
      .then((response) => response.json())
      .then((deletedTransaction) => {
        setTransactions(
          transactions.filter(
            (transaction) => transaction.id !== deletedTransaction.id
          )
        )
      })
  }
  

  function handleEdit(transaction) {
    setEditingId(transaction.id)
    setEditAmount(transaction.amount)
    setEditCategory(transaction.category)
    setEditDescription(transaction.description)
    setEditType(transaction.type)
  }

  function handleCancelEdit() {
    setEditingId(null)
  }

  function handleSaveEdit() {
    fetch(`http://localhost:3000/api/transactions/${editingId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: Number(editAmount),
        category: editCategory,
        description: editDescription,
        type: editType
      })
    })
      .then((response) => response.json())
      .then((updatedTransaction) => {
        setTransactions(
          transactions.map((transaction) =>
            transaction.id === updatedTransaction.id
              ? updatedTransaction
              : transaction
          )
        )
        setEditingId(null)
      })
  }

  const totalIncome = transactions
    // filter only income transactions
    .filter((transaction) => transaction.type === "income")
    // sum
    .reduce((total, transaction) => total + transaction.amount, 0)
  
  const totalExpenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0)

  const balance = totalIncome - totalExpenses

  return (
    <div>
      <h1>Budget Tracker</h1>
      <p>Amount: {amount}</p>
      <h2>Add Transaction</h2>


      <div>
        <h3>Balance</h3>
        <p>${balance.toFixed(2)}</p>
      </div>
      <div>
        <h3>Income</h3>
        <p>${totalIncome.toFixed(2)}</p>
      </div>
      <div>
        <h3>Expenses</h3>
        <p>${totalExpenses.toFixed(2)}</p>
      </div>
  

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

      <h2>Transactions</h2>

      {transactions.map((transaction) => (
        <div key={transaction.id}>
          {editingId === transaction.id ? (
            // EDIT FROM
            <div>
              <input
                type="number"
                value={editAmount}
                onChange={(event) => setEditAmount(event.target.value)}
              />
              <input
                type="text"
                value={editCategory}
                onChange={(event) => setEditCategory(event.target.value)}
              />
              <input
                type="text"
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
              />
              <select
                value={editType}
                onChange={(event) => setEditType(event.target.value)}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>

              <button onClick={handleSaveEdit}>Save</button>
              <button onClick={handleCancelEdit}>Cancel</button>
            </div>

          ) : (
            <>
              <p>{transaction.category}</p>
              <p>{transaction.description}</p>
              <p>${transaction.amount}</p>

              <button onClick={() => handleEdit(transaction)}>
                Edit
              </button>

              <button onClick={() => handleDelete(transaction.id)}>
                Delete
              </button>
            </>
          )}
          
        </div>
      ))}
    </div>
  )
}

export default App