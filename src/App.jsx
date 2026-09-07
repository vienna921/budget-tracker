import { useEffect, useState } from 'react'
import Dashboard from "./Dashboard"
import TransactionForm from './TransactionForm'
import TransactionItem from "./TransactionItem"
import EditTransactionForm from './EditTransactionForm'


function App() {
  console.log("App loaded")
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  // GET request
  // do this when component loads or renders
  useEffect(() => {
    //make http requests
    fetch("http://localhost:3000/api/transactions")
      // response.json() - React turn that response to JavaScript data
      .then((response) => {
        // error handling
        if (!response.ok) {
          throw new Error("Failed to load transactions")
        }
        return response.json()
      })
      .then((data) => {
        setTransactions(data)
      })
      .catch((error) => {
        setError(error.message)
      })
      .finally(() => {
        setLoading(false)
      })
    // [] - run this effect after component's initial render 
    // instead of every after render
  }, [])

  function handleSubmit(transaction) {
    return fetch("http://localhost:3000/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...transaction,
        amount: Number(transaction.amount)
      })
    })
      .then((response) => {
        // don't add anything to transactions if Express says 400
        if (!response.ok) {
          return response.json().then((errorData) => {
            throw new Error(errorData.error)
          })
        }
        return response.json()
      })
      .then((newTransaction) => {
        setTransactions([...transactions, newTransaction])
        return newTransaction
      })
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
  }

  function handleCancelEdit() {
    setEditingId(null)
  }

  function handleSaveEdit(updatedFields) {
    fetch(`http://localhost:3000/api/transactions/${editingId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedFields)
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

  const filteredTransactions = transactions.filter((transaction) => {
    return (
      (filter === "all" || transaction.type === filter) 
        && (transaction.category.toLowerCase().includes(search.toLowerCase())
            || transaction.description.toLowerCase().includes(search.toLowerCase()))
        && (selectedMonth === "" || (transaction.date && transaction.date.startsWith(selectedMonth)))
    )
  })

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
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      <TransactionForm
        onSubmit={handleSubmit}
        onError={setError}
      />

      <Dashboard
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        balance={balance}
        transactions={transactions}
      />


      <h2>Transactions</h2>

      <input
        className="search-input"
        type="text"
        placeholder="Search transactions..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <select
        value={selectedMonth}
        onChange={(event) => setSelectedMonth(event.target.value)}
      >
        <option value="">All months</option>
        <option value="2026-08">August 2026</option>
        <option value="2026-07">July 2026</option>
        <option value="2026-06">June 2026</option>
      </select>

      <div className="filter-buttons">
        <button
          className={filter === "all" ? "active-filter" : ""}
          onClick={() => setFilter("all")}>
          All
        </button>

        <button
          className={filter === "income" ? "active-filter" : ""}
          onClick={() => setFilter("income")}>
          Income
        </button>

        <button
          className={filter === "expense" ? "active-filter" : ""}
          onClick={() => setFilter("expense")}>
          Expenses
        </button>
      </div>

      {filteredTransactions.map((transaction) => (
        <div key={transaction.id}>
          {editingId === transaction.id ? (
            <EditTransactionForm
              transaction={transaction}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
            />
          ) : (
            <TransactionItem
              transaction={transaction}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default App