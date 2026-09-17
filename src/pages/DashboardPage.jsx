import Dashboard from "../components/Dashboard"
import MonthlySummary from "../components/MonthlySummary"

function DashboardPage({ totalIncome, totalExpenses, balance, transactions, selectedMonth, setSelectedMonth }) {

    const months = [...new Set(
        transactions
            .filter((transaction) => transaction.date)
            .map((transaction) => transaction.date.slice(0, 7))
    )].sort().reverse()

    return (
        <div className="page">
            <h1>Dashboard</h1>

            <Dashboard
                totalIncome={totalIncome}
                totalExpenses={totalExpenses}
                balance={balance}
                transactions={transactions}
            />
            <div className="month-selector">
                <label>
                    <select 
                        value={selectedMonth} 
                        onChange={(event) => setSelectedMonth(event.target.value)}
                    >
                        <option value="">All Months</option>

                        {months.map((month) => (
                            <option key={month} value={month}>
                                {new Date(month + "-01T00:00:00").toLocaleDateString(
                                    "en-US",
                                    {
                                        month: "long",
                                        year: "numeric"
                                    }
                                )}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <MonthlySummary
                transactions={transactions}
                selectedMonth={selectedMonth}
            />
        </div>
    )
}

export default DashboardPage