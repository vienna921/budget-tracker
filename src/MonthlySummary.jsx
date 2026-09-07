function MonthlySummary({ transactions, selectedMonth }) {
    const monthlyTransactions = transactions.filter((transaction) => {
        return (
            selectedMonth === ""
            || (transaction.date && transaction.date.startsWith(selectedMonth))
        )
    })

    const monthlyIncome = monthlyTransactions
        .filter((transaction) => transaction.type === "income")
        .reduce((total, transaction) => total + transaction.amount, 0)

    const monthlyExpenses = monthlyTransactions
        .filter((transaction) => transaction.type === "expense")
        .reduce((total, transaction) => total + transaction.amount, 0)
    
    const monthlyBalance = monthlyIncome - monthlyExpenses

    return (
        <div className="monthly-summary">
            <h2>Monthly Summary</h2>

            <p>Income: ${monthlyIncome.toFixed(2)}</p>
            <p>Expenses: ${monthlyExpenses.toFixed(2)}</p>
            <p>Balance: ${monthlyBalance.toFixed(2)}</p>
        </div>
    )
}

export default MonthlySummary