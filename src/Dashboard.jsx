function Dashboard({ totalIncome, totalExpenses, balance, transactions }) {
    const expenses = transactions.filter(
        (transaction) => transaction.type === "expense"
    )

    const spendingByCategory = expenses.reduce((categories, transaction) => {
        const category = transaction.category.trim().toLowerCase()
        if (!categories[category]) {
            categories[category] = 0
        }
        categories[category] += transaction.amount
        return categories
    }, {})
    return (
        <div>
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

                <h3>Spending by Category</h3>
                {Object.entries(spendingByCategory).map(([category, amount]) => (
                    <p key={category}>
                        {category}: ${amount.toFixed(2)}
                    </p>
                ))}
            </div>

        </div>
    )
}

export default Dashboard