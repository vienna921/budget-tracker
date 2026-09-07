import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts"

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


    const spendingByCategory = monthlyTransactions
        .filter((transaction) => transaction.type === "expense")
        .reduce((categories, transaction) => {
            const category = transaction.category.trim().toLowerCase()
            
            if (!categories[category]) {
                categories[category] = 0
            }
            
            categories[category] += transaction.amount
            return categories
        }, {})

    const totalSpending = monthlyExpenses
    // transforming data
    const chartData = Object.entries(spendingByCategory).map(
        ([category, amount]) => ({
            category,
            amount,
            percentage: (amount / totalSpending) * 100
        })
    )


    const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"]

    return (
        <div className="monthly-summary">
            <h2>
                {selectedMonth === ""
                    ? "All Months"
                    : new Date(selectedMonth + "-01T00:00:00").toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric"
                    })
                }
            </h2>
            <div className="monthly-cards">
                <div className="dashboard-card">
                    <h3>Income</h3>
                    <p>${monthlyIncome.toFixed(2)}</p>
                </div>

                <div className="dashboard-card">
                    <h3>Expenses</h3>
                    <p>${monthlyExpenses.toFixed(2)}</p>
                </div>

                <div className="dashboard-card">
                    <h3>Balance</h3>
                    <p>${monthlyBalance.toFixed(2)}</p>
                </div>
            </div>

            <div className="category-summary">
                <h3>Spending by Category</h3>

                {Object.entries(spendingByCategory).map(([category, amount]) => (
                    <p key={category}>
                        {category}: ${amount.toFixed(2)}
                    </p>
                ))}
            </div>
            
            <h3>Spending Breakdown</h3>

            <PieChart width={400} height={300}>
                <Pie
                    data={chartData}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>

                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
            </PieChart>
            <div>
                {chartData.map((item) => (
                    <p key={item.category}>
                        {item.category}: ${item.amount.toFixed(2)} - {item.percentage.toFixed(1)}%
                    </p>
                ))}
            </div>
        </div>
    )
}

export default MonthlySummary