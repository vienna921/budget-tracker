import { useEffect, useState } from 'react'
import Dashboard from "./Dashboard"
import TransactionForm from './TransactionForm'
import TransactionItem from "./TransactionItem"
import EditTransactionForm from './EditTransactionForm'


function App() {
  console.log("App loaded")

 
  const [transactions, setTransactions] = useState([])
  const [editingId, setEditingId] = useState(null)


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
      .then((response) => response.json())
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
  

      <TransactionForm 
        onSubmit={handleSubmit}
      />

      <Dashboard
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        balance={balance}
      />


      <h2>Transactions</h2>

      {transactions.map((transaction) => (
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