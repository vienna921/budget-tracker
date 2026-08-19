import { useEffect, useState } from 'react'
function App() {
  console.log("App loaded")

  const [type, setType] = useState("expense")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [transactions, setTransactions] = useState([])

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
  

  function handleEdit(id) {
    fetch(`http://localhost:3000/api/transactions/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: 30
      })
    })
      .then((response) => response.json())
      .then((updatedTransaction) => {
        setTransactions(
          // create a new array
          transactions.map((transaction) =>
            transaction.id === updatedTransaction.id
              ? updatedTransaction
              : transaction
          )
        )
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
          <p>{transaction.category}</p>
          <p>{transaction.description}</p>
          <p>${transaction.amount}</p>

          <button onClick={() => handleEdit(transaction.id)}>
            Edit
          </button>

          <button onClick={() => handleDelete(transaction.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}

export default App