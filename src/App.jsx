const API_URL = import.meta.env.VITE_API_URL

import { useEffect, useState } from 'react'
import "./index.css"
import SignupForm from './components/SignupForm'
import LoginForm from './components/LoginForm'

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'
import ReceiptPage from './pages/ReceiptPage'
import BudgetsPage from './pages/BudgetsPage'

function App() {
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedBudgetMonth, setSelectedBudgetMonth] = useState(new Date().toISOString().slice(0, 7))
  const [editingBudget, setEditingBudget] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [budgets, setBudgets] = useState([])
  const [user, setUser] = useState(null)


  useEffect(() => {
    fetch(`${API_URL}/api/me`, {
      credentials: "include"
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Not logged in")
        }
        return response.json()
      })
      .then((data) => {
        setUser(data)
      })
      .catch(() => {
        setUser(null)
      })
  }, [])

  // GET request
  // do this when component loads or renders
  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    setError("")

    //make http requests
    fetch(`${API_URL}/api/transactions`, {
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
        console.error("TRANSACTION ERROR:", error)
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

    fetch(`${API_URL}/api/budgets`, {
      credentials: "include"
    })
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        setBudgets(data)
      })
  }, [user])

  function handleLogin(user) {
    fetch(`${API_URL}/api/me`, {
      credentials: "include"
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load user")
        }
        return response.json()
      })
      .then((user) => {
          setUser(user)
      })
      .catch((error) => {
          console.error("LOGIN USER ERROR:", error)
      })
}

  function handleLogout() {
    fetch(`${API_URL}/api/logout`, {
      method: "POST",
      credentials: "include"
    })
      .then((response) => response.json())
      .then(() => {
        setUser(null)
        setTransactions([])
        setBudgets([])
      })
  }

  function handleSubmit(transaction) {
    return fetch(`${API_URL}/api/transactions`, {
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
    fetch(`${API_URL}/api/transactions/${id}`, {
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
    fetch(`${API_URL}/api/transactions/${editingId}`, {
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
    fetch(`${API_URL}/api/budgets/${id}`, {
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

  function handleSaveBudget(updatedBudget) {
    fetch(`${API_URL}/api/budgets/${updatedBudget.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        month: updatedBudget.month,
        category: updatedBudget.category,
        amount: updatedBudget.amount
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
    <BrowserRouter>
      <nav>
        <Link to="/">Dashboard</Link>
        <Link to="/transactions">Transactions</Link>
        <Link to="/scan">Scan Receipt</Link>
        <Link to="/budgets">Budgets</Link>
      </nav>
      <Routes>
        <Route 
          path="/"
          element={
            <DashboardPage
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              balance={balance}
              transactions={transactions}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
            />
          }
        />
        <Route
          path="/transactions"
          element={
            <TransactionsPage
              onSubmit={handleSubmit}
              onError={setError}
              transactions={transactions}
              filter={filter}
              search={search}
              selectedMonth={selectedMonth}
              onSearchChange={setSearch}
              onMonthChange={setSelectedMonth}
              onFilterChange={setFilter}
              months={months}
              editingId={editingId}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
            />
          }
        />
        <Route
          path="/scan"
          element={
            <ReceiptPage
              onSubmit={handleSubmit}
              onError={setError}
            />
          }
        />
        <Route
          path='/budgets'
          element={
            <BudgetsPage
              budgets={budgets}
              transactions={transactions}
              onDelete={handleDeleteBudget}
              onEdit={handleEditBudget}
              selectedMonth={selectedBudgetMonth}
              onMonthChange={setSelectedBudgetMonth}
              onBudgetAdded={(newBudget) => {
                setBudgets((currentBudgets) => [
                  ...currentBudgets,
                  newBudget
                ])
              }}
              editingBudget={editingBudget}
              onSaveBudget={handleSaveBudget}
            />
          }
        />
      </Routes>
      <div>

        <h1>Budget Tracker</h1>
        {user && <p>Welcome, {user.username}!</p>}
        {user && (
          <button onClick={handleLogout}>
            Logout
          </button>
        )}
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}

        {!user && (
          <>
            <LoginForm onLogin={handleLogin} />
            <SignupForm />
          </>
        )}


      </div>
    </BrowserRouter>
  )
}

export default App