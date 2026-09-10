import { useEffect, useState } from 'react'
import "./index.css"
import SignupForm from './SignupForm'
import LoginForm from './LoginForm'
import Dashboard from "./Dashboard"
import TransactionForm from './TransactionForm'
import TransactionItem from "./TransactionItem"
import EditTransactionForm from './EditTransactionForm'
import MonthlySummary from './MonthlySummary'
import BudgetForm from './BudgetForm'
import BudgetList from "./BudgetList"

function App() {
  console.log("App loaded")
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedBudgetMonth, setSelectedBudgetMonth] = useState("")
  const [editingBudget, setEditingBudget] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [budgets, setBudgets] = useState([])
  const [user, setUser] = useState(null)


  useEffect(() => {
    fetch("http://localhost:3000/api/me", {
      credentials: "include"
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Not logged in")
        }
        return response.json()
      })
      .then((data) => {
        console.log("USER:", data)
        setUser(data)
      })
      .catch(() => {
        setUser(null)
      })
  }, [])

  // GET request
  // do this when component loads or renders
  useEffect(() => {
    setError("")
    //make http requests
    fetch("http://localhost:3000/api/transactions", {
      credentials: "include"
    })
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
  }, [user])

  useEffect(() => {
    if (!user) {
      return
    }

    fetch("http://localhost:3000/api/budgets", {
      credentials: "include"
    })
      .then((response) => {
        console.log("BUDGET STATUS:", response.status)
        return response.json()
      })
      .then((data) => {
        console.log("BUDGET DATA:", data)
        setBudgets(data)
      })
  }, [user])

  function handleLogin(user) {
    setUser(user)
  }

  function handleSubmit(transaction) {
    return fetch("http://localhost:3000/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
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
        setTransactions((currentTransactions) => [
          ...currentTransactions,
          newTransaction
        ])
        return newTransaction
      })
  }

  function handleDelete(id) {
    fetch(`http://localhost:3000/api/transactions/${id}`, {
      method: "DELETE",
      credentials: "include"
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
      credentials: "include",
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

  function handleDeleteBudget(id) {
    fetch(`http://localhost:3000/api/budgets/${id}`, {
      method: "DELETE",
      credentials: "include"
    })
      .then((response) => response.json())
      .then((deletedBudget) => {
        setBudgets((currentBudgets) =>
          currentBudgets.filter(
            (budget) => budget.id !== deletedBudget.id
          )
        )
      })
  }

  function handleEditBudget(budget) {
    setEditingBudget(budget)
  }

  function handleSaveBudget() {
    fetch(`http://localhost:3000/api/budgets/${editingBudget.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        month: editingBudget.month,
        category: editingBudget.category,
        amount: editingBudget.amount
      })
    })
      .then((response) => response.json())
      .then((updatedBudget) => {
        setBudgets((currentBudgets) =>
          currentBudgets.map((budget) =>
            budget.id === updatedBudget.id
              ? updatedBudget
              : budget
          )
        )
        setEditingBudget(null)
      })
  }

  // keep only unique values
  const months = [...new Set(
    transactions
      .filter((transaction) => transaction.date)
      .map((transaction) => transaction.date.slice(0, 7))
  )]

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

  const budgetMonths = [...new Set(
    budgets.map((budget) => budget.month)
  )]

  return (
    <div>

      <h1>Budget Tracker</h1>
      {user && <p>Welcome, {user.username}!</p>}
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      <LoginForm onLogin={handleLogin} />
      <SignupForm />

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

      <MonthlySummary
        transactions={transactions}
        selectedMonth={selectedMonth}
      />

      <BudgetForm
        onBudgetAdded={(newBudget) => {
          setBudgets((currentBudgets) => [
            ...currentBudgets,
            newBudget
          ])
        }}
      />

      <select
        value={selectedBudgetMonth}
        onChange={(event) => setSelectedBudgetMonth(event.target.value)}
      >
        <option value="">Select a month</option>

        {budgetMonths.map((month) => (
          <option key={month} value={month}>
            {new Date(month + "-01T00:00:00").toLocaleDateString("en-US", {
              month: "long",
              year: "numeric"
            })}
          </option>
        ))}
      </select>

      {editingBudget && (
        <div>
          <input
            type="month"
            value={editingBudget.month}
            onChange={(event) =>
              setEditingBudget({
                ...editingBudget,
                month: event.target.value
              })
            }
          />

          <input
            type="text"
            value={editingBudget.category}
            onChange={(event) =>
              setEditingBudget({
                ...editingBudget,
                category: event.target.value
              })
            }
          />

          <input
            type="text"
            value={editingBudget.amount}
            onChange={(event) =>
              setEditingBudget({
                ...editingBudget,
                amount: Number(event.target.value)
              })
            }
          />

          <button onClick={handleSaveBudget}>Save</button>
        </div>
      )}

      <BudgetList
        budgets={budgets.filter((budget) =>
          budget.month === selectedBudgetMonth
        )}
        transactions={transactions}
        onDelete={handleDeleteBudget}
        onEdit={handleEditBudget}
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
        {months.map((month) => (
          <option key={month} value={month}>
            {new Date(month + "-01T00:00:00").toLocaleDateString("en-US", {
              month: "long",
              year: "numeric"
            })}
          </option>
        ))}
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